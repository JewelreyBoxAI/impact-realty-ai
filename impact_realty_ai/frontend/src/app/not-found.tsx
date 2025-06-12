import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="max-w-md text-center">
        <h2 className="font-heading text-3xl font-bold mb-4 text-primary">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
} 