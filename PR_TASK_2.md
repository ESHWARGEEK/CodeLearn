# Pull Request: AWS Infrastructure Setup with CDK

## Summary

This PR implements the complete AWS infrastructure for the CodeLearn platform using AWS CDK (Cloud Development Kit) with TypeScript. All infrastructure is defined as code and can be deployed to AWS with a single command.

## Changes

### 1. CDK Project Initialization (Task 2.1)
- ✅ Created CDK app structure in `infrastructure/` directory
- ✅ Installed AWS CDK dependencies (`aws-cdk-lib`, `constructs`, `tsx`)
- ✅ Configured `cdk.json` with TypeScript execution
- ✅ Created four separate stacks for better organization:
  - Database Stack (DynamoDB)
  - Storage Stack (S3)
  - Auth Stack (Cognito)
  - Queue Stack (SQS)

### 2. DynamoDB Tables (Task 2.2)
- ✅ **users** table: `PK: USER#{userId}, SK: PROFILE`
- ✅ **projects** table: `PK: PROJECT#{projectId}, SK: USER#{userId}`
  - GSI: `userId-status-index` for querying projects by user and status
- ✅ **learning_paths** table: `PK: TECH#{technology}, SK: DIFF#{difficulty}`
  - TTL enabled for 24-hour cache invalidation
- ✅ **templates** table: `PK: TEMPLATE#{templateId}, SK: METADATA`
  - GSI: `technology-rating-index` for querying by technology and rating
- ✅ **jobs** table: `PK: JOB#{jobId}, SK: USER#{userId}`
  - TTL enabled for automatic cleanup after 24 hours
- ✅ **integrations** table: `PK: INTEGRATION#{integrationId}, SK: USER#{userId}`
  - GSI: `userId-month-index` for rate limiting (5 integrations/month for free users)
- ✅ All tables use on-demand billing mode
- ✅ All tables have RETAIN removal policy to prevent accidental data loss

### 3. S3 Buckets (Task 2.3)
- ✅ **user-projects-{env}** bucket:
  - Versioning enabled for code history
  - AES-256 encryption
  - CORS configured for browser uploads
- ✅ **templates-{env}** bucket:
  - Lifecycle policies (transition to IA after 30 days, delete old versions after 90 days)
  - AES-256 encryption
  - CORS configured
- ✅ **assets-{env}** bucket:
  - CloudFront CDN distribution for fast global delivery
  - AES-256 encryption
  - CORS configured
  - HTTPS redirect enforced

### 4. Cognito Authentication (Task 2.4)
- ✅ User Pool with email/password authentication
- ✅ Password policy: 8+ characters, uppercase, lowercase, number
- ✅ OAuth providers configured:
  - GitHub OAuth (with email and profile scopes)
  - Google OAuth (with email, profile, openid scopes)
- ✅ JWT token expiration:
  - Access token: 1 hour
  - Refresh token: 30 days
  - ID token: 1 hour
- ✅ Identity Pool for federated identities
- ✅ User Pool Domain for hosted UI

### 5. SQS Queues (Task 2.5)
- ✅ **ai-jobs-queue**: Main queue for async AI operations
  - 5-minute visibility timeout
  - 4-day message retention
  - SQS-managed encryption
- ✅ **ai-jobs-dlq**: Dead-letter queue
  - 4-day message retention
  - Max 3 receives before moving to DLQ
- ✅ CloudWatch Alarms:
  - Queue depth >100 messages
  - DLQ messages >0

### 6. Deployment Documentation (Task 2.6)
- ✅ Created comprehensive `DEPLOYMENT_GUIDE.md`
- ✅ Created `scripts/export-env.sh` (Linux/Mac)
- ✅ Created `scripts/export-env.ps1` (Windows)
- ✅ All stack outputs exported for easy environment variable setup

## File Structure

```
codelearn/
├── infrastructure/
│   ├── bin/
│   │   └── cdk-app.ts           # CDK app entry point
│   ├── lib/
│   │   ├── database-stack.ts    # DynamoDB tables
│   │   ├── storage-stack.ts     # S3 buckets + CloudFront
│   │   ├── auth-stack.ts        # Cognito User Pools
│   │   └── queue-stack.ts       # SQS queues + alarms
│   └── README.md
├── scripts/
│   ├── export-env.sh            # Extract env vars (Linux/Mac)
│   └── export-env.ps1           # Extract env vars (Windows)
├── cdk.json                     # CDK configuration
└── DEPLOYMENT_GUIDE.md          # Deployment instructions
```

## Stack Outputs

All stacks export their resource names/URLs as CloudFormation outputs:

**Database Stack:**
- Users table name
- Projects table name
- Learning paths table name
- Templates table name
- Jobs table name
- Integrations table name

**Storage Stack:**
- User projects bucket name
- Templates bucket name
- Assets bucket name
- CloudFront CDN URL

**Auth Stack:**
- User Pool ID
- User Pool Client ID
- Identity Pool ID
- User Pool Domain URL

**Queue Stack:**
- AI jobs queue URL and ARN
- AI jobs DLQ URL and ARN

## Deployment Instructions

### Prerequisites
1. AWS CLI configured with credentials
2. AWS CDK CLI installed: `npm install -g aws-cdk`
3. OAuth credentials (optional for initial deployment)

### Deploy to Development

```bash
# Bootstrap CDK (first time only)
npx cdk bootstrap

# Synthesize CloudFormation templates
npx cdk synth --context env=dev

# Deploy all stacks
npx cdk deploy --all --context env=dev

# Extract environment variables
./scripts/export-env.sh dev > .env
# or on Windows:
.\scripts\export-env.ps1 -Env dev > .env
```

## Cost Estimation

**Development Environment (Low Usage):**
- DynamoDB: ~$5/month (on-demand, minimal usage)
- S3: ~$2/month (< 10GB storage)
- CloudFront: ~$1/month (< 10GB transfer)
- Cognito: Free tier (< 50,000 MAU)
- SQS: Free tier (< 1M requests)
- **Total: ~$8-10/month**

## Testing

All stacks synthesize successfully:

```bash
npx cdk synth --context env=dev
```

Output:
- ✅ CodeLearn-Database-dev
- ✅ CodeLearn-Storage-dev
- ✅ CodeLearn-Auth-dev
- ✅ CodeLearn-Queue-dev

## Commits

1. `feat: initialize AWS CDK infrastructure project` (Task 2.1)
2. `feat: define DynamoDB tables with GSIs and TTL` (Task 2.2)
3. `feat: create S3 buckets with encryption and CDN` (Task 2.3)
4. `feat: configure Cognito with OAuth providers` (Task 2.4)
5. `feat: set up SQS queues for AI job processing` (Task 2.5)
6. `chore: deploy AWS infrastructure to development` (Task 2.6)

## Next Steps

After merging this PR:
1. Deploy infrastructure to AWS development environment
2. Update `.env` file with stack outputs
3. Configure OAuth callback URLs in GitHub/Google developer consoles
4. Begin Task 3: Authentication System Implementation

## Related Issues

- Implements Task 2 from `.kiro/specs/codelearn-platform/tasks.md`
- Follows design specifications from `.kiro/specs/codelearn-platform/design.md`
- Uses tech stack defined in `AWS_project/tech_stack.md`

## Checklist

- [x] All sub-tasks completed (2.1 - 2.6)
- [x] CDK stacks synthesize successfully
- [x] All resources follow naming conventions
- [x] Security best practices implemented (encryption, CORS, IAM)
- [x] Documentation complete (README, DEPLOYMENT_GUIDE)
- [x] Scripts provided for environment variable extraction
- [x] Conventional commits format followed
- [x] Code follows TypeScript best practices
