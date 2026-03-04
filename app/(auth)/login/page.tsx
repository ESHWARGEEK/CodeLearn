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



            {/* Submit Button */}
            <button
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

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
