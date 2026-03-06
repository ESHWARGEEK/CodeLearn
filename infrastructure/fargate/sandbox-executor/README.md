# Fargate Sandbox Executor

This is the Fargate container for executing complex, long-running code in isolated environments.

## Overview

The Fargate sandbox executor provides:
- **Isolated execution**: Each task runs in its own container
- **Long timeouts**: Up to 30 minutes execution time
- **Resource limits**: 1 vCPU, 2GB RAM
- **Security**: No network access, isolated file system
- **SQS integration**: Can poll queue for async jobs

## Architecture

```
┌─────────────────────────────────────────┐
│  Next.js API                            │
│  POST /api/sandbox/execute              │
│  (environment: 'fargate')               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  ECS Fargate Task                       │
│  ┌───────────────────────────────────┐  │
│  │  Node.js 20 Container             │  │
│  │  - Express server                 │  │
│  │  - VM2 sandbox                    │  │
│  │  - SQS poller (optional)          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Usage

### Direct Execution (HTTP)

```typescript
// Start Fargate task
const response = await fetch('/api/sandbox/execute', {
  method: 'POST',
  body: JSON.stringify({
    code: 'console.log("Hello from Fargate!")',
    language: 'javascript',
    environment: 'fargate',
    timeout: 60000,
  }),
});

const { taskArn, status } = await response.json();

// Poll for status
const statusResponse = await fetch(`/api/sandbox/task/${encodeURIComponent(taskArn)}`);
const { status, output, errors } = await statusResponse.json();
```

### Queue-Based Execution (SQS)

The container can also poll an SQS queue for execution jobs:

```json
{
  "jobId": "job-123",
  "type": "execute",
  "payload": {
    "code": "console.log('Hello')",
    "language": "javascript",
    "timeout": 60000
  }
}
```

## Configuration

### Environment Variables

- `PORT`: HTTP server port (default: 3000)
- `EXECUTION_TIMEOUT`: Max execution time in ms (default: 1800000 = 30 min)
- `SQS_QUEUE_URL`: Optional SQS queue URL for job polling
- `AWS_REGION`: AWS region (default: us-east-1)

### Resource Limits

- **CPU**: 1 vCPU (1024 CPU units)
- **Memory**: 2 GB
- **Timeout**: 30 minutes
- **Storage**: Ephemeral (temporary)

## Security

### Network Isolation
- No public IP assigned
- No NAT gateway (no outbound internet)
- Security group denies all inbound traffic
- Isolated VPC subnets

### IAM Permissions
- Task role has minimal permissions
- Explicitly denies EC2, S3, DynamoDB access
- Only CloudWatch Logs allowed

### Code Execution
- Runs in VM2 sandbox
- No eval() or wasm
- Limited console access
- Temporary file system only

## Development

### Local Testing

```bash
cd infrastructure/fargate/sandbox-executor

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start

# Test execution
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"console.log(\"test\")","language":"javascript"}'
```

### Docker Build

```bash
# Build image
docker build -t fargate-sandbox-executor .

# Run container
docker run -p 3000:3000 fargate-sandbox-executor

# Test
curl http://localhost:3000/health
```

## Deployment

The Fargate task is deployed via AWS CDK:

```bash
cd infrastructure

# Deploy Fargate stack
cdk deploy CodeLearn-FargateSandbox-dev

# Get outputs
aws cloudformation describe-stacks \
  --stack-name codelearn-fargate-sandbox-dev \
  --query 'Stacks[0].Outputs'
```

### Required Outputs

Set these environment variables in your Next.js app:

```env
FARGATE_CLUSTER_ARN=arn:aws:ecs:us-east-1:123456789012:cluster/codelearn-sandbox-cluster
FARGATE_TASK_DEFINITION_ARN=arn:aws:ecs:us-east-1:123456789012:task-definition/codelearn-sandbox-executor:1
FARGATE_SECURITY_GROUP_ID=sg-0123456789abcdef0
FARGATE_SUBNET_IDS=subnet-abc123,subnet-def456
```

## Monitoring

### CloudWatch Logs

Logs are sent to `/ecs/codelearn-sandbox` log group:

```bash
# View logs
aws logs tail /ecs/codelearn-sandbox --follow
```

### Metrics

Monitor these CloudWatch metrics:
- `CPUUtilization`
- `MemoryUtilization`
- `TaskCount`
- `RunningTaskCount`

## Cost Optimization

### Auto-Scaling
- Tasks scale to zero when idle
- Scale up based on SQS queue depth
- Max 10 concurrent tasks

### Pricing
- **Fargate**: ~$0.04 per hour per task
- **CloudWatch Logs**: ~$0.50 per GB ingested
- **Data Transfer**: Minimal (no internet access)

**Estimated cost**: $20-50/month for 100-500 executions/day

## Troubleshooting

### Task Won't Start

Check:
1. VPC subnets exist and are isolated
2. Security group allows ECS task creation
3. Task definition is valid
4. IAM roles have correct permissions

### Execution Timeout

- Default timeout is 30 minutes
- Increase `EXECUTION_TIMEOUT` if needed
- Check CloudWatch logs for errors

### Out of Memory

- Current limit: 2 GB
- Increase `memoryLimitMiB` in CDK if needed
- Monitor `MemoryUtilization` metric

## Future Enhancements

- [ ] Support for Python, Go, Rust
- [ ] GPU support for ML workloads
- [ ] Persistent storage (EFS)
- [ ] WebSocket streaming output
- [ ] Multi-file project support
- [ ] Package installation (npm, pip)
