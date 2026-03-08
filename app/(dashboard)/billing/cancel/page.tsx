/**
 * Billing Cancel Page
 * Displays message when user cancels subscription purchase
 */

'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Subscription Cancelled
          </h1>
          
          <p className="text-gray-600 mb-6">
            No worries! You can upgrade to a paid plan anytime to unlock unlimited integrations and premium features.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">
              What you&apos;re missing out on:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Unlimited template integrations</li>
              <li>• Priority AI processing</li>
              <li>• Advanced code analysis</li>
              <li>• Premium support</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
            
            <Button 
              onClick={() => router.push('/pricing')} 
              variant="outline" 
              className="w-full"
            >
              View Pricing Plans
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Continue using CodeLearn with our free tier - 5 integrations per month.
          </p>
        </div>
      </div>
    </div>
  );
}