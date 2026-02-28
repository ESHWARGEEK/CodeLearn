'use client';

// Signup Page for CodeLearn Platform
// Task 3.3: Build signup page with validation
// Uses exact HTML template from AWS_project/design.md

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema with password requirements
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms of Service',
  }),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await signup(data.email, data.password, data.name, data.acceptTerms);
      // Redirect handled by auth context
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = (provider: 'github' | 'google') => {
    try {
      // Validate required environment variables
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

      if (!cognitoDomain || !clientId) {
        setError('OAuth configuration is missing. Please contact support.');
        console.error('Missing OAuth environment variables:', {
          cognitoDomain: !!cognitoDomain,
          clientId: !!clientId,
        });
        return;
      }

      // Generate cryptographically strong random state for CSRF protection
      const stateArray = new Uint8Array(32);
      if (typeof window !== 'undefined' && window.crypto) {
        crypto.getRandomValues(stateArray);
      }
      const state = Array.from(stateArray, (byte) => byte.toString(16).padStart(2, '0')).join('');

      // Store state in sessionStorage (more secure than localStorage for temporary data)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('oauth_state', state);
        sessionStorage.setItem('oauth_state_timestamp', Date.now().toString());
      }

      const redirectUri = `${window.location.origin}/api/auth/callback/${provider}`;

      const authUrl =
        `https://${cognitoDomain}/oauth2/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `scope=email+openid+profile&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `identity_provider=${provider === 'github' ? 'GitHub' : 'Google'}`;

      window.location.href = authUrl;
    } catch (err) {
      console.error('OAuth initialization error:', err);
      setError('Failed to initialize OAuth signup. Please try again.');
    }
  };

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#443267] px-6 py-4 md:px-10">
        <div className="flex items-center gap-4 text-slate-900 dark:text-white">
          <div className="size-8 text-[#5b13ec]">
            <span className="material-symbols-outlined text-3xl">terminal</span>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">CodeLearn</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm font-medium text-slate-500 dark:text-[#a492c9]">
            Already have an account?
          </span>
          <Link
            href="/login"
            className="flex items-center justify-center rounded-lg px-4 py-2 border border-slate-300 dark:border-[#443267] hover:bg-slate-100 dark:hover:bg-[#2f2348] transition-colors text-slate-900 dark:text-white text-sm font-bold"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row h-full">
        {/* Left Side - Hero Section (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 lg:w-5/12 relative flex-col justify-between p-10 lg:p-16 overflow-hidden bg-[#2f2348]/50">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#5b13ec]/20 via-[#171122] to-[#171122]"></div>
          </div>
          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="mb-10">
              <span className="inline-flex items-center rounded-full bg-[#5b13ec]/10 px-3 py-1 text-sm font-medium text-[#5b13ec] ring-1 ring-inset ring-[#5b13ec]/20 mb-6">
                AI-Powered Learning
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
                Build real projects,
                <br /> faster than ever.
              </h1>
              <p className="text-lg text-[#a492c9] max-w-md">
                Join thousands of developers using CodeLearn to master new skills through AI-guided
                projects and smart templates.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-16 bg-[#f6f6f8] dark:bg-[#171122]">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-[#a492c9]">
                Start your journey with a 14-day free trial. No credit card required.
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleOAuthSignup('google')}
                className="flex items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-[#443267] bg-white dark:bg-[#221933] px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-[#2f2348]"
                type="button"
                disabled={isLoading}
              >
                Google
              </button>
              <button
                onClick={() => handleOAuthSignup('github')}
                className="flex items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-[#443267] bg-white dark:bg-[#221933] px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-[#2f2348]"
                type="button"
                disabled={isLoading}
              >
                GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-[#443267]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#f6f6f8] dark:bg-[#171122] px-2 text-xs uppercase text-slate-500 dark:text-[#a492c9]">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <div>
                <label
                  className="block text-sm font-medium leading-6 text-slate-900 dark:text-white"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-[#a492c9] text-[20px]">
                      person
                    </span>
                  </div>
                  <input
                    {...register('name')}
                    className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-[#443267] focus:ring-2 focus:ring-[#5b13ec] bg-white dark:bg-[#221933] sm:text-sm"
                    id="name"
                    placeholder="Jane Doe"
                    type="text"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  className="block text-sm font-medium leading-6 text-slate-900 dark:text-white"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-[#a492c9] text-[20px]">
                      mail
                    </span>
                  </div>
                  <input
                    {...register('email')}
                    className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-[#443267] focus:ring-2 focus:ring-[#5b13ec] bg-white dark:bg-[#221933] sm:text-sm"
                    id="email"
                    placeholder="jane@example.com"
                    type="email"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  className="block text-sm font-medium leading-6 text-slate-900 dark:text-white"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-[#a492c9] text-[20px]">
                      lock
                    </span>
                  </div>
                  <input
                    {...register('password')}
                    className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-[#443267] focus:ring-2 focus:ring-[#5b13ec] bg-white dark:bg-[#221933] sm:text-sm"
                    id="password"
                    placeholder="Create a strong password"
                    type="password"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-2 text-xs text-[#a492c9]">
                  Must be at least 8 characters with uppercase, lowercase, and number.
                </p>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    {...register('acceptTerms')}
                    className="h-4 w-4 rounded border-slate-300 dark:border-[#443267] bg-white dark:bg-[#221933] text-[#5b13ec] focus:ring-[#5b13ec]"
                    id="terms"
                    type="checkbox"
                    disabled={isLoading}
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label className="font-medium text-slate-700 dark:text-slate-300" htmlFor="terms">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="font-semibold text-[#5b13ec] hover:text-[#4a0bc2]"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="font-semibold text-[#5b13ec] hover:text-[#4a0bc2]"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.acceptTerms.message}
                </p>
              )}

              {/* Submit Button */}
              <button
                className="flex w-full justify-center rounded-lg bg-[#5b13ec] px-3 py-3.5 text-sm font-bold text-white hover:bg-[#4a0bc2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Join the Community'}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-500">
              © {new Date().getFullYear()} CodeLearn. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
