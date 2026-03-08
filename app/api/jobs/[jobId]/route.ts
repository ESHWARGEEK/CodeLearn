import { NextRequest, NextResponse } from 'next/server';

interface JobStatusResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    result?: any;
    error?: string;
    progress?: number;
    estimatedTimeRemaining?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      const errorResponse: JobStatusResponse = {
        success: false,
        error: {
          code: 'MISSING_JOB_ID',
          message: 'Job ID is required',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // TODO: In production, fetch from database/cache
    // For now, use in-memory storage (not production-ready)
    const extractionResults = (global as any).extractionResults || {};
    const jobResult = extractionResults[jobId];

    if (!jobResult) {
      // Job might still be queued/processing
      const response: JobStatusResponse = {
        success: true,
        data: {
          jobId,
          status: 'processing',
          progress: 50,
          estimatedTimeRemaining: 30, // seconds
        },
      };
      return NextResponse.json(response);
    }

    if (jobResult.status === 'completed') {
      const response: JobStatusResponse = {
        success: true,
        data: {
          jobId,
          status: 'completed',
          result: jobResult.result,
          progress: 100,
        },
      };
      return NextResponse.json(response);
    }

    if (jobResult.status === 'failed') {
      const response: JobStatusResponse = {
        success: true,
        data: {
          jobId,
          status: 'failed',
          error: jobResult.error,
          progress: 100,
        },
      };
      return NextResponse.json(response);
    }

    // Default to processing
    const response: JobStatusResponse = {
      success: true,
      data: {
        jobId,
        status: 'processing',
        progress: 75,
        estimatedTimeRemaining: 15,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching job status:', error);

    const errorResponse: JobStatusResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch job status',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}