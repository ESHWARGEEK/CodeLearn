import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UsageMeter from '@/components/developer/UsageMeter';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

describe('UsageMeter', () => {
  const mockUsageData = {
    success: true,
    data: {
      tier: 'free' as const,
      usage: {
        integrations: { used: 3, limit: 5, percentage: 60 },
        templates: { used: 2, limit: 10, percentage: 20 },
        extractions: { used: 1, limit: 3, percentage: 33 },
      },
      resetDate: '2024-03-01T00:00:00.000Z',
      upgradeAvailable: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<UsageMeter userId="user123" />);

    expect(screen.getByText('Loading usage data...')).toBeInTheDocument();
  });

  it('should render usage data successfully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsageData),
    });

    render(<UsageMeter userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Usage & Limits')).toBeInTheDocument();
    });

    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('3/5')).toBeInTheDocument();
    expect(screen.getByText('2/10')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByText('60% used')).toBeInTheDocument();
  });

  it('should render compact version', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsageData),
    });

    render(<UsageMeter userId="user123" compact />);

    await waitFor(() => {
      expect(screen.getByText('Usage')).toBeInTheDocument();
    });

    expect(screen.getByText('3/5')).toBeInTheDocument();
    expect(screen.queryByText('Templates')).not.toBeInTheDocument();
    expect(screen.queryByText('Extractions')).not.toBeInTheDocument();
  });

  it('should render error state', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<UsageMeter userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
    });

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should handle API error response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        error: { message: 'User not found' },
      }),
    });

    render(<UsageMeter userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('should retry on error', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUsageData),
      });

    render(<UsageMeter userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(screen.getByText('Usage & Limits')).toBeInTheDocument();
    });
  });

  it('should show upgrade CTA for free users', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsageData),
    });

    render(<UsageMeter userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
    });

    expect(screen.getByText('View Pricing Plans')).toBeInTheDocument();
  });

  it('should not show upgrade CTA when disabled', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsageData),
    });

    render(<UsageMeter userId="user123" showUpgradeCTA={false} />);

    await waitFor(() => {
      expect(screen.getByText('Usage & Limits')).toBeInTheDocument();
    });

    expect(screen.queryByText('Upgrade to Pro')).not.toBeInTheDocument();
  });

  it('should handle pro user without upgrade CTA', async () => {
    const proUsageData = {
      ...mockUsageData,
      data: {
        ...mockUsageData.data,
        tier: 'pro' as const,
        upgradeAvailable: false,
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(proUsageData),
    });

    render(<UsageMeter userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });

    expect(screen.queryByText('Upgrade to Pro')).not.toBeInTheDocument();
  });

  it('should handle team user with unlimited usage', async () => {
    const teamUsageData = {
      success: true,
      data: {
        tier: 'team' as const,
        usage: {
          integrations: { used: 100, limit: -1, percentage: 0 },
          templates: { used: 200, limit: -1, percentage: 0 },
          extractions: { used: 50, limit: -1, percentage: 0 },
        },
        resetDate: '2024-03-01T00:00:00.000Z',
        upgradeAvailable: false,
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(teamUsageData),
    });

    render(<UsageMeter userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Team')).toBeInTheDocument();
    });

    expect(screen.getByText('100 (Unlimited)')).toBeInTheDocument();
    expect(screen.getByText('200 (Unlimited)')).toBeInTheDocument();
    expect(screen.getByText('50 (Unlimited)')).toBeInTheDocument();
  });

  it('should show high usage warning', async () => {
    const highUsageData = {
      ...mockUsageData,
      data: {
        ...mockUsageData.data,
        usage: {
          integrations: { used: 4, limit: 5, percentage: 80 },
          templates: { used: 9, limit: 10, percentage: 90 },
          extractions: { used: 2, limit: 3, percentage: 67 },
        },
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(highUsageData),
    });

    render(<UsageMeter userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Usage Warning')).toBeInTheDocument();
    });

    expect(screen.getByText(/approaching your monthly limits/)).toBeInTheDocument();
  });

  it('should open pricing page when upgrade button clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsageData),
    });

    render(<UsageMeter userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('View Pricing Plans')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Pricing Plans'));

    expect(mockWindowOpen).toHaveBeenCalledWith('/pricing', '_blank');
  });

  it('should show upgrade CTA in compact mode for high usage', async () => {
    const highUsageData = {
      ...mockUsageData,
      data: {
        ...mockUsageData.data,
        usage: {
          integrations: { used: 4, limit: 5, percentage: 80 },
          templates: { used: 2, limit: 10, percentage: 20 },
          extractions: { used: 1, limit: 3, percentage: 33 },
        },
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(highUsageData),
    });

    render(<UsageMeter userId="user123" compact />);

    await waitFor(() => {
      expect(screen.getByText('Upgrade for Unlimited')).toBeInTheDocument();
    });
  });

  it('should format reset date correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsageData),
    });

    render(<UsageMeter userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Resets Mar 1, 2024')).toBeInTheDocument();
    });
  });
});