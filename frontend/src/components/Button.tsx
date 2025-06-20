"use client"

import React, { useState } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const getVariantStyle = () => {
    const baseStyle = {
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none',
      outline: 'none',
      transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
      boxShadow: isHovered ? '0 8px 16px -4px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: isHovered ? '#2563EB' : '#3B82F6',
          color: '#FFFFFF'
        }
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: isHovered ? '#334155' : '#475569',
          color: '#FFFFFF'
        }
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: isHovered ? '#16A34A' : '#22C55E',
          color: '#FFFFFF'
        }
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: isHovered ? '#1E293B' : 'transparent',
          color: isHovered ? '#FFFFFF' : '#E5E7EB',
          borderColor: '#334155'
        }
      default:
        return {
          ...baseStyle,
          backgroundColor: isHovered ? '#2563EB' : '#3B82F6',
          color: '#FFFFFF'
        }
    }
  }

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '6px 12px',
          fontSize: '14px'
        }
      case 'md':
        return {
          padding: '8px 16px',
          fontSize: '16px'
        }
      case 'lg':
        return {
          padding: '12px 24px',
          fontSize: '18px'
        }
      default:
        return {
          padding: '8px 16px',
          fontSize: '16px'
        }
    }
  }

  const combinedStyle = {
    ...getVariantStyle(),
    ...getSizeStyle()
  }

  return (
    <button
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button 