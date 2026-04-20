import { app, ipcMain, shell } from 'electron';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import db from './db';

export function setupAttachmentHandlers() {
  const attachmentDir = join(app.getPath('userData'), 'attachments');
  if (!existsSync(attachmentDir)) {
    mkdirSync(attachmentDir, { recursive: true });
  }

  ipcMain.handle('get-attachments', (_, messageId: number) => {
    return db.prepare('SELECT * FROM attachments WHERE message_id = ?').all(messageId);
  });

  ipcMain.handle('download-attachment', async (_, attachmentId: number) => {
    const attachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(attachmentId) as any;
    if (!attachment) throw new Error('Attachment not found');

    // In a real app, we would fetch the attachment from IMAP here if not cached.
    // For now, we assume it might already be in the database or needs to be "downloaded"
    // (logic to be integrated with IMAP fetch in next steps).
    return attachment.local_path;
  });

  ipcMain.handle('open-attachment', async (_, localPath: string) => {
    if (existsSync(localPath)) {
      await shell.openPath(localPath);
      return true;
    }
    return false;
  });
}

export function saveAttachmentLocally(messageId: number, filename: string, contentType: string, size: number, content: Buffer) {
  const attachmentDir = join(app.getPath('userData'), 'attachments', messageId.toString());
  if (!existsSync(attachmentDir)) {
    mkdirSync(attachmentDir, { recursive: true });
  }

  const localPath = join(attachmentDir, filename);
  writeFileSync(localPath, content);

  db.prepare(`
    INSERT INTO attachments (message_id, filename, content_type, size, local_path)
    VALUES (?, ?, ?, ?, ?)
  `).run(messageId, filename, contentType, size, localPath);

  return localPath;
}
