"use client"

import React from 'react'

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

interface AgentProfileCardProps {
  agent: Agent | null
}

const AgentProfileCard: React.FC<AgentProfileCardProps> = ({ agent }) => {
  if (!agent) {
    return (
      <div className="agent-card h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 bg-[#2A3441] rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <p>No agent selected</p>
        </div>
      </div>
    )
  }

  const getStatusColor = () => {
    switch (agent.status) {
      case 'running': return 'bg-cyan-400'
      case 'paused': return 'bg-yellow-400'
      case 'error': return 'bg-red-400'
      default: return 'bg-gray-400'
    }
  }

  const getTypeIcon = () => {
    switch (agent.type) {
      case 'recruitment': return '👥'
      case 'compliance': return '📋'
      case 'assistant': return '🤖'
      default: return '⚡'
    }
  }

  return (
    <div className="agent-card h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">{getTypeIcon()}</span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor()} rounded-full border-2 border-[#1A1F2E]`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold font-orbitron text-white">{agent.name}</h3>
            <p className="text-sm text-gray-400 capitalize">{agent.type} Agent</p>
            <p className="text-xs text-gray-500 capitalize">{agent.status}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 leading-relaxed">{agent.description}</p>
        </div>

        {/* Performance Metrics */}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-300 mb-4">Performance Metrics</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Success Rate</span>
                <span className="text-xs font-medium text-cyan-400">
                  {agent.performance_metrics.success_rate}%
                </span>
              </div>
              <div className="w-full bg-[#2A3441] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${agent.performance_metrics.success_rate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#151920] rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">Avg. Time</div>
                <div className="text-lg font-semibold text-white">
                  {agent.performance_metrics.avg_execution_time}s
                </div>
              </div>
              <div className="bg-[#151920] rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">Total Runs</div>
                <div className="text-lg font-semibold text-white">
                  {agent.performance_metrics.total_executions}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-[#2A3441]">
          <div className="grid grid-cols-2 gap-2">
            <button className="agent-button-secondary text-xs py-2">
              View Logs
            </button>
            <button className="agent-button-secondary text-xs py-2">
              Configure
            </button>
          </div>
        </div>

        {/* Agent Info */}
        <div className="mt-4 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Agent ID:</span>
            <span className="font-mono">{agent.id}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Created:</span>
            <span>{new Date(agent.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentProfileCard 