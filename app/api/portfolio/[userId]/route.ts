/**
 * GET /api/portfolio/[userId]
 * 
 * Get all deployed projects for a user's portfolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDeployedProjectsByUser } from '@/lib/db/projects';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
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

    // Get all deployed projects for the user
    const projects = await getDeployedProjectsByUser(userId);

    // Transform projects to portfolio format
    const portfolioProjects = projects.map((project) => ({
      id: project.PK.replace('PROJECT#', ''),
      name: project.name,
      description: `A ${project.technology} project`, // TODO: Add description field to Project model
      technology: project.technology,
      techStack: [project.technology], // TODO: Add techStack array to Project model
      githubUrl: project.githubSourceUrl,
      deploymentUrl: project.deploymentUrl,
      deploymentPlatform: project.deploymentPlatform,
      deployedAt: project.deployedAt,
      status: project.status,
      progress: project.progress,
      createdAt: project.createdAt,
      completedAt: project.completedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        projects: portfolioProjects,
        total: portfolioProjects.length,
      },
    });
  } catch (error: any) {
    console.error('Get portfolio error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve portfolio projects',
        },
      },
      { status: 500 }
    );
  }
}
