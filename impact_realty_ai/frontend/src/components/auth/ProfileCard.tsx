"use client";
import { useState, useTransition } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { User } from '@supabase/supabase-js';

interface ProfileCardProps {
  user: User;
  profile: {
    username?: string;
    full_name?: string | null;
    avatar_url?: string | null;
    website?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  } | null;
}

export default function ProfileCard({ user, profile }: ProfileCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // First check if username is taken (if it changed)
      if (username !== profile?.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .single();
          
        if (existingUser) {
          setError('Username already taken');
          setLoading(false);
          return;
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          username, 
          full_name: fullName,
          website,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (updateError) {
        setError(updateError.message);
        return;
      }
      
      setIsEditing(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      startTransition(() => {
        router.refresh();
        router.push('/');
      });
    } catch (err) {
      setError('Error signing out');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-background/90 shadow-card px-6 py-8 border border-muted flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-center">Your Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-muted hover:bg-background border border-muted-foreground text-foreground transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => {
              setIsEditing(false);
              setUsername(profile?.username || '');
              setFullName(profile?.full_name || '');
              setWebsite(profile?.website || '');
              setError(null);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-muted hover:bg-background border border-muted-foreground text-foreground transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
      
      <div className="mb-3 text-center text-muted-foreground text-sm">
        Logged in as <span className="font-semibold text-primary">{user.email}</span>
      </div>

      {!isEditing ? (
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
            <div className="px-4 py-2 bg-muted rounded-lg border border-muted-foreground/20">
              {profile?.username || 'Not set'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
            <div className="px-4 py-2 bg-muted rounded-lg border border-muted-foreground/20">
              {profile?.full_name || 'Not set'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Website</label>
            <div className="px-4 py-2 bg-muted rounded-lg border border-muted-foreground/20">
              {profile?.website || 'Not set'}
            </div>
          </div>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleUpdateProfile} autoComplete="off">
          <label className="flex flex-col gap-2">
            <span className="font-medium text-foreground">Username</span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              minLength={3}
              maxLength={20}
              required
              className="input input-bordered rounded-lg px-4 py-2 bg-muted border border-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="username"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-medium text-foreground">Full Name</span>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              maxLength={40}
              className="input input-bordered rounded-lg px-4 py-2 bg-muted border border-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Full name (optional)"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-medium text-foreground">Website</span>
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              maxLength={128}
              className="input input-bordered rounded-lg px-4 py-2 bg-muted border border-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://yourwebsite.com (optional)"
            />
          </label>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button
            className="bg-primary hover:bg-secondary text-primary-foreground font-semibold rounded-lg px-4 py-2 mt-2 shadow-card transition-all duration-150 disabled:opacity-70"
            type="submit"
            disabled={loading || isPending}
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      )}

      <button
        className="bg-muted hover:bg-background border border-muted-foreground text-foreground font-semibold rounded-lg px-4 py-2 mt-2 shadow-card transition-all duration-150 disabled:opacity-70"
        onClick={handleLogout}
        disabled={loading || isPending}
      >
        {loading ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  );
}
