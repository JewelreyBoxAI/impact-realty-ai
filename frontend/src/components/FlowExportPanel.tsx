import React, { useState } from 'react';

interface FlowMetadata {
  agentCount: number;
  connectionCount: number;
  lastSaved: Date;
  flowName: string;
}

interface FlowExportPanelProps {
  flowMetadata: FlowMetadata;
  onExportJSON: () => void;
  onExportLangGraph: () => void;
  onCopyToClipboard: (content: string) => void;
  isVisible?: boolean;
  onClose?: () => void;
}

const FlowExportPanel: React.FC<FlowExportPanelProps> = ({
  flowMetadata,
  onExportJSON,
  onExportLangGraph,
  onCopyToClipboard,
  isVisible = true,
  onClose
}) => {
  const [exportStatus, setExportStatus] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportJSON = async () => {
    setIsExporting(true);
    setExportStatus('Generating JSON config...');
    
    try {
      await onExportJSON();
      setExportStatus('✅ JSON exported successfully!');
    } catch (error) {
      setExportStatus('❌ Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportLangGraph = async () => {
    setIsExporting(true);
    setExportStatus('Generating LangGraph code...');
    
    try {
      await onExportLangGraph();
      setExportStatus('✅ LangGraph code exported successfully!');
    } catch (error) {
      setExportStatus('❌ Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyJSON = () => {
    const mockJSONConfig = {
      flow_name: flowMetadata.flowName,
      agents: flowMetadata.agentCount,
      connections: flowMetadata.connectionCount,
      created_at: flowMetadata.lastSaved.toISOString(),
      nodes: [
        {
          id: "compliance_agent",
          type: "agent",
          config: {
            model: "gpt-4",
            system_prompt: "You are a compliance verification agent..."
          }
        },
        {
          id: "recruitment_agent", 
          type: "agent",
          config: {
            model: "gpt-4",
            system_prompt: "You are a recruitment processing agent..."
          }
        }
      ],
      edges: [
        {
          source: "compliance_agent",
          target: "recruitment_agent",
          type: "data_flow"
        }
      ]
    };
    
    onCopyToClipboard(JSON.stringify(mockJSONConfig, null, 2));
    setExportStatus('📋 JSON copied to clipboard!');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      backgroundColor: '#1E293B',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '24px',
      color: '#FFFFFF',
      maxWidth: '500px',
      width: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>
          📤 Export Flow
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Flow Metadata */}
      <div style={{
        backgroundColor: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '6px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#E5E7EB', marginBottom: '12px' }}>
          Flow Metadata
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
          <div>
            <span style={{ color: '#9CA3AF' }}>Flow Name:</span>
            <div style={{ color: '#FFFFFF', fontWeight: '500' }}>{flowMetadata.flowName}</div>
          </div>
          <div>
            <span style={{ color: '#9CA3AF' }}>Agents:</span>
            <div style={{ color: '#FFFFFF', fontWeight: '500' }}>{flowMetadata.agentCount}</div>
          </div>
          <div>
            <span style={{ color: '#9CA3AF' }}>Connections:</span>
            <div style={{ color: '#FFFFFF', fontWeight: '500' }}>{flowMetadata.connectionCount}</div>
          </div>
          <div>
            <span style={{ color: '#9CA3AF' }}>Last Saved:</span>
            <div style={{ color: '#FFFFFF', fontWeight: '500' }}>{formatDate(flowMetadata.lastSaved)}</div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={handleExportJSON}
          disabled={isExporting}
          style={{
            backgroundColor: '#3B82F6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => !isExporting && (e.currentTarget.style.backgroundColor = '#2563EB')}
          onMouseOut={(e) => !isExporting && (e.currentTarget.style.backgroundColor = '#3B82F6')}
        >
          {isExporting ? '🔄' : '📄'} Export as JSON
        </button>

        <button
          onClick={handleExportLangGraph}
          disabled={isExporting}
          style={{
            backgroundColor: '#22C55E',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => !isExporting && (e.currentTarget.style.backgroundColor = '#16A34A')}
          onMouseOut={(e) => !isExporting && (e.currentTarget.style.backgroundColor = '#22C55E')}
        >
          {isExporting ? '🔄' : '🐍'} Export as LangGraph Code
        </button>

        <button
          onClick={handleCopyJSON}
          disabled={isExporting}
          style={{
            backgroundColor: '#6B7280',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => !isExporting && (e.currentTarget.style.backgroundColor = '#4B5563')}
          onMouseOut={(e) => !isExporting && (e.currentTarget.style.backgroundColor = '#6B7280')}
        >
          📋 Copy JSON to Clipboard
        </button>
      </div>

      {/* Status Message */}
      {exportStatus && (
        <div style={{
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '14px',
          color: '#E5E7EB',
          textAlign: 'center'
        }}>
          {exportStatus}
        </div>
      )}

      {/* Export Info */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        backgroundColor: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#9CA3AF'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: '500', color: '#E5E7EB' }}>
          📝 Export Formats:
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>JSON:</strong> LangGraph-compatible configuration file
        </div>
        <div>
          <strong>LangGraph Code:</strong> Ready-to-run Python template with your flow structure
        </div>
      </div>
    </div>
  );
};

export default FlowExportPanel; 