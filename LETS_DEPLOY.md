# Let's Deploy! 🚀

You're ready to deploy! Follow these steps to get everything running in 60 minutes.

---

## 📋 Pre-Deployment Checklist

Before starting, ensure you have:

- [ ] AWS account with AdministratorAccess
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] AWS CDK installed (`npm install -g aws-cdk`)
- [ ] Node.js 20+ installed
- [ ] Git configured
- [ ] GitHub account
- [ ] Google Cloud account
- [ ] Vercel account (free tier is fine)

**Verify AWS setup:**
```bash
aws sts get-caller-identity
cdk --version
node --version
```

---

## 🚀 Phase 1: Deploy AWS Infrastructure (15 minutes)

### Step 1: Navigate to infrastructure directory

```bash
cd codelearn/infrastructure
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Synthesize CloudFormation (verify)

```bash
npx cdk synth
```

This generates templates without deploying. Review the output.

### Step 4: Deploy to AWS

```bash
npx cdk deploy --all
```

**Important:** Save all output values! You'll need:
- UserPoolId
- UserPoolClientId
- UserPoolDomain
- Table names
- Bucket names
- Queue URLs

### Step 5: Extract outputs automatically

```bash
cd ..  # Return to codelearn directory

# Windows PowerShell:
.\scripts\update-env-from-cdk.ps1

# macOS/Linux:
chmod +x scripts/update-env-from-cdk.sh
./scripts/update-env-from-cdk.sh
```

This creates `.env.cdk-outputs` with all AWS values.

**✅ Phase 1 Complete!** You now have AWS infrastructure deployed.

---

## 🌐 Phase 2: Deploy to Vercel (10 minutes)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the browser prompts to authenticate.

### Step 3: Deploy to production

```bash
cd codelearn
vercel --prod
```

**Answer the prompts:**
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **codelearn**
- Directory? **./** (press Enter)
- Override settings? **N**

### Step 4: Save your production URL

Vercel will output:
```
✅ Production: https://codelearn-abc123.vercel.app
```

**SAVE THIS URL!** Write it down:

```
My Vercel URL: https://codelearn-_________________.vercel.app
```

**✅ Phase 2 Complete!** You now have a production URL.

---

## ⚙️ Phase 3: Add Environment Variables to Vercel (10 minutes)

### Step 1: Go to Vercel Dashboard

Open: https://vercel.com/dashboard

### Step 2: Select your project

Click on **codelearn**

### Step 3: Go to Settings → Environment Variables

Navigate to: **Settings** → **Environment Variables**

### Step 4: Add variables from .env.cdk-outputs

Copy values from `.env.cdk-outputs` and add them one by one:

**AWS Configuration:**
```
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = (your AWS access key)
AWS_SECRET_ACCESS_KEY = (your AWS secret key)
```

**AWS Cognito:**
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID = (from .env.cdk-outputs)
NEXT_PUBLIC_COGNITO_CLIENT_ID = (from .env.cdk-outputs)
COGNITO_IDENTITY_POOL_ID = (from .env.cdk-outputs)
COGNITO_USER_POOL_DOMAIN = (from .env.cdk-outputs)
```

**AWS Bedrock:**
```
BEDROCK_MODEL_CLAUDE = anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_MODEL_LLAMA = meta.llama3-1-70b-instruct-v1:0
```

**DynamoDB, S3, SQS:** (copy from .env.cdk-outputs)

**Application Settings:**
```
NEXT_PUBLIC_APP_URL = https://codelearn-abc123.vercel.app (YOUR Vercel URL)
NODE_ENV = production
```

**Skip OAuth variables for now** - we'll add them in Phase 5.

**✅ Phase 3 Complete!** Environment variables configured.

---

## 🔐 Phase 4: Configure OAuth Providers (15 minutes)

### GitHub OAuth (7 minutes)

#### Step 1: Go to GitHub Developer Settings

Open: https://github.com/settings/developers

#### Step 2: Create new OAuth App

Click **"New OAuth App"**

#### Step 3: Fill in application details

```
Application name: CodeLearn
Homepage URL: https://codelearn-abc123.vercel.app (YOUR Vercel URL)
Authorization callback URL: https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com/oauth2/idpresponse (YOUR Cognito domain)
```

**Important:** Replace with YOUR actual URLs!

#### Step 4: Save credentials

- Copy **Client ID**
- Click "Generate a new client secret"
- Copy **Client Secret** (shown only once!)

Write them down:
```
GitHub Client ID: _________________________________
GitHub Client Secret: _________________________________
```

#### Step 5: Create Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `CodeLearn API Access`
4. Select scopes: ✅ `repo`, ✅ `read:user`
5. Click "Generate token"
6. Copy the token (shown only once!)

```
GitHub PAT: _________________________________
```

### Google OAuth (8 minutes)

#### Step 1: Go to Google Cloud Console

Open: https://console.cloud.google.com/

#### Step 2: Create new project

- Click "Select a project" → "New Project"
- Name: **CodeLearn**
- Click "Create"

#### Step 3: Configure OAuth consent screen

1. Navigate to: **APIs & Services** → **OAuth consent screen**
2. Select: **External**
3. Click "Create"
4. Fill in:
   - App name: **CodeLearn**
   - User support email: (your email)
   - Developer contact: (your email)
5. Click "Save and Continue"
6. Skip "Scopes" (click "Save and Continue")
7. Click "Save and Continue" again

#### Step 4: Create OAuth client ID

1. Navigate to: **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "OAuth client ID"
3. Select: **Web application**
4. Name: **CodeLearn**
5. Add Authorized JavaScript origins:
   - `https://codelearn-abc123.vercel.app` (YOUR Vercel URL)
   - `https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com` (YOUR Cognito domain)
6. Add Authorized redirect URIs:
   - `https://codelearn-dev-abc123.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
   - `https://codelearn-abc123.vercel.app/api/auth/callback/google`
7. Click "Create"

#### Step 5: Save credentials

- Copy **Client ID**
- Copy **Client Secret**

Write them down:
```
Google Client ID: _________________________________
Google Client Secret: _________________________________
```

**✅ Phase 4 Complete!** OAuth apps created.

---

## 🔗 Phase 5: Add OAuth to Vercel (5 minutes)

### Step 1: Go back to Vercel Dashboard

Open: https://vercel.com/dashboard → **codelearn** → **Settings** → **Environment Variables**

### Step 2: Add OAuth credentials

```
GITHUB_CLIENT_ID = (your GitHub Client ID)
GITHUB_CLIENT_SECRET = (your GitHub Client Secret)
GITHUB_PAT = (your GitHub PAT)
GOOGLE_CLIENT_ID = (your Google Client ID)
GOOGLE_CLIENT_SECRET = (your Google Client Secret)
```

### Step 3: Redeploy

```bash
vercel --prod
```

Or in Vercel Dashboard: **Deployments** → Click "..." → **Redeploy**

**✅ Phase 5 Complete!** OAuth credentials added to Vercel.

---

## 🔧 Phase 6: Configure OAuth in Cognito (10 minutes)

### Step 1: Add GitHub provider

Replace `YOUR-USER-POOL-ID`, `YOUR-GITHUB-CLIENT-ID`, and `YOUR-GITHUB-CLIENT-SECRET`:

```bash
aws cognito-idp create-identity-provider \
  --user-pool-id YOUR-USER-POOL-ID \
  --provider-name GitHub \
  --provider-type OIDC \
  --provider-details \
    client_id=YOUR-GITHUB-CLIENT-ID,\
    client_secret=YOUR-GITHUB-CLIENT-SECRET,\
    authorize_scopes="user:email",\
    attributes_request_method=GET,\
    oidc_issuer=https://github.com \
  --attribute-mapping email=email,username=preferred_username \
  --region us-east-1
```

### Step 2: Add Google provider

Replace `YOUR-USER-POOL-ID`, `YOUR-GOOGLE-CLIENT-ID`, and `YOUR-GOOGLE-CLIENT-SECRET`:

```bash
aws cognito-idp create-identity-provider \
  --user-pool-id YOUR-USER-POOL-ID \
  --provider-name Google \
  --provider-type Google \
  --provider-details \
    client_id=YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com,\
    client_secret=YOUR-GOOGLE-CLIENT-SECRET,\
    authorize_scopes="profile email openid" \
  --attribute-mapping email=email,username=sub \
  --region us-east-1
```

### Step 3: Update Cognito app client callback URLs

Replace `YOUR-USER-POOL-ID`, `YOUR-CLIENT-ID`, and `YOUR-VERCEL-URL`:

```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id YOUR-USER-POOL-ID \
  --client-id YOUR-CLIENT-ID \
  --callback-urls \
    "https://YOUR-VERCEL-URL/api/auth/callback" \
    "https://YOUR-COGNITO-DOMAIN/oauth2/idpresponse" \
  --logout-urls \
    "https://YOUR-VERCEL-URL" \
  --allowed-o-auth-flows "code" "implicit" \
  --allowed-o-auth-scopes "email" "openid" "profile" \
  --allowed-o-auth-flows-user-pool-client \
  --region us-east-1
```

**✅ Phase 6 Complete!** OAuth providers configured in Cognito.

---

## ✅ Phase 7: Verify Everything (5 minutes)

### Check Vercel deployment

```bash
vercel ls
```

### Check Cognito providers

```bash
aws cognito-idp list-identity-providers \
  --user-pool-id YOUR-USER-POOL-ID \
  --region us-east-1
```

Should show GitHub and Google providers.

### Visit your app

Open your Vercel URL in a browser:
```
https://codelearn-abc123.vercel.app
```

Verify the homepage loads without errors.

**✅ Phase 7 Complete!** Everything verified!

---

## 🎉 Deployment Complete!

You now have:
- ✅ AWS infrastructure deployed
- ✅ Next.js app on Vercel
- ✅ OAuth configured with production URL
- ✅ All environment variables set
- ✅ Ready for Task 3: Authentication System

---

## 📝 Save These URLs

Write down your important URLs:

```
Vercel Production URL: https://codelearn-_________________.vercel.app
Cognito Domain: https://codelearn-dev-_______.auth.us-east-1.amazoncognito.com
Cognito User Pool ID: us-east-1__________
Cognito Client ID: __________________________
```

---

## 🚀 Next Steps

1. ✅ Commit and push changes
2. ✅ Create pull request for Task 2
3. ✅ Start Task 3: Authentication System Implementation

---

## 🆘 Troubleshooting

**Issue:** CDK deploy fails
- **Solution:** Check AWS credentials: `aws sts get-caller-identity`

**Issue:** Vercel deploy fails
- **Solution:** Test build locally: `npm run build`

**Issue:** OAuth callback URL mismatch
- **Solution:** Verify URLs match exactly in GitHub/Google and Cognito

---

**Congratulations!** You've successfully deployed everything! 🎉

**Time taken:** ~60 minutes

**Next:** Start implementing Task 3 - Authentication System

