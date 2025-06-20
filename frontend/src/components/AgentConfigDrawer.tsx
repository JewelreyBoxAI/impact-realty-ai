import React, { useState, useEffect } from 'react';

interface AgentConfigData {
  id: string;
  name: string;
  model: string;
  temperature: number;
  maxTokens: number;
  routing: {
    nextAgents: string[];
    parent?: string;
  };
  tools: string[];
  executionMode: 'Autonomous' | 'Human-in-Loop' | 'Triggered';
}

interface AgentConfigDrawerProps {
  isOpen: boolean;
  agentData?: AgentConfigData;
  onClose: () => void;
  onSave: (agentData: AgentConfigData) => void;
  className?: string;
}

const AgentConfigDrawer: React.FC<AgentConfigDrawerProps> = ({
  isOpen,
  agentData,
  onClose,
  onSave,
  className = ''
}) => {
  const [formData, setFormData] = useState<AgentConfigData>({
    id: '',
    name: '',
    model: 'GPT-4o',
    temperature: 0.7,
    maxTokens: 2048,
    routing: {
      nextAgents: []
    },
    tools: [],
    executionMode: 'Autonomous'
  });

  const [availableModels] = useState([
    'GPT-4o', 'GPT-4o-mini', 'Claude 3 Sonnet', 'Claude 3 Haiku',
    'Gemini Pro', 'Mixtral 8x7B', 'Llama 3 70B', 'Command R+'
  ]);

  const [availableAgents] = useState([
    'DataAnalyst', 'ContentWriter', 'ResearchAgent', 'ComplianceChecker',
    'EmailManager', 'ReportGenerator', 'CustomerSupport', 'ProjectManager'
  ]);

  const [availableTools] = useState([
    'Web Search', 'Email Sender', 'Calendar Manager', 'File Parser',
    'Database Query', 'API Connector', 'Image Generator', 'Code Executor'
  ]);

  // Initialize form data when drawer opens or agentData changes
  useEffect(() => {
    if (agentData) {
      setFormData(agentData);
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

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const updateFormData = (field: keyof AgentConfigData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateRouting = (field: keyof AgentConfigData['routing'], value: any) => {
    setFormData(prev => ({
      ...prev,
      routing: {
        ...prev.routing,
        [field]: value
      }
    }));
  };

  const toggleNextAgent = (agent: string) => {
    setFormData(prev => ({
      ...prev,
      routing: {
        ...prev.routing,
        nextAgents: prev.routing.nextAgents.includes(agent)
          ? prev.routing.nextAgents.filter(a => a !== agent)
          : [...prev.routing.nextAgents, agent]
      }
    }));
  };

  const toggleTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '480px',
          maxWidth: '90vw',
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRight: 'none',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          boxShadow: isOpen ? '-10px 0 25px -3px rgba(0, 0, 0, 0.3)' : 'none'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#FFFFFF',
            margin: 0
          }}>
            Edit Agent Config
          </h2>
          
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '20px',
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

        {/* Drawer Body */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Agent Name (Read-only) */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#9CA3AF',
                marginBottom: '6px'
              }}>
                Agent Name
              </label>
              <div style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '10px 12px',
                color: '#E5E7EB',
                fontSize: '14px'
              }}>
                {formData.name || 'Unnamed Agent'}
              </div>
            </div>

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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                <span>Focused</span>
                <span>Balanced</span>
                <span>Creative</span>
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

            {/* Execution Mode */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#E5E7EB',
                marginBottom: '6px'
              }}>
                Execution Mode
              </label>
              <select
                value={formData.executionMode}
                onChange={(e) => updateFormData('executionMode', e.target.value)}
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
                <option value="Autonomous">Autonomous</option>
                <option value="Human-in-Loop">Human-in-Loop</option>
                <option value="Triggered">Triggered</option>
              </select>
            </div>

            {/* Next Agents (Routing) */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#E5E7EB',
                marginBottom: '6px'
              }}>
                Next Agents ({formData.routing.nextAgents.length} selected)
              </label>
              <div style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {availableAgents.map(agent => (
                  <button
                    key={agent}
                    onClick={() => toggleNextAgent(agent)}
                    style={{
                      width: '100%',
                      backgroundColor: formData.routing.nextAgents.includes(agent) ? '#3B82F6' : 'transparent',
                      color: formData.routing.nextAgents.includes(agent) ? '#FFFFFF' : '#E5E7EB',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      marginBottom: '2px'
                    }}
                    onMouseOver={(e) => {
                      if (!formData.routing.nextAgents.includes(agent)) {
                        e.currentTarget.style.backgroundColor = '#374151';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!formData.routing.nextAgents.includes(agent)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {formData.routing.nextAgents.includes(agent) ? '✓ ' : ''}{agent}
                  </button>
                ))}
              </div>
            </div>

            {/* Parent Agent */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#E5E7EB',
                marginBottom: '6px'
              }}>
                Parent Agent (Hierarchical)
              </label>
              <select
                value={formData.routing.parent || ''}
                onChange={(e) => updateRouting('parent', e.target.value)}
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

            {/* Tools */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#E5E7EB',
                marginBottom: '6px'
              }}>
                Tools Attached ({formData.tools.length} selected)
              </label>
              <div style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {availableTools.map(tool => (
                  <button
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    style={{
                      width: '100%',
                      backgroundColor: formData.tools.includes(tool) ? '#22C55E' : 'transparent',
                      color: formData.tools.includes(tool) ? '#FFFFFF' : '#E5E7EB',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      marginBottom: '2px'
                    }}
                    onMouseOver={(e) => {
                      if (!formData.tools.includes(tool)) {
                        e.currentTarget.style.backgroundColor = '#374151';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!formData.tools.includes(tool)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {formData.tools.includes(tool) ? '✓ ' : ''}{tool}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #334155',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: '#374151',
              color: '#E5E7EB',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
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
            style={{
              flex: 1,
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3B82F6';
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default AgentConfigDrawer; 