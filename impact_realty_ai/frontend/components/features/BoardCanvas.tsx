'use client';

import React, { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState, Connection, Edge, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css';
import { NodeRenderer } from '../features';

const initialNodes = [
  {
    id: '1',
    type: 'agentNode',
    position: { x: 250, y: 100 },
    data: { 
      label: 'Supervisor Agent',
      type: 'supervisor',
      status: 'active'
    },
  },
];

const initialEdges: Edge[] = [];

export default function BoardCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes = useMemo(() => ({
    agentNode: NodeRenderer,
  }), []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-bg"
      >
        <Controls className="bg-surface border border-border" />
        <MiniMap 
          className="bg-surface border border-border"
          nodeColor="#00aff0"
          maskColor="rgba(13, 17, 23, 0.8)"
        />
        <Background 
          variant={BackgroundVariant.Dots}
          gap={20} 
          size={1}
          color="var(--color-border)"
        />
      </ReactFlow>
    </div>
  );
} 