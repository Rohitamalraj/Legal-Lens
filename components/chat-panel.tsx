"use client"

import { useState, useEffect } from "react"

type Msg = { role: "user" | "assistant"; text: string; timestamp?: Date; confidence?: number }

export function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Upload a legal document first, then ask me anything about it...", timestamp: new Date() }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [documentName, setDocumentName] = useState<string>("")

  // Check for uploaded documents
  useEffect(() => {
    const checkForDocument = async () => {
      console.log('=== CHAT PANEL DOCUMENT CHECK ===');
      if (typeof window !== 'undefined') {
        const storedDocId = localStorage.getItem('currentDocumentId')
        console.log('Stored document ID from localStorage:', storedDocId);
        if (storedDocId) {
          console.log('Setting document ID in state:', storedDocId);
          setDocumentId(storedDocId)
          fetchDocumentInfo(storedDocId)
        } else {
          console.log('No document ID found in localStorage');
        }
      } else {
        console.log('Window not available (SSR)');
      }
    }

    checkForDocument()

    // Listen for document upload events
    const handleDocumentUploaded = (event: CustomEvent) => {
      console.log('=== DOCUMENT UPLOADED EVENT ===');
      const document = event.detail
      console.log('Document received from upload event:', document);
      console.log('Document ID:', document?.id);
      console.log('Document filename:', document?.filename);
      
      // Clear any old document ID from localStorage first
      localStorage.removeItem('currentDocumentId');
      
      setDocumentId(document.id)
      setDocumentName(document.filename)
      localStorage.setItem('currentDocumentId', document.id)
      
      setMessages([{
        role: "assistant", 
        text: `Great! I've analyzed your document "${document.filename}". You can now ask me questions about it. For example: "What are the key risks?" or "Who are the parties involved?"`,
        timestamp: new Date()
      }])
      console.log('Document ID set in state:', document.id);
      console.log('Updated localStorage with new document ID');
    }

    window.addEventListener('documentUploaded', handleDocumentUploaded as EventListener)

    return () => {
      window.removeEventListener('documentUploaded', handleDocumentUploaded as EventListener)
    }
  }, [])

  const fetchDocumentInfo = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents?id=${docId}`)
      const result = await response.json()
      
      if (result.success && result.document) {
        setDocumentName(result.document.filename)
        setMessages([{
          role: "assistant", 
          text: `I have your document "${result.document.filename}" ready for analysis. What would you like to know about it?`,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Error fetching document info:', error)
    }
  }

  const handleSendClick = () => {
    console.log('🔥 SEND BUTTON CLICKED 🔥');
    console.log('Button click timestamp:', new Date().toISOString());
    console.log('Current input value:', input);
    console.log('Input trimmed:', input.trim());
    console.log('Input length:', input.trim().length);
    console.log('Document ID available:', !!documentId);
    console.log('Is loading:', isLoading);
    onSend();
  }

  const onSend = async () => {
    console.log('=== CHAT PANEL SEND MESSAGE ===');
    console.log('Input value:', input.trim());
    console.log('Current document ID in state:', documentId);
    console.log('Current document name in state:', documentName);
    
    if (!input.trim()) return
    
    // Check localStorage as fallback if no document ID in state
    let activeDocumentId = documentId;
    if (!activeDocumentId && typeof window !== 'undefined') {
      console.log('No document ID in state, checking localStorage...');
      const storedDocId = localStorage.getItem('currentDocumentId');
      console.log('Document ID from localStorage:', storedDocId);
      
      if (storedDocId) {
        activeDocumentId = storedDocId;
        setDocumentId(storedDocId);
        console.log('Using document ID from localStorage:', storedDocId);
        
        // Try to fetch document info
        try {
          const response = await fetch(`/api/documents?id=${storedDocId}`);
          const result = await response.json();
          if (result.success && result.document) {
            setDocumentName(result.document.filename || 'Document');
            console.log('Loaded document name from API:', result.document.filename);
          }
        } catch (error) {
          console.error('Error fetching document info:', error);
        }
      }
    }
    
    if (!activeDocumentId) {
      console.log('No document ID available - showing upload message');
      setMessages(prev => [...prev, 
        { role: "user", text: input.trim(), timestamp: new Date() },
        { role: "assistant", text: "Please upload a legal document first before asking questions.", timestamp: new Date() }
      ])
      setInput("")
      return
    }

    setIsLoading(true)
    const userMsg: Msg = { role: "user", text: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    
    const currentQuery = input.trim()
    setInput("")

    try {
      console.log('Sending chat request to API...');
      console.log('Request payload:', {
        documentId: activeDocumentId,
        query: currentQuery
      });
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: activeDocumentId,
          query: currentQuery
        }),
      })

      console.log('Response status:', response.status);
      const result = await response.json()
      console.log('Response result:', result);

      if (!result.success) {
        throw new Error(result.error)
      }

      const assistantMsg: Msg = {
        role: "assistant",
        text: result.response,
        timestamp: new Date(),
        confidence: result.confidence
      }

      setMessages(prev => [...prev, assistantMsg])

    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg: Msg = {
        role: "assistant",
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log('⌨️ KEY PRESSED:', e.key);
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('🚀 ENTER KEY PRESSED - SENDING MESSAGE');
      e.preventDefault()
      onSend()
    }
  }



  return (
    <div className="rounded-lg bg-white p-4 card-shadow" role="region" aria-label="Contract Q&A">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold" style={{ color: "var(--color-brand)" }}>
          Interactive Q&amp;A
        </h3>
        {documentName && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {documentName}
          </span>
        )}
      </div>
      
      <div
        className="h-48 overflow-y-auto border rounded-md p-3 space-y-3"
        style={{ borderColor: "rgba(55,65,81,0.15)" }}
      >
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={[
                  "inline-block px-3 py-2 rounded-md text-sm max-w-[80%]",
                  m.role === "user" ? "text-white" : ""
                ].join(" ")}
                style={{
                  background:
                    m.role === "user"
                      ? "linear-gradient(135deg, var(--color-brand) 0%, var(--color-electric) 100%)"
                      : "rgba(30,58,138,0.08)",
                }}
              >
                <div>{m.text}</div>
                {m.confidence && (
                  <div className="text-xs opacity-75 mt-1">
                    Confidence: {Math.round(m.confidence * 100)}%
                  </div>
                )}
              </div>
            </div>
            {m.timestamp && (
              <div className={`text-xs text-gray-400 mt-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                {m.timestamp.toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div
              className="inline-block px-3 py-2 rounded-md text-sm"
              style={{ background: "rgba(30,58,138,0.08)" }}
            >
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span>Analyzing your question...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            console.log('📝 INPUT CHANGED:', e.target.value);
            setInput(e.target.value);
          }}
          placeholder={documentId ? "Ask me about your document..." : "Upload a document first..."}
          className="flex-1 rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "rgba(55,65,81,0.15)" }}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          aria-label="Type your question"
        />
        <button
          onClick={handleSendClick}
          disabled={isLoading || !documentId || !input.trim()}
          className="rounded-md px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-electric) 100%)",
          }}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-600">
        {documentId 
          ? 'Example: "What are the key risks?" or "What happens if I break this lease early?"'
          : 'Upload a legal document to start asking questions about it'
        }
      </p>
    </div>
  )
}
