import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your profile.'
};

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  // Check authentication on layout level
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth');
  }
  
  return (
    <section className="flex flex-col min-h-[80vh] items-center justify-center py-10">
      <div className="w-full max-w-xl rounded-xl shadow-glass bg-card px-8 py-10 animate-fade-in">
        {children}
      </div>
    </section>
  );
}
