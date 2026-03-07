import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createProject,
  getProject,
  getProjectByUser,
  getProjectsByUser,
  getDeployedProjectsByUser,
  updateProjectProgress,
  updateProjectCode,
  updateProjectDeployment,
  type Project,
} from '@/lib/db/projects';
import * as dynamodb from '@/lib/db/dynamodb';

// Mock the dynamodb module
vi.mock('@/lib/db/dynamodb', () => ({
  TABLES: {
    PROJECTS: 'codelearn-projects-test',
  },
  putItem: vi.fn(),
  getItem: vi.fn(),
  queryItems: vi.fn(),
}));

describe('Projects Database Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a new learning project', async () => {
      const mockPutItem = vi.mocked(dynamodb.putItem);
      mockPutItem.mockResolvedValue();

      const result = await createProject('proj-123', 'user-456', {
        name: 'React Todo App',
        technology: 'react',
        type: 'learning',
        githubSourceUrl: 'https://github.com/example/todo',
        learningPathKey: 'TECH#react#DIFF#beginner',
      });

      expect(result).toMatchObject({
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'React Todo App',
        technology: 'react',
        type: 'learning',
        status: 'active',
        progress: 0,
        codeS3Key: 'user-456/proj-123/code.zip',
        githubSourceUrl: 'https://github.com/example/todo',
        learningPathKey: 'TECH#react#DIFF#beginner',
      });

      expect(mockPutItem).toHaveBeenCalledWith(
        'codelearn-projects-test',
        expect.objectContaining({
          PK: 'PROJECT#proj-123',
          SK: 'USER#user-456',
        })
      );
    });

    it('should create a custom project without learning path', async () => {
      const mockPutItem = vi.mocked(dynamodb.putItem);
      mockPutItem.mockResolvedValue();

      const result = await createProject('proj-789', 'user-456', {
        name: 'My Custom App',
        technology: 'nextjs',
        type: 'custom',
      });

      expect(result).toMatchObject({
        PK: 'PROJECT#proj-789',
        SK: 'USER#user-456',
        name: 'My Custom App',
        technology: 'nextjs',
        type: 'custom',
        status: 'active',
        progress: 0,
      });

      expect(result.learningPathKey).toBeUndefined();
    });
  });

  describe('getProject', () => {
    it('should fetch a project by projectId', async () => {
      const mockProject: Project = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'React Todo App',
        technology: 'react',
        type: 'learning',
        status: 'active',
        progress: 50,
        codeS3Key: 'user-456/proj-123/code.zip',
        learningPathKey: 'TECH#react#DIFF#beginner',
        createdAt: 1709251200,
        updatedAt: 1709337600,
      };

      const mockQueryItems = vi.mocked(dynamodb.queryItems);
      mockQueryItems.mockResolvedValue([mockProject]);

      const result = await getProject('proj-123');

      expect(result).toEqual(mockProject);
      expect(mockQueryItems).toHaveBeenCalledWith(
        'codelearn-projects-test',
        'PK = :pk',
        { ':pk': 'PROJECT#proj-123' }
      );
    });

    it('should return null if project not found', async () => {
      const mockQueryItems = vi.mocked(dynamodb.queryItems);
      mockQueryItems.mockResolvedValue([]);

      const result = await getProject('proj-999');

      expect(result).toBeNull();
    });
  });

  describe('getProjectByUser', () => {
    it('should fetch a project by projectId and userId', async () => {
      const mockProject: Project = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'React Todo App',
        technology: 'react',
        type: 'learning',
        status: 'active',
        progress: 50,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709337600,
      };

      const mockGetItem = vi.mocked(dynamodb.getItem);
      mockGetItem.mockResolvedValue(mockProject);

      const result = await getProjectByUser('proj-123', 'user-456');

      expect(result).toEqual(mockProject);
      expect(mockGetItem).toHaveBeenCalledWith('codelearn-projects-test', {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
      });
    });

    it('should return null if project not found', async () => {
      const mockGetItem = vi.mocked(dynamodb.getItem);
      mockGetItem.mockResolvedValue(null);

      const result = await getProjectByUser('proj-999', 'user-456');

      expect(result).toBeNull();
    });
  });

  describe('getProjectsByUser', () => {
    it('should fetch all projects for a user', async () => {
      const mockProjects: Project[] = [
        {
          PK: 'PROJECT#proj-123',
          SK: 'USER#user-456',
          name: 'React Todo App',
          technology: 'react',
          type: 'learning',
          status: 'active',
          progress: 50,
          codeS3Key: 'user-456/proj-123/code.zip',
          createdAt: 1709251200,
          updatedAt: 1709337600,
        },
        {
          PK: 'PROJECT#proj-789',
          SK: 'USER#user-456',
          name: 'Vue Dashboard',
          technology: 'vue',
          type: 'learning',
          status: 'completed',
          progress: 100,
          codeS3Key: 'user-456/proj-789/code.zip',
          createdAt: 1709251200,
          updatedAt: 1709337600,
          completedAt: 1709337600,
        },
      ];

      const mockQueryItems = vi.mocked(dynamodb.queryItems);
      mockQueryItems.mockResolvedValue(mockProjects);

      const result = await getProjectsByUser('user-456');

      expect(result).toEqual(mockProjects);
      expect(mockQueryItems).toHaveBeenCalledWith(
        'codelearn-projects-test',
        'SK = :sk',
        { ':sk': 'USER#user-456' },
        'userId-status-index'
      );
    });

    it('should return empty array if user has no projects', async () => {
      const mockQueryItems = vi.mocked(dynamodb.queryItems);
      mockQueryItems.mockResolvedValue([]);

      const result = await getProjectsByUser('user-999');

      expect(result).toEqual([]);
    });
  });

  describe('updateProjectProgress', () => {
    it('should update project progress', async () => {
      const mockProject: Project = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'React Todo App',
        technology: 'react',
        type: 'learning',
        status: 'active',
        progress: 50,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709337600,
      };

      const mockGetItem = vi.mocked(dynamodb.getItem);
      mockGetItem.mockResolvedValue(mockProject);

      const mockPutItem = vi.mocked(dynamodb.putItem);
      mockPutItem.mockResolvedValue();

      await updateProjectProgress('proj-123', 'user-456', 75);

      expect(mockPutItem).toHaveBeenCalledWith(
        'codelearn-projects-test',
        expect.objectContaining({
          progress: 75,
          status: 'active',
        })
      );
    });

    it('should mark project as completed when progress reaches 100', async () => {
      const mockProject: Project = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'React Todo App',
        technology: 'react',
        type: 'learning',
        status: 'active',
        progress: 90,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709337600,
      };

      const mockGetItem = vi.mocked(dynamodb.getItem);
      mockGetItem.mockResolvedValue(mockProject);

      const mockPutItem = vi.mocked(dynamodb.putItem);
      mockPutItem.mockResolvedValue();

      await updateProjectProgress('proj-123', 'user-456', 100);

      expect(mockPutItem).toHaveBeenCalledWith(
        'codelearn-projects-test',
        expect.objectContaining({
          progress: 100,
          status: 'completed',
          completedAt: expect.any(Number),
        })
      );
    });

    it('should throw error if project not found', async () => {
      const mockGetItem = vi.mocked(dynamodb.getItem);
      mockGetItem.mockResolvedValue(null);

      await expect(
        updateProjectProgress('proj-999', 'user-456', 75)
      ).rejects.toThrow('Project not found');
    });
  });

  describe('updateProjectCode', () => {
    it('should update project code S3 key', async () => {
      const mockProject: Project = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'React Todo App',
        technology: 'react',
        type: 'learning',
        status: 'active',
        progress: 50,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709337600,
      };

      const mockGetItem = vi.mocked(dynamodb.getItem);
      mockGetItem.mockResolvedValue(mockProject);

      const mockPutItem = vi.mocked(dynamodb.putItem);
      mockPutItem.mockResolvedValue();

      await updateProjectCode('proj-123', 'user-456', 'user-456/proj-123/code-v2.zip');

      expect(mockPutItem).toHaveBeenCalledWith(
        'codelearn-projects-test',
        expect.objectContaining({
          codeS3Key: 'user-456/proj-123/code-v2.zip',
        })
      );
    });
  });

  describe('updateProjectDeployment', () => {
    it('should update project deployment URL with platform and timestamp', async () => {
      const mockProject: Project = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'React Todo App',
        technology: 'react',
        type: 'learning',
        status: 'active',
        progress: 100,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709337600,
      };

      const mockGetItem = vi.mocked(dynamodb.getItem);
      mockGetItem.mockResolvedValue(mockProject);

      const mockPutItem = vi.mocked(dynamodb.putItem);
      mockPutItem.mockResolvedValue();

      await updateProjectDeployment(
        'proj-123',
        'user-456',
        'https://my-app.vercel.app',
        'vercel'
      );

      expect(mockPutItem).toHaveBeenCalledWith(
        'codelearn-projects-test',
        expect.objectContaining({
          deploymentUrl: 'https://my-app.vercel.app',
          deploymentPlatform: 'vercel',
          deployedAt: expect.any(Number),
        })
      );
    });

    it('should update deployment URL without platform', async () => {
      const mockProject: Project = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'React Todo App',
        technology: 'react',
        type: 'learning',
        status: 'active',
        progress: 100,
        codeS3Key: 'user-456/proj-123/code.zip',
        createdAt: 1709251200,
        updatedAt: 1709337600,
      };

      const mockGetItem = vi.mocked(dynamodb.getItem);
      mockGetItem.mockResolvedValue(mockProject);

      const mockPutItem = vi.mocked(dynamodb.putItem);
      mockPutItem.mockResolvedValue();

      await updateProjectDeployment(
        'proj-123',
        'user-456',
        'https://my-app.netlify.app'
      );

      expect(mockPutItem).toHaveBeenCalledWith(
        'codelearn-projects-test',
        expect.objectContaining({
          deploymentUrl: 'https://my-app.netlify.app',
          deploymentPlatform: undefined,
          deployedAt: expect.any(Number),
        })
      );
    });

    it('should support redeployment by updating existing deployment', async () => {
      const mockProject: Project = {
        PK: 'PROJECT#proj-123',
        SK: 'USER#user-456',
        name: 'React Todo App',
        technology: 'react',
        type: 'learning',
        status: 'completed',
        progress: 100,
        codeS3Key: 'user-456/proj-123/code.zip',
        deploymentUrl: 'https://old-url.vercel.app',
        deploymentPlatform: 'vercel',
        deployedAt: 1709251200,
        createdAt: 1709251200,
        updatedAt: 1709337600,
      };

      const mockGetItem = vi.mocked(dynamodb.getItem);
      mockGetItem.mockResolvedValue(mockProject);

      const mockPutItem = vi.mocked(dynamodb.putItem);
      mockPutItem.mockResolvedValue();

      await updateProjectDeployment(
        'proj-123',
        'user-456',
        'https://new-url.vercel.app',
        'vercel'
      );

      expect(mockPutItem).toHaveBeenCalledWith(
        'codelearn-projects-test',
        expect.objectContaining({
          deploymentUrl: 'https://new-url.vercel.app',
          deploymentPlatform: 'vercel',
          deployedAt: expect.any(Number),
        })
      );
    });
  });
});

  describe('getDeployedProjectsByUser', () => {
    it('should return only projects with deployment URLs', async () => {
      const mockProjects: Project[] = [
        {
          PK: 'PROJECT#proj-123',
          SK: 'USER#user-456',
          name: 'Deployed App',
          technology: 'react',
          type: 'learning',
          status: 'completed',
          progress: 100,
          codeS3Key: 'user-456/proj-123/code.zip',
          deploymentUrl: 'https://deployed.vercel.app',
          deploymentPlatform: 'vercel',
          deployedAt: 1709337600,
          createdAt: 1709251200,
          updatedAt: 1709337600,
        },
        {
          PK: 'PROJECT#proj-456',
          SK: 'USER#user-456',
          name: 'Not Deployed',
          technology: 'vue',
          type: 'learning',
          status: 'active',
          progress: 50,
          codeS3Key: 'user-456/proj-456/code.zip',
          createdAt: 1709251200,
          updatedAt: 1709337600,
        },
        {
          PK: 'PROJECT#proj-789',
          SK: 'USER#user-456',
          name: 'Another Deployed',
          technology: 'nextjs',
          type: 'custom',
          status: 'completed',
          progress: 100,
          codeS3Key: 'user-456/proj-789/code.zip',
          deploymentUrl: 'https://another.netlify.app',
          deploymentPlatform: 'netlify',
          deployedAt: 1709424000,
          createdAt: 1709251200,
          updatedAt: 1709424000,
        },
      ];

      const mockQueryItems = vi.mocked(dynamodb.queryItems);
      mockQueryItems.mockResolvedValue(mockProjects);

      const result = await getDeployedProjectsByUser('user-456');

      expect(result).toHaveLength(2);
      expect(result[0].deploymentUrl).toBe('https://deployed.vercel.app');
      expect(result[1].deploymentUrl).toBe('https://another.netlify.app');
    });

    it('should return empty array when no projects are deployed', async () => {
      const mockProjects: Project[] = [
        {
          PK: 'PROJECT#proj-123',
          SK: 'USER#user-456',
          name: 'Not Deployed',
          technology: 'react',
          type: 'learning',
          status: 'active',
          progress: 50,
          codeS3Key: 'user-456/proj-123/code.zip',
          createdAt: 1709251200,
          updatedAt: 1709337600,
        },
      ];

      const mockQueryItems = vi.mocked(dynamodb.queryItems);
      mockQueryItems.mockResolvedValue(mockProjects);

      const result = await getDeployedProjectsByUser('user-456');

      expect(result).toHaveLength(0);
    });

    it('should return empty array when user has no projects', async () => {
      const mockQueryItems = vi.mocked(dynamodb.queryItems);
      mockQueryItems.mockResolvedValue([]);

      const result = await getDeployedProjectsByUser('user-999');

      expect(result).toHaveLength(0);
    });
  });
