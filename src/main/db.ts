import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';

const dbPath = join(app.getPath('userData'), 'omnimail.db');
const db = new Database(dbPath);

export function initDatabase() {
  db.pragma('journal_mode = WAL');

  // Accounts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT,
      protocol TEXT NOT NULL, -- 'IMAP' or 'POP3'
      host TEXT NOT NULL,
      port INTEGER NOT NULL,
      secure BOOLEAN DEFAULT 1,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      smtp_host TEXT NOT NULL,
      smtp_port INTEGER NOT NULL,
      smtp_secure BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Folders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      path TEXT NOT NULL, -- IMAP path like 'INBOX.Sent'
      parent_id INTEGER,
      attributes TEXT, -- JSON array of IMAP attributes
      uid_next INTEGER,
      uid_validity INTEGER,
      unread_count INTEGER DEFAULT 0,
      total_count INTEGER DEFAULT 0,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      UNIQUE(account_id, path)
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folder_id INTEGER NOT NULL,
      uid INTEGER NOT NULL,
      message_id TEXT,
      subject TEXT,
      from_name TEXT,
      from_address TEXT,
      to_address TEXT,
      date DATETIME,
      snippet TEXT,
      body_html TEXT,
      body_text TEXT,
      is_read BOOLEAN DEFAULT 0,
      is_flagged BOOLEAN DEFAULT 0,
      size INTEGER,
      headers TEXT, -- JSON string
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
      UNIQUE(folder_id, uid)
    )
  `);

  // Attachments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      content_type TEXT,
      size INTEGER,
      content_id TEXT,
      disposition TEXT,
      local_path TEXT, -- Path to cached file
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
    )
  `);

  // POP3 UID Tracker
  db.exec(`
    CREATE TABLE IF NOT EXISTS pop3_uids (
      account_id INTEGER NOT NULL,
      uid TEXT NOT NULL,
      downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (account_id, uid),
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized at:', dbPath);
}

export default db;
