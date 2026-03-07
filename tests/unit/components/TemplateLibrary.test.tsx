import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import TemplateLibrary from '@/components/developer/TemplateLibrary';
import { Template, TemplatesResponse } from '@/types/templates';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock templates data
const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'React Authentication Component',
    description: 'A complete authentication system with login, signup, and password reset functionality.',
    technology: 'react',
    category: 'authentication',
    rating: 4.8,
    downloads: 1250,
    sourceRepo: 'https://github.com/example/react-auth',
    createdBy: 'user-123',
    createdAt: 1709251200,
    updatedAt: 1709337600,
  },
  {
    id: 'template-2',
    name: 'Vue.js Data Table',
    description: 'A responsive data table component with sorting, filtering, and pagination.',
    technology: 'vue',
    category: 'ui-components',
    rating: 4.5,
    downloads: 890,
    sourceRepo: 'https://github.com/example/vue-datatable',
    createdBy: 'user-456',
    createdAt: 1709164800,
    updatedAt: 1709251200,
  },
  {
    id: 'template-3',
    name: 'Next.js API Integration',
    description: 'RESTful API integration patterns with error handling and caching.',
    technology: 'nextjs',
    category: 'api-integration',
    rating: 4.9,
    downloads: 2100,
    sourceRepo: 'https://github.com/example/nextjs-api',
    createdBy: 'user-789',
    createdAt: 1709078400,
    updatedAt: 1709164800,
  },
];

const mockSuccessResponse: TemplatesResponse = {
  success: true,
  data: {
    templates: mockTemplates,
    pagination: {
      page: 1,
      total: 3,
      hasMore: false,
    },
  },
};

const mockErrorResponse: TemplatesResponse = {
  success: false,
  error: {
    code: 'FETCH_ERROR',
    message: 'Failed to fetch templates',
  },
};

describe('TemplateLibrary Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders template library header and description', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<TemplateLibrary />);

    expect(screen.getByText('Template Library')).toBeInTheDocument();
    expect(screen.getByText('Discover and integrate reusable code templates into your projects')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<TemplateLibrary />);

    expect(screen.getByText('Loading templates...')).toBeInTheDocument();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // Loading spinner
  });

  it('fetches and displays templates successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('React Authentication Component')).toBeInTheDocument();
      expect(screen.getByText('Vue.js Data Table')).toBeInTheDocument();
      expect(screen.getByText('Next.js API Integration')).toBeInTheDocument();
    });

    expect(screen.getByText('3 Templates Available')).toBeInTheDocument();
    expect(screen.getByText('Showing 3 of 3 templates')).toBeInTheDocument();
  });

  it('displays error state when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockErrorResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Templates')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch templates')).toBeInTheDocument();
    });

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('displays empty state when no templates found', async () => {
    const emptyResponse: TemplatesResponse = {
      success: true,
      data: {
        templates: [],
        pagination: {
          page: 1,
          total: 0,
          hasMore: false,
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => emptyResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('No Templates Found')).toBeInTheDocument();
      expect(screen.getByText('No templates are available at the moment')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('React Authentication Component')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search templates, descriptions, or technologies...');
    
    // Clear previous fetch calls
    mockFetch.mockClear();
    
    // Mock search response
    const searchResponse: TemplatesResponse = {
      success: true,
      data: {
        templates: [mockTemplates[0]], // Only React template
        pagination: {
          page: 1,
          total: 1,
          hasMore: false,
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => searchResponse,
    });

    fireEvent.change(searchInput, { target: { value: 'React' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/developer/templates?search=React')
      );
    });
  });

  it('handles technology filter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('React Authentication Component')).toBeInTheDocument();
    });

    const technologySelect = screen.getByDisplayValue('All Technologies');
    
    // Clear previous fetch calls
    mockFetch.mockClear();
    
    // Mock filtered response
    const filteredResponse: TemplatesResponse = {
      success: true,
      data: {
        templates: [mockTemplates[0]], // Only React template
        pagination: {
          page: 1,
          total: 1,
          hasMore: false,
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => filteredResponse,
    });

    fireEvent.change(technologySelect, { target: { value: 'react' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/developer/templates?technology=react')
      );
    });
  });

  it('handles category filter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('React Authentication Component')).toBeInTheDocument();
    });

    const categorySelect = screen.getByDisplayValue('All Categories');
    
    // Clear previous fetch calls
    mockFetch.mockClear();
    
    // Mock filtered response
    const filteredResponse: TemplatesResponse = {
      success: true,
      data: {
        templates: [mockTemplates[0]], // Only authentication template
        pagination: {
          page: 1,
          total: 1,
          hasMore: false,
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => filteredResponse,
    });

    fireEvent.change(categorySelect, { target: { value: 'authentication' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/developer/templates?category=authentication')
      );
    });
  });

  it('handles sorting by rating', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('React Authentication Component')).toBeInTheDocument();
    });

    const ratingButton = screen.getByText('Rating');
    
    // Clear previous fetch calls
    mockFetch.mockClear();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    // Click rating button to toggle sort order
    fireEvent.click(ratingButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/developer/templates?sortBy=rating&sortOrder=asc')
      );
    });
  });

  it('handles sorting by downloads', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('React Authentication Component')).toBeInTheDocument();
    });

    const downloadsButton = screen.getByText('Downloads');
    
    // Clear previous fetch calls
    mockFetch.mockClear();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    fireEvent.click(downloadsButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/developer/templates?sortBy=downloads&sortOrder=desc')
      );
    });
  });

  it('clears all filters when clear button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('React Authentication Component')).toBeInTheDocument();
    });

    // Apply some filters
    const searchInput = screen.getByPlaceholderText('Search templates, descriptions, or technologies...');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    const technologySelect = screen.getByDisplayValue('All Technologies');
    fireEvent.change(technologySelect, { target: { value: 'react' } });

    // Wait for clear button to appear
    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    // Clear previous fetch calls
    mockFetch.mockClear();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/developer/templates?sortBy=rating&sortOrder=desc&page=1&limit=20')
      );
    });

    // Check that filters are cleared
    expect(searchInput).toHaveValue('');
    expect(technologySelect).toHaveValue('all');
  });

  it('displays template cards with correct information', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      // Check template names
      expect(screen.getByText('React Authentication Component')).toBeInTheDocument();
      expect(screen.getByText('Vue.js Data Table')).toBeInTheDocument();
      expect(screen.getByText('Next.js API Integration')).toBeInTheDocument();

      // Check descriptions
      expect(screen.getByText(/A complete authentication system/)).toBeInTheDocument();
      expect(screen.getByText(/A responsive data table component/)).toBeInTheDocument();
      expect(screen.getByText(/RESTful API integration patterns/)).toBeInTheDocument();

      // Check ratings
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('4.9')).toBeInTheDocument();

      // Check download counts
      expect(screen.getByText('1.3k')).toBeInTheDocument(); // 1250 formatted
      expect(screen.getByText('890')).toBeInTheDocument();
      expect(screen.getByText('2.1k')).toBeInTheDocument(); // 2100 formatted
    });
  });

  it('handles pagination correctly', async () => {
    const paginatedResponse: TemplatesResponse = {
      success: true,
      data: {
        templates: mockTemplates,
        pagination: {
          page: 1,
          total: 50, // More than 20 to trigger pagination
          hasMore: true,
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => paginatedResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('Showing 3 of 50 templates')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
    });

    // Test pagination navigation
    const nextButton = screen.getByText('Next');
    
    // Clear previous fetch calls
    mockFetch.mockClear();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...paginatedResponse,
        data: {
          ...paginatedResponse.data!,
          pagination: {
            page: 2,
            total: 50,
            hasMore: true,
          },
        },
      }),
    });

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/developer/templates?sortBy=rating&sortOrder=desc&page=2&limit=20')
      );
    });
  });

  it('handles template card actions', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('React Authentication Component')).toBeInTheDocument();
    });

    // Test preview button
    const previewButtons = screen.getAllByText('Preview');
    fireEvent.click(previewButtons[0]);
    expect(consoleSpy).toHaveBeenCalledWith('Preview template:', 'template-1');

    // Test integrate button
    const integrateButtons = screen.getAllByText('Integrate');
    fireEvent.click(integrateButtons[0]);
    expect(consoleSpy).toHaveBeenCalledWith('Integrate template:', 'template-1');

    consoleSpy.mockRestore();
  });

  it('retries fetch when try again button is clicked', async () => {
    // First call fails
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockErrorResponse,
    });

    render(<TemplateLibrary />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Templates')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByText('Try Again');
    
    // Second call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByText('React Authentication Component')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});