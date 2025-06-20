import React, { useState, useEffect } from 'react';

interface ExecutionLog {
  id: string;
  timestamp: Date;
  status: 'Success' | 'Error' | 'In Progress';
  duration: number;
  agentLogs: AgentLog[];
}

interface AgentLog {
  agentName: string;
  status: 'Success' | 'Error' | 'In Progress';
  message: string;
  timestamp: Date;
  error?: string;
}

interface FlowExecutionLogPanelProps {
  flowId: string;
  autoRefresh?: boolean;
}

const FlowExecutionLogPanel: React.FC<FlowExecutionLogPanelProps> = ({ 
  flowId, 
  autoRefresh = true 
}) => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockLogs: ExecutionLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        status: 'Success',
        duration: 45000,
        agentLogs: [
          {
            agentName: 'Compliance Agent',
            status: 'Success',
            message: 'License verification completed',
            timestamp: new Date(Date.now() - 295000),
          },
          {
            agentName: 'Recruitment Agent',
            status: 'Success',
            message: 'Candidate profile updated',
            timestamp: new Date(Date.now() - 290000),
          }
        ]
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 120000), // 2 minutes ago
        status: 'Error',
        duration: 12000,
        agentLogs: [
          {
            agentName: 'Compliance Agent',
            status: 'Success',
            message: 'License verification completed',
            timestamp: new Date(Date.now() - 118000),
          },
          {
            agentName: 'Data Sync Agent',
            status: 'Error',
            message: 'Failed to sync with CRM',
            timestamp: new Date(Date.now() - 115000),
            error: 'Connection timeout: Unable to connect to Zoho CRM API'
          }
        ]
      },
      {
        id: '3',
        timestamp: new Date(),
        status: 'In Progress',
        duration: 0,
        agentLogs: [
          {
            agentName: 'Compliance Agent',
            status: 'In Progress',
            message: 'Processing license verification...',
            timestamp: new Date(),
          }
        ]
      }
    ];
    setLogs(mockLogs);
  }, [flowId]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In real implementation, this would fetch from API
      console.log('Auto-refreshing execution logs...');
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatDuration = (ms: number) => {
    if (ms === 0) return '--';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'text-green-400';
      case 'Error':
        return 'text-red-400';
      case 'In Progress':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return '✅';
      case 'Error':
        return '❌';
      case 'In Progress':
        return '🔄';
      default:
        return '⚪';
    }
  };

  const openDetailsModal = (log: ExecutionLog) => {
    setSelectedLog(log);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedLog(null);
    setIsDetailsModalOpen(false);
  };

  return (
    <div style={{ backgroundColor: '#1E293B', color: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>
          Flow Execution History
        </h3>
        {autoRefresh && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E5E7EB', fontSize: '14px' }}>
            <span>🔄</span>
            <span>Auto-refresh</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              backgroundColor: '#0F172A',
              padding: '16px',
              borderRadius: '6px',
              border: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '20px' }}>{getStatusIcon(log.status)}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span className={getStatusColor(log.status)} style={{ fontWeight: '600' }}>
                    {log.status}
                  </span>
                  <span style={{ color: '#E5E7EB', fontSize: '14px' }}>
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
                <div style={{ color: '#E5E7EB', fontSize: '14px' }}>
                  Duration: {formatDuration(log.duration)}
                </div>
              </div>
            </div>
            <button
              onClick={() => openDetailsModal(log)}
              style={{
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {isDetailsModalOpen && selectedLog && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={closeDetailsModal}
        >
          <div
            style={{
              backgroundColor: '#1E293B',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #334155',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#FFFFFF' }}>
                Execution Details
              </h4>
              <button
                onClick={closeDetailsModal}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#E5E7EB',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{getStatusIcon(selectedLog.status)}</span>
                <span className={getStatusColor(selectedLog.status)} style={{ fontWeight: '600', fontSize: '16px' }}>
                  {selectedLog.status}
                </span>
              </div>
              <div style={{ color: '#E5E7EB', fontSize: '14px' }}>
                Started: {formatTimestamp(selectedLog.timestamp)}
              </div>
              <div style={{ color: '#E5E7EB', fontSize: '14px' }}>
                Duration: {formatDuration(selectedLog.duration)}
              </div>
            </div>

            <div>
              <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '12px' }}>
                Agent-by-Agent Log
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedLog.agentLogs.map((agentLog, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#0F172A',
                      padding: '12px',
                      borderRadius: '4px',
                      border: '1px solid #334155'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#FFFFFF' }}>
                        {agentLog.agentName}
                      </span>
                      <span className={getStatusColor(agentLog.status)} style={{ fontSize: '14px' }}>
                        {agentLog.status}
                      </span>
                    </div>
                    <div style={{ color: '#E5E7EB', fontSize: '14px', marginBottom: '4px' }}>
                      {agentLog.message}
                    </div>
                    {agentLog.error && (
                      <div style={{ 
                        color: '#EF4444', 
                        fontSize: '14px', 
                        backgroundColor: '#1F2937', 
                        padding: '8px', 
                        borderRadius: '4px',
                        border: '1px solid #DC2626'
                      }}>
                        <strong>Error:</strong> {agentLog.error}
                      </div>
                    )}
                    <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>
                      {formatTimestamp(agentLog.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowExecutionLogPanel; 