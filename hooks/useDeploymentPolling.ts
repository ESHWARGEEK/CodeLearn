/**
 * useDeploymentPolling Hook
 * 
 * React hook for managing deployment status polling.
 * Automatically starts polling when deployment is initiated and stops on completion.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  createDeploymentPoller,
  DeploymentStatus,
  PollerInstance,
} from '@/lib/deployment/deployment-poller';

export interface UseDeploymentPollingOptions {
  deploymentId: string | null;
  platform: 'vercel' | 'netlify' | null;
  enabled?: boolean;
  interval?: number;
  maxAttempts?: number;
  onComplete?: (status: DeploymentStatus) => void;
  onError?: (error: Error) => void;
}

export interface UseDeploymentPollingResult {
  status: DeploymentStatus | null;
  isPolling: boolean;
  error: Error | null;
  startPolling: () => void;
  stopPolling: () => void;
}

/**
 * Hook for polling deployment status
 */
export function useDeploymentPolling(
  options: UseDeploymentPollingOptions
): UseDeploymentPollingResult {
  const {
    deploymentId,
    platform,
    enabled = true,
    interval = 3000,
    maxAttempts = 40,
    onComplete,
    onError,
  } = options;

  const [status, setStatus] = useState<DeploymentStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pollerRef = useRef<PollerInstance | null>(null);

  /**
   * Handle status update
   */
  const handleUpdate = useCallback((newStatus: DeploymentStatus) => {
    setStatus(newStatus);
  }, []);

  /**
   * Handle polling complete
   */
  const handleComplete = useCallback(
    (finalStatus: DeploymentStatus) => {
      setStatus(finalStatus);
      setIsPolling(false);
      if (onComplete) {
        onComplete(finalStatus);
      }
    },
    [onComplete]
  );

  /**
   * Handle polling error
   */
  const handleError = useCallback(
    (err: Error) => {
      setError(err);
      setIsPolling(false);
      if (onError) {
        onError(err);
      }
    },
    [onError]
  );

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (!deploymentId || !platform) {
      console.warn('Cannot start polling: missing deploymentId or platform');
      return;
    }

    // Stop existing poller if any
    if (pollerRef.current) {
      pollerRef.current.stop();
    }

    // Create new poller
    pollerRef.current = createDeploymentPoller({
      deploymentId,
      platform,
      interval,
      maxAttempts,
      onUpdate: handleUpdate,
      onComplete: handleComplete,
      onError: handleError,
    });

    // Start polling
    pollerRef.current.start();
    setIsPolling(true);
    setError(null);
  }, [
    deploymentId,
    platform,
    interval,
    maxAttempts,
    handleUpdate,
    handleComplete,
    handleError,
  ]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollerRef.current) {
      pollerRef.current.stop();
      pollerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  /**
   * Auto-start polling when enabled and deployment info is available
   */
  useEffect(() => {
    if (enabled && deploymentId && platform) {
      startPolling();
    }

    // Cleanup on unmount
    return () => {
      if (pollerRef.current) {
        pollerRef.current.stop();
      }
    };
  }, [enabled, deploymentId, platform, startPolling]);

  return {
    status,
    isPolling,
    error,
    startPolling,
    stopPolling,
  };
}
