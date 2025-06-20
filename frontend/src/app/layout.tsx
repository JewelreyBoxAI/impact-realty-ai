"use client"

// Metadata type removed since using client component
import { Inter, JetBrains_Mono } from 'next/font/google'
import '../styles/globals.css'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '../components/Sidebar'

// Modern font configuration - Professional only, no legacy fonts
const inter = Inter({ 
  subsets: ['latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'sans-serif'
  ]
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin-ext'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
  fallback: [
    'SF Mono',
    'Monaco', 
    'Consolas',
    'Liberation Mono',
    'monospace'
  ]
})

interface Agent {
  id: string
  name: string
  type: string
  status: 'idle' | 'running' | 'paused' | 'error'
  description: string
  successRate: number
  totalRuns: number
}

// Metadata moved to individual pages since this is now a client component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent)
  }

  const getPageTitle = (path: string | null) => {
    switch (path) {
      case '/flow-canvas':
        return 'Flow Builder'
      case '/knowledge-base':
        return 'Flow Library'
      case '/monitoring':
        return 'Monitoring'
      case '/settings':
        return 'Settings'
      case '/':
        return 'Dashboard'
      default:
        return 'Dashboard'
    }
  }

  const getPageDescription = (path: string | null) => {
    switch (path) {
      case '/flow-canvas':
        return 'Design and build agent workflows'
      case '/knowledge-base':
        return 'Browse and manage flow templates'
      case '/monitoring':
        return 'Monitor agent performance and system health'
      case '/settings':
        return 'Configure system settings and preferences'
      case '/':
        return 'Agent Flow Overview & Management'
      default:
        return 'Agent Flow Overview & Management'
    }
  }

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className={`${inter.className} ${inter.variable} ${jetbrainsMono.variable}`}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable} ${jetbrainsMono.variable}`} style={{ margin: 0, padding: 0, backgroundColor: '#0F172A', color: '#FFFFFF' }}>
        <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
          {/* Navigation Sidebar (Per Original Design) */}
          <div style={{ width: '256px', backgroundColor: '#1E293B', borderRight: '1px solid #334155' }}>
            <Sidebar />
          </div>
          
          {/* Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0F172A' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#1E293B', borderBottom: '1px solid #334155', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Page Title Area */}
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>
                    {getPageTitle(pathname)}
                  </h1>
                  <p style={{ fontSize: '14px', color: '#E5E7EB', margin: 0 }}>
                    {getPageDescription(pathname)}
                  </p>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 