# Vercel Environment Variables Checklist

## ⚠️ IMPORTANT: Add Missing Variable Before Deployment

The following environment variable is **REQUIRED** but currently missing from Vercel:

### Missing Variable

```
NEXT_PUBLIC_COGNITO_DOMAIN=codelearn-dev.auth.us-east-1.amazoncognito.com
```

## How to Add It

1. Go to https://vercel.com/dashboard
2. Select your `codelearn` project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add the variable above
6. Check all three environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
7. Click **Save**

## Complete List of Required NEXT_PUBLIC Variables

Make sure ALL of these are set in Vercel:

```bash
# Required for OAuth to work
NEXT_PUBLIC_COGNITO_DOMAIN=codelearn-dev.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Optional but recommended
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## After Adding Variables

Once you've added the missing variable to Vercel:

1. This commit will trigger auto-deployment
2. Vercel will rebuild with the new environment variables
3. OAuth buttons should work correctly

## Current Status

- ❌ `NEXT_PUBLIC_COGNITO_DOMAIN` - **MISSING** (add this now!)
- ✅ `NEXT_PUBLIC_COGNITO_USER_POOL_ID` - Already set
- ✅ `NEXT_PUBLIC_COGNITO_CLIENT_ID` - Already set
- ✅ `NEXT_PUBLIC_APP_URL` - Already set

## Verification

After deployment, check the browser console. The error:

```
Missing OAuth environment variables: Object
```

Should be gone, and OAuth buttons should redirect to Cognito.

---

**Last Updated**: $(date)
**Status**: Waiting for NEXT_PUBLIC_COGNITO_DOMAIN to be added to Vercel
