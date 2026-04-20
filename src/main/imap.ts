import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import db from './db';

export async function syncImapFolders(accountId: number) {
  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId) as any;
  if (!account) throw new Error('Account not found');

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

  await client.connect();
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
        JSON.stringify(folder.attributes)
      ) as { id: number };

      await syncImapMessages(client, result.id, folder.path);
    }
  } finally {
    await client.logout();
  }
}

async function syncImapMessages(client: ImapFlow, folderId: number, path: string) {
  const lock = await client.getMailboxLock(path);
  try {
    for await (const msg of client.fetch('1:*', {
      uid: true,
      flags: true,
      size: true,
      envelope: true,
      source: true
    })) {
      const parsed = await simpleParser(msg.source);
      db.prepare(`
        INSERT INTO messages (
          folder_id, uid, message_id, subject, from_name, from_address,
          to_address, date, snippet, body_html, body_text, is_read, size
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(folder_id, uid) DO NOTHING
      `).run(
        folderId,
        msg.uid,
        msg.envelope.messageId,
        msg.envelope.subject,
        msg.envelope.from[0]?.name,
        msg.envelope.from[0]?.address,
        msg.envelope.to[0]?.address,
        msg.envelope.date?.toISOString(),
        parsed.textAsHtml?.substring(0, 100),
        parsed.html || '',
        parsed.text || '',
        msg.flags.has('\\Seen') ? 1 : 0,
        msg.size
      );
    }
  } finally {
    lock.release();
  }
}
