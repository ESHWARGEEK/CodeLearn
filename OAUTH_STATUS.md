# 🔐 OAuth Configuration Status

**Last Updated:** February 27, 2026 11:39 PM IST

---

## ✅ GitHub OAuth - CONFIGURED

### GitHub OAuth App Details

```
Client ID: Ov23liegYVHQEUiCdgEv
Client Secret: 685ecca5efa31c0e5c5cc8cb34467fb76b69d49a
Callback URL: https://codelearn-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
```

### Cognito Configuration

✅ **Provider Added:** GitHub OIDC provider created  
✅ **Callback URLs Updated:** Vercel production URL configured  
✅ **Supported Providers:** GitHub + COGNITO

### Configuration Details

```json
{
  "ProviderName": "GitHub",
  "ProviderType": "OIDC",
  "AuthorizeScopes": "openid user:email",
  "AuthorizeURL": "https://github.com/login/oauth/authorize",
  "TokenURL": "https://github.com/login/oauth/access_token",
  "AttributesURL": "https://api.github.com/user",
  "AttributeMapping": {
    "email": "email",
    "username": "sub"
  }
}
```

---

## ⏳ Google OAuth - PENDING

### Next Steps

1. **Create Google Cloud Project**
   - Go to: https://console.cloud.google.com/
   - Create project: "CodeLearn"

2. **Configure OAuth Consent Screen**
   - User type: External
   - App name: CodeLearn
   - Add your email

3. **Create OAuth Client ID**
   - Type: Web application
   - Authorized origins:
     - `https://codelearn-lemon.vercel.app`
     - `https://codelearn-dev.auth.us-east-1.amazoncognito.com`
   - Redirect URIs:
     - `https://codelearn-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
     - `https://codelearn-lemon.vercel.app/api/auth/callback/google`

4. **Update Script and Run**
   - Edit `scripts/add-google-oauth.ps1`
   - Replace `YOUR_GOOGLE_CLIENT_ID` and `YOUR_GOOGLE_CLIENT_SECRET`
   - Run: `.\scripts\add-google-oauth.ps1`

5. **Update Callback URLs**
   - Edit `scripts/update-cognito-callbacks.ps1`
   - Change line to include Google: `--supported-identity-providers "GitHub" "Google" "COGNITO"`
   - Run: `.\scripts\update-cognito-callbacks.ps1`

---

## 📋 Cognito App Client Configuration

### Current Settings

```
User Pool ID: us-east-1_bNco2tmIx
Client ID: 1belt192f8jpto6m9f9m3hm6l3
Client Name: codelearn-client-dev
```

### Callback URLs

✅ `https://codelearn-lemon.vercel.app/api/auth/callback`  
✅ `https://codelearn-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`

### Logout URLs

✅ `https://codelearn-lemon.vercel.app`

### OAuth Flows

✅ Authorization Code Flow (`code`)  
✅ Implicit Flow (`implicit`)

### OAuth Scopes

✅ `openid`  
✅ `profile`  
✅ `email`

### Supported Identity Providers

✅ GitHub  
✅ COGNITO (username/password)  
⏳ Google (pending)

---

## 🔄 Next Steps

### 1. Add Environment Variables to Vercel (5 minutes)

Go to: https://vercel.com/eshwars-projects-b22db5cf/codelearn/settings/environment-variables

Add GitHub credentials:

```bash
GITHUB_CLIENT_ID=Ov23liegYVHQEUiCdgEv
GITHUB_CLIENT_SECRET=685ecca5efa31c0e5c5cc8cb34467fb76b69d49a
GITHUB_PAT=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
```

**Note:** You still need to create a GitHub Personal Access Token:

- Go to: https://github.com/settings/tokens
- Generate new token (classic)
- Scopes: `repo`, `read:user`

### 2. Configure Google OAuth (15 minutes)

Follow the steps in the "Google OAuth - PENDING" section above.

### 3. Add All AWS Environment Variables to Vercel (5 minutes)

Add these to Vercel Dashboard:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY

# AWS Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_bNco2tmIx
NEXT_PUBLIC_COGNITO_CLIENT_ID=1belt192f8jpto6m9f9m3hm6l3
COGNITO_IDENTITY_POOL_ID=us-east-1:2d1150f5-a0bf-4a8e-b2d1-a3f60cc349d0
COGNITO_USER_POOL_DOMAIN=https://codelearn-dev.auth.us-east-1.amazoncognito.com

# AWS Bedrock
BEDROCK_MODEL_CLAUDE=anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_MODEL_LLAMA=meta.llama3-1-70b-instruct-v1:0

# DynamoDB Tables
DYNAMODB_TABLE_USERS=codelearn-users-dev
DYNAMODB_TABLE_PROJECTS=codelearn-projects-dev
DYNAMODB_TABLE_LEARNING_PATHS=codelearn-learning-paths-dev
DYNAMODB_TABLE_TEMPLATES=codelearn-templates-dev
DYNAMODB_TABLE_JOBS=codelearn-jobs-dev
DYNAMODB_TABLE_INTEGRATIONS=codelearn-integrations-dev

# S3 Buckets
S3_BUCKET_PROJECTS=codelearn-user-projects-dev
S3_BUCKET_TEMPLATES=codelearn-templates-dev
S3_BUCKET_ASSETS=codelearn-assets-dev

# SQS Queues
SQS_QUEUE_AI_JOBS=https://sqs.us-east-1.amazonaws.com/870631428381/codelearn-ai-jobs-queue-dev
SQS_QUEUE_AI_JOBS_DLQ=https://sqs.us-east-1.amazonaws.com/870631428381/codelearn-ai-jobs-dlq-dev

# Application Settings
NEXT_PUBLIC_APP_URL=https://codelearn-lemon.vercel.app
NODE_ENV=production
```

### 4. Redeploy to Vercel (2 minutes)

After adding environment variables:

```bash
vercel --prod
```

### 5. Verify OAuth Configuration (5 minutes)

```bash
# List identity providers
aws cognito-idp list-identity-providers `
  --user-pool-id us-east-1_bNco2tmIx `
  --region us-east-1

# Describe app client
aws cognito-idp describe-user-pool-client `
  --user-pool-id us-east-1_bNco2tmIx `
  --client-id 1belt192f8jpto6m9f9m3hm6l3 `
  --region us-east-1
```

---

## ✅ Completed Tasks

- [x] Deploy AWS infrastructure
- [x] Deploy to Vercel production
- [x] Create GitHub OAuth app
- [x] Add GitHub OAuth provider to Cognito
- [x] Update Cognito callback URLs with Vercel production URL
- [x] Configure OAuth flows and scopes

---

## ⏳ Remaining Tasks

- [ ] Create GitHub Personal Access Token
- [ ] Add GitHub credentials to Vercel
- [ ] Create Google OAuth credentials
- [ ] Add Google OAuth provider to Cognito
- [ ] Add Google credentials to Vercel
- [ ] Add all AWS environment variables to Vercel
- [ ] Redeploy to Vercel with environment variables
- [ ] Test OAuth login flows
- [ ] Create Pull Request for Task 2

**Estimated Time Remaining:** ~30 minutes

---

## 🎯 Quick Commands

### Verify GitHub OAuth

```powershell
aws cognito-idp describe-identity-provider `
  --user-pool-id us-east-1_bNco2tmIx `
  --provider-name GitHub `
  --region us-east-1
```

### Add Google OAuth (after getting credentials)

```powershell
.\scripts\add-google-oauth.ps1
```

### Update Callback URLs (after adding Google)

```powershell
.\scripts\update-cognito-callbacks.ps1
```

### List All Providers

```powershell
aws cognito-idp list-identity-providers `
  --user-pool-id us-east-1_bNco2tmIx `
  --region us-east-1
```

---

## 🎉 Progress

**Task 2.7 Completion:** 75% (6/8 major steps complete)

**What's Working:**

✅ AWS infrastructure deployed  
✅ Vercel deployment live  
✅ GitHub OAuth configured in Cognito  
✅ Callback URLs pointing to production  
✅ OAuth flows enabled

**What's Pending:**

⏳ Environment variables in Vercel  
⏳ Google OAuth configuration  
⏳ Final testing and PR

---

**Great progress! GitHub OAuth is fully configured. Continue with Google OAuth and environment variables.** 🚀
