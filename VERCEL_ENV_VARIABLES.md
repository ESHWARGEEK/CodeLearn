# Vercel Environment Variables - Complete List

## Critical Variables (Required for Authentication)

These are the MINIMUM variables needed for login/signup to work:

### AWS Cognito (Authentication)
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_bNco2tmIx
NEXT_PUBLIC_COGNITO_CLIENT_ID=1belt192f8jpto6m9f9m3hm6l3
COGNITO_CLIENT_SECRET=(get from AWS Cognito console)
```

### AWS Configuration
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=(your AWS access key)
AWS_SECRET_ACCESS_KEY=(your AWS secret key)
```

### Application Settings
```
NEXT_PUBLIC_APP_URL=https://codelearn-lemon.vercel.app
NODE_ENV=production
```

---

## Complete List (All Variables)

### 1. AWS Cognito (Authentication) ✅ CRITICAL
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_bNco2tmIx
NEXT_PUBLIC_COGNITO_CLIENT_ID=1belt192f8jpto6m9f9m3hm6l3
COGNITO_CLIENT_SECRET=(get from AWS Cognito - see instructions below)
COGNITO_IDENTITY_POOL_ID=us-east-1:2d1150f5-a0bf-4a8e-b2d1-a3f60cc349d0
COGNITO_USER_POOL_DOMAIN=codelearn-dev.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_DOMAIN=codelearn-dev.auth.us-east-1.amazoncognito.com
```

### 2. AWS Configuration ✅ CRITICAL
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=(your AWS access key - DO NOT COMMIT)
AWS_SECRET_ACCESS_KEY=(your AWS secret key - DO NOT COMMIT)
```

### 3. DynamoDB Tables ✅ CRITICAL
```
DYNAMODB_TABLE_USERS=codelearn-users-dev
DYNAMODB_TABLE_PROJECTS=codelearn-projects-dev
DYNAMODB_TABLE_LEARNING_PATHS=codelearn-learning-paths-dev
DYNAMODB_TABLE_TEMPLATES=codelearn-templates-dev
DYNAMODB_TABLE_JOBS=codelearn-jobs-dev
DYNAMODB_TABLE_INTEGRATIONS=codelearn-integrations-dev
```

### 4. S3 Buckets
```
S3_BUCKET_PROJECTS=codelearn-user-projects-dev
S3_BUCKET_TEMPLATES=codelearn-templates-dev
S3_BUCKET_ASSETS=codelearn-assets-dev
```

### 5. SQS Queues
```
SQS_QUEUE_AI_JOBS=https://sqs.us-east-1.amazonaws.com/870631428381/codelearn-ai-jobs-queue-dev
SQS_QUEUE_AI_JOBS_DLQ=https://sqs.us-east-1.amazonaws.com/870631428381/codelearn-ai-jobs-dlq-dev
```

### 6. AWS Bedrock (AI Models)
```
BEDROCK_MODEL_CLAUDE=anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_MODEL_LLAMA=meta.llama3-1-70b-instruct-v1:0
```

### 7. GitHub OAuth (Optional - for OAuth login)
```
GITHUB_CLIENT_ID=(from GitHub OAuth app)
GITHUB_CLIENT_SECRET=(from GitHub OAuth app)
GITHUB_PAT=(GitHub Personal Access Token)
```

### 8. Google OAuth (Optional - for OAuth login)
```
GOOGLE_CLIENT_ID=(from Google Cloud Console)
GOOGLE_CLIENT_SECRET=(from Google Cloud Console)
```

### 9. Application Settings ✅ CRITICAL
```
NEXT_PUBLIC_APP_URL=https://codelearn-lemon.vercel.app
NODE_ENV=production
```

### 10. Payment Integration (Phase 2 - Not needed now)
```
STRIPE_SECRET_KEY=(add later)
STRIPE_WEBHOOK_SECRET=(add later)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=(add later)
```

### 11. Monitoring (Optional)
```
NEXT_PUBLIC_SENTRY_DSN=(add if using Sentry)
```

---

## How to Get Missing Values

### Get COGNITO_CLIENT_SECRET

```bash
aws cognito-idp describe-user-pool-client \
  --user-pool-id us-east-1_bNco2tmIx \
  --client-id 1belt192f8jpto6m9f9m3hm6l3 \
  --region us-east-1 \
  --query 'UserPoolClient.ClientSecret' \
  --output text
```

OR manually:
1. Go to AWS Console → Cognito
2. Select User Pool: `us-east-1_bNco2tmIx`
3. Go to "App integration" tab
4. Click on your app client
5. Click "Show client secret"
6. Copy the value

### Get AWS Access Keys

If you don't have them:
1. Go to AWS Console → IAM
2. Users → Your user
3. Security credentials tab
4. Create access key
5. Download and save securely

---

## How to Add to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project: `codelearn`
3. Go to **Settings** → **Environment Variables**
4. For each variable:
   - Click "Add New"
   - Enter **Name** (e.g., `NEXT_PUBLIC_COGNITO_USER_POOL_ID`)
   - Enter **Value** (e.g., `us-east-1_bNco2tmIx`)
   - Select environments: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add variables
vercel env add NEXT_PUBLIC_COGNITO_USER_POOL_ID
# Enter value when prompted: us-east-1_bNco2tmIx
# Select: Production, Preview, Development

# Repeat for each variable
```

### Method 3: Import from .env file

1. Create a file `vercel-env.txt` with this format:
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID="us-east-1_bNco2tmIx"
NEXT_PUBLIC_COGNITO_CLIENT_ID="1belt192f8jpto6m9f9m3hm6l3"
AWS_REGION="us-east-1"
```

2. Go to Vercel Dashboard → Settings → Environment Variables
3. Click "Import .env"
4. Upload the file

---

## Priority Order

Add variables in this order for fastest results:

### Phase 1: Authentication (CRITICAL - Do this first!)
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_bNco2tmIx
NEXT_PUBLIC_COGNITO_CLIENT_ID=1belt192f8jpto6m9f9m3hm6l3
COGNITO_CLIENT_SECRET=(get from AWS)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=(your key)
AWS_SECRET_ACCESS_KEY=(your secret)
NEXT_PUBLIC_APP_URL=https://codelearn-lemon.vercel.app
NODE_ENV=production
```

### Phase 2: Database & Storage
```
DYNAMODB_TABLE_USERS=codelearn-users-dev
DYNAMODB_TABLE_PROJECTS=codelearn-projects-dev
DYNAMODB_TABLE_LEARNING_PATHS=codelearn-learning-paths-dev
DYNAMODB_TABLE_TEMPLATES=codelearn-templates-dev
DYNAMODB_TABLE_JOBS=codelearn-jobs-dev
DYNAMODB_TABLE_INTEGRATIONS=codelearn-integrations-dev
S3_BUCKET_PROJECTS=codelearn-user-projects-dev
S3_BUCKET_TEMPLATES=codelearn-templates-dev
S3_BUCKET_ASSETS=codelearn-assets-dev
```

### Phase 3: AI & Queues
```
SQS_QUEUE_AI_JOBS=https://sqs.us-east-1.amazonaws.com/870631428381/codelearn-ai-jobs-queue-dev
SQS_QUEUE_AI_JOBS_DLQ=https://sqs.us-east-1.amazonaws.com/870631428381/codelearn-ai-jobs-dlq-dev
BEDROCK_MODEL_CLAUDE=anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_MODEL_LLAMA=meta.llama3-1-70b-instruct-v1:0
```

### Phase 4: OAuth (Optional)
```
NEXT_PUBLIC_COGNITO_DOMAIN=codelearn-dev.auth.us-east-1.amazoncognito.com
COGNITO_IDENTITY_POOL_ID=us-east-1:2d1150f5-a0bf-4a8e-b2d1-a3f60cc349d0
COGNITO_USER_POOL_DOMAIN=codelearn-dev.auth.us-east-1.amazoncognito.com
GITHUB_CLIENT_ID=(if using GitHub OAuth)
GITHUB_CLIENT_SECRET=(if using GitHub OAuth)
GOOGLE_CLIENT_ID=(if using Google OAuth)
GOOGLE_CLIENT_SECRET=(if using Google OAuth)
```

---

## After Adding Variables

### 1. Redeploy

Vercel will automatically redeploy when you add/change environment variables.

OR manually trigger:
```bash
vercel --prod
```

### 2. Verify Deployment

1. Wait 2-3 minutes for deployment
2. Go to https://codelearn-lemon.vercel.app
3. Check deployment logs in Vercel Dashboard
4. Look for "Build succeeded" message

### 3. Test Login

1. Clear browser data (cookies, cache)
2. Navigate to https://codelearn-lemon.vercel.app/login
3. Try logging in
4. Should redirect to /dashboard successfully

---

## Troubleshooting

### Error: "User pool client your_client_id does not exist"

**Cause:** Environment variables not set in Vercel

**Fix:** Add the Phase 1 variables above

### Error: "401 Unauthorized"

**Cause:** AWS credentials not set or invalid

**Fix:** 
1. Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
2. Check IAM permissions for the user

### Error: "Cannot find module"

**Cause:** Missing dependencies or build issue

**Fix:**
1. Check Vercel build logs
2. Ensure all dependencies are in package.json
3. Redeploy

---

## Security Notes

⚠️ **NEVER commit these to Git:**
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- COGNITO_CLIENT_SECRET
- GITHUB_CLIENT_SECRET
- GOOGLE_CLIENT_SECRET
- Any API keys or secrets

✅ **Safe to commit:**
- NEXT_PUBLIC_* variables (they're public anyway)
- Table names
- Bucket names
- Model names
- Region

---

## Quick Copy-Paste Template

Use this template to quickly add all variables:

```bash
# Phase 1: Critical (Add these first)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_bNco2tmIx
NEXT_PUBLIC_COGNITO_CLIENT_ID=1belt192f8jpto6m9f9m3hm6l3
COGNITO_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_APP_URL=https://codelearn-lemon.vercel.app
NODE_ENV=production

# Phase 2: Database
DYNAMODB_TABLE_USERS=codelearn-users-dev
DYNAMODB_TABLE_PROJECTS=codelearn-projects-dev
DYNAMODB_TABLE_LEARNING_PATHS=codelearn-learning-paths-dev
DYNAMODB_TABLE_TEMPLATES=codelearn-templates-dev
DYNAMODB_TABLE_JOBS=codelearn-jobs-dev
DYNAMODB_TABLE_INTEGRATIONS=codelearn-integrations-dev

# Phase 3: Storage
S3_BUCKET_PROJECTS=codelearn-user-projects-dev
S3_BUCKET_TEMPLATES=codelearn-templates-dev
S3_BUCKET_ASSETS=codelearn-assets-dev

# Phase 4: Queues
SQS_QUEUE_AI_JOBS=https://sqs.us-east-1.amazonaws.com/870631428381/codelearn-ai-jobs-queue-dev
SQS_QUEUE_AI_JOBS_DLQ=https://sqs.us-east-1.amazonaws.com/870631428381/codelearn-ai-jobs-dlq-dev

# Phase 5: AI Models
BEDROCK_MODEL_CLAUDE=anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_MODEL_LLAMA=meta.llama3-1-70b-instruct-v1:0

# Phase 6: OAuth (Optional)
NEXT_PUBLIC_COGNITO_DOMAIN=codelearn-dev.auth.us-east-1.amazoncognito.com
COGNITO_IDENTITY_POOL_ID=us-east-1:2d1150f5-a0bf-4a8e-b2d1-a3f60cc349d0
COGNITO_USER_POOL_DOMAIN=codelearn-dev.auth.us-east-1.amazoncognito.com
```

---

**Last Updated:** March 2, 2026  
**Status:** Ready for deployment  
**Priority:** Add Phase 1 variables immediately to fix login
