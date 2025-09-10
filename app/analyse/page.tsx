'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, MessageSquare, Send, User, Bot, AlertTriangle, AlertCircle, CheckCircle, BookOpen, Shield, Clock, Search } from 'lucide-react'
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
              {/* Document Overview Header */}
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Analysis <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Complete</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Here's what we found in your document - broken down in plain English
                </p>
              </motion.div>

              {/* Summary Section - Hero Style */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <FileText className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Document Summary</h3>
                      <p className="text-gray-400">AI-powered breakdown in plain English</p>
                    </div>
                  </div>
                  
                  {documentData?.analysis.summary && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <p className="text-gray-100 text-lg leading-relaxed">{documentData.analysis.summary}</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Key Terms Section */}
              {documentData?.analysis?.keyTerms && Array.isArray(documentData.analysis.keyTerms) && documentData.analysis.keyTerms.length > 0 && (
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-indigo-500/20 rounded-xl">
                        <Search className="h-8 w-8 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Key Terms Explained</h3>
                        <p className="text-gray-400">Important legal terms made simple</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      {documentData.analysis.keyTerms.map((term: any, index: number) => (
                        <motion.div
                          key={index}
                          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                        >
                          {typeof term === 'string' ? (
                            <p className="text-gray-100">{term}</p>
                          ) : (
                            <div>
                              {term.term && (
                                <h5 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                                  <span className="text-indigo-400">📘</span>
                                  {term.term}
                                </h5>
                              )}
                              <p className="text-gray-300 leading-relaxed mb-3">{term.definition}</p>
                              {term.importance && (
                                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                  term.importance === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                  term.importance === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    term.importance === 'HIGH' ? 'bg-red-400' :
                                    term.importance === 'MEDIUM' ? 'bg-yellow-400' :
                                    'bg-gray-400'
                                  }`}></div>
                                  {term.importance} PRIORITY
                                </span>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Risk Analysis - Dashboard Style */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50">
                  
                  {/* Risk Score Dashboard */}
                  {documentData?.analysis?.riskScore !== undefined && (
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                          <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">Risk Assessment</h3>
                          <p className="text-gray-400">AI-powered risk evaluation</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-semibold text-gray-200">Overall Risk Score</span>
                          <span className="text-3xl font-bold text-white">{documentData.analysis.riskScore}/100</span>
                        </div>
                        
                        <div className="relative w-full bg-gray-700 rounded-full h-4 mb-2">
                          <motion.div 
                            className={`h-4 rounded-full shadow-lg ${
                              documentData.analysis.riskScore > 70 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              documentData.analysis.riskScore > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              'bg-gradient-to-r from-green-500 to-green-600'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${documentData.analysis.riskScore}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          ></motion.div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Low Risk</span>
                          <span>Medium Risk</span>
                          <span>High Risk</span>
                        </div>
                        
                        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                          <p className="text-sm text-gray-300">
                            {documentData.analysis.riskScore > 70 ? '🚨 High risk detected. Review carefully before signing.' :
                             documentData.analysis.riskScore > 40 ? '⚠️ Moderate risk. Some clauses need attention.' :
                             '✅ Low risk. Document appears standard.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Risks */}
                  {documentData?.analysis?.keyRisks && Array.isArray(documentData.analysis.keyRisks) && documentData.analysis.keyRisks.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-red-400" />
                        Key Risk Areas
                      </h4>
                      
                      <div className="grid gap-4">
                        {documentData.analysis.keyRisks.map((risk: any, index: number) => (
                          <motion.div
                            key={index}
                            className="bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 overflow-hidden"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                          >
                            {typeof risk === 'string' ? (
                              <div className="p-6">
                                <p className="text-gray-100">{risk}</p>
                              </div>
                            ) : (
                              <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                  {risk.category && (
                                    <h5 className="font-bold text-white text-lg flex items-center gap-2">
                                      <span className="text-red-400">⚠️</span>
                                      {risk.category}
                                    </h5>
                                  )}
                                  {risk.severity && (
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                                      risk.severity === 'CRITICAL' ? 'bg-red-600/30 text-red-300 border border-red-500/50' :
                                      risk.severity === 'HIGH' ? 'bg-orange-600/30 text-orange-300 border border-orange-500/50' :
                                      'bg-yellow-600/30 text-yellow-300 border border-yellow-500/50'
                                    }`}>
                                      <div className={`w-2 h-2 rounded-full mr-2 ${
                                        risk.severity === 'CRITICAL' ? 'bg-red-400' :
                                        risk.severity === 'HIGH' ? 'bg-orange-400' :
                                        'bg-yellow-400'
                                      }`}></div>
                                      {risk.severity}
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-gray-300 leading-relaxed mb-4">{risk.description}</p>
                                
                                {risk.recommendation && (
                                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                                    <p className="text-sm text-blue-300 flex items-start gap-2">
                                      <span className="text-blue-400 mt-0.5">💡</span>
                                      <span className="font-medium">Recommendation:</span>
                                    </p>
                                    <p className="text-sm text-blue-200 mt-1 ml-6">{risk.recommendation}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {documentData?.analysis?.recommendations && Array.isArray(documentData.analysis.recommendations) && documentData.analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                        Expert Recommendations
                      </h4>
                      
                      <div className="grid gap-3">
                        {documentData.analysis.recommendations.map((rec: any, index: number) => (
                          <motion.div
                            key={index}
                            className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 hover:border-green-500/50 transition-all duration-300"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                          >
                            <p className="text-green-100 flex items-start gap-3">
                              <span className="text-green-400 mt-1">✓</span>
                              {typeof rec === 'string' ? rec : rec.description || rec.recommendation || JSON.stringify(rec)}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Obligations and Rights - Professional Dashboard */}
              {((documentData?.analysis?.obligations && Array.isArray(documentData.analysis.obligations) && documentData.analysis.obligations.length > 0) || 
                (documentData?.analysis?.rights && Array.isArray(documentData.analysis.rights) && documentData.analysis.rights.length > 0)) && (
                <div className="grid lg:grid-cols-2 gap-8">
                  
                  {/* Obligations */}
                  {documentData?.analysis?.obligations && Array.isArray(documentData.analysis.obligations) && documentData.analysis.obligations.length > 0 && (
                    <motion.div
                      className="relative group"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50">
                        
                        <div className="flex items-center gap-4 mb-8">
                          <div className="p-3 bg-orange-500/20 rounded-xl">
                            <BookOpen className="h-8 w-8 text-orange-400" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">Your Obligations</h3>
                            <p className="text-gray-400">Legal responsibilities and duties</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {documentData.analysis.obligations.map((obligation: any, index: number) => (
                            <motion.div
                              key={index}
                              className="bg-gray-800/50 border border-gray-700/50 rounded-xl hover:border-orange-500/50 transition-all duration-300 overflow-hidden"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.1 * index }}
                            >
                              {typeof obligation === 'string' ? (
                                <div className="p-6">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600/20 rounded-full flex items-center justify-center mt-1">
                                      <span className="text-orange-400 font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <p className="text-gray-100 leading-relaxed">{obligation}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-6">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600/20 rounded-full flex items-center justify-center mt-1">
                                      <span className="text-orange-400 font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                      {obligation.party && (
                                        <h5 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                                          <span className="text-orange-400">⚖️</span>
                                          {obligation.party}
                                        </h5>
                                      )}
                                      <p className="text-gray-300 leading-relaxed mb-3">{obligation.description}</p>
                                      {obligation.deadline && (
                                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-orange-900/20 border border-orange-700/30 rounded-lg">
                                          <Clock className="h-4 w-4 text-orange-400" />
                                          <span className="text-orange-300 text-sm font-medium">
                                            Deadline: {obligation.deadline}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Rights */}
                  {documentData?.analysis?.rights && Array.isArray(documentData.analysis.rights) && documentData.analysis.rights.length > 0 && (
                    <motion.div
                      className="relative group"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50">
                        
                        <div className="flex items-center gap-4 mb-8">
                          <div className="p-3 bg-green-500/20 rounded-xl">
                            <Shield className="h-8 w-8 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">Your Rights</h3>
                            <p className="text-gray-400">Legal protections and entitlements</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {documentData.analysis.rights.map((right: any, index: number) => (
                            <motion.div
                              key={index}
                              className="bg-gray-800/50 border border-gray-700/50 rounded-xl hover:border-green-500/50 transition-all duration-300 overflow-hidden"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.1 * index }}
                            >
                              {typeof right === 'string' ? (
                                <div className="p-6">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center mt-1">
                                      <span className="text-green-400 font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <p className="text-gray-100 leading-relaxed">{right}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-6">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center mt-1">
                                      <span className="text-green-400 font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                      {right.party && (
                                        <h5 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                                          <span className="text-green-400">🛡️</span>
                                          {right.party}
                                        </h5>
                                      )}
                                      <p className="text-gray-300 leading-relaxed">{right.description}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Q&A Section - Premium Chat Interface */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-2xl transition-all duration-300 hover:border-gray-600/50">
                  
                  {/* Header */}
                  <div className="p-8 border-b border-gray-700/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-violet-500/20 rounded-xl">
                        <MessageSquare className="h-8 w-8 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">AI Legal Assistant</h3>
                        <p className="text-gray-400">Ask questions about your document</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Container */}
                  <div className="flex flex-col h-96">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                      {chatMessages.length === 0 && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bot className="h-8 w-8 text-violet-400" />
                          </div>
                          <h4 className="text-xl font-semibold text-white mb-4">💡 Try asking questions like:</h4>
                          <div className="grid gap-4 max-w-2xl mx-auto">
                            <motion.div 
                              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:border-violet-500/50 transition-all duration-300 cursor-pointer"
                              whileHover={{ scale: 1.02 }}
                              onClick={() => setCurrentMessage("What happens if I don't pay rent on time?")}
                            >
                              <p className="text-gray-100">"What happens if I don't pay rent on time?"</p>
                            </motion.div>
                            <motion.div 
                              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:border-violet-500/50 transition-all duration-300 cursor-pointer"
                              whileHover={{ scale: 1.02 }}
                              onClick={() => setCurrentMessage("When does this lease end?")}
                            >
                              <p className="text-gray-100">"When does this lease end?"</p>
                            </motion.div>
                            <motion.div 
                              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:border-violet-500/50 transition-all duration-300 cursor-pointer"
                              whileHover={{ scale: 1.02 }}
                              onClick={() => setCurrentMessage("Who is responsible for utilities?")}
                            >
                              <p className="text-gray-100">"Who is responsible for utilities?"</p>
                            </motion.div>
                          </div>
                        </div>
                      )}
                      {chatMessages.map((msg, index) => (
                        <motion.div 
                          key={index} 
                          className="flex gap-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {msg.role === 'user' ? (
                              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                                <Bot className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                          {/* Message */}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                              {msg.role === 'user' ? (
                                <>
                                  <span className="w-2 h-2 bg-violet-400 rounded-full"></span>
                                  You
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                  Legal Lens AI
                                </>
                              )}
                            </div>
                            <div className={`rounded-xl p-4 leading-relaxed shadow-lg ${
                              msg.role === 'user' 
                                ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 text-gray-100' 
                                : 'bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 text-gray-100'
                            }`}>
                              {msg.message}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-8 border-t border-gray-700/50">
                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            placeholder="Ask a question about your document..."
                            className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                          />
                        </div>
                        <motion.button
                          onClick={handleSendMessage}
                          disabled={!currentMessage.trim() || isSendingMessage}
                          className="px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isSendingMessage ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Upload New Document - CTA Style */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <div className="relative group inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/50 to-purple-600/50 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <motion.button
                    onClick={() => {
                      setAnalysisComplete(false)
                      setUploadedFile(null)
                      setChatMessages([])
                    }}
                    className="relative px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-2xl border border-violet-500/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center gap-3">
                      <Upload className="h-6 w-6" />
                      Analyze Another Document
                    </div>
                  </motion.button>
                </div>
                <p className="text-gray-400 mt-4 text-sm">
                  Ready to analyze another legal document? Upload it to get started.
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}