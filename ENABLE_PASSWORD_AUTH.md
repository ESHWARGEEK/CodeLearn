# Enable Password Authentication - Quick Fix

## Problem

Getting error: `USER_PASSWORD_AUTH flow not enabled for this client` when trying to login with email/password.

## Root Cause

The Cognito User Pool Client needs to have the `USER_PASSWORD_AUTH` authentication flow explicitly enabled. This was not configured during initial setup.

## Solution

Run the provided PowerShell script to enable the authentication flow:

```powershell
cd codelearn
.\scripts\enable-password-auth.ps1
```

### What the Script Does

1. Reads your Cognito configuration from `.env` file
2. Fetches current User Pool Client settings
3. Adds `ALLOW_USER_PASSWORD_AUTH` to the list of enabled auth flows
4. Also ensures `ALLOW_REFRESH_TOKEN_AUTH` is enabled
5. Updates the Cognito User Pool Client

### Expected Output

```
Enabling USER_PASSWORD_AUTH flow...
User Pool ID: us-east-1_XXXXXXXXX
Client ID: XXXXXXXXXXXXXXXXXXXXXXXXXX
Region: us-east-1

Fetching current client configuration...
Current auth flows:
  - ALLOW_REFRESH_TOKEN_AUTH
  - ALLOW_CUSTOM_AUTH

Updating client with new auth flows...
New auth flows:
  - ALLOW_REFRESH_TOKEN_AUTH
  - ALLOW_CUSTOM_AUTH
  - ALLOW_USER_PASSWORD_AUTH

✓ Successfully enabled USER_PASSWORD_AUTH flow!

You can now use email/password login in your application.

Test it at: https://codelearn-lemon.vercel.app/login
```

## Manual Alternative (AWS Console)

If you prefer to enable it manually:

1. Go to AWS Console → Cognito → User Pools
2. Select your user pool (`codelearn-dev`)
3. Go to **App integration** tab
4. Under **App clients and analytics**, click your app client
5. Click **Edit** in the **Authentication flows** section
6. Check the box for **ALLOW_USER_PASSWORD_AUTH**
7. Also ensure **ALLOW_REFRESH_TOKEN_AUTH** is checked
8. Click **Save changes**

## Verification

After enabling, test email/password login:

1. Go to https://codelearn-lemon.vercel.app/login
2. Enter email and password
3. Click "Log In"
4. Should successfully authenticate and redirect to home page ✅

## Technical Details

### Authentication Flows in Cognito

| Flow                       | Purpose                                 | Required For                      |
| -------------------------- | --------------------------------------- | --------------------------------- |
| `ALLOW_USER_PASSWORD_AUTH` | Direct username/password authentication | Email/password login              |
| `ALLOW_REFRESH_TOKEN_AUTH` | Token refresh                           | Keeping users logged in           |
| `ALLOW_CUSTOM_AUTH`        | Custom authentication challenges        | MFA, custom flows                 |
| `ALLOW_USER_SRP_AUTH`      | Secure Remote Password (SRP)            | Alternative to USER_PASSWORD_AUTH |

### Why USER_PASSWORD_AUTH?

- **Simpler**: Direct authentication without SRP protocol
- **Faster**: Fewer round trips to server
- **Compatible**: Works with CLIENT_SECRET
- **Standard**: Common pattern for web applications

### Security Note

`USER_PASSWORD_AUTH` sends credentials directly to Cognito over HTTPS. This is secure because:

- All traffic is encrypted (TLS/SSL)
- Credentials never touch your application server
- Cognito handles password hashing and validation
- Works with MFA and other security features

## Troubleshooting

### Error: "Access Denied"

**Cause**: AWS credentials don't have permission to update Cognito
**Fix**: Ensure your AWS user has `cognito-idp:UpdateUserPoolClient` permission

### Error: "Client not found"

**Cause**: Environment variables are incorrect
**Fix**: Verify `NEXT_PUBLIC_COGNITO_USER_POOL_ID` and `NEXT_PUBLIC_COGNITO_CLIENT_ID` in `.env`

### Error: "Invalid parameter"

**Cause**: Conflicting authentication flow settings
**Fix**: Remove any conflicting flows or contact AWS support

## Related Files

- `scripts/enable-password-auth.ps1` - Script to enable the flow
- `lib/auth/cognito.ts` - Uses USER_PASSWORD_AUTH for login
- `app/api/auth/login/route.ts` - Login API endpoint

## Status

⏳ **ACTION REQUIRED** - Run the script to enable password authentication

---

**Priority**: HIGH - Blocking email/password login
**Estimated Time**: 1 minute to run script
**Impact**: Enables email/password authentication for all users
