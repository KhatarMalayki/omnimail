import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Trash2, Reply } from 'lucide-react';

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

  useEffect(() => {
    if (message) {
      setIsFlagged(message.is_flagged);
    }
  }, [message]);

  if (!message) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
        Select a message to read
      </div>
    );
  }

  const handleToggleFlag = async () => {
    await window.api.markAsFlagged(message.id, !isFlagged);
    setIsFlagged(!isFlagged);
  };

  const formatDate = (dateStr: string) => {
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
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ChevronLeft size={20} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFlag}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Star size={20} className={isFlagged ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Trash2 size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{message.subject}</h1>

          <div className="bg-gray-50 p-4 rounded mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-gray-900">{message.from_name || message.from_address}</div>
                <div className="text-sm text-gray-600">&lt;{message.from_address}&gt;</div>
              </div>
              <div className="text-sm text-gray-500">{formatDate(message.date)}</div>
            </div>
            <div className="text-sm text-gray-600 mt-2">To: {message.to_address}</div>
          </div>

          <div className="prose prose-sm max-w-none">
            {message.body_html ? (
              <iframe
                srcDoc={`<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0;">${message.body_html}</body></html>`}
                className="w-full border-0 rounded"
                style={{ height: '400px' }}
                sandbox={{ allow: [] }}
              />
            ) : (
              <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded">{message.body_text}</pre>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex gap-2">
        <button
          onClick={onCompose}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
        >
          <Reply size={16} />
          Reply
        </button>
      </div>
    </div>
  );
};
