# Task 2.7 - AWS Deployment and OAuth Configuration Guide

## Overview

Task 2.7 completes the AWS Infrastructure Setup by:
1. Deploying CDK stacks to AWS (creating actual resources)
2. Configuring OAuth providers (GitHub & Google)
3. Updating environment variables with real AWS resource IDs

**Status:** This task must be completed before starting Task 3 (Authentication System)

---

## Prerequisites Checklist

Before starting, ensure you have:

- [x] AWS account created and verified
- [x] IAM user with AdministratorAccess
- [x] AWS CLI installed and configured (`aws configure`)
- [x] AWS CDK installed globally (`npm install -g aws-cdk`)
- [x] CDK bootstrapped (`cdk bootstrap aws://ACCOUNT-NUMBER/us-east-1`)
- [x] Task 2.1-2.6 completed (CDK code written)

**Verify AWS Setup:**
```bash
# Check AWS identity
aws sts get-caller-identity

# Check CDK version
cdk --version
```

---

## Step 1: Deploy CDK Stacks to AWS

### 1.1 Navigate to Infrastructure Directory
```bash
cd infrastructure
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Synthesize CloudFormation Templates
```bash
cdk synth
```

This generates CloudFormation templates without deploying. Review the output to ensure everything looks correct.

### 1.4 Deploy All Stacks
```bash
cdk deploy --all
```

**What this creates:**
- 6 DynamoDB tables (users, projects, learning_paths, templates, jobs, integrations)
- 3 S3 buckets (user-projects, templates, assets)
- 1 Cognito User Pool with Identity Pool
- 2 SQS queues (ai-jobs-queue, ai-jobs-dlq)
- IAM roles and policies

**Expected Output:**
```
✅ CodeLearnStack

Outputs:
CodeLearnStack.UserPoolId = us-east-1_XXXXXXXXX
CodeLearnStack.UserPoolClientId = 1234567890abcdefghij
CodeLearnStack.IdentityPoolId = us-east-1:12345678-1234-1234-1234-123456789012
CodeLearnStack.UserPoolDomain = codelearn-dev-XXXXXXXX
...
```

**⚠️ IMPORTANT:** Save all output values - you'll need them for environment variables!

### 1.5 Verify Deployment
```bash
# List DynamoDB tables
aws dynamodb list-tables --region us-east-1

# List S3 buckets
aws s3 ls

# Get Cognito User Pool details
aws cognito-idp list-user-pools --max-results 10 --region us-east-1
```

---

## Step 2: Configure GitHub OAuth

### 2.1 Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in details:
   - **Application name:** CodeLearn Dev
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
     - Replace `YOUR-COGNITO-DOMAIN` with the domain from CDK output
     - Example: `https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
4. Click "Register application"
5. **Save the Client ID** (shown immediately)
6. Click "Generate a new client secret"
7. **Save the Client Secret** (shown only once!)

### 2.2 Create GitHub Personal Access Token (PAT)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
4. Click "Generate token"
5. **Save the token** (shown only once!)

### 2.3 Configure GitHub in Cognito

```bash
# Add GitHub as identity provider
aws cognito-idp create-identity-provider \
  --user-pool-id YOUR-USER-POOL-ID \
  --provider-name GitHub \
  --provider-type OIDC \
  --provider-details \
    client_id=YOUR-GITHUB-CLIENT-ID,\
    client_secret=YOUR-GITHUB-CLIENT-SECRET,\
    authorize_scopes="user:email",\
    attributes_request_method=GET,\
    oidc_issuer=https://github.com \
  --attribute-mapping email=email,username=preferred_username
```

---

## Step 3: Configure Google OAuth

### 3.1 Create Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure consent screen if prompted:
   - User Type: External
   - App name: CodeLearn
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
6. Create OAuth client ID:
   - Application type: Web application
   - Name: CodeLearn Dev
   - Authorized redirect URIs:
     - `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
     - `http://localhost:3000/api/auth/callback/google`
7. Click "Create"
8. **Save the Client ID and Client Secret**

### 3.2 Configure Google in Cognito

```bash
# Add Google as identity provider
aws cognito-idp create-identity-provider \
  --user-pool-id YOUR-USER-POOL-ID \
  --provider-name Google \
  --provider-type Google \
  --provider-details \
    client_id=YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com,\
    client_secret=YOUR-GOOGLE-CLIENT-SECRET,\
    authorize_scopes="profile email openid" \
  --attribute-mapping email=email,username=sub
```

---

## Step 4: Update Environment Variables

### 4.1 Update .env File

Open `codelearn/.env` and replace placeholder values with real ones from CDK output:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...  # Your IAM user access key
AWS_SECRET_ACCESS_KEY=wJalr...  # Your IAM user secret key

# AWS Cognito (from CDK output)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=1234567890abcdefghij
COGNITO_CLIENT_SECRET=your_client_secret_from_cognito

# AWS Bedrock (already correct)
BEDROCK_MODEL_CLAUDE=anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_MODEL_LLAMA=meta.llama3-1-70b-instruct-v1:0

# DynamoDB Tables (from CDK output or use default names)
DYNAMODB_TABLE_USERS=codelearn-users
DYNAMODB_TABLE_PROJECTS=codelearn-projects
DYNAMODB_TABLE_LEARNING_PATHS=codelearn-learning-paths
DYNAMODB_TABLE_TEMPLATES=codelearn-templates
DYNAMODB_TABLE_JOBS=codelearn-jobs
DYNAMODB_TABLE_INTEGRATIONS=codelearn-integrations

# S3 Buckets (from CDK output)
S3_BUCKET_PROJECTS=codelearn-user-projects-dev
S3_BUCKET_TEMPLATES=codelearn-templates-dev
S3_BUCKET_ASSETS=codelearn-assets-dev

# SQS Queues (from CDK output)
SQS_QUEUE_AI_JOBS=https://sqs.us-east-1.amazonaws.com/ACCOUNT-ID/codelearn-ai-jobs-queue
SQS_QUEUE_AI_JOBS_DLQ=https://sqs.us-east-1.amazonaws.com/ACCOUNT-ID/codelearn-ai-jobs-dlq

# GitHub OAuth (from Step 2)
GITHUB_CLIENT_ID=Iv1.1234567890abcdef
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_PAT=ghp_1234567890abcdefghijklmnopqrstuvwxyz

# Google OAuth (from Step 3)
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Vercel Deployment (leave as placeholder for now)
VERCEL_TOKEN=your_vercel_token

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4.2 Verify Environment Variables

```bash
# Return to codelearn directory
cd ..

# Check if .env file is properly configured
cat .env | grep -E "COGNITO|GITHUB|GOOGLE"
```

---

## Step 5: Verify AWS Resources

### 5.1 Check Cognito User Pool
```bash
# Get User Pool details
aws cognito-idp describe-user-pool \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1

# List identity providers
aws cognito-idp list-identity-providers \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1
```

### 5.2 Check DynamoDB Tables
```bash
# Describe users table
aws dynamodb describe-table \
  --table-name codelearn-users \
  --region us-east-1
```

### 5.3 Check S3 Buckets
```bash
# List objects in projects bucket (should be empty)
aws s3 ls s3://codelearn-user-projects-dev/
```

### 5.4 Check SQS Queues
```bash
# Get queue attributes
aws sqs get-queue-attributes \
  --queue-url YOUR-QUEUE-URL \
  --attribute-names All \
  --region us-east-1
```

---

## Step 6: Test AWS Access

### 6.1 Test DynamoDB Access
```bash
# Try to scan users table (should return empty)
aws dynamodb scan \
  --table-name codelearn-users \
  --limit 1 \
  --region us-east-1
```

### 6.2 Test S3 Access
```bash
# Try to list bucket
aws s3 ls s3://codelearn-user-projects-dev/
```

### 6.3 Test Cognito Access
```bash
# List users (should be empty)
aws cognito-idp list-users \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1
```

---

## Step 7: Commit Changes

### 7.1 Stage Changes
```bash
git add .kiro/specs/codelearn-platform/tasks.md
git add TASK_2.7_DEPLOYMENT_GUIDE.md
```

### 7.2 Commit with Conventional Commit Message
```bash
git commit -m "chore: add task 2.7 for OAuth configuration and deployment verification"
```

### 7.3 Push to Feature Branch
```bash
git push origin feature/task-2-aws-infrastructure
```

---

## Troubleshooting

### Issue: CDK Deploy Fails with "No credentials"
**Solution:**
```bash
aws configure
# Re-enter your credentials
```

### Issue: "Stack already exists"
**Solution:**
```bash
# Update existing stack
cdk deploy --all --force
```

### Issue: OAuth callback URL mismatch
**Solution:**
- Ensure callback URL in GitHub/Google matches Cognito domain exactly
- Format: `https://YOUR-DOMAIN.auth.REGION.amazoncognito.com/oauth2/idpresponse`

### Issue: Cannot access DynamoDB table
**Solution:**
```bash
# Check IAM permissions
aws iam get-user
# Ensure AdministratorAccess policy is attached
```

---

## Cost Monitoring

After deployment, monitor costs:

1. Go to AWS Console > Billing Dashboard
2. Check "Free Tier Usage"
3. Verify all resources are within free tier limits

**Expected Resources:**
- DynamoDB: 6 tables (on-demand billing)
- S3: 3 buckets (pay per GB stored)
- Cognito: 1 User Pool (50,000 MAUs free)
- SQS: 2 queues (1M requests/month free)

**Estimated Cost:** $0-5/month (within free tier)

---

## Next Steps

Once Task 2.7 is complete:

1. ✅ All AWS resources deployed
2. ✅ OAuth providers configured
3. ✅ Environment variables updated
4. ✅ Changes committed to feature branch

**You're ready to start Task 3: Authentication System Implementation!**

---

## Quick Reference

### CDK Commands
```bash
cdk synth          # Generate CloudFormation templates
cdk deploy --all   # Deploy all stacks
cdk destroy --all  # Delete all stacks (cleanup)
cdk diff           # Show changes before deploy
```

### AWS CLI Commands
```bash
aws sts get-caller-identity              # Check AWS identity
aws cognito-idp list-user-pools --max-results 10  # List Cognito pools
aws dynamodb list-tables                 # List DynamoDB tables
aws s3 ls                                # List S3 buckets
aws sqs list-queues                      # List SQS queues
```

---

**Estimated Time:** 30-45 minutes

**Ready?** Let's deploy! 🚀
