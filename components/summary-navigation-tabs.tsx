"use client"

import { FileText, List, Shield } from 'lucide-react'

interface TabData {
  id: string
  label: string
  icon: any
  description: string
}

interface SummaryNavigationTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function SummaryNavigationTabs({ activeTab, onTabChange }: SummaryNavigationTabsProps) {
  const tabs: TabData[] = [
    {
      id: 'summary',
      label: 'Summary',
      icon: FileText,
      description: 'Overview and key information'
    },
    {
      id: 'clauses',
      label: 'Clauses',
      icon: List,
      description: 'Simplified explanations'
    },
    {
      id: 'risks',
      label: 'Risk Analysis',
      icon: Shield,
      description: 'Identified concerns'
    }
  ]

  return (
    <div className="liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl rounded-lg shadow-xl p-3 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-lg text-left transition-all duration-200 flex-1 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg transform scale-[1.02]'
                  : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-[1.01]'
              }`}
            >
              <IconComponent 
                className={`w-6 h-6 flex-shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-current'}`} 
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base mb-1">{tab.label}</div>
                <div className={`text-sm leading-tight ${
                  activeTab === tab.id 
                    ? 'text-purple-100' 
                    : 'text-gray-400'
                }`}>
                  {tab.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}