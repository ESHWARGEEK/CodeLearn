import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { executeCode } from './executor';

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const QUEUE_URL = process.env.SQS_QUEUE_URL || '';
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_MESSAGES = 1; // Process one at a time

interface SQSJobMessage {
  jobId: string;
  type: 'execute';
  payload: {
    code: string;
    language: 'javascript' | 'typescript';
    timeout?: number;
  };
}

/**
 * Poll SQS queue for execution jobs
 */
export async function pollSQSQueue(): Promise<void> {
  if (!QUEUE_URL) {
    console.error('SQS_QUEUE_URL not configured');
    return;
  }

  console.log(`Starting SQS polling on queue: ${QUEUE_URL}`);

  // Continuous polling loop
  while (true) {
    try {
      // Receive messages from queue
      const command = new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: MAX_MESSAGES,
        WaitTimeSeconds: 20, // Long polling
        VisibilityTimeout: 1800, // 30 minutes
      });

      const response = await sqsClient.send(command);

      if (response.Messages && response.Messages.length > 0) {
        for (const message of response.Messages) {
          await processMessage(message);
        }
      }
    } catch (error) {
      console.error('SQS polling error:', error);
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
  }
}

/**
 * Process a single SQS message
 */
async function processMessage(message: any): Promise<void> {
  try {
    if (!message.Body) {
      console.error('Message has no body');
      return;
    }

    const job: SQSJobMessage = JSON.parse(message.Body);
    console.log(`Processing job: ${job.jobId}`);

    // Execute the code
    const result = await executeCode(job.payload);

    console.log(`Job ${job.jobId} completed:`, {
      success: result.success,
      executionTime: result.executionTime,
    });

    // TODO: Update job status in DynamoDB
    // This will be implemented when we add the jobs table integration

    // Delete message from queue
    if (message.ReceiptHandle) {
      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle,
        })
      );
      console.log(`Deleted message for job: ${job.jobId}`);
    }
  } catch (error) {
    console.error('Error processing message:', error);
    // Message will become visible again after visibility timeout
    // and can be retried or moved to DLQ
  }
}
