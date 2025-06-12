import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <LoadingSpinner size={36} />
    </div>
  );
}
