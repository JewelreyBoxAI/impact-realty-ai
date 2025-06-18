"use client"

import React, { useState, useRef } from 'react'

interface KnowledgeFile {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
  status: 'processing' | 'completed' | 'error'
  chunks?: number
  embeddings?: number
  progress?: number
}

const KnowledgeForge: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<KnowledgeFile[]>([
    {
      id: 'file-001',
      name: 'FL_Real_Estate_Regulations.pdf',
      type: 'pdf',
      size: '2.3 MB',
      uploadedAt: '2024-01-15T10:30:00Z',
      status: 'completed',
      chunks: 45,
      embeddings: 2048
    },
    {
      id: 'file-002',
      name: 'Company_Handbook.docx',
      type: 'docx',
      size: '1.1 MB',
      uploadedAt: '2024-01-14T14:20:00Z',
      status: 'completed',
      chunks: 23,
      embeddings: 1024
    },
    {
      id: 'file-003',
      name: 'Market_Analysis_Q1.xlsx',
      type: 'xlsx',
      size: '856 KB',
      uploadedAt: '2024-01-13T09:15:00Z',
      status: 'processing',
      chunks: 0,
      embeddings: 0,
      progress: 65
    }
  ])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFileUpload(droppedFiles)
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFileUpload(selectedFiles)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleFileUpload = async (uploadFiles: File[]) => {
    setIsUploading(true)

    for (const file of uploadFiles) {
      // Validate file type
      const allowedTypes = ['.pdf', '.docx', '.xlsx', '.txt', '.jpg', '.jpeg', '.png']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (!allowedTypes.includes(fileExtension)) {
        console.error(`File type ${fileExtension} not supported`)
        continue
      }

      // Create new file entry
      const newFile: KnowledgeFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: fileExtension.slice(1),
        size: formatFileSize(file.size),
        uploadedAt: new Date().toISOString(),
        status: 'processing',
        progress: 0
      }

      // Add to files list
      setFiles(prev => [...prev, newFile])

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileId', newFile.id)

        // Simulate upload progress
        let progress = 0
        const progressInterval = setInterval(() => {
          progress += Math.random() * 20
          if (progress > 90) progress = 90
          
          setFiles(prev => prev.map(f => 
            f.id === newFile.id ? { ...f, progress } : f
          ))
        }, 500)

        // Mock API call - replace with actual endpoint
        const response = await fetch('/api/upload-knowledge', {
          method: 'POST',
          body: formData
        })

        clearInterval(progressInterval)

        if (response.ok) {
          const result = await response.json()
          
          // Update file status to completed
          setFiles(prev => prev.map(f => 
            f.id === newFile.id 
              ? { 
                  ...f, 
                  status: 'completed',
                  progress: 100,
                  chunks: result.chunks || Math.floor(Math.random() * 50) + 10,
                  embeddings: result.embeddings || Math.floor(Math.random() * 2000) + 500
                }
              : f
          ))
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
        
        // Update file status to error
        setFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? { ...f, status: 'error', progress: 0 }
            : f
        ))
      }
    }

    setIsUploading(false)
  }

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleRetryUpload = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'processing', progress: 0 }
        : f
    ))
    
    // Simulate retry
    setTimeout(() => {
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'completed',
              progress: 100,
              chunks: Math.floor(Math.random() * 50) + 10,
              embeddings: Math.floor(Math.random() * 2000) + 500
            }
          : f
      ))
    }, 2000)
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return '📄'
      case 'docx': return '📝'
      case 'xlsx': return '📊'
      case 'txt': return '📋'
      case 'jpg': case 'jpeg': case 'png': return '🖼️'
      default: return '📁'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-cyan-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Ready'
      case 'processing': return 'Processing...'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  return (
    <div className="agent-panel h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#2A3441]">
          <h2 className="text-xl font-bold font-orbitron text-white mb-2">Knowledge Forge</h2>
          <p className="text-gray-400 text-sm">
            Upload and process documents for agent knowledge
          </p>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
              isDragging 
                ? 'border-cyan-400 bg-cyan-400/10' 
                : 'border-[#2A3441] hover:border-cyan-400/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <div className="text-4xl mb-4">📤</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDragging ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Drag & drop files or click to browse
              <br />
              Supports PDF, DOCX, XLSX, TXT, and images
            </p>
            <button 
              className="agent-button-primary"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.txt,.jpg,.jpeg,.png"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Processing Status */}
        <div className="px-6 pb-4">
          <div className="bg-[#151920] rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-cyan-400">
                  {files.filter(f => f.status === 'completed').length}
                </div>
                <div className="text-xs text-gray-400">Ready</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {files.reduce((acc, f) => acc + (f.chunks || 0), 0)}
                </div>
                <div className="text-xs text-gray-400">Chunks</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {(files.reduce((acc, f) => acc + (f.embeddings || 0), 0) / 1024).toFixed(1)}K
                </div>
                <div className="text-xs text-gray-400">Embeddings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="flex-1 px-6 pb-6 overflow-auto">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Uploaded Files</h3>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-[#151920] border border-[#2A3441] rounded-xl p-4 hover:border-cyan-400/30 transition-all duration-300"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getFileIcon(file.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {file.size} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                    <div className={`text-xs font-medium mt-2 ${getStatusColor(file.status)}`}>
                      {getStatusText(file.status)}
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    {file.status === 'completed' && (
                      <div className="text-xs text-gray-400">
                        <div>{file.chunks} chunks</div>
                        <div>{file.embeddings} embeddings</div>
                      </div>
                    )}
                    {file.status === 'processing' && (
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    )}
                    {file.status === 'error' && (
                      <button
                        onClick={() => handleRetryUpload(file.id)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Progress Bar for Processing */}
                {file.status === 'processing' && file.progress !== undefined && (
                  <div className="mt-3">
                    <div className="w-full bg-[#2A3441] rounded-full h-1.5">
                      <div 
                        className="bg-cyan-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {Math.round(file.progress || 0)}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0">
          <div className="grid grid-cols-2 gap-3">
            <button className="agent-button-secondary text-sm py-2">
              Sync All
            </button>
            <button className="agent-button-secondary text-sm py-2">
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeForge 