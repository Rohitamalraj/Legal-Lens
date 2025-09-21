'use client'

import React, { useState, useEffect } from 'react'
import { UploadDropzone } from '@/components/upload-dropzone'
import { ChatPanel } from '@/components/chat-panel'
import { SummaryCard } from '@/components/summary-card-new'
import { LegalScore } from '@/components/legal-score'
import { RiskRadar } from '@/components/risk-radar'
import { apiService, type DocumentAnalysis } from '@/lib/api'

export default function IntegratedAnalysePage() {
  const [currentDocument, setCurrentDocument] = useState<DocumentAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing document on load
    const loadExistingDocument = async () => {
      const documentId = localStorage.getItem('currentDocumentId')
      if (documentId) {
        try {
          const result = await apiService.getDocument(documentId)
          if (result.success && result.data) {
            setCurrentDocument(result.data)
          } else {
            localStorage.removeItem('currentDocumentId')
          }
        } catch (error) {
          console.error('Error loading document:', error)
          localStorage.removeItem('currentDocumentId')
        }
      }
      setIsLoading(false)
    }

    loadExistingDocument()

    // Listen for document upload events
      const handleDocumentUploaded = (event: Event) => {
      const { detail } = event as CustomEvent<DocumentAnalysis>
      setCurrentDocument(detail)
    }

    window.addEventListener('documentUploaded', handleDocumentUploaded)

    return () => {
      window.removeEventListener('documentUploaded', handleDocumentUploaded)
    }
  }, [])

  const clearDocument = () => {
    setCurrentDocument(null)
    localStorage.removeItem('currentDocumentId')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Legal Document Analysis
          </h1>
          <p className="text-xl text-gray-600">
            Upload, analyze, and understand your legal documents with AI
          </p>
        </div>

        {!currentDocument ? (
          // Upload Section
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Upload Your Legal Document
              </h2>
              <UploadDropzone />
            </div>
          </div>
        ) : (
          // Analysis Dashboard
          <div className="space-y-8">
            {/* Header with Document Info */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {currentDocument.filename}
                  </h2>
                  <p className="text-gray-600">
                    Document Type: {currentDocument.documentType} | 
                    Confidence: {Math.round(currentDocument.confidence * 100)}%
                  </p>
                </div>
                <button
                  onClick={clearDocument}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Upload New Document
                </button>
              </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Risk Score */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <RiskRadar percent={currentDocument.analysis.riskScore} />
              </div>

              {/* Legal Literacy Score */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Complexity</h3>
                <LegalScore score={100 - currentDocument.analysis.riskScore} />
              </div>

              {/* Document Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Key Risks:</span>
                    <span className="font-medium">{currentDocument.analysis.keyRisks?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Obligations:</span>
                    <span className="font-medium">{currentDocument.analysis.obligations?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rights:</span>
                    <span className="font-medium">{currentDocument.analysis.rights?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Key Terms:</span>
                    <span className="font-medium">{currentDocument.analysis.keyTerms?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary and Chat Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary */}
              <div>
                <SummaryCard 
                  summary={currentDocument.analysis.summary}
                  keyTerms={currentDocument.analysis.keyTerms?.map(term => 
                    typeof term === 'string' ? term : term.term || ''
                  ).filter(Boolean)}
                  filename={currentDocument.filename}
                />
              </div>

              {/* Chat Panel */}
              <div className="bg-white rounded-lg shadow-lg">
                <ChatPanel />
              </div>
            </div>

            {/* Detailed Analysis Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risks */}
              {currentDocument.analysis.keyRisks && currentDocument.analysis.keyRisks.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-red-600 mb-4 flex items-center">
                    🚨 Key Risks
                  </h3>
                  <ul className="space-y-3">
                    {currentDocument.analysis.keyRisks.map((risk, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <div>
                          {typeof risk === 'string' ? (
                            <span>{risk}</span>
                          ) : (
                            <div>
                              {risk.category && (
                                <div className="font-medium text-red-700 mb-1">{risk.category}</div>
                              )}
                              <div className="text-gray-700 mb-1">{risk.description}</div>
                              {risk.severity && (
                                <span className={`inline-block px-2 py-1 text-xs rounded ${
                                  risk.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                                  risk.severity === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                                  'bg-yellow-200 text-yellow-800'
                                }`}>
                                  {risk.severity}
                                </span>
                              )}
                              {risk.recommendation && (
                                <div className="text-blue-600 text-sm mt-1">💡 {risk.recommendation}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {currentDocument.analysis.recommendations && currentDocument.analysis.recommendations.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                    💡 Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {currentDocument.analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Obligations */}
              {currentDocument.analysis.obligations && currentDocument.analysis.obligations.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-orange-600 mb-4 flex items-center">
                    ⚖️ Your Obligations
                  </h3>
                  <ul className="space-y-3">
                    {currentDocument.analysis.obligations.map((obligation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        <div>
                          {typeof obligation === 'string' ? (
                            <span>{obligation}</span>
                          ) : (
                            <div>
                              {obligation.party && (
                                <div className="font-medium text-orange-700 mb-1">{obligation.party}</div>
                              )}
                              <div className="text-gray-700 mb-1">{obligation.description}</div>
                              {obligation.deadline && (
                                <div className="text-blue-600 text-sm">⏰ Deadline: {obligation.deadline}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rights */}
              {currentDocument.analysis.rights && currentDocument.analysis.rights.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-green-600 mb-4 flex items-center">
                    🛡️ Your Rights
                  </h3>
                  <ul className="space-y-3">
                    {currentDocument.analysis.rights.map((right, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <div>
                          {typeof right === 'string' ? (
                            <span>{right}</span>
                          ) : (
                            <div>
                              {right.party && (
                                <div className="font-medium text-green-700 mb-1">{right.party}</div>
                              )}
                              <div className="text-gray-700">{right.description}</div>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
