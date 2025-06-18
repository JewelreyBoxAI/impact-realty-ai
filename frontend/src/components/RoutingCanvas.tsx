"use client"

import React, { useState, useRef, useCallback } from 'react'

interface Agent {
  id: string
  name: string
  type: string
  status: 'idle' | 'running' | 'paused' | 'error'
  description: string
  created_at: string
  performance_metrics: {
    success_rate: number
    avg_execution_time: number
    total_executions: number
  }
}

interface FlowNode {
  id: string
  type: 'start' | 'task' | 'decision' | 'end'
  position: { x: number; y: number }
  data: {
    label: string
    description?: string
    tool?: string
  }
}

interface Connection {
  id: string
  from: string
  to: string
  condition?: string
}

interface RoutingCanvasProps {
  selectedAgent: Agent | null
  executionStatus: 'idle' | 'running' | 'completed' | 'error'
}

const RoutingCanvas: React.FC<RoutingCanvasProps> = ({
  selectedAgent,
  executionStatus
}) => {
  const [flowMode, setFlowMode] = useState<'sequential' | 'hierarchical' | 'hybrid'>('sequential')
  const [nodes, setNodes] = useState<FlowNode[]>([
    {
      id: 'start',
      type: 'start',
      position: { x: 100, y: 100 },
      data: { label: 'Start' }
    },
    {
      id: 'task-1',
      type: 'task',
      position: { x: 300, y: 100 },
      data: { label: 'License Check', tool: 'fl_dbpr' }
    },
    {
      id: 'task-2',
      type: 'task',
      position: { x: 500, y: 100 },
      data: { label: 'Send Email', tool: 'zoho_mail' }
    },
    {
      id: 'end',
      type: 'end',
      position: { x: 700, y: 100 },
      data: { label: 'Complete' }
    }
  ])

  const [connections, setConnections] = useState<Connection[]>([
    { id: 'conn-1', from: 'start', to: 'task-1' },
    { id: 'conn-2', from: 'task-1', to: 'task-2' },
    { id: 'conn-3', from: 'task-2', to: 'end' }
  ])

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showToolPalette, setShowToolPalette] = useState(false)
  const [showNodeConfig, setShowNodeConfig] = useState<string | null>(null)
  const [canvasScale, setCanvasScale] = useState(1)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const availableTools = [
    { id: 'fl_dbpr', name: 'License Verification', category: 'investigation', icon: '📋' },
    { id: 'zoho_zia', name: 'Candidate Sourcing', category: 'investigation', icon: '🔍' },
    { id: 'zoho_mail', name: 'Email Generation', category: 'creation', icon: '📧' },
    { id: 'zoho_calendar', name: 'Calendar Events', category: 'creation', icon: '📅' },
    { id: 'vapi', name: 'SMS Outreach', category: 'interaction', icon: '📱' },
    { id: 'zoho_crm', name: 'CRM Updates', category: 'interaction', icon: '📊' }
  ]

  const handleMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setDraggedNode(nodeId)
    setSelectedNode(nodeId)
  }, [nodes])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const newX = (e.clientX - canvasRect.left - dragOffset.x) / canvasScale
    const newY = (e.clientY - canvasRect.top - dragOffset.y) / canvasScale

    setNodes(prev => prev.map(node => 
      node.id === draggedNode 
        ? { ...node, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
        : node
    ))
  }, [draggedNode, dragOffset, canvasScale])

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null)
  }, [])

  const addNode = (type: FlowNode['type'], position: { x: number; y: number }) => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type,
      position,
      data: { 
        label: type === 'start' ? 'Start' : 
               type === 'end' ? 'End' : 
               type === 'decision' ? 'Decision' : 'New Task'
      }
    }
    
    setNodes(prev => [...prev, newNode])
    setSelectedNode(newNode.id)
    if (type === 'task') {
      setShowNodeConfig(newNode.id)
    }
  }

  const deleteNode = (nodeId: string) => {
    if (nodeId === 'start') return // Can't delete start node
    
    setNodes(prev => prev.filter(n => n.id !== nodeId))
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId))
    setSelectedNode(null)
  }

  const addConnection = (fromId: string, toId: string) => {
    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      from: fromId,
      to: toId
    }
    
    setConnections(prev => [...prev, newConnection])
  }

  const deleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId))
  }

  const assignToolToNode = (nodeId: string, toolId: string) => {
    const tool = availableTools.find(t => t.id === toolId)
    if (!tool) return

    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { 
            ...node, 
            data: { 
              ...node.data, 
              label: tool.name,
              tool: toolId 
            }
          }
        : node
    ))
  }

  const saveWorkflow = async () => {
    const workflow = {
      name: `${selectedAgent?.name || 'Agent'} Workflow`,
      mode: flowMode,
      nodes,
      connections,
      created_at: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      })

      if (response.ok) {
        console.log('Workflow saved successfully')
      }
    } catch (error) {
      console.error('Failed to save workflow:', error)
    }
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedNode(null)
      setShowToolPalette(false)
    }
  }

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const x = (e.clientX - canvasRect.left) / canvasScale
      const y = (e.clientY - canvasRect.top) / canvasScale
      
      addNode('task', { x, y })
    }
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start': return 'bg-green-500'
      case 'task': return 'bg-cyan-400'
      case 'decision': return 'bg-yellow-400'
      case 'end': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start': return '▶️'
      case 'task': return '⚙️'
      case 'decision': return '❓'
      case 'end': return '🏁'
      default: return '⚡'
    }
  }

  const getExecutionState = (nodeId: string) => {
    if (executionStatus === 'running') {
      const nodeIndex = nodes.findIndex(n => n.id === nodeId)
      return nodeIndex <= 1 ? 'executing' : 'pending'
    }
    return 'idle'
  }

  return (
    <div className="agent-panel h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#2A3441]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold font-orbitron text-white">Routing Canvas</h2>
              <p className="text-gray-400 text-sm">
                Design execution flows for {selectedAgent?.name || 'selected agent'}
              </p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowToolPalette(!showToolPalette)}
                className="agent-button-secondary text-sm py-2 px-3"
              >
                Tools
              </button>
              <button 
                onClick={saveWorkflow}
                className="agent-button-secondary text-sm py-2 px-3"
              >
                Save Flow
              </button>
              <button className="agent-button-secondary text-sm py-2 px-3">
                Export
              </button>
            </div>
          </div>

          {/* Flow Mode Selector */}
          <div className="flex space-x-1 bg-[#151920] rounded-xl p-1">
            {(['sequential', 'hierarchical', 'hybrid'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFlowMode(mode)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                  flowMode === mode 
                    ? 'bg-cyan-400 text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 relative overflow-hidden">
          {/* Tool Palette */}
          {showToolPalette && (
            <div className="absolute top-4 left-4 z-10 bg-[#1A1F2E] border border-[#2A3441] rounded-xl p-4 w-64">
              <h3 className="text-sm font-semibold text-white mb-3">Tool Palette</h3>
              <div className="space-y-2">
                {availableTools.map((tool) => (
                  <div
                    key={tool.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('tool', tool.id)
                    }}
                    className="flex items-center space-x-3 p-2 bg-[#151920] rounded-lg cursor-grab hover:bg-[#2A3441] transition-colors"
                  >
                    <span className="text-lg">{tool.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{tool.name}</div>
                      <div className="text-xs text-gray-400 capitalize">{tool.category}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-[#2A3441]">
                <h4 className="text-xs font-medium text-gray-300 mb-2">Add Node</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addNode('task', { x: 200, y: 200 })}
                    className="text-xs p-2 bg-[#151920] rounded-lg hover:bg-[#2A3441] transition-colors text-white"
                  >
                    ⚙️ Task
                  </button>
                  <button
                    onClick={() => addNode('decision', { x: 200, y: 300 })}
                    className="text-xs p-2 bg-[#151920] rounded-lg hover:bg-[#2A3441] transition-colors text-white"
                  >
                    ❓ Decision
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div 
            ref={canvasRef}
            className="absolute inset-0 bg-[#151920] overflow-hidden cursor-crosshair"
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDoubleClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ transform: `scale(${canvasScale}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)` }}
          >
            {/* Grid Background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  radial-gradient(circle, #2A3441 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((connection) => {
                const fromNode = nodes.find(n => n.id === connection.from)
                const toNode = nodes.find(n => n.id === connection.to)
                
                if (!fromNode || !toNode) return null

                return (
                  <g key={connection.id}>
                    <line
                      x1={fromNode.position.x + 40}
                      y1={fromNode.position.y + 25}
                      x2={toNode.position.x}
                      y2={toNode.position.y + 25}
                      stroke="#2A3441"
                      strokeWidth="2"
                      strokeDasharray={executionStatus === 'running' ? '5,5' : ''}
                      className={executionStatus === 'running' ? 'animate-pulse' : ''}
                    />
                    <circle
                      cx={(fromNode.position.x + 40 + toNode.position.x) / 2}
                      cy={(fromNode.position.y + 25 + toNode.position.y + 25) / 2}
                      r="3"
                      fill="#ff4444"
                      className="cursor-pointer hover:r-4 transition-all"
                      onClick={() => deleteConnection(connection.id)}
                    />
                  </g>
                )
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute transition-all duration-300 cursor-move ${
                  getExecutionState(node.id) === 'executing' ? 'animate-pulse ring-2 ring-cyan-400' : ''
                } ${
                  selectedNode === node.id ? 'ring-2 ring-cyan-400' : ''
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  transform: 'translate(0, 0)'
                }}
                onMouseDown={(e) => handleMouseDown(node.id, e)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const toolId = e.dataTransfer.getData('tool')
                  if (toolId && node.type === 'task') {
                    assignToolToNode(node.id, toolId)
                  }
                }}
              >
                <div className={`w-20 h-12 ${getNodeColor(node.type)} rounded-xl flex items-center justify-center text-black font-semibold text-sm shadow-lg relative group`}>
                  <span className="mr-1">{getNodeIcon(node.type)}</span>
                  {node.type === 'task' ? 'Task' : node.data.label}
                  
                  {/* Node Actions */}
                  {selectedNode === node.id && node.id !== 'start' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNode(node.id)
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                <div className="text-xs text-gray-300 mt-1 text-center max-w-20 truncate">
                  {node.data.label}
                </div>
                
                {node.data.tool && (
                  <div className="text-xs text-cyan-400 mt-1 text-center">
                    {availableTools.find(t => t.id === node.data.tool)?.icon}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Canvas Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
            <button
              onClick={() => setCanvasScale(prev => Math.min(prev + 0.1, 2))}
              className="w-10 h-10 bg-[#1A1F2E] border border-[#2A3441] rounded-lg flex items-center justify-center text-white hover:border-cyan-400/50 transition-colors"
            >
              +
            </button>
            <button
              onClick={() => setCanvasScale(prev => Math.max(prev - 0.1, 0.5))}
              className="w-10 h-10 bg-[#1A1F2E] border border-[#2A3441] rounded-lg flex items-center justify-center text-white hover:border-cyan-400/50 transition-colors"
            >
              -
            </button>
            <button
              onClick={() => setCanvasScale(1)}
              className="w-10 h-10 bg-[#1A1F2E] border border-[#2A3441] rounded-lg flex items-center justify-center text-white hover:border-cyan-400/50 transition-colors text-xs"
            >
              1:1
            </button>
          </div>
        </div>

        {/* Node Configuration Modal */}
        {showNodeConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1A1F2E] border border-[#2A3441] rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Configure Node</h3>
                <button
                  onClick={() => setShowNodeConfig(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Node Label
                  </label>
                  <input
                    type="text"
                    className="agent-input w-full"
                    defaultValue={nodes.find(n => n.id === showNodeConfig)?.data.label}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Assigned Tool
                  </label>
                  <select className="agent-input w-full">
                    <option value="">Select a tool...</option>
                    {availableTools.map((tool) => (
                      <option key={tool.id} value={tool.id}>
                        {tool.icon} {tool.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    className="agent-input w-full h-20 resize-none"
                    placeholder="Optional description for this node..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowNodeConfig(null)}
                  className="agent-button-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowNodeConfig(null)}
                  className="agent-button-primary flex-1"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoutingCanvas 