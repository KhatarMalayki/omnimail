import POP3Client from 'poplib';
import { simpleParser } from 'mailparser';
import { safeStorage } from 'electron';
import db from './db';

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

export async function syncPop3(accountId: number, keepCopy: boolean = true) {
  const account = getDecryptedAccount(accountId);

  const client = new POP3Client(account.port, account.host, {
    tlserrs: false,
    enabletls: account.secure === 1,
    debug: false
  });

  return new Promise((resolve, reject) => {
    client.on('connect', () => {
      client.login(account.username, account.password);
    });

    client.on('login', (status, rawdata) => {
      if (status) {
        client.list();
      } else {
        reject(new Error('Login failed: ' + rawdata));
      }
    });

    client.on('list', (status, msgcount, msgnumber, data) => {
      if (status) {
        if (msgcount > 0) {
          fetchNext(1, msgcount);
        } else {
          client.quit();
        }
      }
    });

    async function fetchNext(current: number, total: number) {
      client.retr(current);
      client.once('retr', async (status, msgnumber, data) => {
        if (status) {
          const parsed = await simpleParser(data);
          const uid = parsed.messageId || `pop3-${accountId}-${msgnumber}-${parsed.date?.getTime()}`;
          
          const exists = db.prepare('SELECT 1 FROM pop3_uids WHERE account_id = ? AND uid = ?').get(accountId, uid);
          
          if (!exists) {
            const folder = db.prepare('SELECT id FROM folders WHERE account_id = ? AND name = "INBOX"').get(accountId) as { id: number };
            const folderId = folder?.id || (db.prepare('INSERT INTO folders (account_id, name, path) VALUES (?, "INBOX", "INBOX") RETURNING id').get(accountId) as { id: number }).id;

            db.prepare(`
              INSERT INTO messages (
                folder_id, uid, message_id, subject, from_name, from_address,
                to_address, date, snippet, body_html, body_text, size
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              folderId,
              msgnumber,
              parsed.messageId,
              parsed.subject,
              parsed.from?.value[0]?.name,
              parsed.from?.value[0]?.address,
              parsed.to?.value[0]?.address,
              parsed.date?.toISOString(),
              parsed.textAsHtml?.substring(0, 100),
              parsed.html || '',
              parsed.text || '',
              data.length
            );

            db.prepare('INSERT INTO pop3_uids (account_id, uid) VALUES (?, ?)').run(accountId, uid);

            if (!keepCopy) {
              client.dele(msgnumber);
            }
          }
        }

        if (current < total) {
          fetchNext(current + 1, total);
        } else {
          client.quit();
        }
      });
    }

    client.on('quit', (status) => {
      resolve(status);
    });

    client.on('error', (err) => {
      reject(err);
    });
  });
}
