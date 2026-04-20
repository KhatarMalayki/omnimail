import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

interface Account {
  id: number;
  email: string;
  display_name: string;
  protocol: string;
}

interface Folder {
  id: number;
  name: string;
  path: string;
  unread_count: number;
}

interface SidebarProps {
  onSelectFolder: (folderId: number, accountId: number, folderPath: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectFolder }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [folders, setFolders] = useState<Record<number, Folder[]>>({});
  const [expandedAccounts, setExpandedAccounts] = useState<Set<number>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const data = await window.api.getAccounts();
    setAccounts(data);
    for (const account of data) {
      loadFolders(account.id);
    }
  };

  const loadFolders = async (accountId: number) => {
    const data = await window.api.getFolders(accountId);
    setFolders((prev) => ({ ...prev, [accountId]: data }));
  };

  const toggleAccount = (accountId: number) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const handleSelectFolder = (folderId: number, accountId: number, folderPath: string) => {
    setSelectedFolder(folderId);
    onSelectFolder(folderId, accountId, folderPath);
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (confirm('Delete this account?')) {
      await window.api.deleteAccount(accountId);
      loadAccounts();
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
          <Plus size={18} />
          Add Account
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {accounts.map((account) => (
          <div key={account.id} className="border-b border-gray-700">
            <div className="flex items-center justify-between p-3 hover:bg-gray-800 cursor-pointer" onClick={() => toggleAccount(account.id)}>
              <div className="flex items-center gap-2 flex-1">
                <ChevronDown size={16} className={`transition-transform ${expandedAccounts.has(account.id) ? '' : '-rotate-90'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{account.email}</div>
                  <div className="text-xs text-gray-400">{account.protocol}</div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAccount(account.id);
                }}
                className="p-1 hover:bg-red-600 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {expandedAccounts.has(account.id) && (
              <div className="bg-gray-800">
                {(folders[account.id] || []).map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => handleSelectFolder(folder.id, account.id, folder.path)}
                    className={`px-6 py-2 text-sm cursor-pointer flex justify-between items-center ${
                      selectedFolder === folder.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`}
                  >
                    <span>{folder.name}</span>
                    {folder.unread_count > 0 && <span className="bg-red-500 text-xs px-2 py-1 rounded-full">{folder.unread_count}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
