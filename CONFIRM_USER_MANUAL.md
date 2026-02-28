# Confirm User Account - Manual Guide

## Problem

Getting error: `User is not confirmed` when trying to login with email/password.

## Root Cause

When you sign up with email/password, Cognito creates the account but marks it as "unconfirmed" until the user verifies their email. Since email verification is enabled by default, you need to either:

1. Confirm the user manually (quick fix for existing users)
2. Disable email verification (prevents issue for future users)

---

## Solution 1: Confirm Existing User via AWS Console

### Step-by-Step Instructions

1. **Go to AWS Console**
   - Open https://console.aws.amazon.com/cognito
   - Make sure you're in region: **us-east-1** (N. Virginia)

2. **Navigate to Your User Pool**
   - Click "User pools" in the left sidebar
   - Click on `codelearn-dev`
   - User Pool ID: `us-east-1_bNco2tmIx`

3. **Find Your User**
   - Click on the "Users" tab
   - You should see your user listed
   - Status will show: **Unconfirmed** or **Force change password**

4. **Confirm the User**
   - Click on the username/email
   - Click "Actions" dropdown (top-right)
   - Select "Confirm account"
   - Confirm the action

5. **Verify Status**
   - User status should now show: **Confirmed**
   - You can now login with this account!

### Visual Guide

```
AWS Console
  └─ Cognito
      └─ User pools
          └─ codelearn-dev (us-east-1_bNco2tmIx)
              └─ Users tab
                  └─ Click your user
                      └─ Actions dropdown
                          └─ Confirm account
                              └─ Status: Confirmed ✅
```

---

## Solution 2: Disable Email Verification (Prevents Future Issues)

This makes signup instant - users can login immediately without email confirmation.

### Via AWS Console (Updated for Current Interface)

1. **Go to User Pool Settings**
   - AWS Console → Cognito → User pools → `codelearn-dev`

2. **Edit User Pool Properties**
   - Click the "Properties" tab (not "Sign-up experience")
   - Scroll down to "User attribute verification and user account confirmation" section
   - Click "Edit" button

3. **Modify Verification Settings**
   - Find "Active attribute values for user account verification"
   - Uncheck **Email** (or select "No verification")
   - This disables the email verification requirement

4. **Save Changes**
   - Click "Save changes" at the bottom
   - New users will no longer need email verification

**Note**: The AWS Console interface may vary. If you don't see these exact options, look for:

- "Properties" tab
- "User attribute verification" section
- "MFA and verifications" section
- Or search for "verification" in the user pool settings

### Via AWS CLI

```bash
aws cognito-idp update-user-pool \
  --user-pool-id us-east-1_bNco2tmIx \
  --auto-verified-attributes \
  --region us-east-1
```

This removes email from auto-verified attributes, disabling the verification requirement.

---

## Solution 3: Confirm User via AWS CLI

If you have AWS CLI configured:

```bash
# Replace YOUR_EMAIL with the email you used to sign up
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id us-east-1_bNco2tmIx \
  --username YOUR_EMAIL \
  --region us-east-1
```

Example:

```bash
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id us-east-1_bNco2tmIx \
  --username john@example.com \
  --region us-east-1
```

---

## Testing After Confirmation

1. **Go to Login Page**
   - https://codelearn-lemon.vercel.app/login

2. **Enter Credentials**
   - Email: (your email)
   - Password: (your password)

3. **Click "Log In"**
   - Should successfully authenticate ✅
   - Redirects to home page
   - No more "User is not confirmed" error

---

## For Production: Implement Email Verification Flow

For a production app, you should implement proper email verification:

### What's Needed (Future Task)

1. **Verification Code Page**
   - Create `/verify-email` page
   - User enters 6-digit code from email
   - Call Cognito's `confirmSignUp` API

2. **Resend Code Feature**
   - Button to resend verification email
   - Call Cognito's `resendConfirmationCode` API

3. **Email Templates**
   - Customize verification email in Cognito
   - Add your branding and styling

4. **User Flow**
   ```
   Signup → Email sent → Enter code → Confirmed → Login
   ```

### Current Implementation

The code already has the verification functions in `lib/auth/cognito.ts`:

- `confirmSignUp(email, code)` - Verify email with code
- Cognito automatically sends verification emails

You just need to create the UI page to collect the verification code.

---

## Troubleshooting

### User Still Shows as Unconfirmed

- Wait 30 seconds and refresh the AWS Console
- Try logging out and back into AWS Console
- Check you're in the correct region (us-east-1)

### Can't Find User in Console

- Make sure you're in the "Users" tab
- Check the user pool ID matches: `us-east-1_bNco2tmIx`
- User might be in a different user pool

### "Actions" Button Disabled

- User might already be confirmed
- Check user status in the details page
- Try the AWS CLI method instead

---

## Recommended Approach

**For Development/Testing:**

- ✅ Disable email verification (Solution 2)
- ✅ Confirm existing users manually (Solution 1)
- Fast iteration, no email setup needed

**For Production:**

- ✅ Keep email verification enabled
- ✅ Implement verification code page
- ✅ Customize email templates
- Better security and user validation

---

**Priority**: HIGH - Blocking email/password login
**Estimated Time**: 2 minutes to confirm user manually
**Impact**: Allows immediate login for existing users
