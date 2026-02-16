# Calm Email Client: 2-Week Sprint to MVP

**Start Date:** February 16, 2026  
**Target MVP Date:** March 1, 2026  
**Daily Commitment:** At least 1 meaningful commit per day

## Goal
Ship a working MVP of Calm email client with:
- ✅ OAuth authentication (Phase 1 complete)
- Command palette interface
- Email list view
- Email reader with security sandbox
- Basic compose functionality
- Desktop app packaging

---

## Week 1: Core UI Components (Feb 16-22)

### Day 1 (Feb 16) - Project Setup & Command Palette Foundation
**Goal:** Get build system working + start command palette
- [ ] Set up SolidJS + Vite build configuration
- [ ] Install dependencies (solid-js, tailwindcss, etc.)
- [ ] Create basic app shell with hot reload
- [ ] Implement command palette HTML structure
- [ ] Add keyboard event listeners (Cmd+K to open)
**Deliverable:** `npm run dev` works, command palette opens/closes

### Day 2 (Feb 17) - Command Palette Logic
**Goal:** Fully functional command palette
- [ ] Implement fuzzy search filtering
- [ ] Add arrow key navigation (up/down)
- [ ] Add Enter to execute command
- [ ] Create initial command registry (compose, inbox, settings)
- [ ] Style command palette (theme.css)
**Deliverable:** Command palette is usable with keyboard

### Day 3 (Feb 18) - Email Store & API Integration
**Goal:** Connect Gmail API to SolidJS store
- [ ] Create `stores/emailStore.js` with signals
- [ ] Implement `loadEmails()` function using gmail-api.js
- [ ] Add token refresh logic
- [ ] Create loading/error states
- [ ] Test API calls in dev console
**Deliverable:** Can fetch emails from Gmail API

### Day 4 (Feb 19) - Email List Component
**Goal:** Display inbox emails
- [ ] Create `EmailList.jsx` component
- [ ] Implement email item rendering (subject, sender, snippet)
- [ ] Add search/filter input
- [ ] Implement keyboard navigation (j/k for up/down)
- [ ] Style email list (hover states, selection)
**Deliverable:** Can see inbox emails in a list

### Day 5 (Feb 20) - Email Reader Component
**Goal:** Open and read individual emails
- [ ] Create `EmailReader.jsx` component
- [ ] Implement `getMessageParsed()` in gmail-api.js
- [ ] Parse email headers (from, to, subject, date)
- [ ] Extract email body (HTML or plain text)
- [ ] Display email in reader pane
**Deliverable:** Can click email and read full content

### Day 6 (Feb 21) - Email Body Sandbox
**Goal:** Secure email rendering
- [ ] Create `EmailBody.jsx` with sandboxed iframe
- [ ] Implement HTML sanitization
- [ ] Test with real email HTML (tracking pixels, scripts)
- [ ] Add fallback to plain text if HTML fails
- [ ] Style iframe container
**Deliverable:** Emails render safely without XSS risks

### Day 7 (Feb 22) - Week 1 Integration & Bug Fixes
**Goal:** Polish and stabilize Week 1 work
- [ ] Fix any broken interactions
- [ ] Add error boundaries for crash recovery
- [ ] Improve loading states (spinners, skeletons)
- [ ] Test edge cases (no emails, API errors, slow network)
- [ ] Update ROADMAP with actual progress
**Deliverable:** Stable read-only email client

**MILESTONE 1 COMPLETE:** Can authenticate, list emails, read emails securely

---

## Week 2: Actions & Polish (Feb 23 - Mar 1)

### Day 8 (Feb 23) - Compose Modal Structure
**Goal:** Email composition UI
- [ ] Create `ComposeModal.jsx` component
- [ ] Add form fields (to, subject, body)
- [ ] Implement open/close logic
- [ ] Add keyboard shortcut (Cmd+N or 'c' key)
- [ ] Style compose modal (overlay, form layout)
**Deliverable:** Compose modal opens and closes

### Day 9 (Feb 24) - Send Email Functionality
**Goal:** Actually send emails
- [ ] Implement `sendMessage()` in gmail-api.js
- [ ] Create email MIME message from form data
- [ ] Add send button with loading state
- [ ] Show success/error notifications
- [ ] Test sending email to yourself
**Deliverable:** Can compose and send emails

### Day 10 (Feb 25) - Label Sidebar
**Goal:** Navigate between folders
- [ ] Create `LabelTree.jsx` component
- [ ] Fetch labels from Gmail API
- [ ] Display INBOX, SENT, DRAFTS, etc.
- [ ] Implement label click → filter emails
- [ ] Show unread counts per label
**Deliverable:** Can switch between Inbox/Sent/etc.

### Day 11 (Feb 26) - Email Actions
**Goal:** Archive, trash, mark read/unread
- [ ] Implement `modifyMessage()` in gmail-api.js
- [ ] Add archive action (remove INBOX label)
- [ ] Add trash action (move to TRASH)
- [ ] Add mark read/unread toggle
- [ ] Add keyboard shortcuts (e=archive, #=trash)
**Deliverable:** Can manage emails with keyboard

### Day 12 (Feb 27) - Pear Desktop Integration
**Goal:** Package as desktop app
- [ ] Set up Pear runtime configuration
- [ ] Create app.js entry point for Pear
- [ ] Configure windowing (size, title, menu)
- [ ] Test app launch via `pear run`
- [ ] Fix any Pear-specific issues
**Deliverable:** App runs as native desktop app

### Day 13 (Feb 28) - Settings & Theming
**Goal:** User preferences
- [ ] Create `SettingsPanel.jsx` component
- [ ] Add dark mode toggle
- [ ] Add preferences (auto-archive, notifications)
- [ ] Persist settings to localStorage
- [ ] Implement dark mode theme
**Deliverable:** Working settings panel with dark mode

### Day 14 (Mar 1) - Final Polish & Documentation
**Goal:** Ship MVP
- [ ] Fix all critical bugs
- [ ] Write README with setup instructions
- [ ] Add screenshots/demo GIF
- [ ] Test on fresh install
- [ ] Tag v0.1.0 release
- [ ] Deploy/package for distribution
**Deliverable:** MVP is complete and documented

**MILESTONE 2 COMPLETE:** Fully functional email client MVP

---

## Success Metrics

### Week 1 Checklist
- [ ] App runs with `npm run dev`
- [ ] Command palette works (Cmd+K, search, execute)
- [ ] Email list loads from Gmail
- [ ] Can select and read emails
- [ ] Email HTML renders safely in sandbox
- [ ] No critical bugs

### Week 2 Checklist
- [ ] Can compose and send emails
- [ ] Can navigate labels (Inbox, Sent, etc.)
- [ ] Can archive/trash/mark emails
- [ ] App runs as Pear desktop app
- [ ] Dark mode works
- [ ] README and setup docs complete

### MVP Definition
A working desktop email client where you can:
1. Sign in with Gmail OAuth
2. Read emails from inbox
3. Compose and send emails
4. Organize emails (archive, trash, labels)
5. Use keyboard shortcuts for everything
6. Run as native desktop app (not browser)

---

## Daily Progress Tracking

Update this section daily with actual progress:

### Week 1
- **Feb 16:** [Status TBD]
- **Feb 17:** [Status TBD]
- **Feb 18:** [Status TBD]
- **Feb 19:** [Status TBD]
- **Feb 20:** [Status TBD]
- **Feb 21:** [Status TBD]
- **Feb 22:** [Status TBD]

### Week 2
- **Feb 23:** [Status TBD]
- **Feb 24:** [Status TBD]
- **Feb 25:** [Status TBD]
- **Feb 26:** [Status TBD]
- **Feb 27:** [Status TBD]
- **Feb 28:** [Status TBD]
- **Mar 1:** [Status TBD]

---

## Risk Mitigation

### High Risk Items
1. **Pear runtime issues** - Fallback: Ship as Electron if Pear doesn't work
2. **Gmail API quota limits** - Mitigation: Cache emails locally, batch requests
3. **OAuth token expiry** - Mitigation: Implement refresh token flow (already done in Phase 1)
4. **HTML email rendering** - Mitigation: Always show plain text fallback

### Time Buffer
- If behind schedule by Day 7, cut label sidebar and focus on core read/send
- If behind schedule by Day 10, cut settings panel and dark mode
- Minimum viable MVP: Read emails + Send emails + Command palette

---

## Notes
- **Commit daily** - Even if incomplete, commit progress
- **Test as you go** - Don't accumulate untested code
- **Keep it simple** - MVP means minimum, not perfect
- **Ship fast** - We can add features after v0.1.0

**Let's ship this thing! 🚀**
