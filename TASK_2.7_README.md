# Task 2.7 - Ready to Execute! 🚀

## What This Task Does

Task 2.7 completes your AWS infrastructure setup by:
1. Deploying your CDK code to AWS (creating real resources)
2. Setting up OAuth authentication with GitHub and Google
3. Connecting everything together with environment variables

## 📚 Documentation Created

I've created comprehensive guides to help you:

| Document | Purpose |
|----------|---------|
| **TASK_2.7_INSTRUCTIONS.md** | Main guide - start here! |
| **TASK_2.7_CHECKLIST.md** | Step-by-step checklist with checkboxes |
| **OAUTH_SETUP_GUIDE.md** | Detailed OAuth configuration guide |
| **scripts/update-env-from-cdk.sh** | Bash script to extract CDK outputs |
| **scripts/update-env-from-cdk.ps1** | PowerShell script to extract CDK outputs |

## ⚠️ IMPORTANT: New Workflow!

**Deploy to Vercel First!** This way you configure OAuth with your production URL and only do it once.

**Follow:** `DEPLOYMENT_WORKFLOW.md` for the complete workflow.

---

## 🎯 Quick Start

### 1. Deploy to AWS (5-10 minutes)

```bash
cd codelearn/infrastructure
npm install
npx cdk deploy --all
```

Save all the output values - you'll need them!

### 2. Extract Environment Variables (1 minute)

**Windows:**
```powershell
cd ..
.\scripts\update-env-from-cdk.ps1
```

**macOS/Linux:**
```bash
cd ..
chmod +x scripts/update-env-from-cdk.sh
./scripts/update-env-from-cdk.sh
```

### 3. Configure OAuth (15-20 minutes)

Follow **OAUTH_SETUP_GUIDE.md** to:
- Create GitHub OAuth app
- Create Google OAuth credentials
- Add providers to Cognito

### 4. Update .env File (5 minutes)

Merge values from `.env.cdk-outputs` and your OAuth credentials into `.env`

### 5. Verify Everything Works (5 minutes)

```bash
# Test AWS access
aws dynamodb list-tables --region us-east-1
aws s3 ls | grep codelearn
aws cognito-idp list-user-pools --max-results 10 --region us-east-1
```

### 6. Commit and Create PR (5 minutes)

```bash
git add TASK_2.7_*.md OAUTH_SETUP_GUIDE.md scripts/
git commit -m "chore: configure OAuth providers and update environment variables"
git push origin feature/task-2-aws-infrastructure
```

Then create a pull request on GitHub!

## ✅ What You'll Have After This Task

- ✅ 6 DynamoDB tables for data storage
- ✅ 3 S3 buckets for file storage
- ✅ Cognito User Pool for authentication
- ✅ 2 SQS queues for async job processing
- ✅ GitHub OAuth integration
- ✅ Google OAuth integration
- ✅ Complete `.env` file with real values

## 💰 Cost

**Good news!** Everything stays within AWS free tier for development:
- DynamoDB: Free tier covers development usage
- S3: Free tier covers < 5GB storage
- Cognito: Free tier covers < 50,000 users/month
- SQS: Free tier covers < 1M requests/month

**Estimated cost: $0-5/month** for development

## 🆘 Need Help?

1. **Start with:** TASK_2.7_INSTRUCTIONS.md (main guide)
2. **Use checklist:** TASK_2.7_CHECKLIST.md (track progress)
3. **OAuth setup:** OAUTH_SETUP_GUIDE.md (detailed steps)
4. **Troubleshooting:** Check the troubleshooting sections in each guide

## 🎉 After Completion

Once Task 2.7 is done:
1. Merge your pull request
2. You're ready for Task 3: Authentication System Implementation!

---

**Estimated Total Time:** 30-45 minutes

**Let's deploy!** Start with **TASK_2.7_INSTRUCTIONS.md** 🚀

