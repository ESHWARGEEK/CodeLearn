'use client';

// Forgot Password Page - Simplified
// For now, just redirect to login with a message

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b14] p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
              <span className="text-xl font-bold text-white">CL</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Password Reset
          </h1>
          <p className="text-gray-400 text-center mb-6">
            Password reset is currently unavailable
          </p>

          <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-300 mb-3">
              For security reasons, password reset functionality is temporarily disabled.
            </p>
            <p className="text-sm text-gray-400">
              Please contact support if you need to reset your password, or create a new account.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
            >
              Back to Login
            </Link>
            
            <Link
              href="/signup"
              className="block w-full bg-[#334155] hover:bg-[#475569] text-white text-center py-3 rounded-lg font-medium transition-colors"
            >
              Create New Account
            </Link>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Need help? Contact support@codelearn.com
          </p>
        </div>
      </div>
    </div>
  );
}
