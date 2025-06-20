import React, { useState } from 'react';

interface MCPConnectionCardProps {
  id: string;
  serviceName: string;
  icon?: string;
  isConnected: boolean;
  connectionDetails?: {
    username?: string;
    email?: string;
    lastSync?: string;
    endpoint?: string;
    status?: string;
  };
  onConnect?: (id: string) => void;
  onDisconnect?: (id: string) => void;
  onSettings?: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

const MCPConnectionCard: React.FC<MCPConnectionCardProps> = ({
  id,
  serviceName,
  icon,
  isConnected,
  connectionDetails,
  onConnect,
  onDisconnect,
  onSettings,
  isLoading = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getDefaultIcon = (name: string) => {
    const serviceName = name.toLowerCase();
    if (serviceName.includes('github')) return '🐙';
    if (serviceName.includes('slack')) return '💬';
    if (serviceName.includes('discord')) return '🎮';
    if (serviceName.includes('notion')) return '📝';
    if (serviceName.includes('google')) return '🔍';
    if (serviceName.includes('microsoft')) return '💼';
    if (serviceName.includes('trello')) return '📋';
    if (serviceName.includes('jira')) return '🎯';
    if (serviceName.includes('figma')) return '🎨';
    if (serviceName.includes('stripe')) return '💳';
    if (serviceName.includes('shopify')) return '🛒';
    if (serviceName.includes('hubspot')) return '📊';
    if (serviceName.includes('salesforce')) return '☁️';
    if (serviceName.includes('zoom')) return '📹';
    if (serviceName.includes('calendar')) return '📅';
    if (serviceName.includes('email')) return '📧';
    if (serviceName.includes('database')) return '🗄️';
    if (serviceName.includes('api')) return '🔌';
    return '⚙️';
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    
    try {
      const syncDate = new Date(lastSync);
      const now = new Date();
      const diffMs = now.getTime() - syncDate.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 30) return `${diffDays}d ago`;
      return syncDate.toLocaleDateString();
    } catch {
      return lastSync;
    }
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '16px',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 10px 25px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' 
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        maxWidth: '320px',
        width: '100%',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid #334155',
            borderTop: '2px solid #3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '16px' 
      }}>
        {/* Icon */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: '#374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0
        }}>
          {icon || getDefaultIcon(serviceName)}
        </div>

        {/* Service Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#FFFFFF',
            margin: 0,
            marginBottom: '4px',
            lineHeight: '1.2'
          }}>
            {serviceName}
          </h4>
          
          {/* Connection Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#22C55E' : '#EF4444',
              animation: isConnected && isLoading ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{
              fontSize: '12px',
              color: isConnected ? '#22C55E' : '#EF4444',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        {connectionDetails && isConnected && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
              e.currentTarget.style.color = '#E5E7EB';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#9CA3AF';
            }}
          >
            ▼
          </button>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: isExpanded ? '16px' : '0' }}>
        {!isConnected ? (
          <button
            onClick={() => onConnect?.(id)}
            disabled={isLoading}
            style={{
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              flex: 1,
              opacity: isLoading ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#2563EB';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#3B82F6';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            Connect
          </button>
        ) : (
          <>
            <button
              onClick={() => onDisconnect?.(id)}
              disabled={isLoading}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: 1,
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#B91C1C';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                }
              }}
            >
              Disconnect
            </button>
            
            <button
              onClick={() => onSettings?.(id)}
              disabled={isLoading}
              style={{
                backgroundColor: '#374151',
                color: '#E5E7EB',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: 1,
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#4B5563';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#374151';
                }
              }}
            >
              Settings
            </button>
          </>
        )}
      </div>

      {/* Connection Details (Expandable) */}
      {isExpanded && connectionDetails && isConnected && (
        <div style={{
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '12px',
          color: '#E5E7EB',
          lineHeight: '1.4',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{ fontWeight: '600', color: '#FFFFFF', marginBottom: '8px' }}>
            Connection Details
          </div>
          
          {connectionDetails.username && (
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#9CA3AF' }}>User: </span>
              <span style={{ fontFamily: 'monospace' }}>{connectionDetails.username}</span>
            </div>
          )}
          
          {connectionDetails.email && (
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#9CA3AF' }}>Email: </span>
              <span style={{ fontFamily: 'monospace' }}>{connectionDetails.email}</span>
            </div>
          )}
          
          {connectionDetails.endpoint && (
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#9CA3AF' }}>Endpoint: </span>
              <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                {connectionDetails.endpoint}
              </span>
            </div>
          )}
          
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#9CA3AF' }}>Last sync: </span>
            <span>{formatLastSync(connectionDetails.lastSync)}</span>
          </div>
          
          {connectionDetails.status && (
            <div>
              <span style={{ color: '#9CA3AF' }}>Status: </span>
              <span style={{ 
                color: connectionDetails.status === 'healthy' ? '#22C55E' : '#F59E0B',
                fontWeight: '500'
              }}>
                {connectionDetails.status}
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MCPConnectionCard; 