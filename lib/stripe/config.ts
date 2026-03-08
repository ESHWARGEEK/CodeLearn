/**
 * Stripe Configuration
 * Handles Stripe initialization and configuration
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required');
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Stripe configuration
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Product and price IDs (these would be created in Stripe Dashboard)
  products: {
    developerPro: {
      priceId: process.env.STRIPE_DEVELOPER_PRO_PRICE_ID || 'price_developer_pro',
      amount: 1900, // $19.00 in cents
      currency: 'usd',
      interval: 'month',
    },
    team: {
      priceId: process.env.STRIPE_TEAM_PRICE_ID || 'price_team',
      amount: 9900, // $99.00 in cents
      currency: 'usd',
      interval: 'month',
    },
  },
  
  // Success and cancel URLs
  urls: {
    success: process.env.NEXT_PUBLIC_APP_URL + '/billing/success?session_id={CHECKOUT_SESSION_ID}',
    cancel: process.env.NEXT_PUBLIC_APP_URL + '/billing/cancel',
    customerPortal: process.env.NEXT_PUBLIC_APP_URL + '/billing/manage',
  },
} as const;

export type SubscriptionTier = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';