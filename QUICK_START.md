# Quick Start - Deploy Everything in 60 Minutes

## 🎯 The Smart Way

Deploy to Vercel first → Get production URL → Configure OAuth once!

---

## 📋 Complete Workflow (60 minutes)

### 1️⃣ Deploy AWS Infrastructure (15 min)

```bash
cd codelearn/infrastructure
npm install
npx cdk deploy --all
cd ..
.\scripts\update-env-from-cdk.ps1  # Save outputs
```

**Save:** Cognito domain, User Pool ID, Client ID, table names, bucket names

---

### 2️⃣ Deploy to Vercel (10 min)

```bash
npm install -g vercel
vercel login
cd codelearn
vercel --prod
```

**Save:** Your production URL (e.g., `https://codelearn-abc123.vercel.app`)

---

### 3️⃣ Add Environment Variables to Vercel (10 min)

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add all variables from `.env.cdk-outputs` + AWS credentials

**Skip OAuth variables for now**

---

### 4️⃣ Configure GitHub OAuth (7 min)

1. Go to https://github.com/settings/developers
2. New OAuth App
3. Callback URL: `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
4. Save Client ID & Secret
5. Create PAT with `repo`, `read:user` scopes

---

### 5️⃣ Configure Google OAuth (8 min)

1. Go to https://console.cloud.google.com/
2. Create project "CodeLearn"
3. OAuth consent screen
4. Create OAuth client ID (Web application)
5. Redirect URI: `https://YOUR-COGNITO-DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
6. Save Client ID & Secret

---

### 6️⃣ Add OAuth to Vercel (5 min)

Vercel Dashboard → Environment Variables:

```
GITHUB_CLIENT_ID = ...
GITHUB_CLIENT_SECRET = ...
GITHUB_PAT = ...
GOOGLE_CLIENT_ID = ...
GOOGLE_CLIENT_SECRET = ...
```

Then: `vercel --prod` (redeploy)

---

### 7️⃣ Configure OAuth in Cognito (10 min)

```bash
# Add GitHub
aws cognito-idp create-identity-provider \
  --user-pool-id YOUR-USER-POOL-ID \
  --provider-name GitHub \
  --provider-type OIDC \
  --provider-details client_id=...,client_secret=...,authorize_scopes="user:email",attributes_request_method=GET,oidc_issuer=https://github.com \
  --attribute-mapping email=email,username=preferred_username

# Add Google
aws cognito-idp create-identity-provider \
  --user-pool-id YOUR-USER-POOL-ID \
  --provider-name Google \
  --provider-type Google \
  --provider-details client_id=...,client_secret=...,authorize_scopes="profile email openid" \
  --attribute-mapping email=email,username=sub

# Update app client
aws cognito-idp update-user-pool-client \
  --user-pool-id YOUR-USER-POOL-ID \
  --client-id YOUR-CLIENT-ID \
  --callback-urls "https://YOUR-VERCEL-URL/api/auth/callback" "https://YOUR-COGNITO-DOMAIN/oauth2/idpresponse" \
  --logout-urls "https://YOUR-VERCEL-URL" \
  --allowed-o-auth-flows "code" "implicit" \
  --allowed-o-auth-scopes "email" "openid" "profile" \
  --allowed-o-auth-flows-user-pool-client
```

---

### 8️⃣ Verify (5 min)

```bash
# Check Vercel
vercel ls

# Check Cognito
aws cognito-idp list-identity-providers --user-pool-id YOUR-USER-POOL-ID

# Visit your app
# https://codelearn-abc123.vercel.app
```

---

## ✅ Done!

You now have:
- ✅ AWS infrastructure deployed
- ✅ Next.js app on Vercel
- ✅ OAuth configured with production URL
- ✅ Ready for Task 3: Authentication

---

## 📚 Detailed Guides

- **DEPLOYMENT_WORKFLOW.md** - Complete workflow with all details
- **VERCEL_DEPLOYMENT_GUIDE.md** - Vercel-specific instructions
- **OAUTH_SETUP_GUIDE.md** - OAuth configuration details
- **TASK_2.7_CHECKLIST.md** - Checklist with checkboxes

---

## 🆘 Need Help?

1. Start with **DEPLOYMENT_WORKFLOW.md**
2. Use **TASK_2.7_CHECKLIST.md** to track progress
3. Check troubleshooting sections in each guide

---

**Let's go!** 🚀

