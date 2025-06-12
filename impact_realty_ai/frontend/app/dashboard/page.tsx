'use client';

export default function Dashboard() {
  const metrics = [
    { label: 'Active Agents', value: '12', change: '+2', color: 'text-green-400' },
    { label: 'Workflows Running', value: '8', change: '+1', color: 'text-blue-400' },
    { label: 'Tasks Completed', value: '1,247', change: '+89', color: 'text-purple-400' },
    { label: 'Success Rate', value: '98.2%', change: '+0.3%', color: 'text-green-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-text mb-4">Dashboard</h1>
        <p className="text-xl text-muted">
          Real-time monitoring and analytics for your agent ecosystem
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {metrics.map((metric, index) => (
          <div key={index} className="node-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">{metric.label}</span>
              <span className={`text-sm ${metric.color}`}>
                {metric.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-text">
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Agent Performance</h3>
          <div className="h-64 flex items-center justify-center text-muted">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-highlight rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p>Charts coming soon</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-text mb-4">System Status</h3>
          <div className="space-y-4">
            {[
              { name: 'API Gateway', status: 'Healthy', uptime: '99.9%' },
              { name: 'Agent Cluster', status: 'Healthy', uptime: '99.8%' },
              { name: 'Message Queue', status: 'Healthy', uptime: '100%' },
              { name: 'Database', status: 'Healthy', uptime: '99.9%' },
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-bg rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-custom"></div>
                  <span className="text-text font-medium">{service.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-400">{service.status}</div>
                  <div className="text-xs text-muted">{service.uptime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 