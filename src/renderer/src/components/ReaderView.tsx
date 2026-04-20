import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Trash2, Reply, Paperclip, Download, ExternalLink } from 'lucide-react';

interface Attachment {
  id: number;
  filename: string;
  content_type: string;
  size: number;
  local_path: string;
}

interface Message {
  id: number;
  subject: string;
  from_name: string;
  from_address: string;
  to_address: string;
  date: string;
  body_html: string;
  body_text: string;
  is_flagged: boolean;
}

interface ReaderViewProps {
  message: Message | null;
  onBack: () => void;
  onCompose: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({ message, onBack, onCompose }) => {
  const [isFlagged, setIsFlagged] = useState(message?.is_flagged || false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (message) {
      setIsFlagged(message.is_flagged);
      loadAttachments();
    }
  }, [message]);

  const loadAttachments = async () => {
    if (message) {
      const data = await (window as any).api.getAttachments(message.id);
      setAttachments(data);
    }
  };

  if (!message) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
        Select a message to read
      </div>
    );
  }

  const handleToggleFlag = async () => {
    await (window as any).api.markAsFlagged(message.id, !isFlagged);
    setIsFlagged(!isFlagged);
  };

  const handleOpenAttachment = async (localPath: string) => {
    await (window as any).api.openAttachment(localPath);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
          <ChevronLeft size={18} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFlag}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Star size={18} className={isFlagged ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Trash2 size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">{message.subject}</h1>

          <div className="bg-gray-50 p-4 rounded mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-gray-900 text-sm">{message.from_name || message.from_address}</div>
                <div className="text-xs text-gray-600">&lt;{message.from_address}&gt;</div>
              </div>
              <div className="text-xs text-gray-500">{formatDate(message.date)}</div>
            </div>
            <div className="text-xs text-gray-600 mt-2">To: {message.to_address}</div>
          </div>

          <div className="prose prose-sm max-w-none">
            {message.body_html ? (
              <iframe
                srcDoc={`<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; font-size: 14px;">${message.body_html}</body></html>`}
                className="w-full border-0 rounded min-h-[400px]"
                sandbox=""
              />
            ) : (
              <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded text-sm font-sans">{message.body_text}</pre>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold text-sm">
                <Paperclip size={16} />
                Attachments ({attachments.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 group transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded">
                        <Paperclip size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">{att.filename}</div>
                        <div className="text-[10px] text-gray-500">{formatSize(att.size)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => handleOpenAttachment(att.local_path)}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                        title="Open File"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Download">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex gap-2">
        <button
          onClick={onCompose}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm"
        >
          <Reply size={16} />
          Reply
        </button>
      </div>
    </div>
  );
};
