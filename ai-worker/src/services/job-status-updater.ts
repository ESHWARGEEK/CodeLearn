import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { JobStatus } from '../types/job';
import { Logger } from '../utils/logger';

export class JobStatusUpdater {
  private dynamoClient: DynamoDBDocumentClient;
  private logger = Logger.getInstance();
  private jobsTableName: string;

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    this.dynamoClient = DynamoDBDocumentClient.from(client);
    this.jobsTableName = process.env.JOBS_TABLE_NAME || `codelearn-jobs-${process.env.ENVIRONMENT || 'dev'}`;
  }

  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    result?: any,
    error?: { message: string; code: string; details?: any }
  ): Promise<void> {
    try {
      const updateExpression: string[] = ['#status = :status', '#updatedAt = :updatedAt'];
      const expressionAttributeNames: Record<string, string> = {
        '#status': 'status',
        '#updatedAt': 'updatedAt',
      };
      const expressionAttributeValues: Record<string, any> = {
        ':status': status,
        ':updatedAt': new Date().toISOString(),
      };

      // Add result if provided
      if (result !== undefined) {
        updateExpression.push('#result = :result');
        expressionAttributeNames['#result'] = 'result';
        expressionAttributeValues[':result'] = result;
      }

      // Add error if provided
      if (error) {
        updateExpression.push('#error = :error');
        expressionAttributeNames['#error'] = 'error';
        expressionAttributeValues[':error'] = error;
      }

      // Add completion timestamp for completed/failed jobs
      if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
        updateExpression.push('#completedAt = :completedAt');
        expressionAttributeNames['#completedAt'] = 'completedAt';
        expressionAttributeValues[':completedAt'] = new Date().toISOString();
      }

      // Increment retry count for retry status
      if (status === JobStatus.RETRY) {
        updateExpression.push('#retryCount = #retryCount + :one');
        expressionAttributeNames['#retryCount'] = 'retryCount';
        expressionAttributeValues[':one'] = 1;
      }

      const command = new UpdateCommand({
        TableName: this.jobsTableName,
        Key: {
          PK: `JOB#${jobId}`,
          SK: 'METADATA',
        },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      });

      await this.dynamoClient.send(command);

      this.logger.debug('Job status updated', {
        jobId,
        status,
        hasResult: result !== undefined,
        hasError: error !== undefined,
      });

    } catch (error) {
      this.logger.error('Failed to update job status', {
        jobId,
        status,
        error: error instanceof Error ? error.message : String(error),
      });
      
      // Don't throw - we don't want to fail job processing due to status update issues
    }
  }

  async getJobStatus(jobId: string): Promise<{ status: JobStatus; result?: any; error?: any } | null> {
    try {
      const command = new GetCommand({
        TableName: this.jobsTableName,
        Key: {
          PK: `JOB#${jobId}`,
          SK: 'METADATA',
        },
      });

      const response = await this.dynamoClient.send(command);
      
      if (!response.Item) {
        return null;
      }

      return {
        status: response.Item.status,
        result: response.Item.result,
        error: response.Item.error,
      };

    } catch (error) {
      this.logger.error('Failed to get job status', {
        jobId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      return null;
    }
  }
}