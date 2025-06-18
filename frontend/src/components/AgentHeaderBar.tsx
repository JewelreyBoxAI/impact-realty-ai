"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Project {
  id: string
  name: string
  description: string
  agent_count: number
  last_execution: string
  status: 'active' | 'paused' | 'completed'
}

interface AgentHeaderBarProps {
  selectedProject: Project | null
  executionStatus: 'idle' | 'running' | 'completed' | 'error'
}

const AgentHeaderBar: React.FC<AgentHeaderBarProps> = ({
  selectedProject,
  executionStatus
}) => {
  const pathname = usePathname()

  const getStatusColor = () => {
    switch (executionStatus) {
      case 'running': return 'text-cyan-400'
      case 'completed': return 'text-green-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = () => {
    switch (executionStatus) {
      case 'running': return 'Agent Executing'
      case 'completed': return 'Execution Complete'
      case 'error': return 'Execution Error'
      default: return 'System Ready'
    }
  }

  const navigationItems = [
    { href: '/', label: 'Dashboard', icon: '⬜' },
    { href: '/workflows', label: 'Workflows', icon: '▣' },
    { href: '/knowledge', label: 'Knowledge', icon: '●' }
  ]

  return (
    <header className="h-16 bg-[#1A1F2E] border-b border-[#2A3441] px-6 flex items-center justify-between">
      {/* Left - Brand and Navigation */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">AI</span>
          </div>
          <h1 className="text-xl font-bold font-orbitron neon-text">AgentOS</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center space-x-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                pathname === item.href
                  ? 'bg-cyan-400 text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A3441]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Center - Project Context */}
      <div className="flex items-center space-x-6">
        {selectedProject && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-400">Project:</span>
            <span className="text-white font-medium">{selectedProject.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              selectedProject.status === 'active' ? 'bg-green-900 text-green-300' :
              selectedProject.status === 'paused' ? 'bg-yellow-900 text-yellow-300' :
              'bg-gray-900 text-gray-300'
            }`}>
              {selectedProject.status}
            </span>
          </div>
        )}

        {/* System Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            executionStatus === 'running' ? 'bg-cyan-400 animate-pulse' :
            executionStatus === 'completed' ? 'bg-green-400' :
            executionStatus === 'error' ? 'bg-red-400' :
            'bg-gray-400'
          }`} />
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Right - User Context */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-400">
          Impact Realty AI
        </div>
        <div className="w-8 h-8 bg-[#2A3441] rounded-full flex items-center justify-center">
          <span className="text-cyan-400 text-sm font-medium">U</span>
        </div>
      </div>
    </header>
  )
}

export default AgentHeaderBar 