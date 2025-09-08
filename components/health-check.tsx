'use client'

import { useState, useEffect } from 'react'
import { apiService } from '@/lib/api'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services?: {
    googleCloud: boolean;
    documentAI: boolean;
    vertexAI: boolean;
  };
}

export function HealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkHealth = async () => {
    setIsLoading(true)
    try {
      const result = await apiService.checkHealth()
      if (result.success && result.data) {
        setHealth(result.data as HealthStatus)
      } else {
        setHealth({
          status: 'unhealthy',
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'unhealthy': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅'
      case 'degraded': return '⚠️'
      case 'unhealthy': return '❌'
      default: return '⏳'
    }
  }

  if (isLoading && !health) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span>Checking system status...</span>
      </div>
    )
  }

  if (!health) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">System Status</h3>
        <button
          onClick={checkHealth}
          disabled={isLoading}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Checking...' : 'Refresh'}
        </button>
      </div>
      
      <div className={`flex items-center space-x-2 ${getStatusColor(health.status)}`}>
        <span>{getStatusIcon(health.status)}</span>
        <span className="text-sm font-medium capitalize">{health.status}</span>
      </div>
      
      {health.services && (
        <div className="mt-3 space-y-1">
          <div className="text-xs text-gray-600">Services:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <span>{health.services.googleCloud ? '✅' : '❌'}</span>
              <span>Cloud</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{health.services.documentAI ? '✅' : '❌'}</span>
              <span>Doc AI</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{health.services.vertexAI ? '✅' : '❌'}</span>
              <span>Vertex AI</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        Last checked: {new Date(health.timestamp).toLocaleTimeString()}
      </div>
    </div>
  )
}
