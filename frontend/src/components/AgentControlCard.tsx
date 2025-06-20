"use client"

import React, { useState } from 'react'

interface AgentControlCardProps {
  connectedAgent?: {
    id: string
    name: string
    status: 'idle' | 'running' | 'paused' | 'error'
  } | null
  onExecuteCommand: (command: string, model: string, mode: string, temperature: number) => void
  onQuickCommand: (commandType: string) => void
}

const AgentControlCard: React.FC<AgentControlCardProps> = ({
  connectedAgent,
  onExecuteCommand,
  onQuickCommand
}) => {
  const [command, setCommand] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [selectedMode, setSelectedMode] = useState('auto')
  const [temperature, setTemperature] = useState(0.7)

  const maxChars = 500
  const charCount = command.length

  const quickCommands = [
    { id: 'pipeline', label: 'Run Full Pipeline', icon: '▶️' },
    { id: 'license', label: 'License Check', icon: '📋' },
    { id: 'report', label: 'Generate Report', icon: '📊' },
    { id: 'sync', label: 'Data Sync', icon: '🔄' }
  ]

  const models = [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3', label: 'Claude-3' },
    { value: 'llama-2', label: 'Llama-2' }
  ]

  const modes = [
    { value: 'auto', label: 'Auto Mode' },
    { value: 'manual', label: 'Manual Mode' },
    { value: 'supervised', label: 'Supervised Mode' },
    { value: 'batch', label: 'Batch Mode' }
  ]

  const handleExecute = () => {
    if (command.trim()) {
      onExecuteCommand(command, selectedModel, selectedMode, temperature)
    }
  }

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
      case 'idle':
        return <div className="w-2 h-2 bg-slate-400 rounded-full" />
      case 'paused':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-slate-400 rounded-full" />
    }
  }

  return (
    <div className="agentos-card">
      {/* Connected Agent Info */}
      <div className="mb-6">
        <h3 className="text-agentos-title mb-3">Agent Control</h3>
        {connectedAgent ? (
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-agentos border border-border-light">
            {getStatusIndicator(connectedAgent.status)}
            <div>
              <p className="text-sm font-medium text-text-primary">{connectedAgent.name}</p>
              <p className="text-xs text-text-secondary">Connected • {connectedAgent.status}</p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-800 rounded-agentos border border-border-light border-dashed">
            <p className="text-sm text-slate-400">No agent connected</p>
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="mb-6">
        <label className="form-label-agentos mb-2">Command</label>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter your command or instruction..."
          className="textarea-agentos w-full h-24"
          maxLength={maxChars}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-slate-400">
            {charCount}/{maxChars} characters
          </span>
          {charCount > maxChars * 0.9 && (
            <span className="text-xs text-yellow-400">Character limit approaching</span>
          )}
        </div>
      </div>

      {/* Quick Command Buttons */}
      <div className="mb-6">
        <label className="form-label-agentos mb-3">Quick Commands</label>
        <div className="grid grid-cols-2 gap-2">
          {quickCommands.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => onQuickCommand(cmd.id)}
              className="btn-agentos-outline text-left p-3 flex items-center gap-2"
              disabled={!connectedAgent}
            >
              <span>{cmd.icon}</span>
              <span className="text-sm">{cmd.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="space-y-4 mb-6">
        {/* Model Select */}
        <div className="form-group-agentos">
          <label className="form-label-agentos">Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="input-agentos w-full"
          >
            {models.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>

        {/* Agent Mode Select */}
        <div className="form-group-agentos">
          <label className="form-label-agentos">Agent Mode</label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="input-agentos w-full"
          >
            {modes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature Slider */}
        <div className="form-group-agentos">
          <div className="flex justify-between items-center mb-2">
            <label className="form-label-agentos">Temperature</label>
            <span className="text-sm text-text-primary font-mono">{temperature.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Conservative</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>
      </div>

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={!command.trim() || !connectedAgent}
        className="btn-agentos-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Execute Command
      </button>
    </div>
  )
}

export default AgentControlCard 