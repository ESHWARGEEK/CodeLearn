/**
 * Billing Checkout API Tests
 * Unit tests for the billing checkout API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/billing/checkout/route';

// Mock dependencies
vi.mock('@/lib/stripe', () => ({
  createCheckoutSession: vi.fn(),
}));

vi.mock('@/lib/db/users', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/lib/auth/jwt', () => ({
  verifyToken: vi.fn(),
}));

const { createCheckoutSession } = await import('@/lib/stripe');
const { getUser } = await import('@/lib/db/users');
const { verifyToken } = await import('@/lib/auth/jwt');

describe('/api/billing/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid test failures
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const createRequest = (body: any, token?: string) => {
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

  it('should create checkout session successfully', async () => {
    const mockUser = {
      PK: 'USER#user-123',
      SK: 'PROFILE',
      email: 'test@example.com',
      tier: 'free',
    };

    const mockSession = {
      sessionId: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    };

    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'user-123',
      email: 'test@example.com',
      tier: 'free',
    });

    vi.mocked(getUser).mockResolvedValue(mockUser);
    vi.mocked(createCheckoutSession).mockResolvedValue(mockSession);

    const request = createRequest(
      {
        tier: 'pro',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      },
      'valid-token'
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      },
    });

    expect(createCheckoutSession).toHaveBeenCalledWith({
      userId: 'user-123',
      userEmail: 'test@example.com',
      tier: 'pro',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });
  });

  it('should return 401 when no token provided', async () => {
    const request = createRequest({ tier: 'pro' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  });

  it('should return 401 when token is invalid', async () => {
    vi.mocked(verifyToken).mockResolvedValue(null);

    const request = createRequest({ tier: 'pro' }, 'invalid-token');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
      },
    });
  });

  it('should return 404 when user not found', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'user-404',
      email: 'notfound@example.com',
      tier: 'free',
    });

    vi.mocked(getUser).mockResolvedValue(null);

    const request = createRequest({ tier: 'pro' }, 'valid-token');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
    });
  });

  it('should return 400 when user already has subscription', async () => {
    const mockUser = {
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

    vi.mocked(getUser).mockResolvedValue(mockUser);

    const request = createRequest({ tier: 'team' }, 'valid-token');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'ALREADY_SUBSCRIBED',
        message: 'User already has an active subscription',
      },
    });
  });

  it('should return 400 for invalid tier', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'user-123',
      email: 'test@example.com',
      tier: 'free',
    });

    const request = createRequest({ tier: 'invalid' }, 'valid-token');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
      },
    });
  });

  it('should handle Stripe errors', async () => {
    const mockUser = {
      PK: 'USER#user-123',
      SK: 'PROFILE',
      email: 'test@example.com',
      tier: 'free',
    };

    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'user-123',
      email: 'test@example.com',
      tier: 'free',
    });

    vi.mocked(getUser).mockResolvedValue(mockUser);
    vi.mocked(createCheckoutSession).mockRejectedValue(new Error('Stripe error'));

    const request = createRequest({ tier: 'pro' }, 'valid-token');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create checkout session',
      },
    });
  });
});