/**
 * Billing Subscription Management API Tests
 * Tests for subscription cancel/reactivate functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as cancelSubscription } from '@/app/api/billing/subscription/cancel/route';
import { POST as reactivateSubscription } from '@/app/api/billing/subscription/reactivate/route';

// Mock dependencies
vi.mock('@/lib/stripe/subscriptions', () => ({
  cancelSubscription: vi.fn(),
  reactivateSubscription: vi.fn(),
  getSubscriptionByCustomerId: vi.fn(),
}));

vi.mock('@/lib/db/users', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/lib/auth/jwt', () => ({
  verifyToken: vi.fn(),
}));

const mockCancelSubscription = vi.mocked(await import('@/lib/stripe/subscriptions')).cancelSubscription;
const mockReactivateSubscription = vi.mocked(await import('@/lib/stripe/subscriptions')).reactivateSubscription;
const mockGetSubscriptionByCustomerId = vi.mocked(await import('@/lib/stripe/subscriptions')).getSubscriptionByCustomerId;
const mockGetUser = vi.mocked(await import('@/lib/db/users')).getUser;
const mockVerifyToken = vi.mocked(await import('@/lib/auth/jwt')).verifyToken;

describe('Billing Subscription Management API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/billing/subscription/cancel', () => {
    it('should cancel subscription successfully', async () => {
      // Mock authentication
      mockVerifyToken.mockResolvedValue({ userId: 'user-123' });
      
      // Mock user with Stripe customer ID
      mockGetUser.mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_123',
        tier: 'pro',
      });

      // Mock active subscription
      mockGetSubscriptionByCustomerId.mockResolvedValue({
        id: 'sub_123',
        customerId: 'cus_123',
        status: 'active',
        tier: 'pro',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: false,
      });

      // Mock successful cancellation
      mockCancelSubscription.mockResolvedValue(true);

      const request = new NextRequest('http://localhost/api/billing/subscription/cancel', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await cancelSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain('cancelled at the end');
      expect(data.data.cancelAtPeriodEnd).toBe(true);
      expect(mockCancelSubscription).toHaveBeenCalledWith('sub_123');
    });

    it('should return error if subscription already cancelled', async () => {
      // Mock authentication
      mockVerifyToken.mockResolvedValue({ userId: 'user-123' });
      
      // Mock user with Stripe customer ID
      mockGetUser.mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_123',
        tier: 'pro',
      });

      // Mock already cancelled subscription
      mockGetSubscriptionByCustomerId.mockResolvedValue({
        id: 'sub_123',
        customerId: 'cus_123',
        status: 'active',
        tier: 'pro',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: true, // Already cancelled
      });

      const request = new NextRequest('http://localhost/api/billing/subscription/cancel', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await cancelSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('ALREADY_CANCELLED');
      expect(mockCancelSubscription).not.toHaveBeenCalled();
    });

    it('should return error if user has no subscription', async () => {
      // Mock authentication
      mockVerifyToken.mockResolvedValue({ userId: 'user-123' });
      
      // Mock user without Stripe customer ID
      mockGetUser.mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        tier: 'free',
      });

      const request = new NextRequest('http://localhost/api/billing/subscription/cancel', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await cancelSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_SUBSCRIPTION');
    });

    it('should return error if not authenticated', async () => {
      const request = new NextRequest('http://localhost/api/billing/subscription/cancel', {
        method: 'POST',
      });

      const response = await cancelSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/billing/subscription/reactivate', () => {
    it('should reactivate subscription successfully', async () => {
      // Mock authentication
      mockVerifyToken.mockResolvedValue({ userId: 'user-123' });
      
      // Mock user with Stripe customer ID
      mockGetUser.mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_123',
        tier: 'pro',
      });

      // Mock cancelled subscription
      mockGetSubscriptionByCustomerId.mockResolvedValue({
        id: 'sub_123',
        customerId: 'cus_123',
        status: 'active',
        tier: 'pro',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: true, // Cancelled
      });

      // Mock successful reactivation
      mockReactivateSubscription.mockResolvedValue(true);

      const request = new NextRequest('http://localhost/api/billing/subscription/reactivate', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await reactivateSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain('reactivated successfully');
      expect(data.data.cancelAtPeriodEnd).toBe(false);
      expect(mockReactivateSubscription).toHaveBeenCalledWith('sub_123');
    });

    it('should return error if subscription not cancelled', async () => {
      // Mock authentication
      mockVerifyToken.mockResolvedValue({ userId: 'user-123' });
      
      // Mock user with Stripe customer ID
      mockGetUser.mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_123',
        tier: 'pro',
      });

      // Mock active subscription (not cancelled)
      mockGetSubscriptionByCustomerId.mockResolvedValue({
        id: 'sub_123',
        customerId: 'cus_123',
        status: 'active',
        tier: 'pro',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: false, // Not cancelled
      });

      const request = new NextRequest('http://localhost/api/billing/subscription/reactivate', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await reactivateSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_CANCELLED');
      expect(mockReactivateSubscription).not.toHaveBeenCalled();
    });

    it('should handle Stripe API failures', async () => {
      // Mock authentication
      mockVerifyToken.mockResolvedValue({ userId: 'user-123' });
      
      // Mock user with Stripe customer ID
      mockGetUser.mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_123',
        tier: 'pro',
      });

      // Mock cancelled subscription
      mockGetSubscriptionByCustomerId.mockResolvedValue({
        id: 'sub_123',
        customerId: 'cus_123',
        status: 'active',
        tier: 'pro',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: true,
      });

      // Mock failed reactivation
      mockReactivateSubscription.mockResolvedValue(false);

      const request = new NextRequest('http://localhost/api/billing/subscription/reactivate', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = await reactivateSubscription(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('REACTIVATE_FAILED');
    });
  });
});