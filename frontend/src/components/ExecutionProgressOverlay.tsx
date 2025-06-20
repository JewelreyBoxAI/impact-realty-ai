"use client"

import React, { useState, useEffect } from 'react'

interface Agent {
  id: string
  name: string
  type: string
  status: 'waiting' | 'running' | 'completed' | 'failed'
  position: { x: number; y: number }
}

interface ExecutionProgressOverlayProps {
  agents: Agent[]
  isExecuting: boolean
  onPause?: () => void
  onStop?: () => void
  onDismiss?: () => void
  activeAgentId?: string
}

const ExecutionProgressOverlay: React.FC<ExecutionProgressOverlayProps> = ({
  agents,
  isExecuting,
  onPause,
  onStop,
  onDismiss,
  activeAgentId
}) => {
  const [scrollTarget, setScrollTarget] = useState<string | null>(null)

  // Auto-scroll to active agent
  useEffect(() => {
    if (activeAgentId && activeAgentId !== scrollTarget) {
      setScrollTarget(activeAgentId)
      const element = document.getElementById(`agent-${activeAgentId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [activeAgentId, scrollTarget])

  // Auto-dismiss when execution stops
  useEffect(() => {
    if (!isExecuting && onDismiss) {
      const timer = setTimeout(onDismiss, 2000)
      return () => clearTimeout(timer)
    }
  }, [isExecuting, onDismiss])

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'running': return '#3B82F6'
      case 'completed': return '#22C55E'
      case 'failed': return '#EF4444'
      case 'waiting': return '#94A3B8'
      default: return '#94A3B8'
    }
  }

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'running':
        return (
          <div style={{ 
            width: '12px', 
            height: '12px', 
            border: '2px solid transparent',
            borderTop: '2px solid #3B82F6',
            borderRadius: '50%'
          }} className="animate-spin" />
        )
      case 'completed':
        return (
          <svg style={{ width: '12px', height: '12px' }} fill="#22C55E" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'failed':
        return (
          <svg style={{ width: '12px', height: '12px' }} fill="#EF4444" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#94A3B8',
            borderRadius: '50%'
          }} />
        )
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      {/* Header Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        backgroundColor: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <div>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#FFFFFF', 
            margin: 0 
          }}>
            Flow Execution Progress
          </h2>
          <p style={{ 
            fontSize: '14px', 
            color: '#94A3B8', 
            margin: '4px 0 0 0' 
          }}>
            {isExecuting ? 'Running...' : 'Execution Complete'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isExecuting && (
            <>
              <button
                onClick={onPause}
                style={{
                  backgroundColor: '#F59E0B',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Pause
              </button>
              <button
                onClick={onStop}
                style={{
                  backgroundColor: '#EF4444',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Stop
              </button>
            </>
          )}
          <button
            onClick={onDismiss}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '8px 16px',
              color: '#E5E7EB',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Agent Cards */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        alignContent: 'start'
      }}>
        {agents.map((agent) => (
          <div
            key={agent.id}
            id={`agent-${agent.id}`}
            style={{
              backgroundColor: '#1E293B',
              border: `2px solid ${getStatusColor(agent.status)}`,
              borderRadius: '8px',
              padding: '16px',
              position: 'relative',
              boxShadow: agent.status === 'running' ? `0 0 20px ${getStatusColor(agent.status)}40` : 'none',
              animation: agent.status === 'running' ? 'pulse 2s infinite' : 'none'
            }}
            className={agent.status === 'running' ? 'animate-pulse' : ''}
          >
            {/* Status Badge */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: getStatusColor(agent.status),
              borderRadius: '12px',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#FFFFFF'
            }}>
              {getStatusIcon(agent.status)}
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </div>

            {/* Agent Info */}
            <div style={{ marginRight: '80px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#FFFFFF',
                margin: '0 0 4px 0'
              }}>
                {agent.name}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#94A3B8',
                margin: 0
              }}>
                {agent.type}
              </p>
            </div>

            {/* Progress Indicator */}
            {agent.status === 'running' && (
              <div style={{
                marginTop: '12px',
                height: '4px',
                backgroundColor: '#334155',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#3B82F6',
                  borderRadius: '2px',
                  animation: 'progress 2s ease-in-out infinite'
                }} className="animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExecutionProgressOverlay 