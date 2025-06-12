import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen animate-fade-in">
      <LoadingSpinner size={50} />
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
} 