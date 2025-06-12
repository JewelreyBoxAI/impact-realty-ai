"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (!email || !password || !username) {
        setError('All fields are required.');
        setLoading(false);
        return;
      }
      
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
        router.push('/auth/login');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'An error occurred.');
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="font-heading text-2xl font-bold text-center mb-4 text-primary">
        Create your account
      </h2>
      <form
        onSubmit={handleSignup}
        className="space-y-6 animate-fade-in"
        autoComplete="off"
      >
        <div className="flex flex-col gap-4">
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
              autoComplete="new-password"
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
          {loading ? <LoadingSpinner size={20} /> : 'Sign Up'}
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
        <Link href="/auth/login" className="text-primary hover:underline">
          Already have an account?
        </Link>
      </div>
    </>
  );
} 