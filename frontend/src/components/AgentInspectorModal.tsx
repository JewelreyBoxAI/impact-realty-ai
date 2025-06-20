import React, { useState, useEffect, useRef } from 'react';

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  tools: string[];
  memoryEnabled: boolean;
  memorySettings: {
    type: 'short-term' | 'long-term' | 'both';
    maxTokens: number;
    persistAcrossSessions: boolean;
  };
  routingOptions: {
    onSuccess: string;
    onError: string;
    onTimeout: string;
  };
  advancedParams: Record<string, any>;
}

interface AgentInspectorModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAgent: Agent) => void;
  availableTools: string[];
  availableAgents: string[];
}

const AgentInspectorModal: React.FC<AgentInspectorModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSave,
  availableTools = [],
  availableAgents = []
}) => {
  const [editedAgent, setEditedAgent] = useState<Agent | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedParamsJson, setAdvancedParamsJson] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const agentTypes = [
    'Compliance Agent',
    'Recruitment Agent',
    'Data Sync Agent',
    'Email Automation Agent',
    'Calendar Scheduling Agent',
    'Report Generation Agent',
    'Notification Agent',
    'Supervisor Agent'
  ];

  const routingOptions = [
    'Continue to Next',
    'Stop Flow',
    'Retry Current',
    'Branch to Alternative',
    ...availableAgents
  ];

  useEffect(() => {
    if (agent && isOpen) {
      setEditedAgent({ ...agent });
      setAdvancedParamsJson(JSON.stringify(agent.advancedParams, null, 2));
      setHasChanges(false);
    }
  }, [agent, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
        setHasChanges(false);
      }
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    if (!editedAgent) return;

    try {
      const parsedAdvancedParams = JSON.parse(advancedParamsJson);
      const finalAgent = {
        ...editedAgent,
        advancedParams: parsedAdvancedParams
      };
      onSave(finalAgent);
      setHasChanges(false);
      onClose();
    } catch (error) {
      alert('Invalid JSON in Advanced Parameters. Please fix the syntax.');
    }
  };

  const updateAgent = (updates: Partial<Agent>) => {
    if (!editedAgent) return;
    setEditedAgent({ ...editedAgent, ...updates });
    setHasChanges(true);
  };

  const handleToolToggle = (tool: string) => {
    if (!editedAgent) return;
    const newTools = editedAgent.tools.includes(tool)
      ? editedAgent.tools.filter(t => t !== tool)
      : [...editedAgent.tools, tool];
    updateAgent({ tools: newTools });
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !editedAgent) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleBackgroundClick}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: '#1E293B',
          borderRadius: '12px',
          border: '1px solid #334155',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid #334155',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>
              🔍 Agent Inspector
            </h2>
            <button
              onClick={handleClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseOut={(e) => e.currentTarget.style.color = '#9CA3AF'}
            >
              ×
            </button>
          </div>
          {hasChanges && (
            <div style={{ color: '#F59E0B', fontSize: '14px', marginTop: '8px' }}>
              ⚠️ You have unsaved changes
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Agent Name */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#E5E7EB', marginBottom: '6px' }}>
                Agent Name
              </label>
              <input
                type="text"
                value={editedAgent.name}
                onChange={(e) => updateAgent({ name: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            {/* Agent Type */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#E5E7EB', marginBottom: '6px' }}>
                Agent Type
              </label>
              <select
                value={editedAgent.type}
                onChange={(e) => updateAgent({ type: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                {agentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#E5E7EB', marginBottom: '6px' }}>
                Description
              </label>
              <textarea
                value={editedAgent.description}
                onChange={(e) => updateAgent({ description: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical' as const
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            {/* Tools */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#E5E7EB', marginBottom: '6px' }}>
                Available Tools
              </label>
              <div style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '12px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {availableTools.map(tool => (
                  <label
                    key={tool}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 0',
                      cursor: 'pointer',
                      color: '#E5E7EB',
                      fontSize: '14px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editedAgent.tools.includes(tool)}
                      onChange={() => handleToolToggle(tool)}
                      style={{ marginRight: '8px' }}
                    />
                    {tool}
                  </label>
                ))}
              </div>
            </div>

            {/* Memory Settings */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#E5E7EB', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={editedAgent.memoryEnabled}
                  onChange={(e) => updateAgent({ memoryEnabled: e.target.checked })}
                />
                Enable Memory
              </label>
              {editedAgent.memoryEnabled && (
                <div style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                      Memory Type
                    </label>
                    <select
                      value={editedAgent.memorySettings.type}
                      onChange={(e) => updateAgent({
                        memorySettings: {
                          ...editedAgent.memorySettings,
                          type: e.target.value as any
                        }
                      })}
                      style={{
                        width: '100%',
                        backgroundColor: '#1E293B',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                    >
                      <option value="short-term">Short-term</option>
                      <option value="long-term">Long-term</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                      Max Tokens: {editedAgent.memorySettings.maxTokens}
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="10000"
                      step="500"
                      value={editedAgent.memorySettings.maxTokens}
                      onChange={(e) => updateAgent({
                        memorySettings: {
                          ...editedAgent.memorySettings,
                          maxTokens: parseInt(e.target.value)
                        }
                      })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#E5E7EB' }}>
                    <input
                      type="checkbox"
                      checked={editedAgent.memorySettings.persistAcrossSessions}
                      onChange={(e) => updateAgent({
                        memorySettings: {
                          ...editedAgent.memorySettings,
                          persistAcrossSessions: e.target.checked
                        }
                      })}
                    />
                    Persist across sessions
                  </label>
                </div>
              )}
            </div>

            {/* Routing Options */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#E5E7EB', marginBottom: '12px' }}>
                Routing Configuration
              </label>
              <div style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                    On Success
                  </label>
                  <select
                    value={editedAgent.routingOptions.onSuccess}
                    onChange={(e) => updateAgent({
                      routingOptions: {
                        ...editedAgent.routingOptions,
                        onSuccess: e.target.value
                      }
                    })}
                    style={{
                      width: '100%',
                      backgroundColor: '#1E293B',
                      border: '1px solid #374151',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      color: '#FFFFFF',
                      fontSize: '12px'
                    }}
                  >
                    {routingOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                    On Error
                  </label>
                  <select
                    value={editedAgent.routingOptions.onError}
                    onChange={(e) => updateAgent({
                      routingOptions: {
                        ...editedAgent.routingOptions,
                        onError: e.target.value
                      }
                    })}
                    style={{
                      width: '100%',
                      backgroundColor: '#1E293B',
                      border: '1px solid #374151',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      color: '#FFFFFF',
                      fontSize: '12px'
                    }}
                  >
                    {routingOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                    On Timeout
                  </label>
                  <select
                    value={editedAgent.routingOptions.onTimeout}
                    onChange={(e) => updateAgent({
                      routingOptions: {
                        ...editedAgent.routingOptions,
                        onTimeout: e.target.value
                      }
                    })}
                    style={{
                      width: '100%',
                      backgroundColor: '#1E293B',
                      border: '1px solid #374151',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      color: '#FFFFFF',
                      fontSize: '12px'
                    }}
                  >
                    {routingOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Advanced Parameters */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#3B82F6',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '0'
                }}
              >
                {showAdvanced ? '▼' : '▶'} Advanced Parameters
              </button>
              {showAdvanced && (
                <div style={{ marginTop: '12px' }}>
                  <textarea
                    value={advancedParamsJson}
                    onChange={(e) => setAdvancedParamsJson(e.target.value)}
                    placeholder="Enter JSON configuration..."
                    rows={8}
                    style={{
                      width: '100%',
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      outline: 'none',
                      resize: 'vertical' as const
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={handleClose}
            style={{
              backgroundColor: '#6B7280',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4B5563'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6B7280'}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            style={{
              backgroundColor: hasChanges ? '#22C55E' : '#374151',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              opacity: hasChanges ? 1 : 0.6
            }}
            onMouseOver={(e) => hasChanges && (e.currentTarget.style.backgroundColor = '#16A34A')}
            onMouseOut={(e) => hasChanges && (e.currentTarget.style.backgroundColor = '#22C55E')}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentInspectorModal; 