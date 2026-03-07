# Vercel Build Cache Fix Instructions

## Problem Summary
Vercel is using a corrupted build cache (ID: `BACj6jX4dhxUhtbYeZSVcd9LLeyw`) that doesn't include the `lib/` and `components/` directories. This causes module resolution failures even though the files exist in the git repository.

## Evidence
- ✅ Files exist in git repository: `lib/auth/auth-context.tsx`, `components/shared/Navbar.tsx`
- ✅ Local build works: `npm run build` succeeds
- ❌ Vercel build fails: "Module not found: Can't resolve '@/lib/auth/auth-context'"
- ❌ Same cache restored on every deployment regardless of branch or commit

## Root Cause
The build cache from a previous deployment is missing critical source directories. Vercel restores this cache on every build, causing the same failure repeatedly.

## Solution: Force Fresh Build (MANUAL ACTION REQUIRED)

Vercel doesn't have a direct "Clear Cache" button, but here are the working methods:

### Method 1: Redeploy Without Cache (RECOMMENDED)
1. Go to https://vercel.com/dashboard
2. Select your **CodeLearn** project
3. Click **Deployments** tab
4. Find the latest failed deployment
5. Click the **three dots menu (⋯)** on the right
6. Select **"Redeploy"**
7. **IMPORTANT**: In the redeploy dialog, **UNCHECK** "Use existing Build Cache"
8. Click **"Redeploy"**

This forces Vercel to build without using the corrupted cache.

### Method 2: Environment Variable (Alternative)
If Method 1 doesn't work, force cache bypass permanently:

1. Go to **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Enter:
   - **Key**: `VERCEL_FORCE_NO_BUILD_CACHE`
   - **Value**: `1`
   - **Environments**: Check all (Production, Preview, Development)
4. Click **"Save"**
5. Go to **Deployments** and click **"Redeploy"** on latest deployment

### Method 3: Delete and Reconnect Project (Last Resort)
If both methods above fail:

1. Go to **Settings** → **General**
2. Scroll to bottom → **"Delete Project"**
3. Reconnect your GitHub repository as a new Vercel project
4. This will create a completely fresh cache

### Step 2: Verify Deployment
Watch the build logs for:
- ✅ No "Restored build cache" message (or different cache ID)
- ✅ Successful module resolution for `@/lib/*` and `@/components/*`
- ✅ Build completes successfully

### Step 3: After Successful Deployment
If you used Method 2 (environment variable), you can remove it after successful deployment to allow normal caching again.

## Quick Reference: Redeploy Without Cache

The fastest solution:
1. Deployments tab → Find failed deployment
2. Three dots menu (⋯) → Redeploy
3. **Uncheck "Use existing Build Cache"**
4. Click Redeploy

That's it!

## Current Configuration Status

### ✅ Fixed Issues
- Husky prepare script fails gracefully: `"prepare": "husky || true"`
- Node.js engine requirements specified: `"node": ">=20.0.0"`
- Explicit install command in vercel.json: `npm ci --legacy-peer-deps`
- `.vercelignore` removed to prevent accidental exclusions

### 📋 Files in Repository
- `lib/auth/auth-context.tsx` ✅
- `components/shared/Navbar.tsx` ✅
- All 30 `lib/*` files ✅
- All component files ✅

## After Successful Deployment

Once deployment succeeds, you can optionally restore `.vercelignore` with proper configuration:

```
# .vercelignore
# Development files
.env.local
.env.*.local
.env.backup

# Git files
.git
.gitignore

# IDE files
.vscode
.idea

# Test files
tests/
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx

# Documentation
*.md
!README.md

# Infrastructure
infrastructure/
cdk.out/

# DO NOT IGNORE SOURCE CODE
# lib/
# components/
# app/
```

## Troubleshooting

### If redeploy without cache doesn't work:
1. Try Method 2 (environment variable) above
2. Try Method 3 (delete and reconnect project)
3. Contact Vercel support with cache ID: `BACj6jX4dhxUhtbYeZSVcd9LLeyw`

### If deployment still fails after cache clear:
1. Check build logs for different error messages
2. Verify `tsconfig.json` paths configuration
3. Run `npm ci --legacy-peer-deps && npm run build` locally to confirm it works
4. Check for any `.vercelignore` or `.gitignore` rules excluding source files

## Next Steps After Fix

1. ✅ Verify deployment succeeds on `feature/task-9-deployment` branch
2. ✅ Test the deployed application
3. ✅ Merge `feature/task-9-deployment` to `main`
4. ✅ Deploy `main` branch to production
5. ✅ Continue with remaining spec tasks

## Contact Information
If you need help with Vercel dashboard access or have questions, please let me know!
