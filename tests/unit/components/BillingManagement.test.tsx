/**
 * BillingManagement Component Tests
 * Tests for the billing management interface
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BillingManagement } from '@/components/billing/BillingManagement';

// Mock the auth context
const mockUser = {
  userId: 'user-123',
  email: 'test@example.com',
  token: 'mock-token',
};

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('BillingManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Mock pending fetch
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));

    render(<BillingManagement />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render free tier subscription correctly', async () => {
    // Mock subscription API response
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/billing/subscription')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            data: {
              tier: 'free',
              status: null,
              currentPeriodEnd: null,
              cancelAtPeriodEnd: false,
              trialEnd: null,
            },
          }),
        });
      }
      if (url.includes('/api/billing/upcoming')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            data: { invoice: null },
          }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: {} }),
      });
    });

    render(<BillingManagement />);

    await waitFor(() => {
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Upgrade to unlock premium features')).toBeInTheDocument();
      expect(screen.getByText('• Unlimited template integrations')).toBeInTheDocument();
    });
  });

  it('should render pro tier subscription correctly', async () => {
    // Mock subscription API response
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/billing/subscription')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            data: {
              tier: 'pro',
              status: 'active',
              currentPeriodEnd: '2024-02-01T00:00:00.000Z',
              cancelAtPeriodEnd: false,
              trialEnd: null,
            },
          }),
        });
      }
      if (url.includes('/api/billing/upcoming')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            data: { invoice: null },
          }),
        });
      }
      if (url.includes('/api/billing/invoices')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            data: { invoices: [] },
          }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: {} }),
      });
    });

    render(<BillingManagement />);

    await waitFor(() => {
      expect(screen.getByText('Developer Pro')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Next billing')).toBeInTheDocument();
      expect(screen.getByText('Cancel Subscription')).toBeInTheDocument();
    });
  });

  it('should render cancelled subscription correctly', async () => {
    // Mock cancelled subscription API response
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/billing/subscription')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            data: {
              tier: 'pro',
              status: 'active',
              currentPeriodEnd: '2024-02-01T00:00:00.000Z',
              cancelAtPeriodEnd: true,
              trialEnd: null,
            },
          }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: {} }),
      });
    });

    render(<BillingManagement />);

    await waitFor(() => {
      expect(screen.getByText('Subscription Cancelled')).toBeInTheDocument();
      expect(screen.getByText('Reactivate')).toBeInTheDocument();
      expect(screen.getByText(/Access continues until/)).toBeInTheDocument();
    });
  });

  it('should render billing history when available', async () => {
    const mockInvoices = [
      {
        id: 'in_123',
        amount: 1900,
        currency: 'usd',
        status: 'paid',
        created: 1704067200,
        hostedInvoiceUrl: 'https://invoice.stripe.com/123',
        invoicePdf: 'https://invoice.stripe.com/123.pdf',
        description: 'Developer Pro subscription',
        periodStart: 1704067200,
        periodEnd: 1706745600,
      },
    ];

    // Mock subscription and invoices API response
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/billing/subscription')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            data: {
              tier: 'pro',
              status: 'active',
              currentPeriodEnd: '2024-02-01T00:00:00.000Z',
              cancelAtPeriodEnd: false,
              trialEnd: null,
            },
          }),
        });
      }
      if (url.includes('/api/billing/invoices')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            data: { invoices: mockInvoices },
          }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: {} }),
      });
    });

    render(<BillingManagement />);

    await waitFor(() => {
      expect(screen.getByText('Billing History')).toBeInTheDocument();
      expect(screen.getByText('$19.00 USD')).toBeInTheDocument();
      expect(screen.getByText('Developer Pro subscription')).toBeInTheDocument();
      expect(screen.getByText('paid')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    (global.fetch as any).mockRejectedValue(new Error('API Error'));

    render(<BillingManagement />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load subscription information')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });
});