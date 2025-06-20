"use client"

import React, { useState } from 'react'
import Button from '../../components/Button'

const MonitoringPage: React.FC = () => {
  const [metrics] = useState({
    totalAgents: 6,
    activeAgents: 2,
    totalExecutions: 724,
    avgSuccessRate: 87.3,
    systemLoad: 34,
    uptime: '7d 14h 23m'
  })

  const [recentExecutions] = useState([
    {
      id: 'exec-001',
      agentName: 'Compliance Officer',
      command: 'Document compliance validation',
      status: 'completed',
      duration: 5.2,
      timestamp: '2024-01-15T16:45:00Z',
      successRate: 100
    },
    {
      id: 'exec-002',
      agentName: 'Recruitment Executive',
      command: 'Candidate screening pipeline',
      status: 'running',
      duration: 2.8,
      timestamp: '2024-01-15T16:40:00Z',
      successRate: 0
    },
    {
      id: 'exec-003',
      agentName: 'Executive Assistant',
      command: 'Email processing and scheduling',
      status: 'completed',
      duration: 1.1,
      timestamp: '2024-01-15T16:35:00Z',
      successRate: 95
    },
    {
      id: 'exec-004',
      agentName: 'Document Processor',
      command: 'Contract generation workflow',
      status: 'error',
      duration: 8.4,
      timestamp: '2024-01-15T16:30:00Z',
      successRate: 0
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-agentos-success'
      case 'running':
        return 'status-agentos-running'
      case 'error':
        return 'status-agentos-error'
      case 'paused':
        return 'status-agentos-warning'
      default:
        return 'status-agentos-idle'
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
    return `${(seconds / 3600).toFixed(1)}h`
  }

  return (
    <div className="agentos-content-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Monitoring</h1>
        <p className="text-agentos-body">
          Real-time monitoring and performance analytics for your agent ecosystem
        </p>
      </div>

      {/* System Overview Cards */}
      <div className="agentos-grid agentos-grid-cols-3 mb-8">
        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">System Uptime</p>
              <p className="text-2xl font-bold text-accent-green">{metrics.uptime}</p>
            </div>
            <div className="w-10 h-10 bg-accent-green/20 rounded-agentos flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">System Load</p>
              <p className="text-2xl font-bold text-text-primary">{metrics.systemLoad}%</p>
            </div>
            <div className="w-10 h-10 bg-primary/20 rounded-agentos flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <div className="progress-agentos-bg">
              <div 
                className="progress-agentos-fill progress-agentos-primary"
                style={{ width: `${metrics.systemLoad}%` }}
              />
            </div>
          </div>
        </div>

        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">Active Agents</p>
              <p className="text-2xl font-bold text-text-primary">
                {metrics.activeAgents}/{metrics.totalAgents}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-agentos flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Success Rate Chart */}
        <div className="agentos-card">
          <h3 className="text-agentos-title mb-4">Success Rate Trends</h3>
          <div className="h-32 bg-slate-800 rounded-agentos flex items-center justify-center border border-border-light">
            <p className="text-slate-400">Chart visualization would go here</p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-accent-green">{metrics.avgSuccessRate}%</p>
            <p className="text-agentos-caption">Average Success Rate</p>
          </div>
        </div>

        {/* Execution Volume */}
        <div className="agentos-card">
          <h3 className="text-agentos-title mb-4">Execution Volume</h3>
          <div className="h-32 bg-slate-800 rounded-agentos flex items-center justify-center border border-border-light">
            <p className="text-slate-400">Execution timeline would go here</p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-primary">{metrics.totalExecutions}</p>
            <p className="text-agentos-caption">Total Executions</p>
          </div>
        </div>
      </div>

      {/* Recent Executions */}
      <div className="agentos-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-agentos-title">Recent Executions</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              View All
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {recentExecutions.map((execution) => (
            <div
              key={execution.id}
              className="flex items-center justify-between p-4 bg-slate-800 rounded-agentos border border-border-light hover-agentos-subtle"
            >
              <div className="flex items-center gap-4">
                <span className={getStatusColor(execution.status)}>
                  {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                </span>
                <div>
                  <p className="text-text-primary font-medium">{execution.agentName}</p>
                  <p className="text-agentos-caption">{execution.command}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-agentos-caption">Duration</p>
                  <p className="text-text-primary">{formatDuration(execution.duration)}</p>
                </div>
                
                {execution.status === 'completed' && (
                  <div className="text-center">
                    <p className="text-agentos-caption">Success</p>
                    <p className="text-accent-green">{execution.successRate}%</p>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-agentos-caption">Time</p>
                  <p className="text-text-secondary">
                    {new Date(execution.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MonitoringPage 