/**
 * Subscription Management Integration Tests
 * End-to-end tests for subscription management functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testDb } from '../helpers/test-db';
import { testStripe } from '../helpers/test-stripe';
import { createTestUser, createTestSubscription } from '../helpers/test-data';

describe('Subscription Management Integration', () => {
  beforeEach(async () => {
    await testDb.setup();
    await testStripe.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
    await testStripe.cleanup();
  });

  describe('Subscription Cancellation Flow', () => {
    it('should cancel subscription and maintain access until period end', async () => {
      // Create test user with active subscription
      const user = await createTestUser({
        email: 'test@example.com',
        tier: 'pro',
        stripeCustomerId: 'cus_test_123',
      });

      const subscription = await createTestSubscription({
        customerId: 'cus_test_123',
        status: 'active',
        tier: 'pro',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      // Cancel subscription via API
      const cancelResponse = await fetch('/api/billing/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      const cancelData = await cancelResponse.json();
      expect(cancelResponse.status).toBe(200);
      expect(cancelData.success).toBe(true);
      expect(cancelData.data.cancelAtPeriodEnd).toBe(true);

      // Verify subscription status
      const statusResponse = await fetch('/api/billing/subscription', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const statusData = await statusResponse.json();
      expect(statusData.success).toBe(true);
      expect(statusData.data.cancelAtPeriodEnd).toBe(true);
      expect(statusData.data.tier).toBe('pro'); // Still pro until period end
    });

    it('should reactivate cancelled subscription', async () => {
      // Create test user with cancelled subscription
      const user = await createTestUser({
        email: 'test@example.com',
        tier: 'pro',
        stripeCustomerId: 'cus_test_123',
      });

      const subscription = await createTestSubscription({
        customerId: 'cus_test_123',
        status: 'active',
        tier: 'pro',
        cancelAtPeriodEnd: true, // Already cancelled
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      // Reactivate subscription via API
      const reactivateResponse = await fetch('/api/billing/subscription/reactivate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      const reactivateData = await reactivateResponse.json();
      expect(reactivateResponse.status).toBe(200);
      expect(reactivateData.success).toBe(true);
      expect(reactivateData.data.cancelAtPeriodEnd).toBe(false);

      // Verify subscription status
      const statusResponse = await fetch('/api/billing/subscription', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const statusData = await statusResponse.json();
      expect(statusData.success).toBe(true);
      expect(statusData.data.cancelAtPeriodEnd).toBe(false);
      expect(statusData.data.status).toBe('active');
    });
  });

  describe('Billing History Flow', () => {
    it('should retrieve user invoices correctly', async () => {
      // Create test user with subscription
      const user = await createTestUser({
        email: 'test@example.com',
        tier: 'pro',
        stripeCustomerId: 'cus_test_123',
      });

      // Create test invoices in Stripe
      await testStripe.createInvoice({
        customer: 'cus_test_123',
        amount: 1900,
        status: 'paid',
        description: 'Developer Pro subscription',
      });

      await testStripe.createInvoice({
        customer: 'cus_test_123',
        amount: 1900,
        status: 'paid',
        description: 'Developer Pro subscription',
      });

      // Retrieve invoices via API
      const response = await fetch('/api/billing/invoices', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.invoices).toHaveLength(2);
      
      const invoice = data.data.invoices[0];
      expect(invoice.amount).toBe(1900);
      expect(invoice.status).toBe('paid');
      expect(invoice.description).toBe('Developer Pro subscription');
      expect(invoice.hostedInvoiceUrl).toBeTruthy();
      expect(invoice.invoicePdf).toBeTruthy();
    });

    it('should return empty invoices for free tier users', async () => {
      // Create test user without subscription
      const user = await createTestUser({
        email: 'test@example.com',
        tier: 'free',
      });

      // Retrieve invoices via API
      const response = await fetch('/api/billing/invoices', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.invoices).toEqual([]);
    });
  });

  describe('Customer Portal Flow', () => {
    it('should create customer portal session for paid users', async () => {
      // Create test user with subscription
      const user = await createTestUser({
        email: 'test@example.com',
        tier: 'pro',
        stripeCustomerId: 'cus_test_123',
      });

      // Create portal session via API
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: 'http://localhost:3000/billing',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.url).toMatch(/^https:\/\/billing\.stripe\.com/);
    });

    it('should reject portal access for free tier users', async () => {
      // Create test user without subscription
      const user = await createTestUser({
        email: 'test@example.com',
        tier: 'free',
      });

      // Attempt to create portal session
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: 'http://localhost:3000/billing',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_SUBSCRIPTION');
    });
  });

  describe('Subscription Expiration Flow', () => {
    it('should downgrade user to free tier when subscription expires', async () => {
      // Create test user with expired subscription
      const user = await createTestUser({
        email: 'test@example.com',
        tier: 'pro',
        stripeCustomerId: 'cus_test_123',
      });

      const subscription = await createTestSubscription({
        customerId: 'cus_test_123',
        status: 'canceled',
        tier: 'pro',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      });

      // Simulate webhook processing subscription expiration
      const webhookResponse = await fetch('/api/billing/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': testStripe.generateWebhookSignature({
            type: 'customer.subscription.deleted',
            data: {
              object: {
                id: subscription.id,
                customer: 'cus_test_123',
                status: 'canceled',
                metadata: {
                  userId: user.userId,
                },
              },
            },
          }),
        },
        body: JSON.stringify({
          type: 'customer.subscription.deleted',
          data: {
            object: {
              id: subscription.id,
              customer: 'cus_test_123',
              status: 'canceled',
              metadata: {
                userId: user.userId,
              },
            },
          },
        }),
      });

      expect(webhookResponse.status).toBe(200);

      // Verify user was downgraded
      const statusResponse = await fetch('/api/billing/subscription', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const statusData = await statusResponse.json();
      expect(statusData.success).toBe(true);
      expect(statusData.data.tier).toBe('free');
    });
  });

  describe('Payment Method Updates', () => {
    it('should handle payment method updates through customer portal', async () => {
      // Create test user with subscription
      const user = await createTestUser({
        email: 'test@example.com',
        tier: 'pro',
        stripeCustomerId: 'cus_test_123',
      });

      // Create portal session
      const portalResponse = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: 'http://localhost:3000/billing',
        }),
      });

      const portalData = await portalResponse.json();
      expect(portalResponse.status).toBe(200);
      expect(portalData.success).toBe(true);
      expect(portalData.data.url).toBeTruthy();

      // Verify portal URL is accessible (in real scenario, user would interact with Stripe portal)
      // This test verifies the portal session creation works correctly
    });
  });
});