'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreditCard, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { SubscriptionData, PLAN_FEATURES } from '@/types/subscription';

export function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      const result = await response.json();
      
      if (result.success) {
        setSubscription(result.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setSubscription(prev => prev ? {
          ...prev,
          cancelAtPeriodEnd: true
        } : null);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setSubscription(prev => prev ? {
          ...prev,
          cancelAtPeriodEnd: false
        } : null);
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanDisplayName = (plan: string) => {
    return PLAN_FEATURES[plan]?.name || 'Unknown Plan';
  };

  const getPlanPrice = (plan: string) => {
    return PLAN_FEATURES[plan]?.price || 'Unknown';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Unable to load subscription information.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Plan
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
              {subscription.status}
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Information */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{getPlanDisplayName(subscription.plan)}</h3>
              <p className="text-gray-600">{getPlanPrice(subscription.plan)}</p>
            </div>
            {subscription.cancelAtPeriodEnd && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Cancelling
              </Badge>
            )}
          </div>

          <Separator />

          {/* Billing Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Current period: {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {subscription.paymentMethod.brand.toUpperCase()} ending in {subscription.paymentMethod.last4}
              </span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            {subscription.cancelAtPeriodEnd ? (
              <Button 
                onClick={handleReactivateSubscription}
                disabled={actionLoading}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Reactivate Subscription
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={actionLoading}>
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your subscription? You&apos;ll continue to have access to all features until {formatDate(subscription.currentPeriodEnd)}, after which your account will be downgraded to the free tier.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription}>
                      Cancel Subscription
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {subscription.cancelAtPeriodEnd && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Subscription Cancelling</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. You&apos;ll continue to have access to all features until then.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}