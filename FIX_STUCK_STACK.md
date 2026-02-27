# Fix Stuck CDKToolkit Stack

## 🔴 Current Issue

The CDKToolkit stack is stuck in `DELETE_FAILED` status because the `CdkBootstrapVersion` SSM parameter couldn't be deleted.

**Stack Status:** `DELETE_FAILED`
**Stuck Resource:** `CdkBootstrapVersion` (SSM Parameter)

---

## ✅ Solution: Manual Cleanup

### Step 1: Delete the SSM Parameter Manually

```powershell
# Delete the stuck SSM parameter
aws ssm delete-parameter --name /cdk-bootstrap/hnb659fds/version --region us-east-1
```

**Expected output:**
```
(No output means success)
```

**If you get an error** saying parameter doesn't exist, that's fine - proceed to Step 2.

---

### Step 2: Continue Stack Deletion

Now that the parameter is gone, tell CloudFormation to continue deleting:

```powershell
# Continue deleting the stack
aws cloudformation continue-update-rollback --stack-name CDKToolkit --region us-east-1
```

**If that doesn't work, try force delete:**

```powershell
# Force delete the stack (skip the stuck resource)
aws cloudformation delete-stack --stack-name CDKToolkit --region us-east-1
```

---

### Step 3: Wait and Verify Deletion

```powershell
# Wait 30 seconds
Start-Sleep -Seconds 30

# Check if stack is deleted
aws cloudformation describe-stacks --stack-name CDKToolkit --region us-east-1
```

**Expected output after successful deletion:**
```
An error occurred (ValidationError) when calling the DescribeStacks operation: Stack with id CDKToolkit does not exist
```

---

### Step 4: If Stack Still Exists, Use AWS Console

If the CLI commands don't work, use the AWS Console:

1. **Go to:** https://console.aws.amazon.com/cloudformation/home?region=us-east-1
2. **Find:** CDKToolkit stack
3. **Click:** The stack name
4. **Click:** "Delete" button at the top
5. **In the popup:**
   - Check the box: "Retain resources" for `CdkBootstrapVersion`
   - Click: "Delete stack"

This will delete the stack but keep the stuck resource (which we'll clean up separately).

---

### Step 5: Clean Up Any Remaining Resources

After the stack is deleted, clean up any leftover resources:

```powershell
# Delete SSM parameter (if still exists)
aws ssm delete-parameter --name /cdk-bootstrap/hnb659fds/version --region us-east-1

# List and delete any CDK S3 buckets
aws s3 ls | Select-String "cdk-hnb659fds"

# If you see any buckets, delete them (replace BUCKET_NAME):
# aws s3 rb s3://BUCKET_NAME --force
```

---

## 🔄 After Cleanup: Retry Bootstrap

Once the stack is fully deleted:

### Step 1: Verify Permissions Are Fixed

Make sure you added ECR permission (from previous guide):

```powershell
# Check your IAM policies
aws iam list-attached-user-policies --user-name codelearn-dev
```

**You should see** `AmazonEC2ContainerRegistryFullAccess` or `AdministratorAccess` in the list.

### Step 2: Retry Bootstrap

```powershell
cdk bootstrap aws://870631428381/us-east-1
```

**Expected successful output:**
```
⏳  Bootstrapping environment aws://870631428381/us-east-1...
✅  Environment aws://870631428381/us-east-1 bootstrapped.
```

---

## 🎯 Complete Command Sequence

Run these commands in order:

```powershell
# 1. Delete the stuck SSM parameter
aws ssm delete-parameter --name /cdk-bootstrap/hnb659fds/version --region us-east-1

# 2. Force delete the stack
aws cloudformation delete-stack --stack-name CDKToolkit --region us-east-1

# 3. Wait for deletion
Start-Sleep -Seconds 30

# 4. Verify deletion (should say "does not exist")
aws cloudformation describe-stacks --stack-name CDKToolkit --region us-east-1

# 5. Retry bootstrap (after confirming ECR permission is added)
cdk bootstrap aws://870631428381/us-east-1
```

---

## 🆘 Alternative: Nuclear Option

If nothing else works, use this approach:

### Option 1: Delete via Console with Retain

1. Go to: https://console.aws.amazon.com/cloudformation/home?region=us-east-1
2. Select: CDKToolkit stack
3. Click: "Delete"
4. Check: "Retain resources" for all failed resources
5. Confirm deletion

### Option 2: Wait and Retry

Sometimes AWS needs time to clean up:

```powershell
# Wait 5 minutes
Start-Sleep -Seconds 300

# Try deleting again
aws cloudformation delete-stack --stack-name CDKToolkit --region us-east-1
```

---

## ✅ Verification Checklist

Before retrying bootstrap:

- [ ] SSM parameter deleted: `/cdk-bootstrap/hnb659fds/version`
- [ ] CDKToolkit stack deleted (describe-stacks returns "does not exist")
- [ ] ECR permission added to IAM user
- [ ] No other CDK-related resources lingering

---

## 📞 Still Stuck?

If the stack won't delete after trying all these steps:

1. **Take a screenshot** of the CloudFormation console showing the stack status
2. **List all resources** in the stack:
   ```powershell
   aws cloudformation list-stack-resources --stack-name CDKToolkit --region us-east-1
   ```
3. Let me know and I'll help with more advanced cleanup

---

## 💡 Why This Happened

The SSM parameter `CdkBootstrapVersion` got created but couldn't be deleted during rollback, likely due to:
- Timing issue during stack creation/deletion
- Permission issue (though SSM should be accessible)
- AWS service temporary issue

Manual deletion of the parameter should resolve it.

---

## ✅ Once Fixed

After successful cleanup and bootstrap, you'll be ready for Task 2! 🚀
