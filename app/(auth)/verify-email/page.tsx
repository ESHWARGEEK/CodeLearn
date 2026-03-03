'use client';

// Email Verification - DISABLED
// Authentication simplified: No email verification required

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    // Email verification is disabled - redirect to login
    router.push('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b14]">
      <div className="text-center">
        <p className="text-gray-400">Redirecting to login...</p>
      </div>
    </div>
  );
}
