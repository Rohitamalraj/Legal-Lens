"use client"

import { useRouter } from 'next/navigation'
import { MessageCircle, ArrowLeft, MessageSquare, Trash2, Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocumentData {
  id: string
  name: string
  uploadDate: string
  size: number | string
  type: string
  status: string
}

interface ChatHeaderProps {
  document: DocumentData | null
  onClearChat: () => void
  messageCount?: number
}

export function ChatHeader({ document, onClearChat, messageCount = 0 }: ChatHeaderProps) {
  const router = useRouter()

  const handleBackToSummary = () => {
    router.push('/document-summary')
  }

  const handleNewDocument = () => {
    router.push('/document-upload')
  }

  return (
    <div className="liquid-glass border-b border-white/10 bg-white/5 backdrop-blur-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <div>
              <h1 className="font-semibold text-white">Document Q&A</h1>
              <p className="text-sm text-gray-300">
                {document?.name || 'Ask questions about your document'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-400">
            <MessageSquare className="w-4 h-4" />
            <span>{messageCount} messages</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToSummary}
            className="hidden sm:flex bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClearChat}
            className="hidden sm:flex bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear Chat
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewDocument}
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <Upload className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">New Document</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Mobile actions */}
      <div className="sm:hidden mt-3 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearChat}
          className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Chat
        </Button>
      </div>
    </div>
  )
}