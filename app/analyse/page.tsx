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
              <motion.div 
                className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-indigo-950/30 backdrop-blur-sm rounded-2xl p-8 border border-violet-200/50 dark:border-violet-800/30 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-violet-400/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Legal Lens Summary
                      </h2>
                      <p className="text-muted-foreground mt-1">AI-powered document breakdown in plain English</p>
                    </div>
                  </div>
                  
                  {documentData?.analysis.summary && (
                    <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-violet-200/30 dark:border-violet-700/30 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 rounded-lg">
                          <span className="text-2xl">🧠</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Document Overview</h3>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg font-medium">
                            {documentData.analysis.summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {documentData?.analysis?.keyTerms && Array.isArray(documentData.analysis.keyTerms) && documentData.analysis.keyTerms.length > 0 && (
                    <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-violet-200/30 dark:border-violet-700/30 shadow-sm mt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg">
                          <span className="text-2xl">🔑</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Legal Terms</h3>
                          <div className="grid gap-4">
                            {documentData.analysis.keyTerms.map((term: any, index: number) => (
                              <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-700/30 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                                {typeof term === 'string' ? (
                                  <p className="text-blue-800 dark:text-blue-300 font-medium">{term}</p>
                                ) : (
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      {term.term && (
                                        <h5 className="font-bold text-blue-900 dark:text-blue-100 text-base">{term.term}</h5>
                                      )}
                                      {term.importance && (
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                          term.importance === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                          term.importance === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        }`}>
                                          {term.importance} PRIORITY
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">{term.definition}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Risk Analysis */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 backdrop-blur-sm rounded-xl p-6 border border-red-200/30 dark:border-red-700/30 shadow-lg"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 rounded-lg">
                    <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">Risk Analysis & Assessment</span>
                </h2>
                <div className="space-y-6">
                  {documentData?.analysis?.riskScore !== undefined && (
                    <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg p-4 border border-red-200/50 dark:border-red-700/30">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/50 dark:to-pink-900/50 rounded-lg">
                          <span className="text-2xl">📊</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Overall Risk Score</h3>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{documentData.analysis.riskScore}/100</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                        <motion.div 
                          className={`h-3 rounded-full shadow-sm ${
                            documentData.analysis.riskScore > 70 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            documentData.analysis.riskScore > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${documentData.analysis.riskScore}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <p className={`text-sm mt-2 font-medium ${
                        documentData.analysis.riskScore > 70 ? 'text-red-700 dark:text-red-300' :
                        documentData.analysis.riskScore > 40 ? 'text-yellow-700 dark:text-yellow-300' :
                        'text-green-700 dark:text-green-300'
                      }`}>
                        {documentData.analysis.riskScore > 70 ? 'High Risk - Immediate attention required' :
                         documentData.analysis.riskScore > 40 ? 'Medium Risk - Review recommended' :
                         'Low Risk - Acceptable level'}
                      </p>
                    </div>
                  )}
                  {documentData?.analysis?.keyRisks && Array.isArray(documentData.analysis.keyRisks) && documentData.analysis.keyRisks.length > 0 && (
                    <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg p-4 border border-red-200/50 dark:border-red-700/30">
                      <h3 className="font-semibold mb-4 text-red-900 dark:text-red-100 text-lg flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Critical Risk Factors
                      </h3>
                      <div className="grid gap-4">
                        {documentData.analysis.keyRisks.map((risk: any, index: number) => (
                          <div key={index} className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-lg hover:shadow-md transition-all duration-200">
                            {typeof risk === 'string' ? (
                              <div className="flex items-start gap-3">
                                <span className="text-xl">🔴</span>
                                <p className="text-red-800 dark:text-red-300 font-medium">{risk}</p>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  {risk.category && (
                                    <h4 className="font-bold text-red-900 dark:text-red-100">{risk.category}</h4>
                                  )}
                                  {risk.severity && (
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                      risk.severity === 'CRITICAL' ? 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300' :
                                      risk.severity === 'HIGH' ? 'bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-300' :
                                      'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/50 dark:text-yellow-300'
                                    }`}>
                                      {risk.severity} RISK
                                    </span>
                                  )}
                                </div>
                                <p className="text-red-800 dark:text-red-300 text-sm mb-2 leading-relaxed">{risk.description}</p>
                                {risk.recommendation && (
                                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700/30 rounded-lg p-3 mt-2">
                                    <p className="text-blue-800 dark:text-blue-300 text-sm font-medium flex items-start gap-2">
                                      <span className="text-blue-600 dark:text-blue-400">💡</span>
                                      {risk.recommendation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {documentData?.analysis?.recommendations && Array.isArray(documentData.analysis.recommendations) && documentData.analysis.recommendations.length > 0 && (
                    <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/30">
                      <h3 className="font-semibold mb-4 text-blue-900 dark:text-blue-100 text-lg flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Expert Recommendations
                      </h3>
                      <div className="space-y-3">
                        {documentData.analysis.recommendations.map((rec: any, index: number) => (
                          <div key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-700/30 rounded-lg p-3 hover:shadow-sm transition-all duration-200">
                            <div className="flex items-start gap-3">
                              <span className="text-blue-600 dark:text-blue-400 mt-1">💡</span>
                              <p className="text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                                {typeof rec === 'string' ? rec : rec.description || rec.recommendation || JSON.stringify(rec)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Obligations and Rights */}
              {((documentData?.analysis?.obligations && Array.isArray(documentData.analysis.obligations) && documentData.analysis.obligations.length > 0) || 
                (documentData?.analysis?.rights && Array.isArray(documentData.analysis.rights) && documentData.analysis.rights.length > 0)) && (
                <motion.div 
                  className="grid md:grid-cols-2 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {/* Obligations */}
                  {documentData?.analysis?.obligations && Array.isArray(documentData.analysis.obligations) && documentData.analysis.obligations.length > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-pink-950/20 backdrop-blur-sm rounded-xl p-6 border border-orange-200/30 dark:border-orange-700/30 shadow-lg">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 rounded-lg">
                          <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">Your Legal Obligations</span>
                      </h2>
                      <div className="space-y-4">
                        {documentData.analysis.obligations.map((obligation: any, index: number) => (
                          <div key={index} className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/30 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                            {typeof obligation === 'string' ? (
                              <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 rounded">
                                  <span className="text-lg">⚖️</span>
                                </div>
                                <p className="text-orange-800 dark:text-orange-300 font-medium leading-relaxed">{obligation}</p>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  {obligation.party && (
                                    <h5 className="font-bold text-orange-900 dark:text-orange-100">{obligation.party}</h5>
                                  )}
                                  {obligation.deadline && (
                                    <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 text-xs font-semibold rounded-full">
                                      ⏰ {obligation.deadline}
                                    </span>
                                  )}
                                </div>
                                <p className="text-orange-800 dark:text-orange-300 leading-relaxed">{obligation.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Rights */}
                  {documentData?.analysis?.rights && Array.isArray(documentData.analysis.rights) && documentData.analysis.rights.length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 backdrop-blur-sm rounded-xl p-6 border border-green-200/30 dark:border-green-700/30 shadow-lg">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-lg">
                          <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Your Legal Rights</span>
                      </h2>
                      <div className="space-y-4">
                        {documentData.analysis.rights.map((right: any, index: number) => (
                          <div key={index} className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-sm border border-green-200/50 dark:border-green-700/30 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                            {typeof right === 'string' ? (
                              <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded">
                                  <span className="text-lg">🛡️</span>
                                </div>
                                <p className="text-green-800 dark:text-green-300 font-medium leading-relaxed">{right}</p>
                              </div>
                            ) : (
                              <div>
                                {right.party && (
                                  <h5 className="font-bold text-green-900 dark:text-green-100 mb-2">{right.party}</h5>
                                )}
                                <p className="text-green-800 dark:text-green-300 leading-relaxed">{right.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
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
