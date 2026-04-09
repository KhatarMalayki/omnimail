# OmniMail

OmniMail is a professional-grade, cross-platform desktop email client inspired by eM Client. Built with an offline-first philosophy, it provides a highly secure, modern, and high-performance experience for managing your digital communication.

## 🚀 Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/) + [React](https://react.dev/) (Vite) + [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://www.sqlite.org/) ([Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)) for indexing and local email storage
- **Networking**: 
  - [imapflow](https://imapflow.com/) (IMAP)
  - [poplib](https://github.com/ditesh/node-poplib) (POP3)
  - [mailparser](https://github.com/nodemailer/mailparser) (MIME parsing)
  - [nodemailer](https://nodemailer.com/) (SMTP)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)

## 🗺️ Development Roadmap

### 🟢 Milestone 1: Initialization (Done)
- [x] Project scaffolding with Electron + React + Vite + TypeScript.
- [x] SQLite database schema implementation for offline-first storage.
- [x] Folder structure and secure IPC bridge setup.
- [x] Initial documentation and GitHub repository setup.

### 🟡 Milestone 2: Multi-Protocol Engine (Pending)
- [ ] IMAP full folder sync with IDLE support.
- [ ] POP3 "Download & Delete" / "Leave copy" logic.
- [ ] SMTP secure outgoing mail handler.
- [ ] Incremental sync (headers first, body on-demand).

### 🟡 Milestone 3: UI/UX (3-Pane Layout) (Pending)
- [ ] Folder & Account navigation (Pane 1).
- [ ] Scrollable Email List with snippets (Pane 2).
- [ ] Sandboxed iframe Reading Pane (Pane 3).

### 🟡 Milestone 4: Security & Search (Pending)
- [ ] Full-text search across local cache.
- [ ] Secure credential storage.
- [ ] Attachment management and local caching.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or later)
- pnpm (recommended) or npm

### Installation
```bash
# Clone the repository
git clone https://github.com/KhatarMalayki/Dwirusdianto.git OmniMail
cd OmniMail

# Install dependencies
pnpm install
```

### Development
```bash
# Run the application in development mode
pnpm run dev
```

### Build
```bash
# Build the application for production
pnpm run build
```

## 🔒 Security
OmniMail uses a secure IPC bridge between the Electron Main process and the Renderer. All protocol logic and sensitive credentials remain in the Main process, isolated from the UI layer. HTML emails are rendered in a sandboxed iframe to prevent script execution and cross-site tracking.

---
*Created by OmniMail Team*
