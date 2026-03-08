/**
 * Unit tests for POST /api/sandbox/deploy
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/sandbox/deploy/route';
import { NextRequest } from 'next/server';
import * as projectDeployer from '@/lib/deployment/project-deployer';
import * as vercelClient from '@/lib/deployment/vercel-client';
import * as netlifyClient from '@/lib/deployment/netlify-client';

vi.mock('@/lib/deployment/project-deployer');
vi.mock('@/lib/deployment/vercel-client');
vi.mock('@/lib/deployment/netlify-client');

describe('POST /api/sandbox/deploy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(vercelClient.isVercelConfigured).mockReturnValue(true);
    vi.mocked(netlifyClient.isNetlifyConfigured).mockReturnValue(true);
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
      headers: {
        'authorization': 'Bearer test-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 'proj-123',
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
        platform: 'vercel',
      },
    });

    expect(projectDeployer.deployProject).toHaveBeenCalledWith({
      projectId: 'proj-123',
      userId: 'test-user',
      platform: 'vercel',
    });
  });

  it('should return 400 when projectId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer test-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        platform: 'vercel',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'projectId and platform are required',
      },
    });
  });

  it('should return 400 when platform is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer test-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 'proj-123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'projectId and platform are required',
      },
    });
  });

  it('should return 401 when authorization is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
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
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  });

  it('should return 400 when platform is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer test-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 'proj-123',
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
        message: 'Platform must be vercel or netlify',
      },
    });
  });

  it('should deploy to Netlify successfully', async () => {
    const mockResult = {
      deploymentId: 'deploy-123',
      url: 'https://my-app.netlify.app',
      status: 'building' as const,
      platform: 'netlify' as const,
    };

    vi.mocked(projectDeployer.deployProject).mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer test-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 'proj-123',
        platform: 'netlify',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        deploymentId: 'deploy-123',
        url: 'https://my-app.netlify.app',
        status: 'building',
        platform: 'netlify',
      },
    });

    expect(projectDeployer.deployProject).toHaveBeenCalledWith({
      projectId: 'proj-123',
      userId: 'test-user',
      platform: 'netlify',
    });
  });

  it('should return 500 when project not found', async () => {
    vi.mocked(projectDeployer.deployProject).mockRejectedValue(
      new Error('Project not found')
    );

    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer test-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 'proj-invalid',
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
        message: 'Project not found',
      },
    });
  });

  it('should return 500 when project code not found', async () => {
    vi.mocked(projectDeployer.deployProject).mockRejectedValue(
      new Error('Project code not found in storage')
    );

    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer test-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 'proj-123',
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
        message: 'Project code not found in storage',
      },
    });
  });

  it('should return 500 when deployment fails', async () => {
    vi.mocked(projectDeployer.deployProject).mockRejectedValue(
      new Error('Vercel deployment failed: Invalid configuration')
    );

    const request = new NextRequest('http://localhost:3000/api/sandbox/deploy', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer test-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 'proj-123',
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
      headers: {
        'authorization': 'Bearer test-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 'proj-123',
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
        message: 'Unexpected error',
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
      'http://localhost:3000/api/sandbox/deploy?deploymentId=dpl_123&platform=vercel',
      {
        headers: {
          'authorization': 'Bearer test-token',
        },
      }
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
        platform: 'vercel',
      },
    });

    expect(projectDeployer.getDeploymentStatusById).toHaveBeenCalledWith('dpl_123', 'vercel');
  });

  it('should return 400 when deploymentId is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/sandbox/deploy?platform=vercel',
      {
        headers: {
          'authorization': 'Bearer test-token',
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'deploymentId and platform are required',
      },
    });
  });

  it('should return 400 when platform is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/sandbox/deploy?deploymentId=dpl_123',
      {
        headers: {
          'authorization': 'Bearer test-token',
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'deploymentId and platform are required',
      },
    });
  });

  it('should return 500 when getting status fails', async () => {
    vi.mocked(projectDeployer.getDeploymentStatusById).mockRejectedValue(
      new Error('Failed to get status')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/sandbox/deploy?deploymentId=dpl_123&platform=vercel',
      {
        headers: {
          'authorization': 'Bearer test-token',
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'STATUS_FETCH_FAILED',
        message: 'Failed to get status',
      },
    });
  });
});
