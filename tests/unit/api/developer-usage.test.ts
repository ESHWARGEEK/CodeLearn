import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/developer/usage/[userId]/route';

// Mock dependencies
vi.mock('@/lib/auth/cognito', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/middleware/rate-limiting', () => ({
  getUserUsage: vi.fn(),
}));

const { getCurrentUser } = await import('@/lib/auth/cognito');
const { getUserUsage } = await import('@/lib/middleware/rate-limiting');

const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockGetUserUsage = vi.mocked(getUserUsage);

describe('/api/developer/usage/[userId]', () => {
  const mockUser = {
    userId: 'user123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockUsageData = {
    tier: 'free' as const,
    usage: {
      integrations: { used: 3, limit: 5 },
      templates: { used: 2, limit: 10 },
      extractions: { used: 1, limit: 3 },
    },
    resetDate: '2024-03-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return usage data successfully', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetUserUsage.mockResolvedValue(mockUsageData);

    const request = new NextRequest('http://localhost/api/developer/usage/user123');
    const response = await GET(request, { params: { userId: 'user123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.tier).toBe('free');
    expect(data.data.usage.integrations.used).toBe(3);
    expect(data.data.usage.integrations.limit).toBe(5);
    expect(data.data.usage.integrations.percentage).toBe(60);
    expect(data.data.upgradeAvailable).toBe(true);
  });

  it('should return 400 for missing user ID', async () => {
    const request = new NextRequest('http://localhost/api/developer/usage/');
    const response = await GET(request, { params: { userId: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('MISSING_USER_ID');
  });

  it('should return 401 for unauthenticated user', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/developer/usage/user123');
    const response = await GET(request, { params: { userId: 'user123' } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('UNAUTHORIZED');
  });

  it('should return 403 for accessing other user data', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);

    const request = new NextRequest('http://localhost/api/developer/usage/otheruser');
    const response = await GET(request, { params: { userId: 'otheruser' } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('ACCESS_DENIED');
  });

  it('should return 404 for non-existent user', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetUserUsage.mockRejectedValue(new Error('User not found'));

    const request = new NextRequest('http://localhost/api/developer/usage/user123');
    const response = await GET(request, { params: { userId: 'user123' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('USER_NOT_FOUND');
  });

  it('should handle pro user with higher limits', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetUserUsage.mockResolvedValue({
      tier: 'pro',
      usage: {
        integrations: { used: 25, limit: 50 },
        templates: { used: 40, limit: 100 },
        extractions: { used: 10, limit: 25 },
      },
      resetDate: '2024-03-01T00:00:00.000Z',
    });

    const request = new NextRequest('http://localhost/api/developer/usage/user123');
    const response = await GET(request, { params: { userId: 'user123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.tier).toBe('pro');
    expect(data.data.usage.integrations.percentage).toBe(50);
    expect(data.data.upgradeAvailable).toBe(false);
  });

  it('should handle team user with unlimited limits', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetUserUsage.mockResolvedValue({
      tier: 'team',
      usage: {
        integrations: { used: 100, limit: -1 },
        templates: { used: 200, limit: -1 },
        extractions: { used: 50, limit: -1 },
      },
      resetDate: '2024-03-01T00:00:00.000Z',
    });

    const request = new NextRequest('http://localhost/api/developer/usage/user123');
    const response = await GET(request, { params: { userId: 'user123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.tier).toBe('team');
    expect(data.data.usage.integrations.percentage).toBe(0);
    expect(data.data.upgradeAvailable).toBe(false);
  });

  it('should calculate percentages correctly', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetUserUsage.mockResolvedValue({
      tier: 'free',
      usage: {
        integrations: { used: 4, limit: 5 },
        templates: { used: 7, limit: 10 },
        extractions: { used: 3, limit: 3 },
      },
      resetDate: '2024-03-01T00:00:00.000Z',
    });

    const request = new NextRequest('http://localhost/api/developer/usage/user123');
    const response = await GET(request, { params: { userId: 'user123' } });
    const data = await response.json();

    expect(data.data.usage.integrations.percentage).toBe(80);
    expect(data.data.usage.templates.percentage).toBe(70);
    expect(data.data.usage.extractions.percentage).toBe(100);
  });

  it('should return 500 for database error', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetUserUsage.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost/api/developer/usage/user123');
    const response = await GET(request, { params: { userId: 'user123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('INTERNAL_ERROR');
  });
});