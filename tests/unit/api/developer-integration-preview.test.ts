import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth/cognito', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/db/jobs', () => ({
  getJob: vi.fn(),
}));

vi.mock('@/lib/db/integrations', () => ({
  getIntegration: vi.fn(),
}));

describe('/api/developer/integration/[jobId]/preview', () => {
  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockJob = {
    PK: 'JOB#job-456',
    SK: 'USER#user-123',
    type: 'integrate' as const,
    status: 'completed' as const,
    progress: 100,
    input: {
      templateId: 'template-789',
      projectId: 'project-101',
      integrationId: 'integration-202',
      userId: 'user-123',
    },
    result: {},
    createdAt: 1709251200,
    updatedAt: 1709337600,
    expiresAt: 1709424000,
  };

  const mockIntegration = {
    PK: 'INTEGRATION#integration-202',
    SK: 'USER#user-123',
    templateId: 'template-789',
    projectId: 'project-101',
    month: '2024-03',
    status: 'preview' as const,
    diff: {
      additions: 45,
      deletions: 12,
      files: [
        {
          path: 'src/components/AuthButton.tsx',
          changes: '@@ -1,5 +1,10 @@\n import React from \'react\';\n+import { Button } from \'@/components/ui/button\';\n+import { useAuth } from \'@/hooks/useAuth\';\n\n-export default function AuthButton() {\n+export default function AuthButton({ variant = \'default\' }) {\n+  const { user, login, logout } = useAuth();\n+\n   return (\n-    <button className="bg-blue-500 text-white px-4 py-2 rounded">\n-      Sign In\n-    </button>\n+    <Button variant={variant} onClick={user ? logout : login}>\n+      {user ? \'Sign Out\' : \'Sign In\'}\n+    </Button>\n   );\n }',
          additions: 8,
          deletions: 4,
        },
      ],
    },
    explanation: 'Successfully integrated authentication template with modern React patterns.',
    previewUrl: 'https://preview-integration-202.vercel.app',
    createdAt: 1709251200,
    updatedAt: 1709337600,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully return integration preview', async () => {
    const { getCurrentUser } = await import('@/lib/auth/cognito');
    const { getJob } = await import('@/lib/db/jobs');
    const { getIntegration } = await import('@/lib/db/integrations');

    // Mock successful flow
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getJob).mockResolvedValue(mockJob);
    vi.mocked(getIntegration).mockResolvedValue(mockIntegration);

    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration/job-456/preview');
    const response = await GET(request, { params: { jobId: 'job-456' } });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      success: true,
      data: {
        diff: mockIntegration.diff,
        previewUrl: mockIntegration.previewUrl,
        explanation: mockIntegration.explanation,
      },
    });

    expect(getCurrentUser).toHaveBeenCalledWith(request);
    expect(getJob).toHaveBeenCalledWith('job-456');
    expect(getIntegration).toHaveBeenCalledWith('integration-202');
  });

  it('should return 400 when jobId is missing', async () => {
    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration//preview');
    const response = await GET(request, { params: { jobId: '' } });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: {
        code: 'MISSING_JOB_ID',
        message: 'Job ID is required',
      },
    });
  });

  it('should return 401 when user is not authenticated', async () => {
    const { getCurrentUser } = await import('@/lib/auth/cognito');
    
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration/job-456/preview');
    const response = await GET(request, { params: { jobId: 'job-456' } });

    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  });

  it('should return 404 when job is not found', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getJob).mockResolvedValue(null);

    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration/job-456/preview');
    const response = await GET(request, { params: { jobId: 'job-456' } });

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: {
        code: 'JOB_NOT_FOUND',
        message: 'Integration job not found',
      },
    });
  });

  it('should return 403 when user does not own the job', async () => {
    const otherUserJob = {
      ...mockJob,
      SK: 'USER#other-user',
    };

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getJob).mockResolvedValue(otherUserJob);

    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration/job-456/preview');
    const response = await GET(request, { params: { jobId: 'job-456' } });

    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'Access denied to this integration job',
      },
    });
  });

  it('should return 400 when job is not an integration job', async () => {
    const extractJob = {
      ...mockJob,
      type: 'extract' as const,
    };

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getJob).mockResolvedValue(extractJob);

    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration/job-456/preview');
    const response = await GET(request, { params: { jobId: 'job-456' } });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INVALID_JOB_TYPE',
        message: 'Job is not an integration job',
      },
    });
  });

  it('should return 409 when job is not completed', async () => {
    const processingJob = {
      ...mockJob,
      status: 'processing' as const,
    };

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getJob).mockResolvedValue(processingJob);

    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration/job-456/preview');
    const response = await GET(request, { params: { jobId: 'job-456' } });

    expect(response.status).toBe(409);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: {
        code: 'JOB_NOT_READY',
        message: 'Integration is processing. Preview is only available for completed integrations.',
      },
    });
  });

  it('should return 500 when integration ID is missing from job input', async () => {
    const jobWithoutIntegrationId = {
      ...mockJob,
      input: {
        templateId: 'template-789',
        projectId: 'project-101',
        userId: 'user-123',
        // integrationId is missing
      },
    };

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getJob).mockResolvedValue(jobWithoutIntegrationId);

    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration/job-456/preview');
    const response = await GET(request, { params: { jobId: 'job-456' } });

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INTEGRATION_ID_MISSING',
        message: 'Integration ID not found in job data',
      },
    });
  });

  it('should return 404 when integration is not found', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getJob).mockResolvedValue(mockJob);
    vi.mocked(getIntegration).mockResolvedValue(null);

    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration/job-456/preview');
    const response = await GET(request, { params: { jobId: 'job-456' } });

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INTEGRATION_NOT_FOUND',
        message: 'Integration data not found',
      },
    });
  });

  it('should return 409 when integration preview data is incomplete', async () => {
    const incompleteIntegration = {
      ...mockIntegration,
      diff: undefined,
      explanation: undefined,
      previewUrl: undefined,
    };

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getJob).mockResolvedValue(mockJob);
    vi.mocked(getIntegration).mockResolvedValue(incompleteIntegration);

    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration/job-456/preview');
    const response = await GET(request, { params: { jobId: 'job-456' } });

    expect(response.status).toBe(409);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: {
        code: 'PREVIEW_NOT_READY',
        message: 'Integration preview data is not available',
      },
    });
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getJob).mockRejectedValue(new Error('Database connection failed'));

    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration/job-456/preview');
    const response = await GET(request, { params: { jobId: 'job-456' } });

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve integration preview',
      },
    });
  });

  it('should validate diff structure in response', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(getJob).mockResolvedValue(mockJob);
    vi.mocked(getIntegration).mockResolvedValue(mockIntegration);

    const { GET } = await import('@/app/api/developer/integration/[jobId]/preview/route');

    const request = new NextRequest('http://localhost:3000/api/developer/integration/job-456/preview');
    const response = await GET(request, { params: { jobId: 'job-456' } });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.diff).toHaveProperty('additions');
    expect(data.data.diff).toHaveProperty('deletions');
    expect(data.data.diff).toHaveProperty('files');
    expect(Array.isArray(data.data.diff.files)).toBe(true);
    
    if (data.data.diff.files.length > 0) {
      const file = data.data.diff.files[0];
      expect(file).toHaveProperty('path');
      expect(file).toHaveProperty('changes');
      expect(file).toHaveProperty('additions');
      expect(file).toHaveProperty('deletions');
    }
  });
});