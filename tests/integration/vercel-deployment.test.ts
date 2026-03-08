/**
 * Integration tests for Vercel deployment flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deployProject } from '@/lib/deployment/project-deployer';
import JSZip from 'jszip';

// Mock the database and storage modules
vi.mock('@/lib/db/projects', () => {
  const projects = new Map();
  
  return {
    createProject: vi.fn().mockImplementation(async (projectId: string, userId: string, data: any) => {
      const project = {
        PK: `PROJECT#${projectId}`,
        SK: `USER#${userId}`,
        name: data.name,
        technology: data.technology,
        type: data.type,
        status: 'active',
        progress: 0,
        codeS3Key: `${userId}/${projectId}/code.zip`,
        githubSourceUrl: data.githubSourceUrl,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      };
      projects.set(`${projectId}#${userId}`, project);
      return project;
    }),
    getProjectByUser: vi.fn().mockImplementation(async (projectId: string, userId: string) => {
      return projects.get(`${projectId}#${userId}`) || null;
    }),
    updateProjectDeployment: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('@/lib/storage/s3', () => {
  const storage = new Map();
  
  return {
    putObject: vi.fn().mockImplementation(async (key: string, data: Buffer) => {
      storage.set(key, data);
    }),
    getObject: vi.fn().mockImplementation(async (key: string) => {
      return storage.get(key) || null;
    }),
  };
});

// Mock external services
vi.mock('@/lib/deployment/vercel-client', () => ({
  createDeployment: vi.fn().mockResolvedValue({
    id: 'dpl_test_123',
    url: 'test-project.vercel.app',
    status: 'BUILDING',
    readyState: 'BUILDING',
    createdAt: Date.now(),
  }),
  getDeploymentStatus: vi.fn().mockResolvedValue({
    id: 'dpl_test_123',
    url: 'test-project.vercel.app',
    status: 'READY',
    readyState: 'READY',
    createdAt: Date.now(),
    readyAt: Date.now(),
  }),
  isVercelConfigured: vi.fn().mockReturnValue(true),
}));

describe('Vercel Deployment Integration', () => {
  const userId = 'test-user-' + Date.now();
  const projectId = 'test-project-' + Date.now();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deploy a complete project end-to-end', async () => {
    // Import mocked functions
    const { createProject } = await import('@/lib/db/projects');
    const { putObject } = await import('@/lib/storage/s3');

    // 1. Create a project
    const project = await createProject(projectId, userId, {
      name: 'Test React App',
      technology: 'react',
      type: 'learning',
      githubSourceUrl: 'https://github.com/example/test-app',
    });

    expect(project.PK).toBe(`PROJECT#${projectId}`);
    expect(project.SK).toBe(`USER#${userId}`);

    // 2. Create project code as zip
    const zip = new JSZip();
    zip.file('package.json', JSON.stringify({
      name: 'test-app',
      version: '1.0.0',
      scripts: {
        build: 'react-scripts build',
      },
    }));
    zip.file('src/index.tsx', `
      import React from 'react';
      import ReactDOM from 'react-dom';
      
      function App() {
        return <div>Hello World</div>;
      }
      
      ReactDOM.render(<App />, document.getElementById('root'));
    `);
    zip.file('public/index.html', `
      <!DOCTYPE html>
      <html>
        <head><title>Test App</title></head>
        <body><div id="root"></div></body>
      </html>
    `);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // 3. Upload code to S3
    await putObject(project.codeS3Key, zipBuffer);

    // 4. Deploy project
    const deployment = await deployProject({
      projectId,
      userId,
      platform: 'vercel',
    });

    // 5. Verify deployment result
    expect(deployment).toMatchObject({
      deploymentId: expect.stringContaining('dpl_'),
      url: expect.stringContaining('vercel.app'),
      status: 'building',
      platform: 'vercel',
    });
  }, 30000); // 30 second timeout for integration test

  it('should handle deployment of Next.js project', async () => {
    const { createProject } = await import('@/lib/db/projects');
    const { putObject } = await import('@/lib/storage/s3');
    
    const nextProjectId = 'next-project-' + Date.now();

    // Create Next.js project
    const project = await createProject(nextProjectId, userId, {
      name: 'Test Next.js App',
      technology: 'nextjs',
      type: 'learning',
    });

    // Create Next.js project structure
    const zip = new JSZip();
    zip.file('package.json', JSON.stringify({
      name: 'next-app',
      version: '1.0.0',
      scripts: {
        build: 'next build',
      },
      dependencies: {
        next: '^14.0.0',
        react: '^18.0.0',
      },
    }));
    zip.file('app/page.tsx', `
      export default function Home() {
        return <h1>Hello Next.js</h1>;
      }
    `);
    zip.file('next.config.js', 'module.exports = {}');

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    await putObject(project.codeS3Key, zipBuffer);

    // Deploy
    const deployment = await deployProject({
      projectId: nextProjectId,
      userId,
      platform: 'vercel',
    });

    expect(deployment.status).toBe('building');
    expect(deployment.platform).toBe('vercel');
  }, 30000);

  it('should fail gracefully when project does not exist', async () => {
    await expect(
      deployProject({
        projectId: 'non-existent-project',
        userId: 'non-existent-user',
        platform: 'vercel',
      })
    ).rejects.toThrow('Project not found');
  });

  it('should fail gracefully when project code is missing', async () => {
    const { createProject } = await import('@/lib/db/projects');
    
    const emptyProjectId = 'empty-project-' + Date.now();

    // Create project but don't upload code
    await createProject(emptyProjectId, userId, {
      name: 'Empty Project',
      technology: 'react',
      type: 'learning',
    });

    await expect(
      deployProject({
        projectId: emptyProjectId,
        userId,
        platform: 'vercel',
      })
    ).rejects.toThrow('Project code not found in storage');
  });
});
