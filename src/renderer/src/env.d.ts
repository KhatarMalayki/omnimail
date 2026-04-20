interface Window {
  api: {
    addAccount: (data: any) => Promise<number>;
    getAccounts: () => Promise<any[]>;
    deleteAccount: (id: number) => Promise<boolean>;
    getFolders: (accountId: number) => Promise<any[]>;
    syncFolders: (accountId: number) => Promise<boolean>;
    getMessages: (folderId: number, limit?: number, offset?: number) => Promise<any[]>;
    searchMessages: (query: string) => Promise<any[]>;
    getMessage: (messageId: number) => Promise<any>;
    fetchMessageBody: (accountId: number, folderPath: string, uid: number) => Promise<boolean>;
    markAsRead: (messageId: number, isRead: boolean) => Promise<boolean>;
    markAsFlagged: (messageId: number, isFlagged: boolean) => Promise<boolean>;
    sendEmail: (accountId: number, to: string, subject: string, body: string) => Promise<any>;
    syncPop3: (accountId: number, keepCopy?: boolean) => Promise<boolean>;
    startIdle: (accountId: number, folderPath: string) => Promise<boolean>;
    stopIdle: (accountId: number) => Promise<boolean>;
    getAttachments: (messageId: number) => Promise<any[]>;
    downloadAttachment: (attachmentId: number) => Promise<string>;
    openAttachment: (localPath: string) => Promise<boolean>;
    onMessageReceived: (callback: (data: any) => void) => void;
    onSyncProgress: (callback: (data: any) => void) => void;
  };
}
