/**
 * Unit tests for Netlify deployment client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createDeployment,
  getDeploymentStatus,
  cancelDeployment,
  getDeploymentLogs,
  isNetlifyConfigured,
} from '@/lib/deployment/netlify-client';

// Mock fetch
global.fetch = vi.fn();

describe('Netlify Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NETLIFY_TOKEN = 'test-netlify-token';
  });

  describe('isNetlifyConfigured', () => {
    it('should return true when NETLIFY_TOKEN is set', () => {
      process.env.NETLIFY_TOKEN = 'test-token';
      expect(isNetlifyConfigured()).toBe(true);
    });

  describe('isNetlifyConfigured', () => {
    it('should return true when NETLIFY_TOKEN is set', () => {
      process.env.NETLIFY_TOKEN = 'test-token';
      expect(isNetlifyConfigured()).toBe(true);
    });

    it('should return false when NETLIFY_TOKEN is not set', () => {
      delete process.env.NETLIFY_TOKEN;
      expect(isNetlifyConfigured()).toBe(false);
    });
  });

  describe('createDeployment', () => {
    beforeEach(() => {
      process.env.NETLIFY_TOKEN = 'test-token';
    });

    it('should create a new site and deployment', async () => {
      const mockSite = {
        id: 'site-123',
        name: 'test-project',
        url: 'http://test-project.netlify.app',
        ssl_url: 'https://test-project.netlify.app',
        admin_url: 'https://app.netlify.com/sites/test-project',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockDeployment = {
        id: 'deploy-456',
        site_id: 'site-123',
        name: 'test-project',
        url: 'http://test-project.netlify.app',
        ssl_url: 'https://test-project.netlify.app',
        state: 'building',
        created_at: '2024-01-01T00:00:00Z',
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSite,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDeployment,
        });

      const result = await createDeployment({
        siteName: 'test-project',
        files: {
          'index.html': '<html><body>Hello</body></html>',
        },
      });

      expect(result).toEqual({
        id: 'deploy-456',
        url: 'https://test-project.netlify.app',
        status: 'building',
        state: 'building',
        createdAt: '2024-01-01T00:00:00Z',
        deployedAt: undefined,
        siteId: 'site-123',
        siteName: 'test-project',
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle existing site', async () => {
      const mockSite = {
        id: 'site-123',
        name: 'test-project',
        url: 'http://test-project.netlify.app',
        ssl_url: 'https://test-project.netlify.app',
        admin_url: 'https://app.netlify.com/sites/test-project',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockDeployment = {
        id: 'deploy-456',
        site_id: 'site-123',
        name: 'test-project',
        url: 'http://test-project.netlify.app',
        ssl_url: 'https://test-project.netlify.app',
        state: 'ready',
        created_at: '2024-01-01T00:00:00Z',
        published_at: '2024-01-01T00:05:00Z',
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Site name already exists' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSite,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDeployment,
        });

      const result = await createDeployment({
        siteName: 'test-project',
        files: {
          'index.html': '<html><body>Hello</body></html>',
        },
      });

      expect(result.status).toBe('ready');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw error when NETLIFY_TOKEN is not set', async () => {
      delete process.env.NETLIFY_TOKEN;

      await expect(
        createDeployment({
          siteName: 'test-project',
          files: {},
        })
      ).rejects.toThrow('NETLIFY_TOKEN environment variable is not set');
    });

    it('should throw error on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'API Error' }),
      });

      await expect(
        createDeployment({
          siteName: 'test-project',
          files: {},
        })
      ).rejects.toThrow('Netlify site creation failed');
    });
  });

  describe('getDeploymentStatus', () => {
    beforeEach(() => {
      process.env.NETLIFY_TOKEN = 'test-token';
    });

    it('should get deployment status', async () => {
      const mockDeployment = {
        id: 'deploy-456',
        site_id: 'site-123',
        name: 'test-project',
        url: 'http://test-project.netlify.app',
        ssl_url: 'https://test-project.netlify.app',
        state: 'ready',
        created_at: '2024-01-01T00:00:00Z',
        published_at: '2024-01-01T00:05:00Z',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeployment,
      });

      const result = await getDeploymentStatus('deploy-456');

      expect(result).toEqual({
        id: 'deploy-456',
        url: 'https://test-project.netlify.app',
        status: 'ready',
        state: 'ready',
        createdAt: '2024-01-01T00:00:00Z',
        deployedAt: '2024-01-01T00:05:00Z',
        siteId: 'site-123',
        siteName: 'test-project',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.netlify.com/api/v1/deploys/deploy-456',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should map different states correctly', async () => {
      const states = [
        { netlify: 'new', expected: 'building' },
        { netlify: 'preparing', expected: 'building' },
        { netlify: 'processing', expected: 'building' },
        { netlify: 'building', expected: 'building' },
        { netlify: 'enqueued', expected: 'building' },
        { netlify: 'ready', expected: 'ready' },
        { netlify: 'published', expected: 'ready' },
        { netlify: 'error', expected: 'error' },
        { netlify: 'failed', expected: 'error' },
      ];

      for (const { netlify, expected } of states) {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'deploy-456',
            site_id: 'site-123',
            name: 'test',
            url: 'https://test.netlify.app',
            ssl_url: 'https://test.netlify.app',
            state: netlify,
            created_at: '2024-01-01T00:00:00Z',
          }),
        });

        const result = await getDeploymentStatus('deploy-456');
        expect(result.status).toBe(expected);
      }
    });

    it('should throw error on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not found' }),
      });

      await expect(getDeploymentStatus('invalid-id')).rejects.toThrow(
        'Failed to get deployment status'
      );
    });
  });

  describe('cancelDeployment', () => {
    beforeEach(() => {
      process.env.NETLIFY_TOKEN = 'test-token';
    });

    it('should cancel deployment', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await expect(cancelDeployment('deploy-456')).resolves.toBeUndefined();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.netlify.com/api/v1/deploys/deploy-456',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should throw error on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Cannot cancel' }),
      });

      await expect(cancelDeployment('deploy-456')).rejects.toThrow(
        'Failed to cancel deployment'
      );
    });
  });

  describe('getDeploymentLogs', () => {
    beforeEach(() => {
      process.env.NETLIFY_TOKEN = 'test-token';
    });

    it('should get deployment logs', async () => {
      const mockLogs = {
        messages: [
          'Starting build',
          'Installing dependencies',
          'Build complete',
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLogs,
      });

      const result = await getDeploymentLogs('deploy-456');

      expect(result).toEqual(mockLogs.messages);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.netlify.com/api/v1/deploys/deploy-456/log',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should return empty array when no messages', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await getDeploymentLogs('deploy-456');

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not found' }),
      });

      await expect(getDeploymentLogs('invalid-id')).rejects.toThrow(
        'Failed to get deployment logs'
      );
    });
  });
});
