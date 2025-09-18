"use client"

import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  message: string
  isUser?: boolean
  timestamp?: Date | string
  isTyping?: boolean
  references?: string[]
}

export function ChatMessage({ 
  message, 
  isUser = false, 
  timestamp, 
  isTyping = false, 
  references = [] 
}: ChatMessageProps) {
  const formatTime = (date: Date | string) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isTyping) {
    return (
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full">
          <Bot className="w-4 h-4 text-gray-400" />
        </div>
        <div className="bg-white/10 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs lg:max-w-md border border-white/10">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-start space-x-3 mb-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        isUser ? 'bg-purple-600' : 'bg-white/10'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-gray-400" />
        )}
      </div>
      <div className={`rounded-2xl px-4 py-3 max-w-xs lg:max-w-md border ${
        isUser 
          ? 'bg-purple-600 text-white rounded-tr-md border-purple-500/20' 
          : 'bg-white/10 text-gray-200 rounded-tl-md border-white/10'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        {references && references.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs opacity-80 mb-2">Referenced clauses:</p>
            <div className="space-y-1">
              {references.map((ref, index) => (
                <div key={index} className="text-xs opacity-70 flex items-center space-x-1">
                  <span className="w-1 h-1 bg-current rounded-full"></span>
                  <span>{ref}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {timestamp && (
          <p className={`text-xs mt-2 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  )
}