/**
 * Unit tests for Portfolio API endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/portfolio/[userId]/route';
import { NextRequest } from 'next/server';
import * as projectsDb from '@/lib/db/projects';

// Mock the projects database
vi.mock('@/lib/db/projects', () => ({
  getDeployedProjectsByUser: vi.fn(),
}));

describe('GET /api/portfolio/[userId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return deployed projects for a user', async () => {
    // Mock deployed projects
    const mockProjects = [
      {
        PK: 'PROJECT#proj-1',
        SK: 'USER#user-123',
        name: 'E-commerce Dashboard',
        technology: 'react',
        type: 'learning' as const,
        status: 'completed' as const,
        progress: 100,
        codeS3Key: 'user-123/proj-1/code.zip',
        githubSourceUrl: 'https://github.com/example/dashboard',
        deploymentUrl: 'https://dashboard.vercel.app',
        deploymentPlatform: 'vercel' as const,
        deployedAt: 1709337600,
        createdAt: 1709251200,
        updatedAt: 1709337600,
        completedAt: 1709337600,
      },
      {
        PK: 'PROJECT#proj-2',
        SK: 'USER#user-123',
        name: 'Todo App',
        technology: 'vue',
        type: 'learning' as const,
        status: 'completed' as const,
        progress: 100,
        codeS3Key: 'user-123/proj-2/code.zip',
        githubSourceUrl: 'https://github.com/example/todo',
        deploymentUrl: 'https://todo.netlify.app',
        deploymentPlatform: 'netlify' as const,
        deployedAt: 1709424000,
        createdAt: 1709251200,
        updatedAt: 1709424000,
        completedAt: 1709424000,
      },
    ];

    vi.mocked(projectsDb.getDeployedProjectsByUser).mockResolvedValue(mockProjects);

    const request = new NextRequest('http://localhost:3000/api/portfolio/user-123');
    const response = await GET(request, { params: { userId: 'user-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.projects).toHaveLength(2);
    expect(data.data.total).toBe(2);

    // Verify first project
    expect(data.data.projects[0]).toMatchObject({
      id: 'proj-1',
      name: 'E-commerce Dashboard',
      technology: 'react',
      deploymentUrl: 'https://dashboard.vercel.app',
      deploymentPlatform: 'vercel',
      deployedAt: 1709337600,
    });

    // Verify second project
    expect(data.data.projects[1]).toMatchObject({
      id: 'proj-2',
      name: 'Todo App',
      technology: 'vue',
      deploymentUrl: 'https://todo.netlify.app',
      deploymentPlatform: 'netlify',
      deployedAt: 1709424000,
    });

    expect(projectsDb.getDeployedProjectsByUser).toHaveBeenCalledWith('user-123');
  });

  it('should return empty array when user has no deployed projects', async () => {
    vi.mocked(projectsDb.getDeployedProjectsByUser).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/portfolio/user-456');
    const response = await GET(request, { params: { userId: 'user-456' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.projects).toHaveLength(0);
    expect(data.data.total).toBe(0);
  });

  it('should return 400 when userId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/portfolio/');
    const response = await GET(request, { params: { userId: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('MISSING_USER_ID');
  });

  it('should return 500 when database query fails', async () => {
    vi.mocked(projectsDb.getDeployedProjectsByUser).mockRejectedValue(
      new Error('Database error')
    );

    const request = new NextRequest('http://localhost:3000/api/portfolio/user-123');
    const response = await GET(request, { params: { userId: 'user-123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('should include all required portfolio fields', async () => {
    const mockProjects = [
      {
        PK: 'PROJECT#proj-1',
        SK: 'USER#user-123',
        name: 'Test Project',
        technology: 'nextjs',
        type: 'learning' as const,
        status: 'completed' as const,
        progress: 100,
        codeS3Key: 'user-123/proj-1/code.zip',
        githubSourceUrl: 'https://github.com/example/test',
        deploymentUrl: 'https://test.vercel.app',
        deploymentPlatform: 'vercel' as const,
        deployedAt: 1709337600,
        createdAt: 1709251200,
        updatedAt: 1709337600,
        completedAt: 1709337600,
      },
    ];

    vi.mocked(projectsDb.getDeployedProjectsByUser).mockResolvedValue(mockProjects);

    const request = new NextRequest('http://localhost:3000/api/portfolio/user-123');
    const response = await GET(request, { params: { userId: 'user-123' } });
    const data = await response.json();

    const project = data.data.projects[0];
    
    // Verify all required fields are present
    expect(project).toHaveProperty('id');
    expect(project).toHaveProperty('name');
    expect(project).toHaveProperty('description');
    expect(project).toHaveProperty('technology');
    expect(project).toHaveProperty('techStack');
    expect(project).toHaveProperty('githubUrl');
    expect(project).toHaveProperty('deploymentUrl');
    expect(project).toHaveProperty('deploymentPlatform');
    expect(project).toHaveProperty('deployedAt');
    expect(project).toHaveProperty('status');
  });
});
