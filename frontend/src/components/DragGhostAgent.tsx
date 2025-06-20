"use client"

import React from 'react'

interface Agent {
  id: string
  name: string
  type: string
  icon?: string
}

interface DragGhostAgentProps {
  agent: Agent
  position: { x: number; y: number }
  isValidDropZone?: boolean
  isDragging?: boolean
}

const DragGhostAgent: React.FC<DragGhostAgentProps> = ({
  agent,
  position,
  isValidDropZone = true,
  isDragging = false
}) => {
  const getAgentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'supervisor':
      case 'executive':
        return (
          <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        )
      case 'worker':
      case 'executor':
        return (
          <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        )
      case 'analyzer':
      case 'data':
        return (
          <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        )
      case 'communication':
      case 'chat':
        return (
          <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'supervisor':
      case 'executive':
        return '#F59E0B'
      case 'worker':
      case 'executor':
        return '#3B82F6'
      case 'analyzer':
      case 'data':
        return '#8B5CF6'
      case 'communication':
      case 'chat':
        return '#22C55E'
      default:
        return '#64748B'
    }
  }

  if (!isDragging) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x - 75,
        top: position.y - 40,
        zIndex: 9999,
        pointerEvents: 'none',
        transform: isValidDropZone ? 'scale(1.05)' : 'scale(0.95)',
        transition: 'transform 0.2s ease-in-out',
        opacity: isValidDropZone ? 0.9 : 0.6
      }}
    >
      <div
        style={{
          backgroundColor: isValidDropZone ? '#1E293B' : '#374151',
          border: `2px solid ${isValidDropZone ? getTypeColor(agent.type) : '#6B7280'}`,
          borderRadius: '8px',
          padding: '12px 16px',
          minWidth: '150px',
          boxShadow: isValidDropZone 
            ? `0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px ${getTypeColor(agent.type)}40`
            : '0 4px 15px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: getTypeColor(agent.type),
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {agent.icon ? (
            <span style={{ fontSize: '16px' }}>{agent.icon}</span>
          ) : (
            getAgentIcon(agent.type)
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#FFFFFF',
              marginBottom: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {agent.name}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#94A3B8',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {agent.type}
          </div>
        </div>

        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isValidDropZone ? '#22C55E' : '#EF4444',
            flexShrink: 0
          }}
        />
      </div>
    </div>
  )
}

export default DragGhostAgent 