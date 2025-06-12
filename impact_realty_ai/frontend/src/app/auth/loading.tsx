import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AuthLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] animate-fade-in">
      <LoadingSpinner size={40} />
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
}
