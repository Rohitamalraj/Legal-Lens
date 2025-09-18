"use client"

import { useEffect, useRef } from 'react'
import { MessageCircle, Check } from 'lucide-react'
import { ChatMessage } from './chat-message'

interface Message {
  id: string | number
  content: string
  isUser: boolean
  timestamp: Date | string
  references?: string[]
}

interface ChatAreaProps {
  messages?: Message[]
  isTyping?: boolean
  isEmpty?: boolean
}

export function ChatArea({ messages = [], isTyping = false, isEmpty = false }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4 mx-auto">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Start Your Conversation
          </h3>
          <p className="text-gray-300 mb-6">
            Ask questions about your document to get detailed explanations, 
            clarifications, and insights powered by AI.
          </p>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Get instant answers to complex legal questions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Reference specific clauses and sections</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Understand risks and obligations</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{ maxHeight: 'calc(100vh - 300px)' }}
    >
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id || index}
          message={message.content}
          isUser={message.isUser}
          timestamp={message.timestamp}
          references={message.references}
        />
      ))}
      {isTyping && (
        <ChatMessage 
          isTyping={true} 
          message="" 
          timestamp={new Date().toISOString()} 
        />
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}