# Enable USER_PASSWORD_AUTH - Manual Steps

## Quick Fix via AWS Console

Since the PowerShell script requires AWS CLI credentials, here's how to enable it manually through the AWS Console:

### Step-by-Step Instructions

1. **Go to AWS Console**
   - Open https://console.aws.amazon.com/
   - Sign in to your AWS account

2. **Navigate to Cognito**
   - Search for "Cognito" in the top search bar
   - Click on "Amazon Cognito"

3. **Select Your User Pool**
   - Click on "User pools" in the left sidebar
   - Find and click on your user pool: `codelearn-dev`
   - User Pool ID: `us-east-1_bNco2tmIx`

4. **Go to App Integration**
   - Click on the "App integration" tab at the top
   - Scroll down to "App clients and analytics" section

5. **Edit App Client**
   - You should see your app client listed
   - Client ID: `1belt192f8jpto6m9f9m3hm6l3`
   - Click on the client name to open it

6. **Edit Authentication Flows**
   - Scroll down to "Authentication flows" section
   - Click the "Edit" button

7. **Enable USER_PASSWORD_AUTH**
   - Find the checkbox for **ALLOW_USER_PASSWORD_AUTH**
   - ✅ Check this box
   - Also ensure **ALLOW_REFRESH_TOKEN_AUTH** is checked
   - Click "Save changes" at the bottom

### Visual Guide

```
AWS Console
  └─ Cognito
      └─ User pools
          └─ codelearn-dev (us-east-1_bNco2tmIx)
              └─ App integration tab
                  └─ App clients section
                      └─ Your app client (1belt192f8jpto6m9f9m3hm6l3)
                          └─ Authentication flows
                              └─ Edit
                                  ✅ ALLOW_USER_PASSWORD_AUTH
                                  ✅ ALLOW_REFRESH_TOKEN_AUTH
                                  └─ Save changes
```

### What to Check

Make sure these authentication flows are enabled:

- ✅ **ALLOW_USER_PASSWORD_AUTH** (required for email/password login)
- ✅ **ALLOW_REFRESH_TOKEN_AUTH** (required for token refresh)
- ✅ **ALLOW_CUSTOM_AUTH** (optional, for MFA)

### After Enabling

Once you've saved the changes:

1. **Test Email/Password Login**
   - Go to https://codelearn-lemon.vercel.app/login
   - Enter email and password
   - Click "Log In"
   - Should work without errors! ✅

2. **Verify in Browser Console**
   - Open DevTools (F12)
   - Check Console tab
   - Should see no "USER_PASSWORD_AUTH flow not enabled" errors

### Troubleshooting

#### Can't Find User Pool

- Make sure you're in the correct AWS region: **us-east-1** (N. Virginia)
- Check the region selector in the top-right corner of AWS Console

#### Can't Find App Client

- Make sure you're in the "App integration" tab
- Scroll down to "App clients and analytics" section
- The client ID should be: `1belt192f8jpto6m9f9m3hm6l3`

#### Changes Not Taking Effect

- Wait 1-2 minutes for changes to propagate
- Clear browser cache and cookies
- Try in an incognito/private window

### Alternative: Use AWS CLI

If you have AWS CLI configured with credentials:

```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-1_bNco2tmIx \
  --client-id 1belt192f8jpto6m9f9m3hm6l3 \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_CUSTOM_AUTH \
  --region us-east-1
```

### Why This is Needed

The `USER_PASSWORD_AUTH` flow allows your application to authenticate users directly with email and password. Without it enabled, Cognito rejects login attempts with the error:

```
USER_PASSWORD_AUTH flow not enabled for this client
```

This is a security feature - authentication flows must be explicitly enabled to prevent unauthorized authentication methods.

---

**Estimated Time**: 2-3 minutes
**Difficulty**: Easy
**Impact**: Enables email/password login for all users
