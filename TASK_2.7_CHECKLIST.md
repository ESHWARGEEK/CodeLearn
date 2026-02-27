# Task 2.7 Completion Checklist

This checklist helps you track progress through Task 2.7: Configure OAuth providers and update environment variables.

## ✅ Completion Checklist

### Phase 1: Deploy AWS Infrastructure

- [ ] **1.1** Navigate to infrastructure directory: `cd codelearn/infrastructure`
- [ ] **1.2** Install dependencies: `npm install`
- [ ] **1.3** Synthesize CloudFormation: `cdk synth`
- [ ] **1.4** Deploy all stacks: `cdk deploy --all`
- [ ] **1.5** Save CDK output values (User Pool ID, Client ID, bucket names, etc.)
- [ ] **1.6** Verify deployment in AWS Console

**Verification Commands:**
```bash
# Check DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Check S3 buckets
aws s3 ls | grep codelearn

# Check Cognito User Pools
aws cognito-idp list-user-pools --max-results 10 --region us-east-1

# Check SQS queues
aws sqs list-queues --region us-east-1 | grep codelearn
```

---

### Phase 2: Configure GitHub OAuth

- [ ] **2.1** Go to https://github.com/settings/developers
- [ ] **2.2** Click "New OAuth App"
- [ ] **2.3** Fill in application details:
  - Application name: `CodeLearn Dev`
  - Homepage URL: `http://localhost:3000`
  - Authorization callback URL: `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
- [ ] **2.4** Save GitHub Client ID
- [ ] **2.5** Generate and save GitHub Client Secret
- [ ] **2.6** Create GitHub Personal Access Token (PAT) at https://github.com/settings/tokens
  - Select scopes: `repo`, `read:user`
- [ ] **2.7** Save GitHub PAT

**Your GitHub OAuth Credentials:**
```
GitHub Client ID: _______________________________
GitHub Client Secret: _______________________________
GitHub PAT: _______________________________
```

---

### Phase 3: Configure Google OAuth

- [ ] **3.1** Go to https://console.cloud.google.com/
- [ ] **3.2** Create new project or select existing project
- [ ] **3.3** Navigate to "APIs & Services" > "Credentials"
- [ ] **3.4** Configure OAuth consent screen:
  - User Type: External
  - App name: CodeLearn
  - User support email: your-email@example.com
- [ ] **3.5** Create OAuth client ID:
  - Application type: Web application
  - Name: CodeLearn Dev
  - Authorized redirect URIs: `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
- [ ] **3.6** Save Google Client ID
- [ ] **3.7** Save Google Client Secret

**Your Google OAuth Credentials:**
```
Google Client ID: _______________________________
Google Client Secret: _______________________________
```

---

### Phase 4: Update Environment Variables

- [ ] **4.1** Open `codelearn/.env` file
- [ ] **4.2** Update AWS Cognito values from CDK output:
  - `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
  - `NEXT_PUBLIC_COGNITO_CLIENT_ID`
  - `COGNITO_CLIENT_SECRET`
- [ ] **4.3** Update DynamoDB table names (if different from defaults)
- [ ] **4.4** Update S3 bucket names from CDK output
- [ ] **4.5** Update SQS queue URLs from CDK output
- [ ] **4.6** Update GitHub OAuth credentials:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `GITHUB_PAT`
- [ ] **4.7** Update Google OAuth credentials:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- [ ] **4.8** Save `.env` file

---

### Phase 5: Verify AWS Resources

- [ ] **5.1** Test Cognito User Pool access:
```bash
aws cognito-idp describe-user-pool \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1
```

- [ ] **5.2** Test DynamoDB table access:
```bash
aws dynamodb describe-table \
  --table-name codelearn-users \
  --region us-east-1
```

- [ ] **5.3** Test S3 bucket access:
```bash
aws s3 ls s3://codelearn-user-projects-dev/
```

- [ ] **5.4** Test SQS queue access:
```bash
aws sqs get-queue-attributes \
  --queue-url YOUR-QUEUE-URL \
  --attribute-names All \
  --region us-east-1
```

---

### Phase 6: Configure OAuth Providers in Cognito

- [ ] **6.1** Add GitHub identity provider to Cognito:
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

- [ ] **6.2** Add Google identity provider to Cognito:
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

- [ ] **6.3** Verify identity providers in Cognito:
```bash
aws cognito-idp list-identity-providers \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1
```

---

### Phase 7: Test AWS CLI Access

- [ ] **7.1** Test DynamoDB scan:
```bash
aws dynamodb scan \
  --table-name codelearn-users \
  --limit 1 \
  --region us-east-1
```

- [ ] **7.2** Test S3 list:
```bash
aws s3 ls s3://codelearn-user-projects-dev/
```

- [ ] **7.3** Test Cognito list users:
```bash
aws cognito-idp list-users \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1
```

---

### Phase 8: Commit and Push Changes

- [ ] **8.1** Stage updated files:
```bash
git add .env
git add TASK_2.7_CHECKLIST.md
```

- [ ] **8.2** Commit with conventional commit message:
```bash
git commit -m "chore: configure OAuth providers and update environment variables"
```

- [ ] **8.3** Push to feature branch:
```bash
git push origin feature/task-2-aws-infrastructure
```

---

### Phase 9: Create Pull Request

- [ ] **9.1** Go to GitHub repository
- [ ] **9.2** Create pull request from `feature/task-2-aws-infrastructure` to `main`
- [ ] **9.3** Use PR template from `PR_TASK_2.md`
- [ ] **9.4** Add description and screenshots
- [ ] **9.5** Request review (if applicable)

---

## 📝 Notes and Issues

Use this section to track any issues or notes during deployment:

```
Issue 1: 
Solution: 

Issue 2:
Solution:

Notes:
- 
- 
```

---

## ✅ Task Completion Criteria

Task 2.7 is complete when:

- [x] All AWS resources deployed successfully
- [x] GitHub OAuth app created and configured
- [x] Google OAuth credentials created and configured
- [x] `.env` file updated with all real values
- [x] AWS resources verified via CLI
- [x] OAuth providers added to Cognito
- [x] Changes committed and pushed
- [x] Pull request created

---

## 🚀 Next Steps

After completing Task 2.7:

1. Review and merge the pull request
2. Start Task 3: Authentication System Implementation
3. Test authentication flows with real OAuth providers

---

**Estimated Time:** 30-45 minutes

**Last Updated:** [Add date when you complete this]
