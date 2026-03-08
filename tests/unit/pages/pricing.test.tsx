/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PricingPage from '@/app/(dashboard)/pricing/page';
import { useAuth } from '@/lib/auth/auth-context';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

const mockPush = vi.fn();
const mockUseRouter = useRouter as any;
const mockUseAuth = useAuth as any;

describe('PricingPage', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    });

    (global.fetch as any).mockClear();
    mockPush.mockClear();
  });

  it('should render all three pricing tiers', () => {
    render(<PricingPage />);

    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Developer Pro')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  it('should display correct pricing', () => {
    render(<PricingPage />);

    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$19')).toBeInTheDocument();
    expect(screen.getByText('$99')).toBeInTheDocument();
  });

  it('should show features for each tier', () => {
    render(<PricingPage />);

    expect(screen.getByText('5 template integrations per month')).toBeInTheDocument();
    expect(screen.getByText('Unlimited template integrations')).toBeInTheDocument();
    expect(screen.getByText('Team collaboration')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated and upgrade clicked', () => {
    render(<PricingPage />);

    const upgradeButton = screen.getByText('Upgrade to Pro');
    fireEvent.click(upgradeButton);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should create checkout session when authenticated user upgrades', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123', tier: 'free', token: 'mock-token' },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    });

    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: { url: 'https://checkout.stripe.com/session-123' }
      }),
    });

    // Mock window.location
    delete (window as any).location;
    (window as any).location = { 
      href: '',
      origin: 'http://localhost'
    };

    render(<PricingPage />);

    const upgradeButton = screen.getByText('Upgrade to Pro');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify({
          tier: 'pro',
          successUrl: 'http://localhost/billing/success',
          cancelUrl: 'http://localhost/billing/cancel',
        }),
      });
    });
  });

  it('should show current plan for users with active subscription', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123', tier: 'pro', token: 'mock-token' },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    });

    render(<PricingPage />);

    const currentPlanButtons = screen.getAllByText('Current Plan');
    expect(currentPlanButtons).toHaveLength(1);
  });

  it('should mark Developer Pro as most popular', () => {
    render(<PricingPage />);

    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });
});