import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, withRateLimit, getUserUsage, RATE_LIMITS } from '@/lib/middleware/rate-limiting';

// Mock dependencies
vi.mock('@/lib/auth/cognito', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/db/users', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/lib/db/integrations', () => ({
  getMonthlyIntegrationCount: vi.fn(),
}));

const { getCurrentUser } = await import('@/lib/auth/cognito');
const { getUser } = await import('@/lib/db/users');
const { getMonthlyIntegrationCount } = await import('@/lib/db/integrations');

const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockGetUser = vi.mocked(getUser);
const mockGetMonthlyIntegrationCount = vi.mocked(getMonthlyIntegrationCount);

describe('Rate Limiting Middleware', () => {
  const mockUser = {
    userId: 'user123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockUserDetails = {
    PK: 'USER#user123',
    SK: 'PROFILE',
    email: 'test@example.com',
    name: 'Test User',
    tier: 'free',
    createdAt: 1640995200,
    updatedAt: 1640995200,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow request when under limit', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetUser.mockResolvedValue(mockUserDetails);
      mockGetMonthlyIntegrationCount.mockResolvedValue(2);

      const request = new NextRequest('http://localhost/api/test');
      const result = await checkRateLimit(request, 'integrations');

      expect(result.allowed).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it('should block request when limit exceeded', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetUser.mockResolvedValue(mockUserDetails);
      mockGetMonthlyIntegrationCount.mockResolvedValue(5);

      const request = new NextRequest('http://localhost/api/test');
      const result = await checkRateLimit(request, 'integrations');

      expect(result.allowed).toBe(false);
      expect(result.response).toBeDefined();
      
      const responseData = await result.response!.json();
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(responseData.error.details.limit).toBe(5);
      expect(responseData.error.details.used).toBe(5);
    });

    it('should allow unlimited for team tier', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetUser.mockResolvedValue({
        ...mockUserDetails,
        tier: 'team',
      });
      mockGetMonthlyIntegrationCount.mockResolvedValue(100);

      const request = new NextRequest('http://localhost/api/test');
      const result = await checkRateLimit(request, 'integrations');

      expect(result.allowed).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it('should return 401 for unauthenticated user', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/test');
      const result = await checkRateLimit(request, 'integrations');

      expect(result.allowed).toBe(false);
      expect(result.response).toBeDefined();
      
      const responseData = await result.response!.json();
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 for non-existent user', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/test');
      const result = await checkRateLimit(request, 'integrations');

      expect(result.allowed).toBe(false);
      expect(result.response).toBeDefined();
      
      const responseData = await result.response!.json();
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe('USER_NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetUser.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/test');
      const result = await checkRateLimit(request, 'integrations');

      expect(result.allowed).toBe(false);
      expect(result.response).toBeDefined();
      
      const responseData = await result.response!.json();
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('withRateLimit', () => {
    it('should call handler when rate limit allows', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetUser.mockResolvedValue(mockUserDetails);
      mockGetMonthlyIntegrationCount.mockResolvedValue(2);

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const wrappedHandler = withRateLimit('integrations', mockHandler);
      const request = new NextRequest('http://localhost/api/test');
      const context = { params: {} };

      await wrappedHandler(request, context);

      expect(mockHandler).toHaveBeenCalledWith(request, context);
    });

    it('should return rate limit response when blocked', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetUser.mockResolvedValue(mockUserDetails);
      mockGetMonthlyIntegrationCount.mockResolvedValue(5);

      const mockHandler = vi.fn();
      const wrappedHandler = withRateLimit('integrations', mockHandler);
      const request = new NextRequest('http://localhost/api/test');
      const context = { params: {} };

      const response = await wrappedHandler(request, context);
      const responseData = await response.json();

      expect(mockHandler).not.toHaveBeenCalled();
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('getUserUsage', () => {
    it('should return usage data for free user', async () => {
      mockGetUser.mockResolvedValue(mockUserDetails);
      mockGetMonthlyIntegrationCount.mockResolvedValue(3);

      const usage = await getUserUsage('user123');

      expect(usage.tier).toBe('free');
      expect(usage.usage.integrations.used).toBe(3);
      expect(usage.usage.integrations.limit).toBe(5);
      expect(usage.resetDate).toBeDefined();
    });

    it('should return usage data for pro user', async () => {
      mockGetUser.mockResolvedValue({
        ...mockUserDetails,
        tier: 'pro',
      });
      mockGetMonthlyIntegrationCount.mockResolvedValue(25);

      const usage = await getUserUsage('user123');

      expect(usage.tier).toBe('pro');
      expect(usage.usage.integrations.used).toBe(25);
      expect(usage.usage.integrations.limit).toBe(50);
    });

    it('should return usage data for team user', async () => {
      mockGetUser.mockResolvedValue({
        ...mockUserDetails,
        tier: 'team',
      });
      mockGetMonthlyIntegrationCount.mockResolvedValue(100);

      const usage = await getUserUsage('user123');

      expect(usage.tier).toBe('team');
      expect(usage.usage.integrations.used).toBe(100);
      expect(usage.usage.integrations.limit).toBe(-1);
    });

    it('should throw error for non-existent user', async () => {
      mockGetUser.mockResolvedValue(null);

      await expect(getUserUsage('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('RATE_LIMITS configuration', () => {
    it('should have correct limits for free tier', () => {
      expect(RATE_LIMITS.free.integrations).toBe(5);
      expect(RATE_LIMITS.free.templates).toBe(10);
      expect(RATE_LIMITS.free.extractions).toBe(3);
    });

    it('should have correct limits for pro tier', () => {
      expect(RATE_LIMITS.pro.integrations).toBe(50);
      expect(RATE_LIMITS.pro.templates).toBe(100);
      expect(RATE_LIMITS.pro.extractions).toBe(25);
    });

    it('should have unlimited limits for team tier', () => {
      expect(RATE_LIMITS.team.integrations).toBe(-1);
      expect(RATE_LIMITS.team.templates).toBe(-1);
      expect(RATE_LIMITS.team.extractions).toBe(-1);
    });
  });
});