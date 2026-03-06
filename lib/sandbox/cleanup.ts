/**
 * Sandbox Cleanup Utility
 * 
 * Handles automatic cleanup of sandbox resources including:
 * - Stopped Fargate tasks
 * - Expired execution results in S3
 * - Expired DynamoDB records (handled by TTL)
 * - Temporary files and containers
 */

import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ECSClient, ListTasksCommand, StopTaskCommand, DescribeTasksCommand } from '@aws-sdk/client-ecs';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
);
const ecsClient = new ECSClient({ region: process.env.AWS_REGION || 'us-east-1' });

const RESULTS_BUCKET = process.env.SANDBOX_RESULTS_BUCKET || 'codelearn-sandbox-results-dev';
const RESULTS_TABLE = process.env.SANDBOX_RESULTS_TABLE || 'sandbox-results';
const CLUSTER_ARN = process.env.FARGATE_CLUSTER_ARN || '';

// Cleanup thresholds
const TASK_CLEANUP_AGE_MS = 30 * 60 * 1000; // 30 minutes
const RESULT_CLEANUP_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CLEANUP_BATCH_SIZE = 100;

export interface CleanupStats {
  tasksStoppedCount: number;
  s3ObjectsDeletedCount: number;
  dynamoRecordsDeletedCount: number;
  errors: string[];
  duration: number;
}

/**
 * Perform comprehensive cleanup of sandbox resources
 */
export async function cleanupSandboxResources(): Promise<CleanupStats> {
  const startTime = Date.now();
  const stats: CleanupStats = {
    tasksStoppedCount: 0,
    s3ObjectsDeletedCount: 0,
    dynamoRecordsDeletedCount: 0,
    errors: [],
    duration: 0,
  };

  console.log('Starting sandbox cleanup...');

  // Cleanup old Fargate tasks
  try {
    const taskStats = await cleanupOldFargateTasks();
    stats.tasksStoppedCount = taskStats.stoppedCount;
    stats.errors.push(...taskStats.errors);
  } catch (error) {
    const errorMsg = `Failed to cleanup Fargate tasks: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    stats.errors.push(errorMsg);
  }

  // Cleanup expired S3 results
  try {
    const s3Stats = await cleanupExpiredS3Results();
    stats.s3ObjectsDeletedCount = s3Stats.deletedCount;
    stats.errors.push(...s3Stats.errors);
  } catch (error) {
    const errorMsg = `Failed to cleanup S3 results: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    stats.errors.push(errorMsg);
  }

  // Note: DynamoDB cleanup is handled automatically by TTL
  // We only manually cleanup if TTL is not enabled
  try {
    const dynamoStats = await cleanupExpiredDynamoResults();
    stats.dynamoRecordsDeletedCount = dynamoStats.deletedCount;
    stats.errors.push(...dynamoStats.errors);
  } catch (error) {
    const errorMsg = `Failed to cleanup DynamoDB results: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    stats.errors.push(errorMsg);
  }

  stats.duration = Date.now() - startTime;
  
  console.log('Sandbox cleanup completed:', {
    tasksStoppedCount: stats.tasksStoppedCount,
    s3ObjectsDeletedCount: stats.s3ObjectsDeletedCount,
    dynamoRecordsDeletedCount: stats.dynamoRecordsDeletedCount,
    errorCount: stats.errors.length,
    duration: `${stats.duration}ms`,
  });

  return stats;
}

/**
 * Cleanup old Fargate tasks that are still running
 */
async function cleanupOldFargateTasks(): Promise<{
  stoppedCount: number;
  errors: string[];
}> {
  const stats = { stoppedCount: 0, errors: [] as string[] };

  if (!CLUSTER_ARN) {
    console.log('Fargate cluster not configured, skipping task cleanup');
    return stats;
  }

  try {
    // List all running tasks
    const listResponse = await ecsClient.send(
      new ListTasksCommand({
        cluster: CLUSTER_ARN,
        desiredStatus: 'RUNNING',
      })
    );

    if (!listResponse.taskArns || listResponse.taskArns.length === 0) {
      console.log('No running tasks to cleanup');
      return stats;
    }

    // Describe tasks to get their start times
    const describeResponse = await ecsClient.send(
      new DescribeTasksCommand({
        cluster: CLUSTER_ARN,
        tasks: listResponse.taskArns,
      })
    );

    if (!describeResponse.tasks) {
      return stats;
    }

    const now = Date.now();
    const tasksToStop: string[] = [];

    // Find tasks older than threshold
    for (const task of describeResponse.tasks) {
      if (!task.taskArn || !task.createdAt) {
        continue;
      }

      const taskAge = now - task.createdAt.getTime();
      
      if (taskAge > TASK_CLEANUP_AGE_MS) {
        tasksToStop.push(task.taskArn);
        console.log(`Task ${task.taskArn} is ${Math.floor(taskAge / 60000)} minutes old, marking for cleanup`);
      }
    }

    // Stop old tasks
    for (const taskArn of tasksToStop) {
      try {
        await ecsClient.send(
          new StopTaskCommand({
            cluster: CLUSTER_ARN,
            task: taskArn,
            reason: 'Automatic cleanup: Task exceeded maximum age',
          })
        );
        stats.stoppedCount++;
        console.log(`Stopped task: ${taskArn}`);
      } catch (error) {
        const errorMsg = `Failed to stop task ${taskArn}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        stats.errors.push(errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = `Failed to list/describe tasks: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    stats.errors.push(errorMsg);
  }

  return stats;
}

/**
 * Cleanup expired S3 results
 */
async function cleanupExpiredS3Results(): Promise<{
  deletedCount: number;
  errors: string[];
}> {
  const stats = { deletedCount: 0, errors: [] as string[] };

  if (!RESULTS_BUCKET) {
    console.log('Results bucket not configured, skipping S3 cleanup');
    return stats;
  }

  try {
    const now = Date.now();
    let continuationToken: string | undefined;
    let totalProcessed = 0;

    do {
      // List objects in the results bucket
      const listResponse = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: RESULTS_BUCKET,
          Prefix: 'results/',
          ContinuationToken: continuationToken,
          MaxKeys: MAX_CLEANUP_BATCH_SIZE,
        })
      );

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        break;
      }

      // Check each object's age
      for (const object of listResponse.Contents) {
        if (!object.Key || !object.LastModified) {
          continue;
        }

        const objectAge = now - object.LastModified.getTime();

        // Delete objects older than threshold
        if (objectAge > RESULT_CLEANUP_AGE_MS) {
          try {
            await s3Client.send(
              new DeleteObjectCommand({
                Bucket: RESULTS_BUCKET,
                Key: object.Key,
              })
            );
            stats.deletedCount++;
            console.log(`Deleted expired S3 object: ${object.Key}`);
          } catch (error) {
            const errorMsg = `Failed to delete S3 object ${object.Key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            console.error(errorMsg);
            stats.errors.push(errorMsg);
          }
        }
      }

      totalProcessed += listResponse.Contents.length;
      continuationToken = listResponse.NextContinuationToken;

      // Safety limit to prevent infinite loops
      if (totalProcessed >= 1000) {
        console.warn('Reached safety limit of 1000 objects processed, stopping S3 cleanup');
        break;
      }
    } while (continuationToken);

  } catch (error) {
    const errorMsg = `Failed to list S3 objects: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    stats.errors.push(errorMsg);
  }

  return stats;
}

/**
 * Cleanup expired DynamoDB results (fallback if TTL is not enabled)
 */
async function cleanupExpiredDynamoResults(): Promise<{
  deletedCount: number;
  errors: string[];
}> {
  const stats = { deletedCount: 0, errors: [] as string[] };

  if (!RESULTS_TABLE) {
    console.log('Results table not configured, skipping DynamoDB cleanup');
    return stats;
  }

  // Note: DynamoDB TTL should handle this automatically
  // This is a fallback for manual cleanup if needed
  console.log('DynamoDB cleanup is handled by TTL, skipping manual cleanup');

  return stats;
}

/**
 * Cleanup resources for a specific task after completion
 */
export async function cleanupTaskResources(taskArn: string): Promise<void> {
  console.log(`Cleaning up resources for task: ${taskArn}`);

  try {
    // Verify task is stopped
    const describeResponse = await ecsClient.send(
      new DescribeTasksCommand({
        cluster: CLUSTER_ARN,
        tasks: [taskArn],
      })
    );

    if (!describeResponse.tasks || describeResponse.tasks.length === 0) {
      console.log(`Task ${taskArn} not found, may already be cleaned up`);
      return;
    }

    const task = describeResponse.tasks[0];
    
    if (task?.lastStatus !== 'STOPPED') {
      console.log(`Task ${taskArn} is still ${task?.lastStatus}, stopping it`);
      await ecsClient.send(
        new StopTaskCommand({
          cluster: CLUSTER_ARN,
          task: taskArn,
          reason: 'Cleanup after completion',
        })
      );
    }

    console.log(`Task ${taskArn} cleanup completed`);
  } catch (error) {
    console.error(`Failed to cleanup task ${taskArn}:`, error);
    throw error;
  }
}

/**
 * Cleanup resources for a specific user's results
 */
export async function cleanupUserResults(userId: string): Promise<CleanupStats> {
  const startTime = Date.now();
  const stats: CleanupStats = {
    tasksStoppedCount: 0,
    s3ObjectsDeletedCount: 0,
    dynamoRecordsDeletedCount: 0,
    errors: [],
    duration: 0,
  };

  console.log(`Cleaning up results for user: ${userId}`);

  // Cleanup S3 objects for this user
  try {
    const prefix = `results/${userId}/`;
    let continuationToken: string | undefined;

    do {
      const listResponse = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: RESULTS_BUCKET,
          Prefix: prefix,
          ContinuationToken: continuationToken,
          MaxKeys: MAX_CLEANUP_BATCH_SIZE,
        })
      );

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        break;
      }

      for (const object of listResponse.Contents) {
        if (!object.Key) continue;

        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: RESULTS_BUCKET,
              Key: object.Key,
            })
          );
          stats.s3ObjectsDeletedCount++;
        } catch (error) {
          const errorMsg = `Failed to delete ${object.Key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          stats.errors.push(errorMsg);
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

  } catch (error) {
    const errorMsg = `Failed to cleanup S3 for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    stats.errors.push(errorMsg);
  }

  stats.duration = Date.now() - startTime;
  console.log(`User cleanup completed for ${userId}:`, stats);

  return stats;
}

/**
 * Schedule periodic cleanup (to be called by a cron job or scheduled task)
 */
export async function scheduleCleanup(intervalMs: number = 60 * 60 * 1000): Promise<void> {
  console.log(`Scheduling cleanup to run every ${intervalMs / 1000} seconds`);

  // Run initial cleanup
  await cleanupSandboxResources();

  // Schedule periodic cleanup
  setInterval(async () => {
    try {
      await cleanupSandboxResources();
    } catch (error) {
      console.error('Scheduled cleanup failed:', error);
    }
  }, intervalMs);
}
