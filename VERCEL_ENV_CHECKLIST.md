# Vercel Environment Variables Checklist

## ⚠️ CRITICAL: Add Missing Variable Before Testing

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
NEXT_PUBLIC_APP_URL=https://codelearn-lemon.vercel.app

# Optional but recommended
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## After Adding Variables

Once you've added the missing variable to Vercel:

1. The next commit will trigger auto-deployment
2. Vercel will rebuild with the new environment variables
3. OAuth buttons should work correctly

## Current Status

- ❌ `NEXT_PUBLIC_COGNITO_DOMAIN` - **MISSING** (add this now!)
- ✅ `NEXT_PUBLIC_COGNITO_USER_POOL_ID` - Already set
- ✅ `NEXT_PUBLIC_COGNITO_CLIENT_ID` - Already set
- ✅ `NEXT_PUBLIC_APP_URL` - Already set

## Code Changes Made

### Fixed Cookie SameSite Policy

Changed from `sameSite: 'strict'` to `sameSite: 'lax'` in:

- ✅ `/api/auth/callback/[provider]/exchange/route.ts`
- ✅ `/api/auth/login/route.ts`
- ✅ `/api/auth/refresh/route.ts`

**Why**: `strict` cookies are not sent after OAuth redirects, causing 401 errors. `lax` allows cookies to be sent on top-level navigation (like OAuth callbacks) while still providing CSRF protection.

## Verification Steps

After deployment, test the OAuth flow:

1. Go to https://codelearn-lemon.vercel.app/login
2. Click "Google" or "GitHub" button
3. Complete OAuth authorization
4. Should redirect to `/dashboard` successfully
5. Check browser console - no "Missing OAuth environment variables" error
6. Check Network tab - `/api/auth/me` should return 200 (not 401)

## Known Issues (Non-Blocking)

- `/forgot-password` page not implemented yet (returns 404)
- `/favicon.ico` missing (cosmetic issue)

---

**Last Updated**: Production auth diagnosis complete
**Status**: Ready for deployment after adding NEXT_PUBLIC_COGNITO_DOMAIN
