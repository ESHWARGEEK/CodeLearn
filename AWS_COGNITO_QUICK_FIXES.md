# AWS Cognito Quick Fixes - Current Console Interface

## Quick Reference for Common Cognito Configuration Tasks

**User Pool**: `codelearn-dev`  
**User Pool ID**: `us-east-1_bNco2tmIx`  
**Client ID**: `1belt192f8jpto6m9f9m3hm6l3`  
**Region**: `us-east-1` (N. Virginia)

---

## Fix 1: Confirm Unconfirmed User

**Problem**: "User is not confirmed" error when logging in

**Solution**:

1. AWS Console → Cognito → User pools → `codelearn-dev`
2. Click **Users** tab
3. Find and click on the user (shows as "Unconfirmed" or "Force change password")
4. Click **Actions** dropdown → **Confirm account**
5. Done! User can now login ✅

---

## Fix 2: Enable USER_PASSWORD_AUTH Flow

**Problem**: "USER_PASSWORD_AUTH flow not enabled for this client" error

**Solution**:

1. AWS Console → Cognito → User pools → `codelearn-dev`
2. Click **App integration** tab
3. Scroll to "App clients and analytics" section
4. Click on your app client (ID: `1belt192f8jpto6m9f9m3hm6l3`)
5. Scroll to "Authentication flows" section
6. Click **Edit**
7. Check ✅ **ALLOW_USER_PASSWORD_AUTH**
8. Check ✅ **ALLOW_REFRESH_TOKEN_AUTH** (if not already checked)
9. Click **Save changes**
10. Done! Email/password login now works ✅

---

## Fix 3: Disable Email Verification (Development Only)

**Problem**: Want users to login immediately without email verification

**Solution** (Current AWS Console):

### Method 1: Via Properties Tab

1. AWS Console → Cognito → User pools → `codelearn-dev`
2. Click **Properties** tab
3. Scroll to "User attribute verification and user account confirmation"
4. Click **Edit**
5. Under "Active attribute values for user account verification"
6. Uncheck **Email** (or select "No verification")
7. Click **Save changes**

### Method 2: Via MFA and Verifications

1. AWS Console → Cognito → User pools → `codelearn-dev`
2. Look for **MFA and verifications** section (may be in Properties or separate tab)
3. Click **Edit**
4. Find "Attribute verification" settings
5. Disable email verification
6. Click **Save changes**

### Method 3: Via AWS CLI

```bash
aws cognito-idp update-user-pool \
  --user-pool-id us-east-1_bNco2tmIx \
  --auto-verified-attributes \
  --region us-east-1
```

**Note**: This removes email from auto-verified attributes, disabling verification requirement.

---

## Console Navigation Tips

### Finding Your Way Around

The AWS Cognito console has different layouts depending on:

- Your AWS region
- When your user pool was created
- AWS Console version updates

**Common Tab Names**:

- **Properties** - User pool settings, verification settings
- **Users** - List of users, user management
- **App integration** - App clients, OAuth settings, domains
- **User pool properties** - Alternative name for Properties
- **Sign-in experience** - May contain verification settings in some versions

**If You Can't Find a Setting**:

1. Try the search bar at the top of the user pool page
2. Look in the "Properties" tab first
3. Check "App integration" for client-related settings
4. Use Ctrl+F to search the page for keywords like "verification"

---

## Common Errors and Solutions

### Error: "User is not confirmed"

→ **Fix 1**: Confirm the user manually

### Error: "USER_PASSWORD_AUTH flow not enabled"

→ **Fix 2**: Enable authentication flow

### Error: "Invalid session for the user"

→ User needs to reset password or be confirmed

### Error: "User does not exist"

→ Check spelling, or user was deleted

### Error: "Incorrect username or password"

→ Verify credentials, or user needs to be confirmed first

---

## Production vs Development Settings

### Development (Current Setup)

- ✅ Email verification: **Disabled** (for faster testing)
- ✅ USER_PASSWORD_AUTH: **Enabled**
- ✅ OAuth providers: **Enabled** (Google, GitHub)
- ✅ Password policy: **Standard** (8+ chars, mixed case, number)

### Production (Recommended)

- ✅ Email verification: **Enabled** (better security)
- ✅ USER_PASSWORD_AUTH: **Enabled**
- ✅ OAuth providers: **Enabled**
- ✅ MFA: **Optional** (consider enabling)
- ✅ Advanced security: **Enabled** (compromised credentials check)
- ✅ Custom email templates: **Configured** (branded emails)

---

## Quick Commands Reference

### Confirm User

```bash
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id us-east-1_bNco2tmIx \
  --username USER_EMAIL \
  --region us-east-1
```

### Enable USER_PASSWORD_AUTH

```bash
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-1_bNco2tmIx \
  --client-id 1belt192f8jpto6m9f9m3hm6l3 \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1
```

### Disable Email Verification

```bash
aws cognito-idp update-user-pool \
  --user-pool-id us-east-1_bNco2tmIx \
  --auto-verified-attributes \
  --region us-east-1
```

### List Users

```bash
aws cognito-idp list-users \
  --user-pool-id us-east-1_bNco2tmIx \
  --region us-east-1
```

### Delete User

```bash
aws cognito-idp admin-delete-user \
  --user-pool-id us-east-1_bNco2tmIx \
  --username USER_EMAIL \
  --region us-east-1
```

---

## Troubleshooting Checklist

When authentication isn't working:

- [ ] Verify you're in the correct region: **us-east-1**
- [ ] Check user status in Users tab (should be "Confirmed")
- [ ] Verify USER_PASSWORD_AUTH is enabled in app client
- [ ] Check if email verification is causing issues
- [ ] Verify environment variables match Cognito IDs
- [ ] Check browser console for specific error messages
- [ ] Try in incognito/private window (clear cookies)
- [ ] Verify Cognito domain is correct in environment variables

---

**Last Updated**: February 28, 2026  
**AWS Console Version**: Current (2026)  
**Note**: AWS Console interface may change. Use search and tab navigation if exact steps differ.
