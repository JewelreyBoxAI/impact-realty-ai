import React, { useState } from 'react';

interface AgentBuildCardProps {
  agentName: string;
  releaseDate: string;
  features: string[];
  isActive: boolean;
  runtime?: number;
  onPromptSubmit?: (prompt: string) => void;
  onModeToggle?: (enabled: boolean) => void;
  onStart?: () => void;
  onSettings?: () => void;
  onKnowledgeBaseToggle?: (enabled: boolean) => void;
  className?: string;
}

interface CapabilityItem {
  id: string;
  icon: string;
  title: string;
  skillLevel: 'Standard' | 'Proficient' | 'Expert';
  description: string;
  stats: {
    used: number;
    success: number;
    failed: number;
  };
}

const AgentBuildCard: React.FC<AgentBuildCardProps> = ({
  agentName,
  releaseDate,
  features,
  isActive,
  runtime = 0,
  onPromptSubmit,
  onModeToggle,
  onStart,
  onSettings,
  onKnowledgeBaseToggle,
  className = ''
}) => {
  const [prompt, setPrompt] = useState('');
  const [agentMode, setAgentMode] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(false);
  const [activeTab, setActiveTab] = useState<'Research' | 'Creation' | 'Interaction'>('Research');
  const [outputLength, setOutputLength] = useState(50); // 0-100 scale
  const [showSettings, setShowSettings] = useState(false);

  // Mock capability data
  const capabilities: Record<string, CapabilityItem[]> = {
    Research: [
      {
        id: 'search-web',
        icon: '🔍',
        title: 'Search Web',
        skillLevel: 'Expert',
        description: 'Advanced web search with real-time results',
        stats: { used: 150, success: 142, failed: 8 }
      },
      {
        id: 'analyze-data',
        icon: '📊',
        title: 'Analyze Data',
        skillLevel: 'Proficient',
        description: 'Statistical analysis and data interpretation',
        stats: { used: 89, success: 84, failed: 5 }
      },
      {
        id: 'search-images',
        icon: '🖼️',
        title: 'Search Images',
        skillLevel: 'Standard',
        description: 'Find and analyze visual content',
        stats: { used: 45, success: 40, failed: 5 }
      }
    ],
    Creation: [
      {
        id: 'generate-webpage',
        icon: '🌐',
        title: 'Generate Webpage',
        skillLevel: 'Expert',
        description: 'Create complete HTML/CSS/JS websites',
        stats: { used: 67, success: 63, failed: 4 }
      },
      {
        id: 'write-content',
        icon: '✍️',
        title: 'Write Content',
        skillLevel: 'Expert',
        description: 'Professional content creation and copywriting',
        stats: { used: 234, success: 228, failed: 6 }
      },
      {
        id: 'design-graphics',
        icon: '🎨',
        title: 'Design Graphics',
        skillLevel: 'Proficient',
        description: 'Create visual designs and illustrations',
        stats: { used: 78, success: 71, failed: 7 }
      }
    ],
    Interaction: [
      {
        id: 'send-email',
        icon: '📧',
        title: 'Send Email',
        skillLevel: 'Expert',
        description: 'Compose and send professional emails',
        stats: { used: 123, success: 120, failed: 3 }
      },
      {
        id: 'schedule-meeting',
        icon: '📅',
        title: 'Schedule Meeting',
        skillLevel: 'Proficient',
        description: 'Calendar management and scheduling',
        stats: { used: 56, success: 52, failed: 4 }
      },
      {
        id: 'chat-support',
        icon: '💬',
        title: 'Chat Support',
        skillLevel: 'Expert',
        description: 'Customer service and support conversations',
        stats: { used: 189, success: 185, failed: 4 }
      }
    ]
  };

  const getSkillColor = (level: string) => {
    switch (level) {
      case 'Expert': return '#22C55E';
      case 'Proficient': return '#3B82F6';
      case 'Standard': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getOutputDescription = (value: number) => {
    if (value < 25) return 'Concise ~ 500 words';
    if (value < 75) return 'Detailed ~ 5k words';
    return 'Infinite ~ 50k+ words';
  };

  const handlePromptSubmit = () => {
    if (prompt.trim()) {
      onPromptSubmit?.(prompt);
      setPrompt('');
    }
  };

  const handleModeToggle = () => {
    const newMode = !agentMode;
    setAgentMode(newMode);
    onModeToggle?.(newMode);
  };

  const handleKnowledgeBaseToggle = () => {
    const newKB = !knowledgeBase;
    setKnowledgeBase(newKB);
    onKnowledgeBaseToggle?.(newKB);
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '20px',
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #334155'
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#FFFFFF',
            margin: 0,
            marginBottom: '8px'
          }}>
            {agentName}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: '#9CA3AF' }}>
              Released: {releaseDate}
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: isActive ? '#22C55E' : '#EF4444',
              fontWeight: '500'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#22C55E' : '#EF4444'
              }} />
              {isActive ? 'Active' : 'Inactive'}
            </div>
            {runtime > 0 && (
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                ⏱ {runtime}% runtime
              </div>
            )}
          </div>

          {/* Feature Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {features.map((feature, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#374151',
                  color: '#E5E7EB',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Command Input Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Give your agent a task..."
            style={{
              flex: 1,
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px',
              color: '#FFFFFF',
              fontSize: '14px',
              minHeight: '80px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handlePromptSubmit();
              }
            }}
          />
        </div>

        {/* Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Agent Mode Toggle */}
          <button
            onClick={handleModeToggle}
            style={{
              backgroundColor: agentMode ? '#3B82F6' : '#374151',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Agent Mode: {agentMode ? 'ON' : 'OFF'}
          </button>

          {/* Knowledge Base Toggle */}
          <button
            onClick={handleKnowledgeBaseToggle}
            style={{
              backgroundColor: knowledgeBase ? '#22C55E' : '#374151',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Knowledge Base: {knowledgeBase ? 'ON' : 'OFF'}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              backgroundColor: '#374151',
              color: '#E5E7EB',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ⚙️ Settings
          </button>

          {/* Start Button */}
          <button
            onClick={() => {
              handlePromptSubmit();
              onStart?.();
            }}
            disabled={!prompt.trim()}
            style={{
              backgroundColor: prompt.trim() ? '#22C55E' : '#374151',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: prompt.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              marginLeft: 'auto'
            }}
          >
            Start
          </button>
        </div>
      </div>

      {/* Output Tuning Panel */}
      {showSettings && (
        <div style={{
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#FFFFFF',
            margin: 0,
            marginBottom: '12px'
          }}>
            Output Tuning
          </h4>
          
          <div style={{ marginBottom: '8px' }}>
            <input
              type="range"
              min="0"
              max="100"
              value={outputLength}
              onChange={(e) => setOutputLength(Number(e.target.value))}
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#374151',
                borderRadius: '2px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Concise</span>
            <span style={{ fontSize: '12px', color: '#E5E7EB', fontWeight: '500' }}>
              {getOutputDescription(outputLength)}
            </span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Infinite</span>
          </div>
        </div>
      )}

      {/* Capabilities Section */}
      <div>
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #334155',
          marginBottom: '16px'
        }}>
          {(['Research', 'Creation', 'Interaction'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3B82F6' : '2px solid transparent',
                color: activeTab === tab ? '#3B82F6' : '#9CA3AF',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Capabilities Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '12px'
        }}>
          {capabilities[activeTab].map((capability) => (
            <div
              key={capability.id}
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Capability Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{capability.icon}</span>
                <div style={{ flex: 1 }}>
                  <h5 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    margin: 0,
                    marginBottom: '2px'
                  }}>
                    {capability.title}
                  </h5>
                  <span style={{
                    fontSize: '11px',
                    color: getSkillColor(capability.skillLevel),
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {capability.skillLevel}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '12px',
                color: '#E5E7EB',
                margin: 0,
                marginBottom: '12px',
                lineHeight: '1.4'
              }}>
                {capability.description}
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    ⚡ {capability.stats.used}
                  </span>
                  <span style={{ fontSize: '11px', color: '#22C55E' }}>
                    ✓ {capability.stats.success}
                  </span>
                  <span style={{ fontSize: '11px', color: '#EF4444' }}>
                    ✗ {capability.stats.failed}
                  </span>
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#6B7280',
                  fontWeight: '500'
                }}>
                  {Math.round((capability.stats.success / capability.stats.used) * 100)}% success
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentBuildCard; 