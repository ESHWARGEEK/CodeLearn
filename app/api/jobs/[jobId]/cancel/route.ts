import { NextRequest, NextResponse } from 'next/server';

interface CancelJobResponse {
  success: boolean;
  data?: {
    cancelled: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      const errorResponse: CancelJobResponse = {
        success: false,
        error: {
          code: 'MISSING_JOB_ID',
          message: 'Job ID is required',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // TODO: Cancel the actual job in SQS/ECS
    // TODO: Update job status in DynamoDB
    
    console.log('Cancelling job:', jobId);

    const response: CancelJobResponse = {
      success: true,
      data: {
        cancelled: true,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error cancelling job:', error);

    const errorResponse: CancelJobResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to cancel job',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}