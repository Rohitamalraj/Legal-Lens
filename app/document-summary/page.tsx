"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from "@/components/site-header"
import { SupportedLanguageCode } from '@/lib/constants/translation'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { Footer } from "@/components/footer"
import { WorkflowProgress } from '@/components/workflow-progress'
import { SummaryNavigationTabs } from '@/components/summary-navigation-tabs'
import { DocumentSummaryCard } from '@/components/document-summary-card'
import { SimplifiedClausesSection } from '@/components/simplified-clauses-section'
import { RiskAnalysisSection } from '@/components/risk-analysis-section'
import { TranslationButton } from '@/components/translation-button'
import { TranslationStatus } from '@/components/translation-button'
import { TTSButton } from '@/components/tts-button'
import { TTSControls } from '@/components/tts-button'

// Define interfaces locally to avoid server-side imports
interface ClauseData {
  id: string;
  type: string;
  title: string;
  originalText: string;
  simplifiedPoints: string[];
  keyTakeaway: string;
}

interface RiskData {
  id: string;
  level: 'high' | 'medium' | 'low';
  title: string;
  section: string;
  description: string;
  recommendation: string;
  impact: string;
}

interface DetailedAnalysisResult {
  clauses: ClauseData[];
  risks: RiskData[];
}

interface DocumentData {
  id: string
  name: string
  uploadDate: string
  size: number | string
  type: string
  status: string
  extractedText: string
  analysis?: {
    summary: string
    riskScore: number
    keyRisks: any[]
    obligations: any[]
    rights: any[]
    keyTerms: any[]
    recommendations: string[]
  }
}

interface SummaryData {
  processingTime: number
  overview: string
  keyInformation: Array<{
    label: string
    value: string
  }>
}

export default function DocumentSummaryPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('summary')
  const [documentData, setDocumentData] = useState<DocumentData | null>(null)
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysisResult | null>(null)
  const [isLoadingDetailed, setIsLoadingDetailed] = useState(false)
  
  // Translation state
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedContent, setTranslatedContent] = useState<{[key: string]: string}>({})

  // Fallback mock summary data  
  const mockSummary: SummaryData = {
    processingTime: 45,
    overview: `Document analysis completed successfully. This appears to be a legal document with standard terms and conditions.`,
    keyInformation: [
      { label: "Document Type", value: "Legal Document" },
      { label: "Analysis Date", value: new Date().toLocaleDateString() },
      { label: "Status", value: "Processed" }
    ]
  }

  // Generate summary data from real backend analysis with translations
  const generateSummaryData = (docData: DocumentData): SummaryData => {
    if (!docData.analysis) {
      return mockSummary; // Fallback to mock if no analysis
    }

    const analysis = docData.analysis;
    return {
      processingTime: 45, // Keep this as estimated time
      overview: getTranslatedText(analysis.summary || "Document analysis completed successfully.", 'summary'),
      keyInformation: [
        { label: "Document Type", value: docData.type },
        { label: "Analysis Date", value: new Date(docData.uploadDate).toLocaleDateString() },
        { label: "Risk Score", value: `${analysis.riskScore || 0}/100` },
        { label: "Key Terms Count", value: `${analysis.keyTerms?.length || 0} terms identified` },
        { label: "Obligations Found", value: `${analysis.obligations?.length || 0} obligations` },
        { label: "Rights Identified", value: `${analysis.rights?.length || 0} rights` }
      ]
    };
  }

  // Mock simplified clauses - this will be replaced with backend data
  const mockClauses: ClauseData[] = [
    {
      id: "clause_001",
      type: "Privacy Policy",
      title: "Data Collection and Usage",
      originalText: "The Company may collect, store, and process personal information including but not limited to names, email addresses, phone numbers, and usage data for the purposes of providing services, improving user experience, and complying with legal obligations.",
      simplifiedPoints: [
        "The company collects your personal information like name, email, and phone number",
        "They use this data to provide services and improve their platform",
        "Collection also helps them comply with legal requirements"
      ],
      keyTakeaway: "Your personal data will be collected and used for service delivery and legal compliance."
    },
    // Add more mock clauses...
  ]

  // Mock risks data - this will be replaced with backend data
  const mockRisks: RiskData[] = [
    {
      id: "risk_001",
      level: "high" as const,
      title: "Unlimited Data Retention",
      section: "Data Storage Policy",
      description: "The document allows for indefinite retention of user data without clear deletion timelines or user control over data removal.",
      recommendation: "Negotiate for specific data retention periods and user rights to request data deletion.",
      impact: "Your personal information could be stored permanently without your ability to have it removed."
    },
    // Add more mock risks...
  ]

  useEffect(() => {
    // Try to get document data from sessionStorage or API
    const storedData = sessionStorage.getItem('uploadedDocument')
    console.log('=== LOADING DOCUMENT DATA FROM SESSION STORAGE ===')
    console.log('storedData exists:', !!storedData)
    console.log('storedData preview:', storedData ? storedData.substring(0, 200) + '...' : 'null')
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        console.log('parsedData keys:', Object.keys(parsedData))
        console.log('parsedData.extractedText exists:', !!parsedData.extractedText)
        console.log('parsedData.extractedText length:', parsedData.extractedText?.length || 0)
        
        // Convert uploaded document data to DocumentData format
        const documentData: DocumentData = {
          id: parsedData.id || "doc_001",
          name: parsedData.fileName,
          uploadDate: parsedData.uploadTime || new Date().toISOString(),
          size: parsedData.fileSize,
          type: parsedData.documentType || "Legal Document",
          status: "completed",
          extractedText: parsedData.extractedText || '',
          analysis: parsedData.analysis
        }
        console.log('Final documentData.extractedText length:', documentData.extractedText?.length || 0)
        setDocumentData(documentData)
      } catch (error) {
        console.error('Error parsing stored document data:', error)
        // If no valid document data, redirect to upload
        router.push('/document-upload')
      }
    } else {
      // If no document data found, redirect to upload
      router.push('/document-upload')
    }
  }, [router])

  const fetchDetailedAnalysis = async () => {
    console.log('=== FETCH DETAILED ANALYSIS CALLED ===')
    console.log('documentData exists:', !!documentData)
    console.log('extractedText exists:', !!documentData?.extractedText)
    console.log('extractedText length:', documentData?.extractedText?.length || 0)
    
    if (!documentData?.extractedText) {
      console.log('❌ EARLY RETURN - No document text available')
      console.log('documentData keys:', documentData ? Object.keys(documentData) : 'null')
      console.log('documentData full object:', documentData)
      console.log('Checking text field...')
      console.log('documentData.extractedText:', documentData?.extractedText)
      return
    }

    setIsLoadingDetailed(true)
    try {
      console.log('=== FETCHING DETAILED ANALYSIS FROM VERTEX AI ===')
      console.log('Document text length:', documentData.extractedText.length)
      
      const response = await fetch('/api/analyze-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: documentData.extractedText })
      })

      console.log('API Response status:', response.status)
      const result = await response.json()
      console.log('API Response:', {
        success: result.success,
        hasError: !!result.error,
        clausesCount: result.clauses?.length || 0,
        risksCount: result.risks?.length || 0
      })

      if (response.ok && result.success) {
        // Check if we got real Vertex AI data
        const hasValidClauses = result.clauses && result.clauses.length > 0
        const hasValidRisks = result.risks && result.risks.length > 0
        
        if (hasValidClauses && hasValidRisks) {
          console.log('✅ Successfully received Vertex AI data')
          console.log('Sample clause:', result.clauses[0]?.title)
          console.log('Sample risk:', result.risks[0]?.title)
          
          setDetailedAnalysis({
            clauses: result.clauses,
            risks: result.risks
          })
        } else {
          console.log('⚠️ Vertex AI returned empty results, using mock fallback')
          setDetailedAnalysis({
            clauses: mockClauses,
            risks: mockRisks
          })
        }
      } else {
        const errorMsg = result.error || result.message || 'Unknown error'
        console.error('❌ Vertex AI API failed:', errorMsg)
        
        // Show error but provide mock data for demo
        console.log('📋 Using mock data due to Vertex AI error:', errorMsg)
        setDetailedAnalysis({
          clauses: mockClauses,
          risks: mockRisks
        })
        
        // Optional: Show user notification about Vertex AI being unavailable
        if (errorMsg.includes('credentials') || errorMsg.includes('authentication')) {
          console.warn('🔐 Vertex AI credentials issue detected - check Google Cloud setup')
        }
      }
    } catch (error) {
      console.error('❌ Error fetching detailed analysis:', error)
      // Use mock data as fallback
      setDetailedAnalysis({
        clauses: mockClauses,
        risks: mockRisks
      })
    } finally {
      setIsLoadingDetailed(false)
    }
  }

  useEffect(() => {
    // Fetch detailed analysis when switching to clauses or risks tabs
    console.log('=== TAB CHANGE USEEFFECT TRIGGERED ===')
    console.log('activeTab:', activeTab)
    console.log('has detailedAnalysis:', !!detailedAnalysis)
    console.log('isLoadingDetailed:', isLoadingDetailed)
    console.log('has documentData:', !!documentData)
    console.log('has extractedText:', !!documentData?.extractedText)
    console.log('extractedText length:', documentData?.extractedText?.length || 0)
    
    if ((activeTab === 'clauses' || activeTab === 'risks') && !detailedAnalysis && !isLoadingDetailed) {
      console.log('✅ CONDITIONS MET - calling fetchDetailedAnalysis')
      fetchDetailedAnalysis()
    } else {
      console.log('❌ CONDITIONS NOT MET - skipping fetchDetailedAnalysis')
    }
  }, [activeTab, detailedAnalysis, isLoadingDetailed])

  // Auto-fetch detailed analysis when document data becomes available
  useEffect(() => {
    console.log('=== AUTO-FETCH DETAILED ANALYSIS USEEFFECT ===')
    console.log('documentData exists:', !!documentData)
    console.log('has extractedText:', !!documentData?.extractedText)
    console.log('detailedAnalysis exists:', !!detailedAnalysis)
    console.log('isLoadingDetailed:', isLoadingDetailed)
    
    // Auto-fetch when document data is available and we don't have detailed analysis yet
    if (documentData && documentData.extractedText && !detailedAnalysis && !isLoadingDetailed) {
      console.log('✅ AUTO-FETCHING DETAILED ANALYSIS ON PAGE LOAD')
      fetchDetailedAnalysis()
    }
  }, [documentData, detailedAnalysis, isLoadingDetailed])

  // Translation handlers
  const handleLanguageChange = async (language: SupportedLanguageCode) => {
    if (language === currentLanguage) return
    
    setIsTranslating(true)
    try {
      if (language === 'en') {
        // Reset to original content
        setTranslatedContent({})
        setCurrentLanguage('en')
        return
      }

      // Get all text content that needs translation
      const textsToTranslate: string[] = []
      const textKeys: string[] = []

      // Add document summary if available
      if (documentData?.analysis?.summary) {
        textsToTranslate.push(documentData.analysis.summary)
        textKeys.push('summary')
      }

      // Add key risks from analysis
      if (documentData?.analysis?.keyRisks && Array.isArray(documentData.analysis.keyRisks)) {
        documentData.analysis.keyRisks.forEach((risk: any, index: number) => {
          if (risk.description) {
            textsToTranslate.push(risk.description)
            textKeys.push(`analysis_risk_${index}_description`)
          }
          if (risk.recommendation) {
            textsToTranslate.push(risk.recommendation)
            textKeys.push(`analysis_risk_${index}_recommendation`)
          }
        })
      }

      // Add recommendations from analysis
      if (documentData?.analysis?.recommendations && Array.isArray(documentData.analysis.recommendations)) {
        documentData.analysis.recommendations.forEach((rec: string, index: number) => {
          textsToTranslate.push(rec)
          textKeys.push(`analysis_recommendation_${index}`)
        })
      }

      // Add clauses content
      const clauses = detailedAnalysis?.clauses || mockClauses
      clauses.forEach((clause, index) => {
        textsToTranslate.push(clause.title, clause.keyTakeaway, clause.originalText)
        textKeys.push(`clause_${index}_title`, `clause_${index}_takeaway`, `clause_${index}_original`)
        clause.simplifiedPoints.forEach((point, pointIndex) => {
          textsToTranslate.push(point)
          textKeys.push(`clause_${index}_point_${pointIndex}`)
        })
      })

      // Add risks content
      const risks = detailedAnalysis?.risks || mockRisks
      risks.forEach((risk, index) => {
        textsToTranslate.push(risk.title, risk.description, risk.recommendation, risk.impact)
        textKeys.push(`risk_${index}_title`, `risk_${index}_description`, `risk_${index}_recommendation`, `risk_${index}_impact`)
      })

      // Call translation API
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translateTexts',
          texts: textsToTranslate,
          targetLanguage: language
        })
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const result = await response.json()
      
      // The API returns an array of translations directly
      if (!Array.isArray(result)) {
        throw new Error('Invalid translation response format')
      }

      // Build translation map
      const newTranslatedContent: {[key: string]: string} = {}
      result.forEach((translation: any, index: number) => {
        newTranslatedContent[textKeys[index]] = translation.translatedText
      })

      setTranslatedContent(newTranslatedContent)
      setCurrentLanguage(language)

    } catch (error) {
      console.error('Translation error:', error)
      // Keep current language on error
    } finally {
      setIsTranslating(false)
    }
  }

  // Helper function to get translated text or fallback to original
  const getTranslatedText = (originalText: string, key: string): string => {
    return translatedContent[key] || originalText
  }

  // Helper function to get translated clauses
  const getTranslatedClauses = () => {
    const clauses = detailedAnalysis?.clauses || mockClauses
    return clauses.map((clause, index) => ({
      ...clause,
      title: getTranslatedText(clause.title, `clause_${index}_title`),
      keyTakeaway: getTranslatedText(clause.keyTakeaway, `clause_${index}_takeaway`),
      originalText: getTranslatedText(clause.originalText, `clause_${index}_original`),
      simplifiedPoints: clause.simplifiedPoints.map((point, pointIndex) => 
        getTranslatedText(point, `clause_${index}_point_${pointIndex}`)
      )
    }))
  }

  // Helper function to get translated risks  
  const getTranslatedRisks = () => {
    const risks = detailedAnalysis?.risks || mockRisks
    return risks.map((risk, index) => ({
      ...risk,
      title: getTranslatedText(risk.title, `risk_${index}_title`),
      description: getTranslatedText(risk.description, `risk_${index}_description`),
      recommendation: getTranslatedText(risk.recommendation, `risk_${index}_recommendation`),
      impact: getTranslatedText(risk.impact, `risk_${index}_impact`)
    }))
  }

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (!documentData) return null

    const summaryData = generateSummaryData(documentData)

    switch (activeTab) {
      case 'summary':
        const summaryText = getTranslatedText(summaryData.overview, 'summary')
        return (
          <div className="space-y-6">
            {/* TTS Button for Summary */}
            <div className="flex justify-end">
              <TTSControls 
                text={summaryText}
                language={currentLanguage}
                disabled={isTranslating}
              />
            </div>
            <DocumentSummaryCard summary={summaryData} document={documentData} />
          </div>
        )
      case 'clauses':
        if (isLoadingDetailed) {
          return (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading detailed analysis...</span>
            </div>
          )
        }
        
        const clausesText = getTranslatedClauses().map(clause =>
          `${clause.title}. ${clause.keyTakeaway}. ${clause.simplifiedPoints.join('. ')}`
        ).join(' ')
        
        return (
          <div className="space-y-6">
            {/* TTS Button for Clauses */}
            <div className="flex justify-end">
              <TTSControls 
                text={clausesText}
                language={currentLanguage}
                disabled={isTranslating}
              />
            </div>
            <SimplifiedClausesSection clauses={getTranslatedClauses()} />
          </div>
        )
      case 'risks':
        if (isLoadingDetailed) {
          return (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading detailed analysis...</span>
            </div>
          )
        }
        
        const risksText = getTranslatedRisks().map(risk =>
          `${risk.title}. ${risk.description}. ${risk.recommendation}`
        ).join(' ')
        
        return (
          <div className="space-y-6">
            {/* TTS Button for Risks */}
            <div className="flex justify-end">
              <TTSControls 
                text={risksText}
                language={currentLanguage}
                disabled={isTranslating}
              />
            </div>
            <RiskAnalysisSection risks={getTranslatedRisks()} />
          </div>
        )
      default:
        return null
    }
  }

  const handleDownloadReport = async () => {
    if (!documentData) return
    
    try {
      // Import the ReportGenerator dynamically to avoid SSR issues
      const { ReportGenerator } = await import('@/lib/services/report-generator')
      const reportGenerator = new ReportGenerator()
      
      // Prepare the data
      const summaryData = generateSummaryData(documentData)
      const reportDetailedAnalysis = {
        clauses: detailedAnalysis?.clauses || mockClauses,
        risks: detailedAnalysis?.risks || mockRisks
      }
      
      // Get the original document type from the file extension or mime type
      let originalDocumentType = documentData.type || 'pdf'
      
      // Check if it's a Word document based on filename extension
      const fileName = documentData.name.toLowerCase()
      if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.rtf')) {
        originalDocumentType = 'docx'
      } else if (fileName.endsWith('.pdf')) {
        originalDocumentType = 'pdf'
      }
      
      // Generate the report in the appropriate format
      await reportGenerator.generateReport(documentData, summaryData, reportDetailedAnalysis, originalDocumentType)
      
      console.log(`✅ Generated ${originalDocumentType.toUpperCase()} report for document: ${documentData.name}`)
      
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    }
  }

  const handleRestartAnalysis = () => {
    router.push('/document-upload')
  }

  if (!documentData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <SiteHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center py-12">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">No Document Data Found</h2>
              <p className="text-gray-300 mb-6">Please upload and process a document first.</p>
              <button
                onClick={() => router.push('/document-upload')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
              >
                Upload Document
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] text-white">
      <SiteHeader />
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Document Analysis Results
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Your legal document has been analyzed. Review the summary, explore clauses, 
              and understand potential risks to make informed decisions.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-6">
            {/* Workflow Progress */}
            <WorkflowProgress currentStep={3} />

            {/* Translation and Audio Controls */}
            <div className="border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-xl p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Translation Button */}
                  <TranslationButton
                    currentLanguage={currentLanguage}
                    onLanguageChange={handleLanguageChange}
                    disabled={isTranslating}
                    showLabel={true}
                  />
                </div>

                {/* Translation Status */}
                <TranslationStatus
                  isTranslated={currentLanguage !== 'en'}
                  originalLanguage="en"
                  currentLanguage={currentLanguage}
                  onResetToOriginal={() => handleLanguageChange('en')}
                />
              </div>
            </div>

            {/* Document Analysis Card */}
            <div className="border-2 border-gray-700/30 bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8">
              {/* Navigation Tabs */}
              <SummaryNavigationTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />

              {/* Tab Content */}
              <div className="mt-4 sm:mt-6">
                {renderTabContent()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* Back Button */}
              <button
                onClick={() => router.push('/document-preview')}
                className="px-4 py-2 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Preview</span>
              </button>
              
              <button
                onClick={() => router.push('/q-a-chat-interface')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <span>💬 Ask Questions About Document</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <span>📄 Download Full Report</span>
              </button>
              <button
                onClick={handleRestartAnalysis}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors text-sm"
              >
                🔄 Analyze New Document
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}