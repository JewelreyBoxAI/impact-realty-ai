"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  redirectPath?: string;
}

export default function AuthForm({ mode, redirectPath = '/profile' }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!email || !password || (mode === 'signup' && !username)) {
        setError('All fields are required.');
        setLoading(false);
        return;
      }
      if (mode === 'signup') {
        // Sign up with email/password
        const {
          data: { user, session },
          error: signUpError
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }
          }
        });
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }
        if (user) {
          // Create profile row
          await supabase.from('profiles').upsert({
            id: user.id,
            username
          });
        }
        setSuccess('Check your email to confirm your account.');
        setLoading(false);
        setTimeout(() => {
          router.push(redirectPath);
        }, 1200);
      } else {
        // Sign in
        const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }
        setSuccess('Signed in successfully!');
        setLoading(false);
        setTimeout(() => {
          router.push(redirectPath);
        }, 800);
      }
    } catch (e: any) {
      setError(e?.message || 'An error occurred.');
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-fade-in"
      autoComplete="off"
    >
      <h2 className="font-heading text-2xl font-bold text-center mb-2 text-primary">
        {mode === 'signup' ? 'Create your account' : 'Sign in to SaaSify'}
      </h2>
      <div className="flex flex-col gap-4 mt-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input input-bordered w-full px-4 py-2 rounded-lg bg-input border-border focus:ring-primary focus:outline-none text-foreground"
              minLength={3}
              maxLength={32}
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered w-full px-4 py-2 rounded-lg bg-input border-border focus:ring-primary focus:outline-none text-foreground"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered w-full px-4 py-2 rounded-lg bg-input border-border focus:ring-primary focus:outline-none text-foreground"
            minLength={6}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className={clsx(
            'w-full py-2 px-4 rounded-lg bg-primary text-white font-semibold shadow hover:bg-secondary transition-colors duration-200',
            loading && 'opacity-70 cursor-not-allowed'
          )}
          disabled={loading}
        >
          {loading ? <LoadingSpinner size={20} /> : mode === 'signup' ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
      <div className="flex mt-2 items-center justify-between">
        {mode === 'signin' && (
          <a
            href="/auth/reset"
            className="text-xs text-primary hover:underline font-medium"
          >
            Forgot password?
          </a>
        )}
      </div>
      {error && (
        <div className="mt-3 text-error bg-error/10 rounded px-3 py-2 text-sm text-center animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 text-success bg-success/10 rounded px-3 py-2 text-sm text-center animate-fade-in">
          {success}
        </div>
      )}
    </form>
  );
}
