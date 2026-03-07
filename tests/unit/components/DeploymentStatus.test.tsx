/**
 * Tests for DeploymentStatus Component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeploymentStatus } from '@/components/shared/DeploymentStatus';
import { DeploymentStatus as DeploymentStatusType } from '@/lib/deployment/deployment-poller';
import * as useDeploymentPollingModule from '@/hooks/useDeploymentPolling';

// Mock the useDeploymentPolling hook
vi.mock('@/hooks/useDeploymentPolling');

describe('DeploymentStatus Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing when no deployment info provided', () => {
    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockReturnValue({
      status: null,
      isPolling: false,
      error: null,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    const { container } = render(
      <DeploymentStatus deploymentId={null} platform={null} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render building state', () => {
    const mockStatus: DeploymentStatusType = {
      deploymentId: 'deploy-123',
      url: 'https://example.com',
      status: 'building',
      platform: 'vercel',
    };

    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockReturnValue({
      status: mockStatus,
      isPolling: true,
      error: null,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    render(<DeploymentStatus deploymentId="deploy-123" platform="vercel" />);

    expect(screen.getByText('Deploying to Vercel')).toBeInTheDocument();
    expect(
      screen.getByText(/Building your project... This may take a few minutes/)
    ).toBeInTheDocument();
  });

  it('should render building state for netlify', () => {
    const mockStatus: DeploymentStatusType = {
      deploymentId: 'deploy-123',
      url: 'https://example.netlify.app',
      status: 'building',
      platform: 'netlify',
    };

    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockReturnValue({
      status: mockStatus,
      isPolling: true,
      error: null,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    render(<DeploymentStatus deploymentId="deploy-123" platform="netlify" />);

    expect(screen.getByText('Deploying to Netlify')).toBeInTheDocument();
  });

  it('should render success state', () => {
    const mockStatus: DeploymentStatusType = {
      deploymentId: 'deploy-123',
      url: 'https://example.com',
      status: 'ready',
      platform: 'vercel',
    };

    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockReturnValue({
      status: mockStatus,
      isPolling: false,
      error: null,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    render(<DeploymentStatus deploymentId="deploy-123" platform="vercel" />);

    expect(screen.getByText('Deployment Successful')).toBeInTheDocument();
    expect(
      screen.getByText(/Your project is now live and accessible/)
    ).toBeInTheDocument();

    const link = screen.getByText('View live site');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should render error state from deployment', () => {
    const mockStatus: DeploymentStatusType = {
      deploymentId: 'deploy-123',
      url: 'https://example.com',
      status: 'error',
      platform: 'vercel',
    };

    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockReturnValue({
      status: mockStatus,
      isPolling: false,
      error: null,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    render(<DeploymentStatus deploymentId="deploy-123" platform="vercel" />);

    expect(screen.getByText('Deployment Failed')).toBeInTheDocument();
    expect(
      screen.getByText(/The deployment encountered an error/)
    ).toBeInTheDocument();
  });

  it('should render error state from polling error', () => {
    const mockError = new Error('Network error');

    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockReturnValue({
      status: null,
      isPolling: false,
      error: mockError,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    render(<DeploymentStatus deploymentId="deploy-123" platform="vercel" />);

    expect(screen.getByText('Deployment Failed')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('should call onComplete when deployment succeeds', () => {
    const mockStatus: DeploymentStatusType = {
      deploymentId: 'deploy-123',
      url: 'https://example.com',
      status: 'ready',
      platform: 'vercel',
    };

    const onComplete = vi.fn();

    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockImplementation((options: any) => {
      // Simulate completion
      if (options.onComplete) {
        options.onComplete(mockStatus);
      }
      return {
        status: mockStatus,
        isPolling: false,
        error: null,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      };
    });

    render(
      <DeploymentStatus
        deploymentId="deploy-123"
        platform="vercel"
        onComplete={onComplete}
      />
    );

    expect(onComplete).toHaveBeenCalledWith('https://example.com');
  });

  it('should call onError when polling fails', () => {
    const mockError = new Error('Polling failed');
    const onError = vi.fn();

    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockImplementation((options: any) => {
      // Simulate error
      if (options.onError) {
        options.onError(mockError);
      }
      return {
        status: null,
        isPolling: false,
        error: mockError,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
      };
    });

    render(
      <DeploymentStatus
        deploymentId="deploy-123"
        platform="vercel"
        onError={onError}
      />
    );

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should show progress bar during building', () => {
    const mockStatus: DeploymentStatusType = {
      deploymentId: 'deploy-123',
      url: 'https://example.com',
      status: 'building',
      platform: 'vercel',
    };

    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockReturnValue({
      status: mockStatus,
      isPolling: true,
      error: null,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    const { container } = render(
      <DeploymentStatus deploymentId="deploy-123" platform="vercel" />
    );

    // Check for progress bar elements
    const progressBar = container.querySelector('.bg-blue-200');
    expect(progressBar).toBeInTheDocument();
  });

  it('should render initializing state when polling starts', () => {
    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockReturnValue({
      status: null,
      isPolling: false,
      error: null,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    render(<DeploymentStatus deploymentId="deploy-123" platform="vercel" />);

    expect(screen.getByText('Initializing Deployment')).toBeInTheDocument();
    expect(
      screen.getByText(/Preparing your project for deployment/)
    ).toBeInTheDocument();
  });

  it('should show deployment logs link on error', () => {
    const mockStatus: DeploymentStatusType = {
      deploymentId: 'deploy-123',
      url: 'https://vercel.com/logs/deploy-123',
      status: 'error',
      platform: 'vercel',
    };

    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockReturnValue({
      status: mockStatus,
      isPolling: false,
      error: null,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    render(<DeploymentStatus deploymentId="deploy-123" platform="vercel" />);

    const link = screen.getByText('View deployment logs');
    expect(link).toHaveAttribute('href', 'https://vercel.com/logs/deploy-123');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should have proper accessibility attributes', () => {
    const mockStatus: DeploymentStatusType = {
      deploymentId: 'deploy-123',
      url: 'https://example.com',
      status: 'ready',
      platform: 'vercel',
    };

    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockReturnValue({
      status: mockStatus,
      isPolling: false,
      error: null,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    render(<DeploymentStatus deploymentId="deploy-123" platform="vercel" />);

    const link = screen.getByText('View live site');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should not call onComplete when status is not ready', () => {
    const mockStatus: DeploymentStatusType = {
      deploymentId: 'deploy-123',
      url: 'https://example.com',
      status: 'building',
      platform: 'vercel',
    };

    const onComplete = vi.fn();

    vi.spyOn(useDeploymentPollingModule, 'useDeploymentPolling').mockReturnValue({
      status: mockStatus,
      isPolling: true,
      error: null,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    render(
      <DeploymentStatus
        deploymentId="deploy-123"
        platform="vercel"
        onComplete={onComplete}
      />
    );

    expect(onComplete).not.toHaveBeenCalled();
  });
});
