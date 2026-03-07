/**
 * Unit tests for Templates database operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as templatesDb from '@/lib/db/templates';
import * as dynamodb from '@/lib/db/dynamodb';

// Mock the DynamoDB operations
vi.mock('@/lib/db/dynamodb', () => ({
  putItem: vi.fn(),
  getItem: vi.fn(),
  queryItems: vi.fn(),
  TABLES: {
    TEMPLATES: 'test-templates-table',
  },
}));

describe('Templates Database Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTemplates', () => {
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
      {
        PK: 'TEMPLATE#template-3',
        SK: 'METADATA',
        name: 'Vue Navigation',
        description: 'Flexible navigation component for Vue.js',
        technology: 'vue',
        category: 'navigation',
        codeS3Key: 'templates/template-3/code.zip',
        sourceRepo: 'https://github.com/example/vue-navigation',
        rating: 4.3,
        downloads: 560,
        createdBy: 'user-789',
        createdAt: 1709078400,
        updatedAt: 1709164800,
      },
    ];

    it('should return all templates when no filters are applied', async () => {
      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getTemplates();

      expect(result.templates).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(false);
      expect(dynamodb.queryItems).toHaveBeenCalledWith(
        'test-templates-table',
        'SK = :sk',
        { ':sk': 'METADATA' }
      );
    });

    it('should filter templates by technology using GSI', async () => {
      const reactTemplates = mockTemplates.filter(t => t.technology === 'react');
      vi.mocked(dynamodb.queryItems).mockResolvedValue(reactTemplates);

      const result = await templatesDb.getTemplates({ technology: 'react' });

      expect(result.templates).toHaveLength(2);
      expect(result.templates.every(t => t.technology === 'react')).toBe(true);
      expect(dynamodb.queryItems).toHaveBeenCalledWith(
        'test-templates-table',
        'technology = :tech',
        { ':tech': 'react' },
        'technology-rating-index'
      );
    });

    it('should filter templates by category', async () => {
      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getTemplates({ category: 'authentication' });

      expect(result.templates).toHaveLength(1);
      expect(result.templates[0].category).toBe('authentication');
    });

    it('should search templates by name and description', async () => {
      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getTemplates({ search: 'navigation' });

      expect(result.templates).toHaveLength(2); // Dashboard has "navigation" in description, Vue has it in name
      expect(result.templates.some(t => t.name.toLowerCase().includes('navigation'))).toBe(true);
    });

    it('should sort templates by rating descending by default', async () => {
      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getTemplates();

      expect(result.templates[0].rating).toBe(4.8); // Highest rating first
      expect(result.templates[1].rating).toBe(4.6);
      expect(result.templates[2].rating).toBe(4.3);
    });

    it('should sort templates by downloads ascending when specified', async () => {
      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getTemplates({ 
        sortBy: 'downloads', 
        sortOrder: 'asc' 
      });

      expect(result.templates[0].downloads).toBe(560); // Lowest downloads first
      expect(result.templates[1].downloads).toBe(890);
      expect(result.templates[2].downloads).toBe(1250);
    });

    it('should sort templates by recent updates', async () => {
      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getTemplates({ sortBy: 'recent' });

      expect(result.templates[0].updatedAt).toBe(1709337600); // Most recent first
      expect(result.templates[1].updatedAt).toBe(1709251200);
      expect(result.templates[2].updatedAt).toBe(1709164800);
    });

    it('should paginate results correctly', async () => {
      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getTemplates({ page: 2, limit: 2 });

      expect(result.templates).toHaveLength(1); // Only 1 template on page 2
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(false);
    });

    it('should indicate hasMore when there are more pages', async () => {
      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getTemplates({ page: 1, limit: 2 });

      expect(result.templates).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(true);
    });

    it('should combine multiple filters', async () => {
      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getTemplates({
        technology: 'react',
        category: 'authentication',
        search: 'hook'
      });

      // Should return only the authentication hook template
      expect(result.templates).toHaveLength(1);
      expect(result.templates[0].name).toBe('Authentication Hook');
    });
  });

  describe('getTemplate', () => {
    it('should return a template by ID', async () => {
      const mockTemplate = {
        PK: 'TEMPLATE#template-1',
        SK: 'METADATA',
        name: 'Authentication Hook',
        description: 'Complete authentication system',
        technology: 'react',
        category: 'authentication',
        codeS3Key: 'templates/template-1/code.zip',
        sourceRepo: 'https://github.com/example/auth-hook',
        rating: 4.8,
        downloads: 1250,
        createdBy: 'user-123',
        createdAt: 1709251200,
        updatedAt: 1709337600,
      };

      vi.mocked(dynamodb.getItem).mockResolvedValue(mockTemplate);

      const result = await templatesDb.getTemplate('template-1');

      expect(result).toEqual(mockTemplate);
      expect(dynamodb.getItem).toHaveBeenCalledWith(
        'test-templates-table',
        {
          PK: 'TEMPLATE#template-1',
          SK: 'METADATA',
        }
      );
    });

    it('should return null when template is not found', async () => {
      vi.mocked(dynamodb.getItem).mockResolvedValue(null);

      const result = await templatesDb.getTemplate('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createTemplate', () => {
    it('should create a new template with correct structure', async () => {
      vi.mocked(dynamodb.putItem).mockResolvedValue();

      const templateData = {
        name: 'Test Template',
        description: 'A test template',
        technology: 'react',
        category: 'testing',
        codeS3Key: 'templates/test/code.zip',
        sourceRepo: 'https://github.com/example/test',
        createdBy: 'user-123',
      };

      const result = await templatesDb.createTemplate('test-template', templateData);

      expect(result.PK).toBe('TEMPLATE#test-template');
      expect(result.SK).toBe('METADATA');
      expect(result.name).toBe(templateData.name);
      expect(result.description).toBe(templateData.description);
      expect(result.technology).toBe(templateData.technology);
      expect(result.category).toBe(templateData.category);
      expect(result.rating).toBe(0); // Initial rating
      expect(result.downloads).toBe(0); // Initial downloads
      expect(result.createdBy).toBe(templateData.createdBy);
      expect(result.createdAt).toBeTypeOf('number');
      expect(result.updatedAt).toBeTypeOf('number');

      expect(dynamodb.putItem).toHaveBeenCalledWith(
        'test-templates-table',
        expect.objectContaining({
          PK: 'TEMPLATE#test-template',
          SK: 'METADATA',
        })
      );
    });
  });

  describe('updateTemplateRating', () => {
    it('should update template rating', async () => {
      const mockTemplate = {
        PK: 'TEMPLATE#template-1',
        SK: 'METADATA',
        name: 'Test Template',
        description: 'A test template',
        technology: 'react',
        category: 'testing',
        codeS3Key: 'templates/test/code.zip',
        sourceRepo: 'https://github.com/example/test',
        rating: 4.0,
        downloads: 100,
        createdBy: 'user-123',
        createdAt: 1709251200,
        updatedAt: 1709251200,
      };

      vi.mocked(dynamodb.getItem).mockResolvedValue(mockTemplate);
      vi.mocked(dynamodb.putItem).mockResolvedValue();

      await templatesDb.updateTemplateRating('template-1', 4.5);

      expect(dynamodb.putItem).toHaveBeenCalledWith(
        'test-templates-table',
        expect.objectContaining({
          rating: 4.5,
          updatedAt: expect.any(Number),
        })
      );
    });

    it('should throw error when template is not found', async () => {
      vi.mocked(dynamodb.getItem).mockResolvedValue(null);

      await expect(
        templatesDb.updateTemplateRating('nonexistent', 4.5)
      ).rejects.toThrow('Template not found');
    });
  });

  describe('incrementTemplateDownloads', () => {
    it('should increment template download count', async () => {
      const mockTemplate = {
        PK: 'TEMPLATE#template-1',
        SK: 'METADATA',
        name: 'Test Template',
        description: 'A test template',
        technology: 'react',
        category: 'testing',
        codeS3Key: 'templates/test/code.zip',
        sourceRepo: 'https://github.com/example/test',
        rating: 4.0,
        downloads: 100,
        createdBy: 'user-123',
        createdAt: 1709251200,
        updatedAt: 1709251200,
      };

      vi.mocked(dynamodb.getItem).mockResolvedValue(mockTemplate);
      vi.mocked(dynamodb.putItem).mockResolvedValue();

      await templatesDb.incrementTemplateDownloads('template-1');

      expect(dynamodb.putItem).toHaveBeenCalledWith(
        'test-templates-table',
        expect.objectContaining({
          downloads: 101,
          updatedAt: expect.any(Number),
        })
      );
    });

    it('should throw error when template is not found', async () => {
      vi.mocked(dynamodb.getItem).mockResolvedValue(null);

      await expect(
        templatesDb.incrementTemplateDownloads('nonexistent')
      ).rejects.toThrow('Template not found');
    });
  });

  describe('getTemplatesByTechnology', () => {
    it('should return templates for a specific technology sorted by rating', async () => {
      const mockTemplates = [
        {
          PK: 'TEMPLATE#template-1',
          SK: 'METADATA',
          name: 'Template 1',
          technology: 'react',
          rating: 4.8,
          downloads: 100,
        },
        {
          PK: 'TEMPLATE#template-2',
          SK: 'METADATA',
          name: 'Template 2',
          technology: 'react',
          rating: 4.9,
          downloads: 200,
        },
      ];

      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getTemplatesByTechnology('react', 10);

      expect(result).toHaveLength(2);
      expect(result[0].rating).toBe(4.9); // Higher rating first
      expect(result[1].rating).toBe(4.8);
      expect(dynamodb.queryItems).toHaveBeenCalledWith(
        'test-templates-table',
        'technology = :tech',
        { ':tech': 'react' },
        'technology-rating-index'
      );
    });
  });

  describe('getPopularTemplates', () => {
    it('should return top-rated templates across all technologies', async () => {
      const mockTemplates = [
        { rating: 4.5, name: 'Template A' },
        { rating: 4.9, name: 'Template B' },
        { rating: 4.2, name: 'Template C' },
      ];

      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getPopularTemplates(2);

      expect(result).toHaveLength(2);
      expect(result[0].rating).toBe(4.9);
      expect(result[1].rating).toBe(4.5);
    });
  });

  describe('getRecentTemplates', () => {
    it('should return recently updated templates', async () => {
      const mockTemplates = [
        { updatedAt: 1709251200, name: 'Template A' },
        { updatedAt: 1709337600, name: 'Template B' },
        { updatedAt: 1709164800, name: 'Template C' },
      ];

      vi.mocked(dynamodb.queryItems).mockResolvedValue(mockTemplates);

      const result = await templatesDb.getRecentTemplates(2);

      expect(result).toHaveLength(2);
      expect(result[0].updatedAt).toBe(1709337600); // Most recent first
      expect(result[1].updatedAt).toBe(1709251200);
    });
  });
});