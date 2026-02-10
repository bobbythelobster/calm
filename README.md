# Calm

A command-driven email client for focused inbox management.

## Vision

Calm is a minimalist email client built around keyboard-first workflows and a command palette interface. No clutter, no distractions—just your email and a powerful command system.

## Tech Stack

- **Runtime:** [Pear](https://pears.com) - P2P-capable desktop runtime (lighter than Electron)
- **UI:** [SolidJS](https://www.solidjs.com) - Fine-grained reactivity without virtual DOM overhead
- **Email:** Gmail API with OAuth 2.0 (PKCE flow for desktop)
- **Command System:** VS Code-style command palette with fuzzy search

## Features (Planned)

- 🎯 Command palette for all actions (Cmd/Ctrl+K)
- 📬 Gmail integration (read, compose, send, archive)
- ⌨️ Keyboard-first interface with customizable shortcuts
- 🔒 Sandboxed email rendering (security-first)
- 🎨 Clean, distraction-free UI
- 💾 Local caching for offline access

## Status

🚧 **In Development** - Initial architecture phase

## Architecture

Research and planning documented in:
- `~/.openclaw/workspace/skills/calm-email/` - Gmail API patterns
- `~/.openclaw/workspace/skills/pear-desktop/` - Pear runtime guide
- `~/.openclaw/workspace/skills/solidjs/` - SolidJS patterns
- `~/.openclaw/workspace/skills/command-palette/` - Command system design

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## License

MIT
