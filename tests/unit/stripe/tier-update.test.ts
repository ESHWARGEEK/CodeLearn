/**
 * User Tier Update Tests
 * Tests for enhanced user tier update functionality on payment events
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
  handleInvoicePaymentSucceeded,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted
} = await import('@/lib/stripe/webhooks');

const { updateUserTier } = await import('@/lib/db/users');
const { getSubscriptionById, getUserTierFromSubscription } = await import('@/lib/stripe/subscriptions');
const { stripe } = await import('@/lib/stripe/config');

describe('User Tier Update on Payment Events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Payment Success - Immediate Tier Update', () => {
    it('should update user tier immediately on successful payment', async () => {
      const mockInvoice = {
        id: 'in_test_123',
        subscription: 'sub_test_123',
        amount_paid: 1900,
        currency: 'usd',
        billing_reason: 'subscription_cycle',
        period_start: 1234567890,
        period_end: 1234567890
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

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(mockSubscription as any);
      vi.mocked(getSubscriptionById).mockResolvedValue(mockSubscriptionInfo as any);
      vi.mocked(getUserTierFromSubscription).mockReturnValue('pro');
      vi.mocked(updateUserTier).mockResolvedValue();

      await handleInvoicePaymentSucceeded(mockInvoice as any);

      expect(getSubscriptionById).toHaveBeenCalledWith('sub_test_123');
      expect(getUserTierFromSubscription).toHaveBeenCalledWith(mockSubscriptionInfo);
      expect(updateUserTier).toHaveBeenCalledWith('user-123', 'pro', 'cus_test_123', 'sub_test_123');
      
      expect(console.log).toHaveBeenCalledWith(
        'Payment succeeded for user user-123, amount: 1900, tier updated to: pro'
      );
      
      expect(console.log).toHaveBeenCalledWith('Payment success details:', {
        userId: 'user-123',
        subscriptionId: 'sub_test_123',
        customerId: 'cus_test_123',
        amount: 1900,
        currency: 'usd',
        tier: 'pro',
        invoiceId: 'in_test_123',
        billingReason: 'subscription_cycle',
        periodStart: 1234567890,
        periodEnd: 1234567890
      });
    });

    it('should handle payment success for team tier', async () => {
      const mockInvoice = {
        id: 'in_test_456',
        subscription: 'sub_test_456',
        amount_paid: 9900,
        currency: 'usd',
        billing_reason: 'subscription_cycle',
        period_start: 1234567890,
        period_end: 1234567890
      };

      const mockSubscription = {
        id: 'sub_test_456',
        customer: 'cus_test_456',
        metadata: { userId: 'user-456' }
      };

      const mockSubscriptionInfo = {
        id: 'sub_test_456',
        customerId: 'cus_test_456',
        status: 'active',
        tier: 'team'
      };

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(mockSubscription as any);
      vi.mocked(getSubscriptionById).mockResolvedValue(mockSubscriptionInfo as any);
      vi.mocked(getUserTierFromSubscription).mockReturnValue('team');
      vi.mocked(updateUserTier).mockResolvedValue();

      await handleInvoicePaymentSucceeded(mockInvoice as any);

      expect(updateUserTier).toHaveBeenCalledWith('user-456', 'team', 'cus_test_456', 'sub_test_456');
      expect(console.log).toHaveBeenCalledWith(
        'Payment succeeded for user user-456, amount: 9900, tier updated to: team'
      );
    });

    it('should skip tier update for invoice without subscription', async () => {
      const mockInvoice = {
        id: 'in_test_789',
        subscription: null,
        amount_paid: 1900,
        currency: 'usd'
      };

      await handleInvoicePaymentSucceeded(mockInvoice as any);

      expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
      expect(updateUserTier).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Invoice payment succeeded without subscription, skipping tier update');
    });
  });

  describe('Subscription Lifecycle - Tier Management', () => {
    it('should update tier on subscription creation with detailed logging', async () => {
      const mockSubscription = {
        id: 'sub_new_123',
        customer: 'cus_new_123',
        status: 'active',
        trial_end: 1234567890,
        current_period_start: 1234567890,
        current_period_end: 1234567890,
        metadata: { userId: 'user-new-123' }
      };

      const mockSubscriptionInfo = {
        id: 'sub_new_123',
        customerId: 'cus_new_123',
        status: 'active',
        tier: 'pro'
      };

      vi.mocked(getSubscriptionById).mockResolvedValue(mockSubscriptionInfo as any);
      vi.mocked(getUserTierFromSubscription).mockReturnValue('pro');
      vi.mocked(updateUserTier).mockResolvedValue();

      await handleSubscriptionCreated(mockSubscription as any);

      expect(updateUserTier).toHaveBeenCalledWith('user-new-123', 'pro', 'cus_new_123', 'sub_new_123');
      expect(console.log).toHaveBeenCalledWith('Subscription created for user user-new-123, tier: pro');
      expect(console.log).toHaveBeenCalledWith('Subscription creation details:', {
        userId: 'user-new-123',
        subscriptionId: 'sub_new_123',
        customerId: 'cus_new_123',
        status: 'active',
        tier: 'pro',
        trialEnd: 1234567890,
        currentPeriodStart: 1234567890,
        currentPeriodEnd: 1234567890
      });
    });

    it('should update tier on subscription update with detailed logging', async () => {
      const mockSubscription = {
        id: 'sub_update_123',
        customer: 'cus_update_123',
        status: 'active',
        cancel_at_period_end: false,
        current_period_start: 1234567890,
        current_period_end: 1234567890,
        trial_end: null,
        metadata: { userId: 'user-update-123' }
      };

      const mockSubscriptionInfo = {
        id: 'sub_update_123',
        customerId: 'cus_update_123',
        status: 'active',
        tier: 'team'
      };

      vi.mocked(getSubscriptionById).mockResolvedValue(mockSubscriptionInfo as any);
      vi.mocked(getUserTierFromSubscription).mockReturnValue('team');
      vi.mocked(updateUserTier).mockResolvedValue();

      await handleSubscriptionUpdated(mockSubscription as any);

      expect(updateUserTier).toHaveBeenCalledWith('user-update-123', 'team', 'cus_update_123', 'sub_update_123');
      expect(console.log).toHaveBeenCalledWith('Subscription updated for user user-update-123, tier: team, status: active');
      expect(console.log).toHaveBeenCalledWith('Subscription update details:', {
        userId: 'user-update-123',
        subscriptionId: 'sub_update_123',
        customerId: 'cus_update_123',
        status: 'active',
        tier: 'team',
        cancelAtPeriodEnd: false,
        currentPeriodStart: 1234567890,
        currentPeriodEnd: 1234567890,
        trialEnd: null
      });
    });

    it('should downgrade to free tier on subscription deletion with cleanup', async () => {
      const mockSubscription = {
        id: 'sub_delete_123',
        customer: 'cus_delete_123',
        canceled_at: 1234567890,
        ended_at: 1234567890,
        cancel_at_period_end: true,
        metadata: { userId: 'user-delete-123' }
      };

      vi.mocked(updateUserTier).mockResolvedValue();

      await handleSubscriptionDeleted(mockSubscription as any);

      expect(updateUserTier).toHaveBeenCalledWith('user-delete-123', 'free', null, null);
      expect(console.log).toHaveBeenCalledWith('Subscription deleted for user user-delete-123, downgraded to free tier');
      expect(console.log).toHaveBeenCalledWith('Subscription deletion details:', {
        userId: 'user-delete-123',
        subscriptionId: 'sub_delete_123',
        customerId: 'cus_delete_123',
        canceledAt: 1234567890,
        endedAt: 1234567890,
        cancelAtPeriodEnd: true
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing subscription info gracefully', async () => {
      const mockInvoice = {
        id: 'in_error_123',
        subscription: 'sub_error_123',
        amount_paid: 1900,
        currency: 'usd'
      };

      const mockSubscription = {
        id: 'sub_error_123',
        customer: 'cus_error_123',
        metadata: { userId: 'user-error-123' }
      };

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(mockSubscription as any);
      vi.mocked(getSubscriptionById).mockResolvedValue(null);

      await handleInvoicePaymentSucceeded(mockInvoice as any);

      expect(updateUserTier).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Failed to get subscription info for payment success');
    });

    it('should handle database errors during tier update', async () => {
      const mockInvoice = {
        id: 'in_db_error_123',
        subscription: 'sub_db_error_123',
        amount_paid: 1900,
        currency: 'usd'
      };

      const mockSubscription = {
        id: 'sub_db_error_123',
        customer: 'cus_db_error_123',
        metadata: { userId: 'user-db-error-123' }
      };

      const mockSubscriptionInfo = {
        id: 'sub_db_error_123',
        customerId: 'cus_db_error_123',
        status: 'active',
        tier: 'pro'
      };

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(mockSubscription as any);
      vi.mocked(getSubscriptionById).mockResolvedValue(mockSubscriptionInfo as any);
      vi.mocked(getUserTierFromSubscription).mockReturnValue('pro');
      vi.mocked(updateUserTier).mockRejectedValue(new Error('Database connection failed'));

      await handleInvoicePaymentSucceeded(mockInvoice as any);

      expect(console.error).toHaveBeenCalledWith('Error handling invoice payment succeeded:', expect.any(Error));
    });

    it('should handle missing userId in subscription metadata', async () => {
      const mockInvoice = {
        id: 'in_no_user_123',
        subscription: 'sub_no_user_123',
        amount_paid: 1900,
        currency: 'usd'
      };

      const mockSubscription = {
        id: 'sub_no_user_123',
        customer: 'cus_no_user_123',
        metadata: {} // No userId
      };

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(mockSubscription as any);

      await handleInvoicePaymentSucceeded(mockInvoice as any);

      expect(getSubscriptionById).not.toHaveBeenCalled();
      expect(updateUserTier).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('No userId in subscription metadata');
    });
  });
});