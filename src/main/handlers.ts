import { ipcMain, safeStorage } from 'electron';
import db from './db';
import { syncImapFolders, fetchMessageBody, startIdle } from './imap';
import { syncPop3 } from './pop3';
import { sendEmail } from './smtp';
import { setupAttachmentHandlers } from './attachments';

export function setupIpcHandlers() {
  setupAttachmentHandlers();
  // Accounts
  ipcMain.handle('add-account', (_, data) => {
    let encryptedPassword = data.password;
    if (safeStorage.isEncryptionAvailable()) {
      encryptedPassword = safeStorage.encryptString(data.password).toString('base64');
    }

    const stmt = db.prepare(`
      INSERT INTO accounts (email, display_name, protocol, host, port, secure, username, password, smtp_host, smtp_port, smtp_secure)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.email,
      data.displayName,
      data.protocol,
      data.host,
      data.port,
      data.secure ? 1 : 0,
      data.username,
      encryptedPassword,
      data.smtpHost,
      data.smtpPort,
      data.smtpSecure ? 1 : 0
    );
    return result.lastInsertRowid;
  });

  ipcMain.handle('get-accounts', () => {
    const accounts = db.prepare('SELECT * FROM accounts').all() as any[];
    return accounts.map(account => {
      if (safeStorage.isEncryptionAvailable()) {
        try {
          account.password = safeStorage.decryptString(Buffer.from(account.password, 'base64'));
        } catch (e) {
          console.error('Failed to decrypt password for account:', account.email);
        }
      }
      return account;
    });
  });

  ipcMain.handle('delete-account', (_, id) => {
    db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
    return true;
  });

  // Folders
  ipcMain.handle('get-folders', (_, accountId) => {
    return db.prepare('SELECT * FROM folders WHERE account_id = ? ORDER BY name').all(accountId);
  });

  ipcMain.handle('sync-folders', async (_, accountId) => {
    const account = db.prepare('SELECT protocol FROM accounts WHERE id = ?').get(accountId) as any;
    if (account.protocol === 'IMAP') {
      await syncImapFolders(accountId);
    } else if (account.protocol === 'POP3') {
      await syncPop3(accountId);
    }
    return true;
  });

  // Messages
  ipcMain.handle('get-messages', (_, folderId, limit = 50, offset = 0) => {
    return db.prepare(`
      SELECT * FROM messages WHERE folder_id = ? ORDER BY date DESC LIMIT ? OFFSET ?
    `).all(folderId, limit, offset);
  });

  ipcMain.handle('search-messages', (_, query) => {
    // Using FTS5 for advanced searching
    // We join with the original messages table to get all required fields
    return db.prepare(` 
      SELECT m.* FROM messages m
      JOIN messages_fts f ON m.id = f.rowid
      WHERE messages_fts MATCH ?
      ORDER BY rank
      LIMIT 100
    `).all(query);
  });

  ipcMain.handle('get-message', (_, messageId) => {
    return db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
  });

  ipcMain.handle('fetch-message-body', async (_, accountId, folderPath, uid) => {
    await fetchMessageBody(accountId, folderPath, uid);
    return true;
  });

  ipcMain.handle('mark-as-read', (_, messageId, isRead) => {
    db.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(isRead ? 1 : 0, messageId);
    return true;
  });

  ipcMain.handle('mark-as-flagged', (_, messageId, isFlagged) => {
    db.prepare('UPDATE messages SET is_flagged = ? WHERE id = ?').run(isFlagged ? 1 : 0, messageId);
    return true;
  });

  // SMTP
  ipcMain.handle('send-email', async (_, accountId, to, subject, body) => {
    const info = await sendEmail(accountId, to, subject, body);
    return info;
  });

  // POP3
  ipcMain.handle('sync-pop3', async (_, accountId, keepCopy = true) => {
    await syncPop3(accountId, keepCopy);
    return true;
  });

  // IMAP IDLE
  ipcMain.handle('start-idle', async (_, accountId, folderPath) => {
    await startIdle(accountId, folderPath);
    return true;
  });

  ipcMain.handle('stop-idle', (_, _accountId) => {
    // Placeholder for IDLE stop
    return true;
  });
}
