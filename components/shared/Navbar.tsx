'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
    tier: 'free' | 'pro' | 'team';
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Cmd+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        document.getElementById('navbar-search')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-16 border-b border-[#1F2937] bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button className="md:hidden text-gray-400 hover:text-white mr-4">
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors material-symbols-outlined text-[20px]">
            search
          </span>
          <input
            id="navbar-search"
            className="w-full bg-[#1E293B] border border-[#334155] text-sm text-gray-200 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-500"
            placeholder="Search projects, templates, or docs (Cmd+K)"
            type="text"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-[#334155] rounded border border-gray-600">
              ⌘
            </kbd>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-[#334155] rounded border border-gray-600">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4 ml-6">
        {/* Notifications bell */}
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0F172A]"></span>
        </button>

        <div className="h-6 w-px bg-[#334155]"></div>

        {/* Upgrade button for free tier users */}
        {user && user.tier === 'free' && (
          <Link
            href="/pricing"
            className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            <span className="hidden sm:inline">Upgrade to Pro</span>
          </Link>
        )}

        {/* User avatar dropdown */}
        {user && (
          <div className="relative group">
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full bg-gray-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {/* Dropdown menu (hidden by default, shown on hover) */}
            <div className="absolute right-0 mt-2 w-48 bg-[#1E293B] border border-[#334155] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="p-3 border-b border-[#334155]">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{user.tier} Plan</p>
              </div>
              <div className="py-1">
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Settings
                </Link>
                <Link
                  href="/api/auth/logout"
                  className="block px-3 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors"
                >
                  Logout
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Login/Signup for non-authenticated users */}
        {!user && (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white hidden sm:block"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
            >
              Start Learning Free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
