import React, { useState, useEffect } from 'react';

interface RibbonData {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  type: 'Trigger' | 'Data' | 'Loopback' | 'Control';
  label?: string;
  executionOrder: 'Before' | 'After' | 'Concurrent';
  style: {
    width: 'thin' | 'medium' | 'wide';
    color: string;
  };
}

interface RibbonConfigDrawerProps {
  isOpen: boolean;
  ribbonData?: RibbonData;
  onSave: (ribbonData: RibbonData) => void;
  onDelete: (ribbonId: string) => void;
  onClose: () => void;
  className?: string;
}

const RibbonConfigDrawer: React.FC<RibbonConfigDrawerProps> = ({
  isOpen,
  ribbonData,
  onSave,
  onDelete,
  onClose,
  className = ''
}) => {
  const [formData, setFormData] = useState<RibbonData>({
    id: '',
    fromAgentId: '',
    toAgentId: '',
    type: 'Data',
    label: '',
    executionOrder: 'After',
    style: {
      width: 'medium',
      color: '#10B981'
    }
  });

  const connectionTypes = [
    { value: 'Trigger', label: 'Trigger', description: 'One-way flow initiation', color: '#3B82F6' },
    { value: 'Data', label: 'Data', description: 'Pass data between agents', color: '#10B981' },
    { value: 'Loopback', label: 'Loopback', description: 'Two-way communication', color: '#F59E0B' },
    { value: 'Control', label: 'Control', description: 'Supervisor instruction', color: '#8B5CF6' }
  ];

  const executionOrders = [
    { value: 'Before', label: 'Before', description: 'Execute before target agent' },
    { value: 'After', label: 'After', description: 'Execute after target agent' },
    { value: 'Concurrent', label: 'Concurrent', description: 'Execute alongside target agent' }
  ];

  const widthOptions = [
    { value: 'thin', label: 'Thin', description: '4px width' },
    { value: 'medium', label: 'Medium', description: '8px width' },
    { value: 'wide', label: 'Wide', description: '12px width' }
  ];

  useEffect(() => {
    if (ribbonData) {
      setFormData(ribbonData);
    }
  }, [ribbonData, isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (formData.id && window.confirm('Are you sure you want to delete this connection?')) {
      onDelete(formData.id);
      onClose();
    }
  };

  const updateFormData = (field: keyof RibbonData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateStyle = (field: keyof RibbonData['style'], value: any) => {
    setFormData(prev => ({
      ...prev,
      style: {
        ...prev.style,
        [field]: value
      }
    }));
  };

  const handleTypeChange = (type: string) => {
    const selectedType = connectionTypes.find(t => t.value === type);
    if (selectedType) {
      setFormData(prev => ({
        ...prev,
        type: type as RibbonData['type'],
        style: {
          ...prev.style,
          color: selectedType.color
        }
      }));
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '400px',
          maxWidth: '90vw',
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRight: 'none',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          boxShadow: isOpen ? '-10px 0 25px -3px rgba(0, 0, 0, 0.3)' : 'none'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#FFFFFF',
            margin: 0
          }}>
            Ribbon Connector Settings
          </h2>
          
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Connection Info */}
            <div style={{
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                Connection
              </div>
              <div style={{ fontSize: '14px', color: '#E5E7EB', fontWeight: '500' }}>
                {formData.fromAgentId} → {formData.toAgentId}
              </div>
            </div>

            {/* Connection Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#E5E7EB',
                marginBottom: '8px'
              }}>
                Connection Type
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {connectionTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeChange(type.value)}
                    style={{
                      backgroundColor: formData.type === type.value ? type.color : '#374151',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                      {type.label}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {type.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Label */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#E5E7EB',
                marginBottom: '6px'
              }}>
                Label (Optional)
              </label>
              <input
                type="text"
                value={formData.label || ''}
                onChange={(e) => updateFormData('label', e.target.value)}
                placeholder="Enter connection label..."
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  color: '#FFFFFF',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Execution Order */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#E5E7EB',
                marginBottom: '8px'
              }}>
                Execution Order
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {executionOrders.map(order => (
                  <button
                    key={order.value}
                    onClick={() => updateFormData('executionOrder', order.value)}
                    style={{
                      backgroundColor: formData.executionOrder === order.value ? '#3B82F6' : '#374151',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                      {order.label}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {order.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ribbon Style */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#E5E7EB',
                marginBottom: '8px'
              }}>
                Ribbon Style
              </label>
              
              {/* Width */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '6px' }}>
                  Width
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {widthOptions.map(width => (
                    <button
                      key={width.value}
                      onClick={() => updateStyle('width', width.value)}
                      style={{
                        flex: 1,
                        backgroundColor: formData.style.width === width.value ? '#3B82F6' : '#374151',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {width.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Preview */}
              <div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '6px' }}>
                  Color (Auto-set by type)
                </div>
                <div style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    backgroundColor: formData.style.color
                  }} />
                  <span style={{ color: '#E5E7EB', fontSize: '14px' }}>
                    {formData.style.color}
                  </span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#E5E7EB',
                marginBottom: '8px'
              }}>
                Preview
              </label>
              <div style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  height: formData.style.width === 'thin' ? '4px' : formData.style.width === 'medium' ? '8px' : '12px',
                  width: '100px',
                  backgroundColor: formData.style.color,
                  borderRadius: '2px',
                  position: 'relative'
                }}>
                  {formData.label && (
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '10px',
                      color: '#E5E7EB',
                      whiteSpace: 'nowrap'
                    }}>
                      {formData.label}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#374151',
                color: '#E5E7EB',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Save Changes
            </button>
          </div>

          {/* Delete Button */}
          {formData.id && (
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Delete Connection
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default RibbonConfigDrawer; 