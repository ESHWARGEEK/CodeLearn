import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/developer/integration/[jobId]/undo/route';

// Mock dependencies
vi.mock('@/lib/auth/cognito', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/db/jobs', () => ({
  getJob: vi.fn(),
}));

vi.mock('@/lib/db/integrations', () => ({
  getIntegration: vi.fn(),
  updateIntegrationStatus: vi.fn(),
}));

const { getCurrentUser } = await import('@/lib/auth/cognito');
const { getJob } = await import('@/lib/db/jobs');
const { getIntegration, updateIntegrationStatus } = await import('@/lib/db/integrations');

const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockGetJob = vi.mocked(getJob);
const mockGetIntegration = vi.mocked(getIntegration);
const mockUpdateIntegrationStatus = vi.mocked(updateIntegrationStatus);

describe('/api/developer/integration/[jobId]/undo', () => {
  const mockUser = {
    userId: 'user123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockJob = {
    PK: 'JOB#job123',
    SK: 'USER#user123',
    type: 'integrate',
    status: 'completed',
    input: {
      integrationId: 'integration123',
      templateId: 'template123',
      projectId: 'project123',
    },
    createdAt: 1640995200,
    updatedAt: 1640995200,
  };

  const mockIntegration = {
    PK: 'INTEGRATION#integration123',
    SK: 'USER#user123',
    templateId: 'template123',
    projectId: 'project123',
    month: '2024-02',
    status: 'preview' as const,
    diff: {
      additions: 10,
      deletions: 5,
      files: [
        {
          path: 'src/components/Button.tsx',
          changes: 'mock diff content',
        },
      ],
    },
    explanation: 'Added a new button component',
    previewUrl: 'https://preview.example.com',
    createdAt: 1640995200,
    updatedAt: 1640995200,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should undo integration successfully', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetJob.mockResolvedValue(mockJob);
    mockGetIntegration.mockResolvedValue(mockIntegration);
    mockUpdateIntegrationStatus.mockResolvedValue();

    const request = new NextRequest('http://localhost/api/developer/integration/job123/undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: 'job123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({
      integrationId: 'integration123',
      status: 'undone',
      message: 'Integration undone successfully. Changes have been reverted from your project.',
    });
    expect(mockUpdateIntegrationStatus).toHaveBeenCalledWith('integration123', 'undone');
  });

  it('should return 400 for missing job ID', async () => {
    const request = new NextRequest('http://localhost/api/developer/integration//undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('MISSING_JOB_ID');
  });

  it('should return 401 for unauthenticated user', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/developer/integration/job123/undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: 'job123' } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('UNAUTHORIZED');
  });

  it('should return 404 for non-existent job', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetJob.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/developer/integration/job123/undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: 'job123' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('JOB_NOT_FOUND');
  });

  it('should return 403 for job not owned by user', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetJob.mockResolvedValue({
      ...mockJob,
      SK: 'USER#otheruser',
    });

    const request = new NextRequest('http://localhost/api/developer/integration/job123/undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: 'job123' } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('ACCESS_DENIED');
  });

  it('should return 400 for non-integration job', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetJob.mockResolvedValue({
      ...mockJob,
      type: 'curate',
    });

    const request = new NextRequest('http://localhost/api/developer/integration/job123/undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: 'job123' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('INVALID_JOB_TYPE');
  });

  it('should return 409 for non-completed job', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetJob.mockResolvedValue({
      ...mockJob,
      status: 'processing',
    });

    const request = new NextRequest('http://localhost/api/developer/integration/job123/undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: 'job123' } });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('JOB_NOT_READY');
  });

  it('should return 404 for non-existent integration', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetJob.mockResolvedValue(mockJob);
    mockGetIntegration.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/developer/integration/job123/undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: 'job123' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('INTEGRATION_NOT_FOUND');
  });

  it('should return 409 for already undone integration', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetJob.mockResolvedValue(mockJob);
    mockGetIntegration.mockResolvedValue({
      ...mockIntegration,
      status: 'undone',
    });

    const request = new NextRequest('http://localhost/api/developer/integration/job123/undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: 'job123' } });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('ALREADY_UNDONE');
  });

  it('should return 500 for missing integration ID in job', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetJob.mockResolvedValue({
      ...mockJob,
      input: {
        templateId: 'template123',
        projectId: 'project123',
      },
    });

    const request = new NextRequest('http://localhost/api/developer/integration/job123/undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: 'job123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('INTEGRATION_ID_MISSING');
  });

  it('should return 500 for database error', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetJob.mockResolvedValue(mockJob);
    mockGetIntegration.mockResolvedValue(mockIntegration);
    mockUpdateIntegrationStatus.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost/api/developer/integration/job123/undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: 'job123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error?.code).toBe('INTERNAL_ERROR');
  });

  it('should undo approved integration', async () => {
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetJob.mockResolvedValue(mockJob);
    mockGetIntegration.mockResolvedValue({
      ...mockIntegration,
      status: 'approved',
    });
    mockUpdateIntegrationStatus.mockResolvedValue();

    const request = new NextRequest('http://localhost/api/developer/integration/job123/undo', {
      method: 'POST',
    });

    const response = await POST(request, { params: { jobId: 'job123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({
      integrationId: 'integration123',
      status: 'undone',
      message: 'Integration undone successfully. Changes have been reverted from your project.',
    });
    expect(mockUpdateIntegrationStatus).toHaveBeenCalledWith('integration123', 'undone');
  });
});