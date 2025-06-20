import React from 'react'
import Button from '../components/Button'

const DashboardPage: React.FC = () => {
  const systemStats = {
    totalAgents: 6,
    activeAgents: 2,
    totalExecutions: 156,
    successRate: 87.5,
    avgExecutionTime: '12m 34s'
  }

  const recentActivity = [
    {
      id: 'activity-001',
      type: 'execution',
      message: 'Recruitment Executive completed client screening workflow',
      timestamp: '2024-01-15T16:45:00Z',
      status: 'success'
    },
    {
      id: 'activity-002',
      type: 'agent',
      message: 'Market Analyst agent was paused by user',
      timestamp: '2024-01-15T16:30:00Z',
      status: 'info'
    },
    {
      id: 'activity-003',
      type: 'error',
      message: 'Document Processor failed: validation error',
      timestamp: '2024-01-15T16:15:00Z',
      status: 'error'
    },
    {
      id: 'activity-004',
      type: 'execution',
      message: 'Compliance Officer completed regulatory check',
      timestamp: '2024-01-15T16:00:00Z',
      status: 'success'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'execution':
        return '⚡'
      case 'agent':
        return '🤖'
      case 'error':
        return '❌'
      default:
        return '📋'
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-accent-green'
      case 'error':
        return 'text-red-400'
      case 'info':
        return 'text-blue-400'
      default:
        return 'text-text-secondary'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="agentos-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Welcome to AgentOS Dashboard
            </h1>
            <p className="text-agentos-body">
              Manage your intelligent agents and monitor their performance
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Reports
            </Button>
            <Button variant="primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Agent
            </Button>
          </div>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">Total Agents</p>
              <p className="text-2xl font-bold text-text-primary">{systemStats.totalAgents}</p>
            </div>
            <div className="w-8 h-8 bg-primary/20 rounded-agentos flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">Active Now</p>
              <p className="text-2xl font-bold text-accent-green">{systemStats.activeAgents}</p>
            </div>
            <div className="w-8 h-8 bg-accent-green/20 rounded-agentos flex items-center justify-center">
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">Total Executions</p>
              <p className="text-2xl font-bold text-text-primary">{systemStats.totalExecutions}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-500/20 rounded-agentos flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">Success Rate</p>
              <p className="text-2xl font-bold text-text-primary">{systemStats.successRate}%</p>
            </div>
            <div className="w-8 h-8 bg-accent-green/20 rounded-agentos flex items-center justify-center">
              <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="agentos-card-compact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-agentos-caption">Avg Time</p>
              <p className="text-2xl font-bold text-text-primary">{systemStats.avgExecutionTime}</p>
            </div>
            <div className="w-8 h-8 bg-blue-500/20 rounded-agentos flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="agentos-card">
          <h2 className="text-agentos-title mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Agent
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Design Workflow
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Documents
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Analytics
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 agentos-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-agentos-title">Recent Activity</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-800 rounded-agentos">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${getActivityColor(activity.status)}`}>
                    {activity.message}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Performance Overview */}
      <div className="agentos-card">
        <h2 className="text-agentos-title mb-6">Agent Performance Overview</h2>
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Performance Charts</h3>
          <p className="text-text-secondary mb-4">
            Detailed performance analytics and charts will be displayed here
          </p>
          <Button variant="primary">
            View Detailed Analytics
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage 