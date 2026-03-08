/**
 * Stripe Subscription Management
 * Handles subscription operations and status checks
 */

import { stripe, type SubscriptionTier, type SubscriptionStatus } from './config';

export interface SubscriptionInfo {
  id: string;
  customerId: string;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

/**
 * Get subscription information by customer ID
 */
export async function getSubscriptionByCustomerId(customerId: string): Promise<SubscriptionInfo | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
    });

    const subscription = subscriptions.data[0];
    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status as SubscriptionStatus,
      tier: mapPriceIdToTier(subscription.items.data[0]?.price.id),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Get subscription information by subscription ID
 */
export async function getSubscriptionById(subscriptionId: string): Promise<SubscriptionInfo | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status as SubscriptionStatus,
      tier: mapPriceIdToTier(subscription.items.data[0]?.price.id),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
    };
  } catch (error) {
    console.error('Error getting subscription by ID:', error);
    return null;
  }
}

/**
 * Cancel a subscription at the end of the current period
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return true;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return true;
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return false;
  }
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string) {
  try {
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    return customers.data[0] || null;
  } catch (error) {
    console.error('Error getting customer by email:', error);
    return null;
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(email: string, name?: string, userId?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: userId ? { userId } : undefined,
    });

    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw new Error('Failed to create customer');
  }
}

/**
 * Map Stripe price ID to subscription tier
 */
function mapPriceIdToTier(priceId?: string): SubscriptionTier {
  if (!priceId) return 'free';
  
  if (priceId.includes('developer_pro') || priceId.includes('pro')) {
    return 'pro';
  }
  
  if (priceId.includes('team')) {
    return 'team';
  }
  
  return 'free';
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return ['active', 'trialing'].includes(status);
}

/**
 * Get user tier from subscription status
 */
export function getUserTierFromSubscription(subscription: SubscriptionInfo | null): SubscriptionTier {
  if (!subscription || !isSubscriptionActive(subscription.status)) {
    return 'free';
  }
  
  return subscription.tier;
}

/**
 * Create customer portal session for subscription management
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl?: string
): Promise<{ url: string }> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || process.env.NEXT_PUBLIC_APP_URL + '/billing',
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw new Error('Failed to create customer portal session');
  }
}

/**
 * Update payment method for a customer
 */
export async function updatePaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<boolean> {
  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating payment method:', error);
    return false;
  }
}

/**
 * Get upcoming invoice for a customer
 */
export async function getUpcomingInvoice(customerId: string) {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: customerId,
    });

    return {
      id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      nextPaymentAttempt: invoice.next_payment_attempt 
        ? new Date(invoice.next_payment_attempt * 1000) 
        : null,
    };
  } catch (error) {
    console.error('Error getting upcoming invoice:', error);
    return null;
  }
}

/**
 * Check if subscription will downgrade at period end
 */
export function willDowngradeAtPeriodEnd(subscription: SubscriptionInfo): boolean {
  return subscription.cancelAtPeriodEnd && isSubscriptionActive(subscription.status);
}