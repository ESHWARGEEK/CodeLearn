/**
 * Integration tests for Netlify deployment flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createProject } from '@/lib/db/projects';
import { putObject } from '@/lib/storage/s3';
import { deployProject } from '@/lib/deployment/project-deployer';
import JSZip from 'jszip';

// Mock external services
vi.mock('@/lib/deployment/netlify-client', () => ({
  createDeployment: vi.fn().mockResolvedValue({
    id: 'deploy-test-123',
    url: 'https://test-project.netlify.app',
    status: 'building',
    state: 'building',
    createdAt: new Date().toISOString(),
    siteId: 'site-123',
    siteName: 'test-project',
  }),
  getDeploymentStatus: vi.fn().mockResolvedValue({
    id: 'deploy-test-123',
    url: 'https://test-project.netlify.app',
    status: 'ready',
    state: 'ready',
    createdAt: new Date().toISOString(),
    deployedAt: new Date().toISOString(),
    siteId: 'site-123',
    siteName: 'test-project',
  }),
  isNetlifyConfigured: vi.fn().mockReturnValue(true),
}));

describe('Netlify Deployment Integration', () => {
  const userId = 'test-user-' + Date.now();
  const projectId = 'test-project-' + Date.now();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deploy a complete project end-to-end', async () => {
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
      platform: 'netlify',
    });

    // 5. Verify deployment result
    expect(deployment).toMatchObject({
      deploymentId: expect.stringContaining('deploy-'),
      url: expect.stringContaining('netlify.app'),
      status: 'building',
      platform: 'netlify',
    });
  }, 30000); // 30 second timeout for integration test

  it('should handle deployment of Next.js project', async () => {
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
      platform: 'netlify',
    });

    expect(deployment.status).toBe('building');
    expect(deployment.platform).toBe('netlify');
  }, 30000);

  it('should handle deployment of Vue.js project', async () => {
    const vueProjectId = 'vue-project-' + Date.now();

    // Create Vue.js project
    const project = await createProject(vueProjectId, userId, {
      name: 'Test Vue App',
      technology: 'vue',
      type: 'learning',
    });

    // Create Vue.js project structure
    const zip = new JSZip();
    zip.file('package.json', JSON.stringify({
      name: 'vue-app',
      version: '1.0.0',
      scripts: {
        build: 'vite build',
      },
      dependencies: {
        vue: '^3.0.0',
      },
    }));
    zip.file('src/App.vue', `
      <template>
        <div>Hello Vue</div>
      </template>
    `);
    zip.file('index.html', '<!DOCTYPE html><html><body><div id="app"></div></body></html>');

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    await putObject(project.codeS3Key, zipBuffer);

    // Deploy
    const deployment = await deployProject({
      projectId: vueProjectId,
      userId,
      platform: 'netlify',
    });

    expect(deployment.status).toBe('building');
    expect(deployment.platform).toBe('netlify');
  }, 30000);

  it('should handle deployment of static HTML project', async () => {
    const staticProjectId = 'static-project-' + Date.now();

    // Create static project
    const project = await createProject(staticProjectId, userId, {
      name: 'Test Static Site',
      technology: 'html',
      type: 'learning',
    });

    // Create static site structure
    const zip = new JSZip();
    zip.file('index.html', `
      <!DOCTYPE html>
      <html>
        <head><title>Static Site</title></head>
        <body><h1>Hello World</h1></body>
      </html>
    `);
    zip.file('style.css', 'body { font-family: sans-serif; }');
    zip.file('script.js', 'console.log("Hello");');

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    await putObject(project.codeS3Key, zipBuffer);

    // Deploy
    const deployment = await deployProject({
      projectId: staticProjectId,
      userId,
      platform: 'netlify',
    });

    expect(deployment.status).toBe('building');
    expect(deployment.platform).toBe('netlify');
  }, 30000);

  it('should fail gracefully when project does not exist', async () => {
    await expect(
      deployProject({
        projectId: 'non-existent-project',
        userId: 'non-existent-user',
        platform: 'netlify',
      })
    ).rejects.toThrow('Project not found');
  });

  it('should fail gracefully when project code is missing', async () => {
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
        platform: 'netlify',
      })
    ).rejects.toThrow('Project code not found in storage');
  });

  it('should handle site name sanitization', async () => {
    const specialProjectId = 'special-project-' + Date.now();

    // Create project with special characters in name
    const project = await createProject(specialProjectId, userId, {
      name: 'Test App with Spaces & Special!@# Characters',
      technology: 'react',
      type: 'learning',
    });

    const zip = new JSZip();
    zip.file('index.html', '<html><body>Test</body></html>');
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    await putObject(project.codeS3Key, zipBuffer);

    // Deploy
    const deployment = await deployProject({
      projectId: specialProjectId,
      userId,
      platform: 'netlify',
    });

    // Verify deployment succeeds despite special characters
    expect(deployment.status).toBe('building');
    expect(deployment.url).toContain('netlify.app');
  }, 30000);
});
