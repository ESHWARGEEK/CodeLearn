import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

// Initialize SQS client
const client = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Queue URLs from environment variables
export const QUEUES = {
  AI_JOBS: process.env.SQS_QUEUE_AI_JOBS || '',
  AI_JOBS_DLQ: process.env.SQS_QUEUE_AI_JOBS_DLQ || '',
};

/**
 * Send a message to an SQS queue
 */
export async function sendMessage(queueUrl: string, messageBody: Record<string, unknown>) {
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(messageBody),
  });

  const response = await client.send(command);
  return response.MessageId;
}

/**
 * Send a message to the AI jobs queue
 */
export async function sendAIJobMessage(jobMessage: Record<string, unknown>) {
  return sendMessage(QUEUES.AI_JOBS, jobMessage);
}
