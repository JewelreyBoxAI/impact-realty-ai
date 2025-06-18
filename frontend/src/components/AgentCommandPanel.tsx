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

interface AgentCommandPanelProps {
  selectedAgent: Agent | null
  onExecutionStart: () => void
  onExecutionComplete: () => void  
  onExecutionError: () => void
}

const AgentCommandPanel: React.FC<AgentCommandPanelProps> = ({
  selectedAgent,
  onExecutionStart,
  onExecutionComplete,
  onExecutionError
}) => {
  const [command, setCommand] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [agentMode, setAgentMode] = useState('autonomous')
  const [temperature, setTemperature] = useState(0.7)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleExecute = async () => {
    if (!command.trim() || !selectedAgent) return

    setIsExecuting(true)
    onExecutionStart()

    try {
      // Mock API call - replace with actual FastAPI endpoint
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      onExecutionComplete()
    } catch (error) {
      onExecutionError()
    } finally {
      setIsExecuting(false)
    }
  }

  const quickCommands = [
    { label: 'Run Full Pipeline', command: 'Execute full recruitment pipeline with default criteria' },
    { label: 'License Check', command: 'Verify license status for all pending candidates' },
    { label: 'Generate Report', command: 'Generate performance summary for last 30 days' },
    { label: 'Data Sync', command: 'Synchronize all Zoho data and update local cache' }
  ]

  return (
    <div className="agent-panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold font-orbitron text-white">Command Center</h2>
          <p className="text-gray-400 text-sm">
            {selectedAgent ? `Connected to ${selectedAgent.name}` : 'No agent selected'}
          </p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="agent-button-secondary text-sm"
        >
          {showAdvanced ? 'Basic' : 'Advanced'}
        </button>
      </div>

      {/* Command Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Command Input
          </label>
          <div className="relative">
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter your command or task description..."
              className="agent-input w-full h-24 resize-none"
              disabled={isExecuting}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {command.length}/500
            </div>
          </div>
        </div>

        {/* Quick Commands */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Quick Commands
          </label>
          <div className="grid grid-cols-2 gap-2">
            {quickCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => setCommand(cmd.command)}
                className="text-left p-3 bg-[#151920] border border-[#2A3441] rounded-xl hover:border-cyan-400/50 transition-all duration-300"
                disabled={isExecuting}
              >
                <span className="text-sm font-medium text-white">{cmd.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="agent-input w-full"
              disabled={isExecuting}
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Agent Mode
            </label>
            <select
              value={agentMode}
              onChange={(e) => setAgentMode(e.target.value)}
              className="agent-input w-full"
              disabled={isExecuting}
            >
              <option value="autonomous">Autonomous</option>
              <option value="guided">Guided</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Temperature: {temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#2A3441] rounded-lg cursor-pointer"
              disabled={isExecuting}
            />
          </div>
        </div>

        {/* Advanced Configuration */}
        {showAdvanced && (
          <div className="bg-[#151920] border border-[#2A3441] rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Advanced Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max Tokens</label>
                <input type="number" defaultValue="2000" className="agent-input w-full text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Timeout (seconds)</label>
                <input type="number" defaultValue="300" className="agent-input w-full text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Execute Button */}
        <div className="pt-4">
          <button
            onClick={handleExecute}
            disabled={!command.trim() || !selectedAgent || isExecuting}
            className={`agent-button-primary w-full py-4 text-lg font-semibold ${
              isExecuting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isExecuting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Executing...</span>
              </div>
            ) : (
              'Execute Command'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AgentCommandPanel 