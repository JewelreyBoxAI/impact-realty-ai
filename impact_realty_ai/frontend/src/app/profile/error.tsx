'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Profile error:', error);
  }, [error]);

  return (
    <div className="text-center flex flex-col items-center gap-4 mt-8 animate-fade-in">
      <h2 className="text-xl font-bold text-error">Something went wrong!</h2>
      <p className="text-muted-foreground">Failed to load your profile data.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
