# Task 2.7: Configure OAuth Providers and Update Environment Variables

## 📋 Overview

This task completes the AWS Infrastructure Setup by deploying the CDK stacks to AWS, configuring OAuth providers (GitHub and Google), and updating environment variables with real resource IDs.

**Status:** Ready to execute  
**Prerequisites:** Tasks 2.1-2.6 completed (CDK code written)  
**Estimated Time:** 30-45 minutes  
**Branch:** `feature/task-2-aws-infrastructure`

---

## 🎯 Task Objectives

1. Deploy CDK infrastructure to AWS (create actual resources)
2. Create and configure GitHub OAuth application
3. Create and configure Google OAuth credentials
4. Update `.env` file with real AWS resource IDs
5. Verify all AWS resources are accessible
6. Test AWS CLI access to deployed resources
7. Commit changes and create pull request

---

## 📚 Documentation Reference

This task has comprehensive documentation to guide you:

1. **TASK_2.7_CHECKLIST.md** - Step-by-step checklist with checkboxes
2. **OAUTH_SETUP_GUIDE.md** - Detailed OAuth setup instructions
3. **TASK_2.7_DEPLOYMENT_GUIDE.md** - Complete deployment walkthrough
4. **DEPLOYMENT_GUIDE.md** - General CDK deployment reference

---

## ⚠️ IMPORTANT: Deploy to Vercel First!

**Smart Strategy:** Deploy your Next.js app to Vercel FIRST to get your production URL, then configure OAuth with that URL. This way you only configure OAuth once!

**See:** `DEPLOYMENT_WORKFLOW.md` for the complete step-by-step workflow.

**See:** `VERCEL_DEPLOYMENT_GUIDE.md` for detailed Vercel deployment instructions.

---

## 🚀 Quick Start Guide

### Step 1: Deploy AWS Infrastructure

```bash
# Navigate to codelearn directory (where cdk.json is located)
cd codelearn

# Install dependencies
npm install

# Synthesize CloudFormation templates (verify)
npx cdk synth

# Deploy all stacks to AWS
npx cdk deploy --all

# Save the output values - you'll need them!
```

**Expected Output:**

```
✅ CodeLearnStack

Outputs:
CodeLearnStack.UserPoolId = us-east-1_XXXXXXXXX
CodeLearnStack.UserPoolClientId = 1234567890abcdefghij
CodeLearnStack.UserPoolDomain = https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com
...
```

### Step 2: Extract CDK Outputs Automatically

Use the provided script to extract all CDK outputs:

**On Windows (PowerShell):**

```powershell
# You're already in codelearn directory
.\scripts\update-env-from-cdk.ps1
```

**On macOS/Linux (Bash):**

```bash
# You're already in codelearn directory
chmod +x scripts/update-env-from-cdk.sh
./scripts/update-env-from-cdk.sh
```

This creates `.env.cdk-outputs` with all AWS resource IDs.

### Step 3: Configure OAuth Providers

Follow the detailed guide in **OAUTH_SETUP_GUIDE.md**:

**GitHub OAuth:**

1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Set callback URL: `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
4. Save Client ID and Client Secret
5. Create Personal Access Token with `repo` and `read:user` scopes

**Google OAuth:**

1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Configure OAuth consent screen
4. Create OAuth client ID (Web application)
5. Set redirect URI: `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
6. Save Client ID and Client Secret

### Step 4: Update .env File

Merge values from `.env.cdk-outputs` and your OAuth credentials into `.env`:

```bash
# AWS Cognito (from CDK output)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=1234567890abcdefghij
COGNITO_USER_POOL_DOMAIN=https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com

# GitHub OAuth (from GitHub)
GITHUB_CLIENT_ID=Iv1.1234567890abcdef
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_PAT=ghp_1234567890abcdefghijklmnopqrstuvwxyz

# Google OAuth (from Google Cloud)
GOOGLE_CLIENT_ID=123456789012-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc...xyz

# ... (other values from .env.cdk-outputs)
```

### Step 5: Add OAuth Providers to Cognito

```bash
# Add GitHub provider
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

# Add Google provider
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

### Step 6: Verify Deployment

```bash
# Verify DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Verify S3 buckets
aws s3 ls | grep codelearn

# Verify Cognito User Pool
aws cognito-idp describe-user-pool \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1

# Verify identity providers
aws cognito-idp list-identity-providers \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1

# Verify SQS queues
aws sqs list-queues --region us-east-1 | grep codelearn
```

### Step 7: Commit and Push

```bash
# Stage changes (DO NOT commit .env file!)
git add TASK_2.7_CHECKLIST.md
git add OAUTH_SETUP_GUIDE.md
git add TASK_2.7_INSTRUCTIONS.md
git add scripts/update-env-from-cdk.sh
git add scripts/update-env-from-cdk.ps1

# Commit with conventional commit message
git commit -m "chore: configure OAuth providers and update environment variables"

# Push to feature branch
git push origin feature/task-2-aws-infrastructure
```

### Step 8: Create Pull Request

1. Go to GitHub repository: https://github.com/ESHWARGEEK/CodeLearn
2. Click "Pull requests" > "New pull request"
3. Select base: `main`, compare: `feature/task-2-aws-infrastructure`
4. Use PR template from `PR_TASK_2.md`
5. Add description and verification screenshots
6. Create pull request

---

## ✅ Completion Criteria

Task 2.7 is complete when:

- [x] CDK stacks deployed successfully to AWS
- [x] All AWS resources created (DynamoDB, S3, Cognito, SQS)
- [x] GitHub OAuth app created and configured
- [x] Google OAuth credentials created and configured
- [x] OAuth providers added to Cognito User Pool
- [x] `.env` file updated with all real values
- [x] AWS resources verified via CLI
- [x] Changes committed to feature branch
- [x] Pull request created for "AWS Infrastructure Setup"

---

## 📊 Resources Created

After deployment, you'll have:

**DynamoDB Tables (6):**

- `codelearn-users-dev`
- `codelearn-projects-dev`
- `codelearn-learning-paths-dev`
- `codelearn-templates-dev`
- `codelearn-jobs-dev`
- `codelearn-integrations-dev`

**S3 Buckets (3):**

- `codelearn-user-projects-dev`
- `codelearn-templates-dev`
- `codelearn-assets-dev`

**Cognito:**

- User Pool with email/password authentication
- User Pool Client for web application
- Identity Pool for federated identities
- OAuth providers (GitHub, Google)

**SQS Queues (2):**

- `codelearn-ai-jobs-queue-dev`
- `codelearn-ai-jobs-dlq-dev`

---

## 💰 Cost Estimate

**Development Environment:**

- DynamoDB: ~$5/month (on-demand, minimal usage)
- S3: ~$2/month (< 10GB storage)
- Cognito: Free tier (< 50,000 MAU)
- SQS: Free tier (< 1M requests)
- **Total: ~$7-10/month**

All services have free tier coverage for development!

---

## 🔧 Troubleshooting

### CDK Deploy Fails

**Issue:** "No credentials" or "Access Denied"

**Solution:**

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Reconfigure if needed
aws configure
```

### OAuth Callback URL Mismatch

**Issue:** "Redirect URI mismatch" error during OAuth

**Solution:**

1. Get exact Cognito domain from CDK output
2. Update callback URL in GitHub/Google OAuth app
3. Format: `https://YOUR-DOMAIN.auth.REGION.amazoncognito.com/oauth2/idpresponse`

### Stack Already Exists

**Issue:** CDK deploy fails with "Stack already exists"

**Solution:**

```bash
# Update existing stack
npx cdk deploy --all --force
```

### Cannot Access DynamoDB Table

**Issue:** "AccessDeniedException" when testing DynamoDB

**Solution:**

```bash
# Check IAM permissions
aws iam get-user

# Ensure AdministratorAccess policy is attached
```

---

## 📖 Additional Resources

- **AWS CDK Documentation:** https://docs.aws.amazon.com/cdk/
- **GitHub OAuth Guide:** https://docs.github.com/en/developers/apps/building-oauth-apps
- **Google OAuth Guide:** https://developers.google.com/identity/protocols/oauth2
- **AWS Cognito Documentation:** https://docs.aws.amazon.com/cognito/

---

## 🎯 Next Steps

After completing Task 2.7:

1. ✅ Review and merge the pull request
2. ✅ Verify all AWS resources in AWS Console
3. ✅ Test OAuth flows manually (optional)
4. ✅ Start Task 3: Authentication System Implementation

---

## 📝 Notes

- **Security:** Never commit `.env` file to git (verify `.gitignore`)
- **Credentials:** Store OAuth secrets securely
- **Cleanup:** Use `npx cdk destroy --all` to remove resources when done
- **Monitoring:** Set up AWS billing alerts to avoid unexpected charges

---

**Ready to deploy? Follow the checklist in TASK_2.7_CHECKLIST.md!** 🚀
