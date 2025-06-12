"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import NavbarAuth from '@/components/NavbarAuth';
import BookmarkedItems from '@/components/BookmarkedItems';
import { api } from '@/lib/api';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Agents', href: '#agents' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function getUser() {
      try {
        const currentUser = await api.getCurrentUser();
        if (!ignore) setUser(currentUser);
      } catch (error) {
        console.error('Error getting user:', error);
        if (!ignore) setUser(null);
      }
    }
    getUser();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 w-full transition-shadow backdrop-blur bg-background/80',
        scrolled ? 'shadow-lg' : 'shadow-none'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-2xl font-heading font-bold text-primary tracking-tight">
          Impact Realty AI
        </Link>
        <ul className="hidden md:flex items-center gap-6 font-medium text-foreground">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="hover:text-primary transition-colors duration-150"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          {user && <BookmarkedItems />}
          <Link
            href="#dashboard"
            className="px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-glass hover:bg-secondary transition-colors duration-200"
          >
            Dashboard
          </Link>
          <NavbarAuth />
        </div>
      </nav>
    </header>
  );
}
