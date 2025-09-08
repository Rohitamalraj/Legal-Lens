'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, MessageSquare, Send, User, Bot } from 'lucide-react'
import { apiService, type DocumentAnalysis } from '@/lib/api'
import { debugDocumentData } from '@/lib/debug-utils'

export default function AnalysePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [documentData, setDocumentData] = useState<DocumentAnalysis | null>(null)
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', message: string}[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [headerScrollState, setHeaderScrollState] = useState(false)
  const [mobileNavVisible, setMobileNavVisible] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
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

  // Check for existing document on page load
  useEffect(() => {
    const checkExistingDocument = async () => {
      try {
        if (typeof window === 'undefined') return
        
        const documentId = localStorage.getItem('currentDocumentId')
        if (documentId) {
          const result = await apiService.getDocument(documentId)
          if (result.success && result.data) {
            setDocumentData(result.data)
            setAnalysisComplete(true)
          } else {
            localStorage.removeItem('currentDocumentId')
          }
        }
      } catch (error) {
        console.error('Error checking existing document:', error)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('currentDocumentId')
        }
      }
    }
    
    checkExistingDocument()
  }, [])

  const handleFileUpload = async () => {
    if (!uploadedFile) return
    
    setIsAnalyzing(true)
    setUploadError(null)
    
    try {
      // First validate the document
      const validationResult = await apiService.validateDocument(uploadedFile)
      
      if (!validationResult.success) {
        throw new Error(validationResult.error || 'Document validation failed')
      }
      
      if (!validationResult.data?.isValid) {
        throw new Error('This file is not a valid document')
      }
      
      if (!validationResult.data?.isLegalDocument) {
        throw new Error('This document does not appear to be a legal document')
      }
      
      // Upload and process the document
      const uploadResult = await apiService.uploadDocument(uploadedFile)
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Document upload failed')
      }
      
        if (uploadResult.data) {
          console.log('DEBUG: Setting document data after upload')
          debugDocumentData(uploadResult.data)
          setDocumentData(uploadResult.data)
          setAnalysisComplete(true)
          localStorage.setItem('currentDocumentId', uploadResult.data.id)
          
          // Dispatch event for other components
          const event = new CustomEvent('documentUploaded', {
            detail: uploadResult.data
          })
          window.dispatchEvent(event)
        }    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsAnalyzing(false)
    }
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

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isSendingMessage) return
    
    if (!documentData) {
      const userMessage = { role: 'user' as const, message: currentMessage }
      const errorMessage = { role: 'assistant' as const, message: 'Please upload and analyze a document first before asking questions.' }
      setChatMessages(prev => [...prev, userMessage, errorMessage])
      setCurrentMessage('')
      return
    }
    
    const userMessage = { role: 'user' as const, message: currentMessage }
    setChatMessages(prev => [...prev, userMessage])
    
    setIsSendingMessage(true)
    const query = currentMessage
    setCurrentMessage('')
    
    try {
      const response = await apiService.sendChatMessage(documentData.id, query)
      
      if (response.success && response.data) {
        const aiMessage = { 
          role: 'assistant' as const, 
          message: response.data.response 
        }
        setChatMessages(prev => [...prev, aiMessage])
      } else {
        const errorMessage = { 
          role: 'assistant' as const, 
          message: `Sorry, I encountered an error: ${response.error || 'Unknown error'}. Please try again.`
        }
        setChatMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = { 
        role: 'assistant' as const, 
        message: 'Sorry, there was a problem processing your request. Please try again.'
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsSendingMessage(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground relative">
      {/* Background Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0 -z-10"
      >
        {/* Purple gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl"></div>
        
        {/* Additional decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-purple-400/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-indigo-400/8 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-violet-500/6 rounded-full blur-lg"></div>
        
        {/* Subtle geometric shapes */}
        <div className="absolute top-1/5 left-2/3 w-16 h-16 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rotate-45 blur-sm"></div>
        <div className="absolute bottom-1/3 left-1/5 w-12 h-12 bg-gradient-to-l from-violet-500/8 to-purple-500/8 rotate-12 blur-sm"></div>
        
        {/* Floating dots */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/6 left-1/6 w-2 h-2 bg-purple-400/30 rounded-full"
        ></motion.div>
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-2/3 right-1/5 w-3 h-3 bg-indigo-400/25 rounded-full"
        ></motion.div>
        <motion.div
          animate={{ x: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/5 left-3/5 w-1.5 h-1.5 bg-violet-400/35 rounded-full"
        ></motion.div>
      </motion.div>
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

      <main className="container mx-auto px-4 pt-16 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Legal Document <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Analysis</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Upload your legal document and understand it in <span className="text-violet-600 font-semibold">plain English</span> - no more legal jargon!
            </p>
          </motion.div>

          {/* File Upload Section */}
          {!analysisComplete && (
            <motion.div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-8 ${
                dragOver ? 'border-violet-400 bg-violet-50/5' : 'border-border bg-card'
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
                  className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors mr-4"
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
              
              {/* Error Display */}
              {uploadError && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="font-semibold">Upload Error:</p>
                  <p>{uploadError}</p>
                </div>
              )}
              
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
                  <FileText className="h-6 w-6 text-violet-600" />
                  <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">🧠 Legal Lens Summary</span>
                </h2>
                <div className="space-y-4">
                  {documentData?.analysis.summary && (
                    <div className="flex items-start gap-3 py-3">
                      <span className="text-xl">📄</span>
                      <p className="text-foreground text-lg">{documentData.analysis.summary}</p>
                    </div>
                  )}
                  {documentData?.analysis?.keyTerms && Array.isArray(documentData.analysis.keyTerms) && documentData.analysis.keyTerms.length > 0 && (
                    <div className="flex items-start gap-3 py-3">
                      <span className="text-xl">🔑</span>
                      <div className="text-foreground text-lg">
                        <p className="font-semibold mb-2">Key Terms:</p>
                        <div className="space-y-3">
                          {documentData.analysis.keyTerms.map((term: any, index: number) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3">
                              {typeof term === 'string' ? (
                                <p className="text-blue-800">{term}</p>
                              ) : (
                                <div>
                                  {term.term && (
                                    <h5 className="font-semibold text-blue-900 mb-1">{term.term}</h5>
                                  )}
                                  <p className="text-blue-800 text-sm">{term.definition}</p>
                                  {term.importance && (
                                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                                      term.importance === 'HIGH' ? 'bg-blue-200 text-blue-900' :
                                      term.importance === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {term.importance}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="bg-card backdrop-blur-sm rounded-lg p-6 border border-border">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <FileText className="h-6 w-6 text-violet-600" />
                  <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">⚠️ Risk Analysis</span>
                </h2>
                <div className="space-y-4">
                  {documentData?.analysis?.riskScore !== undefined && (
                    <div className="flex items-start gap-3 py-3">
                      <span className="text-xl">📊</span>
                      <div className="text-foreground text-lg">
                        <p className="font-semibold">Risk Score: {documentData.analysis.riskScore}/100</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div 
                            className={`h-2.5 rounded-full ${
                              documentData.analysis.riskScore > 70 ? 'bg-red-600' :
                              documentData.analysis.riskScore > 40 ? 'bg-yellow-500' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${documentData.analysis.riskScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {documentData?.analysis?.keyRisks && Array.isArray(documentData.analysis.keyRisks) && documentData.analysis.keyRisks.length > 0 && (
                    <div className="flex items-start gap-3 py-3">
                      <span className="text-xl">🔴</span>
                      <div className="text-foreground text-lg">
                        <p className="font-semibold mb-2">Key Risks:</p>
                        <div className="space-y-3">
                          {documentData.analysis.keyRisks.map((risk: any, index: number) => (
                            <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                              {typeof risk === 'string' ? (
                                <p className="text-red-800">{risk}</p>
                              ) : (
                                <div>
                                  {risk.category && (
                                    <h4 className="font-semibold text-red-900 mb-1">{risk.category}</h4>
                                  )}
                                  <p className="text-red-800 text-sm mb-2">{risk.description}</p>
                                  {risk.severity && (
                                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                                      risk.severity === 'CRITICAL' ? 'bg-red-200 text-red-900' :
                                      risk.severity === 'HIGH' ? 'bg-orange-200 text-orange-900' :
                                      'bg-yellow-200 text-yellow-900'
                                    }`}>
                                      {risk.severity}
                                    </span>
                                  )}
                                  {risk.recommendation && (
                                    <p className="text-red-700 text-sm mt-2 italic">💡 {risk.recommendation}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {documentData?.analysis?.recommendations && Array.isArray(documentData.analysis.recommendations) && documentData.analysis.recommendations.length > 0 && (
                    <div className="flex items-start gap-3 py-3">
                      <span className="text-xl">💡</span>
                      <div className="text-foreground text-lg">
                        <p className="font-semibold mb-2">Recommendations:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {documentData.analysis.recommendations.map((rec: any, index: number) => (
                            <li key={index}>
                              {typeof rec === 'string' ? rec : rec.description || rec.recommendation || JSON.stringify(rec)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Obligations and Rights */}
              {((documentData?.analysis?.obligations && Array.isArray(documentData.analysis.obligations) && documentData.analysis.obligations.length > 0) || 
                (documentData?.analysis?.rights && Array.isArray(documentData.analysis.rights) && documentData.analysis.rights.length > 0)) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Obligations */}
                  {documentData?.analysis?.obligations && Array.isArray(documentData.analysis.obligations) && documentData.analysis.obligations.length > 0 && (
                    <div className="bg-card backdrop-blur-sm rounded-lg p-6 border border-border">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <FileText className="h-6 w-6 text-violet-600" />
                        <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">📋 Your Obligations</span>
                      </h2>
                      <div className="space-y-3">
                        {documentData.analysis.obligations.map((obligation: any, index: number) => (
                          <div key={index} className="bg-orange-50 border border-orange-200 rounded p-3">
                            {typeof obligation === 'string' ? (
                              <div className="flex items-start gap-3">
                                <span className="text-xl">⚖️</span>
                                <p className="text-foreground">{obligation}</p>
                              </div>
                            ) : (
                              <div>
                                {obligation.party && (
                                  <h5 className="font-semibold text-orange-900 mb-1">{obligation.party}</h5>
                                )}
                                <p className="text-orange-800 mb-1">{obligation.description}</p>
                                {obligation.deadline && (
                                  <p className="text-sm text-orange-700">⏰ Deadline: {obligation.deadline}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Rights */}
                  {documentData?.analysis?.rights && Array.isArray(documentData.analysis.rights) && documentData.analysis.rights.length > 0 && (
                    <div className="bg-card backdrop-blur-sm rounded-lg p-6 border border-border">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <FileText className="h-6 w-6 text-violet-600" />
                        <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">✅ Your Rights</span>
                      </h2>
                      <div className="space-y-3">
                        {documentData.analysis.rights.map((right: any, index: number) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded p-3">
                            {typeof right === 'string' ? (
                              <div className="flex items-start gap-3">
                                <span className="text-xl">🛡️</span>
                                <p className="text-foreground">{right}</p>
                              </div>
                            ) : (
                              <div>
                                {right.party && (
                                  <h5 className="font-semibold text-green-900 mb-1">{right.party}</h5>
                                )}
                                <p className="text-green-800">{right.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Q&A Section - ChatGPT/Claude Style */}
              <div className="bg-card backdrop-blur-sm rounded-lg border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-violet-600" />
                    <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">💬 Ask Questions About Your Document</span>
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
                            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
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
                        className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim() || isSendingMessage}
                        className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSendingMessage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
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
