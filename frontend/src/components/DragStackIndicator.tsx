"use client"

import React from 'react'

interface StackLevel {
  level: number
  label?: string
  isActive?: boolean
  isTarget?: boolean
}

interface DragStackIndicatorProps {
  stackLevels: StackLevel[]
  position?: 'left' | 'right'
  isDragging?: boolean
  targetLevel?: number
  onLevelClick?: (level: number) => void
}

const DragStackIndicator: React.FC<DragStackIndicatorProps> = ({
  stackLevels,
  position = 'left',
  isDragging = false,
  targetLevel,
  onLevelClick
}) => {
  const getStackLabels = (level: number): string => {
    switch (level) {
      case 1: return 'Executive Agents'
      case 2: return 'Manager Agents'
      case 3: return 'Worker Agents'
      case 4: return 'Sub-Agents'
      default: return `Level ${level}`
    }
  }

  const isLevelTarget = (level: number): boolean => {
    return isDragging && targetLevel === level
  }

  const isLevelActive = (level: number): boolean => {
    return stackLevels.some(stack => stack.level === level && stack.isActive)
  }

  return (
    <div
      style={{
        position: 'fixed',
        [position]: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 100,
        opacity: isDragging ? 1 : 0.3,
        transition: 'opacity 0.3s ease-in-out',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '12px 8px',
        backdropFilter: 'blur(8px)',
        minWidth: '120px'
      }}
    >
      {/* Header */}
      <div style={{
        marginBottom: '8px',
        paddingBottom: '8px',
        borderBottom: '1px solid #334155'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#E5E7EB',
          textAlign: 'center'
        }}>
          Stack Levels
        </div>
      </div>

      {/* Stack Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {stackLevels.map((stack) => {
          const isTarget = isLevelTarget(stack.level)
          const isActive = isLevelActive(stack.level)
          
          return (
            <div
              key={stack.level}
              onClick={() => onLevelClick?.(stack.level)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: isTarget 
                  ? '#3B82F6' 
                  : isActive 
                    ? '#1E293B' 
                    : 'transparent',
                border: isTarget 
                  ? '2px solid #60A5FA' 
                  : isActive 
                    ? '1px solid #3B82F6' 
                    : '1px solid transparent',
                cursor: onLevelClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                boxShadow: isTarget ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isTarget && !isActive) {
                  e.currentTarget.style.backgroundColor = '#334155'
                }
              }}
              onMouseLeave={(e) => {
                if (!isTarget && !isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {/* Level Number */}
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: isTarget 
                  ? '#FFFFFF' 
                  : isActive 
                    ? '#3B82F6' 
                    : '#64748B',
                color: isTarget 
                  ? '#3B82F6' 
                  : '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {stack.level}
              </div>

              {/* Level Label */}
              <div style={{
                fontSize: '11px',
                fontWeight: '500',
                color: isTarget 
                  ? '#FFFFFF' 
                  : isActive 
                    ? '#E5E7EB' 
                    : '#94A3B8',
                lineHeight: '1.2',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {stack.label || getStackLabels(stack.level)}
              </div>

              {/* Active Indicator */}
              {isActive && !isTarget && (
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#22C55E',
                  flexShrink: 0,
                  marginLeft: 'auto'
                }} />
              )}

              {/* Target Indicator */}
              {isTarget && (
                <div style={{
                  marginLeft: 'auto',
                  fontSize: '10px',
                  color: '#FFFFFF'
                }}>
                  <svg style={{ width: '12px', height: '12px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add New Level Button */}
      {isDragging && (
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #334155'
        }}>
          <button
            onClick={() => onLevelClick?.(stackLevels.length + 1)}
            style={{
              width: '100%',
              padding: '6px 8px',
              backgroundColor: 'transparent',
              border: '1px dashed #64748B',
              borderRadius: '4px',
              color: '#94A3B8',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3B82F6'
              e.currentTarget.style.color = '#3B82F6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#64748B'
              e.currentTarget.style.color = '#94A3B8'
            }}
          >
            + Add Level
          </button>
        </div>
      )}

      {/* Zoom Indicator */}
      <div style={{
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid #334155',
        fontSize: '10px',
        color: '#64748B',
        textAlign: 'center'
      }}>
        Stack Guide
      </div>
    </div>
  )
}

export default DragStackIndicator 