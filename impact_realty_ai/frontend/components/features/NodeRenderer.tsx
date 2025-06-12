'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { SlotRenderer } from '../features';

import { NodeData } from '../../lib/types';

export default function NodeRenderer({ data, selected }: NodeProps<NodeData>) {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'supervisor':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'exec':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'worker':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'processing':
        return 'bg-yellow-500 animate-pulse-custom';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`
      node-card min-w-[250px] min-h-[150px] 
      ${selected ? 'ring-2 ring-primary animate-node-highlight' : ''}
      transition-all duration-200
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary border-2 border-white"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-highlight rounded-lg flex items-center justify-center text-white">
            {getNodeIcon(data.type)}
          </div>
          <div>
            <h3 className="font-semibold text-text text-sm">{data.label}</h3>
            <p className="text-xs text-muted capitalize">{data.type}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(data.status)}`} />
      </div>

      {/* Slot Zones */}
      <div className="space-y-2">
        <SlotRenderer type="input" label="Input" />
        <SlotRenderer type="tools" label="Tools" />
        <SlotRenderer type="output" label="Output" />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-secondary border-2 border-white"
      />
    </div>
  );
} 