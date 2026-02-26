# AWS Setup Guide for Task 2

## 📋 Prerequisites for Task 2: AWS Infrastructure Setup

Task 2 involves setting up AWS infrastructure using AWS CDK. Here's everything you need to have ready:

---

## 1. AWS Account Setup

### ✅ Create AWS Account (If you don't have one)

1. **Go to:** https://aws.amazon.com/
2. **Click:** "Create an AWS Account"
3. **Provide:**
   - Email address
   - Password
   - AWS account name
   - Contact information
   - Payment method (credit/debit card)
   - Phone verification

**Important:** AWS Free Tier includes:
- 750 hours/month of EC2 t2.micro instances
- 25 GB DynamoDB storage
- 5 GB S3 storage
- 1 million Lambda requests/month
- Many other free services for 12 months

---

## 2. AWS Credentials Setup

### Option A: AWS IAM User (Recommended for Development)

**Step 1: Create IAM User**

1. **Login to AWS Console:** https://console.aws.amazon.com/
2. **Go to IAM:** Search for "IAM" in the search bar
3. **Click:** "Users" → "Create user"
4. **User name:** `codelearn-dev`
5. **Check:** "Provide user access to the AWS Management Console" (optional)
6. **Click:** "Next"

**Step 2: Attach Permissions**

Choose one of these options:

**Option 1: Administrator Access (Easiest for development)**
- Select: "Attach policies directly"
- Search and select: `AdministratorAccess`
- Click: "Next" → "Create user"

**Option 2: Specific Permissions (More secure)**
- Select: "Attach policies directly"
- Search and select these policies:
  - `AmazonDynamoDBFullAccess`
  - `AmazonS3FullAccess`
  - `AmazonCognitoPowerUser`
  - `AmazonSQSFullAccess`
  - `AmazonECSFullAccess`
  - `AWSLambdaFullAccess`
  - `CloudWatchLogsFullAccess`
  - `IAMFullAccess` (needed for CDK to create roles)
  - `AWSCloudFormationFullAccess` (needed for CDK)

**Step 3: Create Access Keys**

1. **Click on the user** you just created
2. **Go to:** "Security credentials" tab
3. **Scroll to:** "Access keys"
4. **Click:** "Create access key"
5. **Select:** "Command Line Interface (CLI)"
6. **Check:** "I understand the above recommendation"
7. **Click:** "Next" → "Create access key"
8. **IMPORTANT:** Download the CSV file or copy:
   - Access Key ID (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - Secret Access Key (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

⚠️ **Security Warning:** Never commit these keys to Git! Keep them secure.

---

## 3. AWS CLI Installation

### Windows (PowerShell)

**Option 1: MSI Installer (Recommended)**
```powershell
# Download and run the AWS CLI MSI installer
# Go to: https://awscli.amazonaws.com/AWSCLIV2.msi
# Run the installer
```

**Option 2: Using Chocolatey**
```powershell
choco install awscli
```

**Verify Installation:**
```powershell
aws --version
# Should output: aws-cli/2.x.x Python/3.x.x Windows/...
```

### Configure AWS CLI

```powershell
aws configure
```

**Enter when prompted:**
```
AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: YOUR_SECRET_ACCESS_KEY
Default region name [None]: us-east-1
Default output format [None]: json
```

**Verify Configuration:**
```powershell
aws sts get-caller-identity
```

**Expected output:**
```json
{
    "UserId": "AIDAXXXXXXXXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/codelearn-dev"
}
```

---

## 4. AWS CDK Installation

### Install AWS CDK CLI

```powershell
npm install -g aws-cdk
```

**Verify Installation:**
```powershell
cdk --version
# Should output: 2.x.x (build ...)
```

### Bootstrap CDK (One-time setup per AWS account/region)

```powershell
cd codelearn
cdk bootstrap aws://ACCOUNT-NUMBER/us-east-1
```

**To get your account number:**
```powershell
aws sts get-caller-identity --query Account --output text
```

**Expected output:**
```
⏳  Bootstrapping environment aws://123456789012/us-east-1...
✅  Environment aws://123456789012/us-east-1 bootstrapped.
```

---

## 5. AWS Services Overview (What Task 2 Will Create)

### Services We'll Set Up:

1. **Amazon DynamoDB** - NoSQL database
   - Tables: users, projects, learning_paths, templates, jobs, integrations
   - Cost: Free tier includes 25 GB storage

2. **Amazon S3** - Object storage
   - Buckets: user-projects, templates, assets
   - Cost: Free tier includes 5 GB storage

3. **Amazon Cognito** - Authentication
   - User Pools for authentication
   - Identity Pools for federated identities
   - Cost: Free tier includes 50,000 MAUs

4. **Amazon SQS** - Message queue
   - Queues: ai-jobs-queue, ai-jobs-dlq
   - Cost: Free tier includes 1 million requests/month

5. **AWS CloudWatch** - Logging and monitoring
   - Log groups for application logs
   - Cost: Free tier includes 5 GB logs

---

## 6. Environment Variables Setup

After AWS setup, update your `.env.local` file:

```bash
# Copy the example file
cp .env.example .env.local
```

**Edit `.env.local` with your AWS credentials:**

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_ACCOUNT_ID=your_account_number_here

# These will be populated after Task 2 deployment
DYNAMODB_TABLE_USERS=codelearn-users-dev
DYNAMODB_TABLE_PROJECTS=codelearn-projects-dev
DYNAMODB_TABLE_LEARNING_PATHS=codelearn-learning-paths-dev
DYNAMODB_TABLE_TEMPLATES=codelearn-templates-dev
DYNAMODB_TABLE_JOBS=codelearn-jobs-dev
DYNAMODB_TABLE_INTEGRATIONS=codelearn-integrations-dev

S3_BUCKET_PROJECTS=codelearn-user-projects-dev
S3_BUCKET_TEMPLATES=codelearn-templates-dev
S3_BUCKET_ASSETS=codelearn-assets-dev

SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/ai-jobs-queue
SQS_DLQ_URL=https://sqs.us-east-1.amazonaws.com/123456789012/ai-jobs-dlq

# Cognito (will be populated after Task 2)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
COGNITO_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 7. AWS Cost Optimization Tips

### Stay Within Free Tier:

1. **Use Free Tier Services:**
   - DynamoDB: On-demand billing (pay per request)
   - S3: Standard storage class
   - Lambda: 1M requests/month free
   - Cognito: 50K MAUs free

2. **Set Up Billing Alerts:**
   ```
   AWS Console → Billing → Budgets → Create budget
   - Budget type: Cost budget
   - Amount: $10/month
   - Alert threshold: 80% ($8)
   ```

3. **Enable Cost Explorer:**
   ```
   AWS Console → Cost Management → Cost Explorer
   - Enable Cost Explorer
   - Monitor daily costs
   ```

4. **Tag Resources:**
   - All resources will be tagged with: `Project: CodeLearn`
   - This helps track costs per project

---

## 8. Pre-Task 2 Checklist

Before starting Task 2, verify you have:

- [ ] AWS Account created
- [ ] IAM User created with appropriate permissions
- [ ] Access Key ID and Secret Access Key saved securely
- [ ] AWS CLI installed and configured
- [ ] AWS CDK CLI installed globally
- [ ] CDK bootstrapped in your AWS account/region
- [ ] `.env.local` file created with AWS credentials
- [ ] Billing alerts set up (recommended)
- [ ] Account number retrieved: `aws sts get-caller-identity`

---

## 9. Quick Verification Commands

Run these to verify everything is set up:

```powershell
# 1. Check AWS CLI
aws --version

# 2. Check AWS credentials
aws sts get-caller-identity

# 3. Check CDK
cdk --version

# 4. Check Node.js (required for CDK)
node --version  # Should be 20.x

# 5. List S3 buckets (should work without errors)
aws s3 ls

# 6. Check DynamoDB access
aws dynamodb list-tables
```

**All commands should run without errors.**

---

## 10. Troubleshooting

### Problem: "Unable to locate credentials"
**Solution:**
```powershell
aws configure
# Re-enter your credentials
```

### Problem: "Access Denied" errors
**Solution:**
- Check IAM user has correct permissions
- Verify access keys are correct
- Try using AdministratorAccess policy temporarily

### Problem: CDK bootstrap fails
**Solution:**
```powershell
# Make sure you're using the correct account number
aws sts get-caller-identity

# Try bootstrapping again with explicit account/region
cdk bootstrap aws://YOUR_ACCOUNT_NUMBER/us-east-1
```

### Problem: "Region not specified"
**Solution:**
```powershell
# Set default region
aws configure set region us-east-1
```

---

## 11. AWS Activate Credits (Optional but Recommended)

If you're a startup or student, you can get AWS credits:

### AWS Activate for Startups:
- **Credits:** $1,000 - $100,000
- **Apply:** https://aws.amazon.com/activate/
- **Requirements:** Be part of an accelerator, incubator, or VC-backed

### AWS Educate (For Students):
- **Credits:** $100/year
- **Apply:** https://aws.amazon.com/education/awseducate/
- **Requirements:** Valid student email (.edu)

### GitHub Student Developer Pack:
- **Includes:** $200 AWS credits
- **Apply:** https://education.github.com/pack
- **Requirements:** Valid student status

---

## 12. Security Best Practices

### ✅ DO:
- Use IAM users (not root account) for development
- Enable MFA on root account
- Rotate access keys every 90 days
- Use environment variables for credentials
- Add `.env.local` to `.gitignore`
- Set up billing alerts

### ❌ DON'T:
- Commit AWS credentials to Git
- Share access keys publicly
- Use root account for daily tasks
- Leave unused resources running
- Ignore billing alerts

---

## 13. Next Steps

Once you have everything set up:

1. ✅ Verify all checklist items above
2. ✅ Merge Task 1 PR to main branch
3. ✅ Pull latest main branch
4. 🚀 Ready to start Task 2!

---

## 📞 Need Help?

- **AWS Documentation:** https://docs.aws.amazon.com/
- **AWS CLI Reference:** https://docs.aws.amazon.com/cli/
- **AWS CDK Documentation:** https://docs.aws.amazon.com/cdk/
- **AWS Free Tier:** https://aws.amazon.com/free/

---

## Summary: What You Need

**Minimum Requirements:**
1. AWS Account
2. IAM User with AdministratorAccess
3. Access Key ID + Secret Access Key
4. AWS CLI installed and configured
5. AWS CDK CLI installed
6. CDK bootstrapped

**Time Required:** 15-30 minutes for complete setup

**Cost:** $0 (within free tier limits)

Once you have these, you're ready for Task 2! 🚀
