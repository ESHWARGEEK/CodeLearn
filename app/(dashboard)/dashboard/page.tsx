'use client';

// Dashboard Page for CodeLearn Platform
// Temporary placeholder until Task 4 is implemented

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5b13ec] border-r-transparent"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Simple Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#5b13ec] text-3xl">terminal</span>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                CodeLearn
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            You&apos;ve successfully logged in to CodeLearn.
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Your Account
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">mail</span>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                <p className="text-slate-900 dark:text-white">{user?.email || 'Not available'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">badge</span>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">User ID</p>
                <p className="text-slate-900 dark:text-white font-mono text-sm">
                  {user?.userId || 'Not available'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">workspace_premium</span>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tier</p>
                <p className="text-slate-900 dark:text-white capitalize">{user?.tier || 'free'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Learning Mode Card */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#5b13ec] text-3xl">school</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Learning Mode</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Master coding with AI-curated projects and real-time mentorship.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>Coming in Task 4</span>
            </div>
          </div>

          {/* Developer Mode Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">
                code
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Developer Mode</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Extract and integrate code templates with AI-powered assistance.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>Coming in Task 14</span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Authentication Complete! ✅
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Task 3 (Authentication System) is complete. The full dashboard with Learning Mode
                and Developer Mode will be implemented in upcoming tasks.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
