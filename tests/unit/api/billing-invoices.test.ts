/**
 * Billing Invoices API Tests
 * Tests for invoice retrieval functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/billing/invoices/route';

// Mock dependencies
vi.mock('@/lib/stripe/config', () => ({
  stripe: {
    invoices: {
      list: vi.fn(),
    },
  },
}));

vi.mock('@/lib/db/users', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/lib/auth/jwt', () => ({
  verifyToken: vi.fn(),
}));

const mockStripe = vi.mocked(await import('@/lib/stripe/config')).stripe;
const mockGetUser = vi.mocked(await import('@/lib/db/users')).getUser;
const mockVerifyToken = vi.mocked(await import('@/lib/auth/jwt')).verifyToken;

describe('GET /api/billing/invoices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve invoices successfully', async () => {
    // Mock authentication
    mockVerifyToken.mockResolvedValue({ userId: 'user-123' });
    
    // Mock user with Stripe customer ID
    mockGetUser.mockResolvedValue({
      userId: 'user-123',
      email: 'test@example.com',
      stripeCustomerId: 'cus_123',
      tier: 'pro',
    });

    // Mock Stripe invoices
    const mockInvoices = {
      data: [
        {
          id: 'in_123',
          amount_paid: 1900,
          currency: 'usd',
          status: 'paid',
          created: 1704067200, // 2024-01-01
          hosted_invoice_url: 'https://invoice.stripe.com/123',
          invoice_pdf: 'https://invoice.stripe.com/123.pdf',
          description: 'Developer Pro subscription',
          lines: {
            data: [{ description: 'Developer Pro subscription' }],
          },
          period_start: 1704067200,
          period_end: 1706745600,
        },
        {
          id: 'in_124',
          amount_paid: 1900,
          currency: 'usd',
          status: 'paid',
          created: 1701475200, // 2023-12-01
          hosted_invoice_url: 'https://invoice.stripe.com/124',
          invoice_pdf: 'https://invoice.stripe.com/124.pdf',
          description: null,
          lines: {
            data: [{ description: 'Monthly subscription' }],
          },
          period_start: 1701475200,
          period_end: 1704067200,
        },
      ],
    };

    mockStripe.invoices.list.mockResolvedValue(mockInvoices);

    const request = new NextRequest('http://localhost/api/billing/invoices', {
      method: 'GET',
      headers: {
        'authorization': 'Bearer valid-token',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.invoices).toHaveLength(2);
    
    const firstInvoice = data.data.invoices[0];
    expect(firstInvoice.id).toBe('in_123');
    expect(firstInvoice.amount).toBe(1900);
    expect(firstInvoice.currency).toBe('usd');
    expect(firstInvoice.status).toBe('paid');
    expect(firstInvoice.created).toBe(1704067200);
    expect(firstInvoice.hostedInvoiceUrl).toBe('https://invoice.stripe.com/123');
    expect(firstInvoice.invoicePdf).toBe('https://invoice.stripe.com/123.pdf');
    expect(firstInvoice.description).toBe('Developer Pro subscription');

    expect(mockStripe.invoices.list).toHaveBeenCalledWith({
      customer: 'cus_123',
      limit: 20,
    });
  });

  it('should return empty invoices for user without Stripe customer ID', async () => {
    // Mock authentication
    mockVerifyToken.mockResolvedValue({ userId: 'user-123' });
    
    // Mock user without Stripe customer ID
    mockGetUser.mockResolvedValue({
      userId: 'user-123',
      email: 'test@example.com',
      tier: 'free',
    });

    const request = new NextRequest('http://localhost/api/billing/invoices', {
      method: 'GET',
      headers: {
        'authorization': 'Bearer valid-token',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.invoices).toEqual([]);
    expect(mockStripe.invoices.list).not.toHaveBeenCalled();
  });

  it('should return error if not authenticated', async () => {
    const request = new NextRequest('http://localhost/api/billing/invoices', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return error if user not found', async () => {
    // Mock authentication
    mockVerifyToken.mockResolvedValue({ userId: 'user-123' });
    
    // Mock user not found
    mockGetUser.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/billing/invoices', {
      method: 'GET',
      headers: {
        'authorization': 'Bearer valid-token',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('USER_NOT_FOUND');
  });

  it('should handle Stripe API errors', async () => {
    // Mock authentication
    mockVerifyToken.mockResolvedValue({ userId: 'user-123' });
    
    // Mock user with Stripe customer ID
    mockGetUser.mockResolvedValue({
      userId: 'user-123',
      email: 'test@example.com',
      stripeCustomerId: 'cus_123',
      tier: 'pro',
    });

    // Mock Stripe error
    mockStripe.invoices.list.mockRejectedValue(new Error('Stripe API error'));

    const request = new NextRequest('http://localhost/api/billing/invoices', {
      method: 'GET',
      headers: {
        'authorization': 'Bearer valid-token',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('should handle invoices with missing description gracefully', async () => {
    // Mock authentication
    mockVerifyToken.mockResolvedValue({ userId: 'user-123' });
    
    // Mock user with Stripe customer ID
    mockGetUser.mockResolvedValue({
      userId: 'user-123',
      email: 'test@example.com',
      stripeCustomerId: 'cus_123',
      tier: 'pro',
    });

    // Mock invoice with missing description
    const mockInvoices = {
      data: [
        {
          id: 'in_123',
          amount_paid: 1900,
          currency: 'usd',
          status: 'paid',
          created: 1704067200,
          hosted_invoice_url: 'https://invoice.stripe.com/123',
          invoice_pdf: 'https://invoice.stripe.com/123.pdf',
          description: null,
          lines: {
            data: [],
          },
          period_start: 1704067200,
          period_end: 1706745600,
        },
      ],
    };

    mockStripe.invoices.list.mockResolvedValue(mockInvoices);

    const request = new NextRequest('http://localhost/api/billing/invoices', {
      method: 'GET',
      headers: {
        'authorization': 'Bearer valid-token',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.invoices).toHaveLength(1);
    expect(data.data.invoices[0].description).toBe('Subscription');
  });
});