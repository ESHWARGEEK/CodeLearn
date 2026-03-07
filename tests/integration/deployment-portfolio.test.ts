/**
 * Integration tests for deployment → portfolio flow
 * 
 * Tests the complete flow from deploying a project to seeing it in the portfolio
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deployProject } from '@/lib/deployment/project-deployer';
import { getDeployedProjectsByUser, createProject } from '@/lib/db/projects';
import * as s3 from '@/lib/storage/s3';
import * as vercelClient from '@/lib/deployment/vercel-client';
import * as netlifyClient from '@/lib/deployment/netlify-client';
import * as dynamodb from '@/lib/db/dynamodb';

// Mock dependencies
vi.mock('@/lib/storage/s3');
vi.mock('@/lib/deployment/vercel-client');
vi.mock('@/lib/deployment/netlify-client');
vi.mock('@/lib/db/dynamodb');

// Mock JSZip
vi.mock('jszip', () => {
  return {
    default: class JSZip {
      files: Record<string, any> = {};
      
      static async loadAsync(buffer: Buffer) {
        const zip = new JSZip();
        // Mock some files
        zip.files = {
          'index.html': {
            dir: false,
            async: (type: string) => Promise.resolve('<html></html>'),
          },
          'package.json': {
            dir: false,
            async: (type: string) => Promise.resolve('{"name":"test"}'),
          },
        };
        return zip;
      }
    },
  };
});

describe('Deployment → Portfolio Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add deployed project to portfolio after successful Vercel deployment', async () => {
    // Setup: Create a project
    const projectId = 'proj-123';
    const userId = 'user-456';
    
    const mockProject = {
      PK: `PROJECT#${projectId}`,
      SK: `USER#${userId}`,
      name: 'Test App',
      technology: 'react',
      type: 'learning' as const,
      status: 'active' as const,
      progress: 100,
      codeS3Key: `${userId}/${projectId}/code.zip`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Mock database operations
    vi.mocked(dynamodb.getItem).mockResolvedValue(mockProject);
    vi.mocked(dynamodb.putItem).mockResolvedValue();
    vi.mocked(dynamodb.queryItems).mockResolvedValue([mockProject]);

    // Mock S3 code retrieval
    const mockZipBuffer = Buffer.from('mock-zip-content');
    vi.mocked(s3.getObject).mockResolvedValue(mockZipBuffer);

    // Mock Vercel deployment
    const mockVercelDeployment = {
      id: 'dpl_123',
      url: 'test-app.vercel.app',
      status: 'READY',
      createdAt: Date.now(),
    };
    vi.mocked(vercelClient.createDeployment).mockResolvedValue(mockVercelDeployment);

    // Deploy the project
    const deploymentResult = await deployProject({
      projectId,
      userId,
      platform: 'vercel',
    });

    // Verify deployment result
    expect(deploymentResult).toMatchObject({
      deploymentId: 'dpl_123',
      url: 'https://test-app.vercel.app',
      status: 'ready',
      platform: 'vercel',
    });

    // Verify project was updated with deployment info
    expect(dynamodb.putItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        deploymentUrl: 'https://test-app.vercel.app',
        deploymentPlatform: 'vercel',
        deployedAt: expect.any(Number),
      })
    );

    // Mock the updated project with deployment info
    const updatedProject = {
      ...mockProject,
      deploymentUrl: 'https://test-app.vercel.app',
      deploymentPlatform: 'vercel' as const,
      deployedAt: Date.now(),
    };
    vi.mocked(dynamodb.queryItems).mockResolvedValue([updatedProject]);

    // Verify project appears in portfolio
    const portfolioProjects = await getDeployedProjectsByUser(userId);
    expect(portfolioProjects).toHaveLength(1);
    expect(portfolioProjects[0]).toMatchObject({
      deploymentUrl: 'https://test-app.vercel.app',
      deploymentPlatform: 'vercel',
    });
  });

  it('should add deployed project to portfolio after successful Netlify deployment', async () => {
    const projectId = 'proj-789';
    const userId = 'user-456';
    
    const mockProject = {
      PK: `PROJECT#${projectId}`,
      SK: `USER#${userId}`,
      name: 'Vue App',
      technology: 'vue',
      type: 'learning' as const,
      status: 'completed' as const,
      progress: 100,
      codeS3Key: `${userId}/${projectId}/code.zip`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    vi.mocked(dynamodb.getItem).mockResolvedValue(mockProject);
    vi.mocked(dynamodb.putItem).mockResolvedValue();

    const mockZipBuffer = Buffer.from('mock-zip-content');
    vi.mocked(s3.getObject).mockResolvedValue(mockZipBuffer);

    const mockNetlifyDeployment = {
      id: 'ntl_456',
      url: 'https://vue-app.netlify.app',
      status: 'ready',
      createdAt: Date.now(),
    };
    vi.mocked(netlifyClient.createDeployment).mockResolvedValue(mockNetlifyDeployment);

    const deploymentResult = await deployProject({
      projectId,
      userId,
      platform: 'netlify',
    });

    expect(deploymentResult).toMatchObject({
      deploymentId: 'ntl_456',
      url: 'https://vue-app.netlify.app',
      status: 'ready',
      platform: 'netlify',
    });

    expect(dynamodb.putItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        deploymentUrl: 'https://vue-app.netlify.app',
        deploymentPlatform: 'netlify',
        deployedAt: expect.any(Number),
      })
    );
  });

  it('should support redeployment by updating existing deployment URL', async () => {
    const projectId = 'proj-123';
    const userId = 'user-456';
    
    // Project already has a deployment
    const mockProject = {
      PK: `PROJECT#${projectId}`,
      SK: `USER#${userId}`,
      name: 'Test App',
      technology: 'react',
      type: 'learning' as const,
      status: 'completed' as const,
      progress: 100,
      codeS3Key: `${userId}/${projectId}/code.zip`,
      deploymentUrl: 'https://old-url.vercel.app',
      deploymentPlatform: 'vercel' as const,
      deployedAt: 1709251200,
      createdAt: 1709251200,
      updatedAt: 1709337600,
    };

    vi.mocked(dynamodb.getItem).mockResolvedValue(mockProject);
    vi.mocked(dynamodb.putItem).mockResolvedValue();

    const mockZipBuffer = Buffer.from('mock-zip-content');
    vi.mocked(s3.getObject).mockResolvedValue(mockZipBuffer);

    const mockVercelDeployment = {
      id: 'dpl_new',
      url: 'new-url.vercel.app',
      status: 'READY',
      createdAt: Date.now(),
    };
    vi.mocked(vercelClient.createDeployment).mockResolvedValue(mockVercelDeployment);

    // Redeploy
    const deploymentResult = await deployProject({
      projectId,
      userId,
      platform: 'vercel',
    });

    expect(deploymentResult.url).toBe('https://new-url.vercel.app');

    // Verify deployment URL was updated
    expect(dynamodb.putItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        deploymentUrl: 'https://new-url.vercel.app',
        deploymentPlatform: 'vercel',
        deployedAt: expect.any(Number),
      })
    );
  });

  it('should handle multiple deployed projects in portfolio', async () => {
    const userId = 'user-456';
    
    const mockProjects = [
      {
        PK: 'PROJECT#proj-1',
        SK: `USER#${userId}`,
        name: 'React App',
        technology: 'react',
        type: 'learning' as const,
        status: 'completed' as const,
        progress: 100,
        codeS3Key: `${userId}/proj-1/code.zip`,
        deploymentUrl: 'https://react-app.vercel.app',
        deploymentPlatform: 'vercel' as const,
        deployedAt: 1709251200,
        createdAt: 1709251200,
        updatedAt: 1709337600,
      },
      {
        PK: 'PROJECT#proj-2',
        SK: `USER#${userId}`,
        name: 'Vue App',
        technology: 'vue',
        type: 'learning' as const,
        status: 'completed' as const,
        progress: 100,
        codeS3Key: `${userId}/proj-2/code.zip`,
        deploymentUrl: 'https://vue-app.netlify.app',
        deploymentPlatform: 'netlify' as const,
        deployedAt: 1709337600,
        createdAt: 1709251200,
        updatedAt: 1709337600,
      },
      {
        PK: 'PROJECT#proj-3',
        SK: `USER#${userId}`,
        name: 'Not Deployed',
        technology: 'nextjs',
        type: 'learning' as const,
        status: 'active' as const,
        progress: 50,
        codeS3Key: `${userId}/proj-3/code.zip`,
        createdAt: 1709251200,
        updatedAt: 1709337600,
      },
    ];

    vi.mocked(dynamodb.queryItems).mockResolvedValue(mockProjects);

    const portfolioProjects = await getDeployedProjectsByUser(userId);

    // Should only return deployed projects
    expect(portfolioProjects).toHaveLength(2);
    expect(portfolioProjects[0].deploymentUrl).toBe('https://react-app.vercel.app');
    expect(portfolioProjects[1].deploymentUrl).toBe('https://vue-app.netlify.app');
  });

  it('should not add project to portfolio if deployment fails', async () => {
    const projectId = 'proj-fail';
    const userId = 'user-456';
    
    const mockProject = {
      PK: `PROJECT#${projectId}`,
      SK: `USER#${userId}`,
      name: 'Failed App',
      technology: 'react',
      type: 'learning' as const,
      status: 'active' as const,
      progress: 100,
      codeS3Key: `${userId}/${projectId}/code.zip`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    vi.mocked(dynamodb.getItem).mockResolvedValue(mockProject);

    const mockZipBuffer = Buffer.from('mock-zip-content');
    vi.mocked(s3.getObject).mockResolvedValue(mockZipBuffer);

    // Mock deployment failure
    vi.mocked(vercelClient.createDeployment).mockRejectedValue(
      new Error('Vercel deployment failed')
    );

    // Deployment should fail
    await expect(
      deployProject({
        projectId,
        userId,
        platform: 'vercel',
      })
    ).rejects.toThrow('Vercel deployment failed');

    // Verify project was NOT updated with deployment info
    expect(dynamodb.putItem).not.toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        deploymentUrl: expect.any(String),
      })
    );
  });
});
