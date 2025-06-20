"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HamburgerMenuProps {
  className?: string
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigationItems = [
    { 
      href: '/create-agent', 
      label: 'Create an Agent',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    { 
      href: '/flow-canvas', 
      label: 'Agent Flow Canvas',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      href: '/flow-status', 
      label: 'Running Flow Status',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      href: '/knowledge-base', 
      label: 'Knowledge Base',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ]

  const isActiveRoute = (href: string) => {
    return pathname === href
  }

  const toggleMenu = () => {
    console.log('Hamburger clicked, current state:', isOpen)
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const hamburgerLineStyle = {
    backgroundColor: '#FFFFFF',
    display: 'block',
    height: '2px',
    width: '20px',
    borderRadius: '2px',
    transition: 'all 0.3s ease-out'
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#334155'}
        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1E293B'}
        aria-label="Navigation menu"
      >
        <div style={{ width: '20px', height: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{
            ...hamburgerLineStyle,
            transform: isOpen ? 'rotate(45deg) translateY(4px)' : 'translateY(-2px)'
          }} />
          <span style={{
            ...hamburgerLineStyle,
            margin: '2px 0',
            opacity: isOpen ? 0 : 1
          }} />
          <span style={{
            ...hamburgerLineStyle,
            transform: isOpen ? 'rotate(-45deg) translateY(-4px)' : 'translateY(2px)'
          }} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40
            }}
            onClick={closeMenu}
          />
          
          {/* Menu Content */}
          <div 
            style={{
              position: 'absolute',
              top: '48px',
              left: 0,
              zIndex: 50,
              width: '256px',
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
            <div style={{ padding: '8px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#E5E7EB',
                padding: '12px',
                marginBottom: '8px',
                borderBottom: '1px solid #334155',
                margin: 0
              }}>
                Navigation
              </h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navigationItems.map((item) => {
                  const isActive = isActiveRoute(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
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
                      <span style={{ fontWeight: '500' }}>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </>
      )}


    </div>
  )
}

export default HamburgerMenu 