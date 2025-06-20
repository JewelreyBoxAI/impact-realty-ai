import React, { useState } from 'react';

interface FlowControlsProps {
  mode: 'Sequential' | 'Hierarchical' | 'Custom';
  onModeChange: (mode: 'Sequential' | 'Hierarchical' | 'Custom') => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  snapToGrid: boolean;
  onSnapToGridToggle: () => void;
  snapToStack: boolean;
  onSnapToStackToggle: () => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  className?: string;
}

const FlowControls: React.FC<FlowControlsProps> = ({
  mode,
  onModeChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  snapToGrid,
  onSnapToGridToggle,
  snapToStack,
  onSnapToStackToggle,
  isDarkMode = true,
  onThemeToggle,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const modes = ['Sequential', 'Hierarchical', 'Custom'] as const;

  const getModeIcon = (selectedMode: string) => {
    switch (selectedMode) {
      case 'Sequential': return '→';
      case 'Hierarchical': return '⟡';
      case 'Custom': return '⊞';
      default: return '⊞';
    }
  };

  const getModeDescription = (selectedMode: string) => {
    switch (selectedMode) {
      case 'Sequential': return 'Linear flow execution';
      case 'Hierarchical': return 'Tree-based structure';
      case 'Custom': return 'Free-form layout';
      default: return '';
    }
  };

  if (isCollapsed) {
    return (
      <div
        className={className}
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '8px 12px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '4px'
          }}
          title="Expand Controls"
        >
          ⚙️
        </button>
        <span style={{ color: '#E5E7EB', fontSize: '12px', fontWeight: '500' }}>
          {mode} • {Math.round(zoom)}%
        </span>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '16px 20px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.3)',
        minWidth: 'fit-content'
      }}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(true)}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: '#9CA3AF',
          cursor: 'pointer',
          fontSize: '12px',
          padding: '4px'
        }}
        title="Collapse Controls"
      >
        ▲
      </button>

      {/* Mode Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Mode
        </label>
        <div style={{
          display: 'flex',
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '2px'
        }}>
          {modes.map((modeOption) => (
            <button
              key={modeOption}
              onClick={() => onModeChange(modeOption)}
              style={{
                backgroundColor: mode === modeOption ? '#3B82F6' : 'transparent',
                color: mode === modeOption ? '#FFFFFF' : '#9CA3AF',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
              title={getModeDescription(modeOption)}
              onMouseOver={(e) => {
                if (mode !== modeOption) {
                  e.currentTarget.style.backgroundColor = '#374151';
                  e.currentTarget.style.color = '#E5E7EB';
                }
              }}
              onMouseOut={(e) => {
                if (mode !== modeOption) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9CA3AF';
                }
              }}
            >
              <span style={{ fontSize: '14px' }}>{getModeIcon(modeOption)}</span>
              {modeOption}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Zoom
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onZoomOut}
            disabled={zoom <= 25}
            style={{
              backgroundColor: '#374151',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: zoom <= 25 ? 'not-allowed' : 'pointer',
              opacity: zoom <= 25 ? 0.5 : 1
            }}
            title="Zoom Out"
          >
            −
          </button>
          <span style={{
            backgroundColor: '#0F172A',
            color: '#E5E7EB',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            minWidth: '50px',
            textAlign: 'center'
          }}>
            {Math.round(zoom)}%
          </span>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 400}
            style={{
              backgroundColor: '#374151',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: zoom >= 400 ? 'not-allowed' : 'pointer',
              opacity: zoom >= 400 ? 0.5 : 1
            }}
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={onResetZoom}
            style={{
              backgroundColor: '#6B7280',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 8px',
              fontSize: '10px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            title="Reset Zoom (100%)"
          >
            ⟳
          </button>
        </div>
      </div>

      {/* Snap Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Snap
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onSnapToGridToggle}
            style={{
              backgroundColor: snapToGrid ? '#22C55E' : '#374151',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
            title="Snap to Grid"
          >
            <span style={{ fontSize: '12px' }}>⊞</span>
            Grid
          </button>
          <button
            onClick={onSnapToStackToggle}
            style={{
              backgroundColor: snapToStack ? '#22C55E' : '#374151',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
            title="Snap to Stack"
          >
            <span style={{ fontSize: '12px' }}>⧉</span>
            Stack
          </button>
        </div>
      </div>

      {/* Theme Toggle (if provided) */}
      {onThemeToggle && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Theme
          </label>
          <button
            onClick={onThemeToggle}
            style={{
              backgroundColor: '#374151',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
          >
            <span style={{ fontSize: '12px' }}>
              {isDarkMode ? '☀️' : '🌙'}
            </span>
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      )}

      {/* Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#22C55E'
        }} />
        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
          Ready
        </span>
      </div>

    </div>
  );
};

export default FlowControls; 