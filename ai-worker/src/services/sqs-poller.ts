import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, Message } from '@aws-sdk/client-sqs';
import { AgentOrchestrator } from './agent-orchestrator';
import { JobSchema } from '../types/job';
import { Logger } from '../utils/logger';

interface SQSPollerConfig {
  queueUrl: string;
  dlqUrl?: string;
  region: string;
  orchestrator: AgentOrchestrator;
  maxMessages?: number;
  waitTimeSeconds?: number;
  visibilityTimeoutSeconds?: number;
}

export class SQSPoller {
  private sqsClient: SQSClient;
  private config: SQSPollerConfig;
  private logger = Logger.getInstance();
  private isPolling = false;
  private pollingInterval?: NodeJS.Timeout;

  constructor(config: SQSPollerConfig) {
    this.config = {
      maxMessages: 10,
      waitTimeSeconds: 20,
      visibilityTimeoutSeconds: 300, // 5 minutes
      ...config,
    };

    this.sqsClient = new SQSClient({
      region: this.config.region,
    });
  }

  async start(): Promise<void> {
    if (this.isPolling) {
      this.logger.warn('SQS Poller is already running');
      return;
    }

    this.isPolling = true;
    this.logger.info('Starting SQS message polling', {
      queueUrl: this.config.queueUrl,
      maxMessages: this.config.maxMessages,
      waitTimeSeconds: this.config.waitTimeSeconds,
    });

    // Start polling immediately
    this.poll();
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping SQS message polling');
    this.isPolling = false;

    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = undefined;
    }
  }

  private async poll(): Promise<void> {
    if (!this.isPolling) {
      return;
    }

    try {
      const messages = await this.receiveMessages();
      
      if (messages && messages.length > 0) {
        this.logger.info(`Received ${messages.length} messages from SQS`);
        
        // Process messages in parallel
        const processingPromises = messages.map(message => this.processMessage(message));
        await Promise.allSettled(processingPromises);
      }

      // Continue polling immediately if we received messages, otherwise wait a bit
      const delay = messages && messages.length > 0 ? 0 : 1000;
      this.pollingInterval = setTimeout(() => this.poll(), delay);

    } catch (error) {
      this.logger.error('Error during SQS polling:', error);
      
      // Wait before retrying on error
      this.pollingInterval = setTimeout(() => this.poll(), 5000);
    }
  }

  private async receiveMessages(): Promise<Message[] | undefined> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.config.queueUrl,
      MaxNumberOfMessages: this.config.maxMessages,
      WaitTimeSeconds: this.config.waitTimeSeconds,
      VisibilityTimeout: this.config.visibilityTimeoutSeconds,
      MessageAttributeNames: ['All'],
    });

    const response = await this.sqsClient.send(command);
    return response.Messages;
  }

  private async processMessage(message: Message): Promise<void> {
    const messageId = message.MessageId;
    const receiptHandle = message.ReceiptHandle;

    if (!receiptHandle) {
      this.logger.error('Message missing receipt handle', { messageId });
      return;
    }

    try {
      this.logger.info('Processing SQS message', { messageId });

      // Parse message body
      if (!message.Body) {
        throw new Error('Message body is empty');
      }

      const messageBody = JSON.parse(message.Body);
      
      // Validate job schema
      const job = JobSchema.parse(messageBody);
      
      this.logger.info('Processing job', {
        jobId: job.jobId,
        type: job.type,
        userId: job.userId,
      });

      // Process job through orchestrator
      const result = await this.config.orchestrator.processJob(job);

      this.logger.info('Job processed successfully', {
        jobId: job.jobId,
        status: result.status,
        processingTimeMs: result.processingTimeMs,
      });

      // Delete message from queue on success
      await this.deleteMessage(receiptHandle);

    } catch (error) {
      this.logger.error('Error processing message', {
        messageId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Message will become visible again after visibility timeout
      // SQS will automatically move it to DLQ after max retries
    }
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.config.queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.sqsClient.send(command);
      this.logger.debug('Message deleted from queue');

    } catch (error) {
      this.logger.error('Error deleting message from queue:', error);
      // Don't throw - message will be processed again
    }
  }
}