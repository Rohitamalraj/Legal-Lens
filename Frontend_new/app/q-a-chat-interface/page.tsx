"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { WorkflowProgress } from '@/components/workflow-progress'
import { ChatHeader } from '@/components/chat-header'
import { ChatArea } from '@/components/chat-area'
import { MessageInput } from '@/components/message-input'
import { SuggestedQuestions } from '@/components/suggested-questions'

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
        id: "doc_001",
        name: data.fileName,
        uploadDate: new Date().toISOString(),
        size: data.fileSize,
        type: "Legal Document",
        status: "completed",
        extractedText: data.extractedText
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
    if (!messageText.trim()) return

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

    // Simulate AI processing delay
    setTimeout(() => {
      setIsTyping(false)
      
      // Get AI response (mock)
      const aiResponse = mockAIResponses[messageText] || {
        content: `I understand you're asking about: "${messageText}"

Based on your legal document, I can provide specific insights about this topic. However, I need a moment to analyze the relevant sections of your document.

Could you please rephrase your question or be more specific about which aspect you'd like me to focus on? For example:
• Are you looking for risks or benefits?
• Do you need clarification on specific terms?
• Are you concerned about compliance requirements?

This will help me provide a more targeted and useful response.`,
        references: ["General Document Analysis"]
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        content: aiResponse.content,
        isUser: false,
        timestamp: new Date(),
        references: aiResponse.references
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 2000)
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
      <WorkflowProgress currentStep={3} />
      
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