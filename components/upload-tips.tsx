"use client"

import { Shield, Clock, FileText, Zap, Info } from 'lucide-react'

export function UploadTips() {
  const tips = [
    {
      icon: FileText,
      title: 'File Requirements',
      description: 'Support for PDF, DOCX, and images (PNG, JPG). Documents up to 10MB, images up to 5MB.',
      color: 'text-blue-400'
    },
    {
      icon: Zap,
      title: 'Processing Speed',
      description: 'Average processing time is 30-60 seconds. Larger files may take up to 2 minutes.',
      color: 'text-green-400'
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Your documents are processed securely and automatically deleted after analysis.',
      color: 'text-purple-400'
    },
    {
      icon: Clock,
      title: 'Best Results',
      description: 'Clear, well-formatted documents with readable text provide the most accurate analysis.',
      color: 'text-yellow-400'
    }
  ]

  return (
    <div className="liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Info className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-white">Upload Guidelines</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {tips.map((tip, index) => {
          const IconComponent = tip.icon
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`flex items-center justify-center w-8 h-8 ${tip.color.replace('text-', 'bg-').replace('-400', '-500/10')} rounded-md mt-0.5`}>
                <IconComponent className={`w-4 h-4 ${tip.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white text-sm mb-1">{tip.title}</h4>
                <p className="text-gray-300 text-xs leading-relaxed">{tip.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-md">
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-purple-400 mt-0.5" />
          <div>
            <p className="text-purple-200 text-sm font-medium">Privacy Guarantee</p>
            <p className="text-purple-300/80 text-xs mt-1">
              All uploaded documents are processed locally and securely deleted within 24 hours. 
              We never store or share your confidential information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}