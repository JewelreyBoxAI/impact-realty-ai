import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import ProfileCard from '@/components/auth/ProfileCard';

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // The auth check is now handled in the layout component
  // This means session should never be null here, but we'll handle it just in case
  if (!session) {
    return <div>Session not found. Please log in again.</div>;
  }
  
  // Get profile data or null if it doesn't exist yet
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  // Even if profile data doesn't exist, we'll pass null to ProfileCard
  // which now handles null profile data correctly
  return (
    <section className="max-w-lg mx-auto px-4 py-8 min-h-[400px] flex flex-col items-center justify-center">
      <ProfileCard user={session.user} profile={profile} />
    </section>
  );
}
