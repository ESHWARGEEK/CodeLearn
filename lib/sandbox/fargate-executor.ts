/**
 * Fargate Executor Utility
 * 
 * Runs ECS Fargate tasks for complex, long-running code execution
 */

import {
  ECSClient,
  RunTaskCommand,
  DescribeTasksCommand,
  StopTaskCommand,
} from '@aws-sdk/client-ecs';

// Allow dependency injection for testing
let ecsClientInstance: ECSClient | null = null;

export function getECSClient(): ECSClient {
  if (!ecsClientInstance) {
    ecsClientInstance = new ECSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }
  return ecsClientInstance;
}

// For testing purposes
export function setECSClient(client: ECSClient | null) {
  ecsClientInstance = client;
}

const CLUSTER_ARN = process.env.FARGATE_CLUSTER_ARN || '';
const TASK_DEFINITION_ARN = process.env.FARGATE_TASK_DEFINITION_ARN || '';
const SECURITY_GROUP_ID = process.env.FARGATE_SECURITY_GROUP_ID || '';
const SUBNET_IDS = process.env.FARGATE_SUBNET_IDS?.split(',') || [];

export interface ExecuteRequest {
  code: string;
  language: 'javascript' | 'typescript';
  timeout?: number;
}

export interface ExecuteResponse {
  success: boolean;
  taskArn?: string;
  output?: string;
  errors?: string[];
  executionTime?: number;
  status?: 'PENDING' | 'RUNNING' | 'STOPPED';
}

const MAX_FARGATE_TIMEOUT = 1800000; // 30 minutes

/**
 * Execute code in Fargate task with timeout enforcement
 */
export async function executeFargate(
  request: ExecuteRequest
): Promise<ExecuteResponse> {
  try {
    const ecsClient = getECSClient();

    // Enforce maximum timeout of 30 minutes for Fargate
    const effectiveTimeout = Math.min(
      request.timeout || MAX_FARGATE_TIMEOUT,
      MAX_FARGATE_TIMEOUT
    );

    // Prepare environment variables for the task
    const environment = [
      { name: 'CODE', value: Buffer.from(request.code).toString('base64') },
      { name: 'LANGUAGE', value: request.language },
      { name: 'TIMEOUT', value: String(effectiveTimeout) },
    ];

    // Run the Fargate task
    const command = new RunTaskCommand({
      cluster: CLUSTER_ARN,
      taskDefinition: TASK_DEFINITION_ARN,
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: SUBNET_IDS,
          securityGroups: [SECURITY_GROUP_ID],
          assignPublicIp: 'DISABLED', // No public IP for security
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: 'sandbox-executor',
            environment,
          },
        ],
      },
    });

    const response = await ecsClient.send(command);

    if (!response.tasks || response.tasks.length === 0) {
      return {
        success: false,
        errors: ['Failed to start Fargate task'],
      };
    }

    const task = response.tasks[0];
    
    if (!task || !task.taskArn) {
      return {
        success: false,
        errors: ['Task ARN not returned'],
      };
    }

    const taskArn = task.taskArn;

    // Start timeout monitoring in background
    monitorTaskTimeout(taskArn, effectiveTimeout).catch(error => {
      console.error('Timeout monitoring error:', error);
    });

    // Return task ARN for status polling
    return {
      success: true,
      taskArn,
      status: 'PENDING',
    };
  } catch (error) {
    console.error('Fargate execution failed:', error);
    return {
      success: false,
      errors: [
        error instanceof Error
          ? error.message
          : 'Unknown error starting Fargate task',
      ],
    };
  }
}

/**
 * Monitor task and enforce timeout by stopping it if it exceeds the limit
 */
async function monitorTaskTimeout(
  taskArn: string,
  timeout: number
): Promise<void> {
  const startTime = Date.now();
  const checkInterval = 5000; // Check every 5 seconds

  const intervalId = setInterval(async () => {
    const elapsed = Date.now() - startTime;

    // Check if timeout exceeded
    if (elapsed >= timeout) {
      console.warn(`Task ${taskArn} exceeded timeout of ${timeout}ms, stopping task`);
      clearInterval(intervalId);
      
      // Stop the task
      const stopped = await stopTask(taskArn);
      if (stopped) {
        console.log(`Task ${taskArn} stopped due to timeout`);
      } else {
        console.error(`Failed to stop task ${taskArn} after timeout`);
      }
      return;
    }

    // Check if task is still running
    try {
      const status = await getTaskStatus(taskArn);
      if (status.status === 'STOPPED') {
        // Task completed or failed, stop monitoring
        clearInterval(intervalId);
      }
    } catch (error) {
      console.error('Error checking task status:', error);
      clearInterval(intervalId);
    }
  }, checkInterval);
}

/**
 * Get status of a running Fargate task
 */
export async function getTaskStatus(
  taskArn: string
): Promise<ExecuteResponse> {
  try {
    const ecsClient = getECSClient();

    const command = new DescribeTasksCommand({
      cluster: CLUSTER_ARN,
      tasks: [taskArn],
    });

    const response = await ecsClient.send(command);

    if (!response.tasks || response.tasks.length === 0) {
      return {
        success: false,
        errors: ['Task not found'],
      };
    }

    const task = response.tasks[0];
    
    if (!task) {
      return {
        success: false,
        errors: ['Task data not available'],
      };
    }
    
    const lastStatus = task.lastStatus as 'PENDING' | 'RUNNING' | 'STOPPED';

    // If task is stopped, check exit code and stop reason
    if (lastStatus === 'STOPPED') {
      const container = task.containers?.[0];
      const exitCode = container?.exitCode;
      const stopReason = task.stoppedReason || '';

      // Check if task was stopped due to timeout
      if (stopReason.includes('timeout') || stopReason.includes('User requested cancellation')) {
        return {
          success: false,
          status: 'STOPPED',
          errors: ['Execution timeout: Task exceeded maximum execution time'],
        };
      }

      if (exitCode === 0) {
        return {
          success: true,
          status: 'STOPPED',
          output: 'Task completed successfully',
        };
      } else {
        return {
          success: false,
          status: 'STOPPED',
          errors: [`Task failed with exit code: ${exitCode}`],
        };
      }
    }

    return {
      success: true,
      taskArn,
      status: lastStatus,
    };
  } catch (error) {
    console.error('Failed to get task status:', error);
    return {
      success: false,
      errors: [
        error instanceof Error
          ? error.message
          : 'Unknown error getting task status',
      ],
    };
  }
}

/**
 * Stop a running Fargate task
 */
export async function stopTask(taskArn: string): Promise<boolean> {
  try {
    const ecsClient = getECSClient();

    const command = new StopTaskCommand({
      cluster: CLUSTER_ARN,
      task: taskArn,
      reason: 'User requested cancellation',
    });

    await ecsClient.send(command);
    return true;
  } catch (error) {
    console.error('Failed to stop task:', error);
    return false;
  }
}

/**
 * Check if Fargate execution is available
 */
export function isFargateAvailable(): boolean {
  // Read from process.env directly to support dynamic testing
  const clusterArn = process.env.FARGATE_CLUSTER_ARN || '';
  const taskDefinitionArn = process.env.FARGATE_TASK_DEFINITION_ARN || '';
  const securityGroupId = process.env.FARGATE_SECURITY_GROUP_ID || '';
  const subnetIds = process.env.FARGATE_SUBNET_IDS?.split(',') || [];
  
  return !!(
    clusterArn &&
    taskDefinitionArn &&
    securityGroupId &&
    subnetIds.length > 0
  );
}
