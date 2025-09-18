import { CheckCircle, FileText, Info } from 'lucide-react'

export function SupportedFormats() {
  const supportedFormats = [
    {
      type: 'PDF',
      description: 'Portable Document Format',
      maxSize: '10 MB',
      color: 'text-red-400',
      icon: FileText,
    },
    {
      type: 'DOCX',
      description: 'Microsoft Word Document',
      maxSize: '10 MB',
      color: 'text-blue-400',
      icon: FileText,
    },
    {
      type: 'DOC',
      description: 'Legacy Word Document',
      maxSize: '10 MB',
      color: 'text-blue-300',
      icon: FileText,
    },
  ]

  return (
    <div className="liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <CheckCircle className="w-5 h-5 text-green-400" />
        <h3 className="font-semibold text-white">Supported File Formats</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {supportedFormats.map((format, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-md border border-white/10">
            <div className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-md">
              <format.icon className={`w-5 h-5 ${format.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white text-sm">{format.type}</span>
                <span className="text-xs text-gray-400">({format.maxSize})</span>
              </div>
              <p className="text-xs text-gray-400 truncate">{format.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-purple-600/10 border border-purple-500/20 rounded-md">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-purple-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-purple-300 font-medium">Tips for better results:</p>
            <ul className="text-gray-300 mt-1 space-y-1">
              <li>• Ensure text is clear and readable</li>
              <li>• Use high-resolution scans for images</li>
              <li>• Avoid heavily redacted documents</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}