import React, { useState, useRef } from 'react';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
}

interface AgentGroupContainerProps {
  id: string;
  title: string;
  agents: Agent[];
  isCollapsed?: boolean;
  isSelected?: boolean;
  onTitleChange: (newTitle: string) => void;
  onToggleCollapse: () => void;
  onGroupSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

const AgentGroupContainer: React.FC<AgentGroupContainerProps> = ({
  id,
  title,
  agents,
  isCollapsed = false,
  isSelected = false,
  onTitleChange,
  onToggleCollapse,
  onGroupSelect,
  onDragStart,
  onDragEnd,
  onContextMenu,
  children
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [isDragging, setIsDragging] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleTitleEdit = () => {
    setIsEditing(true);
    setEditTitle(title);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleTitleSave = () => {
    setIsEditing(false);
    if (editTitle.trim() !== title) {
      onTitleChange(editTitle.trim());
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(title);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    onDragEnd(e);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22C55E';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div
      style={{
        backgroundColor: isSelected ? '#1E40AF' : '#1E293B',
        border: `2px ${isSelected ? 'solid' : 'dashed'} ${isSelected ? '#3B82F6' : '#374151'}`,
        borderRadius: '12px',
        padding: '16px',
        margin: '8px',
        minWidth: '280px',
        minHeight: isCollapsed ? '60px' : '120px',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.7 : 1,
        transition: 'all 0.2s ease',
        position: 'relative',
        userSelect: 'none'
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onGroupSelect}
      onContextMenu={onContextMenu}
    >
      {/* Group Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isCollapsed ? '0' : '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          {/* Collapse/Expand Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isCollapsed ? '▶' : '▼'}
          </button>

          {/* Group Title */}
          {isEditing ? (
            <input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #3B82F6',
                borderRadius: '4px',
                padding: '4px 8px',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '600',
                outline: 'none',
                flex: 1
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#FFFFFF',
                margin: 0,
                cursor: 'text',
                flex: 1
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleTitleEdit();
              }}
            >
              {title}
            </h3>
          )}

          {/* Agent Count Badge */}
          <div style={{
            backgroundColor: '#374151',
            color: '#E5E7EB',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {agents.length} {agents.length === 1 ? 'agent' : 'agents'}
          </div>
        </div>

        {/* Group Actions */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTitleEdit();
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px',
              borderRadius: '4px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Edit Group Name"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(e);
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px',
              borderRadius: '4px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Group Options"
          >
            ⋯
          </button>
        </div>
      </div>

      {/* Group Content */}
      {!isCollapsed && (
        <div style={{
          backgroundColor: '#0F172A',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid #334155'
        }}>
          {/* Agent List */}
          {agents.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '8px',
              marginBottom: '12px'
            }}>
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(agent.status),
                      flexShrink: 0
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#FFFFFF',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {agent.name}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#9CA3AF',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {agent.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#9CA3AF',
              fontSize: '14px',
              padding: '20px',
              fontStyle: 'italic'
            }}>
              Drop agents here to group them
            </div>
          )}

          {/* Custom Children Content */}
          {children}
        </div>
      )}

      {/* Group Selection Indicator */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          border: '2px solid #3B82F6',
          borderRadius: '12px',
          pointerEvents: 'none',
          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
        }} />
      )}

      {/* Drag Indicator */}
      {isDragging && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          color: '#9CA3AF',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          Moving...
        </div>
      )}
    </div>
  );
};

export default AgentGroupContainer; 