# 🚀 Quick Fix Guide - Production OAuth

## The Problem

OAuth authentication failing on production with 401 errors.

## The Solution

Cookie policy was too strict. Fixed in code + need to add missing env variable.

---

## ⚡ What You Need to Do RIGHT NOW

### Add This to Vercel Environment Variables:

```
NEXT_PUBLIC_COGNITO_DOMAIN=codelearn-dev.auth.us-east-1.amazoncognito.com
```

### How:

1. https://vercel.com/dashboard → Your project
2. Settings → Environment Variables
3. Add New → Paste the variable above
4. Check: Production ✅ Preview ✅ Development ✅
5. Save

### Then:

- Wait 2-3 minutes for auto-deployment
- Test at: https://codelearn-lemon.vercel.app/login
- Click Google or GitHub button
- Should work! 🎉

---

## ✅ What I Fixed in Code

Changed cookie policy from `strict` to `lax` in 3 files:

- OAuth exchange route
- Login route
- Refresh route

This allows cookies to work with OAuth redirects.

---

## 📊 Testing Checklist

After deployment:

- [ ] Go to https://codelearn-lemon.vercel.app/login
- [ ] Click "Google" button
- [ ] Authorize with Google
- [ ] Should redirect to `/dashboard`
- [ ] Dashboard loads (no 401 errors)
- [ ] Browser console shows no errors

---

## 🆘 If It Still Doesn't Work

Check browser console for:

1. "Missing OAuth environment variables" → Env var not added yet
2. 401 errors → Clear cookies and try again
3. Other errors → Share the error message

---

**Commit**: 1865c46 (already pushed)
**Branch**: feature/task-3-authentication
**Status**: Waiting for you to add env variable to Vercel
