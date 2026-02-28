'use client';

// Email Verification Page for CodeLearn Platform
// Task 3.9: Email verification flow

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/signup');
    }
  }, [email, router]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];

    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }

    setCode(newCode);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Verification failed');
      }

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to resend code');
      }

      setResendCooldown(60); // 1 minute cooldown
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b14] p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
              <span className="text-lg font-bold text-white">CL</span>
            </div>
            <span className="text-xl font-bold text-white">CodeLearn</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#13141f] p-8">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20">
              <span className="material-symbols-outlined text-3xl text-purple-400">mail</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Verify your email</h1>
            <p className="text-slate-400 text-sm">
              We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                <p className="text-sm text-green-400">
                  Email verified successfully! Redirecting to login...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Verification Code Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3 text-center">
              Enter verification code
            </label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-semibold rounded-lg border border-slate-700 bg-slate-900/50 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-colors"
                  disabled={isLoading || success}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || success || code.some((digit) => !digit)}
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-2">Didn&apos;t receive the code?</p>
            <button
              onClick={handleResendCode}
              disabled={isLoading || resendCooldown > 0 || success}
              className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Resend verification code'}
            </button>
          </div>

          {/* Back to Signup */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <Link
              href="/signup"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Back to signup
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Having trouble? Contact{' '}
          <a href="mailto:support@codelearn.com" className="text-purple-400 hover:text-purple-300">
            support@codelearn.com
          </a>
        </p>
      </div>
    </div>
  );
}
