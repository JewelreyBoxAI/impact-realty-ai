"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      if (!password || !confirmPassword) {
        setError('All fields are required.');
        setLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });
      
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      
      setSuccess('Your password has been updated successfully.');
      setLoading(false);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'An error occurred.');
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="font-heading text-2xl font-bold text-center mb-4 text-primary">
        Update your password
      </h2>
      <form
        onSubmit={handleUpdatePassword}
        className="space-y-6 animate-fade-in"
        autoComplete="off"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              New Password
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
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? <LoadingSpinner size={20} /> : 'Update Password'}
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
      <div className="flex justify-center mt-4 text-sm">
        <Link href="/auth/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </>
  );
} 