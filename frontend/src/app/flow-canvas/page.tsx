"use client"

import React, { useState } from 'react'
import Button from '../../components/Button'

const FlowCanvasPage: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const workflows = [
    {
      id: 'workflow-001',
      name: 'Client Onboarding Flow',
      description: 'Complete client intake and setup process',
      agents: ['Recruitment Executive', 'Compliance Officer'],
      status: 'active',
      lastModified: '2024-01-15T14:20:00Z'
    },
    {
      id: 'workflow-002',
      name: 'Property Analysis Pipeline',
      description: 'Market analysis and property valuation workflow',
      agents: ['Market Analyst', 'Document Processor'],
      status: 'draft',
      lastModified: '2024-01-14T09:30:00Z'
    }
  ]

  const agentNodes = [
    { id: 'recruitment', name: 'Recruitment Executive', type: 'recruitment' },
    { id: 'compliance', name: 'Compliance Officer', type: 'compliance' },
    { id: 'assistant', name: 'Executive Assistant', type: 'assistant' },
    { id: 'analytics', name: 'Market Analyst', type: 'analytics' },
    { id: 'onboarding', name: 'Client Onboarding', type: 'onboarding' },
    { id: 'document', name: 'Document Processor', type: 'document' }
  ]

  const handleCreateNew = () => {
    setSelectedWorkflow(null)
    setIsEditing(true)
  }

  const handleEditWorkflow = (workflowId: string) => {
    setSelectedWorkflow(workflowId)
    setIsEditing(true)
  }

  const handleSaveWorkflow = () => {
    console.log('Saving workflow...')
    setIsEditing(false)
    // TODO: Implement save functionality
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'recruitment': return '👥'
      case 'compliance': return '📋'
      case 'assistant': return '🤖'
      case 'analytics': return '📊'
      case 'onboarding': return '🚀'
      case 'document': return '📄'
      default: return '🔧'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {!isEditing ? (
        // Workflow Selection View
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Workflow Templates</h2>
              <p className="text-agentos-body">Select a workflow to edit or create a new one</p>
            </div>
            <Button variant="primary" onClick={handleCreateNew}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Workflow
            </Button>
          </div>

          {/* Workflow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="agentos-card hover-agentos-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-agentos-title mb-2">{workflow.name}</h3>
                    <p className="text-agentos-body text-sm mb-3">{workflow.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workflow.status === 'active' 
                          ? 'bg-accent-green/20 text-accent-green'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-agentos-caption mb-2">Connected Agents</p>
                      <div className="flex flex-wrap gap-1">
                        {workflow.agents.map((agent, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-800 text-text-secondary text-xs rounded border border-border-light"
                          >
                            {agent}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-agentos-caption">
                      Modified: {new Date(workflow.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Duplicate
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditWorkflow(workflow.id)}
                  >
                    Edit Flow
                  </Button>
                </div>
              </div>
            ))}

            {/* Create New Card */}
            <div 
              onClick={handleCreateNew}
              className="agentos-card border-dashed border-2 border-border-light hover-agentos-card cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                </svg>
                <h3 className="text-agentos-subtitle mb-2">Create New Workflow</h3>
                <p className="text-agentos-caption">
                  Build automated workflows by connecting agents
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Canvas Editor View
        <div className="flex-1 flex flex-col">
          {/* Canvas Header */}
          <div className="bg-card-bg border-b border-border-light p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  {selectedWorkflow ? 'Edit Workflow' : 'New Workflow'}
                </h2>
                <p className="text-sm text-text-secondary">
                  Drag agents from the palette to build your workflow
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveWorkflow}>
                  Save Workflow
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Layout */}
          <div className="flex-1 flex gap-6">
            {/* Agent Palette */}
            <div className="w-64 agentos-card h-fit">
              <h3 className="text-agentos-title mb-4">Agent Palette</h3>
              <div className="space-y-2">
                {agentNodes.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 bg-slate-800 rounded-agentos border border-border-light cursor-grab hover:bg-slate-700 transition-colors"
                    draggable
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getAgentIcon(agent.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{agent.name}</p>
                        <p className="text-xs text-text-secondary capitalize">{agent.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Flow Controls */}
              <div className="mt-6 pt-4 border-t border-border-light">
                <h4 className="text-sm font-semibold text-text-primary mb-3">Flow Controls</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-slate-800 rounded border border-border-light cursor-grab text-center">
                    <span className="text-sm text-text-secondary">Start</span>
                  </div>
                  <div className="p-2 bg-slate-800 rounded border border-border-light cursor-grab text-center">
                    <span className="text-sm text-text-secondary">Decision</span>
                  </div>
                  <div className="p-2 bg-slate-800 rounded border border-border-light cursor-grab text-center">
                    <span className="text-sm text-text-secondary">End</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 agentos-card">
              <div className="h-96 bg-slate-900 rounded-agentos border-2 border-dashed border-border-light flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Canvas Area</h3>
                  <p className="text-text-secondary">
                    Drag agents and flow controls here to build your workflow
                  </p>
                </div>
              </div>

              {/* Canvas Tools */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Zoom In
                  </Button>
                  <Button variant="outline" size="sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Zoom Out
                  </Button>
                  <Button variant="outline" size="sm">
                    Reset View
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Auto Layout
                  </Button>
                  <Button variant="outline" size="sm">
                    Validate Flow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FlowCanvasPage 