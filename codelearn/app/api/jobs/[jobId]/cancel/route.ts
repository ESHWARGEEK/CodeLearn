import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getItemByPK, updateItem, TABLES } from '@/lib/db/dynamodb';

// POST /api/jobs/{jobId}/cancel
export async function POST(
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

    // Get the job record first to check if it exists and get the SK
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

    // Check if job is already completed or failed
    if (jobRecord.status === 'completed' || jobRecord.status === 'failed') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Cannot cancel job with status: ${jobRecord.status}`,
            timestamp: new Date().toISOString(),
            requestId: uuidv4(),
          },
        },
        { status: 400 }
      );
    }

    // Update job status to failed with cancellation message
    await updateItem(
      TABLES.JOBS,
      {
        PK: `JOB#${jobId}`,
        SK: jobRecord.SK,
      },
      'SET #status = :status, #error = :error, #updatedAt = :updatedAt',
      {
        ':status': 'failed',
        ':error': 'Job cancelled by user',
        ':updatedAt': Date.now(),
      },
      {
        '#status': 'status',
        '#error': 'error',
        '#updatedAt': 'updatedAt',
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        cancelled: true,
      },
    });
  } catch (error) {
    console.error('Error cancelling job:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel job';

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
