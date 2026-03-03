# Production Authentication Issues - Diagnosis & Fixes

## Issues Identified

### 1. Missing Environment Variable (CRITICAL)

**Problem**: `NEXT_PUBLIC_COGNITO_DOMAIN` is not set in Vercel
**Impact**: OAuth buttons show "OAuth configuration is missing" error
**Evidence**: Browser console shows "Missing OAuth environment variables: Object"

**Fix Required**:

```bash
# Add to Vercel Environment Variables:
NEXT_PUBLIC_COGNITO_DOMAIN=codelearn-dev.auth.us-east-1.amazoncognito.com
```

### 2. Missing Forgot Password Page

**Problem**: `/forgot-password` route returns 404
**Impact**: Users clicking "Forgot Password?" link get error
**Evidence**: `forgot-password?_rsc=7khhj:1 Failed to load resource: the server responded with a status of 404`

**Fix Required**: Create `app/(auth)/forgot-password/page.tsx`

### 3. Cookie SameSite Policy Issue (LIKELY ROOT CAUSE)

**Problem**: Cookies set with `sameSite: 'strict'` may not work across OAuth redirects
**Impact**: After OAuth callback, cookies aren't sent to `/api/auth/me`, causing 401 errors
**Evidence**:

- OAuth flow completes successfully
- User is redirected to `/dashboard`
- `/api/auth/me` returns 401 (no cookies received)

**Technical Explanation**:

- OAuth flow: `login` → `cognito` → `callback` → `exchange` → `dashboard`
- With `sameSite: 'strict'`, cookies set during OAuth callback may not be sent on subsequent requests
- This is a cross-site navigation issue

**Fix Required**: Change `sameSite: 'strict'` to `sameSite: 'lax'` in:

- `app/api/auth/callback/[provider]/exchange/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/signup/route.ts`
- `app/api/auth/refresh/route.ts`

### 4. Missing Favicon

**Problem**: `/favicon.ico` returns 404
**Impact**: Browser console error (cosmetic, not blocking)
**Fix Required**: Add favicon to `public/` folder

## Priority Fixes

### HIGH PRIORITY (Blocking OAuth)

1. Change cookie `sameSite` from `'strict'` to `'lax'`
2. Add `NEXT_PUBLIC_COGNITO_DOMAIN` to Vercel

### MEDIUM PRIORITY (User Experience)

3. Create forgot-password page

### LOW PRIORITY (Cosmetic)

4. Add favicon

## Testing Plan

After fixes:

1. Deploy to Vercel
2. Test OAuth flow:
   - Click "Google" button on `/login`
   - Should redirect to Google OAuth
   - After authorization, should redirect back to app
   - Should set cookies successfully
   - Should redirect to `/dashboard`
   - Dashboard should load user data (no 401 errors)

## Technical Details

### SameSite Cookie Policies

- `strict`: Cookie only sent for same-site requests (blocks cross-site navigation)
- `lax`: Cookie sent for top-level navigation (allows OAuth redirects)
- `none`: Cookie sent for all requests (requires `secure: true`)

For OAuth flows, `lax` is the recommended setting as it:

- Allows cookies to be sent after OAuth redirects
- Still provides CSRF protection for most scenarios
- Works with standard OAuth 2.0 flows

### Current Cookie Settings (INCORRECT)

```typescript
response.cookies.set('auth-token', tokens.accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict', // ❌ TOO RESTRICTIVE
  maxAge: tokens.expiresIn,
  path: '/',
});
```

### Correct Cookie Settings

```typescript
response.cookies.set('auth-token', tokens.accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', // ✅ ALLOWS OAUTH
  maxAge: tokens.expiresIn,
  path: '/',
});
```

## Next Steps

1. Fix cookie SameSite policy (code changes)
2. User adds environment variable to Vercel
3. Commit and push changes (triggers auto-deploy)
4. Test OAuth flow on production
5. Create forgot-password page (separate task)
