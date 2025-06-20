import React, { useState } from 'react';

interface ToolsCardProps {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  version?: string;
  isConfigured?: boolean;
  isAdded?: boolean;
  documentationUrl?: string;
  configurationUrl?: string;
  onAddToAgent?: (id: string) => void;
  onConfigure?: (id: string) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

const ToolsCard: React.FC<ToolsCardProps> = ({
  id,
  name,
  description,
  icon,
  category,
  version,
  isConfigured = false,
  isAdded = false,
  documentationUrl,
  configurationUrl,
  onAddToAgent,
  onConfigure,
  onRemove,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDefaultIcon = (toolName: string) => {
    const name = toolName.toLowerCase();
    if (name.includes('api')) return '🔌';
    if (name.includes('database') || name.includes('db')) return '🗄️';
    if (name.includes('search')) return '🔍';
    if (name.includes('email') || name.includes('mail')) return '📧';
    if (name.includes('calendar')) return '📅';
    if (name.includes('file') || name.includes('document')) return '📄';
    if (name.includes('image') || name.includes('photo')) return '🖼️';
    if (name.includes('video')) return '🎥';
    if (name.includes('audio') || name.includes('sound')) return '🎵';
    if (name.includes('web') || name.includes('browser')) return '🌐';
    if (name.includes('git')) return '📦';
    if (name.includes('slack')) return '💬';
    if (name.includes('discord')) return '🎮';
    if (name.includes('twitter') || name.includes('x')) return '🐦';
    if (name.includes('linkedin')) return '💼';
    if (name.includes('facebook')) return '👥';
    if (name.includes('instagram')) return '📸';
    if (name.includes('youtube')) return '📺';
    if (name.includes('spotify')) return '🎶';
    if (name.includes('weather')) return '🌤️';
    if (name.includes('map') || name.includes('location')) return '🗺️';
    if (name.includes('payment') || name.includes('stripe')) return '💳';
    if (name.includes('analytics')) return '📊';
    if (name.includes('monitor')) return '📈';
    if (name.includes('security')) return '🔒';
    if (name.includes('auth')) return '🔐';
    return '🛠️';
  };

  const getCategoryColor = (cat?: string) => {
    if (!cat) return '#6B7280';
    const category = cat.toLowerCase();
    if (category.includes('api')) return '#3B82F6';
    if (category.includes('database')) return '#8B5CF6';
    if (category.includes('communication')) return '#10B981';
    if (category.includes('productivity')) return '#F59E0B';
    if (category.includes('analytics')) return '#EF4444';
    if (category.includes('security')) return '#F97316';
    return '#6B7280';
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
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 10px 25px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' 
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        position: 'relative',
        maxWidth: '300px',
        width: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Indicator */}
      {isAdded && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#22C55E'
        }} />
      )}

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '12px', 
        marginBottom: '12px' 
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
          {icon || getDefaultIcon(name)}
        </div>

        {/* Tool Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#FFFFFF',
              margin: 0,
              lineHeight: '1.2'
            }}>
              {name}
            </h4>
            {version && (
              <span style={{
                fontSize: '11px',
                color: '#9CA3AF',
                backgroundColor: '#374151',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: '500'
              }}>
                v{version}
              </span>
            )}
          </div>
          
          {category && (
            <div style={{
              fontSize: '12px',
              color: getCategoryColor(category),
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {category}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{
          fontSize: '14px',
          color: '#E5E7EB',
          lineHeight: '1.4',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {description}
        </p>
      </div>

      {/* Configuration Status */}
      {isAdded && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '16px',
          padding: '8px 12px',
          backgroundColor: isConfigured ? '#064E3B' : '#7C2D12',
          border: `1px solid ${isConfigured ? '#10B981' : '#F59E0B'}`,
          borderRadius: '6px'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isConfigured ? '#10B981' : '#F59E0B'
          }} />
          <span style={{
            fontSize: '12px',
            color: isConfigured ? '#10B981' : '#F59E0B',
            fontWeight: '500'
          }}>
            {isConfigured ? 'Configured' : 'Needs Configuration'}
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Primary Action */}
        {!isAdded ? (
          <button
            onClick={() => onAddToAgent?.(id)}
            style={{
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3B82F6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Add to Agent
          </button>
        ) : (
          <button
            onClick={() => onRemove?.(id)}
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#B91C1C';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#DC2626';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Remove from Agent
          </button>
        )}

        {/* Secondary Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Configure Button */}
          <button
            onClick={() => onConfigure?.(id)}
            disabled={!isAdded}
            style={{
              backgroundColor: isAdded ? '#374151' : '#1F2937',
              color: isAdded ? '#E5E7EB' : '#6B7280',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: isAdded ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              flex: 1,
              opacity: isAdded ? 1 : 0.5
            }}
            onMouseOver={(e) => {
              if (isAdded) {
                e.currentTarget.style.backgroundColor = '#4B5563';
              }
            }}
            onMouseOut={(e) => {
              if (isAdded) {
                e.currentTarget.style.backgroundColor = '#374151';
              }
            }}
          >
            Configure
          </button>

          {/* Documentation Link */}
          {documentationUrl && (
            <a
              href={documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#374151',
                color: '#E5E7EB',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: 1,
                textDecoration: 'none',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#4B5563';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
              }}
            >
              <span>📖</span>
              Docs
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolsCard; 