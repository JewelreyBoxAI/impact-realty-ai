"use client";

import { useState, useRef, useEffect } from 'react';
import { useUserActionsContext } from '@/features/userActions/UserActionsContext';
import { mockContent } from '@/utils/mockContent';
import Image from 'next/image';
import Link from 'next/link';
import { BookmarkIcon } from './icons/BookmarkIcon';

export default function BookmarkedItems() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { selectedIds, loading } = useUserActionsContext();
  const [items, setItems] = useState<typeof mockContent>([]);

  // Update items when selectedIds changes
  useEffect(() => {
    const filteredItems = mockContent.filter(item => selectedIds.has(item.id));
    setItems(filteredItems);
    console.log('BookmarkedItems: selectedIds changed', Array.from(selectedIds), 'filtered items:', filteredItems.length);
  }, [selectedIds]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-accent hover:bg-accent/10 transition-colors duration-200 relative"
      >
        <BookmarkIcon className="w-5 h-5" filled={items.length > 0} />
        <span className="hidden sm:inline">My List</span>
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-card rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-border">
            <h3 className="font-semibold text-foreground">My Bookmarked Items</h3>
          </div>
          
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No items bookmarked yet
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {items.map(item => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 