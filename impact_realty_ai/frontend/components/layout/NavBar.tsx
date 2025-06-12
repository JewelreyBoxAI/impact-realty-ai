'use client';

import Link from 'next/link';
import { useTheme } from '../ui';

export default function NavBar() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <nav className="bg-surface border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-highlight rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-text">Agentic OS</span>
          </div>
          
          {/* Project Switcher */}
          <div className="flex items-center ml-8">
            <select className="bg-bg border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary">
              <option>Impact Realty AI</option>
              <option>Project Alpha</option>
              <option>Project Beta</option>
            </select>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link 
            href="/" 
            className="text-muted hover:text-text transition-colors duration-200"
          >
            Overview
          </Link>
          <Link 
            href="/agent-builder" 
            className="text-muted hover:text-text transition-colors duration-200"
          >
            Agent Builder
          </Link>
          <Link 
            href="/dashboard" 
            className="text-muted hover:text-text transition-colors duration-200"
          >
            Dashboard
          </Link>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-border transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-5 h-5 text-text" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-text" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">U</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 