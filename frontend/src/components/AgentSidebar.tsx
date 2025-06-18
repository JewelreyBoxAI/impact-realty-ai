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

interface KnowledgeBase {
  id: string
  name: string
  documents: number
  size: string
}

interface AgentSidebarProps {
  selectedAgent: Agent | null
  selectedProject: Project | null
  onAgentSelect: (agent: Agent) => void
  onProjectSelect: (project: Project) => void
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({
  selectedAgent,
  selectedProject,
  onAgentSelect,
  onProjectSelect
}) => {
  const [activeSection, setActiveSection] = useState<'agents' | 'projects' | 'knowledge'>('agents')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState<'agent' | 'project' | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    show: boolean
    x: number
    y: number
    type: 'agent' | 'project' | 'knowledge'
    itemId: string
  } | null>(null)

  // Mock data - replace with actual API calls
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'agent-001',
      name: 'Recruitment Executive',
      type: 'recruitment',
      status: 'idle',
      description: 'Automated recruitment pipeline',
      created_at: '2024-01-15T10:30:00Z',
      performance_metrics: { success_rate: 87.5, avg_execution_time: 2.4, total_executions: 156 }
    },
    {
      id: 'agent-002',
      name: 'Compliance Officer',
      type: 'compliance',
      status: 'running',
      description: 'Document compliance and validation',
      created_at: '2024-01-12T14:20:00Z',
      performance_metrics: { success_rate: 92.1, avg_execution_time: 5.2, total_executions: 89 }
    },
    {
      id: 'agent-003',
      name: 'Executive Assistant',
      type: 'assistant',
      status: 'idle',
      description: 'Email and calendar management',
      created_at: '2024-01-10T09:15:00Z',
      performance_metrics: { success_rate: 94.8, avg_execution_time: 1.1, total_executions: 245 }
    }
  ])

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'project-001',
      name: 'Tampa Bay Expansion',
      description: 'Q1 2024 recruitment drive',
      agent_count: 3,
      last_execution: '2024-01-15T14:20:00Z',
      status: 'active'
    },
    {
      id: 'project-002',
      name: 'Compliance Audit',
      description: 'Annual compliance review',
      agent_count: 2,
      last_execution: '2024-01-14T11:30:00Z',
      status: 'active'
    }
  ])

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    { id: 'kb-001', name: 'Real Estate Regulations', documents: 45, size: '2.3MB' },
    { id: 'kb-002', name: 'Company Policies', documents: 23, size: '1.8MB' },
    { id: 'kb-003', name: 'Market Data', documents: 67, size: '4.1MB' }
  ])

  const createNewAgent = () => {
    setShowCreateModal('agent')
  }

  const createNewProject = () => {
    setShowCreateModal('project')
  }

  const handleCreateSubmit = (type: 'agent' | 'project', data: any) => {
    if (type === 'agent') {
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        name: data.name,
        type: data.type,
        status: 'idle',
        description: data.description,
        created_at: new Date().toISOString(),
        performance_metrics: { success_rate: 0, avg_execution_time: 0, total_executions: 0 }
      }
      setAgents(prev => [...prev, newAgent])
      onAgentSelect(newAgent)
    } else {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: data.name,
        description: data.description,
        agent_count: 0,
        last_execution: new Date().toISOString(),
        status: 'active'
      }
      setProjects(prev => [...prev, newProject])
      onProjectSelect(newProject)
    }
    setShowCreateModal(null)
  }

  const handleContextMenu = (e: React.MouseEvent, type: 'agent' | 'project' | 'knowledge', itemId: string) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      type,
      itemId
    })
  }

  const handleDeleteItem = (type: string, itemId: string) => {
    if (type === 'agent') {
      setAgents(prev => prev.filter(a => a.id !== itemId))
      if (selectedAgent?.id === itemId) {
        onAgentSelect(agents.find(a => a.id !== itemId) || agents[0])
      }
    } else if (type === 'project') {
      setProjects(prev => prev.filter(p => p.id !== itemId))
      if (selectedProject?.id === itemId) {
        onProjectSelect(projects.find(p => p.id !== itemId) || projects[0])
      }
    } else if (type === 'knowledge') {
      setKnowledgeBases(prev => prev.filter(k => k.id !== itemId))
    }
    setContextMenu(null)
  }

  const handleKnowledgeBaseSelect = (kb: KnowledgeBase) => {
    console.log('Selected knowledge base:', kb)
    // Navigate to knowledge base detail view
  }

  const getFilteredAgents = () => {
    return agents.filter(agent => 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getFilteredProjects = () => {
    return projects.filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getFilteredKnowledgeBases = () => {
    return knowledgeBases.filter(kb => 
      kb.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'recruitment': return '👥'
      case 'compliance': return '📋'
      case 'assistant': return '🤖'
      default: return '⚡'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-cyan-400'
      case 'paused': return 'bg-yellow-400'
      case 'error': return 'bg-red-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="h-full bg-[#1A1F2E] flex flex-col">
      {/* Navigation Tabs */}
      <div className="p-4 border-b border-[#2A3441]">
        <div className="flex space-x-1 bg-[#151920] rounded-xl p-1">
          <button
            onClick={() => setActiveSection('agents')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
              activeSection === 'agents' 
                ? 'bg-cyan-400 text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Agents
          </button>
          <button
            onClick={() => setActiveSection('projects')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
              activeSection === 'projects' 
                ? 'bg-cyan-400 text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveSection('knowledge')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
              activeSection === 'knowledge' 
                ? 'bg-cyan-400 text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Knowledge
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-[#2A3441]">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${activeSection}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="agent-input w-full pl-8"
          />
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeSection === 'agents' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Available Agents</h3>
              <button
                onClick={createNewAgent}
                className="agent-button-secondary text-xs py-1 px-2"
              >
                + New
              </button>
            </div>
            {getFilteredAgents().map((agent) => (
              <div
                key={agent.id}
                onClick={() => onAgentSelect(agent)}
                onContextMenu={(e) => handleContextMenu(e, 'agent', agent.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedAgent?.id === agent.id
                    ? 'bg-cyan-400/10 border border-cyan-400/50'
                    : 'bg-[#151920] border border-[#2A3441] hover:border-cyan-400/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-sm">{getAgentIcon(agent.type)}</span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(agent.status)} rounded-full border border-[#1A1F2E]`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{agent.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{agent.type}</div>
                    <div className="text-xs text-cyan-400">{agent.performance_metrics.success_rate}% success</div>
                  </div>
                </div>
              </div>
            ))}
            {getFilteredAgents().length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">No agents found</div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Active Projects</h3>
              <button
                onClick={createNewProject}
                className="agent-button-secondary text-xs py-1 px-2"
              >
                + New
              </button>
            </div>
            {getFilteredProjects().map((project) => (
              <div
                key={project.id}
                onClick={() => onProjectSelect(project)}
                onContextMenu={(e) => handleContextMenu(e, 'project', project.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedProject?.id === project.id
                    ? 'bg-cyan-400/10 border border-cyan-400/50'
                    : 'bg-[#151920] border border-[#2A3441] hover:border-cyan-400/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <span className="text-sm text-white font-bold">P</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{project.name}</div>
                    <div className="text-xs text-gray-400">{project.agent_count} agents</div>
                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                      project.status === 'active' ? 'bg-green-900 text-green-300' :
                      project.status === 'paused' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-gray-900 text-gray-300'
                    }`}>
                      {project.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {getFilteredProjects().length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">No projects found</div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'knowledge' && (
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Knowledge Bases</h3>
            {getFilteredKnowledgeBases().map((kb) => (
              <div
                key={kb.id}
                onClick={() => handleKnowledgeBaseSelect(kb)}
                onContextMenu={(e) => handleContextMenu(e, 'knowledge', kb.id)}
                className="p-3 rounded-xl cursor-pointer transition-all duration-300 bg-[#151920] border border-[#2A3441] hover:border-cyan-400/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-sm">📚</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{kb.name}</div>
                    <div className="text-xs text-gray-400">{kb.documents} documents</div>
                    <div className="text-xs text-cyan-400">{kb.size}</div>
                  </div>
                </div>
              </div>
            ))}
            {getFilteredKnowledgeBases().length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">No knowledge bases found</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu?.show && (
        <div
          className="fixed bg-[#1A1F2E] border border-[#2A3441] rounded-lg shadow-lg z-50 py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button
            onClick={() => setContextMenu(null)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A3441] hover:text-white"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteItem(contextMenu.type, contextMenu.itemId)}
            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300"
          >
            Delete
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1F2E] border border-[#2A3441] rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                Create New {showCreateModal === 'agent' ? 'Agent' : 'Project'}
              </h3>
              <button
                onClick={() => setShowCreateModal(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const data = Object.fromEntries(formData.entries())
              handleCreateSubmit(showCreateModal, data)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="agent-input w-full"
                    placeholder={`Enter ${showCreateModal} name...`}
                  />
                </div>
                
                {showCreateModal === 'agent' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type
                    </label>
                    <select name="type" required className="agent-input w-full">
                      <option value="">Select agent type...</option>
                      <option value="recruitment">Recruitment</option>
                      <option value="compliance">Compliance</option>
                      <option value="assistant">Assistant</option>
                      <option value="analysis">Analysis</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    required
                    className="agent-input w-full h-20 resize-none"
                    placeholder={`Describe the ${showCreateModal}...`}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(null)}
                  className="agent-button-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="agent-button-primary flex-1"
                >
                  Create {showCreateModal === 'agent' ? 'Agent' : 'Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentSidebar 