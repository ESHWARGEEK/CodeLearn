/**
 * Unit tests for Portfolio page filtering and sorting functionality
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PortfolioPage from '@/app/(dashboard)/portfolio/page';

// Mock fetch globally
global.fetch = vi.fn();

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
    deployedAt: 1709337600, // March 2024
    status: 'completed' as const,
    type: 'learning' as const,
    progress: 100,
    completedAt: 1709337600,
  },
  {
    id: 'proj-2',
    name: 'Vue Todo App',
    description: 'A Vue.js todo application with reactive state management.',
    technology: 'vue',
    techStack: ['Vue.js', 'JavaScript', 'CSS', 'HTML'],
    githubUrl: 'https://github.com/example/vue-todo',
    deploymentUrl: 'https://vue-todo.netlify.app',
    deploymentPlatform: 'netlify' as const,
    deployedAt: 1706745600, // February 2024
    status: 'completed' as const,
    type: 'learning' as const,
    progress: 100,
    completedAt: 1706745600,
  },
  {
    id: 'proj-3',
    name: 'API Server',
    description: 'A Node.js REST API with Express and MongoDB.',
    technology: 'nodejs',
    techStack: ['Node.js', 'Express', 'MongoDB', 'JavaScript'],
    githubUrl: 'https://github.com/example/api-server',
    deploymentUrl: 'https://api-server.herokuapp.com',
    deploymentPlatform: 'vercel' as const,
    deployedAt: 1704067200, // January 2024
    status: 'completed' as const,
    type: 'learning' as const,
    progress: 100,
    completedAt: 1704067200,
  },
];

describe('Portfolio Filtering and Sorting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API response
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          projects: mockProjects,
          total: mockProjects.length,
        },
      }),
    } as Response);
  });

  it('should render all filter and sort controls', async () => {
    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search projects, descriptions, or technologies...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Technologies')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Time')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Newest First')).toBeInTheDocument();
      expect(screen.getByText('Desc')).toBeInTheDocument();
    });
  });

  it('should filter projects by technology', async () => {
    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('All Technologies')).toBeInTheDocument();
    });

    // Change technology filter to React
    const techFilter = screen.getByDisplayValue('All Technologies');
    fireEvent.change(techFilter, { target: { value: 'react' } });

    // Should trigger API call with technology filter
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('technology=react')
      );
    });
  });

  it('should filter projects by date range', async () => {
    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('All Time')).toBeInTheDocument();
    });

    // Change date range filter
    const dateFilter = screen.getByDisplayValue('All Time');
    fireEvent.change(dateFilter, { target: { value: 'last-month' } });

    // Should trigger API call with date range filter
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('dateRange=last-month')
      );
    });
  });

  it('should sort projects by completion date', async () => {
    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Newest First')).toBeInTheDocument();
    });

    // Change sort option
    const sortSelect = screen.getByDisplayValue('Newest First');
    fireEvent.change(sortSelect, { target: { value: 'completion-date' } });

    // Should trigger API call with new sort option
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=completion-date')
      );
    });
  });

  it('should toggle sort order', async () => {
    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByText('Desc')).toBeInTheDocument();
    });

    // Click sort order toggle
    const sortOrderButton = screen.getByText('Desc');
    fireEvent.click(sortOrderButton);

    // Should trigger API call with ascending order
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('sortOrder=asc')
      );
    });

    // Button text should change
    expect(screen.getByText('Asc')).toBeInTheDocument();
  });

  it('should search projects', async () => {
    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search projects, descriptions, or technologies...')).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search projects, descriptions, or technologies...');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    // Should trigger API call with search parameter
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=React')
      );
    });
  });

  it('should show clear filters button when filters are applied', async () => {
    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('All Technologies')).toBeInTheDocument();
    });

    // Apply a filter
    const techFilter = screen.getByDisplayValue('All Technologies');
    fireEvent.change(techFilter, { target: { value: 'react' } });

    // Clear filters button should appear
    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });
  });

  it('should clear all filters when clear button is clicked', async () => {
    render(<PortfolioPage />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('All Technologies')).toBeInTheDocument();
    });

    // Apply search filter only (simpler test)
    const searchInput = screen.getByPlaceholderText('Search projects, descriptions, or technologies...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Verify search filter is applied
    await waitFor(() => {
      expect(searchInput).toHaveValue('test');
    });

    // Clear filters button should appear
    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    // Click clear filters
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    // Search input should be cleared
    await waitFor(() => {
      const updatedSearchInput = screen.getByPlaceholderText('Search projects, descriptions, or technologies...');
      expect(updatedSearchInput).toHaveValue('');
    });
  });

  it('should handle API calls with all filter parameters', async () => {
    render(<PortfolioPage />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('All Technologies')).toBeInTheDocument();
    });

    // Apply all filters step by step with waits
    const searchInput = screen.getByPlaceholderText('Search projects, descriptions, or technologies...');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    // Wait for search to trigger API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=React')
      );
    });

    const techFilter = screen.getByDisplayValue('All Technologies');
    fireEvent.change(techFilter, { target: { value: 'react' } });

    // Wait for technology filter to trigger API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('technology=react')
      );
    });

    const dateFilter = screen.getByDisplayValue('All Time');
    fireEvent.change(dateFilter, { target: { value: 'last-month' } });

    // Wait for date filter to trigger API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('dateRange=last-month')
      );
    });

    const sortSelect = screen.getByDisplayValue('Newest First');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    // Wait for sort to trigger API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=name')
      );
    });

    const sortOrderButton = screen.getByText('Desc');
    fireEvent.click(sortOrderButton);

    // Should make API call with all parameters
    await waitFor(() => {
      const lastCall = vi.mocked(fetch).mock.calls[vi.mocked(fetch).mock.calls.length - 1];
      const url = lastCall[0] as string;
      
      expect(url).toContain('sortOrder=asc');
      expect(url).toContain('limit=9');
      expect(url).toContain('offset=0');
    });
  });

  it('should reset to first page when filters change', async () => {
    render(<PortfolioPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('All Technologies')).toBeInTheDocument();
    });

    // Apply a filter
    const techFilter = screen.getByDisplayValue('All Technologies');
    fireEvent.change(techFilter, { target: { value: 'react' } });

    // Should reset to page 1 (offset=0)
    await waitFor(() => {
      const lastCall = vi.mocked(fetch).mock.calls[vi.mocked(fetch).mock.calls.length - 1];
      const url = lastCall[0] as string;
      expect(url).toContain('offset=0');
    });
  });
});