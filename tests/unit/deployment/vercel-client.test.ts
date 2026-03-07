/**
 * Unit tests for Vercel deployment client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createDeployment,
  getDeploymentStatus,
  cancelDeployment,
  isVercelConfigured,
} from '@/lib/deployment/vercel-client';

// Mock fetch
global.fetch = vi.fn();

describe('Vercel Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VERCEL_TOKEN = 'test-token';
  });

  describe('isVercelConfigured', () => {
    it('should return true when VERCEL_TOKEN is set', () => {
      process.env.VERCEL_TOKEN = 'test-token';
      expect(isVercelConfigured()).toBe(true);
    });

    it('should return false when VERCEL_TOKEN is not set', () => {
      delete process.env.VERCEL_TOKEN;
      expect(isVercelConfigured()).toBe(false);
    });
  });

  describe('createDeployment', () => {
    it('should create a deployment successfully', async () => {
      const mockResponse = {
        id: 'dpl_123',
        url: 'my-project-abc123.vercel.app',
        readyState: 'QUEUED',
        createdAt: 1709251200000,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createDeployment({
        projectName: 'my-project',
        files: {
          'index.html': '<html><body>Hello</body></html>',
        },
        framework: 'static',
      });

      expect(result).toEqual({
        id: 'dpl_123',
        url: 'my-project-abc123.vercel.app',
        status: 'QUEUED',
        readyState: 'QUEUED',
        createdAt: 1709251200000,
        buildingAt: undefined,
        readyAt: undefined,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.vercel.com/v13/deployments',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should throw error when VERCEL_TOKEN is not set', async () => {
      delete process.env.VERCEL_TOKEN;

      await expect(
        createDeployment({
          projectName: 'my-project',
          files: {},
        })
      ).rejects.toThrow('VERCEL_TOKEN environment variable is not set');
    });

    it('should throw error when API request fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({
          error: { message: 'Invalid project name' },
        }),
      });

      await expect(
        createDeployment({
          projectName: 'my-project',
          files: {},
        })
      ).rejects.toThrow('Vercel deployment failed: Invalid project name');
    });

    it('should encode files as base64', async () => {
      const mockResponse = {
        id: 'dpl_123',
        url: 'test.vercel.app',
        readyState: 'QUEUED',
        createdAt: 1709251200000,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await createDeployment({
        projectName: 'test',
        files: {
          'index.html': '<html>Test</html>',
        },
      });

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.files[0]).toEqual({
        file: 'index.html',
        data: Buffer.from('<html>Test</html>').toString('base64'),
        encoding: 'base64',
      });
    });
  });

  describe('getDeploymentStatus', () => {
    it('should get deployment status successfully', async () => {
      const mockResponse = {
        id: 'dpl_123',
        url: 'my-project.vercel.app',
        readyState: 'READY',
        createdAt: 1709251200000,
        buildingAt: 1709251210000,
        readyAt: 1709251300000,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getDeploymentStatus('dpl_123');

      expect(result).toEqual({
        id: 'dpl_123',
        url: 'my-project.vercel.app',
        status: 'READY',
        readyState: 'READY',
        createdAt: 1709251200000,
        buildingAt: 1709251210000,
        readyAt: 1709251300000,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.vercel.com/v13/deployments/dpl_123',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token',
          },
        })
      );
    });

    it('should throw error when deployment not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: async () => ({
          error: { message: 'Deployment not found' },
        }),
      });

      await expect(getDeploymentStatus('dpl_invalid')).rejects.toThrow(
        'Failed to get deployment status: Deployment not found'
      );
    });
  });

  describe('cancelDeployment', () => {
    it('should cancel deployment successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await cancelDeployment('dpl_123');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.vercel.com/v13/deployments/dpl_123/cancel',
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer test-token',
          },
        })
      );
    });

    it('should throw error when cancel fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({
          error: { message: 'Cannot cancel completed deployment' },
        }),
      });

      await expect(cancelDeployment('dpl_123')).rejects.toThrow(
        'Failed to cancel deployment: Cannot cancel completed deployment'
      );
    });
  });
});
