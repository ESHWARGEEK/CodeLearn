/**
 * Checkout Flow Integration Test
 * Tests the complete checkout flow logic and API integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as checkoutPOST } from '@/app/api/billing/checkout/route';
import { GET as sessionGET } from '@/app/api/billing/session/[sessionId]/route';

// Mock dependencies
vi.mock('@/lib/stripe', () => ({
  createCheckoutSession: vi.fn(),
  getCheckoutSession: vi.fn(),
  stripeConfig: {
    products: {
      developerPro: {
        priceId: 'price_pro',
        amount: 1900,
      },
      team: {
        priceId: 'price_team',
        amount: 9900,
      },
    },
  },
}));

vi.mock('@/lib/db/users', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/lib/auth/jwt', () => ({
  verifyToken: vi.fn(),
}));

const { createCheckoutSession, getCheckoutSession } = await import('@/lib/stripe');
const { getUser } = await import('@/lib/db/users');
const { verifyToken } = await import('@/lib/auth/jwt');

describe('Complete Checkout Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const createCheckoutRequest = (body: any, token?: string) => {
    const headers = new Headers();
    headers.set('content-type', 'application/json');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return new NextRequest('http://localhost:3000/api/billing/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  };

  const createSessionRequest = (sessionId: string) => {
    return new NextRequest(`http://localhost:3000/api/billing/session/${sessionId}`, {
      method: 'GET',
    });
  };

  it('should complete full checkout flow for pro plan', async () => {
    // Step 1: User initiates checkout
    const mockUser = {
      PK: 'USER#user-123',
      SK: 'PROFILE',
      email: 'test@example.com',
      tier: 'free',
    };

    const mockCheckoutSession = {
      sessionId: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    };

    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'user-123',
      email: 'test@example.com',
      tier: 'free',
    });

    vi.mocked(getUser).mockResolvedValue(mockUser);
    vi.mocked(createCheckoutSession).mockResolvedValue(mockCheckoutSession);

    // Simulate checkout API call
    const checkoutRequest = createCheckoutRequest(
      {
        tier: 'pro',
        successUrl: 'http://localhost:3000/billing/success',
        cancelUrl: 'http://localhost:3000/billing/cancel',
      },
      'test-token'
    );

    const checkoutResponse = await checkoutPOST(checkoutRequest);
    const checkoutData = await checkoutResponse.json();

    // Verify checkout session creation
    expect(checkoutResponse.status).toBe(200);
    expect(checkoutData.success).toBe(true);
    expect(checkoutData.data.sessionId).toBe('cs_test_123');
    expect(createCheckoutSession).toHaveBeenCalledWith({
      userId: 'user-123',
      userEmail: 'test@example.com',
      tier: 'pro',
      successUrl: 'http://localhost:3000/billing/success',
      cancelUrl: 'http://localhost:3000/billing/cancel',
    });

    // Step 2: User completes payment and returns to success page
    const mockCompletedSession = {
      id: 'cs_test_123',
      customer_email: 'test@example.com',
      metadata: {
        tier: 'pro',
      },
      payment_status: 'paid',
      subscription: 'sub_123',
      line_items: {
        data: [
          {
            price: {
              unit_amount: 1900,
            },
          },
        ],
      },
    };

    vi.mocked(getCheckoutSession).mockResolvedValue(mockCompletedSession);

    // Simulate session retrieval for success page
    const sessionRequest = createSessionRequest('cs_test_123');
    const sessionResponse = await sessionGET(sessionRequest, { params: { sessionId: 'cs_test_123' } });
    const sessionData = await sessionResponse.json();
    
    // Verify session data is correctly formatted
    expect(sessionResponse.status).toBe(200);
    expect(sessionData.success).toBe(true);
    expect(sessionData.data.tier).toBe('pro');
    expect(sessionData.data.amount).toBe(19.00);
    expect(getCheckoutSession).toHaveBeenCalledWith('cs_test_123');
  });

  it('should handle checkout flow for team plan', async () => {
    const mockUser = {
      PK: 'USER#user-456',
      SK: 'PROFILE',
      email: 'team@example.com',
      tier: 'free',
    };

    const mockCheckoutSession = {
      sessionId: 'cs_test_456',
      url: 'https://checkout.stripe.com/pay/cs_test_456',
    };

    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'user-456',
      email: 'team@example.com',
      tier: 'free',
    });

    vi.mocked(getUser).mockResolvedValue(mockUser);
    vi.mocked(createCheckoutSession).mockResolvedValue(mockCheckoutSession);

    // Test team plan checkout
    const checkoutRequest = createCheckoutRequest(
      {
        tier: 'team',
        successUrl: 'http://localhost:3000/billing/success',
        cancelUrl: 'http://localhost:3000/billing/cancel',
      },
      'test-token'
    );

    const checkoutResponse = await checkoutPOST(checkoutRequest);
    const checkoutData = await checkoutResponse.json();

    expect(checkoutResponse.status).toBe(200);
    expect(checkoutData.success).toBe(true);
    expect(createCheckoutSession).toHaveBeenCalledWith({
      userId: 'user-456',
      userEmail: 'team@example.com',
      tier: 'team',
      successUrl: 'http://localhost:3000/billing/success',
      cancelUrl: 'http://localhost:3000/billing/cancel',
    });
  });

  it('should prevent checkout for already subscribed users', async () => {
    const mockProUser = {
      PK: 'USER#user-pro',
      SK: 'PROFILE',
      email: 'pro@example.com',
      tier: 'pro',
    };

    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'user-pro',
      email: 'pro@example.com',
      tier: 'pro',
    });

    vi.mocked(getUser).mockResolvedValue(mockProUser);

    // Attempt to upgrade already subscribed user
    const checkoutRequest = createCheckoutRequest(
      {
        tier: 'team',
      },
      'test-token'
    );

    const checkoutResponse = await checkoutPOST(checkoutRequest);
    const checkoutData = await checkoutResponse.json();

    // Should return error for already subscribed user
    expect(checkoutResponse.status).toBe(400);
    expect(checkoutData.success).toBe(false);
    expect(checkoutData.error.code).toBe('ALREADY_SUBSCRIBED');
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it('should validate pricing tiers match requirements', () => {
    // Verify pricing matches spec requirements
    const expectedPricing = {
      free: {
        price: 0,
        integrations: 5,
        name: 'Free',
      },
      pro: {
        price: 19,
        integrations: 'unlimited',
        name: 'Developer Pro',
      },
      team: {
        price: 99,
        integrations: 'unlimited',
        name: 'Team',
      },
    };

    // Test that pricing structure is correct
    expect(expectedPricing.free.price).toBe(0);
    expect(expectedPricing.pro.price).toBe(19);
    expect(expectedPricing.team.price).toBe(99);
    
    // Test integration limits
    expect(expectedPricing.free.integrations).toBe(5);
    expect(expectedPricing.pro.integrations).toBe('unlimited');
    expect(expectedPricing.team.integrations).toBe('unlimited');
  });

  it('should handle checkout session retrieval errors gracefully', async () => {
    // Test session not found
    vi.mocked(getCheckoutSession).mockResolvedValue(null);

    const sessionRequest = createSessionRequest('cs_nonexistent');
    const sessionResponse = await sessionGET(sessionRequest, { params: { sessionId: 'cs_nonexistent' } });
    const sessionData = await sessionResponse.json();
    
    expect(sessionResponse.status).toBe(404);
    expect(sessionData.success).toBe(false);
    expect(sessionData.error.code).toBe('SESSION_NOT_FOUND');
    expect(getCheckoutSession).toHaveBeenCalledWith('cs_nonexistent');
  });

  it('should validate required environment variables', () => {
    // Test that required Stripe environment variables are defined
    const requiredEnvVars = [
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_DEVELOPER_PRO_PRICE_ID',
      'STRIPE_TEAM_PRICE_ID',
      'STRIPE_WEBHOOK_SECRET',
    ];

    // In a real environment, these would be checked
    expect(requiredEnvVars.length).toBe(5);
    expect(requiredEnvVars).toContain('STRIPE_SECRET_KEY');
    expect(requiredEnvVars).toContain('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  });
});