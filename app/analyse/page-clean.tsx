'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, MessageSquare, Send, User, Bot } from 'lucide-react'

export default function AnalysePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', message: string}[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [headerScrollState, setHeaderScrollState] = useState(false)
  const [mobileNavVisible, setMobileNavVisible] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const navigateToSection = (sectionId: string) => {
    setMobileNavVisible(false)
    setTimeout(() => {
      if (sectionId === 'home') {
        window.location.href = '/'
      } else {
        window.location.href = `/#${sectionId}`
      }
    }, 100)
  }

  // Mock analysis data
  const mockAnalysis = {
    originalText: "The Tenant agrees to pay the Landlord a monthly rent of ₹15,000, due on or before the 5th day of each month. A late fee of ₹500 shall be charged if payment is delayed beyond the due date. The Tenant is responsible for utility bills including electricity, water, and internet. The Lease term shall begin on 1st September 2025 and terminate on 31st August 2026. Either party may terminate this agreement with a 60-day written notice.",
    plainEnglishSummary: [
      { emoji: "🏠", text: "Rent: ₹15,000 per month, due before the 5th." },
      { emoji: "⏰", text: "Late Fee: ₹500 if you miss the deadline." },
      { emoji: "💡", text: "Utilities: Tenant pays electricity, water, internet." },
      { emoji: "📅", text: "Duration: Sept 1, 2025 → Aug 31, 2026." },
      { emoji: "📜", text: "Termination: Either side can end it with 60 days' notice." }
    ],
    riskRadar: [
      { level: 'high', emoji: '🔴', text: 'Late fee applies if you pay after the 5th.' },
      { level: 'medium', emoji: '🟡', text: 'You must pay all utility bills — make sure this is affordable.' },
      { level: 'low', emoji: '🟢', text: 'Standard 1-year lease with 60-day exit clause (fair).' }
    ]
  }

  const mockQAResponses: {[key: string]: string} = {
    "what happens if i don't pay rent on time": "You'll be charged ₹500 as a late fee for payments after the 5th of each month.",
    "when does the lease end": "The lease terminates on 31st August 2026.",
    "who pays for utilities": "As the tenant, you are responsible for paying electricity, water, and internet bills.",
    "how can i terminate the lease": "Either you or the landlord can terminate the agreement by providing 60 days' written notice.",
    "what is the monthly rent": "The monthly rent is ₹15,000, which must be paid on or before the 5th of each month."
  }

  const handleFileUpload = async () => {
    if (!uploadedFile) return
    
    setIsAnalyzing(true)
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsAnalyzing(false)
    setAnalysisComplete(true)
  }

  const handleFileSelect = (file: File) => {
    setUploadedFile(file)
    setAnalysisComplete(false)
    setChatMessages([])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return

    const userMessage = currentMessage.toLowerCase().trim()
    setChatMessages(prev => [...prev, { role: 'user', message: currentMessage }])

    // Find matching response
    const response = Object.entries(mockQAResponses).find(([question]) => 
      userMessage.includes(question) || question.includes(userMessage)
    )?.[1] || "I can help you understand this document better. Try asking about rent, utilities, lease duration, or termination conditions."

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', message: response }])
    }, 1000)

    setCurrentMessage('')
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-4 z-50 mx-4 rounded-full bg-background/70 backdrop-blur-xl border border-border shadow-2xl">
        <div className="flex items-center justify-between px-8 py-4">
          <a href="/" className="text-foreground font-bold text-xl tracking-tight">
            Legal Lens
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="/" 
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Home
            </a>
            <a 
              href="/analyse" 
              className="text-foreground bg-primary/10 px-4 py-2 rounded-lg border border-primary/20"
            >
              Analyse
            </a>
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileNavVisible(!mobileNavVisible)}
            className="md:hidden flex flex-col gap-1 p-2"
            aria-label="Toggle mobile menu"
          >
            <span className="w-6 h-0.5 bg-foreground transition-all"></span>
            <span className="w-6 h-0.5 bg-foreground transition-all"></span>
            <span className="w-6 h-0.5 bg-foreground transition-all"></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileNavVisible && (
          <div className="md:hidden border-t border-border">
            <div className="px-8 py-4 space-y-4">
              <a 
                href="/" 
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileNavVisible(false)}
              >
                Home
              </a>
              <a 
                href="/analyse" 
                className="block text-foreground bg-primary/10 px-4 py-2 rounded-lg border border-primary/20"
                onClick={() => setMobileNavVisible(false)}
              >
                Analyse
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 pt-16 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Legal Document <span className="text-blue-600">Analysis</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Upload your legal document and understand it in <span className="text-blue-600 font-semibold">plain English</span> - no more legal jargon!
            </p>
          </motion.div>

          {/* File Upload Section */}
          {!analysisComplete && (
            <motion.div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-8 ${
                dragOver ? 'border-blue-400 bg-blue-50/5' : 'border-border bg-card'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-4">
                <Upload className="mx-auto h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {uploadedFile ? uploadedFile.name : 'Upload Legal Document'}
              </h3>
              <p className="text-muted-foreground mb-6">
                Drag and drop your legal document here (PDF, image, or scanned copy), or click to browse
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
                >
                  Choose File
                </button>
                {uploadedFile && (
                  <button
                    onClick={handleFileUpload}
                    disabled={isAnalyzing}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.bmp,.tiff"
                className="hidden"
              />
            </motion.div>
          )}

          {/* Analysis Results */}
          {analysisComplete && (
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Plain English Summary */}
              <div className="bg-card backdrop-blur-sm rounded-lg p-6 border border-border">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <span className="text-blue-600">🧠 Legal Lens Summary (Plain English)</span>
                </h2>
                <div className="space-y-4">
                  {mockAnalysis.plainEnglishSummary.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 py-3">
                      <span className="text-xl">{item.emoji}</span>
                      <p className="text-foreground text-lg">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Radar */}
              <div className="bg-card backdrop-blur-sm rounded-lg p-6 border border-border">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <span className="text-blue-600">⚠️ Risk Radar (Highlights)</span>
                </h2>
                <div className="space-y-4">
                  {mockAnalysis.riskRadar.map((risk, index) => (
                    <div key={index} className="flex items-start gap-3 py-3">
                      <span className="text-xl">{risk.emoji}</span>
                      <p className="text-foreground text-lg">{risk.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Q&A Section - ChatGPT/Claude Style */}
              <div className="bg-card backdrop-blur-sm rounded-lg border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    <span className="text-blue-600">💬 Ask Questions About Your Document</span>
                  </h2>
                  <p className="text-muted-foreground mt-2">Ask me anything about your legal document and I'll explain it in simple terms</p>
                </div>
                
                {/* Chat Container */}
                <div className="flex flex-col h-96">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground text-lg mb-4">💡 Try asking questions like:</div>
                        <div className="space-y-2">
                          <div className="text-foreground bg-muted rounded-lg p-3 inline-block">
                            "What happens if I don't pay rent on time?"
                          </div>
                          <div className="text-foreground bg-muted rounded-lg p-3 inline-block">
                            "When does this lease end?"
                          </div>
                          <div className="text-foreground bg-muted rounded-lg p-3 inline-block">
                            "Who is responsible for utilities?"
                          </div>
                        </div>
                      </div>
                    )}
                    {chatMessages.map((msg, index) => (
                      <div key={index} className="flex gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {msg.role === 'user' ? (
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        {/* Message */}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            {msg.role === 'user' ? 'You' : 'Legal Lens'}
                          </div>
                          <div className="text-foreground bg-muted rounded-lg p-4 leading-relaxed">
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-6 border-t border-border">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Ask a question about your document..."
                        className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload New Document */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setAnalysisComplete(false)
                    setUploadedFile(null)
                    setChatMessages([])
                  }}
                  className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Analyze Another Document
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
