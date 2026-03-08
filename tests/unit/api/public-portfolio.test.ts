import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/portfolio/public/[userId]/route';
import { NextRequest } from 'next/server';
import * as projectsDb from '@/lib/db/projects';
import * as portfolioSettingsDb from '@/lib/db/portfolio-settings';
import * as usersDb from '@/lib/db/users';

// Mock the database functions
vi.mock('@/lib/db/projects', () => ({
  getDeployedProjectsByUser: vi.fn(),
}));

vi.mock('@/lib/db/portfolio-settings', () => ({
  getPortfolioSettings: vi.fn(),
}));

vi.mock('@/lib/db/users', () => ({
  getUserProfile: vi.fn(),
}));

describe('/api/portfolio/public/[userId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    PK: 'USER#user-123',
    SK: 'PROFILE',
    name: 'John Developer',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    provider: 'github' as const,
    tier: 'free' as const,
    createdAt: 1709251200,
    lastLoginAt: 1709337600,
    preferences: {
      theme: 'dark' as const,
      notifications: true,
    },
  };

  const mockSettings = {
    isPublic: true,
    showGithubLinks: true,
    showTechStack: true,
    customDescription: 'My awesome portfolio',
  };

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
  ];

  it('should return public portfolio data for public portfolio', async () => {
    vi.mocked(portfolioSettingsDb.getPortfolioSettings).mockResolvedValue(mockSettings);
    vi.mocked(usersDb.getUserProfile).mockResolvedValue(mockUser);
    vi.mocked(projectsDb.getDeployedProjectsByUser).mockResolvedValue(mockProjects);

    const request = new NextRequest('http://localhost/api/portfolio/public/user-123');
    const params = { userId: 'user-123' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user.name).toBe('John Developer');
    expect(data.data.user.avatar).toBe('https://example.com/avatar.jpg');
    expect(data.data.user.bio).toBe('My awesome portfolio');
    expect(data.data.settings).toEqual(mockSettings);
    expect(data.data.projects).toHaveLength(1);
    expect(data.data.projects[0].name).toBe('E-commerce Dashboard');
  });

  it('should return 403 for private portfolio', async () => {
    const privateSettings = { ...mockSettings, isPublic: false };
    vi.mocked(portfolioSettingsDb.getPortfolioSettings).mockResolvedValue(privateSettings);

    const request = new NextRequest('http://localhost/api/portfolio/public/user-123');
    const params = { userId: 'user-123' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PORTFOLIO_PRIVATE');
  });

  it('should return 404 for non-existent user', async () => {
    vi.mocked(portfolioSettingsDb.getPortfolioSettings).mockResolvedValue(mockSettings);
    vi.mocked(usersDb.getUserProfile).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/portfolio/public/user-123');
    const params = { userId: 'user-123' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('USER_NOT_FOUND');
  });

  it('should hide GitHub links when showGithubLinks is false', async () => {
    const settingsWithoutGithub = { ...mockSettings, showGithubLinks: false };
    vi.mocked(portfolioSettingsDb.getPortfolioSettings).mockResolvedValue(settingsWithoutGithub);
    vi.mocked(usersDb.getUserProfile).mockResolvedValue(mockUser);
    vi.mocked(projectsDb.getDeployedProjectsByUser).mockResolvedValue(mockProjects);

    const request = new NextRequest('http://localhost/api/portfolio/public/user-123');
    const params = { userId: 'user-123' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.projects[0].githubUrl).toBe('');
  });

  it('should apply search filter correctly', async () => {
    vi.mocked(portfolioSettingsDb.getPortfolioSettings).mockResolvedValue(mockSettings);
    vi.mocked(usersDb.getUserProfile).mockResolvedValue(mockUser);
    vi.mocked(projectsDb.getDeployedProjectsByUser).mockResolvedValue(mockProjects);

    const request = new NextRequest('http://localhost/api/portfolio/public/user-123?search=dashboard');
    const params = { userId: 'user-123' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.projects).toHaveLength(1);
    expect(data.data.projects[0].name).toBe('E-commerce Dashboard');
  });

  it('should apply technology filter correctly', async () => {
    vi.mocked(portfolioSettingsDb.getPortfolioSettings).mockResolvedValue(mockSettings);
    vi.mocked(usersDb.getUserProfile).mockResolvedValue(mockUser);
    vi.mocked(projectsDb.getDeployedProjectsByUser).mockResolvedValue(mockProjects);

    const request = new NextRequest('http://localhost/api/portfolio/public/user-123?technology=react');
    const params = { userId: 'user-123' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.projects).toHaveLength(1);
  });

  it('should return 400 for missing userId', async () => {
    const request = new NextRequest('http://localhost/api/portfolio/public/');
    const params = { userId: '' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('MISSING_USER_ID');
  });
});