"use client"

import React, { useState } from 'react'
import Button from '../../components/Button'

const CreateAgentPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'assistant',
    description: '',
    model: 'gpt-4',
    temperature: 0.7,
    systemPrompt: '',
    tools: [] as string[],
    integrations: [] as string[],
    knowledgeBases: [] as string[]
  })

  const agentTypes = [
    { value: 'assistant', label: 'Executive Assistant', description: 'Email, calendar, and administrative tasks' },
    { value: 'recruitment', label: 'Recruitment Executive', description: 'Candidate screening and hiring workflows' },
    { value: 'compliance', label: 'Compliance Officer', description: 'Document validation and regulatory checks' },
    { value: 'analytics', label: 'Market Analyst', description: 'Data analysis and market research' },
    { value: 'onboarding', label: 'Client Onboarding', description: 'New client intake and setup processes' },
    { value: 'document', label: 'Document Processor', description: 'Contract generation and document management' }
  ]

  const availableModels = [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3', label: 'Claude-3' },
    { value: 'llama-2', label: 'Llama-2' }
  ]

  const availableTools = [
    'Email Management',
    'Calendar Scheduling',
    'Document Generation',
    'Data Analysis',
    'Web Scraping',
    'CRM Integration',
    'License Verification',
    'Report Generation'
  ]

  const availableIntegrations = [
    'Zoho CRM',
    'Google Calendar',
    'Gmail',
    'Supabase',
    'VAPI',
    'BrokerSumo'
  ]

  const availableKnowledgeBases = [
    'Real Estate Regulations',
    'Company Policies',
    'Market Data',
    'Training Materials'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayToggle = (field: 'tools' | 'integrations' | 'knowledgeBases', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating agent with data:', formData)
    // TODO: Implement agent creation API call
  }

  const handlePreview = () => {
    console.log('Previewing agent:', formData)
    // TODO: Implement agent preview functionality
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="agentos-card">
          <h2 className="text-agentos-title mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group-agentos">
              <label className="form-label-agentos">Agent Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-agentos w-full"
                placeholder="e.g., Marketing Assistant"
                required
              />
            </div>

            <div className="form-group-agentos">
              <label className="form-label-agentos">Agent Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="input-agentos w-full"
              >
                {agentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-agentos-caption mt-1">
                {agentTypes.find(t => t.value === formData.type)?.description}
              </p>
            </div>
          </div>

          <div className="form-group-agentos">
            <label className="form-label-agentos">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="textarea-agentos w-full h-24"
              placeholder="Describe what this agent will do and its primary responsibilities..."
            />
          </div>
        </div>

        {/* AI Configuration */}
        <div className="agentos-card">
          <h2 className="text-agentos-title mb-6">AI Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group-agentos">
              <label className="form-label-agentos">Language Model</label>
              <select
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="input-agentos w-full"
              >
                {availableModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-agentos">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label-agentos">Temperature</label>
                <span className="text-sm text-text-primary font-mono">{formData.temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Conservative</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>
          </div>

          <div className="form-group-agentos">
            <label className="form-label-agentos">System Prompt</label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
              className="textarea-agentos w-full h-32"
              placeholder="Define the agent's personality, role, and behavioral guidelines..."
            />
          </div>
        </div>

        {/* Tools & Capabilities */}
        <div className="agentos-card">
          <h2 className="text-agentos-title mb-6">Tools & Capabilities</h2>
          
          <div className="form-group-agentos">
            <label className="form-label-agentos">Available Tools</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableTools.map((tool) => (
                <label key={tool} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tools.includes(tool)}
                    onChange={() => handleArrayToggle('tools', tool)}
                    className="rounded border-border-light"
                  />
                  <span className="text-sm text-text-secondary">{tool}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="agentos-card">
          <h2 className="text-agentos-title mb-6">Integrations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group-agentos">
              <label className="form-label-agentos">External Services</label>
              <div className="space-y-2">
                {availableIntegrations.map((integration) => (
                  <label key={integration} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.integrations.includes(integration)}
                      onChange={() => handleArrayToggle('integrations', integration)}
                      className="rounded border-border-light"
                    />
                    <span className="text-sm text-text-secondary">{integration}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group-agentos">
              <label className="form-label-agentos">Knowledge Bases</label>
              <div className="space-y-2">
                {availableKnowledgeBases.map((kb) => (
                  <label key={kb} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.knowledgeBases.includes(kb)}
                      onChange={() => handleArrayToggle('knowledgeBases', kb)}
                      className="rounded border-border-light"
                    />
                    <span className="text-sm text-text-secondary">{kb}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" type="button" onClick={handlePreview}>
            Preview Agent
          </Button>
          <Button variant="primary" type="submit">
            Create Agent
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateAgentPage 