"use client"

import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VoiceMessageButton } from '@/components/voice-message-button'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
}

export function MessageInput({ onSendMessage, isLoading = false, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleVoiceMessage = (transcript: string, audioBlob?: Blob) => {
    console.log('📝 Message input received transcript:', transcript);
    if (transcript.trim()) {
      console.log('📝 Setting message to:', transcript.trim());
      setMessage(transcript.trim())
      // Don't auto-send - let user review and send manually
    }
  }

  return (
    <div className="border-t border-white/10 liquid-glass bg-white/5 backdrop-blur-xl p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            placeholder="Ask AI..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || isLoading}
            rows={1}
            className="w-full resize-none rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
            style={{ 
              minHeight: '48px',
              maxHeight: '120px',
              overflowY: message.length > 100 ? 'auto' : 'hidden'
            }}
          />
        </div>

        {/* Buttons Container - Properly aligned */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Voice Message Button */}
          <VoiceMessageButton
            onVoiceMessage={handleVoiceMessage}
            disabled={disabled || isLoading}
            size="default"
            variant="outline"
            language="en-US"
            autoSend={false}
            showLabel={true} // Text will be hidden on mobile via responsive classes
            className="h-12 w-12 sm:w-auto sm:px-4"
          />
          
          <Button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            className="bg-purple-600 hover:bg-purple-500 h-12 w-12 sm:w-auto sm:px-4"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Ask AI</span>
              </>
            )}
          </Button>
        </div>
      </form>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>Press Enter to send, Shift+Enter for new line, or use voice input</span>
        <span>{message.length}/500</span>
      </div>
    </div>
  )
}