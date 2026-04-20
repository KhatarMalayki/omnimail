import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { safeStorage } from 'electron';
import db from './db';
import { saveAttachmentLocally } from './attachments';
import { showNewEmailNotification } from './notifications';

async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

function getDecryptedAccount(accountId: number) {
  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId) as any;
  if (!account) throw new Error('Account not found');

  if (safeStorage.isEncryptionAvailable()) {
    try {
      account.password = safeStorage.decryptString(Buffer.from(account.password, 'base64'));
    } catch (e) {
      console.error('Failed to decrypt password for account:', account.email);
    }
  }
  return account;
}

export async function syncImapFolders(accountId: number) {
  const account = getDecryptedAccount(accountId);

  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: account.secure === 1,
    auth: {
      user: account.username,
      pass: account.password
    },
    logger: false
  });

  await withRetry(() => client.connect());
  try {
    const list = await client.list();
    for (const folder of list) {
      const result = db.prepare(`
        INSERT INTO folders (account_id, name, path, attributes)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(account_id, path) DO UPDATE SET
          name = excluded.name,
          attributes = excluded.attributes
        RETURNING id
      `).get(
        accountId,
        folder.name,
        folder.path,
        JSON.stringify(Array.from(folder.attributes))
      ) as { id: number };

      await syncImapMessages(client, result.id, folder.path);
    }
  } finally {
    await client.logout();
  }
}

export async function startIdle(accountId: number, folderPath: string) {
  const account = getDecryptedAccount(accountId);
  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: account.secure === 1,
    auth: { user: account.username, pass: account.password },
    logger: false
  });

  await withRetry(() => client.connect());
  const lock = await client.getMailboxLock(folderPath);
  
  client.on('exists', async () => {
    const folder = db.prepare('SELECT id FROM folders WHERE account_id = ? AND path = ?').get(accountId, folderPath) as { id: number };
    if (folder) {
      await syncImapMessages(client, folder.id, folderPath, true);
    }
  });

  // Keep connection alive
  return { client, lock };
}

async function syncImapMessages(client: ImapFlow, folderId: number, path: string, notify: boolean = false) {
  const lock = await client.getMailboxLock(path);
  try {
    for await (const msg of client.fetch('1:*', {
      uid: true,
      flags: true,
      size: true,
      envelope: true
    })) {
      const from = msg.envelope.from && msg.envelope.from.length > 0 ? msg.envelope.from[0] : null;
      const to = msg.envelope.to && msg.envelope.to.length > 0 ? msg.envelope.to[0] : null;

      const isNew = db.prepare(`
        INSERT INTO messages (
          folder_id, uid, message_id, subject, from_name, from_address,
          to_address, date, is_read, size
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(folder_id, uid) DO UPDATE SET
          is_read = excluded.is_read
        RETURNING id
      `).get(
        folderId,
        msg.uid,
        msg.envelope.messageId,
        msg.envelope.subject,
        from?.name || '',
        from?.address || '',
        to?.address || '',
        msg.envelope.date ? msg.envelope.date.toISOString() : new Date().toISOString(),
        msg.flags.has('\\Seen') ? 1 : 0,
        msg.size
      ) as { id: number };

      if (notify && isNew && !msg.flags.has('\\Seen')) {
        showNewEmailNotification(
          msg.envelope.subject || '(No Subject)',
          from?.name || from?.address || 'Unknown',
          isNew.id
        );
      }
    }
  } finally {
    lock.release();
  }
}

export async function fetchMessageBody(accountId: number, folderPath: string, uid: number) {
  const account = getDecryptedAccount(accountId);
  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: account.secure === 1,
    auth: { user: account.username, pass: account.password },
    logger: false
  });

  await withRetry(() => client.connect());
  const lock = await client.getMailboxLock(folderPath);
  try {
    const msg = await client.fetchOne(uid.toString(), { source: true }, { uid: true });
    if (msg && msg.source) {
      const parsed = await simpleParser(msg.source);
      
      // Get message ID from DB
      const dbMsg = db.prepare('SELECT id FROM messages WHERE folder_id IN (SELECT id FROM folders WHERE account_id = ? AND path = ?) AND uid = ?').get(accountId, folderPath, uid) as { id: number };
      
      if (dbMsg) {
        // Update body
        db.prepare(`
          UPDATE messages SET
            body_html = ?,
            body_text = ?,
            snippet = ?
          WHERE id = ?
        `).run(
          parsed.html || '',
          parsed.text || '',
          parsed.textAsHtml ? parsed.textAsHtml.substring(0, 100) : '',
          dbMsg.id
        );

        // Save attachments
        if (parsed.attachments) {
          for (const att of parsed.attachments) {
            saveAttachmentLocally(
              dbMsg.id,
              att.filename || 'unnamed',
              att.contentType,
              att.size,
              att.content
            );
          }
        }
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }
}
