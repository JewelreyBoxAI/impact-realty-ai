'use client';

import React from 'react';

import { ToolItem } from '../../lib/types';

const toolItems: ToolItem[] = [
  {
    id: 'supervisor',
    name: 'Supervisor Agent',
    type: 'agent',
    category: 'Agents',
    description: 'Orchestrates and coordinates other agents',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'exec',
    name: 'Executive Agent',
    type: 'agent',
    category: 'Agents',
    description: 'Executes specific business logic',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'worker',
    name: 'Worker Agent',
    type: 'agent',
    category: 'Agents',
    description: 'Performs specific tasks and operations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: 'zoho-crm',
    name: 'Zoho CRM',
    type: 'mcp',
    category: 'MCP Connectors',
    description: 'Connect to Zoho CRM for customer data',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'pdf-parser',
    name: 'PDF Parser',
    type: 'tool',
    category: 'Tools',
    description: 'Extract text and data from PDF documents',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'email-tool',
    name: 'Email Service',
    type: 'tool',
    category: 'Tools',
    description: 'Send and receive emails',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const categories = ['Agents', 'Tools', 'MCP Connectors'];

export default function ToolSidebar() {
  const onDragStart = (event: React.DragEvent, item: ToolItem) => {
    event.dataTransfer.setData('application/reactflow', item.type);
    event.dataTransfer.setData('application/json', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-text mb-2">Component Library</h2>
        <p className="text-sm text-muted">
          Drag components onto the canvas to build your agent workflow
        </p>
      </div>

      {/* Tool Categories */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wide">
              {category}
            </h3>
            
            <div className="space-y-2">
              {toolItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    className="bg-bg border border-border rounded-lg p-3 cursor-grab hover:border-primary transition-all duration-200 hover:shadow-md group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-highlight rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-text group-hover:text-primary transition-colors duration-200">
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-border space-y-2">
        <button className="w-full btn-primary text-sm">
          Save Workflow
        </button>
        <button className="w-full btn-secondary text-sm">
          Deploy
        </button>
      </div>
    </div>
  );
} 