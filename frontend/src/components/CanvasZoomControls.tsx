import React, { useState } from 'react';

interface CanvasZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
  currentZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
}

const CanvasZoomControls: React.FC<CanvasZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  currentZoom = 100,
  minZoom = 25,
  maxZoom = 400,
  className = ''
}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const buttonStyle = (buttonId: string, disabled: boolean = false) => ({
    backgroundColor: hoveredButton === buttonId ? '#374151' : '#1F2937',
    color: disabled ? '#6B7280' : '#FFFFFF',
    border: '1px solid #374151',
    borderRadius: '6px',
    padding: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    position: 'relative' as const
  });

  const tooltipStyle = (show: boolean) => ({
    position: 'absolute' as const,
    top: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap' as const,
    opacity: show ? 1 : 0,
    visibility: show ? 'visible' as const : 'hidden' as const,
    transition: 'all 0.2s ease',
    zIndex: 1000,
    pointerEvents: 'none' as const
  });

  const canZoomIn = currentZoom < maxZoom;
  const canZoomOut = currentZoom > minZoom;

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 100
      }}
    >
      {/* Zoom Level Display */}
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#9CA3AF',
        marginBottom: '4px',
        fontWeight: '500'
      }}>
        {Math.round(currentZoom)}%
      </div>

      {/* Zoom In Button */}
      <button
        onClick={canZoomIn ? onZoomIn : undefined}
        disabled={!canZoomIn}
        style={buttonStyle('zoomIn', !canZoomIn)}
        onMouseEnter={() => setHoveredButton('zoomIn')}
        onMouseLeave={() => setHoveredButton(null)}
        title="Zoom In"
      >
        <span style={tooltipStyle(hoveredButton === 'zoomIn')}>
          Zoom In
        </span>
        +
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={canZoomOut ? onZoomOut : undefined}
        disabled={!canZoomOut}
        style={buttonStyle('zoomOut', !canZoomOut)}
        onMouseEnter={() => setHoveredButton('zoomOut')}
        onMouseLeave={() => setHoveredButton(null)}
        title="Zoom Out"
      >
        <span style={tooltipStyle(hoveredButton === 'zoomOut')}>
          Zoom Out
        </span>
        −
      </button>

      {/* Reset Zoom Button */}
      <button
        onClick={onResetZoom}
        style={buttonStyle('resetZoom')}
        onMouseEnter={() => setHoveredButton('resetZoom')}
        onMouseLeave={() => setHoveredButton(null)}
        title="Reset Zoom"
      >
        <span style={tooltipStyle(hoveredButton === 'resetZoom')}>
          Reset Zoom (100%)
        </span>
        ⟳
      </button>

      {/* Fit to Screen Button */}
      <button
        onClick={onFitToScreen}
        style={buttonStyle('fitToScreen')}
        onMouseEnter={() => setHoveredButton('fitToScreen')}
        onMouseLeave={() => setHoveredButton(null)}
        title="Fit to Screen"
      >
        <span style={tooltipStyle(hoveredButton === 'fitToScreen')}>
          Fit to Screen
        </span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="currentColor"
          style={{ marginTop: '1px' }}
        >
          <path d="M1 1h4v2H3v2H1V1zm0 14h2v-2h2v2H1v-2zm14 0h-4v-2h2v-2h2v4zM15 1h-2v2h-2V1h4z"/>
          <path d="M5 5h6v6H5z"/>
        </svg>
      </button>


    </div>
  );
};

export default CanvasZoomControls; 