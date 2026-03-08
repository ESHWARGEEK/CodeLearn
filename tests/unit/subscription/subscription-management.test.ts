import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/subscription/route';
import { POST as CancelPOST } from '@/app/api/subscription/cancel/route';
import { POST as ReactivatePOST } from '@/app/api/subscription/reactivate/route';

// Mock the auth utility
vi.mock('@/lib/auth/verify', () => ({
  verifyAuth: vi.fn()
}));

// Mock the database operations
vi.mock('@/lib/db/subscriptions', () => ({
  getUserSubscription: vi.fn(),
  cancelUserSubscription: vi.fn(),
  reactivateUserSubscription: vi.fn(),
  formatSubscriptionData: vi.fn()
}));

import { verifyAuth } from '@/lib/auth/verify';
import { 
  getUserSubscription, 
  cancelUserSubscription, 
  reactivateUserSubscription,
  formatSubscriptionData 
} from '@/lib/db/subscriptions';

const mockVerifyAuth = vi.mocked(verifyAuth);
const mockGetUserSubscription = vi.mocked(getUserSubscription);
const mockCancelUserSubscription = vi.mocked(cancelUserSubscription);
const mockReactivateUserSubscription = vi.mocked(reactivateUserSubscription);
const mockFormatSubscriptionData = vi.mocked(formatSubscriptionData);

describe('Subscription Management API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/subscription', () => {
    it('should return subscription data for authenticated user', async () => {
      const mockUserSub = {
        userId: 'user123',
        tier: 'pro' as const,
        subscriptionStatus: 'active' as const,
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        paymentMethodLast4: '4242',
        paymentMethodBrand: 'visa',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      const mockFormattedData = {
        plan: 'pro' as const,
        status: 'active' as const,
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        paymentMethod: {
          type: 'card' as const,
          last4: '4242',
          brand: 'visa'
        }
      };

      mockVerifyAuth.mockResolvedValue({ success: true, userId: 'user123' });
      mockGetUserSubscription.mockResolvedValue(mockUserSub);
      mockFormatSubscriptionData.mockReturnValue(mockFormattedData);

      const request = new NextRequest('http://localhost/api/subscription');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockFormattedData);
      expect(mockGetUserSubscription).toHaveBeenCalledWith('user123');
    });

    it('should return 401 for unauthenticated user', async () => {
      mockVerifyAuth.mockResolvedValue({ success: false });

      const request = new NextRequest('http://localhost/api/subscription');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when subscription not found', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, userId: 'user123' });
      mockGetUserSubscription.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/subscription');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User subscription not found');
    });
  });

  describe('POST /api/subscription/cancel', () => {
    it('should cancel subscription for authenticated user', async () => {
      const mockUserSub = {
        userId: 'user123',
        tier: 'pro' as const,
        subscriptionStatus: 'active' as const,
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockVerifyAuth.mockResolvedValue({ success: true, userId: 'user123' });
      mockGetUserSubscription.mockResolvedValue(mockUserSub);
      mockCancelUserSubscription.mockResolvedValue();

      const request = new NextRequest('http://localhost/api/subscription/cancel', {
        method: 'POST'
      });
      const response = await CancelPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('cancelled at the end of the current billing period');
      expect(data.data.cancelAtPeriodEnd).toBe(true);
      expect(mockCancelUserSubscription).toHaveBeenCalledWith('user123');
    });

    it('should return 404 when no subscription found', async () => {
      mockVerifyAuth.mockResolvedValue({ success: true, userId: 'user123' });
      mockGetUserSubscription.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/subscription/cancel', {
        method: 'POST'
      });
      const response = await CancelPOST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('No subscription found');
    });
  });

  describe('POST /api/subscription/reactivate', () => {
    it('should reactivate cancelled subscription', async () => {
      const mockUserSub = {
        userId: 'user123',
        tier: 'pro' as const,
        subscriptionStatus: 'cancelled' as const,
        cancelAtPeriodEnd: true,
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockVerifyAuth.mockResolvedValue({ success: true, userId: 'user123' });
      mockGetUserSubscription.mockResolvedValue(mockUserSub);
      mockReactivateUserSubscription.mockResolvedValue();

      const request = new NextRequest('http://localhost/api/subscription/reactivate', {
        method: 'POST'
      });
      const response = await ReactivatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Subscription has been reactivated');
      expect(data.data.cancelAtPeriodEnd).toBe(false);
      expect(mockReactivateUserSubscription).toHaveBeenCalledWith('user123');
    });

    it('should return 400 when subscription is not cancelled', async () => {
      const mockUserSub = {
        userId: 'user123',
        tier: 'pro' as const,
        subscriptionStatus: 'active' as const,
        cancelAtPeriodEnd: false,
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockVerifyAuth.mockResolvedValue({ success: true, userId: 'user123' });
      mockGetUserSubscription.mockResolvedValue(mockUserSub);

      const request = new NextRequest('http://localhost/api/subscription/reactivate', {
        method: 'POST'
      });
      const response = await ReactivatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Subscription is not cancelled');
    });
  });
});