import React, { useState, useEffect } from 'react';

interface FlowVersion {
  id: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
  lastModified: Date;
  agentCount: number;
  connectionCount: number;
  isDraft: boolean;
}

interface FlowSaveSystemProps {
  currentFlowData: any;
  onSave: (flowData: any, metadata: any) => Promise<void>;
  onLoad: (flowId: string) => Promise<void>;
  onExport: (format: 'json' | 'zip') => Promise<void>;
  isVisible?: boolean;
  onClose?: () => void;
}

const FlowSaveSystem: React.FC<FlowSaveSystemProps> = ({
  currentFlowData,
  onSave,
  onLoad,
  onExport,
  isVisible = true,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('save');
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [flowTags, setFlowTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [savedFlows, setSavedFlows] = useState<FlowVersion[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<FlowVersion | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Mock saved flows data
  useEffect(() => {
    const mockFlows: FlowVersion[] = [
      {
        id: '1',
        name: 'Compliance Workflow v2',
        description: 'Updated compliance flow with enhanced license verification',
        version: 'v2',
        tags: ['compliance', 'licenses', 'production'],
        lastModified: new Date(Date.now() - 86400000), // 1 day ago
        agentCount: 3,
        connectionCount: 2,
        isDraft: false
      },
      {
        id: '2',
        name: 'Recruitment Pipeline',
        description: 'End-to-end recruitment process automation',
        version: 'v1',
        tags: ['recruitment', 'automation', 'hr'],
        lastModified: new Date(Date.now() - 172800000), // 2 days ago
        agentCount: 5,
        connectionCount: 4,
        isDraft: false
      },
      {
        id: '3',
        name: 'Data Sync Test',
        description: 'Testing CRM integration flows',
        version: 'Draft',
        tags: ['testing', 'crm', 'integration'],
        lastModified: new Date(Date.now() - 3600000), // 1 hour ago
        agentCount: 2,
        connectionCount: 1,
        isDraft: true
      }
    ];
    setSavedFlows(mockFlows);
  }, []);

  const handleSave = async () => {
    if (!flowName.trim()) {
      setSaveStatus('❌ Flow name is required');
      return;
    }

    setIsSaving(true);
    setSaveStatus('💾 Saving flow...');

    try {
      const metadata = {
        name: flowName,
        description: flowDescription,
        tags: flowTags,
        timestamp: new Date(),
        agentCount: currentFlowData?.agents?.length || 0,
        connectionCount: currentFlowData?.connections?.length || 0
      };

      await onSave(currentFlowData, metadata);
      setSaveStatus('✅ Flow saved successfully!');
      
      // Reset form
      setFlowName('');
      setFlowDescription('');
      setFlowTags([]);
      setTagInput('');
    } catch (error) {
      setSaveStatus('❌ Failed to save flow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (flow: FlowVersion) => {
    setIsLoading(true);
    try {
      await onLoad(flow.id);
      setSaveStatus(`✅ Loaded "${flow.name}"`);
      if (onClose) onClose();
    } catch (error) {
      setSaveStatus('❌ Failed to load flow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !flowTags.includes(tagInput.trim())) {
      setFlowTags([...flowTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFlowTags(flowTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      backgroundColor: '#1E293B',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '24px',
      color: '#FFFFFF',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>
          💾 Flow Management
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #334155' }}>
        <button
          onClick={() => setActiveTab('save')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: activeTab === 'save' ? '#3B82F6' : '#9CA3AF',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            borderBottom: activeTab === 'save' ? '2px solid #3B82F6' : '2px solid transparent'
          }}
        >
          Save Flow
        </button>
        <button
          onClick={() => setActiveTab('load')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: activeTab === 'load' ? '#3B82F6' : '#9CA3AF',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            borderBottom: activeTab === 'load' ? '2px solid #3B82F6' : '2px solid transparent'
          }}
        >
          Load Flow
        </button>
      </div>

      {/* Save Tab */}
      {activeTab === 'save' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#E5E7EB', marginBottom: '6px' }}>
              Flow Name *
            </label>
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Enter flow name..."
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#E5E7EB', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
              placeholder="Describe this flow..."
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#E5E7EB', marginBottom: '6px' }}>
              Tags
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag..."
                style={{
                  flex: 1,
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleAddTag}
                style={{
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            {flowTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {flowTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: '#374151',
                      color: '#E5E7EB',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                backgroundColor: '#22C55E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
                flex: 1
              }}
            >
              {isSaving ? '💾 Saving...' : '💾 Save Flow'}
            </button>
            <button
              onClick={() => onExport('json')}
              style={{
                backgroundColor: '#6B7280',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              📄 Export JSON
            </button>
            <button
              onClick={() => onExport('zip')}
              style={{
                backgroundColor: '#6B7280',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              📦 Export ZIP
            </button>
          </div>
        </div>
      )}

      {/* Load Tab */}
      {activeTab === 'load' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '12px' }}>
              Saved Flows
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {savedFlows.map((flow) => (
                <div
                  key={flow.id}
                  style={{
                    backgroundColor: selectedFlow?.id === flow.id ? '#1E40AF' : '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedFlow(flow)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF' }}>
                          {flow.name}
                        </span>
                        <span style={{
                          backgroundColor: flow.isDraft ? '#F59E0B' : '#22C55E',
                          color: '#FFFFFF',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          {flow.version}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '6px' }}>
                        {flow.description}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      {flow.agentCount} agents • {flow.connectionCount} connections
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      {formatDate(flow.lastModified)}
                    </div>
                  </div>
                  {flow.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                      {flow.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            backgroundColor: '#374151',
                            color: '#9CA3AF',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedFlow && (
            <button
              onClick={() => handleLoad(selectedFlow)}
              disabled={isLoading}
              style={{
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                width: '100%'
              }}
            >
              {isLoading ? '📂 Loading...' : `📂 Load "${selectedFlow.name}"`}
            </button>
          )}
        </div>
      )}

      {/* Status Message */}
      {saveStatus && (
        <div style={{
          marginTop: '16px',
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '14px',
          color: '#E5E7EB',
          textAlign: 'center'
        }}>
          {saveStatus}
        </div>
      )}
    </div>
  );
};

export default FlowSaveSystem; 