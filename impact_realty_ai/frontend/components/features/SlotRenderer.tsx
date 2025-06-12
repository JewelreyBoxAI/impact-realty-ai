'use client';

interface SlotRendererProps {
  type: 'input' | 'tools' | 'output';
  label: string;
  isDropTarget?: boolean;
  onDrop?: (item: any) => void;
}

export default function SlotRenderer({ type, label, isDropTarget = false }: SlotRendererProps) {
  const getSlotIcon = (type: string) => {
    switch (type) {
      case 'input':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
        );
      case 'tools':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'output':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSlotColor = (type: string) => {
    switch (type) {
      case 'input':
        return 'text-blue-400 border-blue-400/50';
      case 'tools':
        return 'text-purple-400 border-purple-400/50';
      case 'output':
        return 'text-green-400 border-green-400/50';
      default:
        return 'text-muted border-border';
    }
  };

  return (
    <div className={`
      slot-zone flex items-center space-x-2 p-2 min-h-[32px]
      ${getSlotColor(type)}
      ${isDropTarget ? 'animate-slot-drop' : ''}
    `}>
      <div className="flex-shrink-0">
        {getSlotIcon(type)}
      </div>
      <span className="text-xs font-medium">{label}</span>
      <div className="flex-1 text-right">
        <span className="text-xs text-muted">Empty</span>
      </div>
    </div>
  );
} 