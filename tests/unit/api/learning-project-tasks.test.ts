import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/learning/project/[projectId]/tasks/route';
import { NextRequest } from 'next/server';
import * as projectsDb from '@/lib/db/projects';
import * as learningPathsDb from '@/lib/db/learning-paths';
import type { Project } from '@/lib/db/projects';
import type { LearningPath } from '@/lib/db/learning-paths';

// Mock the database modules
vi.mock('@/lib/db/projects');
vi.mock('@/lib/db/learning-paths');

describe('GET /api/learning/project/{projectId}/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return tasks for a learning project', async () => {
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
      githubSourceUrl: 'https://github.com/example/todo',
      createdAt: 1709251200,
      updatedAt: 1709337600,
    };

    const mockLearningPath: LearningPath = {
      PK: 'TECH#react',
      SK: 'DIFF#beginner',
      projectId: 'lp-789',
      name: 'React Todo App',
      description: 'Build a todo app with React',
      githubUrl: 'https://github.com/example/todo',
      estimatedHours: 8,
      tasks: [
        {
          taskId: 'task-1',
          title: 'Set up project structure',
          description: 'Initialize the project',
          order: 1,
          estimatedMinutes: 30,
          hints: ['Use create-react-app'],
        },
        {
          taskId: 'task-2',
          title: 'Create Todo component',
          description: 'Build the main component',
          order: 2,
          estimatedMinutes: 45,
          hints: ['Use useState hook'],
        },
      ],
      generatedAt: 1709251200,
      expiresAt: 1709337600,
    };

    vi.mocked(projectsDb.getProject).mockResolvedValue(mockProject);
    vi.mocked(learningPathsDb.getLearningPath).mockResolvedValue(mockLearningPath);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/tasks');
    const response = await GET(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        tasks: [
          {
            id: 'task-1',
            title: 'Set up project structure',
            description: 'Initialize the project',
            order: 1,
            estimatedMinutes: 30,
            hints: ['Use create-react-app'],
            completed: false,
          },
          {
            id: 'task-2',
            title: 'Create Todo component',
            description: 'Build the main component',
            order: 2,
            estimatedMinutes: 45,
            hints: ['Use useState hook'],
            completed: false,
          },
        ],
      },
    });

    expect(projectsDb.getProject).toHaveBeenCalledWith('proj-123');
    expect(learningPathsDb.getLearningPath).toHaveBeenCalledWith('react', 'beginner');
  });

  it('should return 404 if project not found', async () => {
    vi.mocked(projectsDb.getProject).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-999/tasks');
    const response = await GET(request, { params: { projectId: 'proj-999' } });
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

  it('should return empty tasks for custom projects', async () => {
    const mockProject: Project = {
      PK: 'PROJECT#proj-123',
      SK: 'USER#user-456',
      name: 'My Custom App',
      technology: 'nextjs',
      type: 'custom',
      status: 'active',
      progress: 0,
      codeS3Key: 'user-456/proj-123/code.zip',
      createdAt: 1709251200,
      updatedAt: 1709337600,
    };

    vi.mocked(projectsDb.getProject).mockResolvedValue(mockProject);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/tasks');
    const response = await GET(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        tasks: [],
      },
    });
  });

  it('should return 404 if learning path key is missing', async () => {
    const mockProject: Project = {
      PK: 'PROJECT#proj-123',
      SK: 'USER#user-456',
      name: 'React Todo App',
      technology: 'react',
      type: 'learning',
      status: 'active',
      progress: 50,
      codeS3Key: 'user-456/proj-123/code.zip',
      // learningPathKey is missing
      createdAt: 1709251200,
      updatedAt: 1709337600,
    };

    vi.mocked(projectsDb.getProject).mockResolvedValue(mockProject);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/tasks');
    const response = await GET(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'LEARNING_PATH_NOT_FOUND',
        message: 'Learning path key not found for this project',
      },
    });
  });

  it('should return 400 if learning path key format is invalid', async () => {
    const mockProject: Project = {
      PK: 'PROJECT#proj-123',
      SK: 'USER#user-456',
      name: 'React Todo App',
      technology: 'react',
      type: 'learning',
      status: 'active',
      progress: 50,
      codeS3Key: 'user-456/proj-123/code.zip',
      learningPathKey: 'INVALID_FORMAT',
      createdAt: 1709251200,
      updatedAt: 1709337600,
    };

    vi.mocked(projectsDb.getProject).mockResolvedValue(mockProject);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/tasks');
    const response = await GET(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'INVALID_LEARNING_PATH_KEY',
        message: 'Invalid learning path key format',
      },
    });
  });

  it('should return 404 if learning path not found or expired', async () => {
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

    vi.mocked(projectsDb.getProject).mockResolvedValue(mockProject);
    vi.mocked(learningPathsDb.getLearningPath).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/tasks');
    const response = await GET(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'LEARNING_PATH_NOT_FOUND',
        message: 'Learning path not found or expired',
      },
    });
  });

  it('should handle different difficulty levels', async () => {
    const mockProject: Project = {
      PK: 'PROJECT#proj-456',
      SK: 'USER#user-789',
      name: 'Advanced Vue App',
      technology: 'vue',
      type: 'learning',
      status: 'active',
      progress: 25,
      codeS3Key: 'user-789/proj-456/code.zip',
      learningPathKey: 'TECH#vue#DIFF#advanced',
      createdAt: 1709251200,
      updatedAt: 1709337600,
    };

    const mockLearningPath: LearningPath = {
      PK: 'TECH#vue',
      SK: 'DIFF#advanced',
      projectId: 'lp-999',
      name: 'Advanced Vue App',
      description: 'Build an advanced Vue application',
      githubUrl: 'https://github.com/example/vue-advanced',
      estimatedHours: 20,
      tasks: [
        {
          taskId: 'task-1',
          title: 'Set up Vuex store',
          description: 'Configure state management',
          order: 1,
          estimatedMinutes: 60,
          hints: ['Use modules pattern'],
        },
      ],
      generatedAt: 1709251200,
      expiresAt: 1709337600,
    };

    vi.mocked(projectsDb.getProject).mockResolvedValue(mockProject);
    vi.mocked(learningPathsDb.getLearningPath).mockResolvedValue(mockLearningPath);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-456/tasks');
    const response = await GET(request, { params: { projectId: 'proj-456' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(learningPathsDb.getLearningPath).toHaveBeenCalledWith('vue', 'advanced');
  });

  it('should return 500 on unexpected errors', async () => {
    vi.mocked(projectsDb.getProject).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/tasks');
    const response = await GET(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      error: {
        code: 'FETCH_TASKS_FAILED',
        message: 'Failed to fetch project tasks',
      },
    });
  });
});
