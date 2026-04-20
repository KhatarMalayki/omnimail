import { ImapFlow } from 'imapflow';
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
      db.prepare(`
        INSERT INTO folders (account_id, name, path, attributes)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(account_id, path) DO UPDATE SET
          name = excluded.name,
          attributes = excluded.attributes
      `).run(
        accountId,
        folder.name,
        folder.path,
        JSON.stringify(folder.attributes)
      );
    }
  } finally {
    await client.logout();
  }
}
