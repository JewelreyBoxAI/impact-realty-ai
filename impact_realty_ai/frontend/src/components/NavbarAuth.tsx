"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function NavbarAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let ignore = false;
    async function getUser() {
      setLoading(true);
      try {
        const currentUser = await api.getCurrentUser();
        if (!ignore) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        if (!ignore) {
          setUser(null);
          setLoading(false);
        }
      }
    }
    getUser();
    
    return () => {
      ignore = true;
    };
  }, []);
  
  return user ? (
    <Link 
      href="/profile" 
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-semibold shadow-glass hover:bg-primary transition-colors duration-200 ml-2"
    >
      <UserCircleIcon className="w-5 h-5" />
      My Profile
    </Link>
  ) : (
    <Link 
      href="/auth" 
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white font-semibold shadow-glass hover:bg-primary transition-colors duration-200 ml-2"
    >
      Sign In
    </Link>
  );
}
