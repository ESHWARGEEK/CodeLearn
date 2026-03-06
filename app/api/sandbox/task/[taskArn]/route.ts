import { NextRequest, NextResponse } from 'next/server';
import { getTaskStatus, stopTask } from '@/lib/sandbox/fargate-executor';

/**
 * GET /api/sandbox/task/[taskArn]
 * Get status of a Fargate task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { taskArn: string } }
) {
  try {
    const taskArn = decodeURIComponent(params.taskArn);

    if (!taskArn) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TASK_ARN',
            message: 'Task ARN is required',
          },
        },
        { status: 400 }
      );
    }

    const result = await getTaskStatus(taskArn);

    return NextResponse.json({
      success: result.success,
      data: {
        taskArn,
        status: result.status,
        output: result.output,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error('Failed to get task status:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STATUS_CHECK_FAILED',
          message: 'Failed to check task status',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sandbox/task/[taskArn]
 * Stop a running Fargate task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskArn: string } }
) {
  try {
    const taskArn = decodeURIComponent(params.taskArn);

    if (!taskArn) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TASK_ARN',
            message: 'Task ARN is required',
          },
        },
        { status: 400 }
      );
    }

    const stopped = await stopTask(taskArn);

    if (!stopped) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STOP_FAILED',
            message: 'Failed to stop task',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        taskArn,
        stopped: true,
      },
    });
  } catch (error) {
    console.error('Failed to stop task:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STOP_FAILED',
          message: 'Failed to stop task',
        },
      },
      { status: 500 }
    );
  }
}
