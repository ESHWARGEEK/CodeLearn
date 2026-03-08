// Test setup file for Jest
// This file is executed before each test file

// Mock environment variables for tests
process.env.AWS_REGION = 'us-east-1';
process.env.SQS_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue';
process.env.SQS_DLQ_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/test-dlq';
process.env.JOBS_TABLE_NAME = 'codelearn-jobs-test';
process.env.ENVIRONMENT = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests

// Increase test timeout for integration tests
jest.setTimeout(30000);