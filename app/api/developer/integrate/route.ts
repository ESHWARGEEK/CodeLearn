import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/cognito';
import { getTemplate } from '@/lib/db/templates';
import { getProjectByUser } from '@/lib/db/projects';
import { createJob } from '@/lib/db/jobs';
import { createIntegration, getMonthlyIntegrationCount } from '@/lib/db/integrations';
import { checkIntegrationLimit } from '@/lib/db/users';

interface IntegrateRequest {
  templateId: string;
  projectId: string;
}

interface IntegrateResponse {
  success: boolean;
  data?: {
    jobId: string;
    integrationId: string;
    status: 'queued';
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser(request);
    if (!user) {
      const errorResponse: IntegrateResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const body: IntegrateRequest = await request.json();
    const { templateId, projectId } = body;

    // Validate required parameters
    if (!templateId || !projectId) {
      const errorResponse: IntegrateResponse = {
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'Template ID and Project ID are required',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate template exists
    const template = await getTemplate(templateId);
    if (!template) {
      const errorResponse: IntegrateResponse = {
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template not found',
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Validate project exists and user owns it
    const project = await getProjectByUser(projectId, user.userId);
    if (!project) {
      const errorResponse: IntegrateResponse = {
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found or access denied',
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check user's integration limits
    const currentCount = await getMonthlyIntegrationCount(user.userId);
    const limitCheck = await checkIntegrationLimit(user.userId, currentCount);
    
    if (!limitCheck.allowed) {
      const errorResponse: IntegrateResponse = {
        success: false,
        error: {
          code: 'INTEGRATION_LIMIT_EXCEEDED',
          message: `Integration limit exceeded. Free users can perform ${limitCheck.limit} integrations per month. Upgrade to Pro for unlimited integrations.`,
        },
      };
      return NextResponse.json(errorResponse, { status: 429 });
    }

    // Generate unique IDs
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const integrationId = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create integration record
    await createIntegration(integrationId, user.userId, {
      templateId,
      projectId,
    });

    // Create job for async processing
    await createJob(jobId, user.userId, {
      type: 'integrate',
      input: {
        templateId,
        projectId,
        integrationId,
        userId: user.userId,
      },
    });

    // TODO: Send job to SQS queue for processing by AI workers
    // For now, we'll simulate the async processing
    
    const response: IntegrateResponse = {
      success: true,
      data: {
        jobId,
        integrationId,
        status: 'queued',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Integration request error:', error);
    
    const errorResponse: IntegrateResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start integration',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}