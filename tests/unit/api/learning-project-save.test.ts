import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/learning/project/[projectId]/save/route';
import { NextRequest } from 'next/server';
import * as projectsDb from '@/lib/db/projects';

// Mock the database functions
vi.mock('@/lib/db/projects', () => ({
  getProjectByUser: vi.fn(),
  updateProjectCode: vi.fn(),
  updateProjectProgress: vi.fn(),
}));

describe('POST /api/learning/project/[projectId]/save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProject = {
    PK: 'PROJECT#proj-123',
    SK: 'USER#user-123',
    name: 'Test Project',
    technology: 'react',
    type: 'learning' as const,
    status: 'active' as const,
    progress: 30,
    codeS3Key: 'user-123/proj-123/code.zip',
    createdAt: 1709251200,
    updatedAt: 1709251200,
  };

  it('should save code successfully', async () => {
    vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(mockProject);
    vi.mocked(projectsDb.updateProjectCode).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/save', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'task-1',
        code: 'console.log("Hello World");',
        completed: false,
      }),
    });

    const response = await POST(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('autoSaved', true);
    expect(data.data).toHaveProperty('timestamp');
    expect(data.data).toHaveProperty('codeS3Key');
    expect(data.data.progress).toBe(30); // No progress update when completed=false
  });

  it('should update progress when task is completed', async () => {
    vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(mockProject);
    vi.mocked(projectsDb.updateProjectCode).mockResolvedValue(undefined);
    vi.mocked(projectsDb.updateProjectProgress).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/save', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'task-1',
        code: 'console.log("Hello World");',
        completed: true,
      }),
    });

    const response = await POST(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.progress).toBe(40); // Progress increased by 10
    expect(projectsDb.updateProjectProgress).toHaveBeenCalledWith('proj-123', 'user-123', 40);
  });

  it('should cap progress at 100%', async () => {
    const almostCompleteProject = {
      ...mockProject,
      progress: 95,
    };

    vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(almostCompleteProject);
    vi.mocked(projectsDb.updateProjectCode).mockResolvedValue(undefined);
    vi.mocked(projectsDb.updateProjectProgress).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/save', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'task-1',
        code: 'console.log("Hello World");',
        completed: true,
      }),
    });

    const response = await POST(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.progress).toBe(100); // Capped at 100
    expect(projectsDb.updateProjectProgress).toHaveBeenCalledWith('proj-123', 'user-123', 100);
  });

  it('should return 404 when project not found', async () => {
    vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-999/save', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'task-1',
        code: 'console.log("Hello World");',
        completed: false,
      }),
    });

    const response = await POST(request, { params: { projectId: 'proj-999' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROJECT_NOT_FOUND');
  });

  it('should return 400 for invalid request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/save', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
        code: 'console.log("Hello World");',
      }),
    });

    const response = await POST(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should validate taskId is a string', async () => {
    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/save', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 123, // Should be string
        code: 'console.log("Hello World");',
        completed: false,
      }),
    });

    const response = await POST(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should validate completed is a boolean', async () => {
    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/save', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'task-1',
        code: 'console.log("Hello World");',
        completed: 'true', // Should be boolean
      }),
    });

    const response = await POST(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(projectsDb.getProjectByUser).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/save', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'task-1',
        code: 'console.log("Hello World");',
        completed: false,
      }),
    });

    const response = await POST(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('SAVE_FAILED');
    expect(data.error.message).toContain('Database connection failed');
  });

  it('should generate unique S3 keys with timestamps', async () => {
    vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(mockProject);
    vi.mocked(projectsDb.updateProjectCode).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/save', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'task-1',
        code: 'console.log("Hello World");',
        completed: false,
      }),
    });

    const response = await POST(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(data.data.codeS3Key).toMatch(/^user-123\/proj-123\/code-\d+\.zip$/);
    expect(projectsDb.updateProjectCode).toHaveBeenCalledWith(
      'proj-123',
      'user-123',
      expect.stringMatching(/^user-123\/proj-123\/code-\d+\.zip$/)
    );
  });

  it('should accept empty code string', async () => {
    vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(mockProject);
    vi.mocked(projectsDb.updateProjectCode).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/save', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'task-1',
        code: '',
        completed: false,
      }),
    });

    const response = await POST(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should accept large code strings', async () => {
    vi.mocked(projectsDb.getProjectByUser).mockResolvedValue(mockProject);
    vi.mocked(projectsDb.updateProjectCode).mockResolvedValue(undefined);

    const largeCode = 'console.log("test");\n'.repeat(10000);

    const request = new NextRequest('http://localhost:3000/api/learning/project/proj-123/save', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'task-1',
        code: largeCode,
        completed: false,
      }),
    });

    const response = await POST(request, { params: { projectId: 'proj-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
