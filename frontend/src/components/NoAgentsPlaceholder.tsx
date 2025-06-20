import React from 'react';

interface NoAgentsPlaceholderProps {
  onAddFirstAgent: () => void;
}

const NoAgentsPlaceholder: React.FC<NoAgentsPlaceholderProps> = ({ onAddFirstAgent }) => {
  const tips = [
    "Drag agents from the palette to build your flow",
    "Connect agents with ribbons to define data flow",
    "Use different connector types for various relationships",
    "Group related agents for better organization"
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '40px',
      textAlign: 'center',
      color: '#FFFFFF'
    }}>
      {/* Main Icon */}
      <div style={{
        fontSize: '64px',
        marginBottom: '24px',
        opacity: 0.7
      }}>
        🤖
      </div>

      {/* Welcome Message */}
      <h2 style={{
        fontSize: '28px',
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: '16px',
        lineHeight: '1.2'
      }}>
        Start Building Your Agentic Flow
      </h2>

      <p style={{
        fontSize: '16px',
        color: '#E5E7EB',
        marginBottom: '32px',
        maxWidth: '500px',
        lineHeight: '1.5'
      }}>
        Create powerful AI agent workflows by connecting specialized agents. 
        Each agent handles specific tasks, working together to automate your business processes.
      </p>

      {/* CTA Button */}
      <button
        onClick={onAddFirstAgent}
        style={{
          backgroundColor: '#3B82F6',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          padding: '16px 32px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '40px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#2563EB';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#3B82F6';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }}
      >
        ✨ Add First Agent
      </button>

      {/* Tips Section */}
      <div style={{
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#FFFFFF',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          💡 Quick Tips
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {tips.map((tip, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#0F172A',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}
            >
              <div style={{
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                {index + 1}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#E5E7EB',
                lineHeight: '1.4'
              }}>
                {tip}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Help */}
      <div style={{
        marginTop: '32px',
        padding: '16px',
        backgroundColor: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#9CA3AF',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          Need help getting started? Check out our{' '}
          <span style={{ color: '#3B82F6', textDecoration: 'underline', cursor: 'pointer' }}>
            documentation
          </span>{' '}
          or explore{' '}
          <span style={{ color: '#3B82F6', textDecoration: 'underline', cursor: 'pointer' }}>
            example flows
          </span>
        </div>
      </div>

      {/* Visual Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#3B82F6',
        opacity: 0.1,
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#22C55E',
        opacity: 0.1,
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '20%',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#F59E0B',
        opacity: 0.1,
        zIndex: -1
      }} />
    </div>
  );
};

export default NoAgentsPlaceholder; 