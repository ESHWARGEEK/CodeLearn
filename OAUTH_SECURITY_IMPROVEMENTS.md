# OAuth Security Improvements - CSRF Protection

**Date:** February 28, 2026  
**Branch:** feature/task-3-authentication  
**Commit:** `security: add CSRF protection with state parameter to OAuth flow` (1c1a4ee)

---

## 🔒 Security Vulnerabilities Fixed

### 1. Missing CSRF/State Parameter

**Vulnerability:** OAuth flow was vulnerable to CSRF attacks without state parameter validation.

**Risk Level:** HIGH - Could allow attackers to trick users into authorizing malicious applications.

**Fix:** Implemented cryptographically strong state parameter with validation.

---

### 2. Missing Environment Variable Validation

**Vulnerability:** OAuth flow could fail silently if environment variables were missing.

**Risk Level:** MEDIUM - Could lead to confusing user experience and potential security misconfigurations.

**Fix:** Added explicit validation with user-friendly error messages.

---

## ✅ Security Improvements Implemented

### 1. Cryptographically Strong State Generation

**Location:** `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`

```typescript
// Generate 32-byte random state using Web Crypto API
const stateArray = new Uint8Array(32);
crypto.getRandomValues(stateArray);
const state = Array.from(stateArray, (byte) => byte.toString(16).padStart(2, '0')).join('');
```

**Benefits:**

- Uses `crypto.getRandomValues()` for cryptographically secure randomness
- 32 bytes = 256 bits of entropy (extremely difficult to guess)
- Converted to hex string for URL safety

---

### 2. State Persistence in SessionStorage

**Location:** `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`

```typescript
// Store state in sessionStorage (more secure than localStorage)
sessionStorage.setItem('oauth_state', state);
sessionStorage.setItem('oauth_state_timestamp', Date.now().toString());
```

**Benefits:**

- SessionStorage is cleared when tab/window closes (better security)
- Timestamp allows for expiration validation (5-minute window)
- Not accessible across different tabs/windows

---

### 3. State Parameter in OAuth URL

**Location:** `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`

```typescript
const authUrl =
  `https://${cognitoDomain}/oauth2/authorize?` +
  `client_id=${clientId}&` +
  `response_type=code&` +
  `scope=email+openid+profile&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  `state=${state}&` + // ← Added state parameter
  `identity_provider=${provider === 'github' ? 'GitHub' : 'Google'}`;
```

**Benefits:**

- State is sent to OAuth provider and returned in callback
- Allows validation that the callback came from our initiated request

---

### 4. Client-Side State Validation

**Location:** `app/api/auth/callback/[provider]/route.ts`

The callback now returns an HTML page that validates the state client-side:

```javascript
// Retrieve stored state from sessionStorage
const storedState = sessionStorage.getItem('oauth_state');
const stateTimestamp = sessionStorage.getItem('oauth_state_timestamp');

// Clear stored state immediately
sessionStorage.removeItem('oauth_state');
sessionStorage.removeItem('oauth_state_timestamp');

// Validate state matches
if (storedState !== returnedState) {
  console.error('State mismatch - possible CSRF attack');
  window.location.href = '/login?error=state_mismatch';
  return;
}

// Validate state is not expired (5 minutes max)
const now = Date.now();
const timestamp = parseInt(stateTimestamp || '0', 10);
const fiveMinutes = 5 * 60 * 1000;

if (now - timestamp > fiveMinutes) {
  window.location.href = '/login?error=state_expired';
  return;
}
```

**Benefits:**

- Validates state matches before proceeding
- Prevents replay attacks with 5-minute expiration
- Clears state immediately after use (one-time use)
- Logs potential CSRF attacks for monitoring

---

### 5. Separate Token Exchange Endpoint

**Location:** `app/api/auth/callback/[provider]/exchange/route.ts`

Created a new POST endpoint that only exchanges the code after state validation:

```typescript
export async function POST(request: NextRequest, { params }: { params: { provider: string } }) {
  // Validate provider
  // Validate request body
  // Exchange code for tokens
  // Set secure cookies
  // Return success response
}
```

**Benefits:**

- Separates state validation (client-side) from token exchange (server-side)
- Token exchange only happens after state is validated
- Uses POST method (more secure than GET for sensitive operations)
- Validates all inputs with Zod schema

---

### 6. Environment Variable Validation

**Location:** `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`

```typescript
// Validate required environment variables
const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

if (!cognitoDomain || !clientId) {
  setError('OAuth configuration is missing. Please contact support.');
  console.error('Missing OAuth environment variables:', {
    cognitoDomain: !!cognitoDomain,
    clientId: !!clientId,
  });
  return;
}
```

**Benefits:**

- Fails gracefully with user-friendly error message
- Logs missing variables for debugging
- Prevents silent failures and confusing errors

---

## 🛡️ Security Properties

### CSRF Protection

✅ State parameter prevents cross-site request forgery  
✅ Cryptographically strong random state (256 bits)  
✅ One-time use (state cleared after validation)  
✅ Time-limited (5-minute expiration window)

### Replay Attack Prevention

✅ State is single-use only  
✅ Timestamp validation prevents old states from being reused  
✅ SessionStorage cleared after use

### Configuration Security

✅ Environment variables validated before use  
✅ Graceful error handling for missing configuration  
✅ No sensitive data exposed in error messages

---

## 🔄 OAuth Flow (Updated)

### Before (Vulnerable)

1. User clicks OAuth button
2. Redirect to Cognito without state
3. User authorizes
4. Callback receives code
5. Exchange code for tokens ❌ No CSRF protection

### After (Secure)

1. User clicks OAuth button
2. **Generate random state (256 bits)**
3. **Store state in sessionStorage with timestamp**
4. Redirect to Cognito **with state parameter**
5. User authorizes
6. Callback receives code **and state**
7. **Client-side validation:**
   - Check state exists in sessionStorage
   - Verify state matches returned state
   - Verify state is not expired (< 5 minutes)
   - Clear state from sessionStorage
8. **POST to exchange endpoint** with code
9. Server exchanges code for tokens
10. Set secure httpOnly cookies
11. Redirect to dashboard

---

## 📊 Error Handling

### New Error Codes

| Error Code        | Description                                    | User Action                                |
| ----------------- | ---------------------------------------------- | ------------------------------------------ |
| `missing_state`   | State parameter not returned by OAuth provider | Try again                                  |
| `state_not_found` | State not found in sessionStorage              | Try again (may have expired)               |
| `state_mismatch`  | Returned state doesn't match stored state      | **Possible CSRF attack** - Contact support |
| `state_expired`   | State is older than 5 minutes                  | Try again                                  |
| `oauth_failed`    | General OAuth failure                          | Try again or contact support               |

---

## 🧪 Testing Recommendations

### Manual Testing

1. **Normal Flow:**
   - Click OAuth button
   - Authorize with provider
   - Should redirect to dashboard successfully

2. **State Expiration:**
   - Click OAuth button
   - Wait 6 minutes before authorizing
   - Should show "state_expired" error

3. **State Tampering:**
   - Click OAuth button
   - Modify `oauth_state` in sessionStorage
   - Complete authorization
   - Should show "state_mismatch" error

4. **Missing Configuration:**
   - Remove `NEXT_PUBLIC_COGNITO_DOMAIN` from environment
   - Click OAuth button
   - Should show configuration error

### Automated Testing (Future)

- Property test: State is always unique
- Property test: State validation always succeeds for valid states
- Property test: State validation always fails for invalid states
- Unit test: State generation produces 64-character hex string
- Unit test: State expiration works correctly
- Integration test: Full OAuth flow with state validation

---

## 📝 Files Modified

1. `app/(auth)/login/page.tsx` - Added state generation and validation
2. `app/(auth)/signup/page.tsx` - Added state generation and validation
3. `app/api/auth/callback/[provider]/route.ts` - Added client-side state validation HTML
4. `app/api/auth/callback/[provider]/exchange/route.ts` - New endpoint for token exchange

---

## 🚀 Deployment Notes

### Environment Variables Required

All existing environment variables are still required:

- `NEXT_PUBLIC_COGNITO_DOMAIN`
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `COGNITO_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Breaking Changes

None. The OAuth flow is backward compatible, but now includes state parameter.

### Browser Compatibility

Requires:

- `crypto.getRandomValues()` - Supported in all modern browsers
- `sessionStorage` - Supported in all modern browsers
- `fetch` API - Supported in all modern browsers

---

## 📚 References

- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [AWS Cognito OAuth 2.0 Grants](https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html)

---

## ✅ Security Checklist

- [x] State parameter generated with cryptographically strong randomness
- [x] State stored securely in sessionStorage
- [x] State included in OAuth authorization URL
- [x] State validated on callback before token exchange
- [x] State expiration enforced (5-minute window)
- [x] State cleared after single use
- [x] Environment variables validated before OAuth flow
- [x] Error handling for all failure scenarios
- [x] User-friendly error messages
- [x] Security logging for potential attacks

---

## 🎉 Result

The OAuth flow is now protected against CSRF attacks and follows OAuth 2.0 security best practices. Users can safely authenticate with GitHub and Google without risk of cross-site request forgery.
