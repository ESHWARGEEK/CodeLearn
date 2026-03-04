import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveLearningPath,
  getLearningPath,
  getLearningPathsByTechnology,
  learningPathExists,
  getAvailableTechnologies,
  type Task,
  type LearningPath,
  type Difficulty,
} from '@/lib/db/learning-paths';
import * as dynamodbModule from '@/lib/db/dynamodb';

// Mock the dynamodb module
vi.mock('@/lib/db/dynamodb', () => ({
  dynamoDb: {},
  TABLES: {
    LEARNING_PATHS: 'test-learning-paths-table',
  },
  putItem: vi.fn(),
  getItem: vi.fn(),
  queryItems: vi.fn(),
}));

describe('Learning Paths DynamoDB Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now() to return a consistent timestamp
    vi.spyOn(Date, 'now').mockReturnValue(1709251200000); // 2024-03-01 00:00:00
  });

  describe('saveLearningPath', () => {
    it('should save a learning path with correct structure', async () => {
      const technology = 'react';
      const difficulty: Difficulty = 'intermediate';
      const data = {
        projectId: 'proj-123',
        name: 'E-commerce Dashboard',
        description: 'Build a modern dashboard',
        githubUrl: 'https://github.com/example/dashboard',
        estimatedHours: 12,
        tasks: [
          {
            taskId: 'task-1',
            title: 'Setup project',
            description: 'Initialize Next.js',
            order: 1,
            estimatedMinutes: 30,
            hints: ['Use create-next-app'],
          },
        ] as Task[],
      };

      const result = await saveLearningPath(technology, difficulty, data);

      expect(dynamodbModule.putItem).toHaveBeenCalledWith(
        'test-learning-paths-table',
        expect.objectContaining({
          PK: 'TECH#react',
          SK: 'DIFF#intermediate',
          projectId: 'proj-123',
          name: 'E-commerce Dashboard',
          description: 'Build a modern dashboard',
          githubUrl: 'https://github.com/example/dashboard',
          estimatedHours: 12,
          tasks: data.tasks,
          generatedAt: 1709251200,
          expiresAt: 1709337600, // 24 hours later
        })
      );

      expect(result.PK).toBe('TECH#react');
      expect(result.SK).toBe('DIFF#intermediate');
      expect(result.expiresAt).toBe(1709337600);
    });

    it('should set 24-hour TTL correctly', async () => {
      const data = {
        projectId: 'proj-123',
        name: 'Test Project',
        description: 'Test',
        githubUrl: 'https://github.com/test',
        estimatedHours: 5,
        tasks: [],
      };

      const result = await saveLearningPath('vue', 'beginner', data);

      const expectedExpiry = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
      expect(result.expiresAt).toBe(expectedExpiry);
    });

    it('should handle all difficulty levels', async () => {
      const data = {
        projectId: 'proj-123',
        name: 'Test',
        description: 'Test',
        githubUrl: 'https://github.com/test',
        estimatedHours: 5,
        tasks: [],
      };

      const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

      for (const difficulty of difficulties) {
        const result = await saveLearningPath('nextjs', difficulty, data);
        expect(result.SK).toBe(`DIFF#${difficulty}`);
      }
    });
  });

  describe('getLearningPath', () => {
    it('should retrieve an existing learning path', async () => {
      const mockPath: LearningPath = {
        PK: 'TECH#react',
        SK: 'DIFF#intermediate',
        projectId: 'proj-123',
        name: 'Dashboard',
        description: 'Build dashboard',
        githubUrl: 'https://github.com/example',
        estimatedHours: 10,
        tasks: [],
        generatedAt: 1709251200,
        expiresAt: 1709337600,
      };

      vi.mocked(dynamodbModule.getItem).mockResolvedValue(mockPath);

      const result = await getLearningPath('react', 'intermediate');

      expect(dynamodbModule.getItem).toHaveBeenCalledWith(
        'test-learning-paths-table',
        {
          PK: 'TECH#react',
          SK: 'DIFF#intermediate',
        }
      );
      expect(result).toEqual(mockPath);
    });

    it('should return null if learning path does not exist', async () => {
      vi.mocked(dynamodbModule.getItem).mockResolvedValue(null);

      const result = await getLearningPath('python', 'beginner');

      expect(result).toBeNull();
    });

    it('should return null if learning path is expired', async () => {
      const expiredPath = {
        PK: 'TECH#react',
        SK: 'DIFF#beginner',
        projectId: 'proj-123',
        name: 'Old Project',
        description: 'Expired',
        githubUrl: 'https://github.com/old',
        estimatedHours: 5,
        tasks: [],
        generatedAt: 1709164800, // 24 hours ago
        expiresAt: 1709251199, // Expired 1 second ago
      };

      vi.mocked(dynamodbModule.getItem).mockResolvedValue(expiredPath);

      const result = await getLearningPath('react', 'beginner');

      expect(result).toBeNull();
    });

    it('should return path if not yet expired', async () => {
      const validPath = {
        PK: 'TECH#vue',
        SK: 'DIFF#advanced',
        projectId: 'proj-456',
        name: 'Valid Project',
        description: 'Still valid',
        githubUrl: 'https://github.com/valid',
        estimatedHours: 8,
        tasks: [],
        generatedAt: 1709251200,
        expiresAt: 1709337601, // Expires 1 second from now
      };

      vi.mocked(dynamodbModule.getItem).mockResolvedValue(validPath);

      const result = await getLearningPath('vue', 'advanced');

      expect(result).toEqual(validPath);
    });
  });

  describe('getLearningPathsByTechnology', () => {
    it('should retrieve all paths for a technology', async () => {
      const mockPaths = [
        {
          PK: 'TECH#react',
          SK: 'DIFF#beginner',
          projectId: 'proj-1',
          name: 'Beginner Project',
          description: 'Easy',
          githubUrl: 'https://github.com/beginner',
          estimatedHours: 5,
          tasks: [],
          generatedAt: 1709251200,
          expiresAt: 1709337600,
        },
        {
          PK: 'TECH#react',
          SK: 'DIFF#intermediate',
          projectId: 'proj-2',
          name: 'Intermediate Project',
          description: 'Medium',
          githubUrl: 'https://github.com/intermediate',
          estimatedHours: 10,
          tasks: [],
          generatedAt: 1709251200,
          expiresAt: 1709337600,
        },
        {
          PK: 'TECH#react',
          SK: 'DIFF#advanced',
          projectId: 'proj-3',
          name: 'Advanced Project',
          description: 'Hard',
          githubUrl: 'https://github.com/advanced',
          estimatedHours: 20,
          tasks: [],
          generatedAt: 1709251200,
          expiresAt: 1709337600,
        },
      ];

      vi.mocked(dynamodbModule.queryItems).mockResolvedValue(mockPaths);

      const result = await getLearningPathsByTechnology('react');

      expect(dynamodbModule.queryItems).toHaveBeenCalledWith(
        'test-learning-paths-table',
        'PK = :pk',
        { ':pk': 'TECH#react' }
      );
      expect(result).toHaveLength(3);
      expect(result).toEqual(mockPaths);
    });

    it('should filter out expired paths', async () => {
      const mockPaths = [
        {
          PK: 'TECH#vue',
          SK: 'DIFF#beginner',
          projectId: 'proj-1',
          name: 'Valid',
          description: 'Valid',
          githubUrl: 'https://github.com/valid',
          estimatedHours: 5,
          tasks: [],
          generatedAt: 1709251200,
          expiresAt: 1709337600, // Valid
        },
        {
          PK: 'TECH#vue',
          SK: 'DIFF#intermediate',
          projectId: 'proj-2',
          name: 'Expired',
          description: 'Expired',
          githubUrl: 'https://github.com/expired',
          estimatedHours: 10,
          tasks: [],
          generatedAt: 1709164800,
          expiresAt: 1709251199, // Expired
        },
      ];

      vi.mocked(dynamodbModule.queryItems).mockResolvedValue(mockPaths);

      const result = await getLearningPathsByTechnology('vue');

      expect(result).toHaveLength(1);
      expect(result[0].SK).toBe('DIFF#beginner');
    });

    it('should return empty array if no paths exist', async () => {
      vi.mocked(dynamodbModule.queryItems).mockResolvedValue([]);

      const result = await getLearningPathsByTechnology('python');

      expect(result).toEqual([]);
    });
  });

  describe('learningPathExists', () => {
    it('should return true if path exists and is valid', async () => {
      const mockPath = {
        PK: 'TECH#nextjs',
        SK: 'DIFF#beginner',
        projectId: 'proj-123',
        name: 'Test',
        description: 'Test',
        githubUrl: 'https://github.com/test',
        estimatedHours: 5,
        tasks: [],
        generatedAt: 1709251200,
        expiresAt: 1709337600,
      };

      vi.mocked(dynamodbModule.getItem).mockResolvedValue(mockPath);

      const result = await learningPathExists('nextjs', 'beginner');

      expect(result).toBe(true);
    });

    it('should return false if path does not exist', async () => {
      vi.mocked(dynamodbModule.getItem).mockResolvedValue(null);

      const result = await learningPathExists('go', 'advanced');

      expect(result).toBe(false);
    });

    it('should return false if path is expired', async () => {
      const expiredPath = {
        PK: 'TECH#angular',
        SK: 'DIFF#intermediate',
        projectId: 'proj-123',
        name: 'Expired',
        description: 'Expired',
        githubUrl: 'https://github.com/expired',
        estimatedHours: 5,
        tasks: [],
        generatedAt: 1709164800,
        expiresAt: 1709251199, // Expired
      };

      vi.mocked(dynamodbModule.getItem).mockResolvedValue(expiredPath);

      const result = await learningPathExists('angular', 'intermediate');

      expect(result).toBe(false);
    });
  });

  describe('getAvailableTechnologies', () => {
    it('should return unique list of technologies', async () => {
      const mockPaths = [
        { PK: 'TECH#react', SK: 'DIFF#beginner' },
        { PK: 'TECH#react', SK: 'DIFF#intermediate' },
        { PK: 'TECH#vue', SK: 'DIFF#beginner' },
        { PK: 'TECH#nextjs', SK: 'DIFF#advanced' },
      ];

      vi.mocked(dynamodbModule.queryItems).mockResolvedValue(mockPaths);

      const result = await getAvailableTechnologies();

      expect(result).toContain('react');
      expect(result).toContain('vue');
      expect(result).toContain('nextjs');
      expect(result).toHaveLength(3);
    });

    it('should handle empty results', async () => {
      vi.mocked(dynamodbModule.queryItems).mockResolvedValue([]);

      const result = await getAvailableTechnologies();

      expect(result).toEqual([]);
    });

    it('should ignore items without TECH# prefix', async () => {
      const mockPaths = [
        { PK: 'TECH#react', SK: 'DIFF#beginner' },
        { PK: 'USER#123', SK: 'PROFILE' }, // Should be ignored
        { PK: 'TECH#vue', SK: 'DIFF#intermediate' },
      ];

      vi.mocked(dynamodbModule.queryItems).mockResolvedValue(mockPaths);

      const result = await getAvailableTechnologies();

      expect(result).toContain('react');
      expect(result).toContain('vue');
      expect(result).toHaveLength(2);
    });
  });
});
