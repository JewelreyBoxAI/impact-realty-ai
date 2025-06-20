"use client"

import React, { useState } from 'react'
import Button from '../../components/Button'

const FlowStatusPage: React.FC = () => {
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null)

  const runningFlows = [
    {
      id: 'exec-001',
      workflowName: 'Client Onboarding Flow',
      status: 'running',
      progress: 60,
      currentStep: 'Document Processing',
      startTime: '2024-01-15T16:30:00Z',
      estimatedCompletion: '2024-01-15T17:15:00Z',
      agents: [
        { name: 'Recruitment Executive', status: 'completed' },
        { name: 'Compliance Officer', status: 'running' },
        { name: 'Document Processor', status: 'pending' }
      ]
    },
    {
      id: 'exec-002',
      workflowName: 'Property Analysis Pipeline',
      status: 'running',
      progress: 25,
      currentStep: 'Market Data Collection',
      startTime: '2024-01-15T16:45:00Z',
      estimatedCompletion: '2024-01-15T18:30:00Z',
      agents: [
        { name: 'Market Analyst', status: 'running' },
        { name: 'Document Processor', status: 'pending' }
      ]
    }
  ]

  const recentExecutions = [
    {
      id: 'exec-003',
      workflowName: 'Compliance Review Process',
      status: 'completed',
      progress: 100,
      duration: '8m 45s',
      completedTime: '2024-01-15T16:20:00Z',
      result: 'success',
      agents: [
        { name: 'Compliance Officer', status: 'completed' },
        { name: 'Document Processor', status: 'completed' }
      ]
    },
    {
      id: 'exec-004',
      workflowName: 'Client Onboarding Flow',
      status: 'failed',
      progress: 40,
      duration: '3m 12s',
      completedTime: '2024-01-15T15:55:00Z',
      result: 'error',
      error: 'Document validation failed',
      agents: [
        { name: 'Recruitment Executive', status: 'completed' },
        { name: 'Compliance Officer', status: 'failed' }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-accent-green'
      case 'completed':
        return 'text-accent-green'
      case 'failed':
        return 'text-red-400'
      case 'pending':
        return 'text-slate-400'
      default:
        return 'text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
      case 'completed':
        return <div className="w-2 h-2 bg-accent-green rounded-full" />
      case 'failed':
        return <div className="w-2 h-2 bg-red-400 rounded-full" />
      case 'pending':
        return <div className="w-2 h-2 bg-slate-400 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-slate-400 rounded-full" />
    }
  }

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    return `${diffMins}m ${diffSecs}s`
  }

  const handleStopExecution = (executionId: string) => {
    console.log('Stopping execution:', executionId)
    // TODO: Implement stop functionality
  }

  const handleViewDetails = (executionId: string) => {
    setSelectedExecution(executionId)
    console.log('Viewing details for:', executionId)
    // TODO: Implement detailed view
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">Running Flows</p>
              <p className="text-2xl font-bold text-accent-green">{runningFlows.length}</p>
            </div>
            <div className="w-8 h-8 bg-accent-green/20 rounded-agentos flex items-center justify-center">
              <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">Avg Duration</p>
              <p className="text-2xl font-bold text-text-primary">12m</p>
            </div>
            <div className="w-8 h-8 bg-primary/20 rounded-agentos flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">Success Rate</p>
              <p className="text-2xl font-bold text-text-primary">87%</p>
            </div>
            <div className="w-8 h-8 bg-yellow-500/20 rounded-agentos flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">Total Today</p>
              <p className="text-2xl font-bold text-text-primary">24</p>
            </div>
            <div className="w-8 h-8 bg-slate-500/20 rounded-agentos flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Running Flows */}
      <div className="agentos-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-agentos-title">Currently Running Flows</h2>
          <Button variant="outline" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {runningFlows.map((flow) => (
            <div key={flow.id} className="p-4 bg-slate-800 rounded-agentos border border-border-light">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text-primary">{flow.workflowName}</h3>
                    <span className="status-agentos-running">Running</span>
                  </div>
                  <p className="text-text-secondary mb-3">Current Step: {flow.currentStep}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">Progress</span>
                      <span className="text-text-primary">{flow.progress}%</span>
                    </div>
                    <div className="progress-agentos-bg">
                      <div 
                        className="progress-agentos-fill progress-agentos-primary"
                        style={{ width: `${flow.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Agent Status */}
                  <div className="mb-3">
                    <p className="text-sm text-text-secondary mb-2">Agent Status:</p>
                    <div className="flex flex-wrap gap-2">
                      {flow.agents.map((agent, index) => (
                        <div key={index} className="flex items-center gap-2 px-2 py-1 bg-slate-700 rounded text-sm">
                          {getStatusIcon(agent.status)}
                          <span className={getStatusColor(agent.status)}>{agent.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>Started: {formatDuration(flow.startTime)} ago</span>
                    <span>ETA: {new Date(flow.estimatedCompletion).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(flow.id)}>
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleStopExecution(flow.id)}>
                    Stop
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Executions */}
      <div className="agentos-card">
        <h2 className="text-agentos-title mb-6">Recent Executions</h2>
        
        <div className="space-y-3">
          {recentExecutions.map((execution) => (
            <div key={execution.id} className="p-4 bg-slate-800 rounded-agentos border border-border-light hover-agentos-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    execution.status === 'completed' 
                      ? 'status-agentos-success'
                      : 'status-agentos-error'
                  }`}>
                    {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                  </span>
                  
                  <div>
                    <p className="text-text-primary font-medium">{execution.workflowName}</p>
                    <p className="text-sm text-text-secondary">
                      Duration: {execution.duration} • 
                      Completed: {new Date(execution.completedTime).toLocaleTimeString()}
                    </p>
                    {execution.error && (
                      <p className="text-sm text-red-400 mt-1">Error: {execution.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-text-secondary">Progress</p>
                    <p className="text-text-primary">{execution.progress}%</p>
                  </div>
                  
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(execution.id)}>
                    View Logs
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FlowStatusPage 