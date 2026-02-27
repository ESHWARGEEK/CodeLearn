# AWS Infrastructure Deployment Guide

This guide walks through deploying the CodeLearn AWS infrastructure using AWS CDK.

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS CLI**: Install and configure AWS CLI with your credentials
   ```bash
   aws configure
   ```
3. **AWS CDK CLI**: Install globally
   ```bash
   npm install -g aws-cdk
   ```
4. **Environment Variables**: Set OAuth credentials (optional for initial deployment)
   ```bash
   export GITHUB_CLIENT_ID=your-github-client-id
   export GITHUB_CLIENT_SECRET=your-github-client-secret
   export GOOGLE_CLIENT_ID=your-google-client-id
   export GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## Deployment Steps

### Step 1: Bootstrap CDK (First Time Only)

Bootstrap your AWS environment for CDK:

```bash
cd codelearn
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

Replace `ACCOUNT-ID` with your AWS account ID and `REGION` with your preferred region (e.g., `us-east-1`).

### Step 2: Synthesize CloudFormation Templates

Generate CloudFormation templates to verify everything is configured correctly:

```bash
npx cdk synth --context env=dev
```

This will create CloudFormation templates in the `cdk.out/` directory.

### Step 3: Deploy All Stacks

Deploy all infrastructure stacks to AWS:

```bash
npx cdk deploy --all --context env=dev
```

Or deploy stacks individually:

```bash
# Deploy Database stack (DynamoDB tables)
npx cdk deploy CodeLearn-Database-dev --context env=dev

# Deploy Storage stack (S3 buckets)
npx cdk deploy CodeLearn-Storage-dev --context env=dev

# Deploy Auth stack (Cognito)
npx cdk deploy CodeLearn-Auth-dev --context env=dev

# Deploy Queue stack (SQS)
npx cdk deploy CodeLearn-Queue-dev --context env=dev
```

### Step 4: Verify Deployment

After deployment, verify all resources were created:

```bash
# List all stacks
npx cdk list --context env=dev

# Check stack outputs
aws cloudformation describe-stacks --stack-name CodeLearn-Database-dev
aws cloudformation describe-stacks --stack-name CodeLearn-Storage-dev
aws cloudformation describe-stacks --stack-name CodeLearn-Auth-dev
aws cloudformation describe-stacks --stack-name CodeLearn-Queue-dev
```

### Step 5: Export Environment Variables

After successful deployment, export the stack outputs as environment variables:

```bash
# Get stack outputs
aws cloudformation describe-stacks --stack-name CodeLearn-Database-dev --query 'Stacks[0].Outputs'
aws cloudformation describe-stacks --stack-name CodeLearn-Storage-dev --query 'Stacks[0].Outputs'
aws cloudformation describe-stacks --stack-name CodeLearn-Auth-dev --query 'Stacks[0].Outputs'
aws cloudformation describe-stacks --stack-name CodeLearn-Queue-dev --query 'Stacks[0].Outputs'
```

Create a `.env` file in the `codelearn/` directory:

```bash
# DynamoDB Tables
USERS_TABLE_NAME=codelearn-users-dev
PROJECTS_TABLE_NAME=codelearn-projects-dev
LEARNING_PATHS_TABLE_NAME=codelearn-learning-paths-dev
TEMPLATES_TABLE_NAME=codelearn-templates-dev
JOBS_TABLE_NAME=codelearn-jobs-dev
INTEGRATIONS_TABLE_NAME=codelearn-integrations-dev

# S3 Buckets
USER_PROJECTS_BUCKET=codelearn-user-projects-dev
TEMPLATES_BUCKET=codelearn-templates-dev
ASSETS_BUCKET=codelearn-assets-dev
ASSETS_CDN_URL=https://d1234567890.cloudfront.net

# Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=1234567890abcdefghijklmnop
COGNITO_IDENTITY_POOL_ID=us-east-1:12345678-1234-1234-1234-123456789012
COGNITO_USER_POOL_DOMAIN=https://codelearn-dev.auth.us-east-1.amazoncognito.com

# SQS
AI_JOBS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/codelearn-ai-jobs-queue-dev
AI_JOBS_QUEUE_ARN=arn:aws:sqs:us-east-1:123456789012:codelearn-ai-jobs-queue-dev
AI_JOBS_DLQ_URL=https://sqs.us-east-1.amazonaws.com/123456789012/codelearn-ai-jobs-dlq-dev
AI_JOBS_DLQ_ARN=arn:aws:sqs:us-east-1:123456789012:codelearn-ai-jobs-dlq-dev

# AWS Region
AWS_REGION=us-east-1
```

## Deployed Resources

### Database Stack (DynamoDB)
- **users** table: User profiles and authentication data
- **projects** table: User projects with GSI for userId-status queries
- **learning_paths** table: Cached AI-generated learning paths (24h TTL)
- **templates** table: Code templates with GSI for technology-rating queries
- **jobs** table: Async job tracking (24h TTL)
- **integrations** table: Template integrations with GSI for rate limiting

### Storage Stack (S3)
- **user-projects** bucket: User project code with versioning
- **templates** bucket: Extracted templates with lifecycle policies
- **assets** bucket: Static assets with CloudFront CDN

### Auth Stack (Cognito)
- **User Pool**: Email/password authentication
- **OAuth Providers**: GitHub and Google integration
- **Identity Pool**: Federated identity management
- **User Pool Domain**: Hosted UI for authentication

### Queue Stack (SQS)
- **ai-jobs-queue**: Main queue for AI operations (5min visibility timeout)
- **ai-jobs-dlq**: Dead-letter queue (4-day retention, 3 max receives)
- **CloudWatch Alarms**: Queue depth >100, DLQ messages >0

## Cost Estimation

**Development Environment (Low Usage):**
- DynamoDB: ~$5/month (on-demand, minimal usage)
- S3: ~$2/month (< 10GB storage)
- CloudFront: ~$1/month (< 10GB transfer)
- Cognito: Free tier (< 50,000 MAU)
- SQS: Free tier (< 1M requests)
- **Total: ~$8-10/month**

**Production Environment (Moderate Usage):**
- DynamoDB: ~$50/month
- S3: ~$20/month
- CloudFront: ~$30/month
- Cognito: ~$50/month (> 50,000 MAU)
- SQS: ~$10/month
- **Total: ~$160-200/month**

## Cleanup

To destroy all infrastructure and avoid charges:

```bash
# Destroy all stacks
npx cdk destroy --all --context env=dev

# Or destroy individually
npx cdk destroy CodeLearn-Queue-dev --context env=dev
npx cdk destroy CodeLearn-Auth-dev --context env=dev
npx cdk destroy CodeLearn-Storage-dev --context env=dev
npx cdk destroy CodeLearn-Database-dev --context env=dev
```

**Note**: Some resources (DynamoDB tables, S3 buckets) have `RETAIN` removal policy and must be manually deleted from AWS Console to avoid data loss.

## Troubleshooting

### Issue: CDK Bootstrap Failed
**Solution**: Ensure you have the correct AWS credentials and permissions:
```bash
aws sts get-caller-identity
```

### Issue: Stack Deployment Failed
**Solution**: Check CloudFormation events in AWS Console:
```bash
aws cloudformation describe-stack-events --stack-name CodeLearn-Database-dev
```

### Issue: OAuth Providers Not Working
**Solution**: Update OAuth credentials in AWS Secrets Manager or redeploy with correct environment variables.

### Issue: S3 Bucket Name Already Exists
**Solution**: S3 bucket names must be globally unique. Change the `env` context value:
```bash
npx cdk deploy --all --context env=dev2
```

## Next Steps

After successful deployment:
1. Update Next.js `.env` file with stack outputs
2. Configure OAuth callback URLs in GitHub/Google developer consoles
3. Test authentication flow
4. Deploy Next.js application to Vercel
5. Update Cognito callback URLs with production domain

## Support

For issues or questions:
- Check AWS CloudFormation console for detailed error messages
- Review CDK documentation: https://docs.aws.amazon.com/cdk/
- Check CloudWatch Logs for runtime errors
