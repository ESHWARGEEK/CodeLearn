/**
 * Webhook Integration Tests
 * Integration tests for webhook event handling
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';

// Set up environment variables before importing modules
beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock';
});

// Mock dependencies
vi.mock('@/lib/db/users');
vi.mock('@/lib/stripe/subscriptions');
vi.mock('@/lib/stripe/config', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn()
    },
    subscriptions: {
      retrieve: vi.fn()
    }
  },
  stripeConfig: {
    webhookSecret: 'whsec_test_secret'
  }
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn().mockReturnValue('test_signature')
  }))
}));

// Import after mocking
const { POST } = await import('@/app/api/billing/webhook/route');
const { getUser, updateUserTier } = await import('@/lib/db/users');
const { getSubscriptionById, getUserTierFromSubscription } = await import('@/lib/stripe/subscriptions');

// Import stripe after mocking
const { stripe } = await import('@/lib/stripe/config');

describe('Webhook Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const createMockRequest = (eventData: any) => {
    return {
      text: vi.fn().mockResolvedValue(JSON.stringify(eventData))
    } as unknown as NextRequest;
  };

  describe('Subscription Lifecycle', () => {
    it('should handle complete subscription creation flow', async () => {
      const subscriptionCreatedEvent = {
        id: 'evt_subscription_created',
        type: 'customer.subscription.created',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            items: {
              data: [{
                price: {
                  id: 'price_pro_monthly'
                }
              }]
            },
            metadata: {
              userId: 'user-123'
            }
          }
        }
      };

      const mockSubscriptionInfo = {
        id: 'sub_test_123',
        customerId: 'cus_test_123',
        status: 'active',
        tier: 'pro'
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(subscriptionCreatedEvent as any);
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(subscriptionCreatedEvent.data.object as any);
      vi.mocked(getSubscriptionById).mockResolvedValue(mockSubscriptionInfo as any);
      vi.mocked(getUserTierFromSubscription).mockReturnValue('pro');
      vi.mocked(updateUserTier).mockResolvedValue();

      const request = createMockRequest(subscriptionCreatedEvent);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(data.eventType).toBe('customer.subscription.created');
      
      expect(updateUserTier).toHaveBeenCalledWith(
        'user-123',
        'pro',
        'cus_test_123',
        'sub_test_123'
      );
    });

    it('should handle subscription cancellation flow', async () => {
      const subscriptionDeletedEvent = {
        id: 'evt_subscription_deleted',
        type: 'customer.subscription.deleted',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'canceled',
            metadata: {
              userId: 'user-123'
            }
          }
        }
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(subscriptionDeletedEvent as any);
      vi.mocked(updateUserTier).mockResolvedValue();

      const request = createMockRequest(subscriptionDeletedEvent);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      expect(updateUserTier).toHaveBeenCalledWith(
        'user-123',
        'free',
        null,
        null
      );
    });
  });

  describe('Payment Events', () => {
    it('should handle successful payment', async () => {
      const paymentSucceededEvent = {
        id: 'evt_payment_succeeded',
        type: 'invoice.payment_succeeded',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'in_test_123',
            subscription: 'sub_test_123',
            amount_paid: 1900,
            currency: 'usd',
            status: 'paid',
            billing_reason: 'subscription_cycle',
            period_start: 1234567890,
            period_end: 1234567890
          }
        }
      };

      const mockSubscription = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        metadata: { userId: 'user-123' }
      };

      const mockSubscriptionInfo = {
        id: 'sub_test_123',
        customerId: 'cus_test_123',
        status: 'active',
        tier: 'pro'
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(paymentSucceededEvent as any);
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(mockSubscription as any);
      vi.mocked(getSubscriptionById).mockResolvedValue(mockSubscriptionInfo as any);
      vi.mocked(getUserTierFromSubscription).mockReturnValue('pro');
      vi.mocked(updateUserTier).mockResolvedValue();

      const request = createMockRequest(paymentSucceededEvent);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Payment succeeded for user user-123, amount: 1900, tier updated to: pro')
      );
      expect(updateUserTier).toHaveBeenCalledWith('user-123', 'pro', 'cus_test_123', 'sub_test_123');
    });

    it('should handle failed payment with detailed logging', async () => {
      const paymentFailedEvent = {
        id: 'evt_payment_failed',
        type: 'invoice.payment_failed',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'in_test_123',
            subscription: 'sub_test_123',
            amount_due: 1900,
            currency: 'usd',
            attempt_count: 2,
            next_payment_attempt: 1234567890,
            status: 'open'
          }
        }
      };

      const mockSubscription = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        metadata: { userId: 'user-123' }
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(paymentFailedEvent as any);
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(mockSubscription as any);

      const request = createMockRequest(paymentFailedEvent);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      expect(console.log).toHaveBeenCalledWith('Payment failed for user user-123, amount: 1900, attempt: 2');
      expect(console.error).toHaveBeenCalledWith('Payment failure details:', expect.objectContaining({
        userId: 'user-123',
        subscriptionId: 'sub_test_123',
        customerId: 'cus_test_123',
        amount: 1900,
        currency: 'usd',
        attemptCount: 2,
        nextPaymentAttempt: 1234567890,
        invoiceId: 'in_test_123',
        status: 'open'
      }));
    });
  });

  describe('Trial Events', () => {
    it('should handle trial ending notification', async () => {
      const trialWillEndEvent = {
        id: 'evt_trial_will_end',
        type: 'customer.subscription.trial_will_end',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            trial_end: 1234567890,
            metadata: {
              userId: 'user-123'
            }
          }
        }
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(trialWillEndEvent as any);

      const request = createMockRequest(trialWillEndEvent);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      expect(console.log).toHaveBeenCalledWith('Trial ending soon for user user-123, trial ends: 1234567890');
    });
  });

  describe('Payment Method Events', () => {
    it('should handle payment method attachment', async () => {
      const paymentMethodAttachedEvent = {
        id: 'evt_payment_method_attached',
        type: 'payment_method.attached',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'pm_test_123',
            customer: 'cus_test_123',
            type: 'card'
          }
        }
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(paymentMethodAttachedEvent as any);

      const request = createMockRequest(paymentMethodAttachedEvent);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      expect(console.log).toHaveBeenCalledWith('Payment method attached: pm_test_123');
    });

    it('should handle setup intent success', async () => {
      const setupIntentSucceededEvent = {
        id: 'evt_setup_intent_succeeded',
        type: 'setup_intent.succeeded',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'seti_test_123',
            customer: 'cus_test_123',
            status: 'succeeded'
          }
        }
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(setupIntentSucceededEvent as any);

      const request = createMockRequest(setupIntentSucceededEvent);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      expect(console.log).toHaveBeenCalledWith('Setup intent succeeded: seti_test_123');
    });

    it('should handle setup intent failure', async () => {
      const setupIntentFailedEvent = {
        id: 'evt_setup_intent_failed',
        type: 'setup_intent.setup_failed',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'seti_test_123',
            customer: 'cus_test_123',
            status: 'requires_payment_method',
            last_payment_error: {
              code: 'card_declined',
              message: 'Your card was declined.'
            }
          }
        }
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(setupIntentFailedEvent as any);

      const request = createMockRequest(setupIntentFailedEvent);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      expect(console.error).toHaveBeenCalledWith('Setup intent failed: seti_test_123', {
        lastPaymentError: {
          code: 'card_declined',
          message: 'Your card was declined.'
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const subscriptionCreatedEvent = {
        id: 'evt_subscription_created',
        type: 'customer.subscription.created',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            metadata: { userId: 'user-123' }
          }
        }
      };

      const mockSubscriptionInfo = {
        id: 'sub_test_123',
        customerId: 'cus_test_123',
        status: 'active',
        tier: 'pro'
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(subscriptionCreatedEvent as any);
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(subscriptionCreatedEvent.data.object as any);
      vi.mocked(getSubscriptionById).mockResolvedValue(mockSubscriptionInfo as any);
      vi.mocked(getUserTierFromSubscription).mockReturnValue('pro');
      vi.mocked(updateUserTier).mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest(subscriptionCreatedEvent);
      const response = await POST(request);
      const data = await response.json();

      // The webhook should still return 200 because individual handlers catch their own errors
      // This is by design to prevent Stripe from retrying on application errors
      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(data.eventId).toBe('evt_subscription_created');
      
      // But the error should be logged
      expect(console.error).toHaveBeenCalledWith('Error handling subscription created:', expect.any(Error));
    });

    it('should handle missing user metadata gracefully', async () => {
      const subscriptionCreatedEvent = {
        id: 'evt_subscription_created',
        type: 'customer.subscription.created',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            metadata: {} // No userId
          }
        }
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(subscriptionCreatedEvent as any);
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(subscriptionCreatedEvent.data.object as any);

      const request = createMockRequest(subscriptionCreatedEvent);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      
      expect(console.error).toHaveBeenCalledWith('No userId in subscription metadata');
      expect(updateUserTier).not.toHaveBeenCalled();
    });
  });
});