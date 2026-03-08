"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQSPoller = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const job_1 = require("../types/job");
const logger_1 = require("../utils/logger");
class SQSPoller {
    constructor(config) {
        this.logger = logger_1.Logger.getInstance();
        this.isPolling = false;
        this.config = {
            maxMessages: 10,
            waitTimeSeconds: 20,
            visibilityTimeoutSeconds: 300,
            ...config,
        };
        this.sqsClient = new client_sqs_1.SQSClient({
            region: this.config.region,
        });
    }
    async start() {
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
        this.poll();
    }
    async stop() {
        this.logger.info('Stopping SQS message polling');
        this.isPolling = false;
        if (this.pollingInterval) {
            clearTimeout(this.pollingInterval);
            this.pollingInterval = undefined;
        }
    }
    async poll() {
        if (!this.isPolling) {
            return;
        }
        try {
            const messages = await this.receiveMessages();
            if (messages && messages.length > 0) {
                this.logger.info(`Received ${messages.length} messages from SQS`);
                const processingPromises = messages.map(message => this.processMessage(message));
                await Promise.allSettled(processingPromises);
            }
            const delay = messages && messages.length > 0 ? 0 : 1000;
            this.pollingInterval = setTimeout(() => this.poll(), delay);
        }
        catch (error) {
            this.logger.error('Error during SQS polling:', error);
            this.pollingInterval = setTimeout(() => this.poll(), 5000);
        }
    }
    async receiveMessages() {
        const command = new client_sqs_1.ReceiveMessageCommand({
            QueueUrl: this.config.queueUrl,
            MaxNumberOfMessages: this.config.maxMessages,
            WaitTimeSeconds: this.config.waitTimeSeconds,
            VisibilityTimeout: this.config.visibilityTimeoutSeconds,
            MessageAttributeNames: ['All'],
        });
        const response = await this.sqsClient.send(command);
        return response.Messages;
    }
    async processMessage(message) {
        const messageId = message.MessageId;
        const receiptHandle = message.ReceiptHandle;
        if (!receiptHandle) {
            this.logger.error('Message missing receipt handle', { messageId });
            return;
        }
        try {
            this.logger.info('Processing SQS message', { messageId });
            if (!message.Body) {
                throw new Error('Message body is empty');
            }
            const messageBody = JSON.parse(message.Body);
            const job = job_1.JobSchema.parse(messageBody);
            this.logger.info('Processing job', {
                jobId: job.jobId,
                type: job.type,
                userId: job.userId,
            });
            const result = await this.config.orchestrator.processJob(job);
            this.logger.info('Job processed successfully', {
                jobId: job.jobId,
                status: result.status,
                processingTimeMs: result.processingTimeMs,
            });
            await this.deleteMessage(receiptHandle);
        }
        catch (error) {
            this.logger.error('Error processing message', {
                messageId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async deleteMessage(receiptHandle) {
        try {
            const command = new client_sqs_1.DeleteMessageCommand({
                QueueUrl: this.config.queueUrl,
                ReceiptHandle: receiptHandle,
            });
            await this.sqsClient.send(command);
            this.logger.debug('Message deleted from queue');
        }
        catch (error) {
            this.logger.error('Error deleting message from queue:', error);
        }
    }
}
exports.SQSPoller = SQSPoller;
//# sourceMappingURL=sqs-poller.js.map