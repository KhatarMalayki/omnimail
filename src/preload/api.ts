import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Accounts
  addAccount: (data: any) => ipcRenderer.invoke('add-account', data),
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  deleteAccount: (id: number) => ipcRenderer.invoke('delete-account', id),

  // Folders
  getFolders: (accountId: number) => ipcRenderer.invoke('get-folders', accountId),
  syncFolders: (accountId: number) => ipcRenderer.invoke('sync-folders', accountId),

  // Messages
  getMessages: (folderId: number, limit?: number, offset?: number) =>
    ipcRenderer.invoke('get-messages', folderId, limit, offset),
  getMessage: (messageId: number) => ipcRenderer.invoke('get-message', messageId),
  fetchMessageBody: (accountId: number, folderPath: string, uid: number) =>
    ipcRenderer.invoke('fetch-message-body', accountId, folderPath, uid),
  markAsRead: (messageId: number, isRead: boolean) =>
    ipcRenderer.invoke('mark-as-read', messageId, isRead),
  markAsFlagged: (messageId: number, isFlagged: boolean) =>
    ipcRenderer.invoke('mark-as-flagged', messageId, isFlagged),

  // SMTP
  sendEmail: (accountId: number, to: string, subject: string, body: string) =>
    ipcRenderer.invoke('send-email', accountId, to, subject, body),

  // POP3
  syncPop3: (accountId: number, keepCopy?: boolean) =>
    ipcRenderer.invoke('sync-pop3', accountId, keepCopy),

  // IMAP IDLE
  startIdle: (accountId: number, folderPath: string) =>
    ipcRenderer.invoke('start-idle', accountId, folderPath),
  stopIdle: (accountId: number) => ipcRenderer.invoke('stop-idle', accountId),

  // Listeners
  onMessageReceived: (callback: (data: any) => void) => {
    ipcRenderer.on('message-received', (_, data) => callback(data));
  },
  onSyncProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('sync-progress', (_, data) => callback(data));
  }
};

contextBridge.exposeInMainWorld('api', api);
