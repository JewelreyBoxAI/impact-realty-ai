"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Sidebar: React.FC = () => {
  const pathname = usePathname()

  const navigationItems = [
    { 
      href: '/', 
      label: 'Dashboard',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      href: '/flow-canvas', 
      label: 'Flow Builder',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      href: '/knowledge-base', 
      label: 'Flow Library',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      href: '/monitoring', 
      label: 'Monitoring',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      href: '/settings', 
      label: 'Settings',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  const isActiveRoute = (href: string) => {
    return pathname === href
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
      {/* Logo / App Name */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            backgroundColor: '#3B82F6', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600' }}>A</span>
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>AgentOS</h2>
            <p style={{ fontSize: '12px', color: '#E5E7EB', margin: 0 }}>Agent Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                backgroundColor: isActive ? '#3B82F6' : 'transparent',
                color: isActive ? '#FFFFFF' : '#E5E7EB',
                textDecoration: 'none',
                boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#334155'
                  e.currentTarget.style.color = '#FFFFFF'
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#E5E7EB'
                }
              }}
            >
              {item.icon}
              <span style={{ fontWeight: '500', fontSize: '14px' }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer with Version Info */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Version</p>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#E5E7EB', margin: 0 }}>2.1.0</p>
          </div>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            backgroundColor: '#22C55E', 
            borderRadius: '50%' 
          }} />
        </div>
        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '8px 0 0 0' }}>Status: Online</p>
      </div>
    </div>
  )
}

export default Sidebar 