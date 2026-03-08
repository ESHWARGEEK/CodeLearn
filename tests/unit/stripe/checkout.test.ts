/**
 * Stripe Checkout Tests
 * Unit tests for Stripe checkout functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Stripe first
vi.mock('@/lib/stripe/config', () => {
  const mockStripe = {
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
  };

  return {
    stripe: mockStripe,
    stripeConfig: {
      products: {
        developerPro: {
          priceId: 'price_test_pro',
          amount: 1900,
          currency: 'usd',
          interval: 'month',
        },
        team: {
          priceId: 'price_test_team',
          amount: 9900,
          currency: 'usd',
          interval: 'month',
        },
      },
      urls: {
        success: 'http://localhost:3000/billing/success?session_id={CHECKOUT_SESSION_ID}',
        cancel: 'http://localhost:3000/billing/cancel',
      },
    },
  };
});

// Import after mocking
const { createCheckoutSession, getCheckoutSession } = await import('@/lib/stripe/checkout');
const { stripe } = await import('@/lib/stripe/config');

describe('Stripe Checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session for pro plan', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(mockSession);

      const result = await createCheckoutSession({
        userId: 'user-123',
        userEmail: 'test@example.com',
        tier: 'pro',
      });

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_test_pro',
            quantity: 1,
          },
        ],
        customer_email: 'test@example.com',
        client_reference_id: 'user-123',
        metadata: {
          userId: 'user-123',
          tier: 'pro',
        },
        success_url: 'http://localhost:3000/billing/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/billing/cancel',
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: {
          enabled: true,
        },
      });

      expect(result).toEqual({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });
    });

    it('should create a checkout session for team plan', async () => {
      const mockSession = {
        id: 'cs_test_456',
        url: 'https://checkout.stripe.com/pay/cs_test_456',
      };

      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(mockSession);

      const result = await createCheckoutSession({
        userId: 'user-456',
        userEmail: 'team@example.com',
        tier: 'team',
      });

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            {
              price: 'price_test_team',
              quantity: 1,
            },
          ],
          metadata: {
            userId: 'user-456',
            tier: 'team',
          },
        })
      );

      expect(result).toEqual({
        sessionId: 'cs_test_456',
        url: 'https://checkout.stripe.com/pay/cs_test_456',
      });
    });

    it('should use custom success and cancel URLs', async () => {
      const mockSession = {
        id: 'cs_test_789',
        url: 'https://checkout.stripe.com/pay/cs_test_789',
      };

      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(mockSession);

      await createCheckoutSession({
        userId: 'user-789',
        userEmail: 'custom@example.com',
        tier: 'pro',
        successUrl: 'https://custom.com/success',
        cancelUrl: 'https://custom.com/cancel',
      });

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: 'https://custom.com/success',
          cancel_url: 'https://custom.com/cancel',
        })
      );
    });

    it('should throw error when session creation fails', async () => {
      vi.mocked(stripe.checkout.sessions.create).mockRejectedValue(new Error('Stripe error'));

      await expect(
        createCheckoutSession({
          userId: 'user-error',
          userEmail: 'error@example.com',
          tier: 'pro',
        })
      ).rejects.toThrow('Failed to create checkout session');
    });

    it('should throw error when session has no ID or URL', async () => {
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
        id: null,
        url: null,
      });

      await expect(
        createCheckoutSession({
          userId: 'user-invalid',
          userEmail: 'invalid@example.com',
          tier: 'pro',
        })
      ).rejects.toThrow('Failed to create checkout session');
    });
  });

  describe('getCheckoutSession', () => {
    it('should retrieve a checkout session', async () => {
      const mockSession = {
        id: 'cs_test_retrieve',
        status: 'complete',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
      };

      vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue(mockSession);

      const result = await getCheckoutSession('cs_test_retrieve');

      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        'cs_test_retrieve',
        {
          expand: ['subscription', 'customer'],
        }
      );

      expect(result).toEqual(mockSession);
    });

    it('should throw error when retrieval fails', async () => {
      vi.mocked(stripe.checkout.sessions.retrieve).mockRejectedValue(new Error('Session not found'));

      await expect(getCheckoutSession('cs_invalid')).rejects.toThrow(
        'Failed to retrieve checkout session'
      );
    });
  });
});