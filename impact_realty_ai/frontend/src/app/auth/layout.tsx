import type { ReactNode } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | SaaSify',
  description: 'Sign in or sign up for SaaSify.'
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl bg-background/90 shadow-glass px-6 py-8 flex flex-col gap-6 border border-border">
        <Link href="/" className="block text-center font-heading text-2xl font-bold mb-2 text-primary">
          Growith
        </Link>
        {children}
      </div>
    </section>
  );
}
