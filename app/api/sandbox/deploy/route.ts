import { NextRequest, NextResponse } from 'next/server';
import { deployProject, getDeploymentStatusById } from '@/lib/deployment/project-deployer';
import { verifyAuth } from '@/lib/auth/verify';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, platform } = body;

    // Validate input
    if (!projectId || !platform) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_INPUT', 
            message: 'projectId and platform are required' 
          } 
        },
        { status: 400 }
      );
    }

    if (!['vercel', 'netlify'].includes(platform)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_PLATFORM', 
            message: 'Platform must be vercel or netlify' 
          } 
        },
        { status: 400 }
      );
    }

    // Deploy project
    const deployment = await deployProject({
      projectId,
      userId: authResult.userId,
      platform,
    });

    return NextResponse.json({
      success: true,
      data: deployment,
    });

  } catch (error) {
    console.error('Deployment error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'DEPLOYMENT_FAILED', 
          message: errorMessage 
        } 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deploymentId = searchParams.get('deploymentId');
    const platform = searchParams.get('platform') as 'vercel' | 'netlify';

    // Validate input
    if (!deploymentId || !platform) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_INPUT', 
            message: 'deploymentId and platform are required' 
          } 
        },
        { status: 400 }
      );
    }

    if (!['vercel', 'netlify'].includes(platform)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_PLATFORM', 
            message: 'Platform must be vercel or netlify' 
          } 
        },
        { status: 400 }
      );
    }

    // Get deployment status
    const deployment = await getDeploymentStatusById(deploymentId, platform);

    return NextResponse.json({
      success: true,
      data: deployment,
    });

  } catch (error) {
    console.error('Get deployment status error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'STATUS_FETCH_FAILED', 
          message: errorMessage 
        } 
      },
      { status: 500 }
    );
  }
}
