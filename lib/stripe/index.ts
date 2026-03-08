/**
 * Stripe Integration - Main Export
 * Centralized exports for all Stripe functionality
 */

// Configuration
export { stripe, stripeConfig, type SubscriptionTier, type SubscriptionStatus } from './config';

// Checkout
export {
  createCheckoutSession,
  getCheckoutSession,
  createCustomerPortalSession,
  type CreateCheckoutSessionParams,
  type CheckoutSessionResult,
} from './checkout';

// Subscriptions
export {
  getSubscriptionByCustomerId,
  getSubscriptionById,
  cancelSubscription,
  reactivateSubscription,
  getCustomerByEmail,
  createCustomer,
  isSubscriptionActive,
  getUserTierFromSubscription,
  type SubscriptionInfo,
} from './subscriptions';

// Webhooks
export {
  verifyWebhookSignature,
  handleWebhookEvent,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
} from './webhooks';