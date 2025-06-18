"use client"

import React, { useState } from 'react'

interface Capability {
  id: string
  name: string
  description: string
  category: 'investigation' | 'creation' | 'interaction'
  success_rate: number
  usage_count: number
  avg_time: number
  enabled: boolean
}

interface AgentSkillMatrixProps {
  agentType: string
}

const AgentSkillMatrix: React.FC<AgentSkillMatrixProps> = ({ agentType }) => {
  const [activeTab, setActiveTab] = useState<'investigation' | 'creation' | 'interaction'>('investigation')
  const [capabilities, setCapabilities] = useState<Capability[]>([
    // Investigation
    {
      id: 'cap-001',
      name: 'License Verification',
      description: 'Verify real estate license status with FL-DBPR',
      category: 'investigation',
      success_rate: 94.2,
      usage_count: 87,
      avg_time: 3.2,
      enabled: true
    },
    {
      id: 'cap-002', 
      name: 'Candidate Sourcing',
      description: 'Find qualified candidates using Zoho Zia AI',
      category: 'investigation',
      success_rate: 78.5,
      usage_count: 156,
      avg_time: 45.6,
      enabled: true
    },
    {
      id: 'cap-003',
      name: 'Market Research',
      description: 'Analyze market conditions and trends',
      category: 'investigation',
      success_rate: 89.1,
      usage_count: 23,
      avg_time: 67.3,
      enabled: true
    },
    
    // Creation
    {
      id: 'cap-004',
      name: 'Email Generation',
      description: 'Create personalized recruitment emails',
      category: 'creation',
      success_rate: 92.7,
      usage_count: 234,
      avg_time: 2.1,
      enabled: true
    },
    {
      id: 'cap-005',
      name: 'Document Processing',
      description: 'Generate compliance documents and reports',
      category: 'creation',
      success_rate: 96.3,
      usage_count: 67,
      avg_time: 12.8,
      enabled: true
    },
    {
      id: 'cap-006',
      name: 'Calendar Events',
      description: 'Schedule meetings and appointments',
      category: 'creation',
      success_rate: 98.1,
      usage_count: 145,
      avg_time: 1.4,
      enabled: true
    },

    // Interaction
    {
      id: 'cap-007',
      name: 'SMS Outreach',
      description: 'Send SMS communications via VAPI',
      category: 'interaction',
      success_rate: 85.4,
      usage_count: 89,
      avg_time: 1.8,
      enabled: true
    },
    {
      id: 'cap-008',
      name: 'CRM Updates',
      description: 'Update Zoho CRM with candidate information',
      category: 'interaction',
      success_rate: 97.2,
      usage_count: 312,
      avg_time: 2.3,
      enabled: true
    },
    {
      id: 'cap-009',
      name: 'API Integration',
      description: 'Connect with external services and APIs',
      category: 'interaction',
      success_rate: 91.8,
      usage_count: 156,
      avg_time: 5.7,
      enabled: false
    }
  ])

  const [showConfigModal, setShowConfigModal] = useState<string | null>(null)

  const toggleCapability = async (capabilityId: string) => {
    try {
      // Mock API call - replace with actual endpoint
      const response = await fetch(`/api/capabilities/${capabilityId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Update local state
        setCapabilities(prev => prev.map(cap => 
          cap.id === capabilityId 
            ? { ...cap, enabled: !cap.enabled }
            : cap
        ))
      } else {
        console.error('Failed to toggle capability')
      }
    } catch (error) {
      console.error('Error toggling capability:', error)
      // For demo purposes, still update local state
      setCapabilities(prev => prev.map(cap => 
        cap.id === capabilityId 
          ? { ...cap, enabled: !cap.enabled }
          : cap
      ))
    }
  }

  const configureCapability = (capabilityId: string) => {
    setShowConfigModal(capabilityId)
  }

  const addNewCapability = () => {
    const newCapability: Capability = {
      id: `cap-${Date.now()}`,
      name: 'New Capability',
      description: 'Configure this capability',
      category: activeTab,
      success_rate: 0,
      usage_count: 0,
      avg_time: 0,
      enabled: false
    }
    
    setCapabilities(prev => [...prev, newCapability])
    setShowConfigModal(newCapability.id)
  }

  const filteredCapabilities = capabilities.filter(cap => cap.category === activeTab)
  
  const tabs = [
    { id: 'investigation', label: 'Investigation', icon: '🔍' },
    { id: 'creation', label: 'Creation', icon: '⚒️' },
    { id: 'interaction', label: 'Interaction', icon: '🤝' }
  ]

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-400'
    if (rate >= 85) return 'text-cyan-400'
    if (rate >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="agent-panel h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold font-orbitron text-white">Skill Matrix</h2>
            <button
              onClick={addNewCapability}
              className="agent-button-secondary text-sm py-1 px-3"
            >
              Add Capability
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            Available capabilities for {agentType} agent
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4">
          <div className="flex space-x-1 bg-[#151920] rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-cyan-400 text-black font-semibold' 
                    : 'text-gray-400 hover:text-white hover:bg-[#2A3441]'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
                <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded-full">
                  {capabilities.filter(c => c.category === tab.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="flex-1 px-6 pb-6 overflow-auto">
          <div className="grid grid-cols-1 gap-4">
            {filteredCapabilities.map((capability) => (
              <div
                key={capability.id}
                className={`bg-[#151920] border rounded-xl p-4 transition-all duration-300 ${
                  capability.enabled 
                    ? 'border-[#2A3441] hover:border-cyan-400/50' 
                    : 'border-[#2A3441] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-semibold text-white text-sm">{capability.name}</h3>
                      <div className="flex items-center space-x-2">
                        {/* Enable/Disable Toggle */}
                        <button
                          onClick={() => toggleCapability(capability.id)}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                            capability.enabled ? 'bg-cyan-400' : 'bg-gray-600'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                              capability.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        
                        {/* Configure Button */}
                        <button
                          onClick={() => configureCapability(capability.id)}
                          className="text-xs text-gray-400 hover:text-cyan-400 transition-colors p-1"
                          title="Configure capability"
                        >
                          ⚙️
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {capability.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-gray-400 mb-1">Success Rate</div>
                    <div className={`font-semibold ${getSuccessRateColor(capability.success_rate)}`}>
                      {capability.success_rate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Usage</div>
                    <div className="font-semibold text-white">{capability.usage_count}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Avg Time</div>
                    <div className="font-semibold text-white">{capability.avg_time}s</div>
                  </div>
                </div>

                {/* Capability Status Indicator */}
                <div className="mt-3 pt-3 border-t border-[#2A3441]">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${
                      capability.enabled ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {capability.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      capability.enabled ? 'bg-green-400' : 'bg-gray-600'
                    }`} />
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {filteredCapabilities.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-lg font-semibold text-white mb-2">No Capabilities</h3>
                <p className="text-gray-400 text-sm mb-4">
                  No capabilities configured for {activeTab} category
                </p>
                <button
                  onClick={addNewCapability}
                  className="agent-button-primary"
                >
                  Add First Capability
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1F2E] border border-[#2A3441] rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Configure Capability</h3>
              <button
                onClick={() => setShowConfigModal(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capability Name
                </label>
                <input
                  type="text"
                  className="agent-input w-full"
                  defaultValue={capabilities.find(c => c.id === showConfigModal)?.name}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="agent-input w-full h-20 resize-none"
                  defaultValue={capabilities.find(c => c.id === showConfigModal)?.description}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select className="agent-input w-full">
                    <option value="investigation">Investigation</option>
                    <option value="creation">Creation</option>
                    <option value="interaction">Interaction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select className="agent-input w-full">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowConfigModal(null)}
                className="agent-button-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfigModal(null)}
                className="agent-button-primary flex-1"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentSkillMatrix 