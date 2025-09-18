"use client"

import { Check, ChevronRight } from 'lucide-react'

interface WorkflowProgressProps {
  currentStep: number
  className?: string
}

export function WorkflowProgress({ currentStep, className = '' }: WorkflowProgressProps) {
  const steps = [
    {
      id: 1,
      title: 'Upload',
      description: 'Select document'
    },
    {
      id: 2,
      title: 'Analyze',
      description: 'AI processing'
    },
    {
      id: 3,
      title: 'Summary',
      description: 'Get insights'
    },
    {
      id: 4,
      title: 'Q&A',
      description: 'Ask questions'
    }
  ]

  return (
    <div className={`liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-sm">Progress</h3>
        <span className="text-xs text-gray-400">Step {currentStep} of {steps.length}</span>
      </div>
      
      {/* Horizontal Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step Indicator */}
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors mb-2
                ${isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-purple-500 border-purple-500 text-white animate-pulse' 
                    : 'border-gray-500 text-gray-400'
                }
              `}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{step.id}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="text-center">
                <h4 className={`
                  font-medium text-xs transition-colors
                  ${isCompleted 
                    ? 'text-green-300' 
                    : isCurrent 
                      ? 'text-purple-300' 
                      : 'text-gray-400'
                  }
                `}>
                  {step.title}
                </h4>
                <p className={`
                  text-xs mt-0.5 transition-colors hidden sm:block
                  ${isCompleted 
                    ? 'text-green-400/70' 
                    : isCurrent 
                      ? 'text-purple-400/70' 
                      : 'text-gray-500'
                  }
                `}>
                  {step.description}
                </p>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="absolute mt-4 w-full h-0.5 bg-gray-600 hidden sm:block"
                     style={{ 
                       left: `${(index + 0.5) * (100 / steps.length)}%`,
                       width: `${100 / steps.length}%`,
                       zIndex: -1
                     }}>
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-purple-500 to-green-500 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}