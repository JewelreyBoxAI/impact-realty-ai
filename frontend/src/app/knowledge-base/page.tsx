"use client"

import React, { useState } from 'react'
import Button from '../../components/Button'

const KnowledgeBasePage: React.FC = () => {
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'training'>('overview')

  const knowledgeBases = [
    {
      id: 'kb-001',
      name: 'Real Estate Regulations',
      description: 'Florida real estate laws, regulations, and compliance requirements',
      documents: 45,
      lastUpdated: '2024-01-15T10:30:00Z',
      size: '12.5 MB',
      type: 'regulations',
      status: 'active',
      agents: ['Compliance Officer', 'Recruitment Executive']
    },
    {
      id: 'kb-002',
      name: 'Company Policies',
      description: 'Internal procedures, policies, and operational guidelines',
      documents: 23,
      lastUpdated: '2024-01-14T15:20:00Z',
      size: '8.2 MB',
      type: 'policies',
      status: 'active',
      agents: ['Executive Assistant', 'Client Onboarding']
    },
    {
      id: 'kb-003',
      name: 'Market Data',
      description: 'Tampa Bay market trends, pricing data, and analytics',
      documents: 67,
      lastUpdated: '2024-01-15T09:15:00Z',
      size: '25.7 MB',
      type: 'data',
      status: 'active',
      agents: ['Market Analyst']
    },
    {
      id: 'kb-004',
      name: 'Training Materials',
      description: 'Agent training resources and best practices',
      documents: 18,
      lastUpdated: '2024-01-12T14:45:00Z',
      size: '5.3 MB',
      type: 'training',
      status: 'draft',
      agents: []
    }
  ]

  const recentDocuments = [
    {
      id: 'doc-001',
      name: 'Florida Real Estate License Requirements 2024.pdf',
      size: '2.3 MB',
      uploadedAt: '2024-01-15T10:30:00Z',
      type: 'pdf',
      knowledgeBase: 'Real Estate Regulations'
    },
    {
      id: 'doc-002',
      name: 'Tampa Bay Market Report Q1 2024.xlsx',
      size: '1.8 MB',
      uploadedAt: '2024-01-15T09:15:00Z',
      type: 'excel',
      knowledgeBase: 'Market Data'
    },
    {
      id: 'doc-003',
      name: 'Client Onboarding Checklist.docx',
      size: '456 KB',
      uploadedAt: '2024-01-14T15:20:00Z',
      type: 'word',
      knowledgeBase: 'Company Policies'
    }
  ]

  const getKnowledgeBaseIcon = (type: string) => {
    switch (type) {
      case 'regulations':
        return '📋'
      case 'policies':
        return '📄'
      case 'data':
        return '📊'
      case 'training':
        return '🎓'
      default:
        return '📁'
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄'
      case 'excel':
        return '📊'
      case 'word':
        return '📝'
      default:
        return '📄'
    }
  }

  const handleCreateKnowledgeBase = () => {
    console.log('Creating new knowledge base...')
    // TODO: Implement creation functionality
  }

  const handleUploadDocument = () => {
    console.log('Uploading document...')
    // TODO: Implement upload functionality
  }

  const handleEditKnowledgeBase = (kbId: string) => {
    setSelectedKnowledgeBase(kbId)
    console.log('Editing knowledge base:', kbId)
    // TODO: Implement edit functionality
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Knowledge Base Management</h2>
          <p className="text-agentos-body">Organize and manage knowledge bases for your agents</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleUploadDocument}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Documents
          </Button>
          <Button variant="primary" onClick={handleCreateKnowledgeBase}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Knowledge Base
          </Button>
        </div>
      </div>

      {/* Knowledge Base Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {knowledgeBases.map((kb) => (
          <div key={kb.id} className="agentos-card hover-agentos-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getKnowledgeBaseIcon(kb.type)}</span>
                <div>
                  <h3 className="text-agentos-title">{kb.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    kb.status === 'active' 
                      ? 'bg-accent-green/20 text-accent-green'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {kb.status.charAt(0).toUpperCase() + kb.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-agentos-body text-sm mb-4">{kb.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-agentos-caption">Documents</p>
                <p className="text-text-primary font-semibold">{kb.documents}</p>
              </div>
              <div>
                <p className="text-agentos-caption">Size</p>
                <p className="text-text-primary font-semibold">{kb.size}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-agentos-caption mb-2">Connected Agents</p>
              {kb.agents.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {kb.agents.map((agent, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-800 text-text-secondary text-xs rounded border border-border-light"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs">No agents connected</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                View
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                className="flex-1"
                onClick={() => handleEditKnowledgeBase(kb.id)}
              >
                Manage
              </Button>
            </div>

            <p className="text-agentos-caption mt-3">
              Updated: {new Date(kb.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        ))}

        {/* Create New Knowledge Base Card */}
        <div 
          onClick={handleCreateKnowledgeBase}
          className="agentos-card border-dashed border-2 border-border-light hover-agentos-card cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
            <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="text-agentos-subtitle mb-2">Create Knowledge Base</h3>
            <p className="text-agentos-caption">
              Add a new knowledge base for your agents
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="agentos-card">
          <h3 className="text-agentos-title mb-4">Recent Documents</h3>
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-agentos">
                <span className="text-lg">{getFileIcon(doc.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{doc.name}</p>
                  <p className="text-xs text-text-secondary">
                    {doc.knowledgeBase} • {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="agentos-card">
          <h3 className="text-agentos-title mb-4">Usage Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Total Documents</span>
              <span className="text-text-primary font-semibold">153</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Storage Used</span>
              <span className="text-text-primary font-semibold">51.7 MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Active Knowledge Bases</span>
              <span className="text-text-primary font-semibold">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Connected Agents</span>
              <span className="text-text-primary font-semibold">4</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-light">
            <h4 className="text-sm font-semibold text-text-primary mb-3">Most Active Knowledge Bases</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Real Estate Regulations</span>
                <span className="text-accent-green">45 queries</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Market Data</span>
                <span className="text-accent-green">32 queries</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Company Policies</span>
                <span className="text-accent-green">28 queries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeBasePage 