# OmniMail

OmniMail is a professional-grade, cross-platform desktop email client inspired by eM Client. Built with an **offline-first** philosophy, OmniMail provides a secure, modern, and high-performance experience for managing your digital communications across multiple protocols.

![OmniMail Header Placeholder](https://via.placeholder.com/1200x400?text=OmniMail+Professional+Desktop+Email+Client)

## ✨ Features

### 📧 Core Protocol Support
- **Multi-Account Management**: Support for unlimited IMAP, POP3, and SMTP accounts.
- **Smart Sync Engine**: Incremental synchronization (headers first, body on-demand) for lightning-fast folder loading.
- **IMAP IDLE**: Real-time email push notifications using persistent server connections.
- **POP3 Flexibility**: Choose between "Download & Delete" or "Keep a copy on server" modes.

### 🛡️ Security & Privacy
- **Encrypted Credentials**: Passwords are encrypted using system-native keys via `electron.safeStorage`.
- **Sandboxed Rendering**: HTML emails are rendered in secure, isolated iframes to prevent script execution and cross-site tracking.
- **Local-First Data**: All your emails and attachments are stored locally in a high-performance SQLite database.

### 🔍 Search & Organization
- **Full-Text Search (FTS5)**: Instant search across subjects, senders, and email bodies using SQLite's advanced indexing.
- **3-Panel Layout**: Intuitive navigation with a folder sidebar, message list with snippets, and a rich reader view.
- **Attachment Management**: Automatic caching and dedicated preview section for local file access.

### 🛠️ Advanced Tools
- **Native Notifications**: System-level alerts for new messages with deep-linking support.
- **Theme Support**: Seamless switching between Light, Dark, and System themes.
- **Automatic Updates**: Background update checks and one-click installation via `electron-updater`.

## 🚀 Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/) + [React](https://react.dev/) (Vite) + [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://www.sqlite.org/) via [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)
- **Networking**: [imapflow](https://imapflow.com/), [poplib](https://github.com/ditesh/node-poplib), [nodemailer](https://nodemailer.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)

## 📸 Screenshots

| Sidebar & Search | Reader View & Attachments |
| :---: | :---: |
| ![Sidebar Placeholder](https://via.placeholder.com/400x300?text=Sidebar+Search) | ![Reader View Placeholder](https://via.placeholder.com/400x300?text=Reader+View) |

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or later
- **pnpm**: v9.0.0 or later (recommended)

### Development Setup
```bash
# Clone the repository
git clone https://github.com/KhatarMalayki/omnimail.git
cd omnimail

# Install dependencies
pnpm install

# Run in development mode
pnpm run dev
```

### Building for Production
```bash
# Compile and bundle the application
pnpm run build

# Generate distribution packages (Win/Mac/Linux)
pnpm run dist
```

## 🗺️ Roadmap
- [x] Milestone 1: Core Architecture & SQLite Schema
- [x] Milestone 2: Multi-Protocol Engine (IMAP/POP3/SMTP)
- [x] Milestone 3: Professional 3-Panel UI
- [x] Milestone 4: Security, FTS5 Search & Attachments
- [x] Milestone 5: Production Readiness & Distribution
- [ ] Milestone 6: Calendar & Contact Integration (Coming Soon)

## 🔒 Security Policy
OmniMail prioritizes user privacy. All communication with mail servers is performed via SSL/TLS. No data is ever sent to third-party servers; your emails stay on your machine and your provider's server.

---
*Developed by the OmniMail Team*
