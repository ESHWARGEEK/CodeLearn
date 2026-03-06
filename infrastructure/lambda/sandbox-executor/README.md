# Sandbox Executor Lambda Function

## Overview

This Lambda function executes user-submitted JavaScript and TypeScript code in an isolated sandbox environment for quick previews and testing.

## Features

- **Isolated Execution**: Uses VM2 to create a secure sandbox with no access to the host system
- **Console Capture**: Captures console.log, console.error, console.warn, and console.info output
- **Timeout Protection**: Enforces maximum execution time of 15 seconds
- **Error Handling**: Catches and reports runtime errors with stack traces
- **No Network Access**: Completely isolated from network resources

## Configuration

- **Runtime**: Node.js 20
- **Memory**: 512 MB
- **Timeout**: 15 seconds
- **Concurrency**: 100 concurrent executions

## Security

### Restrictions
- No network access (EC2 permissions denied)
- No eval() or Function() constructor
- No WebAssembly
- Read-only file system
- Resource limits enforced

### Isolation
- Each invocation runs in a separate VM2 sandbox
- No shared state between executions
- Automatic cleanup after execution

## Input Format

```json
{
  "code": "console.log('Hello, World!');",
  "language": "javascript",
  "timeout": 15000
}
```

## Output Format

### Success
```json
{
  "success": true,
  "output": "Hello, World!\n",
  "executionTime": 123
}
```

### Error
```json
{
  "success": false,
  "errors": ["SyntaxError: Unexpected token"],
  "executionTime": 45
}
```

## Deployment

### Prerequisites
- AWS CDK installed
- Node.js 20 installed
- AWS credentials configured

### Deploy
```bash
cd infrastructure
npm install
cdk deploy CodeLearn-Sandbox-dev
```

### Environment Variables
Set in Next.js application:
```
SANDBOX_EXECUTOR_FUNCTION_NAME=codelearn-sandbox-executor
AWS_REGION=us-east-1
```

## Testing

### Local Testing
```bash
cd infrastructure/lambda/sandbox-executor
npm install
npm test
```

### Integration Testing
```bash
# From project root
npm run test:integration -- tests/integration/sandbox-execute.test.ts
```

## Monitoring

### CloudWatch Logs
- Log Group: `/aws/lambda/codelearn-sandbox-executor`
- Retention: 7 days

### Metrics
- Invocations
- Duration
- Errors
- Throttles
- Concurrent Executions

## Cost Estimation

- **Free Tier**: 1M requests/month, 400,000 GB-seconds/month
- **Beyond Free Tier**: ~$0.20 per 1M requests
- **Memory Cost**: ~$0.0000166667 per GB-second

### Example
- 10,000 executions/month
- Average duration: 1 second
- Memory: 512 MB (0.5 GB)
- Cost: ~$0.08/month (within free tier)

## Limitations

- Maximum execution time: 15 seconds
- Maximum memory: 512 MB
- No network access
- JavaScript/TypeScript only
- No file system writes

## Future Enhancements

- [ ] Support for Python execution
- [ ] Support for Go execution
- [ ] HTML/CSS preview generation
- [ ] Package installation (npm packages)
- [ ] Persistent file system (EFS)
- [ ] WebSocket support for streaming output
