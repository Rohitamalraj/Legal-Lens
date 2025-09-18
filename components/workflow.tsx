"use client"

import { Upload, Brain, FileText, MessageCircle } from "lucide-react"

export function Workflow() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Document",
      description: "Simply drag and drop your legal document or upload it directly",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Our advanced AI processes and analyzes your document in seconds",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      icon: FileText,
      title: "Get Summary",
      description: "Receive a clear, comprehensive summary with key insights",
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      icon: MessageCircle,
      title: "Ask Questions",
      description: "Chat with AI to get specific answers about your document",
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
  ]

  return (
    <section className="container mx-auto px-4 py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          How Legal Lens Works
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Transform complex legal documents into actionable insights in just 4 simple steps
        </p>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between max-w-5xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {/* Step */}
            <div className="flex flex-col items-center text-center max-w-48">
              <div className={`w-16 h-16 rounded-2xl ${step.bgColor} border border-white/10 flex items-center justify-center mb-4`}>
                <step.icon className={`w-8 h-8 ${step.color}`} />
              </div>
              <h3 className="text-white font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
            
            {/* Arrow */}
            {index < steps.length - 1 && (
              <div className="flex items-center mx-8">
                <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                <div className="w-0 h-0 border-l-[8px] border-l-purple-500/50 border-y-[4px] border-y-transparent"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-8 max-w-sm mx-auto">
        {steps.map((step, index) => (
          <div key={index}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${step.bgColor} border border-white/10 flex items-center justify-center flex-shrink-0`}>
                <step.icon className={`w-6 h-6 ${step.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
            
            {/* Mobile Arrow */}
            {index < steps.length - 1 && (
              <div className="flex justify-center my-6">
                <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500/50 to-transparent"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}