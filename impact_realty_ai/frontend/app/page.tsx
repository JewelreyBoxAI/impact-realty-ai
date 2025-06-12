'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16 animate-fade-in">
        <h1 className="text-5xl font-bold text-text mb-6">
          Agentic OS
          <span className="block text-3xl text-primary mt-2">
            Advanced AI Agent Orchestration
          </span>
        </h1>
        <p className="text-xl text-muted max-w-3xl mx-auto leading-relaxed">
          Build, deploy, and monitor sophisticated AI agent systems with our 
          visual drag-and-drop interface. Create complex workflows, integrate 
          tools, and scale your operations with enterprise-grade reliability.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Link href="/agent-builder" className="group">
          <div className="node-card hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-highlight rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-sm text-primary font-semibold">BUILD</span>
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Agent Builder</h3>
            <p className="text-muted">
              Design complex agent workflows with our visual canvas. 
              Drag and drop nodes, configure prompts, and connect services.
            </p>
          </div>
        </Link>

        <Link href="/dashboard" className="group">
          <div className="node-card hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm text-accent font-semibold">MONITOR</span>
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Dashboard</h3>
            <p className="text-muted">
              Real-time monitoring, metrics, and telemetry for all your 
              deployed agents and workflows.
            </p>
          </div>
        </Link>

        <div className="node-card opacity-75">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-warn to-primary rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <span className="text-sm text-warn font-semibold">DEPLOY</span>
          </div>
          <h3 className="text-xl font-bold text-text mb-2">Deployment</h3>
          <p className="text-muted">
            One-click deployment to cloud infrastructure with 
            auto-scaling and load balancing.
          </p>
          <div className="mt-4">
            <span className="text-xs text-warn bg-warn/20 px-2 py-1 rounded">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="animate-slide-up">
          <h2 className="text-3xl font-bold text-text mb-6">
            Enterprise-Grade Agent Platform
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-text">Visual Workflow Designer</h4>
                <p className="text-muted">Drag-and-drop interface for building complex agent interactions</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-text">MCP Integration</h4>
                <p className="text-muted">Connect to external services and tools seamlessly</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-text">Real-time Monitoring</h4>
                <p className="text-muted">Comprehensive dashboards and alerting for production systems</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-text">HIPAA Compliant</h4>
                <p className="text-muted">Enterprise security and compliance built-in</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative animate-slide-up">
          <div className="glass-panel rounded-2xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-highlight rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text mb-2">Ready to Build?</h3>
              <p className="text-muted mb-6">
                Start creating your first agent workflow in minutes
              </p>
              <Link href="/agent-builder" className="btn-primary inline-block">
                Launch Agent Builder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 