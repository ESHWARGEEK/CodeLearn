# Task 7.1: Lambda Function for Quick Execution - Deployment Guide

## Overview

Task 7.1 creates a Lambda function for executing user code in an isolated sandbox environment. This enables quick code previews (<15 seconds) with security restrictions.

## What Was Created

### 1. Lambda Function Handler
**File**: `infrastructure/lambda/sandbox-executor/index.ts`
- Executes JavaScript/TypeScript code in VM2 sandbox
- Captures console output (log, error, warn, info)
- Enforces 15-second timeout
- Returns execution results with timing

### 2. CDK Infrastructure
**File**: `infrastructure/lib/sandbox-stack.ts`
- Defines Lambda function with Node.js 20 runtime
- Configures 512 MB memory and 15-second timeout
- Denies network access for security
- Sets up CloudWatch logging (7-day retention)

### 3. Lambda Executor Utility
**File**: `lib/sandbox/lambda-executor.ts`
- Invokes Lambda function from Next.js API
- Handles AWS SDK integration
- Provides error handling and response parsing

### 4. Updated API Route
**File**: `app/api/sandbox/execute/route.ts`
- Integrates Lambda executor
- Falls back to mock execution if Lambda unavailable
- Validates language support (JavaScript/TypeScript only)

### 5. Tests
- **Unit Tests**: `tests/unit/sandbox/lambda-executor.test.ts`
- **Integration Tests**: `tests/integration/sandbox-execute.test.ts`

## Deployment Steps

### Prerequisites
1. AWS CLI configured with credentials
2. AWS CDK installed globally: `npm install -g aws-cdk`
3. Node.js 20 installed

### Step 1: Install Dependencies
```bash
# Install project dependencies
npm install

# Install Lambda function dependencies
cd infrastructure/lambda/sandbox-executor
npm install
cd ../../..
```

### Step 2: Deploy Lambda Function
```bash
cd infrastructure

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy sandbox stack
cdk deploy CodeLearn-Sandbox-dev

# Note the output values:
# - ExecutorFunctionArn
# - ExecutorFunctionName
```

### Step 3: Configure Environment Variables
Add to `.env.local`:
```env
SANDBOX_EXECUTOR_FUNCTION_NAME=codelearn-sandbox-executor
AWS_REGION=us-east-1
```

Add to Vercel environment variables:
```
SANDBOX_EXECUTOR_FUNCTION_NAME=codelearn-sandbox-executor
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
```

### Step 4: Test Locally
```bash
# Run unit tests
npm run test -- tests/unit/sandbox/lambda-executor.test.ts

# Run integration tests
npm run test -- tests/integration/sandbox-execute.test.ts

# Start dev server
npm run dev

# Test API endpoint
curl -X POST http://localhost:3000/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello, World!\");",
    "language": "javascript"
  }'
```

### Step 5: Deploy to Vercel
```bash
# Commit changes
git add .
git commit -m "feat: add Lambda function for sandbox execution (Task 7.1)"

# Push to trigger Vercel deployment
git push origin main
```

## Security Configuration

### Lambda Function Security
- **No Network Access**: EC2 permissions denied
- **Isolated Execution**: VM2 sandbox per invocation
- **Resource Limits**: 512 MB memory, 15-second timeout
- **No Eval**: eval() and Function() constructor disabled
- **No WebAssembly**: WASM disabled

### IAM Permissions Required
The Lambda execution role needs:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

The Next.js API needs Lambda invoke permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:*:*:function:codelearn-sandbox-executor"
    }
  ]
}
```

## Testing

### Manual Testing
1. Open ProjectWorkspace component
2. Write JavaScript code: `console.log("Hello, World!");`
3. Click "Run" button
4. Verify output appears in console panel
5. Test error handling: `throw new Error("test");`
6. Verify error appears in console

### Automated Testing
```bash
# Run all tests
npm run test

# Run specific test suites
npm run test -- tests/unit/sandbox/lambda-executor.test.ts
npm run test -- tests/integration/sandbox-execute.test.ts
```

## Monitoring

### CloudWatch Logs
- Log Group: `/aws/lambda/codelearn-sandbox-executor`
- Retention: 7 days
- View logs: AWS Console → CloudWatch → Log Groups

### Metrics to Monitor
- **Invocations**: Number of executions
- **Duration**: Average execution time
- **Errors**: Failed executions
- **Throttles**: Rate limit hits
- **Concurrent Executions**: Active instances

### Alarms (Recommended)
```bash
# Create alarm for high error rate
aws cloudwatch put-metric-alarm \
  --alarm-name codelearn-sandbox-errors \
  --alarm-description "Alert on high Lambda error rate" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=codelearn-sandbox-executor
```

## Cost Estimation

### AWS Lambda Pricing
- **Free Tier**: 1M requests/month, 400,000 GB-seconds/month
- **Beyond Free Tier**: $0.20 per 1M requests + $0.0000166667 per GB-second

### Example Usage
- 10,000 executions/month
- Average duration: 1 second
- Memory: 512 MB (0.5 GB)
- **Cost**: ~$0.08/month (within free tier)

### Optimization Tips
1. Use caching for repeated code executions
2. Monitor cold start times
3. Adjust memory based on actual usage
4. Set up budget alerts in AWS

## Troubleshooting

### Lambda Not Available
**Symptom**: API falls back to mock execution
**Solution**: 
1. Check `SANDBOX_EXECUTOR_FUNCTION_NAME` environment variable
2. Verify Lambda function is deployed
3. Check AWS credentials are configured

### Timeout Errors
**Symptom**: Execution exceeds 15 seconds
**Solution**:
1. Optimize user code
2. Consider using Fargate for long-running tasks
3. Increase timeout (max 15 minutes for Lambda)

### Permission Denied
**Symptom**: Lambda invocation fails with 403
**Solution**:
1. Verify IAM role has `lambda:InvokeFunction` permission
2. Check Lambda function ARN is correct
3. Verify AWS credentials are valid

### VM2 Errors
**Symptom**: Sandbox creation fails
**Solution**:
1. Check Node.js version (must be 20)
2. Verify vm2 package is installed
3. Review Lambda logs for detailed error

## Next Steps

After completing Task 7.1:
1. ✅ Lambda function deployed and tested
2. ⏭️ Task 7.2: Set up Fargate task for complex execution
3. ⏭️ Task 7.3: Implement POST /api/sandbox/execute (already done)
4. ⏭️ Task 7.4: Add execution result handling
5. ⏭️ Task 7.5: Implement timeout enforcement
6. ⏭️ Task 7.6: Add resource limit enforcement
7. ⏭️ Task 7.7: Create automatic cleanup logic

## References

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [VM2 Documentation](https://github.com/patriksimek/vm2)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- Design Document: `.kiro/specs/codelearn-platform/design.md`
- Requirements: `.kiro/specs/codelearn-platform/requirements.md`
