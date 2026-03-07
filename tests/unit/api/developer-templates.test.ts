/**
 * Unit tests for Developer Templates API endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/developer/templates/route';
import { NextRequest } from 'next/server';
import * as templatesDb from '@/lib/db/templates';

// Mock the templates database
vi.mock('@/lib/db/templates', () => ({
  getTemplates: vi.fn(),
}));

describe('GET /api/developer/templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTemplates = [
    {
      PK: 'TEMPLATE#template-1',
      SK: 'METADATA',
      name: 'Authentication Hook',
      description: 'Complete authentication system with React hooks',
      technology: 'react',
      category: 'authentication',
      codeS3Key: 'templates/template-1/code.zip',
      sourceRepo: 'https://github.com/example/auth-hook',
      rating: 4.8,
      downloads: 1250,
      createdBy: 'user-123',
      createdAt: 1709251200,
      updatedAt: 1709337600,
    },
    {
      PK: 'TEMPLATE#template-2',
      SK: 'METADATA',
      name: 'Dashboard Layout',
      description: 'Responsive dashboard layout with sidebar navigation',
      technology: 'react',
      category: 'layout',
      codeS3Key: 'templates/template-2/code.zip',
      sourceRepo: 'https://github.com/example/dashboard-layout',
      rating: 4.6,
      downloads: 890,
      createdBy: 'user-456',
      createdAt: 1709164800,
      updatedAt: 1709251200,
    },
  ];

  it('should return templates with default parameters', async () => {
    vi.mocked(templatesDb.getTemplates).mockResolvedValue({
      templates: mockTemplates,
      total: 2,
      hasMore: false,
    });

    const request = new NextRequest('http://localhost:3000/api/developer/templates');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.templates).toHaveLength(2);
    expect(data.data.pagination).toEqual({
      page: 1,
      total: 2,
      hasMore: false,
    });

    // Verify template transformation
    expect(data.data.templates[0]).toEqual({
      id: 'template-1',
      name: 'Authentication Hook',
      description: 'Complete authentication system with React hooks',
      technology: 'react',
      category: 'authentication',
      rating: 4.8,
      downloads: 1250,
      sourceRepo: 'https://github.com/example/auth-hook',
    });

    expect(templatesDb.getTemplates).toHaveBeenCalledWith({
      technology: undefined,
      category: undefined,
      search: undefined,
      page: 1,
      limit: 20,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  });

  it('should handle technology filter', async () => {
    vi.mocked(templatesDb.getTemplates).mockResolvedValue({
      templates: mockTemplates.filter(t => t.technology === 'react'),
      total: 2,
      hasMore: false,
    });

    const request = new NextRequest('http://localhost:3000/api/developer/templates?technology=react');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(templatesDb.getTemplates).toHaveBeenCalledWith({
      technology: 'react',
      category: undefined,
      search: undefined,
      page: 1,
      limit: 20,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  });

  it('should handle category filter', async () => {
    vi.mocked(templatesDb.getTemplates).mockResolvedValue({
      templates: mockTemplates.filter(t => t.category === 'authentication'),
      total: 1,
      hasMore: false,
    });

    const request = new NextRequest('http://localhost:3000/api/developer/templates?category=authentication');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(templatesDb.getTemplates).toHaveBeenCalledWith({
      technology: undefined,
      category: 'authentication',
      search: undefined,
      page: 1,
      limit: 20,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  });

  it('should handle search query', async () => {
    vi.mocked(templatesDb.getTemplates).mockResolvedValue({
      templates: mockTemplates.filter(t => t.name.toLowerCase().includes('auth')),
      total: 1,
      hasMore: false,
    });

    const request = new NextRequest('http://localhost:3000/api/developer/templates?search=auth');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(templatesDb.getTemplates).toHaveBeenCalledWith({
      technology: undefined,
      category: undefined,
      search: 'auth',
      page: 1,
      limit: 20,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  });

  it('should handle pagination parameters', async () => {
    vi.mocked(templatesDb.getTemplates).mockResolvedValue({
      templates: [mockTemplates[0]],
      total: 2,
      hasMore: true,
    });

    const request = new NextRequest('http://localhost:3000/api/developer/templates?page=1&limit=1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.templates).toHaveLength(1);
    expect(data.data.pagination).toEqual({
      page: 1,
      total: 2,
      hasMore: true,
    });

    expect(templatesDb.getTemplates).toHaveBeenCalledWith({
      technology: undefined,
      category: undefined,
      search: undefined,
      page: 1,
      limit: 1,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  });

  it('should handle sorting parameters', async () => {
    vi.mocked(templatesDb.getTemplates).mockResolvedValue({
      templates: mockTemplates,
      total: 2,
      hasMore: false,
    });

    const request = new NextRequest('http://localhost:3000/api/developer/templates?sortBy=downloads&sortOrder=asc');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(templatesDb.getTemplates).toHaveBeenCalledWith({
      technology: undefined,
      category: undefined,
      search: undefined,
      page: 1,
      limit: 20,
      sortBy: 'downloads',
      sortOrder: 'asc',
    });
  });

  it('should handle multiple query parameters', async () => {
    vi.mocked(templatesDb.getTemplates).mockResolvedValue({
      templates: [mockTemplates[0]],
      total: 1,
      hasMore: false,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/developer/templates?technology=react&category=authentication&search=hook&page=1&limit=10&sortBy=rating&sortOrder=desc'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(templatesDb.getTemplates).toHaveBeenCalledWith({
      technology: 'react',
      category: 'authentication',
      search: 'hook',
      page: 1,
      limit: 10,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  });

  it('should return 400 for invalid page number', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/templates?page=0');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_PAGE');
    expect(data.error.message).toBe('Page number must be greater than 0');
  });

  it('should return 400 for invalid limit (too small)', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/templates?limit=0');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_LIMIT');
    expect(data.error.message).toBe('Limit must be between 1 and 100');
  });

  it('should return 400 for invalid limit (too large)', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/templates?limit=101');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_LIMIT');
    expect(data.error.message).toBe('Limit must be between 1 and 100');
  });

  it('should return empty results when no templates match filters', async () => {
    vi.mocked(templatesDb.getTemplates).mockResolvedValue({
      templates: [],
      total: 0,
      hasMore: false,
    });

    const request = new NextRequest('http://localhost:3000/api/developer/templates?technology=nonexistent');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.templates).toHaveLength(0);
    expect(data.data.pagination).toEqual({
      page: 1,
      total: 0,
      hasMore: false,
    });
  });

  it('should return 500 when database query fails', async () => {
    vi.mocked(templatesDb.getTemplates).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/developer/templates');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
    expect(data.error.message).toBe('Failed to fetch templates');
  });

  it('should return 400 for malformed query parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/developer/templates?page=invalid&limit=invalid');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_PAGE');
    expect(data.error.message).toBe('Page number must be greater than 0');
  });

  it('should preserve template ID transformation', async () => {
    const templateWithComplexId = {
      ...mockTemplates[0],
      PK: 'TEMPLATE#complex-template-id-123',
    };

    vi.mocked(templatesDb.getTemplates).mockResolvedValue({
      templates: [templateWithComplexId],
      total: 1,
      hasMore: false,
    });

    const request = new NextRequest('http://localhost:3000/api/developer/templates');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.templates[0].id).toBe('complex-template-id-123');
  });

  it('should handle edge case with page beyond available results', async () => {
    vi.mocked(templatesDb.getTemplates).mockResolvedValue({
      templates: [],
      total: 2,
      hasMore: false,
    });

    const request = new NextRequest('http://localhost:3000/api/developer/templates?page=10&limit=20');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.templates).toHaveLength(0);
    expect(data.data.pagination).toEqual({
      page: 10,
      total: 2,
      hasMore: false,
    });
  });
});