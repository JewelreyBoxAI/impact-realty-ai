"use client"

import React from 'react'

interface AgentCardProps {
  id: string
  title: string
  subtitle: string
  status: 'idle' | 'running' | 'paused' | 'error'
  description: string
  successRate: number
  avgTime: number
  totalRuns: number
  onViewLogs: () => void
  onConfigure: () => void
}

const AgentCard: React.FC<AgentCardProps> = ({
  id,
  title,
  subtitle,
  status,
  description,
  successRate,
  avgTime,
  totalRuns,
  onViewLogs,
  onConfigure
}) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'running':
        return 'status-agentos-running'
      case 'idle':
        return 'status-agentos-idle'
      case 'paused':
        return 'status-agentos-warning'
      case 'error':
        return 'status-agentos-error'
      default:
        return 'status-agentos-idle'
    }
  }

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'progress-agentos-success'
    if (rate >= 70) return 'progress-agentos-primary'
    return 'progress-agentos-warning'
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
    return `${(seconds / 3600).toFixed(1)}h`
  }

  return (
    <div className="agentos-card hover-agentos-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-agentos-title">{title}</h3>
            <span className={getStatusClass(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <p className="text-agentos-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-agentos-body mb-6">{description}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-agentos-label">Success Rate</span>
          <span className="text-sm font-semibold text-text-primary">{successRate}%</span>
        </div>
        <div className="progress-agentos-bg">
          <div 
            className={`progress-agentos-fill ${getProgressColor(successRate)}`}
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-agentos-caption">Avg. Time</p>
          <p className="text-lg font-semibold text-text-primary">{formatTime(avgTime)}</p>
        </div>
        <div>
          <p className="text-agentos-caption">Total Runs</p>
          <p className="text-lg font-semibold text-text-primary">{totalRuns.toLocaleString()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button 
          onClick={onViewLogs}
          className="btn-agentos-outline flex-1"
        >
          View Logs
        </button>
        <button 
          onClick={onConfigure}
          className="btn-agentos-primary flex-1"
        >
          Configure
        </button>
      </div>
    </div>
  )
}

export default AgentCard 