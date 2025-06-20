import React, { useMemo } from 'react';

interface Point {
  x: number;
  y: number;
}

interface RibbonConnectorProps {
  fromAgentId: string;
  toAgentId: string;
  fromPoint: Point;
  toPoint: Point;
  direction: 'one-way' | 'two-way';
  type: 'trigger' | 'data' | 'loopback' | 'custom';
  label?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  customColor?: string;
  width?: number;
}

const RibbonConnector: React.FC<RibbonConnectorProps> = ({
  fromAgentId,
  toAgentId,
  fromPoint,
  toPoint,
  direction = 'one-way',
  type = 'data',
  label,
  isSelected = false,
  onSelect,
  customColor,
  width = 8
}) => {
  const getTypeColor = (connectorType: string) => {
    switch (connectorType) {
      case 'trigger': return '#3B82F6'; // Bright blue
      case 'data': return '#10B981'; // Greenish-blue
      case 'loopback': return '#F59E0B'; // Yellow-orange
      case 'custom': return customColor || '#6B7280';
      default: return '#6B7280';
    }
  };

  const getTypeGradient = (connectorType: string) => {
    const baseColor = getTypeColor(connectorType);
    switch (connectorType) {
      case 'trigger': return { start: '#3B82F6', end: '#1D4ED8' };
      case 'data': return { start: '#10B981', end: '#059669' };
      case 'loopback': return { start: '#F59E0B', end: '#D97706' };
      default: return { start: baseColor, end: baseColor };
    }
  };

  const { pathData, midPoint, angle, distance } = useMemo(() => {
    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    // Calculate control points for curved path
    const curvature = Math.min(dist * 0.3, 100); // Limit curvature
    const controlOffset = curvature;
    
    // Control points for smooth curve
    const cp1x = fromPoint.x + Math.cos(angleRad) * controlOffset;
    const cp1y = fromPoint.y + Math.sin(angleRad) * controlOffset;
    const cp2x = toPoint.x - Math.cos(angleRad) * controlOffset;
    const cp2y = toPoint.y - Math.sin(angleRad) * controlOffset;

    // Create curved path
    const path = `M ${fromPoint.x} ${fromPoint.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPoint.x} ${toPoint.y}`;

    // Calculate midpoint for label
    const t = 0.5; // Midpoint parameter
    const midX = Math.pow(1-t, 3) * fromPoint.x + 
                 3 * Math.pow(1-t, 2) * t * cp1x + 
                 3 * (1-t) * Math.pow(t, 2) * cp2x + 
                 Math.pow(t, 3) * toPoint.x;
    const midY = Math.pow(1-t, 3) * fromPoint.y + 
                 3 * Math.pow(1-t, 2) * t * cp1y + 
                 3 * (1-t) * Math.pow(t, 2) * cp2y + 
                 Math.pow(t, 3) * toPoint.y;

    return {
      pathData: path,
      midPoint: { x: midX, y: midY },
      angle: angleDeg,
      distance: dist
    };
  }, [fromPoint, toPoint]);

  const gradient = getTypeGradient(type);
  const gradientId = `gradient-${fromAgentId}-${toAgentId}`;
  const glowId = `glow-${fromAgentId}-${toAgentId}`;

  // Calculate arrowhead points
  const arrowSize = 12;
  const createArrowhead = (point: Point, angle: number, flip: boolean = false) => {
    const arrowAngle = flip ? angle + 180 : angle;
    const rad = (arrowAngle * Math.PI) / 180;
    
    const x1 = point.x - arrowSize * Math.cos(rad - 0.3);
    const y1 = point.y - arrowSize * Math.sin(rad - 0.3);
    const x2 = point.x - arrowSize * Math.cos(rad + 0.3);
    const y2 = point.y - arrowSize * Math.sin(rad + 0.3);
    
    return `${point.x},${point.y} ${x1},${y1} ${x2},${y2}`;
  };

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: isSelected ? 50 : 10
      }}
    >
      <defs>
        {/* Gradient definition */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradient.start} stopOpacity={0.8} />
          <stop offset="100%" stopColor={gradient.end} stopOpacity={0.8} />
        </linearGradient>
        
        {/* Glow effect for selected state */}
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Selection highlight */}
      {isSelected && (
        <path
          d={pathData}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={width + 4}
          strokeOpacity={0.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Main ribbon path */}
      <path
        d={pathData}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={isSelected ? `url(#${glowId})` : undefined}
        style={{
          pointerEvents: 'stroke',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={onSelect}
      />

      {/* Arrowheads */}
      {direction === 'one-way' && (
        <polygon
          points={createArrowhead(toPoint, angle)}
          fill={gradient.end}
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      {direction === 'two-way' && (
        <>
          <polygon
            points={createArrowhead(toPoint, angle)}
            fill={gradient.end}
            style={{ pointerEvents: 'none' }}
          />
          <polygon
            points={createArrowhead(fromPoint, angle, true)}
            fill={gradient.start}
            style={{ pointerEvents: 'none' }}
          />
        </>
      )}

      {/* Label */}
      {label && distance > 80 && (
        <g>
          {/* Label background */}
          <rect
            x={midPoint.x - (label.length * 3.5)}
            y={midPoint.y - 10}
            width={label.length * 7}
            height={20}
            fill="#1E293B"
            stroke="#334155"
            strokeWidth={1}
            rx={4}
            style={{ pointerEvents: 'none' }}
          />
          {/* Label text */}
          <text
            x={midPoint.x}
            y={midPoint.y + 4}
            textAnchor="middle"
            fill="#E5E7EB"
            fontSize="12"
            fontWeight="500"
            style={{ 
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {label}
          </text>
        </g>
      )}

      {/* Connection type indicator */}
      <circle
        cx={midPoint.x}
        cy={midPoint.y}
        r={4}
        fill={getTypeColor(type)}
        stroke="#1E293B"
        strokeWidth={2}
        style={{ pointerEvents: 'none' }}
      />

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <g style={{ pointerEvents: 'none' }}>
          <circle cx={fromPoint.x} cy={fromPoint.y} r={2} fill="red" opacity={0.5} />
          <circle cx={toPoint.x} cy={toPoint.y} r={2} fill="blue" opacity={0.5} />
          <text x={fromPoint.x + 5} y={fromPoint.y - 5} fill="white" fontSize="10">
            {fromAgentId}
          </text>
          <text x={toPoint.x + 5} y={toPoint.y - 5} fill="white" fontSize="10">
            {toAgentId}
          </text>
        </g>
      )}
    </svg>
  );
};

export default RibbonConnector; 