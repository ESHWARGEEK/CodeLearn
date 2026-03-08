/**
 * Billing Session API Tests
 * Unit tests for the billing session API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/billing/session/[sessionId]/route';

// Mock dependencies
vi.mock('@/lib/stripe', () => ({
  getCheckoutSession: vi.fn(),
  stripeConfig: {
    products: {
      developerPro: {
        amount: 1900, // $19.00 in cents
      },
      team: {
        amount: 9900, // $99.00 in cents
      },
    },
  },
}));

const { getCheckoutSession } = await import('@/lib/stripe');

describe('/api/billing/session/[sessionId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid test failures
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const createRequest = (sessionId: string) => {
    return new NextRequest(`http://localhost:3000/api/billing/session/${sessionId}`, {
      method: 'GET',
    });
  };

  it('should retrieve session data successfully', async () => {
    const mockSession = {
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
              unit_amount: 1900, // $19.00 in cents
            },
          },
        ],
      },
    };

    vi.mocked(getCheckoutSession).mockResolvedValue(mockSession);

    const request = createRequest('cs_test_123');
    const response = await GET(request, { params: { sessionId: 'cs_test_123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        sessionId: 'cs_test_123',
        customerEmail: 'test@example.com',
        tier: 'pro',
        amount: 19.00,
        status: 'paid',
        subscriptionId: 'sub_123',
      },
    });

    expect(getCheckoutSession).toHaveBeenCalledWith('cs_test_123');
  });

  it('should return 400 when session ID is missing', async () => {
    const request = createRequest('');
    const response = await GET(request, { params: { sessionId: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'MISSING_SESSION_ID',
        message: 'Session ID is required',
      },
    });
  });

  it('should return 404 when session not found', async () => {
    vi.mocked(getCheckoutSession).mockResolvedValue(null);

    const request = createRequest('cs_nonexistent');
    const response = await GET(request, { params: { sessionId: 'cs_nonexistent' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found',
      },
    });
  });

  it('should handle session with customer_details instead of customer_email', async () => {
    const mockSession = {
      id: 'cs_test_456',
      customer_details: {
        email: 'customer@example.com',
      },
      metadata: {
        tier: 'team',
      },
      payment_status: 'paid',
      subscription: 'sub_456',
      line_items: {
        data: [
          {
            price: {
              unit_amount: 9900, // $99.00 in cents
            },
          },
        ],
      },
    };

    vi.mocked(getCheckoutSession).mockResolvedValue(mockSession);

    const request = createRequest('cs_test_456');
    const response = await GET(request, { params: { sessionId: 'cs_test_456' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.customerEmail).toBe('customer@example.com');
    expect(data.data.tier).toBe('team');
    expect(data.data.amount).toBe(99.00);
  });

  it('should fallback to configured amounts when line items are missing', async () => {
    const mockSession = {
      id: 'cs_test_789',
      customer_email: 'fallback@example.com',
      metadata: {
        tier: 'pro',
      },
      payment_status: 'paid',
      subscription: 'sub_789',
      // No line_items
    };

    vi.mocked(getCheckoutSession).mockResolvedValue(mockSession);

    const request = createRequest('cs_test_789');
    const response = await GET(request, { params: { sessionId: 'cs_test_789' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.amount).toBe(19.00); // Fallback to configured pro amount
  });

  it('should handle Stripe errors', async () => {
    vi.mocked(getCheckoutSession).mockRejectedValue(new Error('Stripe API error'));

    const request = createRequest('cs_error');
    const response = await GET(request, { params: { sessionId: 'cs_error' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve session',
      },
    });
  });
});