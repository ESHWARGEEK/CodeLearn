import { NextRequest, NextResponse } from 'next/server';
import { TemplatesResponse } from '@/types/templates';
import { getTemplates, TemplateFilters } from '@/lib/db/templates';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Validate page parameter
    if (isNaN(page) || page < 1) {
      const errorResponse: TemplatesResponse = {
        success: false,
        error: {
          code: 'INVALID_PAGE',
          message: 'Page number must be greater than 0',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 100) {
      const errorResponse: TemplatesResponse = {
        success: false,
        error: {
          code: 'INVALID_LIMIT',
          message: 'Limit must be between 1 and 100',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const filters: TemplateFilters = {
      technology: searchParams.get('technology') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      page,
      limit,
      sortBy: (searchParams.get('sortBy') as 'rating' | 'downloads' | 'recent') || 'rating',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Get templates from database
    const { templates, total, hasMore } = await getTemplates(filters);

    // Transform database templates to API response format
    const apiTemplates = templates.map(template => ({
      id: template.PK.replace('TEMPLATE#', ''),
      name: template.name,
      description: template.description,
      technology: template.technology,
      category: template.category,
      rating: template.rating,
      downloads: template.downloads,
      sourceRepo: template.sourceRepo,
    }));

    const response: TemplatesResponse = {
      success: true,
      data: {
        templates: apiTemplates,
        pagination: {
          page: filters.page || 1,
          total,
          hasMore,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching templates:', error);
    
    const errorResponse: TemplatesResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch templates',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}