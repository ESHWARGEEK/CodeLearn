# CodeLearn AI Worker Service

The AI Worker Service is a containerized Node.js application that processes AI jobs from an SQS queue. It orchestrates different AI agents to handle various types of tasks in the CodeLearn platform.

## Architecture

The service consists of several key components:

### SQS Message Polling (`src/services/sqs-poller.ts`)

The `SQSPoller` class implements a robust message polling mechanism that:

- **Long Polling**: Uses SQS long polling (20 seconds by default) to efficiently receive messages
- **Batch Processing**: Processes up to 10 messages in parallel for optimal throughput
- **Error Handling**: Gracefully handles message parsing errors and processing failures
- **Automatic Retry**: Failed messages remain in the queue and are automatically retried
- **Dead Letter Queue**: Messages that exceed retry limits are moved to a DLQ
- **Graceful Shutdown**: Properly stops polling on SIGTERM/SIGINT signals

#### Key Features:

1. **Message Validation**: Uses Zod schemas to validate incoming job messages
2. **Parallel Processing**: Processes multiple messages concurrently using `Promise.allSettled`
3. **Visibility Timeout**: 5-minute visibility timeout prevents message duplication
4. **Automatic Cleanup**: Successfully processed messages are deleted from the queue
5. **Comprehensive Logging**: Detailed logging for monitoring and debugging

### Agent Orchestration (`src/services/agent-orchestrator.ts`)

Routes jobs to appropriate AI agents based on job type:

- **Curator Agent** (Llama 3.1): Learning path curation
- **Teacher Agent** (Claude 3.5): Code explanation and guidance  
- **Code Agent** (Claude 3.5): Template extraction and code generation
- **Mentor Agent** (Claude 3.5): Interactive mentoring and chat

### Job Status Updates (`src/services/job-status-updater.ts`)

Updates job status in DynamoDB throughout the processing lifecycle:

- `PENDING` → `IN_PROGRESS` → `COMPLETED`/`FAILED`/`RETRY`
- Stores processing results and error details
- Tracks retry counts and completion timestamps

## Job Types

The service handles five types of AI jobs:

1. **CURATE_LEARNING_PATH**: Generate personalized learning paths
2. **EXPLAIN_CODE**: Provide detailed code explanations
3. **EXTRACT_TEMPLATE**: Extract reusable components from GitHub repos
4. **INTEGRATE_CODE**: Integrate code snippets into existing codebases
5. **MENTOR_CHAT**: Interactive AI mentoring conversations

## Configuration

### Environment Variables

Required:
- `SQS_QUEUE_URL`: Main SQS queue URL for job messages
- `AWS_REGION`: AWS region for all services

Optional:
- `SQS_DLQ_URL`: Dead letter queue URL for failed messages
- `JOBS_TABLE_NAME`: DynamoDB table name for job status (defaults to `codelearn-jobs-{ENVIRONMENT}`)
- `ENVIRONMENT`: Environment name (dev/staging/prod)
- `LOG_LEVEL`: Logging level (debug/info/warn/error)

### SQS Configuration

The poller can be configured with:

```typescript
const sqsPoller = new SQSPoller({
  queueUrl: process.env.SQS_QUEUE_URL!,
  dlqUrl: process.env.SQS_DLQ_URL,
  region: process.env.AWS_REGION!,
  orchestrator,
  maxMessages: 10,           // Max messages per batch
  waitTimeSeconds: 20,       // Long polling duration
  visibilityTimeoutSeconds: 300, // 5 minutes
});
```

## Message Format

SQS messages must contain valid job objects:

```json
{
  "jobId": "unique-job-id",
  "userId": "user-id",
  "type": "curate_learning_path",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "retryCount": 0,
  "maxRetries": 3,
  "payload": {
    "technology": "React",
    "difficulty": "beginner"
  }
}
```

## Error Handling & Retry Logic

### Message Processing Errors

- **Validation Errors**: Invalid job schema → message remains in queue
- **Processing Failures**: Agent errors → message becomes visible again after timeout
- **Temporary Failures**: Network/rate limit errors → automatic retry with exponential backoff
- **Max Retries**: After 3 failed attempts → message moved to DLQ

### Retry Strategy

The orchestrator determines retry eligibility based on:

- Current retry count vs. max retries
- Error type (validation/auth errors are not retried)
- Temporary failure indicators (timeout, network, rate limit, etc.)

## Monitoring & Observability

### Logging

Structured JSON logging with Winston:

- Request/response details
- Processing times
- Error stack traces
- Job metadata

### Metrics

Key metrics to monitor:

- Messages processed per minute
- Processing time per job type
- Error rates by error type
- Queue depth and age of oldest message
- DLQ message count

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start in development mode
npm run dev

# Start production build
npm start
```

### Testing

The service includes comprehensive unit tests:

```bash
npm test                    # Run all tests
npm test -- --coverage     # Run with coverage report
npm test -- --watch        # Run in watch mode
```

### Docker

Build and run with Docker:

```bash
# Build image
docker build -t codelearn-ai-worker .

# Run container
docker run -e SQS_QUEUE_URL=your-queue-url \
           -e AWS_REGION=us-east-1 \
           codelearn-ai-worker
```

## Deployment

The service is designed to run on AWS ECS Fargate:

1. **Task Definition**: Configured in `infrastructure/lib/compute-stack.ts`
2. **Auto Scaling**: Scales based on SQS queue depth
3. **Health Checks**: Container health monitoring
4. **Secrets**: Environment variables from AWS Systems Manager

### Infrastructure Requirements

- **ECS Cluster**: Fargate cluster for container orchestration
- **SQS Queues**: Main queue and dead letter queue
- **DynamoDB**: Jobs table for status tracking
- **IAM Roles**: Permissions for SQS, DynamoDB, and Bedrock
- **CloudWatch**: Logging and monitoring

## Security

- **IAM Roles**: Least privilege access to AWS services
- **VPC**: Network isolation for container tasks
- **Secrets**: Sensitive configuration via AWS Systems Manager
- **Input Validation**: Zod schemas prevent malformed data processing

## Performance Considerations

- **Concurrency**: Processes up to 10 messages in parallel
- **Long Polling**: Reduces API calls and improves efficiency
- **Batch Processing**: Optimizes throughput vs. latency
- **Resource Limits**: Configurable CPU/memory limits in ECS
- **Auto Scaling**: Scales workers based on queue depth

## Troubleshooting

### Common Issues

1. **Messages not processing**: Check SQS permissions and queue configuration
2. **High error rates**: Review job validation and agent configurations
3. **Memory issues**: Adjust ECS task memory limits
4. **Timeout errors**: Increase visibility timeout or processing limits

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=debug
npm run dev
```

This provides detailed information about:
- Message reception and parsing
- Job routing and processing
- Agent invocations and responses
- Error details and stack traces