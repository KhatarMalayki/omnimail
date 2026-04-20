import { Notification, BrowserWindow } from 'electron';
import { join } from 'path';

export function showNewEmailNotification(subject: string, from: string, messageId: number) {
  const notification = new Notification({
    title: 'New Email Received',
    body: `From: ${from}\nSubject: ${subject}`,
    silent: false,
    icon: join(__dirname, '../../resources/icon.png')
  });

  notification.on('click', () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const mainWindow = windows[0];
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      // In a real app, we would emit an IPC event to select the message
      mainWindow.webContents.send('select-message', messageId);
    }
  });

  notification.show();
}
