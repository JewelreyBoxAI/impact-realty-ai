"use client"

import React, { useState } from 'react'

interface Agent {
  id: string
  name: string
  type: string
  status: 'idle' | 'running' | 'paused' | 'error'
  description: string
  created_at: string
  performance_metrics: {
    success_rate: number
    avg_execution_time: number
    total_executions: number
  }
}

interface Project {
  id: string
  name: string
  description: string
  agent_count: number
  last_execution: string
  status: 'active' | 'paused' | 'completed'
}

interface ExecutionLog {
  id: string
  project_id: string
  agent_id: string
  command: string
  status: 'completed' | 'failed' | 'running'
  duration: number
  result?: string
  error?: string
  timestamp: string
}

interface HistoryRecallPanelProps {
  selectedProject: Project | null
  selectedAgent: Agent | null
}

const HistoryRecallPanel: React.FC<HistoryRecallPanelProps> = ({
  selectedProject,
  selectedAgent
}) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'project' | 'agent'>('recent')

  // Mock execution history data
  const executionLogs: ExecutionLog[] = [
    {
      id: 'exec-001',
      project_id: 'project-001',
      agent_id: 'agent-001',
      command: 'Execute full recruitment pipeline with default criteria',
      status: 'completed',
      duration: 156.7,
      result: 'Found 12 qualified candidates, sent 8 emails, scheduled 3 interviews',
      timestamp: '2024-01-15T14:30:00Z'
    },
    {
      id: 'exec-002',
      project_id: 'project-001',
      agent_id: 'agent-002',
      command: 'Verify license status for all pending candidates',
      status: 'completed',
      duration: 23.4,
      result: '5 licenses verified, 2 expired licenses flagged',
      timestamp: '2024-01-15T13:45:00Z'
    },
    {
      id: 'exec-003',
      project_id: 'project-002',
      agent_id: 'agent-001',
      command: 'Generate performance summary for last 30 days',
      status: 'failed',
      duration: 12.1,
      error: 'Unable to access Zoho CRM data - API rate limit exceeded',
      timestamp: '2024-01-15T12:20:00Z'
    },
    {
      id: 'exec-004',
      project_id: 'project-001',
      agent_id: 'agent-003',
      command: 'Process incoming emails and update calendar',
      status: 'completed',
      duration: 8.3,
      result: 'Processed 23 emails, scheduled 4 meetings, flagged 2 urgent items',
      timestamp: '2024-01-15T11:15:00Z'
    }
  ]

  const getFilteredLogs = () => {
    switch (activeTab) {
      case 'project':
        return selectedProject 
          ? executionLogs.filter(log => log.project_id === selectedProject.id)
          : []
      case 'agent':
        return selectedAgent 
          ? executionLogs.filter(log => log.agent_id === selectedAgent.id)
          : []
      default:
        return executionLogs.slice(0, 5) // Recent executions
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'failed': return 'text-red-400'
      case 'running': return 'text-cyan-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'failed': return '❌'
      case 'running': return '⏳'
      default: return '❓'
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="agent-panel h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#2A3441]">
          <h2 className="text-xl font-bold font-orbitron text-white mb-2">Execution History</h2>
          <p className="text-gray-400 text-sm">
            Track and replay past agent executions
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4">
          <div className="flex space-x-1 bg-[#151920] rounded-xl p-1">
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                activeTab === 'recent' 
                  ? 'bg-cyan-400 text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setActiveTab('project')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                activeTab === 'project' 
                  ? 'bg-cyan-400 text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Project
            </button>
            <button
              onClick={() => setActiveTab('agent')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                activeTab === 'agent' 
                  ? 'bg-cyan-400 text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Agent
            </button>
          </div>
        </div>

        {/* Execution Logs */}
        <div className="flex-1 px-6 pb-6 overflow-auto">
          <div className="space-y-3">
            {getFilteredLogs().map((log) => (
              <div
                key={log.id}
                className="bg-[#151920] border border-[#2A3441] rounded-xl p-4 hover:border-cyan-400/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getStatusIcon(log.status)}</span>
                    <div>
                      <div className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Duration</div>
                    <div className="text-sm font-medium text-white">
                      {formatDuration(log.duration)}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-white font-medium mb-1">Command:</div>
                  <div className="text-xs text-gray-300 bg-[#0C0F1A] rounded-lg p-2 font-mono">
                    {log.command}
                  </div>
                </div>

                {log.result && (
                  <div className="mb-2">
                    <div className="text-xs text-green-400 font-medium mb-1">Result:</div>
                    <div className="text-xs text-gray-300">
                      {log.result}
                    </div>
                  </div>
                )}

                {log.error && (
                  <div className="mb-2">
                    <div className="text-xs text-red-400 font-medium mb-1">Error:</div>
                    <div className="text-xs text-red-300">
                      {log.error}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-[#2A3441] text-xs text-gray-400">
                  <span>ID: {log.id}</span>
                  <span>Agent: {log.agent_id}</span>
                  <span>Project: {log.project_id}</span>
                </div>
              </div>
            ))}

            {getFilteredLogs().length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-2xl mb-2">📭</div>
                <div className="text-sm">
                  {activeTab === 'project' && !selectedProject && 'Select a project to view its execution history'}
                  {activeTab === 'agent' && !selectedAgent && 'Select an agent to view its execution history'}
                  {activeTab === 'recent' && 'No recent executions'}
                  {activeTab === 'project' && selectedProject && 'No executions found for this project'}
                  {activeTab === 'agent' && selectedAgent && 'No executions found for this agent'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 border-t border-[#2A3441]">
          <div className="grid grid-cols-2 gap-3">
            <button className="agent-button-secondary text-sm py-2">
              Export Logs
            </button>
            <button className="agent-button-secondary text-sm py-2">
              Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoryRecallPanel 