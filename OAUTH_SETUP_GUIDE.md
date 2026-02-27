# OAuth Setup Guide - Quick Reference

This guide provides step-by-step instructions for setting up GitHub and Google OAuth for the CodeLearn platform.

## Prerequisites

Before starting, you need:
- ✅ AWS CDK infrastructure deployed (Task 2.1-2.6 complete)
- ✅ Cognito User Pool created and domain configured
- ✅ Cognito User Pool Domain URL from CDK output

## Finding Your Cognito Domain

After deploying CDK, get your Cognito domain:

```bash
# Get Cognito domain from CDK output
aws cloudformation describe-stacks \
  --stack-name CodeLearnStack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolDomain`].OutputValue' \
  --output text
```

Your domain will look like: `https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com`

---

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"** button

### Step 2: Fill in Application Details

```
Application name:        CodeLearn Dev
Homepage URL:            http://localhost:3000
Application description: AI-powered learning and developer productivity platform
Authorization callback URL: https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
```

**Example callback URL:**
```
https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
```

### Step 3: Save Credentials

After creating the app:
1. **Copy the Client ID** (shown immediately)
2. Click **"Generate a new client secret"**
3. **Copy the Client Secret** (shown only once - save it now!)

### Step 4: Create Personal Access Token (PAT)

For GitHub API access (repository discovery):

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name: `CodeLearn API Access`
4. Select scopes:
   - ✅ `repo` - Full control of private repositories
   - ✅ `read:user` - Read user profile data
5. Click **"Generate token"**
6. **Copy the token** (shown only once - save it now!)

### Step 5: Add to .env File

```bash
GITHUB_CLIENT_ID=Iv1.1234567890abcdef
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_PAT=ghp_1234567890abcdefghijklmnopqrstuvwxyz
```

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click **"Select a project"** dropdown at the top
3. Click **"New Project"**
4. Enter project name: `CodeLearn`
5. Click **"Create"**

### Step 2: Configure OAuth Consent Screen

1. Navigate to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"Create"**
4. Fill in required fields:

```
App name:                CodeLearn
User support email:      your-email@example.com
App logo:                (optional)
Application home page:   http://localhost:3000
Application privacy policy: http://localhost:3000/privacy (can be placeholder)
Application terms of service: http://localhost:3000/terms (can be placeholder)
Authorized domains:      localhost (for development)
Developer contact:       your-email@example.com
```

5. Click **"Save and Continue"**
6. Skip **"Scopes"** section (click "Save and Continue")
7. Add test users (your email) if needed
8. Click **"Save and Continue"**

### Step 3: Create OAuth Client ID

1. Navigate to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Select **"Web application"**
4. Fill in details:

```
Name: CodeLearn Dev

Authorized JavaScript origins:
- http://localhost:3000
- https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com

Authorized redirect URIs:
- https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
- http://localhost:3000/api/auth/callback/google
```

**Example redirect URI:**
```
https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
```

5. Click **"Create"**

### Step 4: Save Credentials

After creating:
1. **Copy the Client ID** (looks like: `123456789012-abc...xyz.apps.googleusercontent.com`)
2. **Copy the Client Secret** (looks like: `GOCSPX-abc...xyz`)

### Step 5: Add to .env File

```bash
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

---

## Configure Identity Providers in Cognito

After creating OAuth apps, add them to Cognito:

### Add GitHub Provider

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

### Add Google Provider

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

### Verify Providers

```bash
aws cognito-idp list-identity-providers \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1
```

---

## Complete .env File Example

After completing all steps, your `.env` file should look like:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...

# AWS Cognito (from CDK output)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=1234567890abcdefghij
COGNITO_CLIENT_SECRET=your_client_secret_from_cognito
COGNITO_IDENTITY_POOL_ID=us-east-1:12345678-1234-1234-1234-123456789012
COGNITO_USER_POOL_DOMAIN=https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com

# AWS Bedrock
BEDROCK_MODEL_CLAUDE=anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_MODEL_LLAMA=meta.llama3-1-70b-instruct-v1:0

# DynamoDB Tables (from CDK output)
DYNAMODB_TABLE_USERS=codelearn-users-dev
DYNAMODB_TABLE_PROJECTS=codelearn-projects-dev
DYNAMODB_TABLE_LEARNING_PATHS=codelearn-learning-paths-dev
DYNAMODB_TABLE_TEMPLATES=codelearn-templates-dev
DYNAMODB_TABLE_JOBS=codelearn-jobs-dev
DYNAMODB_TABLE_INTEGRATIONS=codelearn-integrations-dev

# S3 Buckets (from CDK output)
S3_BUCKET_PROJECTS=codelearn-user-projects-dev
S3_BUCKET_TEMPLATES=codelearn-templates-dev
S3_BUCKET_ASSETS=codelearn-assets-dev

# SQS Queues (from CDK output)
SQS_QUEUE_AI_JOBS=https://sqs.us-east-1.amazonaws.com/123456789012/codelearn-ai-jobs-queue-dev
SQS_QUEUE_AI_JOBS_DLQ=https://sqs.us-east-1.amazonaws.com/123456789012/codelearn-ai-jobs-dlq-dev

# GitHub OAuth (from GitHub OAuth App)
GITHUB_CLIENT_ID=Iv1.1234567890abcdef
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_PAT=ghp_1234567890abcdefghijklmnopqrstuvwxyz

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Verification Checklist

After setup, verify everything works:

- [ ] GitHub OAuth app created with correct callback URL
- [ ] GitHub PAT created with correct scopes
- [ ] Google OAuth client created with correct redirect URIs
- [ ] Both providers added to Cognito User Pool
- [ ] All credentials added to `.env` file
- [ ] `.env` file not committed to git (check `.gitignore`)

---

## Troubleshooting

### Issue: "Redirect URI mismatch" error

**Cause:** Callback URL in OAuth app doesn't match Cognito domain

**Solution:** 
1. Get exact Cognito domain from CDK output
2. Update callback URL in GitHub/Google OAuth app
3. Format must be: `https://YOUR-DOMAIN.auth.REGION.amazoncognito.com/oauth2/idpresponse`

### Issue: "Invalid client" error

**Cause:** Client ID or secret is incorrect

**Solution:**
1. Verify credentials in GitHub/Google developer console
2. Regenerate client secret if needed
3. Update `.env` file with correct values

### Issue: "Provider not found" error

**Cause:** Identity provider not added to Cognito

**Solution:**
```bash
# Verify providers exist
aws cognito-idp list-identity-providers \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1

# If missing, run create-identity-provider commands above
```

### Issue: GitHub API rate limit

**Cause:** Using unauthenticated GitHub API requests

**Solution:**
- Ensure `GITHUB_PAT` is set in `.env`
- PAT must have `repo` and `read:user` scopes
- Authenticated requests have 5000/hour limit vs 60/hour

---

## Security Best Practices

1. **Never commit `.env` file to git**
   - Verify `.gitignore` includes `.env`
   - Use `.env.example` for template

2. **Rotate secrets regularly**
   - GitHub: Regenerate client secret every 90 days
   - Google: Regenerate client secret every 90 days
   - GitHub PAT: Set expiration date

3. **Use different credentials for production**
   - Create separate OAuth apps for production
   - Use different Cognito User Pool for production
   - Never use development credentials in production

4. **Limit OAuth scopes**
   - Only request necessary permissions
   - GitHub: `user:email` (not full `user`)
   - Google: `profile email openid` (not additional scopes)

---

## Next Steps

After completing OAuth setup:

1. ✅ Test authentication flow locally
2. ✅ Verify user creation in Cognito
3. ✅ Test GitHub API access with PAT
4. ✅ Move to Task 3: Authentication System Implementation

---

**Need Help?**

- GitHub OAuth Docs: https://docs.github.com/en/developers/apps/building-oauth-apps
- Google OAuth Docs: https://developers.google.com/identity/protocols/oauth2
- AWS Cognito Docs: https://docs.aws.amazon.com/cognito/latest/developerguide/

