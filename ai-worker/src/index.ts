/**
 * CodeLearn AI Worker Service
 * 
 * This service processes AI jobs from SQS queue and orchestrates different AI agents:
 * - Curator Agent (Llama 3.1) - Learning path curation
 * - Teacher Agent (Claude 3.5) - Code explanation and guidance
 * - Code Agent (Claude 3.5) - Template extraction and code generation
 * - Mentor Agent (Claude 3.5) - Interactive mentoring and chat
 */

import { config } from 'dotenv';
import { SQSPoller } from './services/sqs-poller';
import { AgentOrchestrator } from './services/agent-orchestrator';
import { Logger } from './utils/logger';

// Load environment variables
config();

const logger = Logger.getInstance();

async function main() {
  try {
    logger.info('Starting CodeLearn AI Worker Service', {
      environment: process.env.ENVIRONMENT || 'development',
      region: process.env.AWS_REGION || 'us-east-1',
      nodeVersion: process.version,
    });

    // Validate required environment variables
    const requiredEnvVars = [
      'SQS_QUEUE_URL',
      'AWS_REGION',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Initialize agent orchestrator
    const orchestrator = new AgentOrchestrator();

    // Initialize SQS poller
    const sqsPoller = new SQSPoller({
      queueUrl: process.env.SQS_QUEUE_URL!,
      dlqUrl: process.env.SQS_DLQ_URL,
      region: process.env.AWS_REGION!,
      orchestrator,
    });

    // Start polling for messages
    await sqsPoller.start();

    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await sqsPoller.stop();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await sqsPoller.stop();
      process.exit(0);
    });

    // Keep the process alive
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    logger.info('AI Worker Service started successfully');

  } catch (error) {
    logger.error('Failed to start AI Worker Service:', error);
    process.exit(1);
  }
}

// Start the service
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});