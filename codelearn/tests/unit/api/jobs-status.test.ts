import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/jobs/[jobId]/route';
import { getItemByPK } from '@/lib/db/dynamodb';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db/dynamodb', () => ({
  getItemByPK: vi.fn(),
  TABLES: {
    JOBS: 'codelearn-jobs-dev',
  },
}));

describe('GET /api/jobs/{jobId}', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return job status successfully', async () => {
    const mockJob = {
      PK: 'JOB#job-123',
      SK: 'USER#user-456',
      status: 'processing',
      progress: 50,
      createdAt: 1709251200000,
      updatedAt: 1709251300000,
    };

    vi.mocked(getItemByPK).mockResolvedValue(mockJob);

    const request = new NextRequest('http://localhost:3000/api/jobs/job-123');
    const response = await GET(request, { params: { jobId: 'job-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.jobId).toBe('job-123');
    expect(data.data.status).toBe('processing');
    expect(data.data.progress).toBe(50);
  });

  it('should return 404 when job not found', async () => {
    vi.mocked(getItemByPK).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/jobs/job-999');
    const response = await GET(request, { params: { jobId: 'job-999' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('should return 400 when jobId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/jobs/');
    const response = await GET(request, { params: { jobId: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle completed job status', async () => {
    const mockJob = {
      PK: 'JOB#job-123',
      SK: 'USER#user-456',
      status: 'completed',
      progress: 100,
      result: { projects: [] },
      createdAt: 1709251200000,
      updatedAt: 1709251300000,
    };

    vi.mocked(getItemByPK).mockResolvedValue(mockJob);

    const request = new NextRequest('http://localhost:3000/api/jobs/job-123');
    const response = await GET(request, { params: { jobId: 'job-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.status).toBe('completed');
    expect(data.data.result).toEqual({ projects: [] });
  });

  it('should handle failed job status', async () => {
    const mockJob = {
      PK: 'JOB#job-123',
      SK: 'USER#user-456',
      status: 'failed',
      progress: 30,
      error: 'AI service unavailable',
      createdAt: 1709251200000,
      updatedAt: 1709251300000,
    };

    vi.mocked(getItemByPK).mockResolvedValue(mockJob);

    const request = new NextRequest('http://localhost:3000/api/jobs/job-123');
    const response = await GET(request, { params: { jobId: 'job-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.status).toBe('failed');
    expect(data.data.error).toBe('AI service unavailable');
  });

  it('should handle database errors', async () => {
    vi.mocked(getItemByPK).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/jobs/job-123');
    const response = await GET(request, { params: { jobId: 'job-123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
  });

  it('should default progress to 0 when not set', async () => {
    const mockJob = {
      PK: 'JOB#job-123',
      SK: 'USER#user-456',
      status: 'queued',
      createdAt: 1709251200000,
      updatedAt: 1709251300000,
    };

    vi.mocked(getItemByPK).mockResolvedValue(mockJob);

    const request = new NextRequest('http://localhost:3000/api/jobs/job-123');
    const response = await GET(request, { params: { jobId: 'job-123' } });
    const data = await response.json();

    expect(data.data.progress).toBe(0);
  });
});
