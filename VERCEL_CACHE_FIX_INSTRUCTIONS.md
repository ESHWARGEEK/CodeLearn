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

## Solution: Clear Build Cache (MANUAL ACTION REQUIRED)

### Step 1: Clear Cache via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your **CodeLearn** project
3. Click **Settings** in the top navigation
4. Scroll to **Build & Development Settings**
5. Find the **"Clear Build Cache"** button
6. Click **"Clear Build Cache"**
7. Confirm the action

### Step 2: Trigger New Deployment
After clearing the cache, trigger a new deployment:

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Select **"Use existing Build Cache"** should now be unchecked
4. Click **"Redeploy"**

**Option B: Via Git Push**
```bash
# Make a trivial commit to trigger deployment
git commit --allow-empty -m "chore: trigger deployment after cache clear"
git push origin feature/task-9-deployment
```

### Step 3: Verify Deployment
Watch the build logs for:
- ✅ No "Restored build cache" message (or different cache ID)
- ✅ Successful module resolution for `@/lib/*` and `@/components/*`
- ✅ Build completes successfully

## Alternative: Force Cache Bypass via Environment Variable

If clearing cache doesn't work, you can force Vercel to skip cache:

1. Go to **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `VERCEL_FORCE_NO_BUILD_CACHE`
   - **Value**: `1`
   - **Environment**: Production, Preview, Development
3. Save and redeploy

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

### If cache clear doesn't work:
1. Try the environment variable approach above
2. Contact Vercel support with cache ID: `BACj6jX4dhxUhtbYeZSVcd9LLeyw`
3. Consider creating a new Vercel project (last resort)

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
