import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import TemplateExtractor from '@/components/developer/TemplateExtractor';

// Mock the JobStatusPoller component
vi.mock('@/components/shared/JobStatusPoller', () => {
  return {
    default: function MockJobStatusPoller({ onComplete, onError }: any) {
      return (
        <div data-testid="job-status-poller">
          <button onClick={() => onComplete({ components: [], repositoryInfo: {} })}>
            Complete Job
          </button>
          <button onClick={() => onError('Test error')}>Error Job</button>
        </div>
      );
    }
  };
});

// Mock fetch
global.fetch = vi.fn();

describe('TemplateExtractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the template extractor interface', () => {
    render(<TemplateExtractor />);
    
    expect(screen.getByText('Template Extractor')).toBeInTheDocument();
    expect(screen.getByText('GitHub Repository')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://github.com/owner/repo (supports HTTPS and SSH formats)')).toBeInTheDocument();
    expect(screen.getByText('Analyze')).toBeInTheDocument();
  });

  it('button is disabled for empty URL', async () => {
    render(<TemplateExtractor />);
    
    const analyzeButton = screen.getByText('Analyze');
    
    // Button should be disabled when URL is empty
    expect(analyzeButton).toBeDisabled();
  });

  it('shows error for invalid URL format', async () => {
    render(<TemplateExtractor />);
    
    const input = screen.getByPlaceholderText('https://github.com/owner/repo (supports HTTPS and SSH formats)');
    fireEvent.change(input, { target: { value: 'invalid-url' } });
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid GitHub URL format/)).toBeInTheDocument();
    });
  });

  it('accepts valid GitHub URL format', async () => {
    const mockResponse = {
      success: true,
      data: { jobId: 'test-job-123', status: 'queued' }
    };
    
    (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    render(<TemplateExtractor />);
    
    const input = screen.getByPlaceholderText('https://github.com/owner/repo (supports HTTPS and SSH formats)');
    fireEvent.change(input, { target: { value: 'https://github.com/user/repo' } });
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/developer/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUrl: 'https://github.com/user/repo',
        }),
      });
    });
  });

  it('shows job status poller when job is created', async () => {
    const mockResponse = {
      success: true,
      data: { jobId: 'test-job-123', status: 'queued' }
    };
    
    (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    render(<TemplateExtractor />);
    
    const input = screen.getByPlaceholderText('https://github.com/owner/repo (supports HTTPS and SSH formats)');
    fireEvent.change(input, { target: { value: 'https://github.com/user/repo' } });
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('job-status-poller')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    const mockResponse = {
      success: false,
      error: { message: 'API Error' }
    };
    
    (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    render(<TemplateExtractor />);
    
    const input = screen.getByPlaceholderText('https://github.com/owner/repo (supports HTTPS and SSH formats)');
    fireEvent.change(input, { target: { value: 'https://github.com/user/repo' } });
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('handles network error gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<TemplateExtractor />);
    
    const input = screen.getByPlaceholderText('https://github.com/owner/repo (supports HTTPS and SSH formats)');
    fireEvent.change(input, { target: { value: 'https://github.com/user/repo' } });
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows empty state initially', () => {
    render(<TemplateExtractor />);
    
    expect(screen.getByText('Ready to Extract Templates')).toBeInTheDocument();
    expect(screen.getByText(/Enter a GitHub repository URL above to get started/)).toBeInTheDocument();
  });

  it('disables analyze button when analyzing', async () => {
    const mockResponse = {
      success: true,
      data: { jobId: 'test-job-123', status: 'queued' }
    };
    
    (global.fetch as any).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ json: () => Promise.resolve(mockResponse) }), 100))
    );

    render(<TemplateExtractor />);
    
    const input = screen.getByPlaceholderText('https://github.com/owner/repo (supports HTTPS and SSH formats)');
    fireEvent.change(input, { target: { value: 'https://github.com/user/repo' } });
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);
    
    // Button should be disabled and show "Analyzing..." text
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    expect(analyzeButton).toBeDisabled();
  });
});