import Link from 'next/link';
import Image from 'next/image';
import { ContentItem } from '@/types/content';
import { useUserActionsContext } from '@/features/userActions/UserActionsContext';
import { useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ContentListWithSelect({ items }: { items: ContentItem[] }) {
  const {
    selectedIds,
    loading: actionsLoading,
    error: actionsError,
    selectItem,
    deselectItem,
    isSelected
  } = useUserActionsContext();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleToggle = async (item: ContentItem) => {
    setPendingId(item.id);
    try {
      if (!isSelected(item)) {
        await selectItem(item);
        setNotif({ type: 'success', message: 'Feature added to your selection!' });
      } else {
        await deselectItem(item);
        setNotif({ type: 'success', message: 'Feature removed from your selection.' });
      }
    } catch (e: any) {
      setNotif({ type: 'error', message: e?.message || 'Operation failed.' });
    } finally {
      setPendingId(null);
      setTimeout(() => setNotif(null), 1800);
    }
  };

  return (
    <section>
      <h2 className="text-3xl font-heading font-bold text-foreground mb-8 mt-4 animate-fade-in" id="features">
        Explore Our Solutions
      </h2>
      {notif && (
        <div className={`mb-5 text-center rounded-lg px-4 py-3 font-semibold animate-fade-in ${notif.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{notif.message}</div>
      )}
      {actionsError && (
        <div className="mb-5 text-center bg-error/10 text-error px-4 py-3 rounded animate-fade-in">{actionsError}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {items.map((item) => {
          const selected = isSelected(item);
          const pending = pendingId === item.id || actionsLoading;
          return (
            <div
              key={item.id}
              className={
                `relative group rounded-2xl shadow-glass bg-card transition-transform hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col min-h-[340px] border-2 ` +
                (selected ? 'border-accent' : 'border-transparent')
              }
            >
              <Link
                href={`/content/${item.id}`}
                className="relative w-full h-48 block"
                tabIndex={-1}
              >
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-200"
                  priority={false}
                />
                {selected && (
                  <span className="absolute top-3 right-3 bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold shadow-glass z-10 animate-fade-in">
                    Selected
                  </span>
                )}
              </Link>
              <div className="flex flex-col flex-1 p-5">
                <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-base mb-4 flex-1">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 rounded bg-muted text-xs font-medium text-accent">
                    {item.category}
                  </span>
                  {Object.entries(item.attributes).map(([key, value]) => (
                    <span key={key} className="px-2 py-1 rounded bg-muted text-xs font-medium text-primary">
                      {key}: {value}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    className={
                      `px-4 py-2 rounded-lg font-semibold shadow transition-colors duration-200 flex items-center gap-2 ` +
                      (selected
                        ? 'bg-accent text-white hover:bg-secondary'
                        : 'bg-muted text-primary border border-primary/20 hover:bg-card')
                    }
                    onClick={() => handleToggle(item)}
                    disabled={pending}
                  >
                    {pending ? <LoadingSpinner size={18} /> : selected ? 'Remove' : 'Add'}
                  </button>
                  <Link
                    href={`/content/${item.id}`}
                    className="ml-auto text-primary font-medium hover:underline text-sm"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
