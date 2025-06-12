'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold text-error mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. Please try again or contact support if the problem persists.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <Link 
            href="/"
            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 