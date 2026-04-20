import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, Search } from 'lucide-react';
import { AccountModal } from './AccountModal';

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
  onSearch: (query: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectFolder, onSearch }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [folders, setFolders] = useState<Record<number, Folder[]>>({});
  const [expandedAccounts, setExpandedAccounts] = useState<Set<number>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const data = await (window as any).api.getAccounts();
    setAccounts(data);
    for (const account of data) {
      loadFolders(account.id);
    }
  };

  const loadFolders = async (accountId: number) => {
    const data = await (window as any).api.getFolders(accountId);
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
    if (confirm('Are you sure you want to delete this account and all its local data?')) {
      await (window as any).api.deleteAccount(accountId);
      loadAccounts();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      onSearch(query);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col border-r border-gray-700">
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-gray-800 text-sm pl-10 pr-4 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button 
          onClick={() => setIsAccountModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Account
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {accounts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            No accounts added yet.
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="border-b border-gray-800">
              <div 
                className="flex items-center justify-between p-3 hover:bg-gray-800 cursor-pointer group transition-colors" 
                onClick={() => toggleAccount(account.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform duration-200 ${expandedAccounts.has(account.id) ? '' : '-rotate-90'}`} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs truncate text-gray-200">{account.email}</div>
                    <div className="text-[10px] text-gray-500">{account.protocol}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAccount(account.id);
                  }}
                  className="p-1.5 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Account"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {expandedAccounts.has(account.id) && (
                <div className="bg-gray-800/50 py-1">
                  {(folders[account.id] || []).map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => handleSelectFolder(folder.id, account.id, folder.path)}
                      className={`px-8 py-2 text-xs cursor-pointer flex justify-between items-center transition-colors ${
                        selectedFolder === folder.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      }`}
                    >
                      <span className="truncate">{folder.name}</span>
                      {folder.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {folder.unread_count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AccountModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
        onAdded={loadAccounts} 
      />
    </div>
  );
};
