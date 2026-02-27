# Complete Deployment Workflow - Correct Order

## 🎯 Goal: Deploy Once, Configure Once

This workflow ensures you only configure OAuth providers once by deploying to Vercel first.

---

## 📋 Complete Workflow

### Phase 1: Deploy AWS Infrastructure (15 minutes)

**What:** Create AWS resources (DynamoDB, S3, Cognito, SQS)

```bash
# 1. Navigate to codelearn directory (where cdk.json is)
cd codelearn

# 2. Install dependencies
npm install

# 3. Deploy to AWS
npx cdk deploy --all

# 4. Save CDK outputs
.\scripts\update-env-from-cdk.ps1  # Windows
# OR
./scripts/update-env-from-cdk.sh   # macOS/Linux
```

**Output:** You'll get:

- Cognito User Pool ID
- Cognito Client ID
- Cognito Domain URL (e.g., `https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com`)
- DynamoDB table names
- S3 bucket names
- SQS queue URLs

**Save these values!**

---

### Phase 2: Deploy to Vercel (10 minutes)

**What:** Deploy Next.js app to get production URL

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to production
cd codelearn
vercel --prod
```

**Follow prompts:**

- Project name: `codelearn`
- Directory: `./`
- Override settings: `N`

**Output:** You'll get your production URL:

```
✅ Production: https://codelearn-abc123.vercel.app
```

**Save this URL!** This is your `NEXT_PUBLIC_APP_URL`

---

### Phase 3: Add Environment Variables to Vercel (10 minutes)

**What:** Configure Vercel with AWS credentials and settings

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add these variables:**

```bash
# AWS Configuration
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = AKIA...
AWS_SECRET_ACCESS_KEY = wJalr...

# AWS Cognito (from Phase 1 CDK output)
NEXT_PUBLIC_COGNITO_USER_POOL_ID = us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID = 1234567890abcdefghij
COGNITO_CLIENT_SECRET = your_client_secret
COGNITO_USER_POOL_DOMAIN = https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com

# AWS Bedrock
BEDROCK_MODEL_CLAUDE = anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_MODEL_LLAMA = meta.llama3-1-70b-instruct-v1:0

# DynamoDB Tables (from Phase 1)
DYNAMODB_TABLE_USERS = codelearn-users-dev
DYNAMODB_TABLE_PROJECTS = codelearn-projects-dev
DYNAMODB_TABLE_LEARNING_PATHS = codelearn-learning-paths-dev
DYNAMODB_TABLE_TEMPLATES = codelearn-templates-dev
DYNAMODB_TABLE_JOBS = codelearn-jobs-dev
DYNAMODB_TABLE_INTEGRATIONS = codelearn-integrations-dev

# S3 Buckets (from Phase 1)
S3_BUCKET_PROJECTS = codelearn-user-projects-dev
S3_BUCKET_TEMPLATES = codelearn-templates-dev
S3_BUCKET_ASSETS = codelearn-assets-dev

# SQS Queues (from Phase 1)
SQS_QUEUE_AI_JOBS = https://sqs.us-east-1.amazonaws.com/123456789012/codelearn-ai-jobs-queue-dev
SQS_QUEUE_AI_JOBS_DLQ = https://sqs.us-east-1.amazonaws.com/123456789012/codelearn-ai-jobs-dlq-dev

# Application Settings (from Phase 2)
NEXT_PUBLIC_APP_URL = https://codelearn-abc123.vercel.app
NODE_ENV = production
```

**Note:** Leave OAuth variables empty for now - we'll add them in Phase 5.

---

### Phase 4: Configure OAuth Providers (15 minutes)

**What:** Create OAuth apps with your Vercel production URL

#### 4.1 GitHub OAuth

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:

```
Application name: CodeLearn
Homepage URL: https://codelearn-abc123.vercel.app
Authorization callback URL: https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
```

**Replace:**

- `codelearn-abc123.vercel.app` with YOUR Vercel URL
- `codelearn-dev-abc123` with YOUR Cognito domain

4. Save **Client ID**
5. Generate and save **Client Secret**

#### 4.2 GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:user`
4. Save **PAT**

#### 4.3 Google OAuth

1. Go to https://console.cloud.google.com/
2. Create project: "CodeLearn"
3. Configure OAuth consent screen:
   - App name: CodeLearn
   - Homepage: `https://codelearn-abc123.vercel.app`
4. Create OAuth client ID:
   - Type: Web application
   - Authorized JavaScript origins:
     - `https://codelearn-abc123.vercel.app`
     - `https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com`
   - Authorized redirect URIs:
     - `https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
     - `https://codelearn-abc123.vercel.app/api/auth/callback/google`

5. Save **Client ID** and **Client Secret**

---

### Phase 5: Add OAuth Credentials to Vercel (5 minutes)

**What:** Add OAuth credentials to Vercel environment variables

**Go to:** Vercel Dashboard → Settings → Environment Variables

**Add:**

```bash
GITHUB_CLIENT_ID = Iv1.1234567890abcdef
GITHUB_CLIENT_SECRET = 1234567890abcdef1234567890abcdef12345678
GITHUB_PAT = ghp_1234567890abcdefghijklmnopqrstuvwxyz
GOOGLE_CLIENT_ID = 123456789012-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-abc...xyz
```

**Then redeploy:**

```bash
vercel --prod
```

---

### Phase 6: Configure OAuth in Cognito (5 minutes)

**What:** Add OAuth providers to Cognito User Pool

#### 6.1 Add GitHub Provider

```bash
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
  --attribute-mapping email=email,username=preferred_username \
  --region us-east-1
```

#### 6.2 Add Google Provider

```bash
aws cognito-idp create-identity-provider \
  --user-pool-id YOUR-USER-POOL-ID \
  --provider-name Google \
  --provider-type Google \
  --provider-details \
    client_id=YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com,\
    client_secret=YOUR-GOOGLE-CLIENT-SECRET,\
    authorize_scopes="profile email openid" \
  --attribute-mapping email=email,username=sub \
  --region us-east-1
```

#### 6.3 Update Cognito App Client Callback URLs

```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id YOUR-USER-POOL-ID \
  --client-id YOUR-CLIENT-ID \
  --callback-urls \
    "https://codelearn-abc123.vercel.app/api/auth/callback" \
    "https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com/oauth2/idpresponse" \
  --logout-urls \
    "https://codelearn-abc123.vercel.app" \
  --allowed-o-auth-flows "code" "implicit" \
  --allowed-o-auth-scopes "email" "openid" "profile" \
  --allowed-o-auth-flows-user-pool-client \
  --region us-east-1
```

---

### Phase 7: Verify Everything (5 minutes)

**What:** Test that everything is working

```bash
# 1. Check Vercel deployment
vercel ls

# 2. Visit your app
# Open: https://codelearn-abc123.vercel.app

# 3. Verify Cognito providers
aws cognito-idp list-identity-providers \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1

# 4. Check environment variables
# Vercel Dashboard → Settings → Environment Variables
```

---

## 📊 Summary: What You Have Now

✅ **AWS Infrastructure:**

- 6 DynamoDB tables
- 3 S3 buckets
- Cognito User Pool with OAuth providers
- 2 SQS queues

✅ **Vercel Deployment:**

- Production URL: `https://codelearn-abc123.vercel.app`
- All environment variables configured
- OAuth credentials added

✅ **OAuth Configuration:**

- GitHub OAuth app configured with production URL
- Google OAuth credentials configured with production URL
- Both providers added to Cognito
- Callback URLs pointing to production

✅ **Ready for Development:**

- Start Task 3: Authentication System Implementation
- OAuth will work immediately when implemented
- No need to reconfigure anything!

---

## 🎯 Key URLs to Save

**Save these in a safe place:**

```
Vercel Production URL: https://codelearn-abc123.vercel.app
Cognito Domain: https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com
Cognito User Pool ID: us-east-1_XXXXXXXXX
Cognito Client ID: 1234567890abcdefghij

GitHub OAuth Callback: https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
Google OAuth Redirect: https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
```

---

## 🔄 Local Development

For local development, create `.env.local`:

```bash
# Copy from .env but use localhost
NEXT_PUBLIC_APP_URL=http://localhost:3000

# All other variables same as production
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
# ... etc
```

**Note:** OAuth will redirect to production URL, but you can test other features locally.

---

## 📝 Checklist

- [ ] Phase 1: AWS infrastructure deployed
- [ ] Phase 2: Vercel deployment complete
- [ ] Phase 3: Environment variables added to Vercel
- [ ] Phase 4: OAuth apps created with production URL
- [ ] Phase 5: OAuth credentials added to Vercel
- [ ] Phase 6: OAuth providers configured in Cognito
- [ ] Phase 7: Everything verified and working

---

## 🚀 Next Steps

After completing all phases:

1. ✅ Commit and push changes
2. ✅ Create pull request for Task 2
3. ✅ Start Task 3: Authentication System Implementation
4. ✅ Test OAuth flows when authentication is implemented

---

**Total Time:** ~60 minutes

**Result:** Production-ready deployment with OAuth configured once! 🎉
