'use client';

import { BoardCanvas, ToolSidebar } from '../../components';

export default function AgentBuilder() {
  return (
    <div className="h-screen flex bg-bg">
      {/* Tool Sidebar */}
      <div className="w-80 bg-surface border-r border-border flex-shrink-0">
        <ToolSidebar />
      </div>
      
      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <BoardCanvas />
      </div>
    </div>
  );
} 