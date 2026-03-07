/**
 * Unit tests for POST /api/sandbox/deploy
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/sandbox/deploy/route';
import { NextRequest } from 'next/server';
import * as projectDeployer from '@/lib/deployment/project-deployer';
import * as vercelClient from '@/lib/deployment/vercel-client';

vi.mock('@/lib/deployment/project-deployer');
vi.mock('@/lib/deployment/vercel-client');

describe('POST /api/sandbox/deploy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(vercelClient.isVercelConfigured).mockReturnValue(true);
  });

  it('should deploy project successfully', async () => {
    const mockResult = {
      deploymentId: 'dpl_123',
      url: 'https://my-app.vercel.app',
      status: 'building' as const,
      platform: 'vercel' as const,
    };

    vi.mocked(projectDeployer.deployProject).mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-123',
        userId: 'user-456',
        platform: 'vercel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        deploymentId: 'dpl_123',
        url: 'https://my-app.vercel.app',
        status: 'building',
      },
    });

    expect(projectDeployer.deployProject).toHaveBeenCalledWith({
      projectId: 'proj-123',
      userId: 'user-456',
      platform: 'vercel',
    });
  });

  it('should return 400 when projectId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user-456',
        platform: 'vercel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'MISSING_PROJECT_ID',
        message: 'Project ID is required',
      },
    });
  });

  it('should return 400 when platform is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-123',
        userId: 'user-456',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'MISSING_PLATFORM',
        message: 'Platform is required',
      },
    });
  });

  it('should return 401 when userId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-123',
        platform: 'vercel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'MISSING_USER_ID',
        message: 'User ID is required',
      },
    });
  });

  it('should return 400 when platform is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-123',
        userId: 'user-456',
        platform: 'heroku',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INVALID_PLATFORM',
        message: 'Platform must be either "vercel" or "netlify"',
      },
    });
  });

  it('should return 503 when Vercel is not configured', async () => {
    vi.mocked(vercelClient.isVercelConfigured).mockReturnValue(false);

    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-123',
        userId: 'user-456',
        platform: 'vercel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'VERCEL_NOT_CONFIGURED',
        message: 'Vercel deployment is not configured. Please set VERCEL_TOKEN environment variable.',
      },
    });
  });

  it('should return 501 for Netlify platform', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-123',
        userId: 'user-456',
        platform: 'netlify',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(501);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'NETLIFY_NOT_IMPLEMENTED',
        message: 'Netlify deployment is not yet implemented',
      },
    });
  });

  it('should return 404 when project not found', async () => {
    vi.mocked(projectDeployer.deployProject).mockRejectedValue(
      new Error('Project not found')
    );

    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-invalid',
        userId: 'user-456',
        platform: 'vercel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'PROJECT_NOT_FOUND',
        message: 'Project not found',
      },
    });
  });

  it('should return 404 when project code not found', async () => {
    vi.mocked(projectDeployer.deployProject).mockRejectedValue(
      new Error('Project code not found in storage')
    );

    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-123',
        userId: 'user-456',
        platform: 'vercel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'PROJECT_CODE_NOT_FOUND',
        message: 'Project code not found. Please save your project first.',
      },
    });
  });

  it('should return 500 when Vercel deployment fails', async () => {
    vi.mocked(projectDeployer.deployProject).mockRejectedValue(
      new Error('Vercel deployment failed: Invalid configuration')
    );

    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-123',
        userId: 'user-456',
        platform: 'vercel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'DEPLOYMENT_FAILED',
        message: 'Vercel deployment failed: Invalid configuration',
      },
    });
  });

  it('should return 500 for unexpected errors', async () => {
    vi.mocked(projectDeployer.deployProject).mockRejectedValue(
      new Error('Unexpected error')
    );

    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-123',
        userId: 'user-456',
        platform: 'vercel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred during deployment',
      },
    });
  });
});

describe('GET /api/sandbox/deploy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get deployment status successfully', async () => {
    const mockResult = {
      deploymentId: 'dpl_123',
      url: 'https://my-app.vercel.app',
      status: 'ready' as const,
      platform: 'vercel' as const,
    };

    vi.mocked(projectDeployer.getDeploymentStatusById).mockResolvedValue(mockResult);

    const request = new NextRequest(
      'http://localhost:3000/api/sandbox/deploy?deploymentId=dpl_123&platform=vercel'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        deploymentId: 'dpl_123',
        url: 'https://my-app.vercel.app',
        status: 'ready',
      },
    });

    expect(projectDeployer.getDeploymentStatusById).toHaveBeenCalledWith('dpl_123', 'vercel');
  });

  it('should return 400 when deploymentId is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/sandbox/deploy?platform=vercel'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'MISSING_DEPLOYMENT_ID',
        message: 'Deployment ID is required',
      },
    });
  });

  it('should return 400 when platform is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/sandbox/deploy?deploymentId=dpl_123'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'MISSING_PLATFORM',
        message: 'Platform is required',
      },
    });
  });

  it('should return 500 when getting status fails', async () => {
    vi.mocked(projectDeployer.getDeploymentStatusById).mockRejectedValue(
      new Error('Failed to get status')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/sandbox/deploy?deploymentId=dpl_123&platform=vercel'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get deployment status',
      },
    });
  });
});
