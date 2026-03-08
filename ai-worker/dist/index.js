"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const sqs_poller_1 = require("./services/sqs-poller");
const agent_orchestrator_1 = require("./services/agent-orchestrator");
const logger_1 = require("./utils/logger");
(0, dotenv_1.config)();
const logger = logger_1.Logger.getInstance();
async function main() {
    try {
        logger.info('Starting CodeLearn AI Worker Service', {
            environment: process.env.ENVIRONMENT || 'development',
            region: process.env.AWS_REGION || 'us-east-1',
            nodeVersion: process.version,
        });
        const requiredEnvVars = [
            'SQS_QUEUE_URL',
            'AWS_REGION',
        ];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }
        const orchestrator = new agent_orchestrator_1.AgentOrchestrator();
        const sqsPoller = new sqs_poller_1.SQSPoller({
            queueUrl: process.env.SQS_QUEUE_URL,
            dlqUrl: process.env.SQS_DLQ_URL,
            region: process.env.AWS_REGION,
            orchestrator,
        });
        await sqsPoller.start();
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
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught exception:', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });
        logger.info('AI Worker Service started successfully');
    }
    catch (error) {
        logger.error('Failed to start AI Worker Service:', error);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map