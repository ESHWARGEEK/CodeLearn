# Fix IAM Policy Quota Exceeded

## 🔴 Issue

**Error:** "The selected policies exceed this account's quota"

**Cause:** AWS limits IAM users to **10 managed policies** maximum. You've already attached 10 policies.

---

## ✅ Solution: Replace All Policies with AdministratorAccess

Instead of having 10+ individual policies, we'll use just **1 policy** that gives full access.

### Step 1: Check Current Policies

```powershell
# List all policies attached to your user
aws iam list-attached-user-policies --user-name codelearn-dev
```

**You'll see something like:**
```json
{
    "AttachedPolicies": [
        {"PolicyName": "AmazonDynamoDBFullAccess", ...},
        {"PolicyName": "AmazonS3FullAccess", ...},
        {"PolicyName": "AmazonCognitoPowerUser", ...},
        {"PolicyName": "AmazonSQSFullAccess", ...},
        {"PolicyName": "AmazonECSFullAccess", ...},
        {"PolicyName": "AWSLambdaFullAccess", ...},
        {"PolicyName": "CloudWatchLogsFullAccess", ...},
        {"PolicyName": "IAMFullAccess", ...},
        {"PolicyName": "AWSCloudFormationFullAccess", ...},
        {"PolicyName": "SomeOtherPolicy", ...}
    ]
}
```

---

### Step 2: Remove All Current Policies

```powershell
# Remove all policies one by one
aws iam detach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
aws iam detach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
aws iam detach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/AmazonCognitoPowerUser
aws iam detach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/AmazonSQSFullAccess
aws iam detach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/AmazonECSFullAccess
aws iam detach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/AWSLambdaFullAccess
aws iam detach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
aws iam detach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/IAMFullAccess
aws iam detach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/AWSCloudFormationFullAccess
```

**Note:** Adjust the policy names based on what you see in Step 1.

---

### Step 3: Attach AdministratorAccess (Single Policy)

```powershell
# Attach AdministratorAccess - this replaces ALL the policies above
aws iam attach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

---

### Step 4: Verify

```powershell
# Check that only AdministratorAccess is attached
aws iam list-attached-user-policies --user-name codelearn-dev
```

**Expected output:**
```json
{
    "AttachedPolicies": [
        {
            "PolicyName": "AdministratorAccess",
            "PolicyArn": "arn:aws:iam::aws:policy/AdministratorAccess"
        }
    ]
}
```

---

## 🎯 Easier Method: Use AWS Console

### Step 1: Go to IAM User

1. **Open:** https://console.aws.amazon.com/iam/home#/users/codelearn-dev
2. **Click:** "Permissions" tab

### Step 2: Remove All Policies

1. **Select all policies** (check all boxes)
2. **Click:** "Remove" button
3. **Confirm:** "Remove"

### Step 3: Add AdministratorAccess

1. **Click:** "Add permissions"
2. **Select:** "Attach policies directly"
3. **Search:** `AdministratorAccess`
4. **Check:** AdministratorAccess
5. **Click:** "Next" → "Add permissions"

---

## 📊 Why AdministratorAccess is Better

**Before (10 policies):**
- AmazonDynamoDBFullAccess
- AmazonS3FullAccess
- AmazonCognitoPowerUser
- AmazonSQSFullAccess
- AmazonECSFullAccess
- AWSLambdaFullAccess
- CloudWatchLogsFullAccess
- IAMFullAccess
- AWSCloudFormationFullAccess
- ❌ Can't add more (quota exceeded)

**After (1 policy):**
- ✅ AdministratorAccess (includes ALL services + ECR)

---

## 🔄 Complete Fix Sequence

```powershell
# 1. List current policies (to see what needs to be removed)
aws iam list-attached-user-policies --user-name codelearn-dev

# 2. Remove all policies (adjust based on what you see)
# Run detach-user-policy for each policy shown above

# 3. Attach AdministratorAccess
aws iam attach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# 4. Verify
aws iam list-attached-user-policies --user-name codelearn-dev
```

---

## 🛡️ Security Note

**AdministratorAccess** gives full access to all AWS services. This is:
- ✅ **Perfect for development** - No permission issues
- ✅ **Fine for personal projects** - You control the account
- ⚠️ **Not recommended for production** - Use least privilege in production

For this project (development/learning), AdministratorAccess is the right choice.

---

## ✅ After Fixing Permissions

Once you have AdministratorAccess attached:

1. **Clean up the stuck stack:**
   ```powershell
   aws ssm delete-parameter --name /cdk-bootstrap/hnb659fds/version --region us-east-1
   aws cloudformation delete-stack --stack-name CDKToolkit --region us-east-1
   ```

2. **Wait 30 seconds:**
   ```powershell
   Start-Sleep -Seconds 30
   ```

3. **Retry CDK bootstrap:**
   ```powershell
   cdk bootstrap aws://870631428381/us-east-1
   ```

---

## 🆘 Quick Script to Remove All Policies

If you have many policies, use this script:

```powershell
# Get all attached policies
$policies = aws iam list-attached-user-policies --user-name codelearn-dev --query 'AttachedPolicies[*].PolicyArn' --output text

# Remove each policy
foreach ($policy in $policies -split '\s+') {
    if ($policy) {
        Write-Host "Removing: $policy"
        aws iam detach-user-policy --user-name codelearn-dev --policy-arn $policy
    }
}

# Attach AdministratorAccess
aws iam attach-user-policy --user-name codelearn-dev --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Verify
aws iam list-attached-user-policies --user-name codelearn-dev
```

---

## ✅ Verification Checklist

- [ ] All old policies removed
- [ ] AdministratorAccess attached
- [ ] Only 1 policy showing in list
- [ ] Ready to retry CDK bootstrap

---

Let me know once you've switched to AdministratorAccess and we'll proceed with the stack cleanup! 🚀
