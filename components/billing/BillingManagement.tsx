/**
 * Billing Management Component
 * Comprehensive subscription and billing management interface
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  ExternalLink, 
  Loader2,
  Receipt,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign,
  Clock,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth/auth-context';

interface SubscriptionData {
  tier: 'free' | 'pro' | 'team';
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  hostedInvoiceUrl: string;
  invoicePdf: string;
  description: string;
  periodStart: number;
  periodEnd: number;
}

interface UpcomingInvoice {
  id: string;
  amount: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  nextPaymentAttempt: Date | null;
}

export function BillingManagement() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [upcomingInvoice, setUpcomingInvoice] = useState<UpcomingInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchInvoices();
      fetchUpcomingInvoice();
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

  const fetchInvoices = async () => {
    if (!user) return;

    setInvoicesLoading(true);
    try {
      const response = await fetch('/api/billing/invoices', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setInvoices(data.data.invoices || []);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const fetchUpcomingInvoice = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/billing/upcoming', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.data.invoice) {
        setUpcomingInvoice(data.data.invoice);
      }
    } catch (error) {
      console.error('Failed to fetch upcoming invoice:', error);
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

  const handleSubscriptionAction = async (action: 'cancel' | 'reactivate') => {
    if (!user || !subscription) return;

    setActionLoading(action);
    try {
      const response = await fetch(`/api/billing/subscription/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Refresh subscription data
        await fetchSubscription();
        
        const message = action === 'cancel' 
          ? 'Subscription will be cancelled at the end of the current billing period.'
          : 'Subscription has been reactivated successfully.';
        
        alert(message);
      } else {
        alert(data.error?.message || `Failed to ${action} subscription.`);
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getTierDisplay = (tier: string) => {
    switch (tier) {
      case 'free':
        return { name: 'Free', color: 'bg-gray-100 text-gray-800', price: '$0' };
      case 'pro':
        return { name: 'Developer Pro', color: 'bg-blue-100 text-blue-800', price: '$19' };
      case 'team':
        return { name: 'Team', color: 'bg-purple-100 text-purple-800', price: '$99' };
      default:
        return { name: 'Unknown', color: 'bg-gray-100 text-gray-800', price: '$0' };
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, color: 'text-green-600', label: 'Active' };
      case 'trialing':
        return { icon: Calendar, color: 'text-blue-600', label: 'Trial' };
      case 'canceled':
        return { icon: XCircle, color: 'text-red-600', label: 'Cancelled' };
      case 'past_due':
        return { icon: AlertCircle, color: 'text-yellow-600', label: 'Past Due' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Unable to load subscription information</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tierDisplay = getTierDisplay(subscription.tier);

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Current Subscription
            </div>
            {subscription.tier !== 'free' && (
              <Button
                onClick={openCustomerPortal}
                disabled={portalLoading}
                size="sm"
                variant="outline"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </>
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Plan</span>
            <div className="flex items-center space-x-2">
              <Badge className={tierDisplay.color}>
                {tierDisplay.name}
              </Badge>
              <span className="text-sm text-gray-500">{tierDisplay.price}/month</span>
            </div>
          </div>

          {subscription.tier === 'free' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                Upgrade to unlock premium features
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 mb-4">
                <li>• Unlimited template integrations</li>
                <li>• Priority AI processing</li>
                <li>• Advanced code analysis</li>
                <li>• Premium support</li>
              </ul>
              <Button size="sm" className="w-full">
                View Pricing Plans
              </Button>
            </div>
          ) : (
            <>
              {subscription.status && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <div className="flex items-center">
                    {(() => {
                      const statusDisplay = getStatusDisplay(subscription.status);
                      const StatusIcon = statusDisplay.icon;
                      return (
                        <>
                          <StatusIcon className={`h-4 w-4 mr-1 ${statusDisplay.color}`} />
                          <span className={`font-medium ${statusDisplay.color}`}>
                            {statusDisplay.label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {subscription.currentPeriodEnd && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {subscription.cancelAtPeriodEnd ? 'Expires' : 'Next billing'}
                  </span>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
              )}

              {subscription.trialEnd && (
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Trial ends on {new Date(subscription.trialEnd).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}

              {subscription.cancelAtPeriodEnd ? (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Subscription Cancelled</p>
                        <p className="text-sm">
                          Access continues until {subscription.currentPeriodEnd && 
                            new Date(subscription.currentPeriodEnd).toLocaleDateString()
                          }
                        </p>
                      </div>
                      <Button
                        onClick={() => handleSubscriptionAction('reactivate')}
                        disabled={actionLoading === 'reactivate'}
                        size="sm"
                        variant="outline"
                      >
                        {actionLoading === 'reactivate' ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Reactivating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reactivate
                          </>
                        )}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="pt-2">
                  <Button
                    onClick={() => handleSubscriptionAction('cancel')}
                    disabled={actionLoading === 'cancel'}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {actionLoading === 'cancel' ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Subscription'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Invoice */}
      {upcomingInvoice && subscription.tier !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Upcoming Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  ${(upcomingInvoice.amount / 100).toFixed(2)} {upcomingInvoice.currency.toUpperCase()}
                </p>
                <p className="text-sm text-gray-600">
                  Billing period: {upcomingInvoice.periodStart.toLocaleDateString()} - {upcomingInvoice.periodEnd.toLocaleDateString()}
                </p>
                {upcomingInvoice.nextPaymentAttempt && (
                  <p className="text-sm text-gray-600">
                    Next payment: {upcomingInvoice.nextPaymentAttempt.toLocaleDateString()}
                  </p>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      {subscription.tier !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Billing History
            </CardTitle>
            <CardDescription>
              View and download your past invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No invoices found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Receipt className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(invoice.created * 1000).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {invoice.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                        className={invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {invoice.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(invoice.hostedInvoiceUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(invoice.invoicePdf, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}