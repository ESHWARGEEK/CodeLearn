import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getItemByPK, TABLES } from '@/lib/db/dynamodb';

// GET /api/jobs/{jobId}
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Job ID is required',
            timestamp: new Date().toISOString(),
            requestId: uuidv4(),
          },
        },
        { status: 400 }
      );
    }

    // Query job from DynamoDB by PK only
    const jobRecord = await getItemByPK(TABLES.JOBS, `JOB#${jobId}`);

    if (!jobRecord) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Job not found',
            timestamp: new Date().toISOString(),
            requestId: uuidv4(),
          },
        },
        { status: 404 }
      );
    }

    // Transform DynamoDB record to API response format
    const jobData = {
      jobId,
      status: jobRecord.status,
      progress: jobRecord.progress || 0,
      result: jobRecord.result,
      error: jobRecord.error,
      createdAt: new Date(jobRecord.createdAt).toISOString(),
      updatedAt: new Date(jobRecord.updatedAt).toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: jobData,
    });
  } catch (error) {
    console.error('Error fetching job status:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch job status';

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
          timestamp: new Date().toISOString(),
          requestId: uuidv4(),
        },
      },
      { status: 500 }
    );
  }
}
