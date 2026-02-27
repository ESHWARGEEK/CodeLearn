# AWS Permission Fix - CDK Bootstrap Error

## 🔴 Error Summary

**Error:** `User: arn:aws:iam::870631428381:user/codelearn-dev is not authorized to perform: ecr:CreateRepository`

**Cause:** Your IAM user is missing ECR (Elastic Container Registry) permissions needed for CDK bootstrap.

---

## ✅ Solution: Add Missing Permissions

### Option 1: Add ECR Permission (Quick Fix)

1. **Go to AWS Console:** https://console.aws.amazon.com/iam/
2. **Navigate to:** IAM → Users → `codelearn-dev`
3. **Click:** "Add permissions" → "Attach policies directly"
4. **Search and select:** `AmazonEC2ContainerRegistryFullAccess`
5. **Click:** "Next" → "Add permissions"

### Option 2: Use AdministratorAccess (Easiest for Development)

1. **Go to AWS Console:** https://console.aws.amazon.com/iam/
2. **Navigate to:** IAM → Users → `codelearn-dev`
3. **Click:** "Add permissions" → "Attach policies directly"
4. **Search and select:** `AdministratorAccess`
5. **Click:** "Next" → "Add permissions"

**Note:** AdministratorAccess gives full access to all AWS services. This is fine for development but should be restricted in production.

---

## 🧹 Clean Up Failed Bootstrap Stack

Before retrying, you need to clean up the failed CloudFormation stack:

### Step 1: Delete the Failed Stack

```powershell
# Delete the failed CDKToolkit stack
aws cloudformation delete-stack --stack-name CDKToolkit --region us-east-1
```

### Step 2: Wait for Deletion to Complete

```powershell
# Check deletion status (wait until it says DELETE_COMPLETE or stack not found)
aws cloudformation describe-stacks --stack-name CDKToolkit --region us-east-1
```

**Expected output after deletion:**
```
An error occurred (ValidationError) when calling the DescribeStacks operation: Stack with id CDKToolkit does not exist
```

This means the stack is fully deleted and you can proceed.

---

## 🔄 Retry CDK Bootstrap

After adding permissions and cleaning up:

```powershell
# Retry bootstrap
cdk bootstrap aws://870631428381/us-east-1
```

**Expected successful output:**
```
⏳  Bootstrapping environment aws://870631428381/us-east-1...
✅  Environment aws://870631428381/us-east-1 bootstrapped.
```

---

## 📋 Complete IAM Policies Needed for CDK

For CDK to work properly, your IAM user needs these permissions:

### Required Policies:

1. ✅ **AmazonDynamoDBFullAccess** - For DynamoDB tables
2. ✅ **AmazonS3FullAccess** - For S3 buckets
3. ✅ **AmazonCognitoPowerUser** - For Cognito
4. ✅ **AmazonSQSFullAccess** - For SQS queues
5. ✅ **AmazonECSFullAccess** - For ECS/Fargate
6. ✅ **AWSLambdaFullAccess** - For Lambda functions
7. ✅ **CloudWatchLogsFullAccess** - For CloudWatch logs
8. ✅ **IAMFullAccess** - For creating IAM roles
9. ✅ **AWSCloudFormationFullAccess** - For CloudFormation stacks
10. ❌ **AmazonEC2ContainerRegistryFullAccess** - **MISSING** (This is the issue!)

### OR Simply Use:

- **AdministratorAccess** - Includes all permissions above

---

## 🛠️ Step-by-Step Fix (Detailed)

### Step 1: Add ECR Permission via AWS Console

1. Open: https://console.aws.amazon.com/iam/home#/users/codelearn-dev
2. Click the **"Permissions"** tab
3. Click **"Add permissions"** button
4. Select **"Attach policies directly"**
5. In the search box, type: `ECR`
6. Check the box next to: **AmazonEC2ContainerRegistryFullAccess**
7. Click **"Next"**
8. Click **"Add permissions"**

### Step 2: Verify Permission Added

```powershell
# List all policies attached to your user
aws iam list-attached-user-policies --user-name codelearn-dev
```

**You should see:**
```json
{
    "AttachedPolicies": [
        {
            "PolicyName": "AmazonEC2ContainerRegistryFullAccess",
            "PolicyArn": "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
        },
        // ... other policies
    ]
}
```

### Step 3: Clean Up Failed Stack

```powershell
# Delete the failed stack
aws cloudformation delete-stack --stack-name CDKToolkit --region us-east-1

# Wait 30 seconds
Start-Sleep -Seconds 30

# Verify deletion
aws cloudformation describe-stacks --stack-name CDKToolkit --region us-east-1
```

### Step 4: Retry Bootstrap

```powershell
cdk bootstrap aws://870631428381/us-east-1
```

---

## 🚨 Alternative: Use AWS CLI to Add Permission

If you prefer using CLI:

```powershell
# Attach ECR policy to user
aws iam attach-user-policy `
  --user-name codelearn-dev `
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess
```

**Verify:**
```powershell
aws iam list-attached-user-policies --user-name codelearn-dev
```

---

## ✅ Verification Checklist

After fixing permissions:

- [ ] ECR permission added to IAM user
- [ ] Failed CDKToolkit stack deleted
- [ ] CDK bootstrap command runs successfully
- [ ] No error messages in output
- [ ] See "✅ Environment aws://870631428381/us-east-1 bootstrapped."

---

## 🎯 Quick Command Summary

```powershell
# 1. Add ECR permission (via AWS Console - see Step 1 above)

# 2. Delete failed stack
aws cloudformation delete-stack --stack-name CDKToolkit --region us-east-1

# 3. Wait for deletion (30-60 seconds)
Start-Sleep -Seconds 30

# 4. Verify deletion
aws cloudformation describe-stacks --stack-name CDKToolkit --region us-east-1
# Should say "Stack with id CDKToolkit does not exist"

# 5. Retry bootstrap
cdk bootstrap aws://870631428381/us-east-1
```

---

## 💡 Why This Happened

CDK needs to create an **ECR repository** to store Docker container images for:
- ECS Fargate tasks (AI workers)
- Lambda container images (if used)

Without ECR permissions, CDK cannot create this repository, causing the bootstrap to fail.

---

## 🆘 Still Having Issues?

### Issue: Stack deletion fails
```powershell
# Force delete with retain resources
aws cloudformation delete-stack --stack-name CDKToolkit --region us-east-1 --retain-resources
```

### Issue: Permission denied even after adding policy
```powershell
# Wait a few minutes for IAM changes to propagate
# Then retry bootstrap
```

### Issue: Multiple failed stacks
```powershell
# List all stacks
aws cloudformation list-stacks --region us-east-1

# Delete each failed CDKToolkit stack
aws cloudformation delete-stack --stack-name CDKToolkit --region us-east-1
```

---

## 📞 Need Help?

If you're still stuck after following these steps, let me know and I'll help troubleshoot further!

---

## ✅ Once Fixed

After successful bootstrap, you'll be ready to proceed with Task 2! 🚀
