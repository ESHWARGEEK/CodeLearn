import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/jobs/[jobId]/cancel/route';
import { getItemByPK, updateItem } from '@/lib/db/dynamodb';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db/dynamodb', () => ({
  getItemByPK: vi.fn(),
  updateItem: vi.fn(),
  TABLES: {
    JOBS: 'codelearn-jobs-dev',
  },
}));

describe('POST /api/jobs/{jobId}/cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cancel a queued job successfully', async () => {
    const mockJob = {
      PK: 'JOB#job-123',
      SK: 'USER#user-456',
      status: 'queued',
      progress: 0,
      createdAt: 1709251200000,
      updatedAt: 1709251300000,
    };

    vi.mocked(getItemByPK).mockResolvedValue(mockJob);
    vi.mocked(updateItem).mockResolvedValue({});

    const request = new NextRequest('http://localhost:3000/api/jobs/job-123/cancel', {
      method: 'POST',
    });
    const response = await POST(request, { params: { jobId: 'job-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.cancelled).toBe(true);
    expect(updateItem).toHaveBeenCalledWith(
      'codelearn-jobs-dev',
      { PK: 'JOB#job-123', SK: 'USER#user-456' },
      'SET #status = :status, #error = :error, #updatedAt = :updatedAt',
      expect.objectContaining({
        ':status': 'failed',
        ':error': 'Job cancelled by user',
      }),
      expect.any(Object)
    );
  });

  it('should cancel a processing job successfully', async () => {
    const mockJob = {
      PK: 'JOB#job-123',
      SK: 'USER#user-456',
      status: 'processing',
      progress: 50,
      createdAt: 1709251200000,
      updatedAt: 1709251300000,
    };

    vi.mocked(getItemByPK).mockResolvedValue(mockJob);
    vi.mocked(updateItem).mockResolvedValue({});

    const request = new NextRequest('http://localhost:3000/api/jobs/job-123/cancel', {
      method: 'POST',
    });
    const response = await POST(request, { params: { jobId: 'job-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 404 when job not found', async () => {
    vi.mocked(getItemByPK).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/jobs/job-999/cancel', {
      method: 'POST',
    });
    const response = await POST(request, { params: { jobId: 'job-999' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('should return 400 when trying to cancel completed job', async () => {
    const mockJob = {
      PK: 'JOB#job-123',
      SK: 'USER#user-456',
      status: 'completed',
      progress: 100,
      createdAt: 1709251200000,
      updatedAt: 1709251300000,
    };

    vi.mocked(getItemByPK).mockResolvedValue(mockJob);

    const request = new NextRequest('http://localhost:3000/api/jobs/job-123/cancel', {
      method: 'POST',
    });
    const response = await POST(request, { params: { jobId: 'job-123' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('Cannot cancel job with status: completed');
  });

  it('should return 400 when trying to cancel failed job', async () => {
    const mockJob = {
      PK: 'JOB#job-123',
      SK: 'USER#user-456',
      status: 'failed',
      progress: 30,
      error: 'Previous error',
      createdAt: 1709251200000,
      updatedAt: 1709251300000,
    };

    vi.mocked(getItemByPK).mockResolvedValue(mockJob);

    const request = new NextRequest('http://localhost:3000/api/jobs/job-123/cancel', {
      method: 'POST',
    });
    const response = await POST(request, { params: { jobId: 'job-123' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('Cannot cancel job with status: failed');
  });

  it('should return 400 when jobId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/jobs//cancel', {
      method: 'POST',
    });
    const response = await POST(request, { params: { jobId: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle database errors during cancellation', async () => {
    const mockJob = {
      PK: 'JOB#job-123',
      SK: 'USER#user-456',
      status: 'processing',
      progress: 50,
      createdAt: 1709251200000,
      updatedAt: 1709251300000,
    };

    vi.mocked(getItemByPK).mockResolvedValue(mockJob);
    vi.mocked(updateItem).mockRejectedValue(new Error('Database update failed'));

    const request = new NextRequest('http://localhost:3000/api/jobs/job-123/cancel', {
      method: 'POST',
    });
    const response = await POST(request, { params: { jobId: 'job-123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
  });

  it('should handle database errors during job lookup', async () => {
    vi.mocked(getItemByPK).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/jobs/job-123/cancel', {
      method: 'POST',
    });
    const response = await POST(request, { params: { jobId: 'job-123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
