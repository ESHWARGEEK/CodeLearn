'use client';

// Signup Page for CodeLearn Platform - New Dark Design

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Hero Content */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0b14] flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
            <span className="text-lg font-bold text-white">CL</span>
          </div>
          <span className="text-xl font-bold text-white">CodeLearn</span>
        </div>

        {/* Main Content */}
        <div className="max-w-md">
          <div className="mb-6 inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400 border border-purple-500/20">
            AI-Powered Learning
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">
            Build real projects,
            <br />
            faster than ever.
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Join thousands of developers using CodeLearn to master new skills through AI-guided
            projects and smart templates.
          </p>

          {/* Testimonial */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">
                  ★
                </span>
              ))}
            </div>
            <p className="text-slate-300 mb-4">
              &quot;CodeLearn accelerated my learning curve by months. The AI pair programming
              features are simply mind-blowing.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                SJ
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sarah Jenkins</p>
                <p className="text-xs text-slate-400">Frontend Engineer at TechFlow</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-slate-500">© 2024 CodeLearn. All rights reserved.</div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center bg-[#13141f] p-6 sm:p-12">
        {/* Mobile Header */}
        <div className="lg:hidden mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
              <span className="text-lg font-bold text-white">CL</span>
            </div>
            <span className="text-xl font-bold text-white">CodeLearn</span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">Create your account</h1>
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors lg:hidden"
              >
                Log In
              </Link>
            </div>
            <p className="text-slate-400">
              Start your journey with a 14-day free trial. No credit card required.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-xl">
                  person
                </span>
                <input
                  {...register('name')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 text-white pl-12 pr-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-colors placeholder:text-slate-600"
                  id="name"
                  placeholder="Jane Doe"
                  type="text"
                  disabled={isLoading}
                />
              </div>
              {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name.message}</p>}
            </div>

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
                  placeholder="jane@example.com"
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
                  placeholder="Create a strong password"
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
              <p className="mt-1.5 text-xs text-slate-500">Must be at least 8 characters long.</p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                {...register('acceptTerms')}
                type="checkbox"
                id="acceptTerms"
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900/50 text-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0"
                disabled={isLoading}
              />
              <label htmlFor="acceptTerms" className="text-sm text-slate-400">
                I agree to the{' '}
                <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-400">{errors.acceptTerms.message}</p>
            )}

            {/* Submit Button */}
            <button
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Join the Community'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
