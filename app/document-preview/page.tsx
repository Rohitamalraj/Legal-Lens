"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from "@/components/site-header"
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, ChevronLeft, ChevronUp, ChevronDown } from 'lucide-react'
import { Footer } from "@/components/footer"
import { WorkflowProgress } from '@/components/workflow-progress'

interface DocumentData {
  id: string
  fileName: string
  fileSize: number
  documentType: string
  isLegalDocument: boolean
  confidence: number
  extractedText: string
  analysis: any
  uploadTime: string
}

export default function DocumentPreviewPage() {
  const router = useRouter()
  const [documentData, setDocumentData] = useState<DocumentData | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get document data from sessionStorage
    const storedData = sessionStorage.getItem('uploadedDocument')
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setDocumentData(parsedData)
      } catch (error) {
        console.error('Error parsing stored document data:', error)
        router.push('/')
      }
    } else {
      // No document data found, redirect to upload
      router.push('/')
    }
    setIsLoading(false)
  }, [router])

  const handleContinueToSummary = () => {
    if (documentData) {
      // Keep the document data in sessionStorage for the summary page
      router.push('/document-summary')
    }
  }

  const handleBackToUpload = () => {
    router.push('/document-upload')
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const truncateText = (text: string, maxLength = 800) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (isLoading) {
    return (
      <main className="min-h-[100dvh] text-white">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-700 rounded"></div>
              <div className="h-96 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!documentData) {
    return (
      <main className="min-h-[100dvh] text-white">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">No Document Found</h1>
            <p className="text-gray-400 mb-6">Please upload a document first.</p>
            <Button onClick={() => router.push('/')}>
              Go to Upload
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] text-white">
      <SiteHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Document Preview
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Review your uploaded document content before proceeding to AI analysis.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Workflow Progress */}
            <WorkflowProgress currentStep={2} />

            {/* Document Info Card */}
            <div className="liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl rounded-lg overflow-hidden">
              {/* Document Header */}
              <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-white truncate">
                      {documentData.fileName}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <span>{formatFileSize(documentData.fileSize)}</span>
                      <span>•</span>
                      <span>{documentData.documentType}</span>
                      <span>•</span>
                      <span>
                        {documentData.isLegalDocument ? 'Legal Document' : 'General Document'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className="text-lg font-semibold text-green-400">
                      {Math.round(documentData.confidence * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Content Preview */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Document Content</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-300 hover:text-white"
                  >
                    {isExpanded ? (
                      <>
                        Show Less
                        <ChevronUp className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Show More
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-white/10">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
                    {isExpanded ? documentData.extractedText : truncateText(documentData.extractedText)}
                  </pre>
                </div>

                {documentData.extractedText.length > 800 && !isExpanded && (
                  <p className="text-xs text-gray-400 mt-3">
                    Showing first 800 characters. Click "Show More" to view full content.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-white/10 bg-white/5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBackToUpload}
                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Upload
                  </Button>
                  <Button
                    onClick={handleContinueToSummary}
                    className="flex-1 bg-purple-600 hover:bg-purple-500"
                  >
                    Summarize Document
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}