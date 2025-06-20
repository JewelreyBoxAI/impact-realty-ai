import React, { useState, useEffect } from 'react';

interface AgentSuggestion {
  id: string;
  name: string;
  type: string;
  rationale: string;
  confidence: number;
}

interface SmartAgentSuggestionProps {
  currentAgent?: string;
  flowContext?: string[];
  onAddAgent: (agentName: string) => void;
  onDismiss: () => void;
  visible?: boolean;
}

const SmartAgentSuggestion: React.FC<SmartAgentSuggestionProps> = ({
  currentAgent,
  flowContext = [],
  onAddAgent,
  onDismiss,
  visible = true
}) => {
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Predefined suggestion map based on common patterns
  const suggestionMap: Record<string, AgentSuggestion[]> = {
    'Compliance Agent': [
      {
        id: 'recruit-1',
        name: 'Recruitment Agent',
        type: 'Processing',
        rationale: 'Common next step after compliance - process qualified candidates',
        confidence: 0.85
      },
      {
        id: 'data-1',
        name: 'Data Sync Agent',
        type: 'Integration',
        rationale: 'Sync compliance results to CRM system',
        confidence: 0.78
      }
    ],
    'Recruitment Agent': [
      {
        id: 'email-1',
        name: 'Email Automation Agent',
        type: 'Communication',
        rationale: 'Send automated follow-ups to candidates',
        confidence: 0.82
      },
      {
        id: 'calendar-1',
        name: 'Calendar Scheduling Agent',
        type: 'Scheduling',
        rationale: 'Schedule interviews with qualified candidates',
        confidence: 0.80
      }
    ],
    'Data Sync Agent': [
      {
        id: 'report-1',
        name: 'Report Generation Agent',
        type: 'Analytics',
        rationale: 'Generate reports from synced data',
        confidence: 0.75
      },
      {
        id: 'notification-1',
        name: 'Notification Agent',
        type: 'Communication',
        rationale: 'Send notifications about data sync status',
        confidence: 0.70
      }
    ]
  };

  // Generate suggestions based on current context
  useEffect(() => {
    if (!visible) return;

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let newSuggestions: AgentSuggestion[] = [];

      // Get suggestions based on current agent
      if (currentAgent && suggestionMap[currentAgent]) {
        newSuggestions = [...suggestionMap[currentAgent]];
      }

      // Filter out agents already in flow
      newSuggestions = newSuggestions.filter(
        suggestion => !flowContext.includes(suggestion.name)
      );

      // Add some general suggestions if no specific ones found
      if (newSuggestions.length === 0) {
        newSuggestions = [
          {
            id: 'general-1',
            name: 'Email Automation Agent',
            type: 'Communication',
            rationale: 'Commonly used for automated communications',
            confidence: 0.60
          },
          {
            id: 'general-2',
            name: 'Report Generation Agent',
            type: 'Analytics',
            rationale: 'Useful for generating insights and reports',
            confidence: 0.55
          }
        ];
      }

      setSuggestions(newSuggestions.slice(0, 3)); // Limit to top 3 suggestions
      setIsLoading(false);
    }, 800);
  }, [currentAgent, flowContext, visible]);

  if (!visible || suggestions.length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#22C55E'; // High confidence - green
    if (confidence >= 0.6) return '#F59E0B'; // Medium confidence - yellow
    return '#EF4444'; // Low confidence - red
  };

  return (
    <div style={{
      backgroundColor: '#1E293B',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '20px',
      color: '#FFFFFF',
      maxWidth: '400px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>
          🤖 Smart Agent Suggestions
        </h4>
        <button
          onClick={onDismiss}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'}
          onMouseOut={(e) => e.currentTarget.style.color = '#9CA3AF'}
        >
          ×
        </button>
      </div>

      {currentAgent && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#0F172A', borderRadius: '6px' }}>
          <div style={{ fontSize: '14px', color: '#E5E7EB' }}>
            Based on: <span style={{ color: '#3B82F6', fontWeight: '500' }}>{currentAgent}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ color: '#9CA3AF' }}>
            🔄 Analyzing flow context...
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                    {suggestion.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>
                    Type: {suggestion.type}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: getConfidenceColor(suggestion.confidence),
                  fontWeight: '500'
                }}>
                  {Math.round(suggestion.confidence * 100)}% match
                </div>
              </div>

              <div style={{ fontSize: '14px', color: '#E5E7EB', marginBottom: '12px', lineHeight: '1.4' }}>
                {suggestion.rationale}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onAddAgent(suggestion.name)}
                  style={{
                    backgroundColor: '#3B82F6',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    flex: 1
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                >
                  Add Suggested Agent
                </button>
                <button
                  onClick={() => {
                    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#9CA3AF',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    cursor: 'pointer'
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
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        backgroundColor: '#0F172A', 
        borderRadius: '6px',
        fontSize: '12px',
        color: '#9CA3AF',
        textAlign: 'center'
      }}>
        💡 Suggestions based on common flow patterns and AI analysis
      </div>
    </div>
  );
};

export default SmartAgentSuggestion; 