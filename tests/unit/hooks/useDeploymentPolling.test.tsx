/**
 * Tests for useDeploymentPolling Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDeploymentPolling } from '@/hooks/useDeploymentPolling';
import { DeploymentStatus } from '@/lib/deployment/deployment-poller';

// Mock the deployment poller
vi.mock('@/lib/deployment/deployment-poller', () => ({
  createDeploymentPoller: vi.fn((options) => {
    const mockPoller = {
      start: vi.fn(() => {
        // Simulate immediate status update
        if (options.onUpdate) {
          setTimeout(() => {
            options.onUpdate({
              deploymentId: options.deploymentId,
              url: 'https://example.com',
              status: 'building',
              platform: options.platform,
            });
          }, 0);
        }
      }),
      stop: vi.fn(),
      isPolling: vi.fn(() => true),
      getStatus: vi.fn(() => null),
    };
    return mockPoller;
  }),
}));

describe('useDeploymentPolling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with null status', () => {
    const { result } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: null,
        platform: null,
        enabled: false,
      })
    );

    expect(result.current.status).toBeNull();
    expect(result.current.isPolling).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should start polling when enabled with valid deployment info', async () => {
    const { result } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(result.current.isPolling).toBe(true);
    });
  });

  it('should not start polling when enabled is false', () => {
    const { result } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        enabled: false,
      })
    );

    expect(result.current.isPolling).toBe(false);
  });

  it('should not start polling when deploymentId is null', () => {
    const { result } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: null,
        platform: 'vercel',
        enabled: true,
      })
    );

    expect(result.current.isPolling).toBe(false);
  });

  it('should not start polling when platform is null', () => {
    const { result } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: null,
        enabled: true,
      })
    );

    expect(result.current.isPolling).toBe(false);
  });

  it('should update status when polling receives updates', async () => {
    const { result } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(result.current.status).not.toBeNull();
    });

    expect(result.current.status).toEqual({
      deploymentId: 'deploy-123',
      url: 'https://example.com',
      status: 'building',
      platform: 'vercel',
    });
  });

  it('should call onComplete when deployment completes', async () => {
    const onComplete = vi.fn();
    const mockStatus: DeploymentStatus = {
      deploymentId: 'deploy-123',
      url: 'https://example.com',
      status: 'ready',
      platform: 'vercel',
    };

    // Override mock for this test
    const { createDeploymentPoller } = await import(
      '@/lib/deployment/deployment-poller'
    );
    (createDeploymentPoller as any).mockImplementationOnce((options: any) => ({
      start: vi.fn(() => {
        setTimeout(() => {
          options.onComplete(mockStatus);
        }, 0);
      }),
      stop: vi.fn(),
      isPolling: vi.fn(() => false),
      getStatus: vi.fn(() => mockStatus),
    }));

    renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        enabled: true,
        onComplete,
      })
    );

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(mockStatus);
    });
  });

  it('should call onError when polling fails', async () => {
    const onError = vi.fn();
    const mockError = new Error('Polling failed');

    // Override mock for this test
    const { createDeploymentPoller } = await import(
      '@/lib/deployment/deployment-poller'
    );
    (createDeploymentPoller as any).mockImplementationOnce((options: any) => ({
      start: vi.fn(() => {
        setTimeout(() => {
          options.onError(mockError);
        }, 0);
      }),
      stop: vi.fn(),
      isPolling: vi.fn(() => false),
      getStatus: vi.fn(() => null),
    }));

    renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        enabled: true,
        onError,
      })
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  it('should provide startPolling function', async () => {
    const { result } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        enabled: false,
      })
    );

    expect(result.current.isPolling).toBe(false);

    result.current.startPolling();

    await waitFor(() => {
      expect(result.current.isPolling).toBe(true);
    });
  });

  it('should provide stopPolling function', async () => {
    const { result } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(result.current.isPolling).toBe(true);
    });

    result.current.stopPolling();

    await waitFor(() => {
      expect(result.current.isPolling).toBe(false);
    });
  });

  it('should cleanup poller on unmount', async () => {
    const { unmount } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        enabled: true,
      })
    );

    await waitFor(() => {
      // Wait for polling to start
    });

    // Unmount should not throw
    expect(() => unmount()).not.toThrow();
  });

  it('should restart polling when deploymentId changes', async () => {
    const { result, rerender } = renderHook(
      ({ deploymentId }) =>
        useDeploymentPolling({
          deploymentId,
          platform: 'vercel',
          enabled: true,
        }),
      {
        initialProps: { deploymentId: 'deploy-123' },
      }
    );

    await waitFor(() => {
      expect(result.current.isPolling).toBe(true);
    });

    // Change deploymentId
    rerender({ deploymentId: 'deploy-456' });

    await waitFor(() => {
      expect(result.current.status?.deploymentId).toBe('deploy-456');
    });
  });

  it('should use custom interval', async () => {
    const { result } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        enabled: true,
        interval: 5000,
      })
    );

    await waitFor(() => {
      expect(result.current.isPolling).toBe(true);
    });

    // Verify poller was created with custom interval
    const { createDeploymentPoller } = await import(
      '@/lib/deployment/deployment-poller'
    );
    expect(createDeploymentPoller).toHaveBeenCalledWith(
      expect.objectContaining({
        interval: 5000,
      })
    );
  });

  it('should use custom maxAttempts', async () => {
    const { result } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: 'vercel',
        enabled: true,
        maxAttempts: 10,
      })
    );

    await waitFor(() => {
      expect(result.current.isPolling).toBe(true);
    });

    // Verify poller was created with custom maxAttempts
    const { createDeploymentPoller } = await import(
      '@/lib/deployment/deployment-poller'
    );
    expect(createDeploymentPoller).toHaveBeenCalledWith(
      expect.objectContaining({
        maxAttempts: 10,
      })
    );
  });

  it('should handle netlify platform', async () => {
    const { result } = renderHook(() =>
      useDeploymentPolling({
        deploymentId: 'deploy-123',
        platform: 'netlify',
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(result.current.status?.platform).toBe('netlify');
    });
  });
});
