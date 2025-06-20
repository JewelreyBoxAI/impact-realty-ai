"use client"

import { useState, useEffect } from 'react'

export interface NavItem {
  id: string
  title: string
  path: string
  icon?: React.ReactNode
  badge?: string | number
  isActive?: boolean
  children?: NavItem[]
}

export interface SidebarState {
  isOpen: boolean
  isMobile: boolean
  selectedNavId: string | null
  expandedSections: string[]
}

export const useSidebar = (initialState?: Partial<SidebarState>) => {
  const [state, setState] = useState<SidebarState>({
    isOpen: true,
    isMobile: false,
    selectedNavId: null,
    expandedSections: [],
    ...initialState
  })

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768
      setState(prev => ({
        ...prev,
        isMobile,
        isOpen: isMobile ? false : prev.isOpen
      }))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Persist sidebar state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setState(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.warn('Failed to parse saved sidebar state:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebarState', JSON.stringify({
      isOpen: state.isOpen,
      selectedNavId: state.selectedNavId,
      expandedSections: state.expandedSections
    }))
  }, [state.isOpen, state.selectedNavId, state.expandedSections])

  const toggleSidebar = () => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }

  const openSidebar = () => {
    setState(prev => ({ ...prev, isOpen: true }))
  }

  const closeSidebar = () => {
    setState(prev => ({ ...prev, isOpen: false }))
  }

  const setSelectedNav = (navId: string | null) => {
    setState(prev => ({ ...prev, selectedNavId: navId }))
  }

  const toggleSection = (sectionId: string) => {
    setState(prev => ({
      ...prev,
      expandedSections: prev.expandedSections.includes(sectionId)
        ? prev.expandedSections.filter(id => id !== sectionId)
        : [...prev.expandedSections, sectionId]
    }))
  }

  const expandSection = (sectionId: string) => {
    setState(prev => ({
      ...prev,
      expandedSections: prev.expandedSections.includes(sectionId)
        ? prev.expandedSections
        : [...prev.expandedSections, sectionId]
    }))
  }

  const collapseSection = (sectionId: string) => {
    setState(prev => ({
      ...prev,
      expandedSections: prev.expandedSections.filter(id => id !== sectionId)
    }))
  }

  const isSectionExpanded = (sectionId: string): boolean => {
    return state.expandedSections.includes(sectionId)
  }

  const isNavActive = (navId: string): boolean => {
    return state.selectedNavId === navId
  }

  return {
    // State
    isOpen: state.isOpen,
    isMobile: state.isMobile,
    selectedNavId: state.selectedNavId,
    expandedSections: state.expandedSections,
    
    // Actions
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setSelectedNav,
    toggleSection,
    expandSection,
    collapseSection,
    
    // Helpers
    isSectionExpanded,
    isNavActive
  }
} 