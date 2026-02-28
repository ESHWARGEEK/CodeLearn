import { NextRequest, NextResponse } from 'next/server';
import { queryItems, TABLES } from '@/lib/db/dynamodb';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
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

    // Query all projects for this user
    const projects = await queryItems(
      TABLES.PROJECTS,
      'SK = :userId',
      {
        ':userId': `USER#${userId}`,
      },
      'userId-status-index'
    );

    // Calculate statistics
    const completedProjects = projects.filter((p) => p.status === 'completed').length;

    const activeProjects = projects.filter((p) => p.status === 'active');

    // Calculate total learning hours (mock calculation - would be tracked in real app)
    const totalHours = projects.reduce((sum: number, project) => {
      // Estimate: each project is ~10 hours, multiply by progress percentage
      return sum + ((project.progress as number) / 100) * 10;
    }, 0);

    // Get current project (most recently updated active project)
    const currentProject = activeProjects.sort(
      (a, b) => (b.updatedAt as number) - (a.updatedAt as number)
    )[0];

    return NextResponse.json({
      success: true,
      data: {
        userId,
        statistics: {
          completedProjects,
          activeProjects: activeProjects.length,
          totalProjects: projects.length,
          learningHours: Math.round(totalHours),
          averageProgress:
            projects.length > 0
              ? Math.round(
                  projects.reduce((sum: number, p) => sum + (p.progress as number), 0) /
                    projects.length
                )
              : 0,
        },
        currentProject: currentProject
          ? {
              id: currentProject.PK.replace('PROJECT#', ''),
              name: currentProject.name,
              technology: currentProject.technology,
              progress: currentProject.progress,
              status: currentProject.status,
              updatedAt: currentProject.updatedAt,
            }
          : null,
        recentProjects: projects
          .sort((a, b) => (b.updatedAt as number) - (a.updatedAt as number))
          .slice(0, 5)
          .map((p) => ({
            id: p.PK.replace('PROJECT#', ''),
            name: p.name,
            progress: p.progress,
            status: p.status,
          })),
      },
    });
  } catch (error) {
    console.error('Error fetching learning progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch learning progress',
        },
      },
      { status: 500 }
    );
  }
}
