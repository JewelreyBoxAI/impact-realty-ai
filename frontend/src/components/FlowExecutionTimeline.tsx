import React, { useState, useEffect, useRef } from 'react';

interface ExecutionEvent {
  id: string;
  agent: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'in-progress';
  label: string;
  meta?: string;
  details?: string;
  duration?: number;
  eventType?: string;
}

interface FlowExecutionTimelineProps {
  events: ExecutionEvent[];
  groupBy?: 'agent' | 'type';
  autoScroll?: boolean;
  maxHeight?: string;
  onEventClick?: (event: ExecutionEvent) => void;
  className?: string;
}

interface TimelineEventProps {
  event: ExecutionEvent;
  isLast?: boolean;
  onClick?: (event: ExecutionEvent) => void;
}

interface TimelineGroupProps {
  label: string;
  events: ExecutionEvent[];
  isExpanded: boolean;
  onToggle: () => void;
  onEventClick?: (event: ExecutionEvent) => void;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({ event, isLast = false, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#22C55E';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'in-progress': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✗';
      case 'in-progress': return '⟳';
      default: return '•';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        paddingBottom: isLast ? '0' : '16px',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={() => onClick?.(event)}
    >
      {/* Timeline Line */}
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: '11px',
            top: '24px',
            bottom: '0',
            width: '2px',
            backgroundColor: '#334155'
          }}
        />
      )}

      {/* Status Indicator */}
      <div
        style={{
          position: 'relative',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(event.status),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          flexShrink: 0,
          animation: event.status === 'in-progress' ? 'pulse 2s infinite' : 'none'
        }}
      >
        {getStatusIcon(event.status)}
      </div>

      {/* Event Content */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '12px',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          if (onClick) {
            e.currentTarget.style.backgroundColor = '#2D3748';
            e.currentTarget.style.borderColor = '#4A5568';
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#1E293B';
          e.currentTarget.style.borderColor = '#334155';
        }}
      >
        {/* Event Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', marginBottom: '2px' }}>
              {event.label}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'monospace' }}>
              {formatTimestamp(event.timestamp)}
            </div>
          </div>
          {event.meta && (
            <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'monospace' }}>
              {event.meta}
            </div>
          )}
        </div>

        {/* Event Details */}
        {event.details && (
          <div style={{ fontSize: '12px', color: '#E5E7EB', marginTop: '8px', lineHeight: '1.4' }}>
            {event.details}
          </div>
        )}

        {/* Duration */}
        {event.duration && (
          <div style={{ 
            fontSize: '11px', 
            color: '#9CA3AF', 
            marginTop: '6px',
            fontFamily: 'monospace'
          }}>
            Duration: {formatDuration(event.duration)}
          </div>
        )}
      </div>

    </div>
  );
};

const TimelineGroup: React.FC<TimelineGroupProps> = ({ 
  label, 
  events, 
  isExpanded, 
  onToggle, 
  onEventClick 
}) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Group Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#374151',
          border: '1px solid #4B5563',
          borderRadius: '6px',
          marginBottom: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={onToggle}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#4B5563';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#374151';
        }}
      >
        <div style={{ 
          fontSize: '12px', 
          color: '#9CA3AF',
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▶
        </div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', flex: 1 }}>
          {label}
        </div>
        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
          {events.length} event{events.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Group Events */}
      {isExpanded && (
        <div style={{ paddingLeft: '12px' }}>
          {events.map((event, index) => (
            <TimelineEvent
              key={event.id}
              event={event}
              isLast={index === events.length - 1}
              onClick={onEventClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FlowExecutionTimeline: React.FC<FlowExecutionTimelineProps> = ({
  events,
  groupBy = 'agent',
  autoScroll = false,
  maxHeight = '400px',
  onEventClick,
  className = ''
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Group events
  const groupedEvents = React.useMemo(() => {
    const groups: { [key: string]: ExecutionEvent[] } = {};
    
    events.forEach(event => {
      const key = groupBy === 'agent' ? event.agent : (event.eventType || 'Other');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
    });

    // Sort events within each group by timestamp
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

    return groups;
  }, [events, groupBy]);

  // Auto-expand groups with recent events
  useEffect(() => {
    const recentGroups = new Set<string>();
    const now = new Date().getTime();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    Object.entries(groupedEvents).forEach(([groupName, groupEvents]) => {
      const hasRecentEvents = groupEvents.some(event => 
        new Date(event.timestamp).getTime() > fiveMinutesAgo
      );
      if (hasRecentEvents) {
        recentGroups.add(groupName);
      }
    });

    setExpandedGroups(recentGroups);
  }, [groupedEvents]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  if (events.length === 0) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '8px',
          maxHeight,
          color: '#9CA3AF',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>⏱️</div>
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>No execution events</div>
        <div style={{ fontSize: '14px' }}>Events will appear here as agents execute</div>
      </div>
    );
  }

  return (
    <div
      ref={timelineRef}
      className={className}
      style={{
        maxHeight,
        overflowY: 'auto',
        backgroundColor: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '16px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#4B5563 #1E293B'
      }}
    >
      {/* Timeline Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid #334155'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>
          Execution Timeline
        </div>
        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
          Grouped by {groupBy} • {events.length} total events
        </div>
      </div>

      {/* Timeline Groups */}
      {Object.entries(groupedEvents).map(([groupName, groupEvents]) => (
        <TimelineGroup
          key={groupName}
          label={groupName}
          events={groupEvents}
          isExpanded={expandedGroups.has(groupName)}
          onToggle={() => toggleGroup(groupName)}
          onEventClick={onEventClick}
        />
      ))}

      {/* Auto-scroll indicator */}
      {autoScroll && (
        <div style={{
          position: 'sticky',
          bottom: '8px',
          right: '8px',
          marginLeft: 'auto',
          width: 'fit-content',
          fontSize: '10px',
          color: '#6B7280',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #334155'
        }}>
          Auto-scroll enabled
        </div>
      )}
    </div>
  );
};

export default FlowExecutionTimeline; 