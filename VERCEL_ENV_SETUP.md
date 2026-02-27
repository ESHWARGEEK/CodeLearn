# 🔐 Vercel Environment Variables Setup

## ✅ Deployment Complete!

Your app is live at: **https://codelearn-lemon.vercel.app**

Now you need to add environment variables to Vercel Dashboard.

---

## 📋 Step 1: Add Environment Variables to Vercel

### Go to Vercel Dashboard

1. Visit: https://vercel.com/eshwars-projects-b22db5cf/codelearn/settings/environment-variables
2. Or navigate: Vercel Dashboard → codelearn project → Settings → Environment Variables

### Add These Variables (Copy-Paste Ready)

**Important:** Replace `YOUR_AWS_ACCESS_KEY` and `YOUR_AWS_SECRET_KEY` with your actual AWS credentials.

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

**Note:** Leave OAuth variables empty for now. We'll add them after creating OAuth apps.

---

## 🔑 Step 2: Create GitHub OAuth App

### 2.1 Create OAuth App

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:

```
Application name: CodeLearn
Homepage URL: https://codelearn-lemon.vercel.app
Authorization callback URL: https://codelearn-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
```

4. Click "Register application"
5. **Save the Client ID** (looks like: `Iv1.1234567890abcdef`)
6. Click "Generate a new client secret"
7. **Save the Client Secret** (looks like: `1234567890abcdef1234567890abcdef12345678`)

### 2.2 Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Note: `CodeLearn API Access`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:user` (Read user profile data)
5. Click "Generate token"
6. **Save the PAT** (looks like: `ghp_1234567890abcdefghijklmnopqrstuvwxyz`)

---

## 🔑 Step 3: Create Google OAuth Credentials

### 3.1 Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Project name: `CodeLearn`
4. Click "Create"

### 3.2 Configure OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Select "External" user type
3. Click "Create"
4. Fill in:

```
App name: CodeLearn
User support email: (your email)
Developer contact: (your email)
```

5. Click "Save and Continue"
6. Scopes: Click "Save and Continue" (use defaults)
7. Test users: Add your email
8. Click "Save and Continue"

### 3.3 Create OAuth Client ID

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: `CodeLearn Web Client`
5. Authorized JavaScript origins:
   - `https://codelearn-lemon.vercel.app`
   - `https://codelearn-dev.auth.us-east-1.amazoncognito.com`
6. Authorized redirect URIs:
   - `https://codelearn-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
   - `https://codelearn-lemon.vercel.app/api/auth/callback/google`
7. Click "Create"
8. **Save the Client ID** (looks like: `123456789012-abc...xyz.apps.googleusercontent.com`)
9. **Save the Client Secret** (looks like: `GOCSPX-abc...xyz`)

---

## 🔐 Step 4: Add OAuth Credentials to Vercel

Go back to Vercel Dashboard → Environment Variables and add:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.YOUR_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET
GITHUB_PAT=ghp_YOUR_PERSONAL_ACCESS_TOKEN

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YOUR_GOOGLE_CLIENT_SECRET
```

**Then redeploy:**

```bash
vercel --prod
```

---

## ⚙️ Step 5: Configure OAuth in AWS Cognito

### 5.1 Add GitHub Provider

```bash
aws cognito-idp create-identity-provider \
  --user-pool-id us-east-1_bNco2tmIx \
  --provider-name GitHub \
  --provider-type OIDC \
  --provider-details \
    client_id= Ov23liegYVHQEUiCdgEv,\
    client_secret=685ecca5efa31c0e5c5cc8cb34467fb76b69d49a,\
    authorize_scopes="user:email",\
    attributes_request_method=GET,\
    oidc_issuer=https://github.com \
  --attribute-mapping email=email,username=preferred_username \
  --region us-east-1
```

### 5.2 Add Google Provider

```bash
aws cognito-idp create-identity-provider \
  --user-pool-id us-east-1_bNco2tmIx \
  --provider-name Google \
  --provider-type Google \
  --provider-details \
    client_id=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com,\
    client_secret=GOCSPX-YOUR_GOOGLE_CLIENT_SECRET,\
    authorize_scopes="profile email openid" \
  --attribute-mapping email=email,username=sub \
  --region us-east-1
```

### 5.3 Update Cognito App Client Callback URLs

```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-1_bNco2tmIx \
  --client-id 1belt192f8jpto6m9f9m3hm6l3 \
  --callback-urls \
    "https://codelearn-lemon.vercel.app/api/auth/callback" \
    "https://codelearn-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse" \
  --logout-urls \
    "https://codelearn-lemon.vercel.app" \
  --allowed-o-auth-flows "code" "implicit" \
  --allowed-o-auth-scopes "email" "openid" "profile" \
  --allowed-o-auth-flows-user-pool-client \
  --region us-east-1
```

---

## ✅ Step 6: Verify Everything

### 6.1 Check Vercel Deployment

```bash
vercel ls
```

### 6.2 Visit Your App

Open: https://codelearn-lemon.vercel.app

### 6.3 Verify Cognito Providers

```bash
aws cognito-idp list-identity-providers \
  --user-pool-id us-east-1_bNco2tmIx \
  --region us-east-1
```

### 6.4 Check Environment Variables

Go to: https://vercel.com/eshwars-projects-b22db5cf/codelearn/settings/environment-variables

Verify all variables are set.

---

## 📋 Checklist

- [ ] Step 1: Add AWS environment variables to Vercel
- [ ] Step 2: Create GitHub OAuth app and PAT
- [ ] Step 3: Create Google OAuth credentials
- [ ] Step 4: Add OAuth credentials to Vercel
- [ ] Step 5: Configure OAuth providers in Cognito
- [ ] Step 6: Verify everything works

---

## 🎯 Important URLs

**Save these for reference:**

```
Vercel Production URL: https://codelearn-lemon.vercel.app
Vercel Dashboard: https://vercel.com/eshwars-projects-b22db5cf/codelearn
Cognito Domain: https://codelearn-dev.auth.us-east-1.amazoncognito.com
Cognito User Pool ID: us-east-1_bNco2tmIx
Cognito Client ID: 1belt192f8jpto6m9f9m3hm6l3

GitHub OAuth Callback: https://codelearn-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
Google OAuth Redirect: https://codelearn-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
```

---

## 🚀 Next Steps

After completing all steps:

1. ✅ Commit and push changes
2. ✅ Create pull request for Task 2
3. ✅ Start Task 3: Authentication System Implementation

---

**Total Time:** ~45 minutes

**Result:** Production deployment with OAuth configured! 🎉
