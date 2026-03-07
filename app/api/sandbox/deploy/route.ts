/**
 * POST /api/sandbox/deploy
 * 
 * Deploy a project to Vercel or Netlify
 */

import { NextRequest, NextResponse } from 'next/server';
import { deployProject, getDeploymentStatusById } from '@/lib/deployment/project-deployer';
import { isVercelConfigured } from '@/lib/deployment/vercel-client';
import { isNetlifyConfigured } from '@/lib/deployment/netlify-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, platform, userId } = body;

    // Validate required fields
    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PROJECT_ID',
            message: 'Project ID is required',
          },
        },
        { status: 400 }
      );
    }

    if (!platform) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PLATFORM',
            message: 'Platform is required',
          },
        },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: 'User ID is required',
          },
        },
        { status: 401 }
      );
    }

    // Validate platform
    if (platform !== 'vercel' && platform !== 'netlify') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PLATFORM',
            message: 'Platform must be either "vercel" or "netlify"',
          },
        },
        { status: 400 }
      );
    }

    // Check if platform is configured
    if (platform === 'vercel' && !isVercelConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VERCEL_NOT_CONFIGURED',
            message: 'Vercel deployment is not configured. Please set VERCEL_TOKEN environment variable.',
          },
        },
        { status: 503 }
      );
    }

    if (platform === 'netlify' && !isNetlifyConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NETLIFY_NOT_CONFIGURED',
            message: 'Netlify deployment is not configured. Please set NETLIFY_TOKEN environment variable.',
          },
        },
        { status: 503 }
      );
    }

    // Deploy project
    const result = await deployProject({
      projectId,
      userId,
      platform,
    });

    return NextResponse.json({
      success: true,
      data: {
        deploymentId: result.deploymentId,
        url: result.url,
        status: result.status,
      },
    });
  } catch (error: any) {
    console.error('Deployment error:', error);

    // Handle specific errors
    if (error.message.includes('Project not found')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        },
        { status: 404 }
      );
    }

    if (error.message.includes('Project code not found')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROJECT_CODE_NOT_FOUND',
            message: 'Project code not found. Please save your project first.',
          },
        },
        { status: 404 }
      );
    }

    if (error.message.includes('Vercel deployment failed')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DEPLOYMENT_FAILED',
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during deployment',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sandbox/deploy?deploymentId=xxx&platform=vercel
 * 
 * Get deployment status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deploymentId = searchParams.get('deploymentId');
    const platform = searchParams.get('platform') as 'vercel' | 'netlify';

    if (!deploymentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_DEPLOYMENT_ID',
            message: 'Deployment ID is required',
          },
        },
        { status: 400 }
      );
    }

    if (!platform) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PLATFORM',
            message: 'Platform is required',
          },
        },
        { status: 400 }
      );
    }

    const result = await getDeploymentStatusById(deploymentId, platform);

    return NextResponse.json({
      success: true,
      data: {
        deploymentId: result.deploymentId,
        url: result.url,
        status: result.status,
      },
    });
  } catch (error: any) {
    console.error('Get deployment status error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get deployment status',
        },
      },
      { status: 500 }
    );
  }
}
