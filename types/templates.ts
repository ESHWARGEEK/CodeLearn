// Template Types for CodeLearn Platform
// Task 11.1: Define TypeScript interfaces for template functionality

export interface Template {
  id: string;
  name: string;
  description: string;
  technology: string;
  category: string;
  rating: number; // 0-5
  downloads: number;
  sourceRepo: string;
  codeS3Key?: string;
  createdBy?: string;
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

export interface TemplatesPagination {
  page: number;
  total: number;
  hasMore: boolean;
}

export interface TemplatesResponse {
  success: boolean;
  data?: {
    templates: Template[];
    pagination: TemplatesPagination;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface TemplateCardProps {
  template: Template;
  onIntegrate?: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
}

// Template categories for filtering
export const TEMPLATE_CATEGORIES = [
  'authentication',
  'ui-components',
  'api-integration',
  'data-visualization',
  'forms',
  'navigation',
  'layout',
  'utilities',
  'hooks',
  'state-management',
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

// Supported technologies for templates
export const TEMPLATE_TECHNOLOGIES = [
  'react',
  'vue',
  'nextjs',
  'nodejs',
  'typescript',
  'javascript',
  'tailwind',
  'express',
] as const;

export type TemplateTechnology = typeof TEMPLATE_TECHNOLOGIES[number];