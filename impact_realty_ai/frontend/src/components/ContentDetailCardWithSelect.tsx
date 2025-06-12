"use client";

import Image from 'next/image';
import { ContentItem } from '@/types/content';
import { useUserActionsContext } from '@/features/userActions/UserActionsContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ContentDetailCardWithSelect({ item }: { item: ContentItem }) {
  const {
    isSelected,
    selectItem,
    deselectItem,
    loading: actionsLoading,
    error: actionsError,
    selectedIds
  } = useUserActionsContext();
  const [pending, setPending] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  // Track local selection state
  const [isItemSelected, setIsItemSelected] = useState(false);
  
  // Update local state when selectedIds changes
  useEffect(() => {
    setIsItemSelected(isSelected(item));
    console.log('ContentDetailCard: selectedIds changed', Array.from(selectedIds), 'item selected:', isSelected(item));
  }, [isSelected, item, selectedIds]);

  const handleToggle = async () => {
    setPending(true);
    try {
      if (!isItemSelected) {
        await selectItem(item);
        setNotif({ type: 'success', message: 'Added to your list!' });
      } else {
        await deselectItem(item);
        setNotif({ type: 'success', message: 'Removed from your list.' });
      }
    } catch (err: any) {
      setNotif({ type: 'error', message: err?.message || 'Failed to update.' });
    } finally {
      setPending(false);
      setTimeout(() => setNotif(null), 3000);
    }
  };

  // Features and best-for sections
  const features = ['Advanced analytics dashboard', 'Real-time data processing', 'Custom reporting'];
  const bestFor = ['Business Intelligence teams', 'Data-driven organizations', 'Enterprise solutions'];

  return (
    <div className="w-full rounded-2xl shadow-glass bg-card flex flex-col md:flex-row overflow-hidden min-h-[400px]">
      <div className="relative w-full h-60 md:h-auto md:w-2/5 flex-shrink-0">
        <Image
          src={item.image_url}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
          priority
        />
      </div>
      <div className="flex-1 p-6 md:p-8 flex flex-col">
        {notif && (
          <div className={`mb-4 rounded-lg px-4 py-3 font-semibold text-sm animate-fade-in ${notif.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
            {notif.message}
          </div>
        )}
        <div className="flex justify-between items-start mb-4">
          <h1 className="font-heading text-3xl font-bold text-foreground">{item.title}</h1>
          {isItemSelected && (
            <span className="bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold shadow-glass">
              Selected
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-base mb-6">{item.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-2 py-1 rounded bg-muted text-xs font-medium text-accent">
            {item.category}
          </span>
          {Object.entries(item.attributes).map(([key, value]) => (
            <span key={key} className="px-2 py-1 rounded bg-muted text-xs font-medium text-primary">
              {key}: {value}
            </span>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">Key Features</h3>
            <ul className="list-disc list-inside text-sm text-foreground space-y-1">
              {features.map((feature: string, i: number) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">Best For</h3>
            <ul className="list-disc list-inside text-sm text-foreground space-y-1">
              {bestFor.map((use: string, i: number) => (
                <li key={i}>{use}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex gap-2 mt-auto">
          <button
            className={
              `px-6 py-2 rounded-lg font-semibold shadow transition-colors duration-200 flex items-center gap-2 ` +
              (isItemSelected
                ? 'bg-accent text-white hover:bg-secondary'
                : 'bg-muted text-primary border border-primary/20 hover:bg-card')
            }
            onClick={handleToggle}
            disabled={pending || actionsLoading}
          >
            {pending || actionsLoading ? <LoadingSpinner size={20} /> : isItemSelected ? 'Remove' : 'Add to My Features'}
          </button>
          <button
            className="px-6 py-2 bg-muted text-primary font-semibold rounded-lg shadow hover:bg-card border border-primary/20 transition duration-200"
            onClick={() => router.push('/')}
            type="button"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}
