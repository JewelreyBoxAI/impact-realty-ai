"use client"

import React, { useState, useEffect, useCallback } from 'react'

interface FlowAutoSaveProps {
  flowData: any
  onSave?: (data: any) => Promise<void>
  isLoggedIn?: boolean
  debounceMs?: number
}

interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved?: Date
  message?: string
}

const FlowAutoSave: React.FC<FlowAutoSaveProps> = ({
  flowData,
  onSave,
  isLoggedIn = false,
  debounceMs = 5000
}) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' })
  const [showToast, setShowToast] = useState(false)

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (data: any) => {
      setSaveStatus({ status: 'saving', message: 'Saving...' })
      setShowToast(true)

      try {
        if (isLoggedIn && onSave) {
          // Server-side save
          await onSave(data)
        } else {
          // Local IndexedDB fallback
          await saveToIndexedDB(data)
        }

        const now = new Date()
        setSaveStatus({
          status: 'saved',
          lastSaved: now,
          message: `Saved at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✅`
        })

        // Hide toast after 3 seconds
        setTimeout(() => setShowToast(false), 3000)
      } catch (error) {
        setSaveStatus({
          status: 'error',
          message: 'Save failed ❌'
        })
        setTimeout(() => setShowToast(false), 5000)
      }
    }, debounceMs),
    [onSave, isLoggedIn, debounceMs]
  )

  // Monitor flow data changes
  useEffect(() => {
    if (flowData) {
      debouncedSave(flowData)
    }
  }, [flowData, debouncedSave])

  // Save to IndexedDB
  const saveToIndexedDB = async (data: any) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('AgentFlowDB', 1)
      
      request.onerror = () => reject(request.error)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['flows'], 'readwrite')
        const store = transaction.objectStore('flows')
        
        const saveData = {
          id: 'current-flow',
          data,
          timestamp: new Date().toISOString()
        }
        
        store.put(saveData)
        
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      }
      
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('flows')) {
          db.createObjectStore('flows', { keyPath: 'id' })
        }
      }
    })
  }

  // Toast component
  const Toast = () => (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: saveStatus.status === 'error' ? '#EF4444' : '#0F172A',
        border: `1px solid ${saveStatus.status === 'error' ? '#DC2626' : '#334155'}`,
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transform: showToast ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
             {saveStatus.status === 'saving' && (
         <div
           style={{
             width: '16px',
             height: '16px',
             border: '2px solid transparent',
             borderTop: '2px solid #3B82F6',
             borderRadius: '50%'
           }}
           className="animate-spin"
         />
       )}
       {saveStatus.message}
    </div>
  )

  return <Toast />
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default FlowAutoSave 