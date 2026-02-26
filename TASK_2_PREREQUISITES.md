# Task 2 Prerequisites - Quick Checklist

## ✅ Quick Setup Checklist

### 1. AWS Account
- [ ] AWS account created at https://aws.amazon.com/
- [ ] Email verified
- [ ] Payment method added (for verification, free tier available)

### 2. IAM User & Credentials
- [ ] IAM user created (name: `codelearn-dev`)
- [ ] AdministratorAccess policy attached (or specific policies)
- [ ] Access Key created
- [ ] Access Key ID saved: `AKIA...`
- [ ] Secret Access Key saved: `wJalr...`
- [ ] ⚠️ Keys stored securely (NOT in Git)

### 3. AWS CLI
- [ ] AWS CLI installed: `aws --version`
- [ ] AWS CLI configured: `aws configure`
- [ ] Credentials verified: `aws sts get-caller-identity`
- [ ] Default region set: `us-east-1`

### 4. AWS CDK
- [ ] CDK installed globally: `npm install -g aws-cdk`
- [ ] CDK version checked: `cdk --version`
- [ ] Account number retrieved: `aws sts get-caller-identity --query Account --output text`
- [ ] CDK bootstrapped: `cdk bootstrap aws://ACCOUNT-NUMBER/us-east-1`

### 5. Environment Variables
- [ ] `.env.local` file created (copy from `.env.example`)
- [ ] AWS credentials added to `.env.local`
- [ ] `.env.local` added to `.gitignore` (already done in Task 1)

### 6. Cost Management (Recommended)
- [ ] Billing alert set up ($10 threshold)
- [ ] Cost Explorer enabled
- [ ] Free tier usage dashboard checked

---

## 🚀 Quick Start Commands

### Install AWS CLI (Windows)
```powershell
# Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
# Or use Chocolatey:
choco install awscli
```

### Configure AWS CLI
```powershell
aws configure
# Enter: Access Key ID
# Enter: Secret Access Key
# Enter: us-east-1 (region)
# Enter: json (output format)
```

### Verify AWS Setup
```powershell
# Check AWS identity
aws sts get-caller-identity

# Should output:
# {
#     "UserId": "AIDAXXXXXXXXXXXXXXXXX",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/codelearn-dev"
# }
```

### Install and Bootstrap CDK
```powershell
# Install CDK globally
npm install -g aws-cdk

# Get your account number
aws sts get-caller-identity --query Account --output text

# Bootstrap CDK (replace ACCOUNT-NUMBER with your account)
cdk bootstrap aws://ACCOUNT-NUMBER/us-east-1
```

---

## 📝 What Task 2 Will Do

Task 2 will create AWS infrastructure using CDK:

### Resources to be Created:

1. **DynamoDB Tables (6 tables)**
   - users
   - projects
   - learning_paths
   - templates
   - jobs
   - integrations

2. **S3 Buckets (3 buckets)**
   - user-projects-dev
   - templates-dev
   - assets-dev

3. **Cognito**
   - User Pool
   - Identity Pool
   - OAuth providers (GitHub, Google)

4. **SQS Queues (2 queues)**
   - ai-jobs-queue
   - ai-jobs-dlq (dead-letter queue)

5. **IAM Roles & Policies**
   - Lambda execution roles
   - ECS task roles
   - S3 access policies

---

## 💰 Cost Estimate

**Within AWS Free Tier:**
- DynamoDB: 25 GB storage (free)
- S3: 5 GB storage (free)
- Cognito: 50,000 MAUs (free)
- SQS: 1M requests/month (free)
- Lambda: 1M requests/month (free)

**Expected Cost for MVP:** $0 - $5/month (if staying within free tier)

---

## ⚠️ Important Notes

1. **Never commit AWS credentials to Git**
   - `.env.local` is already in `.gitignore`
   - Double-check before committing

2. **Use IAM User, not Root Account**
   - Root account should only be used for account management
   - Always use IAM user for development

3. **Set up Billing Alerts**
   - Prevents unexpected charges
   - Get notified before costs exceed budget

4. **Region Consistency**
   - Use `us-east-1` for all resources
   - Keeps latency low and simplifies management

---

## 🆘 Common Issues

### Issue: "Unable to locate credentials"
```powershell
# Solution: Configure AWS CLI
aws configure
```

### Issue: "Access Denied"
```powershell
# Solution: Check IAM permissions
# Go to IAM Console → Users → Your User → Permissions
# Ensure AdministratorAccess is attached
```

### Issue: CDK Bootstrap Fails
```powershell
# Solution: Verify account number and try again
aws sts get-caller-identity
cdk bootstrap aws://YOUR-ACCOUNT-NUMBER/us-east-1
```

---

## ✅ Ready to Start Task 2?

Once all checkboxes above are checked, you're ready!

**Next Steps:**
1. Merge Task 1 PR
2. Pull latest main branch
3. Tell me you're ready, and I'll start Task 2

---

## 📚 Helpful Resources

- **AWS Setup Guide:** See `AWS_SETUP_GUIDE.md` for detailed instructions
- **AWS Console:** https://console.aws.amazon.com/
- **AWS CLI Docs:** https://docs.aws.amazon.com/cli/
- **AWS CDK Docs:** https://docs.aws.amazon.com/cdk/
- **AWS Free Tier:** https://aws.amazon.com/free/

---

**Estimated Setup Time:** 15-30 minutes

**Ready?** Let's build! 🚀
