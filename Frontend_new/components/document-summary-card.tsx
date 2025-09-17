"use client"

import { Clock, FileText, Info, File, Calendar, HardDrive } from 'lucide-react'

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

interface DocumentSummaryCardProps {
  summary: SummaryData
  document: DocumentData
}

export function DocumentSummaryCard({ summary, document }: DocumentSummaryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatProcessingTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatFileSize = (size: number | string) => {
    if (typeof size === 'string') return size
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(1024))
    return Math.round((size / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl rounded-lg shadow-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-lg">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Document Summary</h2>
            <p className="text-sm text-gray-400">AI-generated analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Processed in {formatProcessingTime(summary.processingTime)}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Document Overview */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Overview</h3>
          <p className="text-gray-300 leading-relaxed">{summary.overview}</p>
        </div>

        {/* Key Information */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Key Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.keyInformation.map((info, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Info className="w-4 h-4 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white text-sm">{info.label}</h4>
                  <p className="text-sm text-gray-300">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Metadata */}
        <div className="pt-4 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <File className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">File:</span>
              <span className="font-medium text-white truncate">{document.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Uploaded:</span>
              <span className="font-medium text-white">{formatDate(document.uploadDate)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Size:</span>
              <span className="font-medium text-white">{formatFileSize(document.size)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}