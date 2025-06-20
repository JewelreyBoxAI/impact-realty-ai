import React, { useState } from 'react';

interface AgentData {
  id: string;
  name: string;
  role: string;
  model: string;
  executionMode: 'Autonomous' | 'Human-in-Loop';
  toolsCount: number;
  connections: {
    incoming: number;
    outgoing: number;
  };
  status: 'Active' | 'Draft' | 'Error';
}

interface AgentCompactCardProps {
  agentData: AgentData;
  onEdit: (agentId: string) => void;
  onDrag: (agentId: string, event: React.DragEvent) => void;
  onRemove: (agentId: string) => void;
  onDuplicate?: (agentId: string) => void;
  isSelected?: boolean;
  isDragging?: boolean;
  position?: { x: number; y: number };
}

const AgentCompactCard: React.FC<AgentCompactCardProps> = ({
  agentData,
  onEdit,
  onDrag,
  onRemove,
  onDuplicate,
  isSelected = false,
  isDragging = false,
  position = { x: 0, y: 0 }
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#22C55E';
      case 'Error': return '#EF4444';
      case 'Draft': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return '✅';
      case 'Error': return '❌';
      case 'Draft': return '📝';
      default: return '⚪';
    }
  };

  const getModelIcon = (model: string) => {
    if (model.toLowerCase().includes('gpt')) return '🤖';
    if (model.toLowerCase().includes('claude')) return '🧠';
    if (model.toLowerCase().includes('gemini')) return '💎';
    return '🔮';
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', agentData.id);
    onDrag(agentData.id, e);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleContextMenuAction = (action: string) => {
    setShowContextMenu(false);
    switch (action) {
      case 'edit':
        onEdit(agentData.id);
        break;
      case 'duplicate':
        onDuplicate?.(agentData.id);
        break;
      case 'remove':
        onRemove(agentData.id);
        break;
    }
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '220px',
          backgroundColor: '#1E293B',
          border: `2px solid ${isSelected ? '#3B82F6' : '#334155'}`,
          borderRadius: '8px',
          boxShadow: isDragging 
            ? '0 10px 25px -3px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: isDragging ? 0.8 : 1,
          transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'none',
          transition: isDragging ? 'none' : 'all 0.2s ease',
          zIndex: isDragging ? 1000 : isSelected ? 100 : 10
        }}
        draggable
        onDragStart={handleDragStart}
        onClick={() => onEdit(agentData.id)}
        onContextMenu={handleRightClick}
      >
        {/* Drag Handle */}
        <div style={{
          backgroundColor: '#374151',
          height: '8px',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab'
        }}>
          <div style={{
            width: '20px',
            height: '2px',
            backgroundColor: '#9CA3AF',
            borderRadius: '1px'
          }} />
        </div>

        {/* Card Header */}
        <div style={{ padding: '12px 12px 8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#FFFFFF',
              margin: 0,
              lineHeight: '1.2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '140px'
            }}>
              {agentData.name}
            </h4>
            <div style={{
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: '500',
              flexShrink: 0
            }}>
              {agentData.role}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '0 12px 8px 12px' }}>
          {/* Model Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px' }}>{getModelIcon(agentData.model)}</span>
            <span style={{ fontSize: '12px', color: '#E5E7EB', fontWeight: '500' }}>
              {agentData.model}
            </span>
          </div>

          {/* Execution Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px' }}>
              {agentData.executionMode === 'Autonomous' ? '🤖' : '👤'}
            </span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
              {agentData.executionMode}
            </span>
          </div>

          {/* Tools Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px' }}>🔧</span>
            <span style={{
              backgroundColor: '#374151',
              color: '#E5E7EB',
              padding: '2px 6px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '500'
            }}>
              {agentData.toolsCount} tools
            </span>
          </div>

          {/* Connection Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: agentData.connections.incoming > 0 ? '#22C55E' : '#374151'
              }} />
              <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
                {agentData.connections.incoming} in
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: agentData.connections.outgoing > 0 ? '#3B82F6' : '#374151'
              }} />
              <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
                {agentData.connections.outgoing} out
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div style={{
          padding: '8px 12px',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px' }}>{getStatusIcon(agentData.status)}</span>
            <span style={{
              fontSize: '11px',
              color: getStatusColor(agentData.status),
              fontWeight: '500'
            }}>
              {agentData.status}
            </span>
          </div>
          <div style={{
            fontSize: '10px',
            color: '#6B7280',
            fontFamily: 'monospace'
          }}>
            #{agentData.id.slice(-4)}
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            right: '-3px',
            bottom: '-3px',
            border: '2px solid #3B82F6',
            borderRadius: '10px',
            pointerEvents: 'none',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
          }} />
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          style={{
            position: 'fixed',
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '6px',
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.3)',
            zIndex: 2000,
            minWidth: '120px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleContextMenuAction('edit')}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#E5E7EB',
              padding: '8px 12px',
              fontSize: '14px',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✏️ Edit
          </button>
          {onDuplicate && (
            <button
              onClick={() => handleContextMenuAction('duplicate')}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#E5E7EB',
                padding: '8px 12px',
                fontSize: '14px',
                textAlign: 'left',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              📋 Duplicate
            </button>
          )}
          <button
            onClick={() => handleContextMenuAction('remove')}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#EF4444',
              padding: '8px 12px',
              fontSize: '14px',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: '0 0 6px 6px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            🗑️ Remove
          </button>
        </div>
      )}
    </>
  );
};

export default AgentCompactCard; 