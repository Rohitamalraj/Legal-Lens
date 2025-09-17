"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { WorkflowProgress } from '@/components/workflow-progress'
import { SummaryNavigationTabs } from '@/components/summary-navigation-tabs'
import { DocumentSummaryCard } from '@/components/document-summary-card'
import { SimplifiedClausesSection } from '@/components/simplified-clauses-section'
import { RiskAnalysisSection } from '@/components/risk-analysis-section'

interface DocumentData {
  id: string
  name: string
  uploadDate: string
  size: number | string
  type: string
  status: string
  extractedText: string
}

interface SummaryData {
  processingTime: number
  overview: string
  keyInformation: Array<{
    label: string
    value: string
  }>
}

interface ClauseData {
  id: string
  type: string
  title: string
  originalText: string
  simplifiedPoints: string[]
  keyTakeaway: string
}

interface RiskData {
  id: string
  level: 'high' | 'medium' | 'low'
  title: string
  section: string
  description: string
  recommendation: string
  impact: string
}

export default function DocumentSummaryPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('summary')
  const [documentData, setDocumentData] = useState<DocumentData | null>(null)

  // Mock summary data
  const mockSummary: SummaryData = {
    processingTime: 45,
    overview: `This Service Agreement establishes a professional relationship between TechCorp Solutions and the client for software development services. The contract outlines project scope, payment terms, intellectual property rights, and termination conditions. Key provisions include a 6-month initial term with automatic renewal, milestone-based payment structure, and comprehensive confidentiality clauses. The agreement favors the service provider with limited liability and strong IP protection, while providing reasonable client protections through defined deliverables and performance standards.`,
    keyInformation: [
      { label: "Contract Type", value: "Service Agreement" },
      { label: "Duration", value: "6 months (auto-renewable)" },
      { label: "Total Value", value: "$75,000" },
      { label: "Payment Terms", value: "Net 30 days" },
      { label: "Governing Law", value: "State of California" },
      { label: "Parties", value: "TechCorp Solutions & Client Corp" }
    ]
  }

  // Mock simplified clauses
  const mockClauses: ClauseData[] = [
    {
      id: "clause_001",
      type: "payment",
      title: "Payment Terms",
      originalText: "Client shall remit payment within thirty (30) calendar days of receipt of invoice, with late payments subject to a service charge of one and one-half percent (1.5%) per month on the outstanding balance.",
      simplifiedPoints: [
        "You must pay within 30 days of receiving an invoice",
        "Late payments will be charged 1.5% interest per month",
        "This interest compounds monthly on unpaid amounts"
      ],
      keyTakeaway: "Standard payment terms with reasonable late fees. Ensure your accounting team can meet the 30-day deadline."
    },
    {
      id: "clause_002",
      type: "termination",
      title: "Termination Clause",
      originalText: "Either party may terminate this Agreement upon sixty (60) days written notice. In the event of termination for cause, the non-breaching party may terminate immediately upon written notice.",
      simplifiedPoints: [
        "Either side can end the contract with 60 days written notice",
        "If someone breaks the contract rules, it can be ended immediately",
        "You must give notice in writing (email or letter)"
      ],
      keyTakeaway: "Fair termination terms that protect both parties. Keep documentation if issues arise."
    },
    {
      id: "clause_003",
      type: "liability",
      title: "Limitation of Liability",
      originalText: "In no event shall TechCorp's total liability exceed the total amount paid by Client under this Agreement. TechCorp shall not be liable for any indirect, incidental, special, or consequential damages.",
      simplifiedPoints: [
        "TechCorp's maximum liability is limited to what you paid them",
        "They're not responsible for indirect damages (lost profits, business interruption)",
        "This is a significant limitation that protects the service provider"
      ],
      keyTakeaway: "This heavily favors TechCorp. Consider if you need additional insurance or guarantees for critical projects."
    },
    {
      id: "clause_004",
      type: "intellectual_property",
      title: "Intellectual Property Rights",
      originalText: "All work product, including but not limited to software code, documentation, and related materials created under this Agreement shall be the exclusive property of Client upon full payment.",
      simplifiedPoints: [
        "You own all the work they create for you",
        "This includes code, documents, and related materials",
        "Ownership transfers only after you've paid in full"
      ],
      keyTakeaway: "Good clause for the client - you retain ownership of custom work. Ensure payments are current to secure IP rights."
    }
  ]

  // Mock risk analysis
  const mockRisks: RiskData[] = [
    {
      id: "risk_001",
      level: "high",
      title: "Broad Liability Limitation",
      section: "Section 8.2",
      description: "The service provider has significantly limited their liability to only the amount paid under the contract, excluding all consequential damages. This could leave you exposed if their work causes business disruption.",
      recommendation: "Consider negotiating higher liability caps or requiring professional liability insurance, especially for mission-critical projects.",
      impact: "Could result in significant unrecoverable losses"
    },
    {
      id: "risk_002",
      level: "medium",
      title: "Automatic Renewal Terms",
      section: "Section 2.1",
      description: "The contract automatically renews for additional 6-month periods unless terminated with proper notice. This could lead to unintended contract extensions.",
      recommendation: "Set calendar reminders 90 days before each renewal period to evaluate whether to continue or terminate.",
      impact: "Unexpected ongoing financial commitments"
    },
    {
      id: "risk_003",
      level: "medium",
      title: "Scope Change Procedures",
      section: "Section 3.4",
      description: "Changes to project scope require written approval but don't specify timeline limits or cost caps for additional work.",
      recommendation: "Request specific procedures for scope changes including cost estimates and approval timeframes.",
      impact: "Potential for scope creep and budget overruns"
    },
    {
      id: "risk_004",
      level: "low",
      title: "Confidentiality Protections",
      section: "Section 9.1",
      description: "Strong mutual confidentiality clauses protect both parties' sensitive information with appropriate exceptions for legal requirements.",
      recommendation: "This is a well-balanced clause that provides good protection for both parties.",
      impact: "Positive protection for sensitive business information"
    },
    {
      id: "risk_005",
      level: "low",
      title: "Clear Deliverables Definition",
      section: "Section 4.2",
      description: "The contract clearly defines project deliverables, timelines, and acceptance criteria, reducing ambiguity.",
      recommendation: "Ensure your team understands the acceptance criteria and can provide timely feedback.",
      impact: "Reduces project disputes and ensures clear expectations"
    }
  ]

  // Load document data from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem('uploadedDocument')
    if (storedData) {
      const data = JSON.parse(storedData)
      setDocumentData({
        id: "doc_001",
        name: data.fileName,
        uploadDate: new Date().toISOString(),
        size: data.fileSize,
        type: "Legal Document",
        status: "completed",
        extractedText: data.extractedText
      })
    } else {
      // Redirect back to upload if no document data
      router.push('/document-upload')
    }
  }, [router])

  const handleRestartAnalysis = () => {
    sessionStorage.removeItem('uploadedDocument')
    router.push('/document-upload')
  }

  const handleDownloadReport = () => {
    // Mock download functionality
    const reportData = {
      document: documentData,
      summary: mockSummary,
      clauses: mockClauses,
      risks: mockRisks,
      generatedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${documentData?.name?.replace(/\.[^/.]+$/, '')}_Analysis_Report.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderTabContent = () => {
    if (!documentData) return null
    
    switch (activeTab) {
      case 'summary':
        return <DocumentSummaryCard summary={mockSummary} document={documentData} />
      case 'clauses':
        return <SimplifiedClausesSection clauses={mockClauses} />
      case 'risks':
        return <RiskAnalysisSection risks={mockRisks} />
      default:
        return <DocumentSummaryCard summary={mockSummary} document={documentData} />
    }
  }

  if (!documentData) {
    return (
      <main className="min-h-[100dvh] text-white">
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading document analysis...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] text-white">
      <SiteHeader />
      <WorkflowProgress currentStep={2} />
      
      <div>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Document Analysis Complete
              </h1>
              <p className="text-gray-300">
                Your legal document has been analyzed and simplified for easy understanding
              </p>
            </div>

            {/* Navigation Tabs */}
            <SummaryNavigationTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />

            {/* Tab Content */}
            {renderTabContent()}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/q-a-chat-interface')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>Ask Questions About Document</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>Download Full Report</span>
              </button>
              <button
                onClick={handleRestartAnalysis}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                Analyze New Document
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}