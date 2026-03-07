/**
 * Tests for Deployment Poller
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createDeploymentPoller,
  pollDeploymentStatus,
  DeploymentStatus,
} from '@/lib/deployment/deployment-poller';

// Mock fetch
global.fetch = vi.fn();

describe('Deployment Poller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('createDeploymentPoller', () => {
    it('should create a poller instance', () => {
      const poller = createDeploymentPoller({
        deploymentId: 'deploy-123',
        platform: 'vercel',
      });

      expect(poller).toBeDefined();
      expect(poller.start).toBeInstanceOf(Function);
      expect(poller.stop).toBeInstanceOf(Function);
      expect(poller.isPolling).toBeInstanceOf(Function);
      expect(poller.getStatus).toBeInstanceOf(Function);
    });

    it('should start polling when start() is called', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-123',
        url: 'https://example.com',
        status: 'building',
        platform: 'vercel',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockStatus }),
      });

      const onUpdate = vi.fn();
      const poller = createDeploymentPoller({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        onUpdate,
      });

      poller.start();
      expect(poller.isPolling()).toBe(true);

      // Wait for first poll
      await vi.runOnlyPendingTimersAsync();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sandbox/deploy?deploymentId=deploy-123&platform=vercel'
      );
      expect(onUpdate).toHaveBeenCalledWith(mockStatus);
    });

    it('should stop polling when stop() is called', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-123',
        url: 'https://example.com',
        status: 'building',
        platform: 'vercel',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockStatus }),
      });

      const poller = createDeploymentPoller({
        deploymentId: 'deploy-123',
        platform: 'vercel',
      });

      poller.start();
      expect(poller.isPolling()).toBe(true);

      poller.stop();
      expect(poller.isPolling()).toBe(false);

      // Verify no more polling happens
      const callCount = (global.fetch as any).mock.calls.length;
      await vi.runOnlyPendingTimersAsync();
      expect((global.fetch as any).mock.calls.length).toBe(callCount);
    });

    it('should poll at specified interval', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-123',
        url: 'https://example.com',
        status: 'building',
        platform: 'vercel',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockStatus }),
      });

      const onUpdate = vi.fn();
      const poller = createDeploymentPoller({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        interval: 2000,
        onUpdate,
      });

      poller.start();

      // First poll happens immediately
      await vi.runOnlyPendingTimersAsync();
      const firstCallCount = onUpdate.mock.calls.length;
      expect(firstCallCount).toBeGreaterThanOrEqual(1);

      // Advance 2 seconds and wait for next poll
      vi.advanceTimersByTime(2000);
      await vi.runOnlyPendingTimersAsync();
      expect(onUpdate.mock.calls.length).toBeGreaterThan(firstCallCount);

      poller.stop();
    });

    it('should stop polling when status is ready', async () => {
      const buildingStatus: DeploymentStatus = {
        deploymentId: 'deploy-123',
        url: 'https://example.com',
        status: 'building',
        platform: 'vercel',
      };

      const readyStatus: DeploymentStatus = {
        ...buildingStatus,
        status: 'ready',
      };

      let callCount = 0;
      (global.fetch as any).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return {
            ok: true,
            json: async () => ({ success: true, data: buildingStatus }),
          };
        }
        return {
          ok: true,
          json: async () => ({ success: true, data: readyStatus }),
        };
      });

      const onComplete = vi.fn();
      const onUpdate = vi.fn();
      const poller = createDeploymentPoller({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        interval: 1000,
        onComplete,
        onUpdate,
      });

      poller.start();

      // First poll - building
      await vi.runOnlyPendingTimersAsync();
      expect(onUpdate).toHaveBeenCalledWith(buildingStatus);

      // Second poll - ready
      vi.advanceTimersByTime(1000);
      await vi.runOnlyPendingTimersAsync();

      expect(onComplete).toHaveBeenCalledWith(readyStatus);
      expect(poller.isPolling()).toBe(false);
    });

    it('should stop polling when status is error', async () => {
      const errorStatus: DeploymentStatus = {
        deploymentId: 'deploy-123',
        url: 'https://example.com',
        status: 'error',
        platform: 'vercel',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: errorStatus }),
      });

      const onComplete = vi.fn();
      const poller = createDeploymentPoller({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        onComplete,
      });

      poller.start();
      await vi.runOnlyPendingTimersAsync();

      expect(onComplete).toHaveBeenCalledWith(errorStatus);
      expect(poller.isPolling()).toBe(false);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          error: { message: 'API error' },
        }),
      });

      const onError = vi.fn();
      const poller = createDeploymentPoller({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        onError,
      });

      poller.start();
      await vi.runOnlyPendingTimersAsync();

      expect(onError).toHaveBeenCalled();
      expect(poller.isPolling()).toBe(false);
    });

    it('should stop after max attempts', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-123',
        url: 'https://example.com',
        status: 'building',
        platform: 'vercel',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockStatus }),
      });

      const onError = vi.fn();
      const poller = createDeploymentPoller({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        interval: 100,
        maxAttempts: 3,
        onError,
      });

      poller.start();

      // Poll 3 times
      for (let i = 0; i < 3; i++) {
        await vi.runOnlyPendingTimersAsync();
        if (i < 2) {
          vi.advanceTimersByTime(100);
        }
      }

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('timeout'),
        })
      );
      expect(poller.isPolling()).toBe(false);
    });

    it('should return current status', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-123',
        url: 'https://example.com',
        status: 'building',
        platform: 'vercel',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockStatus }),
      });

      const poller = createDeploymentPoller({
        deploymentId: 'deploy-123',
        platform: 'vercel',
      });

      expect(poller.getStatus()).toBeNull();

      poller.start();
      await vi.runOnlyPendingTimersAsync();

      expect(poller.getStatus()).toEqual(mockStatus);

      poller.stop();
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const onError = vi.fn();
      const poller = createDeploymentPoller({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        onError,
      });

      poller.start();
      await vi.runOnlyPendingTimersAsync();

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network error',
        })
      );
      expect(poller.isPolling()).toBe(false);
    });
  });

  describe('pollDeploymentStatus', () => {
    it('should fetch deployment status once', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-123',
        url: 'https://example.com',
        status: 'ready',
        platform: 'vercel',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockStatus }),
      });

      const status = await pollDeploymentStatus('deploy-123', 'vercel');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sandbox/deploy?deploymentId=deploy-123&platform=vercel'
      );
      expect(status).toEqual(mockStatus);
    });

    it('should throw error on API failure', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          error: { message: 'Not found' },
        }),
      });

      await expect(
        pollDeploymentStatus('deploy-123', 'vercel')
      ).rejects.toThrow('Not found');
    });

    it('should work with netlify platform', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-456',
        url: 'https://example.netlify.app',
        status: 'ready',
        platform: 'netlify',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockStatus }),
      });

      const status = await pollDeploymentStatus('deploy-456', 'netlify');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sandbox/deploy?deploymentId=deploy-456&platform=netlify'
      );
      expect(status).toEqual(mockStatus);
    });
  });
});
