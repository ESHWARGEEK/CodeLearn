/**
 * Unit tests for project deployment service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deployProject, getDeploymentStatusById } from '@/lib/deployment/project-deployer';
import * as projectsDb from '@/lib/db/projects';
import * as s3 from '@/lib/storage/s3';
import * as vercelClient from '@/lib/deployment/vercel-client';
import * as netlifyClient from '@/lib/deployment/netlify-client';
import JSZip from 'jszip';

vi.mock('@/lib/db/projects');
vi.mock('@/lib/storage/s3');
vi.mock('@/lib/deployment/vercel-client');
vi.mock('@/lib/deployment/netlify-client');

describe('Project Deployer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deployProject', () => {
    it('should deploy a React project to Vercel successfully', async () => {
      // Mock project data
      const mockProject = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'My React App',
        technology: 'react',
        type: 'learning' as const,
        status: 'active' as const,
        progress: 100,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709251200,
      };

      // Mock zip file with React project
      const zip = new JSZip();
      zip.file('package.json', JSON.stringify({ name: 'my-app' }));
      zip.file('src/App.tsx', 'export default function App() {}');
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      // Mock Vercel deployment response
      const mockDeployment = {
        id: 'dpl_123',
        url: 'my-react-app.vercel.app',
        status: 'BUILDING' as const,
        readyState: 'BUILDING' as const,
        createdAt: 1709251200000,
      };

      vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(mockProject);
      vi.mocked(s3.getObject).mockResolvedValue(zipBuffer);
      vi.mocked(vercelClient.createDeployment).mockResolvedValue(mockDeployment);
      vi.mocked(projectsDb.updateProjectDeployment).mockResolvedValue(undefined);

      const result = await deployProject({
        projectId: 'proj-123',
        userId: 'user-456',
        platform: 'vercel',
      });

      expect(result).toEqual({
        deploymentId: 'dpl_123',
        url: 'https://my-react-app.vercel.app',
        status: 'building',
        platform: 'vercel',
      });

      expect(projectsDb.getProjectByUser).toHaveBeenCalledWith('proj-123', 'user-456');
      expect(s3.getObject).toHaveBeenCalledWith('user-456/proj-123/code.zip');
      expect(vercelClient.createDeployment).toHaveBeenCalledWith({
        projectName: 'my-react-app',
        files: expect.objectContaining({
          'package.json': expect.any(String),
          'src/App.tsx': expect.any(String),
        }),
        framework: 'react',
        buildCommand: 'npm run build',
        outputDirectory: 'build',
      });
      expect(projectsDb.updateProjectDeployment).toHaveBeenCalledWith(
        'proj-123',
        'user-456',
        'https://my-react-app.vercel.app'
      );
    });

    it('should deploy a Next.js project with correct configuration', async () => {
      const mockProject = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'My Next.js App',
        technology: 'nextjs',
        type: 'learning' as const,
        status: 'active' as const,
        progress: 100,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709251200,
      };

      const zip = new JSZip();
      zip.file('package.json', '{}');
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      const mockDeployment = {
        id: 'dpl_456',
        url: 'my-nextjs-app.vercel.app',
        status: 'QUEUED' as const,
        readyState: 'QUEUED' as const,
        createdAt: 1709251200000,
      };

      vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(mockProject);
      vi.mocked(s3.getObject).mockResolvedValue(zipBuffer);
      vi.mocked(vercelClient.createDeployment).mockResolvedValue(mockDeployment);
      vi.mocked(projectsDb.updateProjectDeployment).mockResolvedValue(undefined);

      await deployProject({
        projectId: 'proj-123',
        userId: 'user-456',
        platform: 'vercel',
      });

      expect(vercelClient.createDeployment).toHaveBeenCalledWith({
        projectName: 'my-next-js-app',
        files: expect.any(Object),
        framework: 'nextjs',
        buildCommand: 'npm run build',
        outputDirectory: '.next',
      });
    });

    it('should throw error when project not found', async () => {
      vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(null);

      await expect(
        deployProject({
          projectId: 'proj-invalid',
          userId: 'user-456',
          platform: 'vercel',
        })
      ).rejects.toThrow('Project not found');
    });

    it('should throw error when project code not found in S3', async () => {
      const mockProject = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'My App',
        technology: 'react',
        type: 'learning' as const,
        status: 'active' as const,
        progress: 100,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709251200,
      };

      vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(mockProject);
      vi.mocked(s3.getObject).mockResolvedValue(null);

      await expect(
        deployProject({
          projectId: 'proj-123',
          userId: 'user-456',
          platform: 'vercel',
        })
      ).rejects.toThrow('Project code not found in storage');
    });

    it('should throw error for unsupported platform', async () => {
      const mockProject = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'My App',
        technology: 'react',
        type: 'learning' as const,
        status: 'active' as const,
        progress: 100,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709251200,
      };

      const zip = new JSZip();
      zip.file('index.html', '<html></html>');
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(mockProject);
      vi.mocked(s3.getObject).mockResolvedValue(zipBuffer);

      await expect(
        deployProject({
          projectId: 'proj-123',
          userId: 'user-456',
          platform: 'unsupported' as any,
        })
      ).rejects.toThrow('Platform unsupported not supported');
    });

    it('should deploy a project to Netlify successfully', async () => {
      const mockProject = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'My React App',
        technology: 'react',
        type: 'learning' as const,
        status: 'active' as const,
        progress: 100,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709251200,
      };

      const zip = new JSZip();
      zip.file('package.json', JSON.stringify({ name: 'my-app' }));
      zip.file('src/App.tsx', 'export default function App() {}');
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      const mockDeployment = {
        id: 'deploy-123',
        url: 'https://my-react-app.netlify.app',
        status: 'building' as const,
        state: 'building' as const,
        createdAt: '2024-01-01T00:00:00Z',
        siteId: 'site-456',
        siteName: 'my-react-app',
      };

      vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(mockProject);
      vi.mocked(s3.getObject).mockResolvedValue(zipBuffer);
      vi.mocked(netlifyClient.createDeployment).mockResolvedValue(mockDeployment);
      vi.mocked(projectsDb.updateProjectDeployment).mockResolvedValue(undefined);

      const result = await deployProject({
        projectId: 'proj-123',
        userId: 'user-456',
        platform: 'netlify',
      });

      expect(result).toEqual({
        deploymentId: 'deploy-123',
        url: 'https://my-react-app.netlify.app',
        status: 'building',
        platform: 'netlify',
      });

      expect(netlifyClient.createDeployment).toHaveBeenCalledWith({
        siteName: 'my-react-app',
        files: expect.objectContaining({
          'package.json': expect.any(String),
          'src/App.tsx': expect.any(String),
        }),
        buildCommand: 'npm run build',
        publishDirectory: 'build',
      });
    });

    it('should sanitize project name for deployment', async () => {
      const mockProject = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'My Cool Project!!!',
        technology: 'react',
        type: 'learning' as const,
        status: 'active' as const,
        progress: 100,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709251200,
      };

      const zip = new JSZip();
      zip.file('index.html', '<html></html>');
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      const mockDeployment = {
        id: 'dpl_789',
        url: 'my-cool-project.vercel.app',
        status: 'QUEUED' as const,
        readyState: 'QUEUED' as const,
        createdAt: 1709251200000,
      };

      vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(mockProject);
      vi.mocked(s3.getObject).mockResolvedValue(zipBuffer);
      vi.mocked(vercelClient.createDeployment).mockResolvedValue(mockDeployment);
      vi.mocked(projectsDb.updateProjectDeployment).mockResolvedValue(undefined);

      await deployProject({
        projectId: 'proj-123',
        userId: 'user-456',
        platform: 'vercel',
      });

      expect(vercelClient.createDeployment).toHaveBeenCalledWith(
        expect.objectContaining({
          projectName: 'my-cool-project',
        })
      );
    });
  });

  describe('getDeploymentStatusById', () => {
    it('should get Vercel deployment status', async () => {
      const mockDeployment = {
        id: 'dpl_123',
        url: 'my-app.vercel.app',
        status: 'READY' as const,
        readyState: 'READY' as const,
        createdAt: 1709251200000,
        readyAt: 1709251300000,
      };

      vi.mocked(vercelClient.getDeploymentStatus).mockResolvedValue(mockDeployment);

      const result = await getDeploymentStatusById('dpl_123', 'vercel');

      expect(result).toEqual({
        deploymentId: 'dpl_123',
        url: 'https://my-app.vercel.app',
        status: 'ready',
        platform: 'vercel',
      });
    });

    it('should get Netlify deployment status', async () => {
      const mockDeployment = {
        id: 'deploy-123',
        url: 'https://my-app.netlify.app',
        status: 'ready' as const,
        state: 'ready' as const,
        createdAt: '2024-01-01T00:00:00Z',
        deployedAt: '2024-01-01T00:05:00Z',
        siteId: 'site-456',
        siteName: 'my-app',
      };

      vi.mocked(netlifyClient.getDeploymentStatus).mockResolvedValue(mockDeployment);

      const result = await getDeploymentStatusById('deploy-123', 'netlify');

      expect(result).toEqual({
        deploymentId: 'deploy-123',
        url: 'https://my-app.netlify.app',
        status: 'ready',
        platform: 'netlify',
      });
    });

    it('should throw error for unsupported platform', async () => {
      await expect(
        getDeploymentStatusById('dpl_123', 'unsupported' as any)
      ).rejects.toThrow('Platform unsupported not supported');
    });
  });
});
