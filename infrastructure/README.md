# CodeLearn Infrastructure

This directory contains AWS CDK infrastructure code for the CodeLearn platform.

## Structure

- `bin/cdk-app.ts` - CDK app entry point
- `lib/database-stack.ts` - DynamoDB tables
- `lib/storage-stack.ts` - S3 buckets
- `lib/auth-stack.ts` - Cognito authentication
- `lib/queue-stack.ts` - SQS queues

## Stacks

### Database Stack
- Users table
- Projects table
- Learning paths table
- Templates table
- Jobs table
- Integrations table

### Storage Stack
- User projects bucket
- Templates bucket
- Assets bucket (with CloudFront CDN)

### Auth Stack
- Cognito User Pool
- OAuth providers (GitHub, Google)
- Identity Pool

### Queue Stack
- AI jobs queue
- Dead-letter queue
- CloudWatch alarms

## Usage

### Prerequisites
1. AWS CLI configured with credentials
2. AWS CDK CLI installed: `npm install -g aws-cdk`

### Commands

```bash
# Synthesize CloudFormation templates
npx cdk synth

# Deploy all stacks to development
npx cdk deploy --all --context env=dev

# Deploy specific stack
npx cdk deploy CodeLearn-Database-dev

# Destroy all stacks
npx cdk destroy --all --context env=dev
```

## Environment Variables

After deployment, export these environment variables:

```bash
# DynamoDB Tables
export USERS_TABLE_NAME=<users-table-name>
export PROJECTS_TABLE_NAME=<projects-table-name>
export LEARNING_PATHS_TABLE_NAME=<learning-paths-table-name>
export TEMPLATES_TABLE_NAME=<templates-table-name>
export JOBS_TABLE_NAME=<jobs-table-name>
export INTEGRATIONS_TABLE_NAME=<integrations-table-name>

# S3 Buckets
export USER_PROJECTS_BUCKET=<user-projects-bucket-name>
export TEMPLATES_BUCKET=<templates-bucket-name>
export ASSETS_BUCKET=<assets-bucket-name>

# Cognito
export COGNITO_USER_POOL_ID=<user-pool-id>
export COGNITO_CLIENT_ID=<client-id>

# SQS
export AI_JOBS_QUEUE_URL=<queue-url>
export AI_JOBS_DLQ_URL=<dlq-url>
```
