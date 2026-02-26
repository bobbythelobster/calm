# NoNewPrivileges Flag: Technical Deep Dive

**Date:** Feb 26, 2026  
**Issue:** OpenClaw exec processes inherit NoNewPrivileges=1 flag, blocking sudo

---

## What is NoNewPrivileges?

`NoNewPrivileges` is a Linux kernel security feature (introduced in kernel 3.5) that prevents a process and all its children from gaining new privileges through `execve()`.

**When set to 1:**
- Process CANNOT use setuid/setgid binaries
- Process CANNOT gain capabilities
- Process CANNOT use sudo (even with correct permissions)
- Flag is INHERITED by all child processes
- Flag is IRREVERSIBLE (once set, cannot be unset)

**Purpose:** Prevent privilege escalation attacks

---

## Current State Diagnosis

### Evidence of the Problem

**1. Process has flag set:**
```bash
cat /proc/self/status | grep NoNewPrivs
# Output: NoNewPrivs:	1
```

**2. Systemd service is correct:**
```bash
grep NoNewPrivileges /etc/systemd/system/openclaw.service
# Output: NoNewPrivileges=false
```

**3. Service restarted:**
```bash
systemctl show openclaw --property=ActiveEnterTimestamp
# Output: ActiveEnterTimestamp=Thu 2026-02-26 17:33:53 UTC
```

**4. But flag still set in children:**
```bash
cat /proc/$$/status | grep NoNewPrivs
# Output: NoNewPrivs:	1
```

### The Contradiction

- ✅ Systemd service file says `NoNewPrivileges=false`
- ✅ Service has been restarted
- ❌ Child processes still have `NoNewPrivs:	1`

**Why?** OpenClaw is likely setting the flag programmatically in its own code.

---

## How NoNewPrivileges Gets Set

### Method 1: Systemd (We fixed this)
```ini
[Service]
NoNewPrivileges=true
```
**Status:** ✅ Changed to `false`

### Method 2: C/C++ Code (Likely culprit)
```c
#include <sys/prctl.h>
prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0);
```

### Method 3: Node.js Child Process (Possible)
Node.js doesn't directly expose `prctl()`, but native addons can call it.

### Method 4: Seccomp Filters (Possible)
Seccomp can enforce NoNewPrivileges as a side effect.

---

## Where OpenClaw Might Be Setting It

### Location 1: Exec Tool Implementation
**File to check:** 
```
/home/bobby/.bun/install/global/node_modules/openclaw/dist/tools/exec.js
/home/bobby/.bun/install/global/node_modules/openclaw/src/tools/exec.ts
```

**What to look for:**
```typescript
// Possible patterns
child_process.spawn(cmd, args, {
  // ...
  detached: false,
  // Security hardening options
});

// Or in native addon
prctl(PR_SET_NO_NEW_PRIVS, 1);
```

### Location 2: Gateway Process Manager
**File to check:**
```
/home/bobby/.bun/install/global/node_modules/openclaw/dist/gateway.js
/home/bobby/.bun/install/global/node_modules/openclaw/src/gateway.ts
```

**What to look for:**
- Process spawning for sessions
- Security initialization code
- Sandbox setup

### Location 3: Config/Policy File
**Files to check:**
```
/home/bobby/.openclaw/openclaw.json
/home/bobby/.bun/install/global/node_modules/openclaw/config/
```

**What to look for:**
```json
{
  "security": {
    "noNewPrivileges": true,  // ← Might be here
    "sandbox": "strict"
  }
}
```

---

## Debugging Steps

### Step 1: Find Where Flag Is Set

**Check OpenClaw source:**
```bash
cd /home/bobby/.bun/install/global/node_modules/openclaw/

# Search for prctl usage
grep -r "prctl" . --include="*.js" --include="*.ts" --include="*.c" --include="*.cc"

# Search for NoNewPrivileges string
grep -r "NoNewPriv" . --include="*.js" --include="*.ts"

# Search for security/sandbox config
grep -r "security" . --include="*.json" --include="*.ts" | grep -i priv

# Check for native addons
find . -name "*.node" -o -name "binding.gyp"
```

### Step 2: Trace Process Ancestry

**Find exact process tree:**
```bash
# Get OpenClaw gateway PID
GATEWAY_PID=$(pgrep -f "openclaw gateway")

# Check its NoNewPrivs status
cat /proc/$GATEWAY_PID/status | grep NoNewPrivs

# Check child processes
pstree -p $GATEWAY_PID

# For each child, check status
for pid in $(pgrep -P $GATEWAY_PID); do
  echo "PID $pid:"
  cat /proc/$pid/status | grep NoNewPrivs
done
```

**Expected output:**
```
PID 694878: (gateway)
NoNewPrivs:	0  (or 1 if set at gateway level)

PID 695091: (bash - exec session)
NoNewPrivs:	1  (inherited or explicitly set)
```

### Step 3: Test Raw Spawn vs OpenClaw Exec

**Create test script:**
```bash
cat > /tmp/test-spawn.js << 'EOF'
const { spawn } = require('child_process');
const fs = require('fs');

// Test 1: Raw spawn
const child = spawn('cat', ['/proc/self/status']);
child.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  const privLine = lines.find(l => l.includes('NoNewPrivs'));
  console.log('Raw spawn:', privLine);
});

// Test 2: Spawn with specific options
const child2 = spawn('cat', ['/proc/self/status'], {
  stdio: 'pipe',
  detached: false
});
child2.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  const privLine = lines.find(l => l.includes('NoNewPrivs'));
  console.log('Spawn with options:', privLine);
});
EOF

node /tmp/test-spawn.js
```

**If output shows `NoNewPrivs: 0`:** Flag is being set by OpenClaw exec wrapper  
**If output shows `NoNewPrivs: 1`:** Flag is already set in parent Node.js process

### Step 4: Check Gateway Process Directly

```bash
# Get gateway PID
GATEWAY_PID=$(systemctl show openclaw --property=MainPID | cut -d= -f2)

# Check its flags
cat /proc/$GATEWAY_PID/status | grep NoNewPrivs

# If it shows 1, the flag is set at gateway startup
# If it shows 0, the flag is set when spawning exec sessions
```

---

## Potential Fixes

### Fix 1: Disable in OpenClaw Config (Easiest)

**Check if config option exists:**
```bash
cat /home/bobby/.openclaw/openclaw.json | grep -i secur -A 5 -B 5
cat /home/bobby/.openclaw/openclaw.json | grep -i priv -A 5 -B 5
```

**If found, edit:**
```json
{
  "security": {
    "noNewPrivileges": false,
    "sandbox": "off"
  }
}
```

**Then restart:**
```bash
sudo systemctl restart openclaw
```

### Fix 2: Patch OpenClaw Source (Medium)

**If found in source code:**

**Example location:** `src/tools/exec.ts`
```typescript
// Before (hypothetical)
const child = spawn(command, args, {
  stdio: 'pipe',
  env: mergedEnv,
  cwd: options.workdir,
  // Security hardening
  detached: false,
  // This might call prctl internally or via addon
});

// After
const child = spawn(command, args, {
  stdio: 'pipe',
  env: mergedEnv,
  cwd: options.workdir,
  detached: false,
  // Remove or disable NoNewPrivileges
});
```

**How to apply:**
1. Edit the file in `/home/bobby/.bun/install/global/node_modules/openclaw/`
2. Restart OpenClaw: `sudo systemctl restart openclaw`

**Risk:** Changes will be overwritten on next OpenClaw update

### Fix 3: Wrapper Script (Workaround)

**Create wrapper that unsets flag (DOESN'T WORK - flag is irreversible):**
This won't work because once set, the flag cannot be unset. But documenting for completeness.

### Fix 4: Install libatomic1 From Outside OpenClaw (RECOMMENDED)

**This bypasses the entire NoNewPrivileges issue:**

**Method A: Install before starting OpenClaw**
```bash
# As root on host system:
sudo apt update
sudo apt install -y libatomic1

# Verify:
ldconfig -p | grep libatomic
# Should show: libatomic.so.1 => /usr/lib/x86_64-linux-gnu/libatomic.so.1

# Then start OpenClaw:
sudo systemctl start openclaw
```

**Method B: If running in Docker/container**
```dockerfile
# Add to Dockerfile or run in container as root:
RUN apt-get update && apt-get install -y libatomic1
```

**Method C: Manual download and extract**
```bash
# On host or as root:
cd /tmp
apt download libatomic1
dpkg-deb -x libatomic1_*.deb /

# Or extract to specific location and set LD_LIBRARY_PATH
```

---

## Technical Explanation: Why Flag Persists

### The Inheritance Chain

```
systemd (PID 1)
  └─ openclaw.service (NoNewPrivileges=false in config)
       └─ openclaw gateway process (PID 694878)
            ├─ Sets NoNewPrivs=1 programmatically ← THE PROBLEM
            └─ Spawns exec sessions
                 └─ bash (PID 695091) - inherits NoNewPrivs=1
                      └─ sudo - BLOCKED (can't escalate)
```

### Why Systemd Config Doesn't Help

1. Systemd sets `NoNewPrivileges=false` on the main process (gateway)
2. Gateway process starts with flag=0
3. Gateway's CODE explicitly calls `prctl(PR_SET_NO_NEW_PRIVS, 1)`
4. All children inherit flag=1
5. Flag is irreversible (can't be unset once set)

### The Key Insight

**The systemd service config only affects the INITIAL state.**  
**If the process sets the flag itself, systemd can't prevent it.**

---

## Verification Commands

### After any fix attempt:

```bash
# Test 1: Check new exec session
# (Send message to Bobby: "test sudo")
# Bobby runs:
cat /proc/self/status | grep NoNewPrivs
# Expected: NoNewPrivs:	0

# Test 2: Try sudo
sudo whoami
# Expected: root

# Test 3: Install libatomic1
sudo apt install -y libatomic1
# Expected: Package installs successfully

# Test 4: Run Pear
pear --version
# Expected: Pear 1.x.x
```

---

## Summary for Resolution Agent

**The Problem:**
- OpenClaw's exec tool spawns processes with `NoNewPrivs=1` set
- This is done programmatically in OpenClaw's code, not by systemd
- The flag blocks sudo, preventing installation of libatomic1
- libatomic1 is required for Pear runtime to work

**Root Cause:**
- Systemd config `NoNewPrivileges=false` is correct but insufficient
- OpenClaw's source code explicitly sets the flag for security
- Need to either:
  1. Find and disable that code, OR
  2. Install libatomic1 without using sudo (from host/root context)

**Recommended Solution:**
Install libatomic1 from outside OpenClaw's process tree (as root on host system before starting OpenClaw). This completely bypasses the NoNewPrivileges issue.

**Alternative Solution:**
Find OpenClaw's config option to disable security hardening, if one exists.

---

## Files Referenced

- **This doc:** `/home/bobby/.openclaw/workspace/calm/NONNEWPRIVILEGES-DEEP-DIVE.md`
- **Main blocker doc:** `/home/bobby/.openclaw/workspace/calm/BLOCKER-PEAR-INSTALLATION.md`
- **OpenClaw service:** `/etc/systemd/system/openclaw.service`
- **OpenClaw config:** `/home/bobby/.openclaw/openclaw.json`
- **OpenClaw source:** `/home/bobby/.bun/install/global/node_modules/openclaw/`

---

**Last updated:** 2026-02-26 17:50 UTC  
**Next step:** Install libatomic1 from host system as root, before starting OpenClaw
