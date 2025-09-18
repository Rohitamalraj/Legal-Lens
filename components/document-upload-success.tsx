"use client"

import { CheckCircle, FileText, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocumentUploadSuccessProps {
  file: File
  onContinue: () => void
  onUploadAnother: () => void
}

export function DocumentUploadSuccess({ file, onContinue, onUploadAnother }: DocumentUploadSuccessProps) {
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
      default:
        return FileText
    }
  }

  const FileIcon = getFileIcon(file.name)

  return (
    <div className="liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl rounded-lg overflow-hidden">
      {/* Success Header */}
      <div className="p-6 text-center border-b border-white/10 bg-green-500/10">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Document Successfully Uploaded!
        </h2>
        <p className="text-green-200">
          Your document has been uploaded and is ready for preview.
        </p>
      </div>

      {/* File Details */}
      <div className="p-6">
        <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg">
            <FileIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{file.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span>{file.type.includes('pdf') ? 'PDF Document' : 'Word Document'}</span>
              <span>•</span>
              <span className="text-green-400">✓ Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-white/10 bg-white/5">
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
            onClick={onUploadAnother}
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Upload Another
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DocumentUploadSuccess