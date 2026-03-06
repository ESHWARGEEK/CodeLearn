# Task 7.2: Fargate Sandbox Deployment Guide

## Overview

This guide covers the deployment of the Fargate sandbox executor for complex, long-running code execution.

## What Was Implemented

### 1. Infrastructure (AWS CDK)

**FargateSandboxStack** (`infrastructure/lib/fargate-sandbox-stack.ts`):
- VPC with isolated subnets (no internet access)
- ECS Cluster for running Fargate tasks
- Fargate Task Definition (1 vCPU, 2GB RAM)
- Security Group (deny all inbound/outbound)
- IAM roles with minimal permissions
- CloudWatch log group

### 2. Fargate Container

**Docker Container** (`infrastructure/fargate/sandbox-executor/`):
- Node.js 20 Alpine base image
- Express HTTP server
- VM2 sandbox for code execution
- SQS queue poller (optional)
- Health check endpoint
- Non-root user for security

**Key Files**:
- `Dockerfile`: Container definition
- `src/index.ts`: Express server and entry point
- `src/executor.ts`: Code execution logic with VM2
- `src/queue-poller.ts`: SQS integration for async jobs
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration

### 3. Next.js Integration

**Fargate Executor** (`lib/sandbox/fargate-executor.ts`):
- `executeFargate()`: Start Fargate task
- `getTaskStatus()`: Poll task status
- `stopTask()`: Cancel running task
- `isFargateAvailable()`: Check configuration

**API Routes**:
- `POST /api/sandbox/execute`: Execute code (supports `environment: 'fargate'`)
- `GET /api/sandbox/task/[taskArn]`: Get task status
- `DELETE /api/sandbox/task/[taskArn]`: Stop task

### 4. Tests

**Unit Tests** (`tests/unit/sandbox/fargate-executor.test.ts`):
- ✅ Start Fargate task
- ✅ Get task status
- ✅ Stop task
- ✅ Handle errors
- ✅ Configuration validation

**Integration Tests** (`tests/integration/sandbox-fargate.test.ts`):
- ✅ Execute JavaScript code
- ✅ Execute TypeScript code
- ✅ Poll task status
- ✅ Stop running task
- ✅ Environment selection (Lambda vs Fargate)

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
│  AWS ECS (Fargate)                      │
│  ┌───────────────────────────────────┐  │
│  │  Task: codelearn-sandbox-executor │  │
│  │  - 1 vCPU, 2GB RAM                │  │
│  │  - 30 min timeout                 │  │
│  │  - Isolated VPC                   │  │
│  │  - No internet access             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  CloudWatch Logs                        │
│  /ecs/codelearn-sandbox                 │
└─────────────────────────────────────────┘
```

## Deployment Steps

### Step 1: Deploy Infrastructure

```bash
cd infrastructure

# Install dependencies
npm install

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy Fargate stack
cdk deploy CodeLearn-FargateSandbox-dev

# Get outputs
aws cloudformation describe-stacks \
  --stack-name codelearn-fargate-sandbox-dev \
  --query 'Stacks[0].Outputs'
```

### Step 2: Configure Environment Variables

Add these to your `.env.local`:

```env
# Fargate Configuration
FARGATE_CLUSTER_ARN=arn:aws:ecs:us-east-1:123456789012:cluster/codelearn-sandbox-cluster
FARGATE_TASK_DEFINITION_ARN=arn:aws:ecs:us-east-1:123456789012:task-definition/codelearn-sandbox-executor:1
FARGATE_SECURITY_GROUP_ID=sg-0123456789abcdef0
FARGATE_SUBNET_IDS=subnet-abc123,subnet-def456

# AWS Region
AWS_REGION=us-east-1
```

### Step 3: Build and Push Container

The CDK will automatically build and push the container image during deployment. If you need to manually build:

```bash
cd infrastructure/fargate/sandbox-executor

# Install dependencies
npm install

# Build TypeScript
npm run build

# Build Docker image
docker build -t fargate-sandbox-executor .

# Test locally
docker run -p 3000:3000 fargate-sandbox-executor

# Test health check
curl http://localhost:3000/health
```

### Step 4: Test Deployment

```bash
# Run unit tests
npm test tests/unit/sandbox/fargate-executor.test.ts

# Run integration tests (requires deployed infrastructure)
npm test tests/integration/sandbox-fargate.test.ts
```

### Step 5: Verify in AWS Console

1. **ECS Console**:
   - Navigate to ECS → Clusters
   - Find `codelearn-sandbox-cluster`
   - Verify task definition exists

2. **VPC Console**:
   - Navigate to VPC → Your VPCs
   - Find `codelearn-sandbox-vpc`
   - Verify isolated subnets

3. **CloudWatch Console**:
   - Navigate to CloudWatch → Log groups
   - Find `/ecs/codelearn-sandbox`
   - Verify logs are being written

## Usage Examples

### Execute Code in Fargate

```typescript
// Frontend component
const executeInFargate = async (code: string) => {
  // Start Fargate task
  const response = await fetch('/api/sandbox/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      language: 'javascript',
      environment: 'fargate',
      timeout: 120000, // 2 minutes
    }),
  });

  const { data } = await response.json();
  const { taskArn } = data;

  // Poll for status
  const pollStatus = async () => {
    const statusResponse = await fetch(
      `/api/sandbox/task/${encodeURIComponent(taskArn)}`
    );
    const { data: statusData } = await statusResponse.json();

    if (statusData.status === 'STOPPED') {
      return statusData;
    }

    // Poll every 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    return pollStatus();
  };

  const result = await pollStatus();
  return result;
};
```

### Stop Running Task

```typescript
const stopTask = async (taskArn: string) => {
  const response = await fetch(
    `/api/sandbox/task/${encodeURIComponent(taskArn)}`,
    { method: 'DELETE' }
  );

  const { data } = await response.json();
  return data.stopped;
};
```

## Security Features

### Network Isolation
- ✅ No public IP assigned
- ✅ No NAT gateway (no outbound internet)
- ✅ Security group denies all traffic
- ✅ Isolated VPC subnets

### IAM Permissions
- ✅ Task role has minimal permissions
- ✅ Explicitly denies EC2, S3, DynamoDB
- ✅ Only CloudWatch Logs allowed

### Code Execution
- ✅ VM2 sandbox isolation
- ✅ No eval() or wasm
- ✅ Limited console access
- ✅ Temporary file system only
- ✅ Non-root user

### Resource Limits
- ✅ 1 vCPU limit
- ✅ 2GB RAM limit
- ✅ 30 minute timeout
- ✅ Ephemeral storage only

## Cost Optimization

### Pricing
- **Fargate**: $0.04048 per vCPU per hour
- **Fargate**: $0.004445 per GB per hour
- **Total per task**: ~$0.04 per hour

### Cost Estimates
- **100 executions/day** (5 min avg): ~$10/month
- **500 executions/day** (5 min avg): ~$50/month
- **1000 executions/day** (5 min avg): ~$100/month

### Optimization Strategies
1. **Auto-scaling**: Tasks scale to zero when idle
2. **Timeout limits**: 30 minute max prevents runaway costs
3. **No NAT gateway**: Saves $32/month
4. **Spot instances**: Not available for Fargate (future: use EC2 Spot)

## Monitoring

### CloudWatch Metrics

Monitor these metrics:
- `CPUUtilization`: Should stay under 80%
- `MemoryUtilization`: Should stay under 80%
- `TaskCount`: Number of running tasks
- `RunningTaskCount`: Active executions

### CloudWatch Alarms

Set up alarms for:
- High CPU utilization (>80%)
- High memory utilization (>80%)
- Task failures (exit code != 0)
- Long-running tasks (>25 minutes)

### Logs

View logs:
```bash
# Tail logs
aws logs tail /ecs/codelearn-sandbox --follow

# Filter by task
aws logs tail /ecs/codelearn-sandbox --follow --filter-pattern "task-abc123"
```

## Troubleshooting

### Task Won't Start

**Symptoms**: API returns error, no task created

**Solutions**:
1. Check VPC and subnets exist
2. Verify security group allows ECS
3. Check IAM roles have correct permissions
4. Verify task definition is valid

```bash
# Describe task definition
aws ecs describe-task-definition \
  --task-definition codelearn-sandbox-executor

# Check cluster
aws ecs describe-clusters \
  --clusters codelearn-sandbox-cluster
```

### Execution Timeout

**Symptoms**: Task stops after 30 minutes

**Solutions**:
1. Increase `EXECUTION_TIMEOUT` environment variable
2. Optimize code to run faster
3. Consider breaking into smaller tasks

### Out of Memory

**Symptoms**: Task stops with exit code 137

**Solutions**:
1. Increase `memoryLimitMiB` in CDK (currently 2048)
2. Optimize code memory usage
3. Monitor `MemoryUtilization` metric

```typescript
// In fargate-sandbox-stack.ts
this.taskDefinition = new ecs.FargateTaskDefinition(
  this,
  'SandboxTaskDefinition',
  {
    cpu: 1024,
    memoryLimitMiB: 4096, // Increase to 4GB
    // ...
  }
);
```

### No Logs Appearing

**Symptoms**: CloudWatch log group empty

**Solutions**:
1. Check task execution role has CloudWatch permissions
2. Verify log group exists
3. Check container is writing to stdout/stderr

```bash
# Check log group
aws logs describe-log-groups \
  --log-group-name-prefix /ecs/codelearn-sandbox
```

## Next Steps

### Task 7.3: Implement POST /api/sandbox/execute
- ✅ Already implemented with Fargate support
- ✅ Environment selection (lambda vs fargate)
- ✅ Error handling

### Task 7.4: Add execution result handling
- ✅ Task status polling
- ✅ Output capture
- ✅ Error reporting

### Task 7.5: Implement timeout enforcement
- ✅ 30 minute timeout in Fargate
- ✅ Configurable via environment variable
- ✅ Automatic task termination

### Task 7.6: Add resource limit enforcement
- ✅ 1 vCPU limit
- ✅ 2GB RAM limit
- ✅ Ephemeral storage only

### Task 7.7: Create automatic cleanup logic
- ✅ Containers destroyed after execution
- ✅ Temporary files cleaned up
- ✅ No persistent state

## Completion Checklist

- [x] Create Fargate infrastructure stack
- [x] Build Docker container with Node.js 20
- [x] Implement VM2 sandbox executor
- [x] Add SQS queue poller
- [x] Create Fargate executor utility
- [x] Update API routes for Fargate support
- [x] Add task status polling endpoint
- [x] Add task stop endpoint
- [x] Write unit tests
- [x] Write integration tests
- [x] Create deployment documentation
- [x] Add security features
- [x] Configure resource limits
- [x] Set up CloudWatch logging
- [x] Add health check endpoint

## Status

✅ **Task 7.2 Complete**

The Fargate sandbox executor is fully implemented and ready for deployment. All code, tests, and documentation are in place.

**Next**: Deploy to AWS and configure environment variables in Vercel.
