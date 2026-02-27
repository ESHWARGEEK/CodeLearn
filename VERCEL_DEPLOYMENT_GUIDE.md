# Vercel Deployment Guide - Deploy First, Then Configure OAuth

## 🎯 Strategy: Deploy to Vercel FIRST

You're right! It's much better to:
1. Deploy the Next.js app to Vercel first
2. Get your production URL (e.g., `https://codelearn.vercel.app`)
3. Use that URL when configuring GitHub and Google OAuth
4. This way you only configure OAuth once!

---

## Step 1: Prepare for Vercel Deployment

### 1.1 Create vercel.json Configuration

Create `vercel.json` in the `codelearn/` directory:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app-url",
    "AWS_REGION": "@aws-region",
    "AWS_ACCESS_KEY_ID": "@aws-access-key-id",
    "AWS_SECRET_ACCESS_KEY": "@aws-secret-access-key",
    "NEXT_PUBLIC_COGNITO_USER_POOL_ID": "@cognito-user-pool-id",
    "NEXT_PUBLIC_COGNITO_CLIENT_ID": "@cognito-client-id",
    "COGNITO_CLIENT_SECRET": "@cognito-client-secret",
    "BEDROCK_MODEL_CLAUDE": "@bedrock-model-claude",
    "BEDROCK_MODEL_LLAMA": "@bedrock-model-llama",
    "DYNAMODB_TABLE_USERS": "@dynamodb-table-users",
    "DYNAMODB_TABLE_PROJECTS": "@dynamodb-table-projects",
    "DYNAMODB_TABLE_LEARNING_PATHS": "@dynamodb-table-learning-paths",
    "DYNAMODB_TABLE_TEMPLATES": "@dynamodb-table-templates",
    "DYNAMODB_TABLE_JOBS": "@dynamodb-table-jobs",
    "DYNAMODB_TABLE_INTEGRATIONS": "@dynamodb-table-integrations",
    "S3_BUCKET_PROJECTS": "@s3-bucket-projects",
    "S3_BUCKET_TEMPLATES": "@s3-bucket-templates",
    "S3_BUCKET_ASSETS": "@s3-bucket-assets",
    "SQS_QUEUE_AI_JOBS": "@sqs-queue-ai-jobs",
    "SQS_QUEUE_AI_JOBS_DLQ": "@sqs-queue-ai-jobs-dlq",
    "GITHUB_CLIENT_ID": "@github-client-id",
    "GITHUB_CLIENT_SECRET": "@github-client-secret",
    "GITHUB_PAT": "@github-pat",
    "GOOGLE_CLIENT_ID": "@google-client-id",
    "GOOGLE_CLIENT_SECRET": "@google-client-secret"
  }
}
```

### 1.2 Verify .gitignore

Ensure `.env` is in `.gitignore`:

```bash
# Check if .env is ignored
cat .gitignore | grep .env
```

Should show:
```
.env
.env*.local
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

#### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 2.2 Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

#### 2.3 Deploy to Production

```bash
# Navigate to codelearn directory
cd codelearn

# Deploy to production
vercel --prod
```

**Follow the prompts:**
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project's name? **codelearn**
- In which directory is your code located? **./** (current directory)
- Want to override settings? **N**

#### 2.4 Save Your Production URL

After deployment, Vercel will show:
```
✅ Production: https://codelearn-abc123.vercel.app
```

**Save this URL!** You'll use it for OAuth configuration.

### Option B: Deploy via GitHub Integration

#### 2.1 Push to GitHub

```bash
git push origin main
```

#### 2.2 Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository: `ESHWARGEEK/CodeLearn`
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: **codelearn**
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Click "Deploy"

#### 2.3 Get Your Production URL

After deployment:
1. Go to your Vercel dashboard
2. Click on your project
3. Copy the production URL (e.g., `https://codelearn.vercel.app`)

---

## Step 3: Add Environment Variables to Vercel

### 3.1 Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Select your project: **codelearn**
3. Go to **Settings** > **Environment Variables**
4. Add each variable from your `.env` file:

**AWS Configuration:**
```
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = AKIA...
AWS_SECRET_ACCESS_KEY = wJalr...
```

**AWS Cognito (from CDK output):**
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID = us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID = 1234567890abcdefghij
COGNITO_CLIENT_SECRET = your_client_secret
COGNITO_IDENTITY_POOL_ID = us-east-1:12345678-1234-1234-1234-123456789012
COGNITO_USER_POOL_DOMAIN = https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com
```

**AWS Bedrock:**
```
BEDROCK_MODEL_CLAUDE = anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_MODEL_LLAMA = meta.llama3-1-70b-instruct-v1:0
```

**DynamoDB Tables:**
```
DYNAMODB_TABLE_USERS = codelearn-users-dev
DYNAMODB_TABLE_PROJECTS = codelearn-projects-dev
DYNAMODB_TABLE_LEARNING_PATHS = codelearn-learning-paths-dev
DYNAMODB_TABLE_TEMPLATES = codelearn-templates-dev
DYNAMODB_TABLE_JOBS = codelearn-jobs-dev
DYNAMODB_TABLE_INTEGRATIONS = codelearn-integrations-dev
```

**S3 Buckets:**
```
S3_BUCKET_PROJECTS = codelearn-user-projects-dev
S3_BUCKET_TEMPLATES = codelearn-templates-dev
S3_BUCKET_ASSETS = codelearn-assets-dev
```

**SQS Queues:**
```
SQS_QUEUE_AI_JOBS = https://sqs.us-east-1.amazonaws.com/123456789012/codelearn-ai-jobs-queue-dev
SQS_QUEUE_AI_JOBS_DLQ = https://sqs.us-east-1.amazonaws.com/123456789012/codelearn-ai-jobs-dlq-dev
```

**Application Settings:**
```
NEXT_PUBLIC_APP_URL = https://codelearn-abc123.vercel.app
NODE_ENV = production
```

**Note:** Leave OAuth variables empty for now - we'll add them after configuration.

### 3.2 Via Vercel CLI

```bash
# Set environment variables
vercel env add NEXT_PUBLIC_COGNITO_USER_POOL_ID production
# Enter value when prompted

# Or import from .env file
vercel env pull .env.production
```

---

## Step 4: Configure OAuth with Production URL

Now that you have your Vercel URL, configure OAuth providers:

### 4.1 GitHub OAuth Configuration

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in details:

```
Application name: CodeLearn
Homepage URL: https://codelearn-abc123.vercel.app
Authorization callback URL: https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
```

**Important:** Use your actual Vercel URL and Cognito domain!

4. Save Client ID and Client Secret
5. Create GitHub PAT at https://github.com/settings/tokens
   - Scopes: `repo`, `read:user`

### 4.2 Google OAuth Configuration

1. Go to https://console.cloud.google.com/
2. Create project: **CodeLearn**
3. Configure OAuth consent screen:
   - App name: **CodeLearn**
   - Homepage: `https://codelearn-abc123.vercel.app`
4. Create OAuth client ID:
   - Type: **Web application**
   - Authorized JavaScript origins:
     - `https://codelearn-abc123.vercel.app`
     - `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com`
   - Authorized redirect URIs:
     - `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
     - `https://codelearn-abc123.vercel.app/api/auth/callback/google`

5. Save Client ID and Client Secret

### 4.3 Add OAuth Variables to Vercel

Go back to Vercel Dashboard > Settings > Environment Variables:

```
GITHUB_CLIENT_ID = Iv1.1234567890abcdef
GITHUB_CLIENT_SECRET = 1234567890abcdef1234567890abcdef12345678
GITHUB_PAT = ghp_1234567890abcdefghijklmnopqrstuvwxyz
GOOGLE_CLIENT_ID = 123456789012-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-abc...xyz
```

### 4.4 Redeploy

After adding OAuth variables:

```bash
# Trigger a new deployment
vercel --prod
```

Or in Vercel Dashboard: **Deployments** > **Redeploy**

---

## Step 5: Configure OAuth Providers in Cognito

Now add the OAuth providers to your Cognito User Pool:

### 5.1 Add GitHub Provider

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

### 5.2 Add Google Provider

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

### 5.3 Update Cognito App Client

Update your Cognito app client to include the Vercel callback URL:

```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id YOUR-USER-POOL-ID \
  --client-id YOUR-CLIENT-ID \
  --callback-urls \
    "https://codelearn-abc123.vercel.app/api/auth/callback" \
    "https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse" \
  --logout-urls \
    "https://codelearn-abc123.vercel.app" \
  --allowed-o-auth-flows "code" "implicit" \
  --allowed-o-auth-scopes "email" "openid" "profile" \
  --allowed-o-auth-flows-user-pool-client \
  --region us-east-1
```

---

## Step 6: Verify Deployment

### 6.1 Check Deployment Status

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs
```

### 6.2 Test Your Application

1. Visit your Vercel URL: `https://codelearn-abc123.vercel.app`
2. Verify the homepage loads
3. Check browser console for errors

### 6.3 Test OAuth (After Task 3 Implementation)

Once authentication is implemented:
1. Click "Login with GitHub"
2. Verify redirect to GitHub
3. Verify redirect back to your app
4. Repeat for Google OAuth

---

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

If you have a custom domain:

1. Go to Vercel Dashboard > Settings > Domains
2. Add your domain: `codelearn.com`
3. Configure DNS records as shown
4. Wait for DNS propagation (~5-10 minutes)

### 7.2 Update OAuth Callback URLs

After adding custom domain, update:
- GitHub OAuth callback URL
- Google OAuth redirect URIs
- Cognito app client callback URLs

Use your custom domain instead of `vercel.app` URL.

---

## Summary: Correct Order of Operations

✅ **Correct Order (What You're Doing):**
1. Deploy CDK infrastructure to AWS
2. Deploy Next.js app to Vercel → Get production URL
3. Configure GitHub OAuth with Vercel URL
4. Configure Google OAuth with Vercel URL
5. Add OAuth credentials to Vercel environment variables
6. Configure OAuth providers in Cognito
7. Test authentication flow

❌ **Wrong Order (What You Wanted to Avoid):**
1. Configure OAuth with localhost
2. Deploy to Vercel
3. Reconfigure OAuth with production URL (duplicate work!)

---

## Quick Reference Commands

```bash
# Deploy to Vercel
vercel --prod

# Add environment variable
vercel env add VARIABLE_NAME production

# View logs
vercel logs

# List deployments
vercel ls

# Redeploy
vercel --prod --force
```

---

## Troubleshooting

### Issue: Build fails on Vercel

**Solution:**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run lint
```

### Issue: Environment variables not working

**Solution:**
1. Verify variables are set in Vercel Dashboard
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

### Issue: OAuth redirect fails

**Solution:**
1. Verify callback URLs match exactly
2. Check Cognito app client settings
3. Ensure OAuth providers are added to Cognito

---

## Next Steps

After Vercel deployment:
1. ✅ Save your production URL
2. ✅ Configure OAuth with production URL
3. ✅ Add environment variables to Vercel
4. ✅ Continue with Task 2.7 (AWS infrastructure)
5. ✅ Start Task 3 (Authentication implementation)

---

**Your Vercel URL will be:** `https://codelearn-[random].vercel.app`

Save this URL and use it for all OAuth configurations! 🚀

