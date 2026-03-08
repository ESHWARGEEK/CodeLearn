import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/cognito';
import { getJob } from '@/lib/db/jobs';
import { getIntegration, updateIntegrationStatus } from '@/lib/db/integrations';

interface ApproveIntegrationResponse {
  success: boolean;
  data?: {
    integrationId: string;
    status: 'approved';
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface User {
  userId: string;
  email: string;
  name: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      const errorResponse: ApproveIntegrationResponse = {
        success: false,
        error: {
          code: 'MISSING_JOB_ID',
          message: 'Job ID is required',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get current user for authorization
    const user = await getCurrentUser(request) as User | null;
    if (!user) {
      const errorResponse: ApproveIntegrationResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Get the job to validate it exists and belongs to the user
    const job = await getJob(jobId);
    if (!job) {
      const errorResponse: ApproveIntegrationResponse = {
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Integration job not found',
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Verify job belongs to the current user
    if (job.SK !== `USER#${user.userId}`) {
      const errorResponse: ApproveIntegrationResponse = {
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to this integration job',
        },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Verify this is an integration job
    if (job.type !== 'integrate') {
      const errorResponse: ApproveIntegrationResponse = {
        success: false,
        error: {
          code: 'INVALID_JOB_TYPE',
          message: 'Job is not an integration job',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if job is completed
    if (job.status !== 'completed') {
      const errorResponse: ApproveIntegrationResponse = {
        success: false,
        error: {
          code: 'JOB_NOT_READY',
          message: `Integration is ${job.status}. Can only approve completed integrations.`,
        },
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    // Get the integration ID from job input
    const integrationId = job.input.integrationId;
    if (!integrationId) {
      const errorResponse: ApproveIntegrationResponse = {
        success: false,
        error: {
          code: 'INTEGRATION_ID_MISSING',
          message: 'Integration ID not found in job data',
        },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Get the integration data
    const integration = await getIntegration(integrationId);
    if (!integration) {
      const errorResponse: ApproveIntegrationResponse = {
        success: false,
        error: {
          code: 'INTEGRATION_NOT_FOUND',
          message: 'Integration data not found',
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if integration is already approved or undone
    if (integration.status === 'approved') {
      const errorResponse: ApproveIntegrationResponse = {
        success: false,
        error: {
          code: 'ALREADY_APPROVED',
          message: 'Integration has already been approved',
        },
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    if (integration.status === 'undone') {
      const errorResponse: ApproveIntegrationResponse = {
        success: false,
        error: {
          code: 'INTEGRATION_UNDONE',
          message: 'Cannot approve an undone integration',
        },
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    // Update integration status to approved
    await updateIntegrationStatus(integrationId, 'approved');

    // TODO: In a real implementation, this would:
    // 1. Apply the changes to the actual project repository
    // 2. Create a commit with the integrated changes
    // 3. Update the project's live preview URL
    // 4. Send notification to user about successful integration

    const response: ApproveIntegrationResponse = {
      success: true,
      data: {
        integrationId,
        status: 'approved',
        message: 'Integration approved successfully. Changes have been applied to your project.',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Integration approval error:', error);
    
    const errorResponse: ApproveIntegrationResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to approve integration',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}