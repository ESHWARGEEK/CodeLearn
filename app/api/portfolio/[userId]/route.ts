import { NextRequest, NextResponse } from 'next/server';
import { getDeployedProjectsByUser } from '@/lib/db/projects';
import { PortfolioProject, PortfolioData, PortfolioFilters } from '@/types/portfolio';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);

    // Validate userId parameter
    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: 'User ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Parse query parameters for filtering and sorting
    const filters: PortfolioFilters = {
      search: searchParams.get('search') || undefined,
      technology: searchParams.get('technology') || undefined,
      status: (searchParams.get('status') as 'all' | 'completed') || 'all',
      dateRange: (searchParams.get('dateRange') as 'all' | 'last-week' | 'last-month' | 'last-year') || 'all',
      sortBy: (searchParams.get('sortBy') as 'newest' | 'oldest' | 'name' | 'technology' | 'completion-date') || 'newest',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    // Get deployed projects for the user
    const projects = await getDeployedProjectsByUser(userId);

    // Transform database projects to portfolio format
    let portfolioProjects: PortfolioProject[] = projects.map((project) => ({
      id: project.PK.replace('PROJECT#', ''),
      name: project.name,
      description: generateProjectDescription(project.name, project.technology),
      technology: project.technology,
      techStack: generateTechStack(project.technology),
      githubUrl: project.githubSourceUrl || '',
      deploymentUrl: project.deploymentUrl || '',
      deploymentPlatform: project.deploymentPlatform || 'vercel',
      deployedAt: project.deployedAt || project.updatedAt,
      status: 'completed' as const,
      type: project.type,
      progress: project.progress,
      completedAt: project.completedAt,
    }));

    // Apply filtering and sorting
    portfolioProjects = applyFiltersAndSorting(portfolioProjects, filters);

    const portfolioData: PortfolioData = {
      projects: portfolioProjects,
      total: portfolioProjects.length,
    };

    return NextResponse.json({
      success: true,
      data: portfolioData,
    });
  } catch (error) {
    console.error('Portfolio API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch portfolio data',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Apply filtering and sorting to portfolio projects
 */
function applyFiltersAndSorting(
  projects: PortfolioProject[],
  filters: PortfolioFilters
): PortfolioProject[] {
  let filtered = [...projects];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (project) =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.technology.toLowerCase().includes(searchLower) ||
        project.techStack.some(tech => tech.toLowerCase().includes(searchLower))
    );
  }

  // Apply technology filter
  if (filters.technology && filters.technology !== 'all') {
    filtered = filtered.filter((project) => project.technology === filters.technology);
  }

  // Apply date range filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = Math.floor(Date.now() / 1000);
    let cutoffTime = 0;

    switch (filters.dateRange) {
      case 'last-week':
        cutoffTime = now - (7 * 24 * 60 * 60);
        break;
      case 'last-month':
        cutoffTime = now - (30 * 24 * 60 * 60);
        break;
      case 'last-year':
        cutoffTime = now - (365 * 24 * 60 * 60);
        break;
    }

    filtered = filtered.filter((project) => {
      const projectTime = project.completedAt || project.deployedAt;
      return projectTime >= cutoffTime;
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'newest':
        comparison = b.deployedAt - a.deployedAt;
        break;
      case 'oldest':
        comparison = a.deployedAt - b.deployedAt;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'technology':
        comparison = a.technology.localeCompare(b.technology);
        break;
      case 'completion-date':
        const aTime = a.completedAt || a.deployedAt;
        const bTime = b.completedAt || b.deployedAt;
        comparison = bTime - aTime;
        break;
      default:
        comparison = b.deployedAt - a.deployedAt;
    }

    // Apply sort order
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  // Apply pagination
  if (filters.offset !== undefined && filters.limit !== undefined) {
    filtered = filtered.slice(filters.offset, filters.offset + filters.limit);
  } else if (filters.limit !== undefined) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

/**
 * Generate a description for a project based on its name and technology
 */
function generateProjectDescription(name: string, technology: string): string {
  const descriptions: Record<string, string> = {
    react: `A modern React application showcasing component-based architecture and state management.`,
    vue: `A Vue.js application demonstrating reactive data binding and component composition.`,
    nextjs: `A full-stack Next.js application with server-side rendering and API routes.`,
    nodejs: `A Node.js backend application with RESTful APIs and database integration.`,
    javascript: `A JavaScript application demonstrating modern ES6+ features and best practices.`,
    typescript: `A TypeScript application with strong typing and enhanced developer experience.`,
  };

  return descriptions[technology] || `A ${technology} project built as part of the CodeLearn learning path.`;
}

/**
 * Generate tech stack array based on the primary technology
 */
function generateTechStack(technology: string): string[] {
  const techStacks: Record<string, string[]> = {
    react: ['React', 'JavaScript', 'CSS', 'HTML'],
    vue: ['Vue.js', 'JavaScript', 'CSS', 'HTML'],
    nextjs: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    nodejs: ['Node.js', 'Express', 'JavaScript', 'REST API'],
    javascript: ['JavaScript', 'HTML', 'CSS', 'DOM'],
    typescript: ['TypeScript', 'JavaScript', 'HTML', 'CSS'],
  };

  return techStacks[technology] || [technology, 'HTML', 'CSS', 'JavaScript'];
}