"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from "next/dynamic";
import { SiteHeader } from "@/components/site-header"
import { apiService } from '@/lib/api'

// Lazy load components
const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse"></div>
});

const WorkflowProgress = dynamic(() => import('@/components/workflow-progress').then(mod => ({ default: mod.WorkflowProgress })), {
  loading: () => <div className="h-16 animate-pulse bg-blue-100 rounded-lg"></div>
});

const ChatHeader = dynamic(() => import('@/components/chat-header').then(mod => ({ default: mod.ChatHeader })), {
  loading: () => <div className="h-20 animate-pulse bg-gray-100 rounded-lg"></div>
});

const ChatArea = dynamic(() => import('@/components/chat-area').then(mod => ({ default: mod.ChatArea })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-50 rounded-lg"></div>
});

const MessageInput = dynamic(() => import('@/components/message-input').then(mod => ({ default: mod.MessageInput })), {
  loading: () => <div className="h-20 animate-pulse bg-gray-100 rounded-lg"></div>
});

const SuggestedQuestions = dynamic(() => import('@/components/suggested-questions').then(mod => ({ default: mod.SuggestedQuestions })), {
  loading: () => <div className="h-32 animate-pulse bg-gray-100 rounded-lg"></div>
});

interface DocumentData {
  id: string
  name: string
  uploadDate: string
  size: number | string
  type: string
  status: string
  extractedText: string
}

interface Message {
  id: string | number
  content: string
  isUser: boolean
  timestamp: Date
  references?: string[]
}

interface AIResponse {
  content: string
  references: string[]
}

export default function QAChatInterfacePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [documentData, setDocumentData] = useState<DocumentData | null>(null)

  // Mock AI responses with references
  const mockAIResponses: Record<string, AIResponse> = {
    "What are the key terms and conditions?": {
      content: `Based on your Service Agreement, here are the key terms and conditions:

• **Service Duration**: 12-month initial term with automatic renewal
• **Payment Terms**: Net 30 days from invoice date
• **Service Level**: 99.5% uptime guarantee with penalties for non-compliance
• **Intellectual Property**: Client retains ownership of data, vendor owns developed tools
• **Confidentiality**: Mutual NDA provisions for 5 years post-termination
• **Limitation of Liability**: Capped at 12 months of fees paid

These terms establish the foundation of your business relationship with clear expectations and protections.`,
      references: ["Section 2.1 - Term and Renewal", "Section 4.3 - Payment Terms", "Section 6.1 - Service Levels"]
    },
    "Are there any potential risks I should be aware of?": {
      content: `I've identified several potential risks in your agreement:

🔴 **High Risk**:
• Automatic renewal clause without clear opt-out process
• Broad indemnification requirements on your part

🟡 **Medium Risk**:
• Limited liability cap may not cover actual damages
• Termination requires 90-day notice period
• Data retention policy unclear after termination

🟢 **Low Risk**:
• Standard confidentiality provisions
• Reasonable service level agreements

I recommend reviewing the automatic renewal terms and negotiating clearer termination procedures.`,
      references: ["Section 2.2 - Automatic Renewal", "Section 8.4 - Indemnification", "Section 9.1 - Limitation of Liability"]
    },
    "What are my obligations under this contract?": {
      content: `Your primary obligations under this Service Agreement include:

**Payment Obligations**:
• Pay invoices within 30 days of receipt
• Cover any applicable taxes and fees

**Cooperation Requirements**:
• Provide necessary access and information for service delivery
• Designate a primary contact for coordination
• Respond to vendor requests within 5 business days

**Compliance Duties**:
• Maintain confidentiality of vendor's proprietary information
• Use services only for lawful business purposes
• Provide 90-day written notice for termination

**Data and Security**:
• Ensure data accuracy for processing
• Comply with security protocols and access controls

These obligations are reasonable and standard for this type of agreement.`,
      references: ["Section 3.1 - Client Obligations", "Section 4.1 - Payment Obligations", "Section 7.2 - Confidentiality"]
    }
  }

  // Load document data from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem('uploadedDocument')
    if (storedData) {
      const data = JSON.parse(storedData)
      setDocumentData({
        id: data.id || "doc_001", // Use real document ID from API
        name: data.fileName,
        uploadDate: data.uploadTime || new Date().toISOString(),
        size: data.fileSize,
        type: data.documentType || "Legal Document",
        status: "completed",
        extractedText: data.analysis?.summary || ""
      })
    } else {
      // Redirect back to upload if no document data
      router.push('/document-upload')
    }
  }, [router])

  useEffect(() => {
    // Add welcome message when component mounts
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Hello! I'm here to help you understand your legal document. I can answer questions about terms, risks, obligations, and any specific clauses you'd like clarified.

Feel free to ask me anything about your document, or choose from the suggested questions below to get started.`,
      isUser: false,
      timestamp: new Date(),
      references: []
    }
    setMessages([welcomeMessage])
  }, [])

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !documentData) return

    // Hide suggestions after first message
    setShowSuggestions(false)
    setIsLoading(true)

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      content: messageText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])

    // Show typing indicator
    setIsTyping(true)

    try {
      // Send message to real chat API
      const chatResult = await apiService.sendChatMessage(documentData.id, messageText)
      
      setIsTyping(false)

      if (chatResult.success && chatResult.data) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: chatResult.data.response,
          isUser: false,
          timestamp: new Date(),
          references: chatResult.data.sources || []
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        // Fallback error message
        const errorMessage: Message = {
          id: Date.now() + 1,
          content: `I apologize, but I encountered an error processing your question: "${messageText}". ${chatResult.error || 'Please try rephrasing your question or try again later.'}`,
          isUser: false,
          timestamp: new Date(),
          references: []
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      setIsTyping(false)
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: `I'm sorry, I'm having trouble connecting to analyze your document right now. Please check your connection and try again.`,
        isUser: false,
        timestamp: new Date(),
        references: []
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleQuestionClick = (questionText: string) => {
    handleSendMessage(questionText)
  }

  const handleClearChat = () => {
    setMessages([])
    setShowSuggestions(true)
    // Re-add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Hello! I'm here to help you understand your legal document. I can answer questions about terms, risks, obligations, and any specific clauses you'd like clarified.

Feel free to ask me anything about your document, or choose from the suggested questions below to get started.`,
      isUser: false,
      timestamp: new Date(),
      references: []
    }
    setMessages([welcomeMessage])
  }

  const handleDownloadDocument = () => {
    // Mock download functionality
    if (documentData) {
      const reportData = {
        document: documentData,
        chatHistory: messages,
        generatedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${documentData.name.replace(/\.[^/.]+$/, '')}_Chat_Report.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleRestartAnalysis = () => {
    sessionStorage.removeItem('uploadedDocument')
    router.push('/document-upload')
  }

  if (!documentData) {
    return (
      <main className="min-h-[100dvh] text-white">
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading chat interface...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] text-white">
      <SiteHeader />
      <WorkflowProgress currentStep={4} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Centered Chat Area */}
          <div className="flex flex-col min-h-[calc(100vh-200px)]">
            <ChatHeader 
              document={documentData}
              onClearChat={handleClearChat}
              messageCount={messages.length}
            />
            
            {showSuggestions && (
              <SuggestedQuestions 
                onQuestionClick={handleQuestionClick}
                isVisible={showSuggestions}
              />
            )}
            
            <ChatArea 
              messages={messages}
              isTyping={isTyping}
              isEmpty={messages.length === 0}
            />
            
            <MessageInput 
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              disabled={isTyping}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}