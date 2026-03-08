/**
 * Subscription Status Component
 * Displays current subscription information and management options
 */

'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';

interface SubscriptionData {
  tier: 'free' | 'pro' | 'team';
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
}

export function SubscriptionStatus() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/billing/subscription', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSubscription(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    setPortalLoading(true);
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = data.data.url;
      } else {
        alert('Failed to open billing portal. Please try again.');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Unable to load subscription information</p>
        </div>
      </div>
    );
  }

  const getTierDisplay = (tier: string) => {
    switch (tier) {
      case 'free':
        return { name: 'Free', color: 'text-gray-600' };
      case 'pro':
        return { name: 'Developer Pro', color: 'text-blue-600' };
      case 'team':
        return { name: 'Team', color: 'text-purple-600' };
      default:
        return { name: 'Unknown', color: 'text-gray-600' };
    }
  };

  const tierDisplay = getTierDisplay(subscription.tier);

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CreditCard className="h-6 w-6 text-gray-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
        </div>
        
        {subscription.tier !== 'free' && (
          <Button
            variant="outline"
            size="sm"
            onClick={openCustomerPortal}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Current Plan</span>
          <span className={`font-medium ${tierDisplay.color}`}>
            {tierDisplay.name}
          </span>
        </div>

        {subscription.tier === 'free' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm mb-3">
              Upgrade to unlock unlimited integrations and premium features.
            </p>
            <Button size="sm" className="w-full" onClick={() => window.location.href = '/pricing'}>
              View Pricing Plans
            </Button>
          </div>
        ) : (
          <>
            {subscription.status && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium capitalize ${
                  subscription.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {subscription.status}
                </span>
              </div>
            )}

            {subscription.currentPeriodEnd && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {subscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'}
                </span>
                <div className="flex items-center text-gray-900">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </div>
              </div>
            )}

            {subscription.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800 text-sm">
                    Your subscription will not renew and will expire on{' '}
                    {subscription.currentPeriodEnd && 
                      new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    }.
                  </p>
                </div>
              </div>
            )}

            {subscription.trialEnd && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-800 text-sm">
                    Trial ends on {new Date(subscription.trialEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}