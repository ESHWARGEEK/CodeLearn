'use client';

// Login Page for CodeLearn Platform
// Task 3.2: Build login page with OAuth and email/password
// Uses exact HTML template from AWS_project/design.md

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
      // Redirect handled by auth context
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'github' | 'google') => {
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
      crypto.getRandomValues(stateArray);
      const state = Array.from(stateArray, (byte) => byte.toString(16).padStart(2, '0')).join('');

      // Store state in sessionStorage (more secure than localStorage for temporary data)
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_state_timestamp', Date.now().toString());

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
      setError('Failed to initialize OAuth login. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Hero Section (Hidden on mobile) */}
      <div className="relative hidden lg:flex w-full lg:w-1/2 bg-slate-900 items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070')",
          }}
        ></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-[#161022] via-[#5b13ec]/40 to-transparent mix-blend-multiply"></div>
        <div className="relative z-20 p-12 text-center">
          <div className="mb-6 flex justify-center">
            <span className="material-symbols-outlined text-white text-6xl">terminal</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Master Coding with AI
          </h2>
          <p className="text-slate-200 text-lg max-w-md mx-auto leading-relaxed">
            Build real projects, accelerate your learning curve, and join a community of future
            developers.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center bg-[#f6f6f8] dark:bg-[#161022] p-6 sm:p-12 xl:p-24 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <span className="material-symbols-outlined text-[#5b13ec] text-3xl">terminal</span>
          <span className="text-xl font-bold tracking-tight">CodeLearn</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-10 text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              Log in to continue your journey with CodeLearn.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 dark:text-slate-500 material-symbols-outlined">
                  mail
                </span>
                <input
                  {...register('email')}
                  className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white pl-11 pr-4 py-3 text-base focus:border-[#5b13ec] focus:ring-[#5b13ec] dark:focus:ring-[#5b13ec]/50 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  id="email"
                  placeholder="you@example.com"
                  type="email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="text-sm font-medium text-slate-700 dark:text-slate-200"
                  htmlFor="password"
                >
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 dark:text-slate-500 material-symbols-outlined">
                  lock
                </span>
                <input
                  {...register('password')}
                  className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white pl-11 pr-11 py-3 text-base focus:border-[#5b13ec] focus:ring-[#5b13ec] dark:focus:ring-[#5b13ec]/50 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  id="password"
                  placeholder="Enter your password"
                  type="password"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#5b13ec] hover:text-[#5b13ec]/80 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              className="mt-2 w-full bg-[#5b13ec] hover:bg-[#5b13ec]/90 text-white font-bold py-3.5 px-4 rounded-lg transition-all shadow-lg shadow-[#5b13ec]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#f6f6f8] dark:bg-[#161022] px-2 text-slate-500 dark:text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
              type="button"
              disabled={isLoading}
            >
              Google
            </button>
            <button
              onClick={() => handleOAuthLogin('github')}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
              type="button"
              disabled={isLoading}
            >
              GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-[#5b13ec] hover:text-[#5b13ec]/80 transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
