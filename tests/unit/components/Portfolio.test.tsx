/**
 * Unit tests for Portfolio page component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PortfolioPage from '@/app/(dashboard)/portfolio/page';

// Mock fetch globally
global.fetch = vi.fn();

describe('Portfolio Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Mock fetch to never resolve (simulating loading)
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));

    render(<PortfolioPage />);

    expect(screen.getByText('Loading your portfolio...')).toBeInTheDocument();
    // The header is not shown during loading state, so we don't check for it
  });

  it('should render empty state when no projects exist', async () => {
    // Mock successful API response with no projects
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          projects: [],
          total: 0,
        },
      }),
    } as Response);

    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByText('No Completed Projects Yet')).toBeInTheDocument();
      expect(screen.getByText('Complete and deploy your first project to see it in your portfolio')).toBeInTheDocument();
      expect(screen.getByText('Start Learning')).toBeInTheDocument();
    });
  });

  it('should render projects when they exist', async () => {
    // Mock successful API response with projects
    const mockProjects = [
      {
        id: 'proj-1',
        name: 'E-commerce Dashboard',
        description: 'A modern React application showcasing component-based architecture.',
        technology: 'react',
        techStack: ['React', 'JavaScript', 'CSS', 'HTML'],
        githubUrl: 'https://github.com/example/dashboard',
        deploymentUrl: 'https://dashboard.vercel.app',
        deploymentPlatform: 'vercel' as const,
        deployedAt: 1709337600,
        status: 'completed' as const,
        type: 'learning' as const,
        progress: 100,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          projects: mockProjects,
          total: 1,
        },
      }),
    } as Response);

    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByText('E-commerce Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 of 1 projects')).toBeInTheDocument();
      expect(screen.getByText('Live Demo')).toBeInTheDocument();
    });
  });

  it('should render error state when API fails', async () => {
    // Mock API failure
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to load portfolio',
        },
      }),
    } as Response);

    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Failed to load portfolio')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    // Mock network error
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Failed to load portfolio')).toBeInTheDocument();
    });
  });

  it('should render search and filter controls', async () => {
    // Mock successful API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          projects: [],
          total: 0,
        },
      }),
    } as Response);

    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Technologies')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Newest First')).toBeInTheDocument();
    });
  });

  it('should render portfolio visibility controls', async () => {
    // Mock successful API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          projects: [],
          total: 0,
        },
      }),
    } as Response);

    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByText('Private')).toBeInTheDocument();
      // Share button should not be visible when portfolio is private
      expect(screen.queryByText('Share')).not.toBeInTheDocument();
    });
  });
});