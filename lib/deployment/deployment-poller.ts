/**
 * Deployment Status Polling Service
 * 
 * Provides polling functionality for deployment status updates from Vercel and Netlify.
 * Polls at regular intervals until deployment reaches a terminal state.
 */

export interface DeploymentStatus {
  deploymentId: string;
  url: string;
  status: 'building' | 'ready' | 'error';
  platform: 'vercel' | 'netlify';
}

export interface PollingOptions {
  deploymentId: string;
  platform: 'vercel' | 'netlify';
  interval?: number; // milliseconds, default 3000 (3 seconds)
  maxAttempts?: number; // maximum polling attempts, default 40 (2 minutes at 3s interval)
  onUpdate?: (status: DeploymentStatus) => void;
  onComplete?: (status: DeploymentStatus) => void;
  onError?: (error: Error) => void;
}

export interface PollerInstance {
  start: () => void;
  stop: () => void;
  isPolling: () => boolean;
  getStatus: () => DeploymentStatus | null;
}

/**
 * Create a deployment status poller
 */
export function createDeploymentPoller(options: PollingOptions): PollerInstance {
  const {
    deploymentId,
    platform,
    interval = 3000,
    maxAttempts = 40,
    onUpdate,
    onComplete,
    onError,
  } = options;

  let timerId: NodeJS.Timeout | null = null;
  let attempts = 0;
  let currentStatus: DeploymentStatus | null = null;
  let isActive = false;

  /**
   * Check if status is terminal (no more polling needed)
   */
  function isTerminalStatus(status: string): boolean {
    return status === 'ready' || status === 'error';
  }

  /**
   * Fetch deployment status from API
   */
  async function fetchStatus(): Promise<DeploymentStatus> {
    const response = await fetch(
      `/api/sandbox/deploy?deploymentId=${deploymentId}&platform=${platform}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch deployment status');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Poll for status update
   */
  async function poll(): Promise<void> {
    if (!isActive) return;

    attempts++;

    try {
      const status = await fetchStatus();
      currentStatus = status;

      // Notify update callback
      if (onUpdate) {
        onUpdate(status);
      }

      // Check if deployment is complete
      if (isTerminalStatus(status.status)) {
        stop();
        if (onComplete) {
          onComplete(status);
        }
        return;
      }

      // Check if max attempts reached
      if (attempts >= maxAttempts) {
        stop();
        const timeoutError = new Error(
          `Deployment polling timeout after ${maxAttempts} attempts`
        );
        if (onError) {
          onError(timeoutError);
        }
        return;
      }

      // Schedule next poll
      if (isActive) {
        timerId = setTimeout(poll, interval);
      }
    } catch (error) {
      stop();
      if (onError) {
        onError(error as Error);
      }
    }
  }

  /**
   * Start polling
   */
  function start(): void {
    if (isActive) return;

    isActive = true;
    attempts = 0;
    poll();
  }

  /**
   * Stop polling
   */
  function stop(): void {
    isActive = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  /**
   * Check if currently polling
   */
  function isPolling(): boolean {
    return isActive;
  }

  /**
   * Get current status
   */
  function getStatus(): DeploymentStatus | null {
    return currentStatus;
  }

  return {
    start,
    stop,
    isPolling,
    getStatus,
  };
}

/**
 * Poll deployment status once
 */
export async function pollDeploymentStatus(
  deploymentId: string,
  platform: 'vercel' | 'netlify'
): Promise<DeploymentStatus> {
  const response = await fetch(
    `/api/sandbox/deploy?deploymentId=${deploymentId}&platform=${platform}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch deployment status');
  }

  const data = await response.json();
  return data.data;
}
