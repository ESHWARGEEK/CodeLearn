import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT } from '@/app/api/portfolio/[userId]/settings/route';
import { NextRequest } from 'next/server';
import * as portfolioSettingsDb from '@/lib/db/portfolio-settings';

// Mock the database functions
vi.mock('@/lib/db/portfolio-settings', () => ({
  getPortfolioSettings: vi.fn(),
  updatePortfolioSettings: vi.fn(),
}));

describe('/api/portfolio/[userId]/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return portfolio settings for valid user', async () => {
      const mockSettings = {
        isPublic: true,
        showGithubLinks: true,
        showTechStack: true,
        customDescription: 'My awesome portfolio',
      };

      vi.mocked(portfolioSettingsDb.getPortfolioSettings).mockResolvedValue(mockSettings);

      const request = new NextRequest('http://localhost/api/portfolio/user-123/settings');
      const params = { userId: 'user-123' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockSettings);
      expect(portfolioSettingsDb.getPortfolioSettings).toHaveBeenCalledWith('user-123');
    });

    it('should return 400 for missing userId', async () => {
      const request = new NextRequest('http://localhost/api/portfolio//settings');
      const params = { userId: '' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MISSING_USER_ID');
    });

    it('should return 500 for database error', async () => {
      vi.mocked(portfolioSettingsDb.getPortfolioSettings).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost/api/portfolio/user-123/settings');
      const params = { userId: 'user-123' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT', () => {
    it('should update portfolio settings successfully', async () => {
      const updateData = {
        isPublic: true,
        showGithubLinks: false,
        showTechStack: true,
        customDescription: 'Updated description',
      };

      vi.mocked(portfolioSettingsDb.updatePortfolioSettings).mockResolvedValue();

      const request = new NextRequest('http://localhost/api/portfolio/user-123/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const params = { userId: 'user-123' };

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updateData);
      expect(portfolioSettingsDb.updatePortfolioSettings).toHaveBeenCalledWith(
        'user-123',
        updateData
      );
    });

    it('should return 400 for invalid isPublic value', async () => {
      const updateData = {
        isPublic: 'invalid', // Should be boolean
        showGithubLinks: true,
        showTechStack: true,
      };

      const request = new NextRequest('http://localhost/api/portfolio/user-123/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const params = { userId: 'user-123' };

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    it('should return 400 for missing userId', async () => {
      const updateData = {
        isPublic: true,
        showGithubLinks: true,
        showTechStack: true,
      };

      const request = new NextRequest('http://localhost/api/portfolio//settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const params = { userId: '' };

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MISSING_USER_ID');
    });

    it('should handle optional fields correctly', async () => {
      const updateData = {
        isPublic: false,
        // showGithubLinks and showTechStack not provided - should default
      };

      vi.mocked(portfolioSettingsDb.updatePortfolioSettings).mockResolvedValue();

      const request = new NextRequest('http://localhost/api/portfolio/user-123/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const params = { userId: 'user-123' };

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.isPublic).toBe(false);
      expect(data.data.showGithubLinks).toBe(true); // Default value
      expect(data.data.showTechStack).toBe(true); // Default value
    });
  });
});