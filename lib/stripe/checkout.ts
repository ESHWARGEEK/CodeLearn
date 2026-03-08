/**
 * Stripe Checkout Session Management
 * Handles creating and managing checkout sessions
 */

import { stripe, stripeConfig, type SubscriptionTier } from './config';

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  tier: 'pro' | 'team';
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  tier,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
  try {
    const product = stripeConfig.products[tier === 'pro' ? 'developerPro' : 'team'];
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        tier,
      },
      success_url: successUrl || stripeConfig.urls.success,
      cancel_url: cancelUrl || stripeConfig.urls.cancel,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
    });

    if (!session.id || !session.url) {
      throw new Error('Failed to create checkout session');
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });
    
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw new Error('Failed to retrieve checkout session');
  }
}

/**
 * Create a customer portal session for subscription management
 */
export async function createCustomerPortalSession(customerId: string, returnUrl?: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || stripeConfig.urls.customerPortal,
    });

    return session;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw new Error('Failed to create customer portal session');
  }
}