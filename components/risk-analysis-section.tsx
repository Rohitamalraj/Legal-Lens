"use client"

import { useState } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle, Info, Shield, Lightbulb, TrendingUp, Search } from 'lucide-react'

interface RiskData {
  id: string
  level: 'high' | 'medium' | 'low'
  title: string
  section: string
  description: string
  recommendation: string
  impact: string
}

interface RiskAnalysisSectionProps {
  risks: RiskData[]
}

export function RiskAnalysisSection({ risks }: RiskAnalysisSectionProps) {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all')

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'text-red-400',
          icon: AlertTriangle
        }
      case 'medium':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          text: 'text-yellow-400',
          icon: AlertCircle
        }
      case 'low':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          text: 'text-green-400',
          icon: CheckCircle
        }
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/20',
          text: 'text-gray-400',
          icon: Info
        }
    }
  }

  const getRiskLevelLabel = (level: string) => {
    switch (level) {
      case 'high':
        return 'High Risk'
      case 'medium':
        return 'Medium Risk'
      case 'low':
        return 'Low Risk'
      default:
        return 'Unknown'
    }
  }

  const filteredRisks = selectedRiskLevel === 'all' 
    ? risks 
    : risks.filter(risk => risk.level === selectedRiskLevel)

  const riskCounts = {
    high: risks.filter(r => r.level === 'high').length,
    medium: risks.filter(r => r.level === 'medium').length,
    low: risks.filter(r => r.level === 'low').length
  }

  return (
    <div className="liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl rounded-lg shadow-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-yellow-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Risk Analysis</h2>
            <p className="text-sm text-gray-400">Identified concerns and favorable terms</p>
          </div>
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value)}
            className="text-sm border border-white/20 rounded-md px-3 py-1.5 bg-gray-800/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">All Risks ({risks.length})</option>
            <option value="high">High Risk ({riskCounts.high})</option>
            <option value="medium">Medium Risk ({riskCounts.medium})</option>
            <option value="low">Low Risk ({riskCounts.low})</option>
          </select>
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="font-medium text-red-400">High Risk</span>
          </div>
          <p className="text-2xl font-bold text-red-400 mt-2">{riskCounts.high}</p>
          <p className="text-xs text-gray-400">Requires attention</p>
        </div>

        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="font-medium text-yellow-400">Medium Risk</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400 mt-2">{riskCounts.medium}</p>
          <p className="text-xs text-gray-400">Review recommended</p>
        </div>

        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="font-medium text-green-400">Favorable</span>
          </div>
          <p className="text-2xl font-bold text-green-400 mt-2">{riskCounts.low}</p>
          <p className="text-xs text-gray-400">Positive terms</p>
        </div>
      </div>

      {/* Risk Details */}
      <div className="space-y-4">
        {filteredRisks.map((risk) => {
          const riskStyle = getRiskColor(risk.level)
          const IconComponent = riskStyle.icon

          return (
            <div 
              key={risk.id} 
              className={`border rounded-lg p-3 sm:p-4 ${riskStyle.bg} ${riskStyle.border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <IconComponent className={`w-5 h-5 ${riskStyle.text}`} />
                  <div>
                    <h3 className="font-medium text-white">{risk.title}</h3>
                    <span className={`text-xs font-medium ${riskStyle.text}`}>
                      {getRiskLevelLabel(risk.level)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">{risk.section}</span>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-3">{risk.description}</p>

              {risk.recommendation && (
                <div className="bg-white/5 border border-white/10 rounded-md p-2 sm:p-3">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-purple-400 mb-1">Recommendation:</h4>
                      <p className="text-sm text-gray-300">{risk.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              {risk.impact && (
                <div className="mt-3 flex items-center space-x-2 text-xs text-gray-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>Potential Impact: {risk.impact}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredRisks.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">No risks found for the selected filter.</p>
        </div>
      )}
    </div>
  )
}