import { useState } from 'react'
import { Sidebar } from './renderer/src/components/Sidebar'
import { MessageList } from './renderer/src/components/MessageList'
import { ReaderView } from './renderer/src/components/ReaderView'
import { ComposeModal } from './renderer/src/components/ComposeModal'
import { Mail } from 'lucide-react'
import './App.css'

interface Message {
  id: number
  subject: string
  from_name: string
  from_address: string
  to_address: string
  date: string
  body_html: string
  body_text: string
  is_flagged: boolean
  snippet: string
  is_read: boolean
}

function App() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchResults, setSearchResults] = useState<Message[] | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)

  const handleSelectFolder = (folderId: number, accountId: number, folderPath: string) => {
    setSelectedFolderId(folderId)
    setSelectedAccountId(accountId)
    setSelectedMessage(null)
    setSearchResults(null)
  }

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message)
  }

  const handleSearch = async (query: string) => {
    if (query.trim().length > 2) {
      const results = await (window as any).api.searchMessages(query);
      setSearchResults(results);
      setSelectedFolderId(null);
    } else {
      setSearchResults(null);
    }
  }

  const handleComposeClick = () => {
    setIsComposeOpen(true)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
        <Mail size={24} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">OmniMail</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar onSelectFolder={handleSelectFolder} onSearch={handleSearch} />
        <MessageList 
          folderId={selectedFolderId} 
          searchResults={searchResults} 
          onSelectMessage={handleSelectMessage} 
        />
        <ReaderView message={selectedMessage} onBack={() => setSelectedMessage(null)} onCompose={handleComposeClick} />
      </div>

      <ComposeModal
        accountId={selectedAccountId}
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSent={() => {
          setSelectedMessage(null)
        }}
      />
    </div>
  )
}

export default App
