'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, MessageSquare, Send, User, Bot, Globe, Volume2, Loader2, VolumeX, Square } from 'lucide-react'
import { apiService, type DocumentAnalysis } from '@/lib/api'
import { debugDocumentData } from '@/lib/debug-utils'
import { LanguageSelector, TranslationStatus } from '@/components/language-selector'
import { SupportedLanguageCode, SUPPORTED_LANGUAGES } from '@/lib/constants/translation'

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
  
  // Translation state
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>('en')
  const [translatedData, setTranslatedData] = useState<any>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationError, setTranslationError] = useState<string | null>(null)
  
  // Text-to-Speech state
  const [isReading, setIsReading] = useState(false)
  const [currentlyReading, setCurrentlyReading] = useState<string | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isLoadingTTS, setIsLoadingTTS] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Stop speech when language changes
  useEffect(() => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
    }
    window.speechSynthesis.cancel()
    setIsReading(false)
    setCurrentlyReading(null)
  }, [currentLanguage])

  // Helper function to get translated UI labels
  const getTranslatedLabel = (key: string, fallback: string = key) => {
    if (currentLanguage === 'en' || !translatedData?.uiLabels) {
      return fallback
    }
    return translatedData.uiLabels[key] || fallback
  }

  // Google Cloud Text-to-Speech functionality (Optimized for Speed)
  const readText = async (text: string, sectionId: string) => {
    // Stop any current speech immediately
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
    }
    window.speechSynthesis.cancel()

    if (currentlyReading === sectionId) {
      setIsReading(false)
      setCurrentlyReading(null)
      setIsLoadingTTS(false)
      return
    }

    // Show immediate feedback
    setIsLoadingTTS(true)
    setCurrentlyReading(sectionId)

    try {
      // Convert language code for Google TTS
      const speechLang = currentLanguage === 'en' ? 'en-US' : 
                        currentLanguage === 'es' ? 'es-ES' :
                        currentLanguage === 'fr' ? 'fr-FR' :
                        currentLanguage === 'de' ? 'de-DE' :
                        currentLanguage === 'it' ? 'it-IT' :
                        currentLanguage === 'pt' ? 'pt-PT' :
                        currentLanguage === 'ru' ? 'ru-RU' :
                        currentLanguage === 'zh' ? 'zh-CN' :
                        currentLanguage === 'ja' ? 'ja-JP' :
                        currentLanguage === 'ko' ? 'ko-KR' :
                        currentLanguage === 'ar' ? 'ar-XA' :
                        currentLanguage === 'hi' ? 'hi-IN' :
                        currentLanguage === 'nl' ? 'nl-NL' :
                        currentLanguage === 'sv' ? 'sv-SE' :
                        currentLanguage === 'da' ? 'da-DK' :
                        currentLanguage === 'no' ? 'no-NO' :
                        currentLanguage === 'fi' ? 'fi-FI' :
                        currentLanguage === 'pl' ? 'pl-PL' :
                        currentLanguage === 'cs' ? 'cs-CZ' :
                        currentLanguage === 'hu' ? 'hu-HU' : 'en-US'

      // Call Google Cloud TTS API with timeout for faster response
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('TTS request timeout - aborting...')
        controller.abort()
      }, 10000) // 10 second timeout

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.substring(0, 1000), // Limit text length for faster processing
          language: speechLang,
          voiceGender: 'FEMALE'
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error('TTS API request failed')
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Stop loading, start playing
      setIsLoadingTTS(false)
      setIsReading(true)

      // Create audio from base64 data
      const audioData = `data:audio/mpeg;base64,${result.audioContent}`
      const audio = new Audio(audioData)
      
      setCurrentAudio(audio)

      audio.onended = () => {
        setIsReading(false)
        setCurrentlyReading(null)
        setCurrentAudio(null)
      }

      audio.onerror = () => {
        setIsReading(false)
        setCurrentlyReading(null)
        setCurrentAudio(null)
        setIsLoadingTTS(false)
        console.error('Audio playback error')
      }

      // Play the audio immediately
      await audio.play()
      
    } catch (error) {
      console.error('Google TTS Error:', error)
      setIsLoadingTTS(false)
      setIsReading(false)
      setCurrentlyReading(null)
      
      // Handle AbortError specifically
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('TTS request was aborted (timeout or user cancellation)')
        return
      }
      
      // Quick fallback to browser TTS for instant response
      console.log('Using browser TTS fallback for instant response...')
      const fallbackLang = currentLanguage === 'en' ? 'en-US' : 
                          currentLanguage === 'es' ? 'es-ES' :
                          currentLanguage === 'fr' ? 'fr-FR' :
                          currentLanguage === 'de' ? 'de-DE' :
                          currentLanguage === 'it' ? 'it-IT' :
                          currentLanguage === 'pt' ? 'pt-PT' :
                          currentLanguage === 'ru' ? 'ru-RU' :
                          currentLanguage === 'zh' ? 'zh-CN' :
                          currentLanguage === 'ja' ? 'ja-JP' :
                          currentLanguage === 'ko' ? 'ko-KR' :
                          currentLanguage === 'ar' ? 'ar-SA' :
                          currentLanguage === 'hi' ? 'hi-IN' :
                          currentLanguage === 'nl' ? 'nl-NL' :
                          currentLanguage === 'sv' ? 'sv-SE' :
                          currentLanguage === 'da' ? 'da-DK' :
                          currentLanguage === 'no' ? 'no-NO' :
                          currentLanguage === 'fi' ? 'fi-FI' :
                          currentLanguage === 'pl' ? 'pl-PL' :
                          currentLanguage === 'cs' ? 'cs-CZ' :
                          currentLanguage === 'hu' ? 'hu-HU' : 'en-US'
      
      const utterance = new SpeechSynthesisUtterance(text.substring(0, 500)) // Shorter for speed
      utterance.lang = fallbackLang
      utterance.rate = 1.1 // Faster speech
      utterance.pitch = 1
      
      utterance.onend = () => {
        setIsReading(false)
        setCurrentlyReading(null)
      }
      
      utterance.onerror = () => {
        setIsReading(false)
        setCurrentlyReading(null)
      }

      setIsReading(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Get section content for reading
  const getSectionContent = (sectionType: string) => {
    if (!documentData) return ''
    
    switch (sectionType) {
      case 'summary':
        const summaryTitle = getTranslatedLabel('Legal Lens Summary', 'Legal Lens Summary')
        const summaryContent = translatedData?.summary || documentData.analysis.summary || ''
        return `${summaryTitle}. ${summaryContent}`
      
      case 'keyTerms':
        const keyTermsTitle = getTranslatedLabel('Key Terms', 'Key Terms')
        const keyTerms = translatedData?.keyPoints || documentData.analysis.keyTerms || []
        const keyTermsText = Array.isArray(keyTerms) ? 
          keyTerms.map(term => typeof term === 'string' ? term : `${term.term}: ${term.definition}`).join('. ') : ''
        return `${keyTermsTitle}. ${keyTermsText}`
      
      case 'risks':
        const risksTitle = getTranslatedLabel('Risk Analysis', 'Risk Analysis')
        const riskScore = `${getTranslatedLabel('Risk Score', 'Risk Score')} ${documentData.analysis.riskScore} out of 100`
        const keyRisks = translatedData?.keyRisks || documentData.analysis.keyRisks || []
        const risksText = Array.isArray(keyRisks) ? 
          keyRisks.map(risk => typeof risk === 'string' ? risk : risk.description || risk.category || '').join('. ') : ''
        return `${risksTitle}. ${riskScore}. ${getTranslatedLabel('Key Risks', 'Key Risks')}. ${risksText}`
      
      case 'recommendations':
        const recTitle = getTranslatedLabel('Recommendations', 'Recommendations')
        const recommendations = translatedData?.recommendations || documentData.analysis.recommendations || []
        const recText = Array.isArray(recommendations) ? 
          recommendations.map(rec => typeof rec === 'string' ? rec : rec.description || rec.recommendation || '').join('. ') : ''
        return `${recTitle}. ${recText}`
      
      case 'obligations':
        const oblTitle = getTranslatedLabel('Your Obligations', 'Your Obligations')
        const obligations = translatedData?.obligations || documentData.analysis.obligations || []
        const oblText = Array.isArray(obligations) ? 
          obligations.map(obl => typeof obl === 'string' ? obl : obl.description || obl.obligation || '').join('. ') : ''
        return `${oblTitle}. ${oblText}`
      
      case 'rights':
        const rightsTitle = getTranslatedLabel('Your Rights', 'Your Rights')
        const rights = translatedData?.rights || documentData.analysis.rights || []
        const rightsText = Array.isArray(rights) ? 
          rights.map(right => typeof right === 'string' ? right : right.description || right.right || '').join('. ') : ''
        return `${rightsTitle}. ${rightsText}`
      
      default:
        return ''
    }
  }

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

  // Translation function
  const handleLanguageChange = async (language: SupportedLanguageCode) => {
    if (!documentData || language === currentLanguage) return

    if (language === 'en') {
      // Reset to original language
      setTranslatedData(null)
      setCurrentLanguage(language)
      setTranslationError(null)
      return
    }

    setIsTranslating(true)
    setTranslationError(null)

    try {
      // Prepare data for translation including UI labels
      const dataToTranslate = {
        summary: documentData.analysis.summary || '',
        keyPoints: documentData.analysis.keyTerms?.map((term: any) => 
          typeof term === 'string' ? term : `${term.term}: ${term.definition}`
        ) || [],
        riskLevel: `Risk Score: ${documentData.analysis.riskScore}/100`,
        recommendations: documentData.analysis.recommendations?.map((rec: any) => 
          typeof rec === 'string' ? rec : rec.description || rec.recommendation || ''
        ) || [],
        keyRisks: documentData.analysis.keyRisks?.map((risk: any) => 
          typeof risk === 'string' ? risk : risk.description || risk.category || ''
        ) || [],
        obligations: documentData.analysis.obligations?.map((obl: any) => 
          typeof obl === 'string' ? obl : obl.description || obl.obligation || ''
        ) || [],
        rights: documentData.analysis.rights?.map((right: any) => 
          typeof right === 'string' ? right : right.description || right.right || ''
        ) || [],
        // UI Labels to translate
        uiLabels: {
          'Legal Lens Summary': '🧠 Legal Lens Summary',
          'Key Terms': 'Key Terms:',
          'Risk Analysis': '⚠️ Risk Analysis', 
          'Risk Score': 'Risk Score:',
          'Key Risks': 'Key Risks:',
          'Recommendations': 'Recommendations:',
          'Your Obligations': '📋 Your Obligations',
          'Your Rights': '✅ Your Rights'
        }
      }

      // Use the API service method
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'translateSummary',
          summary: dataToTranslate,
          targetLanguage: language,
          sourceLanguage: 'en',
        }),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const translationResult = await response.json()
      setTranslatedData(translationResult)
      setCurrentLanguage(language)
    } catch (error) {
      console.error('Translation error:', error)
      const errorMessage = 'Failed to translate content. Please try again.'
      setTranslationError(errorMessage)
    } finally {
      setIsTranslating(false)
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
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              disabled={isTranslating || !documentData}
            />
            {isTranslating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Translating...</span>
              </div>
            )}
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
              <div className="border-t pt-4">
                <LanguageSelector
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                />
              </div>
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
            
            {/* Translation Status Banner */}
            {isTranslating && (
              <div className="mt-6 mx-auto max-w-md bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">
                    Translating content to {SUPPORTED_LANGUAGES[currentLanguage as keyof typeof SUPPORTED_LANGUAGES]}...
                  </span>
                </div>
              </div>
            )}
            
            {translationError && (
              <div className="mt-6 mx-auto max-w-md bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-red-700">
                  <span className="text-sm font-medium">
                    Translation failed: {translationError}
                  </span>
                </div>
              </div>
            )}
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
                aria-label="Select document file for analysis"
                title="Choose a document file to analyze"
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <FileText className="h-6 w-6 text-violet-600" />
                    <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                      {getTranslatedLabel('Legal Lens Summary', '🧠 Legal Lens Summary')}
                    </span>
                  </h2>
                  <button
                    onClick={() => readText(getSectionContent('summary'), 'summary')}
                    disabled={isTranslating || isLoadingTTS}
                    className={`group relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg backdrop-blur-sm border ${
                      currentlyReading === 'summary' 
                        ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400 shadow-red-200' 
                        : isLoadingTTS && currentlyReading === 'summary'
                        ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400 shadow-yellow-200'
                        : 'bg-blue-500/20 border-blue-400 text-white hover:bg-blue-500/30 focus:ring-blue-400 shadow-blue-200'
                    }`}
                    title={
                      isLoadingTTS && currentlyReading === 'summary' ? 'Loading audio...' :
                      currentlyReading === 'summary' ? 'Stop reading' : 'Listen to summary'
                    }
                  >
                    <div className="flex items-center gap-2">
                      {isLoadingTTS && currentlyReading === 'summary' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : currentlyReading === 'summary' ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                      <span className="text-sm font-medium">
                        {isLoadingTTS && currentlyReading === 'summary' ? 'Loading...' :
                         currentlyReading === 'summary' ? 'Stop' : 'Listen'}
                      </span>
                    </div>
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </button>
                </div>
                <div className="space-y-4">
                  {(translatedData?.summary || documentData?.analysis?.summary) && (
                    <div className="flex items-start gap-3 py-3">
                      <span className="text-xl">📄</span>
                      <div className="text-foreground text-lg">
                        <p>{translatedData?.summary || documentData?.analysis?.summary}</p>
                        {translatedData?.summary && currentLanguage !== 'en' && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            Translated to {SUPPORTED_LANGUAGES[currentLanguage as keyof typeof SUPPORTED_LANGUAGES]}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {(translatedData?.keyPoints || documentData?.analysis?.keyTerms) && Array.isArray(translatedData?.keyPoints || documentData?.analysis?.keyTerms) && (translatedData?.keyPoints || documentData?.analysis?.keyTerms).length > 0 && (
                    <div className="flex items-start gap-3 py-3">
                      <span className="text-xl">🔑</span>
                      <div className="text-foreground text-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">{getTranslatedLabel('Key Terms', 'Key Terms:')}</p>
                          <button
                            onClick={() => readText(getSectionContent('keyTerms'), 'keyTerms')}
                            disabled={isTranslating || isLoadingTTS}
                            className={`group relative overflow-hidden rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-md backdrop-blur-sm border ${
                              currentlyReading === 'keyTerms' 
                                ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400 shadow-red-200' 
                                : isLoadingTTS && currentlyReading === 'keyTerms'
                                ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400 shadow-yellow-200'
                                : 'bg-blue-500/20 border-blue-400 text-white hover:bg-blue-500/30 focus:ring-blue-400 shadow-blue-200'
                            }`}
                            title={
                              isLoadingTTS && currentlyReading === 'keyTerms' ? 'Loading audio...' :
                              currentlyReading === 'keyTerms' ? 'Stop reading' : 'Listen to key terms'
                            }
                          >
                            <div className="flex items-center gap-1">
                              {isLoadingTTS && currentlyReading === 'keyTerms' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : currentlyReading === 'keyTerms' ? (
                                <VolumeX className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                              <span className="text-xs font-medium">
                                {isLoadingTTS && currentlyReading === 'keyTerms' ? 'Loading...' :
                                 currentlyReading === 'keyTerms' ? 'Stop' : 'Listen'}
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(translatedData?.keyPoints || documentData?.analysis?.keyTerms || []).map((term: any, index: number) => (
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <FileText className="h-6 w-6 text-violet-600" />
                    <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                      {getTranslatedLabel('Risk Analysis', '⚠️ Risk Analysis')}
                    </span>
                  </h2>
                  <button
                    onClick={() => readText(getSectionContent('risks'), 'risks')}
                    disabled={isTranslating || isLoadingTTS}
                    className={`group relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg backdrop-blur-sm border ${
                      currentlyReading === 'risks' 
                        ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400 shadow-red-200' 
                        : isLoadingTTS && currentlyReading === 'risks'
                        ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400 shadow-yellow-200'
                        : 'bg-red-500/20 border-red-400 text-white hover:bg-red-500/30 focus:ring-red-400 shadow-red-200'
                    }`}
                    title={
                      isLoadingTTS && currentlyReading === 'risks' ? 'Loading audio...' :
                      currentlyReading === 'risks' ? 'Stop reading' : 'Listen to risk analysis'
                    }
                  >
                    <div className="flex items-center gap-2">
                      {isLoadingTTS && currentlyReading === 'risks' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : currentlyReading === 'risks' ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                      <span className="text-sm font-medium">
                        {isLoadingTTS && currentlyReading === 'risks' ? 'Loading...' :
                         currentlyReading === 'risks' ? 'Stop' : 'Listen'}
                      </span>
                    </div>
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </button>
                </div>
                <div className="space-y-4">
                  {documentData?.analysis?.riskScore !== undefined && (
                    <div className="flex items-start gap-3 py-3">
                      <span className="text-xl">📊</span>
                      <div className="text-foreground text-lg">
                        <p className="font-semibold">{getTranslatedLabel('Risk Score', 'Risk Score:')} {documentData.analysis.riskScore}/100</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                              documentData.analysis.riskScore > 70 ? 'bg-red-600' :
                              documentData.analysis.riskScore > 40 ? 'bg-yellow-500' :
                              'bg-green-600'
                            }`}
                            data-width={documentData.analysis.riskScore}
                          ></div>
                        </div>
                        <style jsx>{`
                          div[data-width] {
                            width: ${documentData.analysis.riskScore}%;
                          }
                        `}</style>
                      </div>
                    </div>
                  )}
                  {(translatedData?.keyRisks || documentData?.analysis?.keyRisks) && Array.isArray(translatedData?.keyRisks || documentData?.analysis?.keyRisks) && (translatedData?.keyRisks || documentData?.analysis?.keyRisks).length > 0 && (
                    <div className="flex items-start gap-3 py-3">
                      <span className="text-xl">🔴</span>
                      <div className="text-foreground text-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold">{getTranslatedLabel('Key Risks', 'Key Risks:')}</p>
                          {translatedData?.keyRisks && currentLanguage !== 'en' && (
                            <span className="text-sm text-muted-foreground italic">
                              (Translated to {SUPPORTED_LANGUAGES[currentLanguage as keyof typeof SUPPORTED_LANGUAGES]})
                            </span>
                          )}
                        </div>
                        <div className="space-y-3">
                          {(translatedData?.keyRisks || documentData?.analysis?.keyRisks || []).map((risk: any, index: number) => (
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
                  {(translatedData?.recommendations || documentData?.analysis?.recommendations) && Array.isArray(translatedData?.recommendations || documentData?.analysis?.recommendations) && (translatedData?.recommendations || documentData?.analysis?.recommendations).length > 0 && (
                    <div className="flex items-start gap-3 py-3">
                      <span className="text-xl">💡</span>
                      <div className="text-foreground text-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">{getTranslatedLabel('Recommendations', 'Recommendations:')}</p>
                          <button
                            onClick={() => readText(getSectionContent('recommendations'), 'recommendations')}
                            disabled={isTranslating || isLoadingTTS}
                            className={`group relative overflow-hidden rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-md backdrop-blur-sm border ${
                              currentlyReading === 'recommendations' 
                                ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400 shadow-red-200' 
                                : isLoadingTTS && currentlyReading === 'recommendations'
                                ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400 shadow-yellow-200'
                                : 'bg-purple-500/20 border-purple-400 text-white hover:bg-purple-500/30 focus:ring-purple-400 shadow-purple-200'
                            }`}
                            title={
                              isLoadingTTS && currentlyReading === 'recommendations' ? 'Loading audio...' :
                              currentlyReading === 'recommendations' ? 'Stop reading' : 'Listen to recommendations'
                            }
                          >
                            <div className="flex items-center gap-1">
                              {isLoadingTTS && currentlyReading === 'recommendations' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : currentlyReading === 'recommendations' ? (
                                <VolumeX className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                              <span className="text-xs font-medium">
                                {isLoadingTTS && currentlyReading === 'recommendations' ? 'Loading...' :
                                 currentlyReading === 'recommendations' ? 'Stop' : 'Listen'}
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                          </button>
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {(translatedData?.recommendations || documentData?.analysis?.recommendations || []).map((rec: any, index: number) => (
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
              {(((translatedData?.obligations || documentData?.analysis?.obligations) && Array.isArray(translatedData?.obligations || documentData?.analysis?.obligations) && (translatedData?.obligations || documentData?.analysis?.obligations).length > 0) || 
                ((translatedData?.rights || documentData?.analysis?.rights) && Array.isArray(translatedData?.rights || documentData?.analysis?.rights) && (translatedData?.rights || documentData?.analysis?.rights).length > 0)) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Obligations */}
                  {(translatedData?.obligations || documentData?.analysis?.obligations) && Array.isArray(translatedData?.obligations || documentData?.analysis?.obligations) && (translatedData?.obligations || documentData?.analysis?.obligations).length > 0 && (
                    <div className="bg-card backdrop-blur-sm rounded-lg p-6 border border-border">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold flex items-center gap-3">
                            <FileText className="h-6 w-6 text-violet-600" />
                            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                              {getTranslatedLabel('Your Obligations', '📋 Your Obligations')}
                            </span>
                          </h2>
                          {translatedData?.obligations && currentLanguage !== 'en' && (
                            <span className="text-sm text-muted-foreground italic">
                              (Translated to {SUPPORTED_LANGUAGES[currentLanguage as keyof typeof SUPPORTED_LANGUAGES]})
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => readText(getSectionContent('obligations'), 'obligations')}
                          disabled={isTranslating || isLoadingTTS}
                          className={`group relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg backdrop-blur-sm border ${
                            currentlyReading === 'obligations' 
                              ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400 shadow-red-200' 
                              : isLoadingTTS && currentlyReading === 'obligations'
                              ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400 shadow-yellow-200'
                              : 'bg-orange-500/20 border-orange-400 text-white hover:bg-orange-500/30 focus:ring-orange-400 shadow-orange-200'
                          }`}
                          title={
                            isLoadingTTS && currentlyReading === 'obligations' ? 'Loading audio...' :
                            currentlyReading === 'obligations' ? 'Stop reading' : 'Listen to obligations'
                          }
                        >
                          <div className="flex items-center gap-2">
                            {isLoadingTTS && currentlyReading === 'obligations' ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : currentlyReading === 'obligations' ? (
                              <VolumeX className="h-5 w-5" />
                            ) : (
                              <Volume2 className="h-5 w-5" />
                            )}
                            <span className="text-sm font-medium">
                              {isLoadingTTS && currentlyReading === 'obligations' ? 'Loading...' :
                               currentlyReading === 'obligations' ? 'Stop' : 'Listen'}
                            </span>
                          </div>
                          {/* Animated background effect */}
                          <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(translatedData?.obligations || documentData?.analysis?.obligations || []).map((obligation: any, index: number) => (
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
                  {(translatedData?.rights || documentData?.analysis?.rights) && Array.isArray(translatedData?.rights || documentData?.analysis?.rights) && (translatedData?.rights || documentData?.analysis?.rights).length > 0 && (
                    <div className="bg-card backdrop-blur-sm rounded-lg p-6 border border-border">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold flex items-center gap-3">
                            <FileText className="h-6 w-6 text-violet-600" />
                            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                              {getTranslatedLabel('Your Rights', '✅ Your Rights')}
                            </span>
                          </h2>
                          {translatedData?.rights && currentLanguage !== 'en' && (
                            <span className="text-sm text-muted-foreground italic">
                              (Translated to {SUPPORTED_LANGUAGES[currentLanguage as keyof typeof SUPPORTED_LANGUAGES]})
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => readText(getSectionContent('rights'), 'rights')}
                          disabled={isTranslating || isLoadingTTS}
                          className={`group relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg backdrop-blur-sm border ${
                            currentlyReading === 'rights' 
                              ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400 shadow-red-200' 
                              : isLoadingTTS && currentlyReading === 'rights'
                              ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400 shadow-yellow-200'
                              : 'bg-green-500/20 border-green-400 text-white hover:bg-green-500/30 focus:ring-green-400 shadow-green-200'
                          }`}
                          title={
                            isLoadingTTS && currentlyReading === 'rights' ? 'Loading audio...' :
                            currentlyReading === 'rights' ? 'Stop reading' : 'Listen to rights'
                          }
                        >
                          <div className="flex items-center gap-2">
                            {isLoadingTTS && currentlyReading === 'rights' ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : currentlyReading === 'rights' ? (
                              <VolumeX className="h-5 w-5" />
                            ) : (
                              <Volume2 className="h-5 w-5" />
                            )}
                            <span className="text-sm font-medium">
                              {isLoadingTTS && currentlyReading === 'rights' ? 'Loading...' :
                               currentlyReading === 'rights' ? 'Stop' : 'Listen'}
                            </span>
                          </div>
                          {/* Animated background effect */}
                          <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(translatedData?.rights || documentData?.analysis?.rights || []).map((right: any, index: number) => (
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
