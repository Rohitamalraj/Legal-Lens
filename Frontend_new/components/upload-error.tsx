"use client"

import { AlertCircle, RefreshCw, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadErrorProps {
  error: {
    type: 'validation' | 'upload' | 'processing' | 'network'
    message: string
    details?: string
  }
  onRetry: () => void
  onDismiss: () => void
}

export function UploadError({ error, onRetry, onDismiss }: UploadErrorProps) {
  const getErrorConfig = (type: string) => {
    switch (type) {
      case 'validation':
        return {
          title: 'Invalid File',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          suggestions: [
            'Ensure your file is a PDF, DOCX, or image (PNG, JPG)',
            'Check that your document doesn\'t exceed 10MB (5MB for images)',
            'Make sure the file isn\'t corrupted or password-protected'
          ]
        }
      case 'upload':
        return {
          title: 'Upload Failed',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          suggestions: [
            'Check your internet connection',
            'Try uploading a smaller file',
            'Refresh the page and try again'
          ]
        }
      case 'processing':
        return {
          title: 'Processing Error',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20',
          suggestions: [
            'The document might be corrupted or unreadable',
            'Try converting to a different format',
            'Ensure the document contains readable text'
          ]
        }
      case 'network':
        return {
          title: 'Connection Error',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          suggestions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Contact support if the problem persists'
          ]
        }
      default:
        return {
          title: 'Upload Error',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          suggestions: ['Please try again or contact support']
        }
    }
  }

  const config = getErrorConfig(error.type)

  return (
    <div className={`liquid-glass border ${config.borderColor} ${config.bgColor} backdrop-blur-xl rounded-lg p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center justify-center w-10 h-10 ${config.bgColor} rounded-md`}>
            <AlertCircle className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className={`font-semibold ${config.color}`}>{config.title}</h3>
            <p className="text-gray-300 text-sm mt-1">{error.message}</p>
            {error.details && (
              <p className="text-gray-400 text-xs mt-1">{error.details}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Suggestions */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">Suggestions:</h4>
        <ul className="space-y-2">
          {config.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start space-x-2 text-sm text-gray-300">
              <span className="text-gray-500 mt-1">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onRetry}
          className="flex-1 bg-purple-600 hover:bg-purple-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={onDismiss}
          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Different File
        </Button>
      </div>
    </div>
  )
}