'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, MessageSquare, Send, User, Bot, Globe, Volume2, Loader2, VolumeX, Square, Clock, AlertTriangle, AlertCircle, CheckCircle, BookOpen, Shield, Search, Mic } from 'lucide-react'
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
  
  // Speech-to-Text state
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Stop speech when language changes
  useEffect(() => {
    // Abort any pending TTS request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
    }
    window.speechSynthesis.cancel()
    setIsReading(false)
    setCurrentlyReading(null)
    setIsLoadingTTS(false)
  }, [currentLanguage])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (currentAudio) {
        currentAudio.pause()
      }
      window.speechSynthesis.cancel()
    }
  }, [])

  // Helper function to get translated UI labels
  const getTranslatedLabel = (key: string, fallback: string = key) => {
    if (currentLanguage === 'en' || !translatedData?.uiLabels) {
      return fallback
    }
    return translatedData.uiLabels[key] || fallback
  }

  // Google Cloud Text-to-Speech functionality (Optimized for Speed)
  const readText = async (text: string, sectionId: string) => {
    // Abort any previous TTS request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
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
      abortControllerRef.current = controller
      
      const timeoutId = setTimeout(() => {
        console.log('TTS request timeout after 15 seconds - aborting...')
        controller.abort()
        abortControllerRef.current = null
      }, 15000) // 15 second timeout for stability

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

      clearTimeout(timeoutId) // Always clear timeout on successful response
      abortControllerRef.current = null // Clear ref on success

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
      // Handle AbortError specifically first (most common during development)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('TTS request was aborted (timeout or user cancellation)')
        setIsLoadingTTS(false)
        setIsReading(false)
        setCurrentlyReading(null)
        return // Silent return for abort errors
      }
      
      console.error('Google TTS Error:', error)
      setIsLoadingTTS(false)
      setIsReading(false)
      setCurrentlyReading(null)
      
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
      }
    } catch (error) {
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
      const response = await apiService.sendChatMessage(documentData.id, query, documentData.extractedText, documentData.documentType)
      
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

  // Speech-to-Text functions
  const startSpeechRecognition = async () => {
    try {
      console.log('🎤 Starting speech recognition...');
      
      // Check if browser supports speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('🎤 Using browser speech recognition...');
        startBrowserSpeechRecognition();
        return;
      }
      
      // Fallback message if no speech recognition available
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        message: 'Speech recognition is not available in your browser. Please type your question instead.'
      }]);
      
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        message: 'Sorry, I couldn\'t access speech recognition. Please type your question instead.'
      }]);
    }
  };

  // Browser Speech Recognition (immediate, auto-send)
  const startBrowserSpeechRecognition = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentLanguage === 'en' ? 'en-US' : 
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
                        currentLanguage === 'hu' ? 'hu-HU' : 'en-US';
      
      setIsRecording(true);
      setIsProcessingSpeech(false);
      
      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
      };
      
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        
        console.log('✅ Speech transcribed:', transcript);
        
        setIsRecording(false);
        setIsProcessingSpeech(true);
        
        // Auto-send the message immediately
        if (transcript.trim()) {
          // Add user message
          const userMessage = { role: 'user' as const, message: transcript.trim() };
          setChatMessages(prev => [...prev, userMessage]);
          
          // Send to API automatically
          if (!documentData) {
            const errorMessage = { role: 'assistant' as const, message: 'Please upload and analyze a document first before asking questions.' };
            setChatMessages(prev => [...prev, errorMessage]);
            setIsProcessingSpeech(false);
            return;
          }
          
          setIsSendingMessage(true);
          
          try {
            const response = await apiService.sendChatMessage(documentData.id, transcript.trim(), documentData.extractedText, documentData.documentType);
            
            if (response.success && response.data) {
              const aiMessage = { role: 'assistant' as const, message: response.data.response };
              setChatMessages(prev => [...prev, aiMessage]);
            } else {
              const errorMessage = { 
                role: 'assistant' as const, 
                message: `Sorry, I encountered an error: ${response.error || 'Unknown error'}. Please try again.`
              };
              setChatMessages(prev => [...prev, errorMessage]);
            }
          } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = { 
              role: 'assistant' as const, 
              message: 'Sorry, there was a problem processing your request. Please try again.'
            };
            setChatMessages(prev => [...prev, errorMessage]);
          } finally {
            setIsSendingMessage(false);
            setIsProcessingSpeech(false);
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsProcessingSpeech(false);
        
        let errorMessage = 'Speech recognition error. Please try again.';
        if (event.error === 'not-allowed') {
          errorMessage = 'Microphone access denied. Please allow microphone permissions and try again.';
        } else if (event.error === 'no-speech') {
          errorMessage = 'No speech detected. Please speak clearly and try again.';
        }
        
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          message: errorMessage
        }]);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        if (!isProcessingSpeech) {
          setIsProcessingSpeech(false);
        }
      };
      
      recognition.start();
      
    } catch (error) {
      console.error('Browser speech recognition error:', error);
      setIsRecording(false);
      setIsProcessingSpeech(false);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        message: 'Speech recognition is not supported in your browser. Please type your question instead.'
      }]);
    }
  };

  const stopSpeechRecognition = () => {
    setIsRecording(false);
    setIsProcessingSpeech(false);
  };

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
          'Legal Lens Summary': 'Legal Lens Summary',
          'Key Terms': 'Key Terms',
          'Risk Analysis': 'Risk Analysis', 
          'Risk Score': 'Risk Score',
          'Key Risks': 'Key Risks',
          'Recommendations': 'Recommendations',
          'Your Obligations': 'Your Obligations',
          'Your Rights': 'Your Rights'
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
                  disabled={isTranslating || !documentData}
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

              {/* Document Summary - Hero Style */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-xl">
                        <FileText className="h-8 w-8 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {getTranslatedLabel('Legal Lens Summary', 'Document Summary')}
                        </h3>
                        <p className="text-gray-400">AI-powered breakdown in plain English</p>
                      </div>
                    </div>
                    <button
                      onClick={() => readText(getSectionContent('summary'), 'summary')}
                      disabled={isTranslating || isLoadingTTS}
                      className={`group relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-sm border ${
                        currentlyReading === 'summary' 
                          ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400' 
                          : isLoadingTTS && currentlyReading === 'summary'
                          ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400'
                          : 'bg-blue-500/20 border-blue-400 text-white hover:bg-blue-500/30 focus:ring-blue-400'
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
                  
                  {(translatedData?.summary || documentData?.analysis.summary) && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <p className="text-gray-100 text-lg leading-relaxed">
                        {translatedData?.summary || documentData?.analysis.summary}
                      </p>
                      {translatedData?.summary && currentLanguage !== 'en' && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          Translated to {SUPPORTED_LANGUAGES[currentLanguage as keyof typeof SUPPORTED_LANGUAGES]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Key Terms Section */}
              {(translatedData?.keyPoints || documentData?.analysis?.keyTerms) && Array.isArray(translatedData?.keyPoints || documentData?.analysis?.keyTerms) && (translatedData?.keyPoints || documentData?.analysis?.keyTerms).length > 0 && (
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                          <Search className="h-8 w-8 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">
                            {getTranslatedLabel('Key Terms', 'Key Terms Explained')}
                          </h3>
                          <p className="text-gray-400">Important legal terms made simple</p>
                        </div>
                      </div>
                      <button
                        onClick={() => readText(getSectionContent('keyTerms'), 'keyTerms')}
                        disabled={isTranslating || isLoadingTTS}
                        className={`group relative overflow-hidden rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 backdrop-blur-sm border ${
                          currentlyReading === 'keyTerms' 
                            ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400' 
                            : isLoadingTTS && currentlyReading === 'keyTerms'
                            ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400'
                            : 'bg-indigo-500/20 border-indigo-400 text-white hover:bg-indigo-500/30 focus:ring-indigo-400'
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
                    
                    <div className="grid gap-4">
                      {(translatedData?.keyPoints || (documentData?.analysis?.keyTerms ?? [])).map((term: any, index: number) => (
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
                <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50">
                  
                  {/* Risk Score Dashboard */}
                  {documentData?.analysis?.riskScore !== undefined && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-500/20 rounded-xl">
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              {getTranslatedLabel('Risk Analysis', 'Risk Assessment')}
                            </h3>
                            <p className="text-gray-400">AI-powered risk evaluation</p>
                          </div>
                        </div>
                        <button
                          onClick={() => readText(getSectionContent('risks'), 'risks')}
                          disabled={isTranslating || isLoadingTTS}
                          className={`group relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-sm border ${
                            currentlyReading === 'risks' 
                              ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400' 
                              : isLoadingTTS && currentlyReading === 'risks'
                              ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400'
                              : 'bg-red-500/20 border-red-400 text-white hover:bg-red-500/30 focus:ring-red-400'
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
                      
                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-semibold text-gray-200">
                            {getTranslatedLabel('Risk Score', 'Overall Risk Score')}
                          </span>
                          <span className="text-3xl font-bold text-white">{documentData.analysis.riskScore}/100</span>
                        </div>
                        
                        <div className="relative w-full bg-gray-700 rounded-full h-4 mb-2">
                          <motion.div 
                            className={`h-4 rounded-full ${
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
                  {(translatedData?.keyRisks || documentData?.analysis?.keyRisks) && Array.isArray(translatedData?.keyRisks || documentData?.analysis?.keyRisks) && (translatedData?.keyRisks || documentData?.analysis?.keyRisks).length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-red-400" />
                        {getTranslatedLabel('Key Risks', 'Key Risk Areas')}
                      </h4>
                      
                      <div className="grid gap-4">
                        {(translatedData?.keyRisks || documentData?.analysis?.keyRisks || []).map((risk: any, index: number) => (
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
                  {(translatedData?.recommendations || documentData?.analysis?.recommendations) && Array.isArray(translatedData?.recommendations || documentData?.analysis?.recommendations) && (translatedData?.recommendations || documentData?.analysis?.recommendations).length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                          {getTranslatedLabel('Recommendations', 'Expert Recommendations')}
                        </h4>
                        <button
                          onClick={() => readText(getSectionContent('recommendations'), 'recommendations')}
                          disabled={isTranslating || isLoadingTTS}
                          className={`group relative overflow-hidden rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 backdrop-blur-sm border ${
                            currentlyReading === 'recommendations' 
                              ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400' 
                              : isLoadingTTS && currentlyReading === 'recommendations'
                              ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400'
                              : 'bg-green-500/20 border-green-400 text-white hover:bg-green-500/30 focus:ring-green-400'
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
                      
                      <div className="grid gap-3">
                        {(translatedData?.recommendations || documentData?.analysis?.recommendations || []).map((rec: any, index: number) => (
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
              {(((translatedData?.obligations || documentData?.analysis?.obligations) && Array.isArray(translatedData?.obligations || documentData?.analysis?.obligations) && (translatedData?.obligations || documentData?.analysis?.obligations).length > 0) || 
                ((translatedData?.rights || documentData?.analysis?.rights) && Array.isArray(translatedData?.rights || documentData?.analysis?.rights) && (translatedData?.rights || documentData?.analysis?.rights).length > 0)) && (
                <div className="grid lg:grid-cols-2 gap-8">
                  
                  {/* Obligations */}
                  {(translatedData?.obligations || documentData?.analysis?.obligations) && Array.isArray(translatedData?.obligations || documentData?.analysis?.obligations) && (translatedData?.obligations || documentData?.analysis?.obligations).length > 0 && (
                    <motion.div
                      className="relative group"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50">
                        
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-500/20 rounded-xl">
                              <BookOpen className="h-8 w-8 text-orange-400" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">
                                {getTranslatedLabel('Your Obligations', 'Your Obligations')}
                              </h3>
                              <p className="text-gray-400">Legal responsibilities and duties</p>
                            </div>
                          </div>
                          <button
                            onClick={() => readText(getSectionContent('obligations'), 'obligations')}
                            disabled={isTranslating || isLoadingTTS}
                            className={`group relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-sm border ${
                              currentlyReading === 'obligations' 
                                ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400' 
                                : isLoadingTTS && currentlyReading === 'obligations'
                                ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400'
                                : 'bg-orange-500/20 border-orange-400 text-white hover:bg-orange-500/30 focus:ring-orange-400'
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
                        
                        <div className="space-y-4">
                          {(translatedData?.obligations || documentData?.analysis?.obligations || []).map((obligation: any, index: number) => (
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
                  {(translatedData?.rights || documentData?.analysis?.rights) && Array.isArray(translatedData?.rights || documentData?.analysis?.rights) && (translatedData?.rights || documentData?.analysis?.rights).length > 0 && (
                    <motion.div
                      className="relative group"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:border-gray-600/50">
                        
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-xl">
                              <Shield className="h-8 w-8 text-green-400" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">
                                {getTranslatedLabel('Your Rights', 'Your Rights')}
                              </h3>
                              <p className="text-gray-400">Legal protections and entitlements</p>
                            </div>
                          </div>
                          <button
                            onClick={() => readText(getSectionContent('rights'), 'rights')}
                            disabled={isTranslating || isLoadingTTS}
                            className={`group relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-sm border ${
                              currentlyReading === 'rights' 
                                ? 'bg-red-500/20 border-red-400 text-white focus:ring-red-400' 
                                : isLoadingTTS && currentlyReading === 'rights'
                                ? 'bg-yellow-400/20 border-yellow-400 text-white focus:ring-yellow-400'
                                : 'bg-green-500/20 border-green-400 text-white hover:bg-green-500/30 focus:ring-green-400'
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
                        
                        <div className="space-y-4">
                          {(translatedData?.rights || documentData?.analysis?.rights || []).map((right: any, index: number) => (
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
                <div className="relative border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl transition-all duration-300 hover:border-gray-600/50">
                  
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
                          <h4 className="text-xl font-semibold text-white mb-4">Try asking questions like:</h4>
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
                              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
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
                            <div className={`rounded-xl p-4 leading-relaxed ${
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
                            placeholder={isRecording ? "🎤 Listening..." : isProcessingSpeech ? "Processing speech..." : "Ask a question about your document..."}
                            className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                            disabled={isRecording || isProcessingSpeech}
                          />
                        </div>
                        
                        {/* Speech Recognition Button */}
                        <motion.button
                          onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
                          disabled={isProcessingSpeech || isSendingMessage}
                          className={`px-4 py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg ${
                            isRecording 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isRecording ? (
                            <Square className="h-5 w-5" />
                          ) : isProcessingSpeech ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                        </motion.button>
                        
                        {/* Send Button */}
                        <motion.button
                          onClick={handleSendMessage}
                          disabled={!currentMessage.trim() || isSendingMessage || isRecording || isProcessingSpeech}
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
                    className="relative px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 border border-violet-500/30"
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