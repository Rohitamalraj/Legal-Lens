"use client"

import { useState } from 'react'
import { FileText, Image, File, X, ChevronUp, ChevronDown, ArrowRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocumentPreviewProps {
  file: File
  extractedText: string
  onContinue: () => void
  onRemove: () => void
}

export function DocumentPreview({ file, extractedText, onContinue, onRemove }: DocumentPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
      case 'docx':
      case 'doc':
        return FileText
      case 'png':
      case 'jpg':
      case 'jpeg':
        return Image
      default:
        return File
    }
  }

  const truncateText = (text: string, maxLength = 300) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const FileIcon = getFileIcon(file.name)

  return (
    <div className="liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl rounded-lg overflow-hidden">
      {/* File Info Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 rounded-md">
              <FileIcon className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{file.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{formatFileSize(file.size)}</span>
                <span>Uploaded successfully</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Extracted Text Preview */}
      {extractedText && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white">Document Preview</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-300 hover:text-white"
            >
              {isExpanded ? (
                <>
                  Show Less
                  <ChevronUp className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Show More
                  <ChevronDown className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          <div className="bg-gray-800/50 rounded-md p-4 border border-white/10">
            <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
              {isExpanded ? extractedText : truncateText(extractedText)}
            </pre>
          </div>

          {extractedText.length > 300 && !isExpanded && (
            <p className="text-xs text-gray-400 mt-2">
              Showing first 300 characters. Click "Show More" to view full content.
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onContinue}
            className="flex-1 bg-purple-600 hover:bg-purple-500"
          >
            Continue to Preview
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={onRemove}
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove File
          </Button>
        </div>
      </div>
    </div>
  )
}