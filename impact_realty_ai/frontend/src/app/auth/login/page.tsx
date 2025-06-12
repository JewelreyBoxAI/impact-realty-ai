"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
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
        router.push('/profile');
      }, 800);
    } catch (err: any) {
      setError(err?.message || 'An error occurred.');
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="font-heading text-2xl font-bold text-center mb-4 text-primary">
        Sign in to your account
      </h2>
      <form
        onSubmit={handleLogin}
        className="space-y-6 animate-fade-in"
        autoComplete="off"
      >
        <div className="flex flex-col gap-4">
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full px-4 py-2 rounded-lg bg-input border-border focus:ring-primary focus:outline-none text-foreground"
              minLength={6}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-lg bg-primary text-white font-semibold shadow hover:bg-secondary transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size={20} /> : 'Sign In'}
        </button>
        
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
      <div className="flex justify-between mt-4 text-sm">
        <Link href="/auth/reset" className="text-primary hover:underline">
          Forgot password?
        </Link>
        <Link href="/auth/signup" className="text-primary hover:underline">
          Don't have an account?
        </Link>
      </div>
    </>
  );
} 