# Login Redirect Issue - Debugging Guide

## Problem Summary

**Symptoms:**

- Login succeeds (200 OK)
- But redirect to dashboard doesn't work
- Console shows:
  - `/forgot-password?_rsc=1ezw6:1` - 404 error
  - `/api/auth/me:1` - 401 Unauthorized

**Root Cause:** Cookies are not being set or sent properly after login.

---

## Quick Fix Applied

**Commit:** `057db68 - fix: add delay before redirect to ensure cookies are set`

**Change:** Added 100ms delay before redirect to ensure cookies are fully set by the browser.

---

## Testing Steps

### 1. Clear Browser State (CRITICAL)

Before testing, you MUST clear all browser data:

```
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear site data" button
4. OR manually:
   - Cookies → Delete all for your domain
   - Local Storage → Clear
   - Session Storage → Clear
5. Close and reopen browser
```

### 2. Test Login Flow

```
1. Navigate to /login
2. Open DevTools → Network tab
3. Enter credentials and click "Log In"
4. Watch the network requests:

   Expected sequence:
   ✅ POST /api/auth/login → 200 OK
   ✅ Response includes Set-Cookie headers
   ✅ Browser redirects to /dashboard
   ✅ GET /dashboard → 200 OK
   ✅ GET /api/auth/me → 200 OK (with cookies)
```

### 3. Check Cookies

After login, check if cookies are set:

```
1. DevTools → Application → Cookies
2. Look for:
   - auth-token (httpOnly, SameSite=Lax)
   - refresh-token (httpOnly, SameSite=Lax)
3. If missing → cookies not being set
4. If present → check if they're sent with requests
```

---

## Common Issues & Solutions

### Issue 1: Cookies Not Set

**Symptom:** No cookies in Application tab after login

**Causes:**

- Browser blocking third-party cookies
- Secure flag mismatch (http vs https)
- Domain mismatch

**Solutions:**

1. **Check if you're on localhost:**

   ```
   If testing on http://localhost:3000:
   - Cookies should work
   - secure flag is false in development
   ```

2. **Check if you're on Vercel:**

   ```
   If testing on https://codelearn-lemon.vercel.app:
   - Cookies should work
   - secure flag is true in production
   ```

3. **Check browser settings:**
   ```
   Chrome: Settings → Privacy → Cookies
   - Allow all cookies (for testing)
   - Disable "Block third-party cookies"
   ```

### Issue 2: Cookies Set But Not Sent

**Symptom:** Cookies exist but `/api/auth/me` returns 401

**Causes:**

- SameSite policy blocking cookies
- Path mismatch
- Domain mismatch

**Solutions:**

1. **Check cookie attributes:**

   ```
   Required:
   - Path: /
   - SameSite: Lax (NOT Strict)
   - HttpOnly: true
   - Secure: true (production only)
   ```

2. **Check request:**
   ```
   DevTools → Network → /api/auth/me
   - Request Headers should include Cookie header
   - If missing → browser is blocking cookies
   ```

### Issue 3: Redirect Happens Too Fast

**Symptom:** Redirect works but cookies aren't ready

**Solution:** Already fixed in commit `057db68`

- Added 100ms delay before redirect
- Ensures cookies are fully set

### Issue 4: Old Code Cached

**Symptom:** Changes don't take effect

**Solutions:**

1. **Clear Next.js cache:**

   ```bash
   rm -rf .next
   npm run build
   npm run dev
   ```

2. **Hard refresh browser:**

   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

3. **Disable cache in DevTools:**
   ```
   DevTools → Network tab
   Check "Disable cache"
   ```

---

## Deployment Checklist

### Before Testing on Vercel

1. **Ensure latest code is deployed:**

   ```bash
   git push origin feature/task-5-checkpoint
   # Wait for Vercel auto-deploy (2-3 minutes)
   ```

2. **Check deployment status:**

   ```
   https://vercel.com/dashboard
   - Look for latest deployment
   - Status should be "Ready"
   ```

3. **Verify environment variables:**

   ```
   Vercel Dashboard → Settings → Environment Variables

   Required:
   - NEXT_PUBLIC_COGNITO_USER_POOL_ID
   - NEXT_PUBLIC_COGNITO_CLIENT_ID
   - AWS_REGION
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   ```

### After Deployment

1. **Clear browser data** (see step 1 above)
2. **Test login flow** (see step 2 above)
3. **Check cookies** (see step 3 above)

---

## Advanced Debugging

### Enable Verbose Logging

Add console logs to track the flow:

**In `lib/auth/auth-context.tsx`:**

```typescript
const login = async (email: string, password: string) => {
  console.log('1. Starting login...');

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  console.log('2. Login response:', response.status);

  const data = await response.json();
  console.log('3. Login data:', data);

  setUser(data.data.user);
  setTokens(data.data.tokens);

  console.log('4. State updated, waiting before redirect...');
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log('5. Redirecting to dashboard...');
  window.location.href = '/dashboard';
};
```

### Check Server Logs

**On Vercel:**

```
1. Go to Vercel Dashboard
2. Select your project
3. Click on latest deployment
4. View "Functions" tab
5. Look for /api/auth/login logs
```

**Expected logs:**

```
Login successful for user: user@example.com
Setting cookies: auth-token, refresh-token
```

### Network Tab Analysis

**Check request/response:**

```
DevTools → Network → /api/auth/login

Request:
- Method: POST
- Body: {"email":"...","password":"..."}
- Headers: Content-Type: application/json

Response:
- Status: 200 OK
- Headers: Set-Cookie: auth-token=...; HttpOnly; SameSite=Lax
- Headers: Set-Cookie: refresh-token=...; HttpOnly; SameSite=Lax
- Body: {"success":true,"data":{...}}
```

---

## Still Not Working?

### Try Local Development First

```bash
cd codelearn
npm run dev
```

Then test on `http://localhost:3000`:

1. Login should work perfectly locally
2. If it works locally but not on Vercel → deployment issue
3. If it doesn't work locally → code issue

### Check Cognito Configuration

```bash
aws cognito-idp describe-user-pool \
  --user-pool-id us-east-1_bNco2tmIx \
  --region us-east-1
```

Verify:

- User pool is active
- Password policy is correct
- Users can sign in

### Manual Cookie Test

Use browser console to manually set cookies:

```javascript
// In browser console on /login page
document.cookie = 'auth-token=test; path=/; SameSite=Lax';
document.cookie = 'refresh-token=test; path=/; SameSite=Lax';

// Then navigate to /dashboard
window.location.href = '/dashboard';

// If this works → login API isn't setting cookies correctly
// If this doesn't work → middleware or cookie policy issue
```

---

## Expected Behavior

### Successful Login Flow

```
1. User enters credentials
2. Click "Log In"
3. POST /api/auth/login → 200 OK
4. Cookies set: auth-token, refresh-token
5. State updated: user, tokens
6. Wait 100ms
7. Redirect to /dashboard
8. Middleware checks auth-token cookie
9. Token is valid → allow access
10. Dashboard loads
11. GET /api/auth/me → 200 OK (with user data)
12. Dashboard displays user info
```

### Current Behavior (Bug)

```
1. User enters credentials
2. Click "Log In"
3. POST /api/auth/login → 200 OK
4. Cookies set: auth-token, refresh-token (maybe?)
5. State updated: user, tokens
6. Redirect to /dashboard (too fast?)
7. Middleware checks auth-token cookie
8. Token missing or invalid → 401
9. Dashboard redirects to /login
10. OR dashboard loads but /api/auth/me → 401
```

---

## Contact Information

If none of these solutions work, provide:

1. **Browser:** Chrome/Firefox/Safari + version
2. **Environment:** localhost or Vercel URL
3. **Console logs:** Full output from browser console
4. **Network logs:** Screenshot of Network tab during login
5. **Cookie state:** Screenshot of Application → Cookies

---

**Last Updated:** March 2, 2026  
**Fix Commit:** `057db68`  
**Branch:** `feature/task-5-checkpoint`
