import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/cognito';
import { getJob } from '@/lib/db/jobs';
import { getIntegration } from '@/lib/db/integrations';

interface DiffFile {
  path: string;
  changes: string;
  additions: number;
  deletions: number;
}

interface IntegrationDiff {
  additions: number;
  deletions: number;
  files: DiffFile[];
}

interface IntegrationPreview {
  diff: IntegrationDiff;
  previewUrl: string;
  explanation: string;
}

interface IntegrationPreviewResponse {
  success: boolean;
  data?: IntegrationPreview;
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

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      const errorResponse: IntegrationPreviewResponse = {
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
      const errorResponse: IntegrationPreviewResponse = {
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
      const errorResponse: IntegrationPreviewResponse = {
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
      const errorResponse: IntegrationPreviewResponse = {
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
      const errorResponse: IntegrationPreviewResponse = {
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
      const errorResponse: IntegrationPreviewResponse = {
        success: false,
        error: {
          code: 'JOB_NOT_READY',
          message: `Integration is ${job.status}. Preview is only available for completed integrations.`,
        },
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    // Get the integration ID from job input
    const integrationId = job.input.integrationId;
    if (!integrationId) {
      const errorResponse: IntegrationPreviewResponse = {
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
      const errorResponse: IntegrationPreviewResponse = {
        success: false,
        error: {
          code: 'INTEGRATION_NOT_FOUND',
          message: 'Integration data not found',
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Verify integration has preview data
    if (!integration.diff || !integration.explanation || !integration.previewUrl) {
      const errorResponse: IntegrationPreviewResponse = {
        success: false,
        error: {
          code: 'PREVIEW_NOT_READY',
          message: 'Integration preview data is not available',
        },
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    // Return the integration preview data
    const preview: IntegrationPreview = {
      diff: {
        additions: integration.diff.additions,
        deletions: integration.diff.deletions,
        files: integration.diff.files.map(file => ({
          path: file.path,
          changes: file.changes,
          additions: (file as any).additions || 0,
          deletions: (file as any).deletions || 0,
        })),
      },
      previewUrl: integration.previewUrl,
      explanation: integration.explanation,
    };

    const response: IntegrationPreviewResponse = {
      success: true,
      data: preview,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Integration preview error:', error);
    
    const errorResponse: IntegrationPreviewResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve integration preview',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}