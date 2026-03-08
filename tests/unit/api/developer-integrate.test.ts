import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/developer/integrate/route';

// Mock dependencies
vi.mock('@/lib/auth/cognito', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/db/templates', () => ({
  getTemplate: vi.fn(),
}));

vi.mock('@/lib/db/projects', () => ({
  getProjectByUser: vi.fn(),
}));

vi.mock('@/lib/db/jobs', () => ({
  createJob: vi.fn(),
}));

vi.mock('@/lib/db/integrations', () => ({
  createIntegration: vi.fn(),
  getMonthlyIntegrationCount: vi.fn(),
}));

vi.mock('@/lib/db/users', () => ({
  checkIntegrationLimit: vi.fn(),
}));

const { getCurrentUser } = await import('@/lib/auth/cognito');
const { getTemplate } = await import('@/lib/db/templates');
const { getProjectByUser } = await import('@/lib/db/projects');
const { createJob } = await import('@/lib/db/jobs');
const { createIntegration, getMonthlyIntegrationCount } = await import('@/lib/db/integrations');
const { checkIntegrationLimit } = await import('@/lib/db/users');

describe('/api/developer/integrate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockTemplate = {
    PK: 'TEMPLATE#template-456',
    SK: 'METADATA',
    name: 'React Button Component',
    description: 'A reusable button component',
    technology: 'react',
    category: 'ui',
    codeS3Key: 'templates/template-456/code.zip',
    sourceRepo: 'https://github.com/example/repo',
    rating: 4.5,
    downloads: 100,
    createdBy: 'user-789',
    createdAt: 1709251200,
    updatedAt: 1709251200,
  };

  const mockProject = {
    PK: 'PROJECT#project-789',
    SK: 'USER#user-123',
    name: 'My React App',
    technology: 'react',
    type: 'custom' as const,
    status: 'active' as const,
    progress: 50,
    codeS3Key: 'user-123/project-789/code.zip',
    createdAt: 1709251200,
    updatedAt: 1709251200,
  };

  it('should successfully create integration job', async () => {
    // Mock successful flow
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getTemplate).mockResolvedValue(mockTemplate);
    vi.mocked(getProjectByUser).mockResolvedValue(mockProject);
    vi.mocked(getMonthlyIntegrationCount).mockResolvedValue(2);
    vi.mocked(checkIntegrationLimit).mockResolvedValue({
      allowed: true,
      limit: 5,
      remaining: 3,
    });
    vi.mocked(createIntegration).mockResolvedValue({
      PK: 'INTEGRATION#int-123',
      SK: 'USER#user-123',
      templateId: 'template-456',
      projectId: 'project-789',
      month: '2024-03',
      status: 'preview',
      createdAt: 1709251200,
      updatedAt: 1709251200,
    });
    vi.mocked(createJob).mockResolvedValue({
      PK: 'JOB#job-123',
      SK: 'USER#user-123',
      type: 'integrate',
      status: 'queued',
      progress: 0,
      input: {},
      createdAt: 1709251200,
      updatedAt: 1709251200,
      expiresAt: 1709337600,
    });

    const request = new NextRequest('http://localhost:3000/api/developer/integrate', {
      method: 'POST',
      body: JSON.stringify({
        templateId: 'template-456',
        projectId: 'project-789',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      status: 'queued',
    });
    expect(data.data.jobId).toMatch(/^job_\d+_[a-z0-9]+$/);
    expect(data.data.integrationId).toMatch(/^int_\d+_[a-z0-9]+$/);

    // Verify database calls
    expect(getTemplate).toHaveBeenCalledWith('template-456');
    expect(getProjectByUser).toHaveBeenCalledWith('project-789', 'user-123');
    expect(getMonthlyIntegrationCount).toHaveBeenCalledWith('user-123');
    expect(checkIntegrationLimit).toHaveBeenCalledWith('user-123', 2);
    expect(createIntegration).toHaveBeenCalled();
    expect(createJob).toHaveBeenCalled();
  });

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/developer/integrate', {
      method: 'POST',
      body: JSON.stringify({
        templateId: 'template-456',
        projectId: 'project-789',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 400 when required parameters are missing', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    const request = new NextRequest('http://localhost:3000/api/developer/integrate', {
      method: 'POST',
      body: JSON.stringify({
        templateId: 'template-456',
        // Missing projectId
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('MISSING_PARAMETERS');
  });

  it('should return 404 when template is not found', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getTemplate).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/developer/integrate', {
      method: 'POST',
      body: JSON.stringify({
        templateId: 'nonexistent-template',
        projectId: 'project-789',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('TEMPLATE_NOT_FOUND');
  });

  it('should return 404 when project is not found or user does not own it', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getTemplate).mockResolvedValue(mockTemplate);
    vi.mocked(getProjectByUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/developer/integrate', {
      method: 'POST',
      body: JSON.stringify({
        templateId: 'template-456',
        projectId: 'nonexistent-project',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROJECT_NOT_FOUND');
  });

  it('should return 429 when integration limit is exceeded', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getTemplate).mockResolvedValue(mockTemplate);
    vi.mocked(getProjectByUser).mockResolvedValue(mockProject);
    vi.mocked(getMonthlyIntegrationCount).mockResolvedValue(5);
    vi.mocked(checkIntegrationLimit).mockResolvedValue({
      allowed: false,
      limit: 5,
      remaining: 0,
    });

    const request = new NextRequest('http://localhost:3000/api/developer/integrate', {
      method: 'POST',
      body: JSON.stringify({
        templateId: 'template-456',
        projectId: 'project-789',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTEGRATION_LIMIT_EXCEEDED');
    expect(data.error.message).toContain('Integration limit exceeded');
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getTemplate).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/developer/integrate', {
      method: 'POST',
      body: JSON.stringify({
        templateId: 'template-456',
        projectId: 'project-789',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('should handle invalid JSON gracefully', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    const request = new NextRequest('http://localhost:3000/api/developer/integrate', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });
});