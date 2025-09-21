"use client"

import { useState } from 'react'
import { CreditCard, XCircle, Shield, Lock, Copyright, Scale, FileText, ChevronUp, ChevronDown, ArrowRight, Lightbulb } from 'lucide-react'

interface ClauseData {
  id: string
  type: string
  title: string
  originalText: string
  simplifiedPoints: string[]
  keyTakeaway: string
}

interface SimplifiedClausesSectionProps {
  clauses: ClauseData[]
}

export function SimplifiedClausesSection({ clauses }: SimplifiedClausesSectionProps) {
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set())

  const toggleClause = (clauseId: string) => {
    const newExpanded = new Set(expandedClauses)
    if (newExpanded.has(clauseId)) {
      newExpanded.delete(clauseId)
    } else {
      newExpanded.add(clauseId)
    }
    setExpandedClauses(newExpanded)
  }

  const getClauseIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return CreditCard
      case 'termination':
        return XCircle
      case 'liability':
        return Shield
      case 'confidentiality':
        return Lock
      case 'intellectual_property':
        return Copyright
      case 'dispute_resolution':
        return Scale
      default:
        return FileText
    }
  }

  return (
    <div className="liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl rounded-lg shadow-xl p-4 sm:p-6">
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 rounded-lg">
          <FileText className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Simplified Clauses</h2>
          <p className="text-sm text-gray-400">Plain English explanations</p>
        </div>
      </div>

      <div className="space-y-4">
        {clauses.map((clause, index) => {
          const IconComponent = getClauseIcon(clause.type)
          const isExpanded = expandedClauses.has(clause.id)

          return (
            <div key={clause.id} className="border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleClause(clause.id)}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="font-medium text-white">{clause.title}</h3>
                    <p className="text-sm text-gray-400">Section {index + 1}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="p-3 sm:p-4 border-t border-white/10 bg-white/5">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Original Text */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Original Text:</h4>
                      <p className="text-sm text-gray-300 bg-gray-800/50 p-2 sm:p-3 rounded-md italic border border-white/10">
                        "{clause.originalText}"
                      </p>
                    </div>

                    {/* Simplified Explanation */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Plain English:</h4>
                      <div className="space-y-2">
                        {clause.simplifiedPoints.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-start space-x-2">
                            <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-300">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Takeaway */}
                    {clause.keyTakeaway && (
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-md p-2 sm:p-3">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-purple-400 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-purple-400 mb-1">Key Takeaway:</h4>
                            <p className="text-sm text-gray-300">{clause.keyTakeaway}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}