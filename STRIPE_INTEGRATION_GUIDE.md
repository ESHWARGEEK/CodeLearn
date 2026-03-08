# Stripe Integration Guide

This document provides a comprehensive guide for the Stripe integration in the CodeLearn platform.

## Overview

The Stripe integration enables subscription management for the CodeLearn platform with the following features:

- **Subscription Plans**: Free, Developer Pro ($19/month), Team ($99/month)
- **Checkout Sessions**: Secure payment processing
- **Customer Portal**: Self-service subscription management
- **Webhooks**: Real-time subscription status updates
- **Usage-based Billing**: Integration limits based on subscription tier

## Architecture

```
Frontend (React) → API Routes → Stripe API
                      ↓
                 Webhook Handler → Database Updates
```

## Setup Instructions

### 1. Stripe Account Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Create products and prices in the Stripe Dashboard:
   - Developer Pro: $19/month
   - Team: $99/month

### 2. Environment Variables

Add the following to your `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Product Price IDs (from Stripe Dashboard)
STRIPE_DEVELOPER_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Webhook Configuration

1. In Stripe Dashboard, go to Webhooks
2. Add endpoint: `https://yourdomain.com/api/billing/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## API Endpoints

### POST /api/billing/checkout

Creates a Stripe checkout session for subscription purchase.

**Request:**
```json
{
  "tier": "pro" | "team",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

### POST /api/billing/portal

Creates a customer portal session for subscription management.

**Request:**
```json
{
  "returnUrl": "https://example.com/dashboard"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://billing.stripe.com/session/..."
  }
}
```

### GET /api/billing/subscription

Gets current subscription information for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "tier": "pro",
    "status": "active",
    "currentPeriodEnd": "2024-04-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "trialEnd": null
  }
}
```

### POST /api/billing/webhook

Handles Stripe webhook events for subscription updates.

## Components

### SubscriptionStatus

Displays current subscription information and management options.

```tsx
import { SubscriptionStatus } from '@/components/billing/SubscriptionStatus';

export default function BillingPage() {
  return (
    <div>
      <h1>Billing</h1>
      <SubscriptionStatus />
    </div>
  );
}
```

### Pricing Page

Complete pricing page with checkout integration.

```tsx
// Available at /pricing
// Handles plan selection and checkout redirect
```

## Usage Examples

### Creating a Checkout Session

```typescript
import { createCheckoutSession } from '@/lib/stripe';

const session = await createCheckoutSession({
  userId: 'user-123',
  userEmail: 'user@example.com',
  tier: 'pro',
  successUrl: 'https://example.com/success',
  cancelUrl: 'https://example.com/cancel',
});

// Redirect user to session.url
window.location.href = session.url;
```

### Checking Subscription Status

```typescript
import { getSubscriptionByCustomerId } from '@/lib/stripe';

const subscription = await getSubscriptionByCustomerId('cus_...');

if (subscription && subscription.status === 'active') {
  // User has active subscription
  const tier = subscription.tier; // 'pro' | 'team'
}
```

### Handling Webhooks

```typescript
import { handleWebhookEvent, verifyWebhookSignature } from '@/lib/stripe';

// In your webhook handler
const event = verifyWebhookSignature(body, signature, secret);
await handleWebhookEvent(event);
```

## Database Schema Updates

The user table includes Stripe-related fields:

```typescript
interface User {
  // ... existing fields
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}
```

## Testing

### Unit Tests

```bash
npm test tests/unit/stripe/
npm test tests/unit/api/billing-
```

### Integration Tests

```bash
# Requires Stripe test keys
STRIPE_SECRET_KEY=sk_test_... npm test tests/integration/stripe-integration.test.ts
```

### Manual Testing

1. **Checkout Flow:**
   - Visit `/pricing`
   - Click "Upgrade to Pro"
   - Complete test payment with card `4242 4242 4242 4242`
   - Verify redirect to success page
   - Check user tier update in database

2. **Customer Portal:**
   - As subscribed user, visit billing settings
   - Click "Manage Subscription"
   - Verify portal opens with subscription details

3. **Webhook Testing:**
   - Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/billing/webhook`
   - Trigger events: `stripe trigger customer.subscription.created`
   - Verify database updates

## Security Considerations

1. **Webhook Signature Verification**: Always verify webhook signatures
2. **Environment Variables**: Keep Stripe keys secure and use test keys in development
3. **HTTPS**: Use HTTPS in production for webhook endpoints
4. **Rate Limiting**: Implement rate limiting on billing endpoints
5. **Input Validation**: Validate all inputs with Zod schemas

## Error Handling

The integration includes comprehensive error handling:

- **Authentication Errors**: 401 for missing/invalid tokens
- **Validation Errors**: 400 for invalid request data
- **Stripe Errors**: Proper error mapping and user-friendly messages
- **Webhook Errors**: Graceful handling with retry logic

## Monitoring

Monitor the following metrics:

- **Checkout Conversion Rate**: Sessions created vs completed
- **Webhook Processing**: Success/failure rates
- **Subscription Churn**: Cancellation rates
- **Payment Failures**: Failed payment attempts

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Failed**
   - Check `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure raw request body is used for verification

2. **Checkout Session Creation Failed**
   - Verify price IDs exist in Stripe Dashboard
   - Check API key permissions

3. **User Tier Not Updated**
   - Check webhook endpoint is reachable
   - Verify webhook events are configured
   - Check database update logs

### Debug Mode

Enable debug logging:

```bash
DEBUG=stripe:* npm run dev
```

## Production Deployment

1. **Switch to Live Keys**: Replace test keys with live keys
2. **Update Webhook URL**: Point to production webhook endpoint
3. **Configure Domain**: Update success/cancel URLs
4. **Monitor Webhooks**: Set up monitoring for webhook failures
5. **Backup Strategy**: Ensure subscription data is backed up

## Support

For Stripe-related issues:

1. Check Stripe Dashboard logs
2. Review webhook delivery attempts
3. Contact Stripe support for payment issues
4. Use Stripe CLI for local debugging

---

**Last Updated:** March 8, 2026  
**Version:** 1.0  
**Author:** Development Team