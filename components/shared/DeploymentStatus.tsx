/**
 * DeploymentStatus Component
 * 
 * Displays deployment progress and status with real-time updates.
 * Shows building, ready, or error states with appropriate UI.
 */

'use client';

import React from 'react';
import { useDeploymentPolling } from '@/hooks/useDeploymentPolling';
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';

export interface DeploymentStatusProps {
  deploymentId: string | null;
  platform: 'vercel' | 'netlify' | null;
  onComplete?: (url: string) => void;
  onError?: (error: Error) => void;
}

/**
 * DeploymentStatus Component
 */
export function DeploymentStatus({
  deploymentId,
  platform,
  onComplete,
  onError,
}: DeploymentStatusProps) {
  const { status, isPolling, error } = useDeploymentPolling({
    deploymentId,
    platform,
    enabled: !!deploymentId && !!platform,
    onComplete: (finalStatus) => {
      if (finalStatus.status === 'ready' && onComplete) {
        onComplete(finalStatus.url);
      }
    },
    onError,
  });

  // Don't render if no deployment
  if (!deploymentId || !platform) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900">
              Deployment Failed
            </h3>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Deployment error state
  if (status?.status === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900">
              Deployment Failed
            </h3>
            <p className="mt-1 text-sm text-red-700">
              The deployment encountered an error. Please try again.
            </p>
            {status.url && (
              <a
                href={status.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                View deployment logs
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status?.status === 'ready') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-900">
              Deployment Successful
            </h3>
            <p className="mt-1 text-sm text-green-700">
              Your project is now live and accessible.
            </p>
            {status.url && (
              <a
                href={status.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
              >
                View live site
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Building state
  if (isPolling || status?.status === 'building') {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Loader2 className="h-5 w-5 text-blue-600 mt-0.5 animate-spin" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900">
              Deploying to {platform === 'vercel' ? 'Vercel' : 'Netlify'}
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Building your project... This may take a few minutes.
            </p>
            <div className="mt-3">
              <div className="h-2 w-full bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial state (shouldn't normally be visible)
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <Loader2 className="h-5 w-5 text-gray-600 mt-0.5 animate-spin" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            Initializing Deployment
          </h3>
          <p className="mt-1 text-sm text-gray-700">
            Preparing your project for deployment...
          </p>
        </div>
      </div>
    </div>
  );
}
