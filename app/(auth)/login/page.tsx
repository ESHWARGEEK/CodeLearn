'use client';

// Login Page for CodeLearn Platform - New Dark Design
// Modern split-screen layout with code background

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginContent() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(verified === 'true');

  // Hide verified message after 5 seconds
  useEffect(() => {
    if (showVerifiedMessage) {
      const timer = setTimeout(() => setShowVerifiedMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showVerifiedMessage]);

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
      console.log('Attempting login...');
      await login(data.email, data.password);
      console.log('Login successful, should redirect to dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'github' | 'google') => {
    try {
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

      if (!cognitoDomain || !clientId) {
        setError('OAuth configuration is missing. Please contact support.');
        return;
      }

      const stateArray = new Uint8Array(32);
      if (typeof window !== 'undefined' && window.crypto) {
        crypto.getRandomValues(stateArray);
      }
      const state = Array.from(stateArray, (byte) => byte.toString(16).padStart(2, '0')).join('');

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
      setError('Failed to initialize OAuth login. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Code Background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0b14] items-center justify-center p-12 overflow-hidden">
        {/* Code Background Effect */}
        <div className="absolute inset-0 opacity-20">
          <pre className="text-xs text-purple-400 leading-relaxed">
            {`function buildProject() {
  const skills = learnByDoing();
  const mentor = getAIGuidance();
  
  while (!mastered) {
    code();
    mentor.help();
    deploy();
  }
  
  return success;
}`}
          </pre>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600">
            <span className="material-symbols-outlined text-white text-4xl">terminal</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Master Coding with AI</h2>
          <p className="text-lg text-slate-400">
            Build real projects, accelerate your learning curve, and join a community of future
            developers.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center bg-[#13141f] p-6 sm:p-12">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Log in to continue your journey with CodeLearn.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-xl">
                  mail
                </span>
                <input
                  {...register('email')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 text-white pl-12 pr-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-colors placeholder:text-slate-600"
                  id="email"
                  placeholder="you@example.com"
                  type="email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-xl">
                  lock
                </span>
                <input
                  {...register('password')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 text-white pl-12 pr-12 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-colors placeholder:text-slate-600"
                  id="password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 material-symbols-outlined text-xl"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#13141f] px-4 text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 hover:bg-slate-800 py-3 text-sm font-medium text-slate-300 transition-colors"
              type="button"
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              onClick={() => handleOAuthLogin('github')}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 hover:bg-slate-800 py-3 text-sm font-medium text-slate-300 transition-colors"
              type="button"
              disabled={isLoading}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
