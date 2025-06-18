"use client"

import React, { useState, useEffect } from 'react'
import AgentHeaderBar from '../../components/AgentHeaderBar'
import AgentSidebar from '../../components/AgentSidebar'
import KnowledgeForge from '../../components/KnowledgeForge'
import AgentSkillMatrix from '../../components/AgentSkillMatrix'

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

export default function KnowledgePage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')

  // Mock data - replace with actual API calls
  const mockAgent: Agent = {
    id: 'agent-001',
    name: 'Recruitment Executive',
    type: 'recruitment',
    status: 'idle',
    description: 'Automated recruitment pipeline with license verification and engagement tools',
    created_at: '2024-01-15T10:30:00Z',
    performance_metrics: {
      success_rate: 87.5,
      avg_execution_time: 2.4,
      total_executions: 156
    }
  }

  const mockProject: Project = {
    id: 'project-001',
    name: 'Tampa Bay Expansion',
    description: 'Q1 2024 recruitment drive for Tampa Bay market',
    agent_count: 3,
    last_execution: '2024-01-15T14:20:00Z',
    status: 'active'
  }

  useEffect(() => {
    setSelectedAgent(mockAgent)
    setSelectedProject(mockProject)
  }, [])

  return (
    <div className="min-h-screen bg-[#0C0F1A] text-white">
      {/* Header Bar */}
      <AgentHeaderBar 
        selectedProject={selectedProject}
        executionStatus={executionStatus}
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-[#2A3441]">
          <AgentSidebar 
            selectedAgent={selectedAgent}
            selectedProject={selectedProject}
            onAgentSelect={setSelectedAgent}
            onProjectSelect={setSelectedProject}
          />
        </div>

        {/* Main Knowledge Management */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Knowledge Forge */}
            <div className="col-span-6">
              <KnowledgeForge />
            </div>

            {/* Agent Skills and Capabilities */}
            <div className="col-span-6">
              <AgentSkillMatrix agentType={selectedAgent?.type || 'recruitment'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 