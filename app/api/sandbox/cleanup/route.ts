/**
 * Sandbox Cleanup API Route
 * 
 * Endpoint for triggering manual or scheduled cleanup of sandbox resources.
 * Can be called by:
 * - Cron jobs (e.g., Vercel Cron, AWS EventBridge)
 * - Admin dashboard
 * - Monitoring systems
 */

import { NextRequest, NextResponse } from 'next/server';
import { cleanupSandboxResources } from '@/lib/sandbox/cleanup';

/**
 * POST /api/sandbox/cleanup
 * 
 * Trigger sandbox resource cleanup
 * 
 * Authentication: Requires admin token or cron secret
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Check for cron secret or admin token
    if (!authHeader || !cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Missing or invalid authorization',
          },
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (token !== cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Invalid authorization token',
          },
        },
        { status: 403 }
      );
    }

    // Perform cleanup
    console.log('Starting scheduled sandbox cleanup...');
    const stats = await cleanupSandboxResources();

    // Log results
    console.log('Cleanup completed:', {
      tasksStoppedCount: stats.tasksStoppedCount,
      s3ObjectsDeletedCount: stats.s3ObjectsDeletedCount,
      dynamoRecordsDeletedCount: stats.dynamoRecordsDeletedCount,
      errorCount: stats.errors.length,
      duration: `${stats.duration}ms`,
    });

    // Return success with statistics
    return NextResponse.json(
      {
        success: true,
        data: {
          stats: {
            tasksStoppedCount: stats.tasksStoppedCount,
            s3ObjectsDeletedCount: stats.s3ObjectsDeletedCount,
            dynamoRecordsDeletedCount: stats.dynamoRecordsDeletedCount,
            duration: stats.duration,
          },
          errors: stats.errors,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cleanup API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CLEANUP_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error during cleanup',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sandbox/cleanup
 * 
 * Get cleanup status and configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!authHeader || !cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Missing or invalid authorization',
          },
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (token !== cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Invalid authorization token',
          },
        },
        { status: 403 }
      );
    }

    // Return cleanup configuration
    return NextResponse.json(
      {
        success: true,
        data: {
          configuration: {
            enabled: true,
            taskCleanupAgeMinutes: 30,
            resultCleanupAgeHours: 24,
            scheduledInterval: '1 hour',
          },
          services: {
            fargate: !!process.env.FARGATE_CLUSTER_ARN,
            s3: !!process.env.SANDBOX_RESULTS_BUCKET,
            dynamodb: !!process.env.SANDBOX_RESULTS_TABLE,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cleanup status API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STATUS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
