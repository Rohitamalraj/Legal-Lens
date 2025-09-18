"use client"

import { useState, useRef } from 'react'
import { Upload, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  isUploading: boolean
  uploadProgress: number
}

export function FileUploadZone({ onFileSelect, isUploading, uploadProgress }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 md:p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-purple-500 bg-purple-500/5'
            : isUploading
            ? 'border-orange-500 bg-orange-500/5'
            : 'border-gray-600 bg-gray-800/30 hover:border-purple-500/50 hover:bg-purple-500/5'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-orange-500/10 rounded-full">
              <Upload className="w-8 h-8 text-orange-500 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Uploading Document...</h3>
              <div className="w-full max-w-xs mx-auto bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-purple-600/10 rounded-full">
              <Upload className="w-8 h-8 text-purple-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {isDragOver ? 'Drop your document here' : 'Upload Legal Document'}
              </h3>
              <p className="text-gray-300">
                Drag and drop your file here, or click to browse
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleBrowseClick}
              disabled={isUploading}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}