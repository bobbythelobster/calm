# Calm MVP Sprint - Revised Schedule

**Start Date:** Feb 26, 2026 (TODAY)  
**Deadline:** March 7, 2026 (First Friday of March)  
**Duration:** 9 working days  
**Commitment:** Ship working MVP with read + send + command palette

---

## Current State Assessment (Feb 26, 2026)

### ✅ COMPLETED (Phase 1)
- OAuth 2.0 loopback server (249 lines)
- Gmail API client wrapper (288 lines)
- Basic HTML shell (41 lines)
- Project structure initialized
- Git repo connected to GitHub

### ❌ NOT STARTED (Phase 2)
- No UI components built
- No SolidJS integration
- No command palette
- No email list/reader
- No compose functionality

### 🚨 CRITICAL BLOCKERS (Must Fix TODAY)

#### Blocker #1: Pear Runtime Not Installed
**Status:** 🔴 BLOCKING  
**Impact:** Cannot run app at all  
**Resolution:** Install Pear CLI
```bash
npm install -g pear
```
**Time to fix:** 5 minutes  
**Owner:** Bobby (me)

#### Blocker #2: No Dependencies Installed
**Status:** 🔴 BLOCKING  
**Impact:** No SolidJS, no build tools  
**Resolution:** Add dependencies to package.json and install
```bash
cd /home/bobby/.openclaw/workspace/calm
npm install solid-js vite tailwindcss
```
**Time to fix:** 10 minutes  
**Owner:** Bobby (me)

#### Blocker #3: OAuth Credentials Unknown
**Status:** 🟡 NEEDS VERIFICATION  
**Impact:** May not be able to authenticate  
**Resolution:** Test oauth-loopback.js, verify tokens  
**Time to fix:** 15 minutes (if working) or 2 hours (if broken)  
**Owner:** Bobby (me)

#### Blocker #4: Pear + SolidJS Integration Unknown
**Status:** 🟡 RESEARCH NEEDED  
**Impact:** May need custom build config  
**Resolution:** Check Pear docs, test minimal SolidJS app  
**Time to fix:** 1-2 hours  
**Owner:** Bobby (me)

---

## Revised 9-Day Sprint Plan

### Day 0 (TODAY - Feb 26, PM)
**Goal:** Unblock ALL technical blockers

**Tasks:**
- [ ] Install Pear runtime globally
- [ ] Add SolidJS + dependencies to package.json
- [ ] Run `npm install`
- [ ] Test oauth-loopback.js flow
- [ ] Create minimal "Hello World" SolidJS app in Pear
- [ ] Verify `pear dev .` works
- [ ] Document any additional blockers discovered

**Deliverable:** `pear dev .` runs a basic SolidJS app

**Time estimate:** 3-4 hours (TONIGHT)

---

### Day 1 (Feb 27 - Thursday)
**Goal:** Command Palette Foundation

**Tasks:**
- [ ] Build CommandPalette.jsx component structure
- [ ] Implement Cmd+K open/close toggle
- [ ] Add basic command registry (5-10 commands)
- [ ] Wire up keyboard event listeners
- [ ] Style command palette overlay

**Deliverable:** Command palette opens/closes with Cmd+K

**Dependencies:** Day 0 complete  
**Blocker risk:** LOW (if Day 0 done)

---

### Day 2 (Feb 28 - Friday)
**Goal:** Email Store + API Integration

**Tasks:**
- [ ] Create stores/emailStore.js with SolidJS signals
- [ ] Wire up gmail-api.js to store
- [ ] Implement loadEmails() function
- [ ] Add loading/error states
- [ ] Test API calls in console

**Deliverable:** Can fetch emails from Gmail API into store

**Dependencies:** OAuth working from Day 0  
**Blocker risk:** MEDIUM (if OAuth broken)

---

### Day 3 (Mar 1 - Saturday)
**Goal:** Email List Component

**Tasks:**
- [ ] Build EmailList.jsx component
- [ ] Render emails from store (subject, sender, snippet)
- [ ] Add keyboard navigation (j/k keys)
- [ ] Implement search/filter
- [ ] Style email list

**Deliverable:** Can see inbox emails in a list

**Dependencies:** emailStore working  
**Blocker risk:** LOW

---

### Day 4 (Mar 2 - Sunday)
**Goal:** Email Reader Component

**Tasks:**
- [ ] Build EmailReader.jsx component
- [ ] Implement getMessageParsed() in gmail-api.js
- [ ] Parse email headers (from, to, subject, date)
- [ ] Extract and display email body
- [ ] Add sandboxed iframe for HTML emails

**Deliverable:** Can click email and read full content safely

**Dependencies:** EmailList component  
**Blocker risk:** MEDIUM (HTML sandbox may be tricky)

---

### Day 5 (Mar 3 - Monday)
**Goal:** Compose Modal Structure

**Tasks:**
- [ ] Build ComposeModal.jsx
- [ ] Add form fields (to, subject, body)
- [ ] Wire up Cmd+N shortcut
- [ ] Style compose overlay

**Deliverable:** Compose modal opens and has form fields

**Dependencies:** Command palette  
**Blocker risk:** LOW

---

### Day 6 (Mar 4 - Tuesday)
**Goal:** Send Email Functionality

**Tasks:**
- [ ] Implement sendMessage() in gmail-api.js
- [ ] Create MIME message from form data
- [ ] Add send button with loading state
- [ ] Test sending email
- [ ] Add success/error notifications

**Deliverable:** Can compose and send emails

**Dependencies:** Gmail API working  
**Blocker risk:** MEDIUM (MIME encoding can be tricky)

---

### Day 7 (Mar 5 - Wednesday)
**Goal:** Email Actions (Archive, Trash, Mark Read)

**Tasks:**
- [ ] Implement modifyMessage() in gmail-api.js
- [ ] Add archive action (remove INBOX label)
- [ ] Add trash action
- [ ] Add mark read/unread toggle
- [ ] Wire up keyboard shortcuts (e=archive, #=trash)

**Deliverable:** Can manage emails with keyboard

**Dependencies:** EmailList component  
**Blocker risk:** LOW

---

### Day 8 (Mar 6 - Thursday)
**Goal:** Integration + Bug Fixes

**Tasks:**
- [ ] Fix all critical bugs found in Days 1-7
- [ ] Add error boundaries
- [ ] Improve loading states
- [ ] Test edge cases (no emails, API errors, slow network)
- [ ] Polish UI (spacing, colors, interactions)

**Deliverable:** Stable, usable email client

**Dependencies:** All previous days  
**Blocker risk:** HIGH (accumulated bugs)

---

### Day 9 (Mar 7 - Friday) - SHIP DAY
**Goal:** Documentation + Release

**Tasks:**
- [ ] Write README with setup instructions
- [ ] Document OAuth credential setup
- [ ] Add screenshots/demo
- [ ] Tag v0.1.0 release
- [ ] Push to GitHub
- [ ] Test on fresh install

**Deliverable:** MVP is shipped and documented

**Dependencies:** Day 8 complete  
**Blocker risk:** LOW

---

## Reduced MVP Scope (If Behind Schedule)

If we fall behind by Day 4, cut to ABSOLUTE MINIMUM:

**Core MVP:**
1. ✅ OAuth authentication
2. ✅ Read emails (list + reader)
3. ✅ Send emails (compose + send)
4. ✅ Command palette (Cmd+K)

**Cut if needed:**
- ❌ Label sidebar (just show Inbox)
- ❌ Archive/trash actions (add post-MVP)
- ❌ Dark mode / settings panel
- ❌ Keyboard shortcuts beyond basics

---

## Success Criteria (MVP Definition)

By March 7, 2026, the app must:

1. ✅ Launch with `pear dev .` or `pear run .`
2. ✅ Authenticate with Gmail OAuth
3. ✅ Display inbox emails in a list
4. ✅ Open and read individual emails
5. ✅ Compose and send new emails
6. ✅ Command palette opens with Cmd+K
7. ✅ Basic error handling (no crashes)

**Ship criteria:** If you can check email and send replies, it's shippable.

---

## Communication Protocol

### When I'm Blocked (Sam's Rule: "Be loud")

I will MESSAGE SAM IMMEDIATELY if:
- ❌ Cannot install Pear runtime
- ❌ OAuth flow is broken and can't be fixed in 2 hours
- ❌ Pear + SolidJS integration doesn't work
- ❌ Gmail API quota limits hit
- ❌ Any blocker that stops progress for >2 hours

**Format:** Direct Telegram message:
```
🚨 BLOCKED: [issue]
Impact: [what's stopped]
Tried: [what I attempted]
Need: [what unblocks me]
```

### Daily Status Updates

Every evening (11 PM UTC / 3 PM PST):
- ✅ What shipped today
- 🚧 What's in progress
- 🚨 Blockers encountered
- 📅 Tomorrow's plan

---

## Risk Assessment

### HIGH RISK
- **Pear + SolidJS integration** - May require custom Vite config
  - Mitigation: Fallback to vanilla JS if needed
- **OAuth token refresh** - May expire during testing
  - Mitigation: Test refresh flow on Day 0

### MEDIUM RISK
- **HTML email rendering** - Security + display issues
  - Mitigation: Always show plain text fallback
- **MIME message encoding** - For sending emails
  - Mitigation: Use well-tested library

### LOW RISK
- **Gmail API quota** - Unlikely to hit limits in development
  - Mitigation: Cache emails locally
- **UI/styling** - Can always ship ugly if functional
  - Mitigation: TailwindCSS makes this fast

---

## Timeline Visual

```
Feb 26 (TODAY) |==== Day 0: Unblock ====|
Feb 27 (Thu)   |==== Day 1: Command Palette ====|
Feb 28 (Fri)   |==== Day 2: Email Store ====|
Mar 1 (Sat)    |==== Day 3: Email List ====|
Mar 2 (Sun)    |==== Day 4: Email Reader ====|
Mar 3 (Mon)    |==== Day 5: Compose Modal ====|
Mar 4 (Tue)    |==== Day 6: Send Email ====|
Mar 5 (Wed)    |==== Day 7: Email Actions ====|
Mar 6 (Thu)    |==== Day 8: Integration + Bugs ====|
Mar 7 (Fri)    |==== Day 9: Ship MVP 🚀 ====|
```

---

## Starting NOW

**First action:** Unblock Pear runtime installation (5 min)  
**Second action:** Install dependencies (10 min)  
**Third action:** Test OAuth flow (15 min)  

**Time to first code:** ~30 minutes from now

Let's ship this. 🦞
