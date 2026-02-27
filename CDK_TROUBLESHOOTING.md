# CDK Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "--app is required either in command-line, in cdk.json or in ~/.cdk.json"

**Error:**

```
--app is required either in command-line, in cdk.json or in ~/.cdk.json
```

**Cause:** You're running CDK commands from the wrong directory.

**Solution:** CDK commands must be run from the directory where `cdk.json` is located.

```bash
# ❌ WRONG - Running from infrastructure/ subdirectory
cd codelearn/infrastructure
npx cdk synth  # This will fail!

# ✅ CORRECT - Running from codelearn/ directory (where cdk.json is)
cd codelearn
npx cdk synth  # This works!
```

**Why?** The `cdk.json` file contains the configuration that tells CDK where to find your app entry point (`infrastructure/bin/cdk-app.ts`). CDK looks for this file in the current directory.

---

### Issue 2: "Cannot find module 'infrastructure/bin/cdk-app.ts'"

**Error:**

```
Cannot find module 'D:\Vibe_coding\codelearn\infrastructure\bin\cdk-app.ts'
```

**Cause:** Dependencies not installed or wrong directory.

**Solution:**

```bash
# Make sure you're in the codelearn/ directory
cd codelearn

# Install dependencies
npm install

# Try again
npx cdk synth
```

---

### Issue 3: "Unable to resolve AWS account to use"

**Error:**

```
Unable to resolve AWS account to use. It must be either configured when you define your CDK Stack, or through the environment
```

**Cause:** AWS credentials not configured.

**Solution:**

```bash
# Configure AWS credentials
aws configure

# Enter your credentials when prompted:
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: wJalr...
# Default region name: us-east-1
# Default output format: json

# Verify credentials
aws sts get-caller-identity
```

---

### Issue 4: "This CDK CLI is not compatible with the CDK library used by your application"

**Error:**

```
This CDK CLI is not compatible with the CDK library used by your application. Please upgrade the CLI to the latest version.
```

**Solution:**

```bash
# Update CDK CLI globally
npm install -g aws-cdk@latest

# Update CDK dependencies in project
cd codelearn
npm install aws-cdk-lib@latest

# Verify versions match
cdk --version
```

---

### Issue 5: "Need to perform AWS calls for account XXX, but no credentials have been configured"

**Error:**

```
Need to perform AWS calls for account 123456789012, but no credentials have been configured
```

**Cause:** AWS credentials expired or not set.

**Solution:**

```bash
# Check current credentials
aws sts get-caller-identity

# If expired, reconfigure
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=wJalr...
export AWS_REGION=us-east-1
```

---

### Issue 6: "Stack XXX already exists"

**Error:**

```
Stack [CodeLearn-Database-dev] already exists
```

**Cause:** Stack was previously deployed.

**Solution:**

```bash
# Update existing stack
npx cdk deploy --all --force

# Or destroy and redeploy
npx cdk destroy --all
npx cdk deploy --all
```

---

### Issue 7: "Resource handler returned message: 'User: XXX is not authorized to perform: XXX'"

**Error:**

```
User: arn:aws:iam::123456789012:user/myuser is not authorized to perform: dynamodb:CreateTable
```

**Cause:** IAM user lacks necessary permissions.

**Solution:**

1. Go to AWS Console → IAM → Users
2. Select your user
3. Attach policy: `AdministratorAccess` (for development)
4. Or create custom policy with required permissions

**Minimum permissions needed:**

- DynamoDB: CreateTable, DescribeTable, DeleteTable
- S3: CreateBucket, PutBucketPolicy, DeleteBucket
- Cognito: CreateUserPool, DescribeUserPool, DeleteUserPool
- SQS: CreateQueue, GetQueueAttributes, DeleteQueue
- IAM: CreateRole, AttachRolePolicy, DeleteRole
- CloudFormation: CreateStack, DescribeStacks, DeleteStack

---

### Issue 8: "Bootstrap stack version 'X' requires bootstrap stack version >= 'Y'"

**Error:**

```
This CDK deployment requires bootstrap stack version '21', but during the confirmation via SSM parameter /cdk-bootstrap/hnb659fds/version the following error occurred: AccessDeniedException
```

**Cause:** CDK bootstrap not run or outdated.

**Solution:**

```bash
# Bootstrap your AWS environment
npx cdk bootstrap aws://ACCOUNT-ID/us-east-1

# Replace ACCOUNT-ID with your AWS account ID
# Get it with: aws sts get-caller-identity --query Account --output text

# Example:
npx cdk bootstrap aws://123456789012/us-east-1
```

---

## Quick Reference: Correct CDK Workflow

```bash
# 1. Navigate to codelearn directory (where cdk.json is)
cd codelearn

# 2. Install dependencies
npm install

# 3. Configure AWS credentials (if not done)
aws configure

# 4. Bootstrap CDK (first time only)
npx cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/us-east-1

# 5. Synthesize (verify)
npx cdk synth

# 6. Deploy
npx cdk deploy --all

# 7. Destroy (cleanup)
npx cdk destroy --all
```

---

## Useful CDK Commands

```bash
# List all stacks
npx cdk list

# Show differences before deploying
npx cdk diff

# Synthesize specific stack
npx cdk synth CodeLearn-Database-dev

# Deploy specific stack
npx cdk deploy CodeLearn-Database-dev

# Destroy specific stack
npx cdk destroy CodeLearn-Database-dev

# Watch mode (auto-deploy on changes)
npx cdk watch

# Show CloudFormation template
npx cdk synth CodeLearn-Database-dev --no-staging

# Validate cdk.json
npx cdk doctor
```

---

## Directory Structure

```
codelearn/
├── cdk.json                    ← CDK configuration (run commands from here!)
├── package.json
├── infrastructure/
│   ├── bin/
│   │   └── cdk-app.ts         ← CDK app entry point
│   └── lib/
│       ├── database-stack.ts
│       ├── storage-stack.ts
│       ├── auth-stack.ts
│       └── queue-stack.ts
└── ...
```

**Remember:** Always run `npx cdk` commands from the `codelearn/` directory!

---

## Getting Help

```bash
# CDK help
npx cdk --help

# Command-specific help
npx cdk deploy --help

# Check CDK version
npx cdk --version

# Validate environment
npx cdk doctor
```

---

## Still Having Issues?

1. **Check AWS credentials:**

   ```bash
   aws sts get-caller-identity
   ```

2. **Check CDK version:**

   ```bash
   npx cdk --version
   ```

3. **Check Node.js version:**

   ```bash
   node --version  # Should be 20+
   ```

4. **Clean and reinstall:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Check CloudFormation console:**
   - Go to AWS Console → CloudFormation
   - Look for error messages in stack events

---

**Pro Tip:** Always run CDK commands from the `codelearn/` directory where `cdk.json` is located!
