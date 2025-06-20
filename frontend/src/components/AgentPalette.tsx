import React, { useState, useMemo } from 'react';

interface AgentTemplate {
  id: string;
  name: string;
  type: 'LLM' | 'Tool' | 'Worker' | 'Executor' | 'Supervisor';
  description: string;
  icon?: string;
  category: 'Templates' | 'Saved Agents' | 'System Agents';
}

interface AgentPaletteProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onAgentDragStart?: (agent: AgentTemplate, event: React.DragEvent) => void;
  agents?: AgentTemplate[];
}

const AgentPalette: React.FC<AgentPaletteProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onAgentDragStart,
  agents = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['Templates', 'Saved Agents', 'System Agents'])
  );

  // Default agents if none provided
  const defaultAgents: AgentTemplate[] = [
    // Templates
    {
      id: 'template-compliance',
      name: 'Compliance Agent',
      type: 'Executor',
      description: 'Verifies licenses and regulatory compliance',
      category: 'Templates'
    },
    {
      id: 'template-recruitment',
      name: 'Recruitment Agent',
      type: 'Worker',
      description: 'Processes candidate applications and screening',
      category: 'Templates'
    },
    {
      id: 'template-email',
      name: 'Email Automation Agent',
      type: 'Tool',
      description: 'Sends automated emails and notifications',
      category: 'Templates'
    },
    {
      id: 'template-calendar',
      name: 'Calendar Scheduling Agent',
      type: 'Tool',
      description: 'Manages appointments and scheduling',
      category: 'Templates'
    },
    {
      id: 'template-supervisor',
      name: 'Supervisor Agent',
      type: 'Supervisor',
      description: 'Orchestrates and monitors other agents',
      category: 'Templates'
    },
    // Saved Agents
    {
      id: 'saved-custom-compliance',
      name: 'Custom Compliance Flow',
      type: 'Executor',
      description: 'Customized compliance agent for real estate',
      category: 'Saved Agents'
    },
    {
      id: 'saved-lead-processor',
      name: 'Lead Processing Agent',
      type: 'Worker',
      description: 'Processes and qualifies incoming leads',
      category: 'Saved Agents'
    },
    // System Agents
    {
      id: 'system-data-sync',
      name: 'Data Sync Agent',
      type: 'Tool',
      description: 'Syncs data between systems and CRM',
      category: 'System Agents'
    },
    {
      id: 'system-report',
      name: 'Report Generation Agent',
      type: 'Tool',
      description: 'Generates reports and analytics',
      category: 'System Agents'
    }
  ];

  const agentList = agents.length > 0 ? agents : defaultAgents;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LLM': return '🧠';
      case 'Tool': return '🔧';
      case 'Worker': return '👷';
      case 'Executor': return '⚡';
      case 'Supervisor': return '👑';
      default: return '🤖';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LLM': return '#8B5CF6';
      case 'Tool': return '#F59E0B';
      case 'Worker': return '#3B82F6';
      case 'Executor': return '#22C55E';
      case 'Supervisor': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const filteredAgents = useMemo(() => {
    return agentList.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agentList, searchTerm]);

  const groupedAgents = useMemo(() => {
    const groups: Record<string, AgentTemplate[]> = {
      'Templates': [],
      'Saved Agents': [],
      'System Agents': []
    };

    filteredAgents.forEach(agent => {
      groups[agent.category].push(agent);
    });

    return groups;
  }, [filteredAgents]);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleDragStart = (agent: AgentTemplate, event: React.DragEvent) => {
    event.dataTransfer.setData('application/json', JSON.stringify(agent));
    event.dataTransfer.effectAllowed = 'copy';
    onAgentDragStart?.(agent, event);
  };

  if (isCollapsed) {
    return (
      <div style={{
        width: '48px',
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        <button
          onClick={onToggleCollapse}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px'
          }}
          title="Expand Agent Palette"
        >
          ▶
        </button>
        <div style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: '12px',
          color: '#6B7280',
          fontWeight: '500'
        }}>
          Agents
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '280px',
      backgroundColor: '#1E293B',
      border: '1px solid #334155',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #334155',
        backgroundColor: '#1E293B'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>
            Agent Palette
          </h3>
          <button
            onClick={onToggleCollapse}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px'
            }}
            title="Collapse Palette"
          >
            ◀
          </button>
        </div>
        
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '8px 12px 8px 32px',
              color: '#FFFFFF',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
            onBlur={(e) => e.target.style.borderColor = '#334155'}
          />
          <div style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
            fontSize: '14px'
          }}>
            🔍
          </div>
        </div>
      </div>

      {/* Agent Groups */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }}>
        {Object.entries(groupedAgents).map(([groupName, groupAgents]) => (
          <div key={groupName} style={{ marginBottom: '12px' }}>
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(groupName)}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#E5E7EB',
                fontSize: '14px',
                fontWeight: '600',
                padding: '8px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '4px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '12px' }}>
                {expandedGroups.has(groupName) ? '▼' : '▶'}
              </span>
              {groupName}
              <span style={{
                backgroundColor: '#374151',
                color: '#9CA3AF',
                padding: '1px 6px',
                borderRadius: '8px',
                fontSize: '10px',
                marginLeft: 'auto'
              }}>
                {groupAgents.length}
              </span>
            </button>

            {/* Group Items */}
            {expandedGroups.has(groupName) && (
              <div style={{ paddingLeft: '8px' }}>
                {groupAgents.map((agent) => (
                  <div
                    key={agent.id}
                    draggable
                    onDragStart={(e) => {
                      handleDragStart(agent, e);
                      e.currentTarget.style.cursor = 'grabbing';
                      e.currentTarget.style.opacity = '0.7';
                    }}
                    style={{
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '6px',
                      cursor: 'grab',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#1E293B';
                      e.currentTarget.style.borderColor = '#3B82F6';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#0F172A';
                      e.currentTarget.style.borderColor = '#334155';
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.cursor = 'grab';
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ fontSize: '16px', flexShrink: 0 }}>
                        {agent.icon || getTypeIcon(agent.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#FFFFFF',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {agent.name}
                          </span>
                          <span style={{
                            backgroundColor: getTypeColor(agent.type),
                            color: '#FFFFFF',
                            padding: '1px 4px',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: '500',
                            flexShrink: 0
                          }}>
                            {agent.type}
                          </span>
                        </div>
                        <p style={{
                          fontSize: '12px',
                          color: '#9CA3AF',
                          margin: 0,
                          lineHeight: '1.3',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {agent.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* No Results */}
        {filteredAgents.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: '14px',
            padding: '20px',
            fontStyle: 'italic'
          }}>
            No agents found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #334155',
        backgroundColor: '#1E293B'
      }}>
        <div style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center' }}>
          Drag agents to canvas to add them
        </div>
      </div>
    </div>
  );
};

export default AgentPalette; 