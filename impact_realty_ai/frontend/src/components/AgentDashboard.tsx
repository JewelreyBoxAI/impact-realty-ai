"use client";
import { useState } from 'react';
import { api } from '@/lib/api';
import { 
  UserGroupIcon, 
  ShieldCheckIcon, 
  CpuChipIcon, 
  ChartBarIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface AgentDashboardProps {
  systemStatus: any;
}

interface DemoAction {
  name: string;
  description: string;
  action: () => Promise<void>;
  icon: React.ComponentType<any>;
  color: string;
}

export default function AgentDashboard({ systemStatus }: AgentDashboardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const demoActions: DemoAction[] = [
    {
      name: 'Recruitment Pipeline',
      description: 'Run the AI recruitment agent to source and qualify candidates',
      action: async () => await runDemo('recruitment', api.runRecruitmentDemo),
      icon: UserGroupIcon,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Compliance Check',
      description: 'Execute compliance workflow for deal validation',
      action: async () => await runDemo('compliance', api.runComplianceDemo),
      icon: ShieldCheckIcon,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: "Kevin's Assistant",
      description: 'Activate Kevin\'s personal AI assistant for task management',
      action: async () => await runDemo('kevin-assistant', api.runKevinAssistantDemo),
      icon: CpuChipIcon,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'Parallel Workflows',
      description: 'Demonstrate multiple agents working simultaneously',
      action: async () => await runDemo('parallel', api.runParallelDemo),
      icon: ChartBarIcon,
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const runDemo = async (demoName: string, demoFunction: () => Promise<any>) => {
    setLoading(demoName);
    try {
      const result = await demoFunction();
      setResults(prev => ({ ...prev, [demoName]: result }));
    } catch (error) {
      console.error(`Error running ${demoName} demo:`, error);
      setResults(prev => ({ 
        ...prev, 
        [demoName]: { 
          status: 'error', 
          message: `Failed to run ${demoName} demo` 
        } 
      }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* System Status Card */}
      {systemStatus && (
        <div className="bg-card rounded-2xl p-6 shadow-glass border border-border">
          <h3 className="text-xl font-heading font-semibold text-primary mb-4">
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {systemStatus.status === 'healthy' ? '✓' : '⚠'}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Object.keys(systemStatus.agents || {}).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {systemStatus.version || 'v1.0.0'}
              </div>
              <div className="text-sm text-muted-foreground">Version</div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {demoActions.map((action) => {
          const Icon = action.icon;
          const isLoading = loading === action.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const result = results[action.name.toLowerCase().replace(/[^a-z0-9]/g, '-')];
          
          return (
            <div key={action.name} className="bg-card rounded-2xl p-6 shadow-glass border border-border">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${action.color} flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-heading font-semibold text-foreground mb-2">
                    {action.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {action.description}
                  </p>
                  <button
                    onClick={action.action}
                    disabled={isLoading}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                      ${action.color} text-white transition-colors duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-4 h-4" />
                        Run Demo
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Result Display */}
              {result && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm">
                    <div className={`font-medium ${
                      result.status === 'success' ? 'text-success' : 'text-error'
                    }`}>
                      Status: {result.status}
                    </div>
                    {result.message && (
                      <div className="text-muted-foreground mt-1">
                        {result.message}
                      </div>
                    )}
                    {result.data && (
                      <pre className="mt-2 text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 