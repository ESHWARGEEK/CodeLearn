/**
 * Billing Success Page
 * Displays success message after successful subscription purchase
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionData {
  customerEmail: string;
  tier: string;
  amount: number;
}

export default function BillingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    // Fetch session details from Stripe
    const fetchSessionData = async () => {
      try {
        const response = await fetch(`/api/billing/session/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setSessionData({
            customerEmail: data.data.customerEmail,
            tier: data.data.tier,
            amount: data.data.amount,
          });
        } else {
          setError(data.error?.message || 'Failed to verify payment');
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h1 className="text-lg font-semibold text-red-800 mb-2">
              Payment Error
            </h1>
            <p className="text-red-600 mb-4">
              {error || 'Unable to verify your payment. Please contact support.'}
            </p>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to CodeLearn Pro!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your subscription has been activated successfully.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium capitalize">{sessionData.tier}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">${sessionData.amount.toFixed(2)}/month</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-medium">{sessionData.customerEmail}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-green-900 mb-2">
              What&apos;s included in your {sessionData.tier} plan:
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              {sessionData.tier === 'pro' ? (
                <>
                  <li>• Unlimited template integrations</li>
                  <li>• Priority AI processing</li>
                  <li>• Advanced code analysis</li>
                  <li>• Email support</li>
                  <li>• Private repositories</li>
                </>
              ) : (
                <>
                  <li>• Everything in Pro</li>
                  <li>• Team collaboration</li>
                  <li>• Shared template library</li>
                  <li>• Admin dashboard</li>
                  <li>• Priority support</li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
            
            <Button 
              onClick={() => router.push('/developer')} 
              variant="outline" 
              className="w-full"
            >
              Start Using Developer Mode
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            You can manage your subscription anytime from your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}