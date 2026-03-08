/**
 * Stripe Webhooks Tests
 * Unit tests for webhook event handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Stripe first
vi.mock('@/lib/stripe/config', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn()
    },
    subscriptions: {
      retrieve: vi.fn()
    }
  }
}));

vi.mock('@/lib/db/users');
vi.mock('@/lib/stripe/subscriptions');

// Import after mocking
const {
  verifyWebhookSignature,
  handleWebhookEvent,
  handleSubscriptionCreated,
  handleSubscriptionDeleted,
  handleInvoicePaymentFailed,
  handleSubscriptionTrialWillEnd
} = await import('@/lib/stripe/webhooks');

const { updateUserTier } = await import('@/lib/db/users');
const { getSubscriptionById, getUserTierFromSubscription } = await import('@/lib/stripe/subscriptions');
const { stripe } = await import('@/lib/stripe/config');

describe('Stripe Webhooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('verifyWebhookSignature', () => {
    it('should verify webhook signature successfully', () => {
      const mockEvent = { id: 'evt_test', type: 'test' };
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any);

      const result = verifyWebhookSignature('payload', 'signature', 'secret');

      expect(result).toEqual(mockEvent);
      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith('payload', 'signature', 'secret');
    });

    it('should throw error for invalid signature', () => {
      vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      expect(() => {
        verifyWebhookSignature('payload', 'invalid', 'secret');
      }).toThrow('Invalid webhook signature');
    });
  });

  describe('handleSubscriptionCreated', () => {
    const mockSubscription = {
      id: 'sub_test',
      customer: 'cus_test',
      metadata: { userId: 'user-123' }
    };

    it('should handle subscription created successfully', async () => {
      const mockSubscriptionInfo = { id: 'sub_test', status: 'active' };
      
      vi.mocked(getSubscriptionById).mockResolvedValue(mockSubscriptionInfo as any);
      vi.mocked(getUserTierFromSubscription).mockReturnValue('pro');
      vi.mocked(updateUserTier).mockResolvedValue();

      await handleSubscriptionCreated(mockSubscription as any);

      expect(getSubscriptionById).toHaveBeenCalledWith('sub_test');
      expect(getUserTierFromSubscription).toHaveBeenCalledWith(mockSubscriptionInfo);
      expect(updateUserTier).toHaveBeenCalledWith('user-123', 'pro', 'cus_test', 'sub_test');
    });

    it('should handle missing userId in metadata', async () => {
      const subscriptionWithoutUserId = {
        ...mockSubscription,
        metadata: {}
      };

      await handleSubscriptionCreated(subscriptionWithoutUserId as any);

      expect(console.error).toHaveBeenCalledWith('No userId in subscription metadata');
      expect(updateUserTier).not.toHaveBeenCalled();
    });
  });

  describe('handleSubscriptionDeleted', () => {
    it('should downgrade user to free tier', async () => {
      const mockSubscription = {
        id: 'sub_test',
        metadata: { userId: 'user-123' }
      };

      vi.mocked(updateUserTier).mockResolvedValue();

      await handleSubscriptionDeleted(mockSubscription as any);

      expect(updateUserTier).toHaveBeenCalledWith('user-123', 'free', null, null);
      expect(console.log).toHaveBeenCalledWith('Subscription deleted for user user-123, downgraded to free tier');
    });
  });

  describe('handleInvoicePaymentFailed', () => {
    const mockInvoice = {
      id: 'in_test',
      subscription: 'sub_test',
      amount_due: 1900,
      currency: 'usd',
      attempt_count: 2,
      next_payment_attempt: 1234567890,
      status: 'open'
    };

    const mockSubscription = {
      id: 'sub_test',
      customer: 'cus_test',
      metadata: { userId: 'user-123' }
    };

    it('should log payment failure details', async () => {
      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(mockSubscription as any);

      await handleInvoicePaymentFailed(mockInvoice as any);

      expect(console.log).toHaveBeenCalledWith('Payment failed for user user-123, amount: 1900, attempt: 2');
      expect(console.error).toHaveBeenCalledWith('Payment failure details:', {
        userId: 'user-123',
        subscriptionId: 'sub_test',
        customerId: 'cus_test',
        amount: 1900,
        currency: 'usd',
        attemptCount: 2,
        nextPaymentAttempt: 1234567890,
        invoiceId: 'in_test',
        status: 'open'
      });
    });

    it('should handle invoice without subscription', async () => {
      const invoiceWithoutSub = { ...mockInvoice, subscription: null };

      await handleInvoicePaymentFailed(invoiceWithoutSub as any);

      expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
    });
  });

  describe('handleSubscriptionTrialWillEnd', () => {
    it('should log trial ending notification', async () => {
      const mockSubscription = {
        id: 'sub_test',
        trial_end: 1234567890,
        metadata: { userId: 'user-123' }
      };

      await handleSubscriptionTrialWillEnd(mockSubscription as any);

      expect(console.log).toHaveBeenCalledWith('Trial ending soon for user user-123, trial ends: 1234567890');
    });
  });

  describe('handleWebhookEvent', () => {
    it('should handle customer.subscription.created event', async () => {
      const mockEvent = {
        id: 'evt_test',
        type: 'customer.subscription.created',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'sub_test',
            metadata: { userId: 'user-123' }
          }
        }
      };

      vi.mocked(getSubscriptionById).mockResolvedValue({ id: 'sub_test' } as any);
      vi.mocked(getUserTierFromSubscription).mockReturnValue('pro');
      vi.mocked(updateUserTier).mockResolvedValue();

      await handleWebhookEvent(mockEvent as any);

      expect(console.log).toHaveBeenCalledWith('Processing webhook event: customer.subscription.created', {
        eventId: 'evt_test',
        created: 1234567890,
        livemode: false
      });
    });

    it('should handle customer.subscription.trial_will_end event', async () => {
      const mockEvent = {
        id: 'evt_test',
        type: 'customer.subscription.trial_will_end',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'sub_test',
            metadata: { userId: 'user-123' },
            trial_end: 1234567890
          }
        }
      };

      await handleWebhookEvent(mockEvent as any);

      expect(console.log).toHaveBeenCalledWith('Trial ending soon for user user-123, trial ends: 1234567890');
    });

    it('should handle payment_method.attached event', async () => {
      const mockEvent = {
        id: 'evt_test',
        type: 'payment_method.attached',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'pm_test'
          }
        }
      };

      await handleWebhookEvent(mockEvent as any);

      expect(console.log).toHaveBeenCalledWith('Payment method attached: pm_test');
    });

    it('should handle setup_intent.succeeded event', async () => {
      const mockEvent = {
        id: 'evt_test',
        type: 'setup_intent.succeeded',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'seti_test'
          }
        }
      };

      await handleWebhookEvent(mockEvent as any);

      expect(console.log).toHaveBeenCalledWith('Setup intent succeeded: seti_test');
    });

    it('should handle setup_intent.setup_failed event', async () => {
      const mockEvent = {
        id: 'evt_test',
        type: 'setup_intent.setup_failed',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'seti_test',
            last_payment_error: {
              message: 'Card declined'
            }
          }
        }
      };

      await handleWebhookEvent(mockEvent as any);

      expect(console.error).toHaveBeenCalledWith('Setup intent failed: seti_test', {
        lastPaymentError: { message: 'Card declined' }
      });
    });

    it('should handle unhandled event types', async () => {
      const mockEvent = {
        id: 'evt_test',
        type: 'unknown.event.type',
        created: 1234567890,
        livemode: false,
        data: { object: {} }
      };

      await handleWebhookEvent(mockEvent as any);

      expect(console.log).toHaveBeenCalledWith('Unhandled webhook event type: unknown.event.type');
    });

    it('should log successful event processing', async () => {
      const mockEvent = {
        id: 'evt_test',
        type: 'payment_method.attached',
        created: 1234567890,
        livemode: false,
        data: {
          object: { id: 'pm_test' }
        }
      };

      await handleWebhookEvent(mockEvent as any);

      expect(console.log).toHaveBeenCalledWith('Successfully processed webhook event: payment_method.attached', {
        eventId: 'evt_test'
      });
    });

    it('should handle errors in individual handlers gracefully', async () => {
      const mockEvent = {
        id: 'evt_test',
        type: 'customer.subscription.created',
        created: 1234567890,
        livemode: false,
        data: {
          object: {
            id: 'sub_test',
            metadata: { userId: 'user-123' }
          }
        }
      };

      const error = new Error('Test error');
      vi.mocked(getSubscriptionById).mockRejectedValue(error);

      // Should not throw because individual handlers catch their own errors
      await expect(handleWebhookEvent(mockEvent as any)).resolves.toBeUndefined();

      // Should still log successful processing even if individual handler had an error
      expect(console.log).toHaveBeenCalledWith('Successfully processed webhook event: customer.subscription.created', {
        eventId: 'evt_test'
      });
    });
  });
});