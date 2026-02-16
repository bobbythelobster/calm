# Calm Email Client: Phase 2 Implementation Guide

**Status**: Active Development  
**Phase 1 Complete**: OAuth + Gmail API scaffolding (commit 18c3c7d)  
**Date**: Feb 11, 2026

## Phase 2 Overview

This phase builds the actual UI and integrates all components from Phase 1.

**Tech Stack:**
- SolidJS (Signals, Effects, JSX components)
- Pear Desktop Runtime (for windowing/menu bar)
- TailwindCSS (for styling)
- Command Palette pattern (fuzzy search, keybindings)

**Goals:**
- Command Palette UI (VS Code/Raycast style)
- Email List View
- Email Reader (sandboxed iframe)
- Label Sidebar
- Compose Modal
- Settings Panel

## File Structure

```
src/
├── app.js                 # Entry point + Pear integration
├── oauth-loopback.js      # OAuth 2.0 flow (from Phase 1)
├── gmail-api.js           # Gmail API wrapper (from Phase 1)
├── components/
│   ├── CommandPalette.jsx       # Fuzzy search command interface
│   ├── EmailList.jsx           # Inbox with search/filter
│   ├── EmailReader.jsx         # Single email view with iframe
│   ├── LabelTree.jsx           # Label hierarchy sidebar
│   ├── ComposeModal.jsx        # Email composition
│   ├── SettingsPanel.jsx       # App configuration
│   └── StatusBar.jsx           # Sync status indicator
├── stores/
│   ├── emailStore.js          # SolidJS signal store for emails
│   ├── labelStore.js          # SolidJS signal store for labels
│   ├── uiStore.js             # UI state (selected email, search, etc.)
│   └── syncStore.js            # Sync status, authentication state
├── styles/
│   ├── theme.css              # Design tokens
│   └── components.css          # Component styles
└── utils/
    ├── storage.js             # IndexedDB/LocalStorage wrapper
    └── keyboard.js            # Keybinding management
```

## Component Specifications

### 1. Command Palette

```javascript
// CommandPalette.jsx
import { createSignal, createEffect, onMount } from 'solid-js';

export function CommandPalette() {
  const isOpen = createSignal(false);
  const query = createSignal('');
  const selectedIndex = createSignal(0);

  // Command definitions
  const commands = [
    { id: 'compose', label: 'Compose', action: openComposer, shortcut: 'cmd+k' },
    { id: 'inbox', label: 'Go to Inbox', action: goToInbox, shortcut: 'cmd+shift+i' },
    { id: 'archive', label: 'Archive selected', action: archiveSelected, shortcut: 'cmd+e' },
    { id: 'spam', label: 'Mark as Spam', action: spamSelected, shortcut: 'cmd+j' },
    { id: 'settings', label: 'Settings', action: openSettings, shortcut: 'cmd+,' },
  ];

  // Fuzzy search
  const filteredCommands = createMemo(() => {
    if (query() === '') return commands;
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(query().toLowerCase())
    );
  });

  // Keyboard navigation
  onMount(() => {
    const handleKeydown = (e) => {
      if (e.metaKey && e.key === 'k') {
        if (isOpen()) {
          isOpen(false);
        } else {
          isOpen(true);
          query.set('');
          document.getElementById('command-input')?.focus();
        }
      } else if (e.key === 'Escape') {
        isOpen(false);
        query.set('');
      } else if (e.key === 'ArrowDown') {
        selectedIndex(prev => (prev + 1) % filteredCommands().length);
      } else if (e.key === 'ArrowUp') {
        selectedIndex(prev => (prev - 1 + filteredCommands().length) % filteredCommands().length);
      } else if (e.key === 'Enter' || e.key === 'Return') {
        const cmd = filteredCommands()[selectedIndex()];
        isOpen(false);
        cmd.action();
      }
    };

    window.addEventListener('keydown', handleKeydown);
  });

  return (
    <div class="command-palette" classList={{ open: isOpen() }}>
      <input
        type="text"
        placeholder="Type a command..."
        onInput={(e) => query(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
          }
        }}
      />
      <For each={filteredCommands()}>
        {(cmd, index) => (
          <div 
            class="command-item"
            classList={{ selected: index() === selectedIndex() }}
            onClick={() => {
              selectedIndex(index);
              if (e.key === 'Enter') {
                isOpen(false);
                cmd.action();
              }
            }}
          >
            <span class="shortcut">{cmd.shortcut}</span>
            <span class="label">{cmd.label}</span>
          </div>
        )}
      </For>
    </div>
  );
}
```

### 2. Email List

```javascript
// EmailList.jsx
import { createSignal, createEffect } from 'solid-js';
import { emailStore } from '../stores/emailStore.js';
import { gmailAPI } from '../gmail-api.js';

export function EmailList() {
  const emails = createSignal([]);
  const selectedEmailId = createSignal(null);
  const loading = createSignal(false);
  const error = createSignal(null);

  // Load emails on mount
  onMount(async () => {
    loading(true);
    try {
      const result = await gmailAPI.listMessages({ maxResults: 50 });
      emails(result.messages);
      loading(false);
    } catch (err) {
      error(err.message);
      loading(false);
    }
  });

  // Search filter
  const searchQuery = createSignal('');
  const filteredEmails = createMemo(() => {
    const query = searchQuery();
    if (!query) return emails();
    return emails().filter(email => 
      email.subject.toLowerCase().includes(query.toLowerCase()) ||
      email.snippet.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div class="email-list">
      <div class="search-bar">
        <input
          type="text"
          placeholder="Search emails..."
          onInput={(e) => searchQuery(e.target.value)}
        />
      </div>
      
      <ShowError error={error()} />
      
      <ShowLoading loading={loading()} />
      
      <For each={filteredEmails()}>
        {(email) => (
          <EmailItem 
            email={email} 
            selected={email.id === selectedEmailId()}
            onClick={() => selectedEmailId(email.id)}
          />
        )}
      </For>
    </div>
  );
}
```

### 3. Email Reader

```javascript
// EmailReader.jsx
import { createSignal, createEffect } from 'solid-js';
import { gmailAPI } from '../gmail-api.js';

export function EmailReader({ emailId }) {
  const email = createSignal(null);
  const loading = createSignal(true);
  const error = createSignal(null);

  onMount(async () => {
    loading(true);
    try {
      const data = await gmailAPI.getMessageParsed(emailId);
      email(data);
      loading(false);
    } catch (err) {
      error(err.message);
      loading(false);
    }
  });

  return (
    <div class="email-reader">
      <ShowError error={error()} />
      <ShowLoading loading={loading()} />
      
      <ShowSuspense fallback={<div>Loading email...</div>}>
        <Show when={!!email()}>
          <EmailBody email={email()} />
        </Show>
      </ShowSuspense>
    </div>
  );
}
```

### 4. Email Body (Sandboxed)

```javascript
// EmailBody.jsx
import { createSignal, onMount } from 'solid-js';

export function EmailBody({ email }) {
  let iframeRef;

  onMount(() => {
    if (iframeRef && email.body) {
      // Create sandboxed iframe for security
      iframeRef.sandbox.add('allow-same-origin');
      iframeRef.srcdoc = sanitizeHTML(email.body);
    }
  });

  return (
    <div class="email-container">
      <iframe 
        ref={iframeRef} 
        class="email-body"
        title="Email Content"
        sandbox="allow-same-origin allow-scripts allow-popups"
      />
    </div>
  );
}
```

## Stores

### Email Store (SolidJS)

```javascript
// stores/emailStore.js
import { createSignal } from 'solid-js';
import { gmailAPI } from '../gmail-api.js';

export const emailStore = createSignal([]);
export const selectedEmailId = createSignal(null);
export const loading = createSignal(false);
export const error = createSignal(null);
export const searchQuery = createSignal('');

export function loadEmails() {
  loading(true);
  gmailAPI.listMessages({ maxResults: 50 })
    .then(messages => {
      emailStore(messages);
      loading(false);
    })
    .catch(err => {
      error(err.message);
      loading(false);
    });
}

export function selectEmail(id) {
  selectedEmailId(id);
}

export function setSearchQuery(query) {
  searchQuery(query);
}

export function refreshEmails() {
  loadEmails();
}
```

### Label Store

```javascript
// stores/labelStore.js
import { createSignal } from 'solid-js';

export const labels = createSignal([]);
export const loading = createSignal(false);

export function loadLabels() {
  loading(true);
  gmailAPI.getLabels()
    .then(labelList => {
      labels(labelList);
      loading(false);
    });
}
```

### UI Store

```javascript
// stores/uiStore.js
import { createSignal } from 'solid-js';

export const commandPaletteOpen = createSignal(false);
export const selectedEmailId = createSignal(null);
export const currentPage = createSignal('inbox');
export const sidebarOpen = createSignal(true);
```

## Integration Points

### 1. Pear Integration

```javascript
// app.js - Pear setup
import pear from 'pear-desktop';

pear.ready().then(() => {
  console.log('Calm ready for desktop integration');
  
  // Create window
  const win = pear.createWindow({
    title: 'Calm',
    width: 1200,
    height: 800,
    resizable: true
  });
  
  // Load SolidJS app into window
  win.loadFile('index.html');
});
```

### 2. OAuth Integration

```javascript
// Command palette integration
const oauthLoopback = new OAuthLoopback(clientId, clientSecret);

// On first launch
if (!localStorage.getItem('calm_tokens')) {
  oauthLoopback.startAuthFlow().then(code => {
    return oauthLoopback.exchangeCodeForTokens(code);
  }).then(tokens => {
    tokenManager.saveTokens(tokens);
    return gmailAPI.setAccessToken(tokens.accessToken);
  });
}
```

### 3. Gmail API Integration

```javascript
// Using Gmail API in components
const gmailAPI = new GmailAPI();

// Example: Load inbox on mount
onMount(async () => {
  const messages = await gmailAPI.listMessages({ 
    labelIds: ['INBOX'],
    maxResults: 50
  });
  
  emailStore(messages);
});
```

## Testing Plan

### Unit Tests

```javascript
// test/components/CommandPalette.test.js
import { render, screen } from '@testing-library/react';

describe('CommandPalette', () => {
  it('should filter commands by query', () => {
    // Test fuzzy search logic
  });

  it('should navigate with arrow keys', () => {
    // Test keyboard navigation
  });

  it('should execute command on Enter', () => {
    // Test command execution
  });
});
```

### Integration Tests

```javascript
// test/integration/oauth-flow.test.js
describe('OAuth Flow', () => {
  it('should start auth server', async () => {
    const oauth = new OAuthLoopback(clientId, secret);
    const server = await oauth.startAuthFlow();
    
    expect(server.listening).toBe(true);
    expect(server.port).toBe(8888);
  });

  it('should handle browser callback', async () => {
    // Mock browser open
    // Test code exchange
  });
});
```

## Implementation Priority

### Week 1: Core UI
- [ ] Command Palette implementation
- [ ] Email List with search/filter
- [ ] Email Reader with sandbox
- [ ] Basic Pear integration (windowing)
- [ ] Store structure setup

### Week 2: Features
- [ ] Label Tree sidebar
- [ ] Compose Modal
- [ ] Settings Panel
- [ ] OAuth token refresh
- [ ] Real-time sync (webhook/watch)
- [ ] Keyboard shortcuts

### Week 3: Polish
- [ ] Dark mode theme
- [ ] Error handling
- [ ] Offline mode (IndexedDB caching)
- [ ] Performance optimization
- [ ] Responsive design

## Next Steps After Phase 2

1. Set up SolidJS + TailwindCSS scaffold
2. Implement Command Palette (highest priority)
3. Build Email List with pagination
4. Create Email Reader with security sandbox
5. Integrate OAuth + Gmail API
6. Test end-to-end flow
7. Deploy to desktop (Pear)
8. Performance tuning

## Notes

- SolidJS signals automatically handle reactivity - no manual state management needed
- Pear provides windowing APIs for desktop integration
- All stores should use signals for performance
- Command palette is the core interaction pattern - make it robust
