// Shared TypeScript interfaces for the AgentOS system

export interface Agent {
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

export interface Project {
  id: string
  name: string
  description: string
  agent_count: number
  last_execution: string
  status: 'active' | 'paused' | 'completed'
}

export interface Capability {
  id: string
  name: string
  description: string
  category: 'investigation' | 'creation' | 'interaction'
  success_rate: number
  usage_count: number
  avg_time: number
  enabled: boolean
}

export interface FlowNode {
  id: string
  type: 'start' | 'task' | 'decision' | 'end'
  position: { x: number; y: number }
  data: {
    label: string
    description?: string
    tool?: string
  }
}

export interface ExecutionLog {
  id: string
  project_id: string
  agent_id: string
  command: string
  status: 'completed' | 'failed' | 'running'
  duration: number
  result?: string
  error?: string
  timestamp: string
}

export interface KnowledgeFile {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
  status: 'processing' | 'completed' | 'error'
  chunks?: number
  embeddings?: number
}

export interface ExecutionState {
  status: 'idle' | 'running' | 'completed' | 'error'
  message?: string
  progress?: number
}

export type AgentType = 'recruitment' | 'compliance' | 'assistant' | 'intelligence'
export type FlowMode = 'sequential' | 'hierarchical' | 'hybrid'
export type TabType = 'investigation' | 'creation' | 'interaction' 