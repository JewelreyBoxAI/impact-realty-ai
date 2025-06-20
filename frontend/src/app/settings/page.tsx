"use client"

import React, { useState } from 'react'
import Button from '../../components/Button'

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'agents' | 'integrations' | 'security'>('general')
  
  const [settings, setSettings] = useState({
    general: {
      systemName: 'AgentOS Dashboard',
      timezone: 'America/New_York',
      theme: 'dark',
      autoSave: true,
      notifications: true
    },
    agents: {
      maxConcurrentExecutions: 5,
      defaultTimeout: 300,
      retryAttempts: 3,
      logLevel: 'info'
    },
    integrations: {
      openaiApiKey: '••••••••••••••••••••',
      supabaseUrl: 'https://your-project.supabase.co',
      zohoEnabled: true,
      vApiEnabled: false
    },
    security: {
      sessionTimeout: 480,
      twoFactorAuth: false,
      auditLogging: true,
      ipWhitelist: ''
    }
  })

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'agents', label: 'Agents', icon: '🤖' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ]

  const handleSave = () => {
    console.log('Settings saved:', settings)
    // Implement save functionality
  }

  const handleReset = () => {
    console.log('Settings reset to defaults')
    // Implement reset functionality
  }

  return (
    <div className="agentos-content-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-agentos-body">
          Configure system preferences and agent behavior
        </p>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="agentos-card">
            <h3 className="text-agentos-title mb-4">Settings</h3>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-agentos transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md'
                      : 'text-text-secondary hover:bg-slate-800 hover:text-text-primary'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="agentos-card">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div>
                <h3 className="text-agentos-title mb-6">General Settings</h3>
                
                <div className="space-y-6">
                  <div className="form-group-agentos">
                    <label className="form-label-agentos">System Name</label>
                    <input
                      type="text"
                      value={settings.general.systemName}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, systemName: e.target.value }
                      })}
                      className="input-agentos w-full"
                    />
                  </div>

                  <div className="form-group-agentos">
                    <label className="form-label-agentos">Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, timezone: e.target.value }
                      })}
                      className="input-agentos w-full"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-agentos-label">Auto-save Changes</p>
                        <p className="text-agentos-caption">Automatically save settings when modified</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.general.autoSave}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, autoSave: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-agentos-label">Enable Notifications</p>
                        <p className="text-agentos-caption">Receive system and agent notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.general.notifications}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, notifications: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Settings */}
            {activeTab === 'agents' && (
              <div>
                <h3 className="text-agentos-title mb-6">Agent Configuration</h3>
                
                <div className="space-y-6">
                  <div className="form-group-agentos">
                    <label className="form-label-agentos">Max Concurrent Executions</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.agents.maxConcurrentExecutions}
                      onChange={(e) => setSettings({
                        ...settings,
                        agents: { ...settings.agents, maxConcurrentExecutions: parseInt(e.target.value) }
                      })}
                      className="input-agentos w-full"
                    />
                    <p className="text-agentos-caption mt-1">Maximum number of agents that can run simultaneously</p>
                  </div>

                  <div className="form-group-agentos">
                    <label className="form-label-agentos">Default Timeout (seconds)</label>
                    <input
                      type="number"
                      min="30"
                      max="3600"
                      value={settings.agents.defaultTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        agents: { ...settings.agents, defaultTimeout: parseInt(e.target.value) }
                      })}
                      className="input-agentos w-full"
                    />
                  </div>

                  <div className="form-group-agentos">
                    <label className="form-label-agentos">Retry Attempts</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={settings.agents.retryAttempts}
                      onChange={(e) => setSettings({
                        ...settings,
                        agents: { ...settings.agents, retryAttempts: parseInt(e.target.value) }
                      })}
                      className="input-agentos w-full"
                    />
                  </div>

                  <div className="form-group-agentos">
                    <label className="form-label-agentos">Log Level</label>
                    <select
                      value={settings.agents.logLevel}
                      onChange={(e) => setSettings({
                        ...settings,
                        agents: { ...settings.agents, logLevel: e.target.value }
                      })}
                      className="input-agentos w-full"
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Integration Settings */}
            {activeTab === 'integrations' && (
              <div>
                <h3 className="text-agentos-title mb-6">Integration Settings</h3>
                
                <div className="space-y-6">
                  <div className="form-group-agentos">
                    <label className="form-label-agentos">OpenAI API Key</label>
                    <input
                      type="password"
                      value={settings.integrations.openaiApiKey}
                      onChange={(e) => setSettings({
                        ...settings,
                        integrations: { ...settings.integrations, openaiApiKey: e.target.value }
                      })}
                      className="input-agentos w-full"
                      placeholder="sk-..."
                    />
                  </div>

                  <div className="form-group-agentos">
                    <label className="form-label-agentos">Supabase URL</label>
                    <input
                      type="url"
                      value={settings.integrations.supabaseUrl}
                      onChange={(e) => setSettings({
                        ...settings,
                        integrations: { ...settings.integrations, supabaseUrl: e.target.value }
                      })}
                      className="input-agentos w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-agentos-label">Zoho Integration</p>
                        <p className="text-agentos-caption">Enable Zoho CRM and email integration</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.integrations.zohoEnabled}
                          onChange={(e) => setSettings({
                            ...settings,
                            integrations: { ...settings.integrations, zohoEnabled: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-agentos-label">VAPI Integration</p>
                        <p className="text-agentos-caption">Enable voice AI functionality</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.integrations.vApiEnabled}
                          onChange={(e) => setSettings({
                            ...settings,
                            integrations: { ...settings.integrations, vApiEnabled: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-agentos-title mb-6">Security Settings</h3>
                
                <div className="space-y-6">
                  <div className="form-group-agentos">
                    <label className="form-label-agentos">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      min="15"
                      max="1440"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                      })}
                      className="input-agentos w-full"
                    />
                  </div>

                  <div className="form-group-agentos">
                    <label className="form-label-agentos">IP Whitelist</label>
                    <textarea
                      value={settings.security.ipWhitelist}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, ipWhitelist: e.target.value }
                      })}
                      className="textarea-agentos w-full h-24"
                      placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                    />
                    <p className="text-agentos-caption mt-1">One IP address or CIDR block per line</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-agentos-label">Two-Factor Authentication</p>
                        <p className="text-agentos-caption">Require 2FA for all user logins</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => setSettings({
                            ...settings,
                            security: { ...settings.security, twoFactorAuth: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-agentos-label">Audit Logging</p>
                        <p className="text-agentos-caption">Log all system and user activities</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.auditLogging}
                          onChange={(e) => setSettings({
                            ...settings,
                            security: { ...settings.security, auditLogging: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-border-light">
              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset to Defaults
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage 