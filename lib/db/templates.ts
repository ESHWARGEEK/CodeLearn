import { putItem, getItem, queryItems, TABLES } from './dynamodb';

/**
 * Template Data Model
 * 
 * PK: "TEMPLATE#{templateId}"
 * SK: "METADATA"
 * 
 * GSI: technology-rating-index
 * - Partition Key: technology
 * - Sort Key: rating
 */

export interface Template {
  PK: string;              // "TEMPLATE#{templateId}"
  SK: string;              // "METADATA"
  name: string;
  description: string;
  technology: string;
  category: string;
  codeS3Key: string;       // S3 reference
  sourceRepo: string;
  rating: number;          // 0-5
  downloads: number;
  createdBy: string;       // userId
  createdAt: number;
  updatedAt: number;
}

export interface TemplateFilters {
  technology?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'downloads' | 'recent';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get templates with filtering, searching, sorting, and pagination
 */
export async function getTemplates(filters: TemplateFilters = {}): Promise<{
  templates: Template[];
  total: number;
  hasMore: boolean;
}> {
  const {
    technology,
    category,
    search,
    page = 1,
    limit = 20,
    sortBy = 'rating',
    sortOrder = 'desc'
  } = filters;

  let templates: Template[] = [];

  if (technology) {
    // Use GSI to query by technology
    templates = await queryItems(
      TABLES.TEMPLATES,
      'technology = :tech',
      {
        ':tech': technology,
      },
      'technology-rating-index'
    ) as Template[];
  } else {
    // Scan all templates (less efficient but needed for cross-technology queries)
    templates = await queryItems(
      TABLES.TEMPLATES,
      'SK = :sk',
      {
        ':sk': 'METADATA',
      }
    ) as Template[];
  }

  // Apply category filter
  if (category) {
    templates = templates.filter(template => template.category === category);
  }

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    templates = templates.filter(template =>
      template.name.toLowerCase().includes(searchLower) ||
      template.description.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  templates.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'downloads':
        comparison = a.downloads - b.downloads;
        break;
      case 'recent':
        comparison = a.updatedAt - b.updatedAt;
        break;
      default:
        comparison = a.rating - b.rating;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Calculate pagination
  const total = templates.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTemplates = templates.slice(startIndex, endIndex);
  const hasMore = endIndex < total;

  return {
    templates: paginatedTemplates,
    total,
    hasMore,
  };
}

/**
 * Get a single template by ID
 */
export async function getTemplate(templateId: string): Promise<Template | null> {
  const item = await getItem(TABLES.TEMPLATES, {
    PK: `TEMPLATE#${templateId}`,
    SK: 'METADATA',
  });

  if (!item) {
    return null;
  }

  return item as Template;
}

/**
 * Create a new template
 */
export async function createTemplate(
  templateId: string,
  data: {
    name: string;
    description: string;
    technology: string;
    category: string;
    codeS3Key: string;
    sourceRepo: string;
    createdBy: string;
  }
): Promise<Template> {
  const now = Math.floor(Date.now() / 1000);

  const template: Template = {
    PK: `TEMPLATE#${templateId}`,
    SK: 'METADATA',
    name: data.name,
    description: data.description,
    technology: data.technology,
    category: data.category,
    codeS3Key: data.codeS3Key,
    sourceRepo: data.sourceRepo,
    rating: 0, // Initial rating
    downloads: 0, // Initial downloads
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now,
  };

  await putItem(TABLES.TEMPLATES, template as unknown as Record<string, unknown>);
  return template;
}

/**
 * Update template rating (when users rate templates)
 */
export async function updateTemplateRating(
  templateId: string,
  newRating: number
): Promise<void> {
  const template = await getTemplate(templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  const now = Math.floor(Date.now() / 1000);
  const updatedTemplate: Template = {
    ...template,
    rating: newRating,
    updatedAt: now,
  };

  await putItem(TABLES.TEMPLATES, updatedTemplate as unknown as Record<string, unknown>);
}

/**
 * Increment template download count
 */
export async function incrementTemplateDownloads(templateId: string): Promise<void> {
  const template = await getTemplate(templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  const now = Math.floor(Date.now() / 1000);
  const updatedTemplate: Template = {
    ...template,
    downloads: template.downloads + 1,
    updatedAt: now,
  };

  await putItem(TABLES.TEMPLATES, updatedTemplate as unknown as Record<string, unknown>);
}

/**
 * Get templates by technology (optimized query using GSI)
 */
export async function getTemplatesByTechnology(
  technology: string,
  limit: number = 20
): Promise<Template[]> {
  const templates = await queryItems(
    TABLES.TEMPLATES,
    'technology = :tech',
    {
      ':tech': technology,
    },
    'technology-rating-index'
  ) as Template[];

  // Sort by rating descending and limit results
  return templates
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/**
 * Get popular templates (top rated across all technologies)
 */
export async function getPopularTemplates(limit: number = 10): Promise<Template[]> {
  const templates = await queryItems(
    TABLES.TEMPLATES,
    'SK = :sk',
    {
      ':sk': 'METADATA',
    }
  ) as Template[];

  // Sort by rating descending and limit results
  return templates
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/**
 * Get recently updated templates
 */
export async function getRecentTemplates(limit: number = 10): Promise<Template[]> {
  const templates = await queryItems(
    TABLES.TEMPLATES,
    'SK = :sk',
    {
      ':sk': 'METADATA',
    }
  ) as Template[];

  // Sort by updatedAt descending and limit results
  return templates
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}