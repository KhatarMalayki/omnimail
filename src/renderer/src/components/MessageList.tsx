import React, { useState, useEffect } from 'react';
import { Star, Mail } from 'lucide-react';

interface Message {
  id: number;
  subject: string;
  from_name: string;
  from_address: string;
  date: string;
  snippet: string;
  is_read: boolean;
  is_flagged: boolean;
}

interface MessageListProps {
  folderId: number | null;
  onSelectMessage: (message: Message) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ folderId, onSelectMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folderId) {
      loadMessages();
    }
  }, [folderId]);

  const loadMessages = async () => {
    if (!folderId) return;
    setLoading(true);
    try {
      const data = await window.api.getMessages(folderId, 50, 0);
      setMessages(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessageId(message.id);
    onSelectMessage(message);
    if (!message.is_read) {
      window.api.markAsRead(message.id, true);
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
      );
    }
  };

  const toggleFlag = async (e: React.MouseEvent, messageId: number, isFlagged: boolean) => {
    e.stopPropagation();
    await window.api.markAsFlagged(messageId, !isFlagged);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, is_flagged: !isFlagged } : m))
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Messages</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">No messages</div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => handleSelectMessage(message)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                selectedMessageId === message.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              } ${!message.is_read ? 'bg-blue-100' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!message.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                    <div className="font-semibold text-gray-800 truncate">{message.from_name || message.from_address}</div>
                  </div>
                  <div className="text-sm text-gray-600 truncate mt-1">{message.subject}</div>
                  <div className="text-xs text-gray-500 truncate mt-1">{message.snippet}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(message.date)}</span>
                  <button
                    onClick={(e) => toggleFlag(e, message.id, message.is_flagged)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Star size={16} className={message.is_flagged ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
