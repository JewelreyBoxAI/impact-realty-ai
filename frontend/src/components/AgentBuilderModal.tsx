import React, { useState, useEffect } from 'react';

interface AgentData {
  id?: string;
  name: string;
  role: 'Supervisor' | 'Worker' | 'Specialist' | 'Connector';
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  routing: {
    sequential?: string;
    hierarchical?: string;
    loopback: boolean;
  };
  notes: string;
}

interface AgentBuilderModalProps {
  isOpen: boolean;
  agentData?: AgentData;
  onClose: () => void;
  onSave: (agentData: AgentData) => void;
  className?: string;
}

const AgentBuilderModal: React.FC<AgentBuilderModalProps> = ({
  isOpen,
  agentData,
  onClose,
  onSave,
  className = ''
}) => {
  const [formData, setFormData] = useState<AgentData>({
    name: '',
    role: 'Worker',
    model: 'GPT-4o',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [],
    routing: {
      loopback: false
    },
    notes: ''
  });

  const [availableTools] = useState([
    'Web Search', 'Email Sender', 'Calendar Manager', 'File Parser',
    'Database Query', 'API Connector', 'Image Generator', 'Code Executor',
    'PDF Reader', 'Spreadsheet Analyzer', 'Chat Interface', 'Voice Synthesis'
  ]);

  const [availableModels] = useState([
    'GPT-4o', 'GPT-4o-mini', 'Claude 3 Sonnet', 'Claude 3 Haiku',
    'Gemini Pro', 'Mixtral 8x7B', 'Llama 3 70B', 'Command R+'
  ]);

  const [availableAgents] = useState([
    'DataAnalyst', 'ContentWriter', 'ResearchAgent', 'ComplianceChecker',
    'EmailManager', 'ReportGenerator', 'CustomerSupport', 'ProjectManager'
  ]);

  // Initialize form data when modal opens or agentData changes
  useEffect(() => {
    if (agentData) {
      setFormData(agentData);
    } else {
      setFormData({
        name: '',
        role: 'Worker',
        model: 'GPT-4o',
        temperature: 0.7,
        maxTokens: 2048,
        tools: [],
        routing: {
          loopback: false
        },
        notes: ''
      });
    }
  }, [agentData, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSave = () => {
    if (formData.name.trim()) {
      onSave(formData);
      onClose();
    }
  };

  const handleToolToggle = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const updateFormData = (field: keyof AgentData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateRouting = (field: keyof AgentData['routing'], value: any) => {
    setFormData(prev => ({
      ...prev,
      routing: {
        ...prev.routing,
        [field]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid #334155',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#FFFFFF',
              margin: 0
            }}>
              {agentData ? 'Edit Agent' : 'Create New Agent'}
            </h2>
            
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                fontSize: '24px',
                padding: '4px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '0 24px',
          overflowY: 'auto',
          flex: 1
        }}>
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Basic Information */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#FFFFFF',
                margin: 0,
                marginBottom: '16px'
              }}>
                Basic Information
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Agent Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#E5E7EB',
                    marginBottom: '6px'
                  }}>
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter agent name..."
                    style={{
                      width: '100%',
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Agent Role */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#E5E7EB',
                    marginBottom: '6px'
                  }}>
                    Agent Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => updateFormData('role', e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  >
                    <option value="Supervisor">Supervisor</option>
                    <option value="Worker">Worker</option>
                    <option value="Specialist">Specialist</option>
                    <option value="Connector">Connector</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Model Configuration */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#FFFFFF',
                margin: 0,
                marginBottom: '16px'
              }}>
                Model Configuration
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Model Selection */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#E5E7EB',
                    marginBottom: '6px'
                  }}>
                    Model
                  </label>
                  <select
                    value={formData.model}
                    onChange={(e) => updateFormData('model', e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                {/* Temperature */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#E5E7EB',
                    marginBottom: '6px'
                  }}>
                    Temperature: {formData.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => updateFormData('temperature', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: '#374151',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                    <span>Focused (0)</span>
                    <span>Balanced (1)</span>
                    <span>Creative (2)</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#E5E7EB',
                    marginBottom: '6px'
                  }}>
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={formData.maxTokens}
                    onChange={(e) => updateFormData('maxTokens', parseInt(e.target.value))}
                    min="1"
                    max="32000"
                    step="256"
                    style={{
                      width: '100%',
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Tools */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#FFFFFF',
                margin: 0,
                marginBottom: '16px'
              }}>
                Tools & Capabilities
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px'
              }}>
                {availableTools.map(tool => (
                  <button
                    key={tool}
                    onClick={() => handleToolToggle(tool)}
                    style={{
                      backgroundColor: formData.tools.includes(tool) ? '#3B82F6' : '#374151',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    {formData.tools.includes(tool) ? '✓ ' : ''}{tool}
                  </button>
                ))}
              </div>
            </div>

            {/* Routing Options */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#FFFFFF',
                margin: 0,
                marginBottom: '16px'
              }}>
                Routing Options
              </h3>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Sequential Target */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#E5E7EB',
                    marginBottom: '6px'
                  }}>
                    Sequential Target
                  </label>
                  <select
                    value={formData.routing.sequential || ''}
                    onChange={(e) => updateRouting('sequential', e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">None</option>
                    {availableAgents.map(agent => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                </div>

                {/* Hierarchical Parent */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#E5E7EB',
                    marginBottom: '6px'
                  }}>
                    Hierarchical Parent
                  </label>
                  <select
                    value={formData.routing.hierarchical || ''}
                    onChange={(e) => updateRouting('hierarchical', e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      color: '#FFFFFF',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">None</option>
                    {availableAgents.map(agent => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                </div>

                {/* Loopback */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#E5E7EB',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.routing.loopback}
                      onChange={(e) => updateRouting('loopback', e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#3B82F6'
                      }}
                    />
                    Enable Loopback
                  </label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#FFFFFF',
                margin: 0,
                marginBottom: '16px'
              }}>
                Notes
              </h3>
              
              <textarea
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder="Add any notes or special instructions for this agent..."
                rows={4}
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#374151',
              color: '#E5E7EB',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#4B5563';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            style={{
              backgroundColor: formData.name.trim() ? '#3B82F6' : '#374151',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: formData.name.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              opacity: formData.name.trim() ? 1 : 0.6
            }}
            onMouseOver={(e) => {
              if (formData.name.trim()) {
                e.currentTarget.style.backgroundColor = '#2563EB';
              }
            }}
            onMouseOut={(e) => {
              if (formData.name.trim()) {
                e.currentTarget.style.backgroundColor = '#3B82F6';
              }
            }}
          >
            {agentData ? 'Save Changes' : 'Create Agent'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentBuilderModal; 