"use client"

import type { Metadata } from "next";
import { useState, useCallback } from 'react'
import { SiteHeader } from "@/components/site-header";
import { useRouter } from 'next/navigation'
import { apiService } from '@/lib/api'
import { Footer } from "@/components/footer"
import { FileUploadZone } from '@/components/file-upload-zone'
import { SupportedFormats } from '@/components/supported-formats'
import { DocumentUploadSuccess } from '@/components/document-upload-success'
import { UploadError } from '@/components/upload-error'
import { WorkflowProgress } from '@/components/workflow-progress'

interface UploadedFile {
  file: File
  documentData: {
    id: string
    filename: string
    documentType: string
    isLegalDocument: boolean
    confidence: number
    analysis: any
    uploadTime: string
  }
}

interface UploadError {
  type: 'validation' | 'upload' | 'processing' | 'network'
  message: string
  details?: string
}

export default function DocumentUploadPage() {
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<UploadError | null>(null)

  // File validation
  const validateFile = (file: File): UploadError | null => {
    const supportedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    const maxSizeDoc = 10 * 1024 * 1024 // 10MB for documents

    if (!supportedTypes.includes(file.type)) {
      return {
        type: 'validation',
        message: 'Unsupported file format',
        details: `Please upload a PDF, DOCX, or DOC file. Received: ${file.type}`
      }
    }

    if (file.size > maxSizeDoc) {
      return {
        type: 'validation',
        message: 'File size too large',
        details: `Maximum size is 10MB for documents. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`
      }
    }

    return null
  }

  // Mock text extraction
  const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const extension = file.name.split('.').pop()?.toLowerCase()
        
        switch (extension) {
          case 'pdf':
            resolve(`SAMPLE LEGAL DOCUMENT ANALYSIS

This is a simulated text extraction from your PDF document. In a real application, this would contain the actual text content from your uploaded PDF file.

Key Legal Points Identified:
• Contract terms and conditions
• Liability clauses
• Termination procedures
• Payment obligations
• Dispute resolution mechanisms

Document Summary:
This appears to be a comprehensive legal agreement with multiple clauses covering various aspects of the business relationship. The document contains standard legal language with specific provisions for both parties.

Note: This is sample text for demonstration purposes. Your actual document content would appear here after processing.`)
          
          case 'docx':
          case 'doc':
            resolve(`LEGAL DOCUMENT CONTENT EXTRACTED

This represents the extracted text from your Word document. The AI has successfully processed your document file and identified the following structure:

1. Introduction and Parties
2. Terms of Agreement
3. Obligations and Responsibilities
4. Financial Provisions
5. Legal Compliance Requirements
6. Termination Clauses
7. Signatures and Dates

Legal Analysis Preview:
The document contains legally binding language with specific references to applicable laws and regulations. Key areas of focus include liability limitations, intellectual property rights, and dispute resolution procedures.

Sample extracted content would continue here with the full text of your document...`)
          
          default:
            resolve('Text extraction completed. Content analysis ready for review.')
        }
      }, 2000) // Simulate processing time
    })
  }

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setError(null)
    
    // Validate file
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Start upload progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Upload document using real API
      const uploadResult = await apiService.uploadDocument(file)
      
      // Clear progress interval
      clearInterval(progressInterval)
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed')
      }

      // Complete upload
      setUploadProgress(100)
      
      setTimeout(() => {
        setUploadedFile({ 
          file, 
          documentData: uploadResult.data! 
        })
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)

    } catch (error) {
      setIsUploading(false)
      setUploadProgress(0)
      setError({
        type: 'upload',
        message: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }, [])

  // Handle continue to analysis
  const handleContinue = () => {
    if (uploadedFile) {
      // Store the uploaded file data in sessionStorage for the preview page
      sessionStorage.setItem('uploadedDocument', JSON.stringify({
        id: uploadedFile.documentData.id,
        fileName: uploadedFile.file.name,
        fileSize: uploadedFile.file.size,
        documentType: uploadedFile.documentData.documentType,
        isLegalDocument: uploadedFile.documentData.isLegalDocument,
        confidence: uploadedFile.documentData.confidence,
        extractedText: (uploadedFile.documentData as any).extractedText || '', // Safe access to extracted text
        analysis: uploadedFile.documentData.analysis,
        uploadTime: uploadedFile.documentData.uploadTime
      }))
      
      // Navigate to document preview page (step 2)
      router.push('/document-preview')
    }
  }

  // Handle file removal
  const handleRemoveFile = () => {
    setUploadedFile(null)
    setError(null)
  }

  // Handle error retry
  const handleRetry = () => {
    setError(null)
  }

  // Handle error dismiss
  const handleDismissError = () => {
    setError(null)
  }

  return (
    <main className="min-h-[100dvh] text-white">
      <SiteHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Upload Your Legal Document
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Upload your legal document for AI-powered analysis. Get instant summaries, 
              key insights, and ask questions about your document.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Workflow Progress */}
            <WorkflowProgress currentStep={1} />

            {/* File Upload Zone */}
            {!uploadedFile && !error && (
              <>
                <FileUploadZone
                  onFileSelect={handleFileUpload}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
                <SupportedFormats />
              </>
            )}

            {/* Document Upload Success */}
            {uploadedFile && (
              <DocumentUploadSuccess
                file={uploadedFile.file}
                onContinue={handleContinue}
                onUploadAnother={handleRemoveFile}
              />
            )}

            {/* Error Display */}
            {error && (
              <UploadError
                error={error}
                onRetry={handleRetry}
                onDismiss={handleDismissError}
              />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}