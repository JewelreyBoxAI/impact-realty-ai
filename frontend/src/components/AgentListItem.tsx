"use client"

import React, { useState } from 'react'

interface Agent {
  id: string
  name: string
  type: string
  status: 'idle' | 'running' | 'paused' | 'error'
  description: string
  successRate: number
  totalRuns: number
}

interface AgentListItemProps {
  agent: Agent
  isSelected: boolean
  onSelect: (agent: Agent) => void
}

const AgentListItem: React.FC<AgentListItemProps> = ({
  agent,
  isSelected,
  onSelect
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#22C55E'
      case 'idle':
        return '#94A3B8'
      case 'paused':
        return '#F59E0B'
      case 'error':
        return '#EF4444'
      default:
        return '#94A3B8'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'rgba(34, 197, 94, 0.2)'
      case 'error':
        return 'rgba(239, 68, 68, 0.2)'
      case 'paused':
        return 'rgba(245, 158, 11, 0.2)'
      default:
        return '#1E293B'
    }
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'recruitment':
        return '👥'
      case 'compliance':
        return '📋'
      case 'assistant':
        return '🤖'
      case 'analytics':
        return '📊'
      case 'onboarding':
        return '🚀'
      case 'document':
        return '📄'
      default:
        return '🤖'
    }
  }

  const baseStyle = {
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid',
    transform: isHovered ? 'scale(1.02)' : 'scale(1)'
  }

  const getContainerStyle = () => {
    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }
    } else if (isHovered) {
      return {
        ...baseStyle,
        backgroundColor: '#1E293B',
        borderColor: '#475569'
      }
    } else {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderColor: '#334155'
      }
    }
  }

  return (
    <div
      onClick={() => onSelect(agent)}
      style={getContainerStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Agent Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{getAgentIcon(agent.type)}</span>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(agent.status),
            animation: agent.status === 'running' ? 'pulse 2s infinite' : 'none'
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontWeight: '600',
            fontSize: '14px',
            color: '#FFFFFF',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {agent.name}
          </h4>
          <p style={{
            fontSize: '12px',
            color: isSelected ? '#E5E7EB' : '#94A3B8',
            margin: 0,
            textTransform: 'capitalize'
          }}>
            {agent.type}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
        <div>
          <p style={{
            color: isSelected ? '#E5E7EB' : '#64748B',
            margin: 0
          }}>
            Success
          </p>
          <p style={{
            fontWeight: '500',
            color: isSelected ? '#FFFFFF' : '#E5E7EB',
            margin: 0
          }}>
            {agent.successRate}%
          </p>
        </div>
        <div>
          <p style={{
            color: isSelected ? '#E5E7EB' : '#64748B',
            margin: 0
          }}>
            Runs
          </p>
          <p style={{
            fontWeight: '500',
            color: isSelected ? '#FFFFFF' : '#E5E7EB',
            margin: 0
          }}>
            {agent.totalRuns}
          </p>
        </div>
      </div>

      {/* Status Text */}
      <div style={{ marginTop: '8px' }}>
        <span style={{
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '9999px',
          backgroundColor: getStatusBgColor(agent.status),
          color: getStatusColor(agent.status),
          border: `1px solid ${getStatusColor(agent.status)}40`
        }}>
          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
        </span>
      </div>
    </div>
  )
}

export default AgentListItem 