'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Authentication error:', error);
  }, [error]);

  return (
    <div className="text-center animate-fade-in">
      <h2 className="font-heading text-2xl font-bold text-error mb-4">Authentication Error</h2>
      <p className="text-muted-foreground mb-6">
        There was a problem with authentication. Please try again or contact support.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/auth/login"
          className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
