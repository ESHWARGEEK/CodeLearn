# Testing Checklist: Tasks 3-5

## Pre-Testing Setup

### Environment Setup
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npm run dev` to start the development server
- [ ] Verify server is running on `http://localhost:3000`
- [ ] Open browser DevTools (F12) to monitor console and network

### AWS Services Check
- [ ] Verify AWS credentials are configured in `.env`
- [ ] Check DynamoDB tables exist in AWS Console
- [ ] Verify Cognito User Pool is active
- [ ] Confirm S3 buckets are created

---

## Task 3: Authentication System ✅

### 3.1 Cognito Integration
- [ ] Check `.env` has all Cognito variables:
  - `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
  - `NEXT_PUBLIC_COGNITO_CLIENT_ID`
  - `NEXT_PUBLIC_COGNITO_REGION`
- [ ] Verify `lib/auth/cognito.ts` exists and exports functions

### 3.2 Authentication Context
- [ ] Navigate to any page and check auth context loads
- [ ] Open DevTools → React Components → Find `AuthProvider`
- [ ] Verify no console errors related to auth context

### 3.3 Login Page
**URL:** `http://localhost:3000/login`

- [ ] Page loads without errors
- [ ] Email input field is visible and functional
- [ ] Password input field is visible and functional
- [ ] "Log In" button is present
- [ ] "Sign up" link redirects to `/signup`

**Test Login Flow:**
- [ ] Enter valid email and password
- [ ] Click "Log In" button
- [ ] Check Network tab for POST request to `/api/auth/login`
- [ ] Verify successful login redirects to `/dashboard`
- [ ] Check localStorage/sessionStorage for auth tokens

**Test Validation:**
- [ ] Try submitting empty form → Should show validation errors
- [ ] Try invalid email format → Should show email error
- [ ] Try wrong credentials → Should show error message

### 3.4 Signup Page
**URL:** `http://localhost:3000/signup`

- [ ] Page loads without errors
- [ ] Email input field works
- [ ] Password input field works
- [ ] Confirm password field works
- [ ] "Sign Up" button is present
- [ ] "Log in" link redirects to `/login`

**Test Signup Flow:**
- [ ] Enter valid email and matching passwords
- [ ] Click "Sign Up" button
- [ ] Check Network tab for POST request to `/api/auth/signup`
- [ ] Verify account creation (check Cognito User Pool in AWS Console)
- [ ] Verify redirect to `/dashboard` or `/login`

**Test Validation:**
- [ ] Password must be 8+ characters
- [ ] Password must have uppercase letter
- [ ] Password must have lowercase letter
- [ ] Password must have number
- [ ] Passwords must match
- [ ] Email must be valid format

### 3.5 API Routes
**Test in Browser DevTools → Network Tab**

**POST /api/auth/login**
- [ ] Endpoint exists and responds
- [ ] Returns 200 for valid credentials
- [ ] Returns 401 for invalid credentials
- [ ] Returns JWT tokens in response
- [ ] Response format: `{ success: true, data: { userId, token, refreshToken } }`

**POST /api/auth/signup**
- [ ] Endpoint exists and responds
- [ ] Returns 201 for successful signup
- [ ] Returns 400 for invalid data
- [ ] Creates user in Cognito
- [ ] Response format: `{ success: true, data: { userId, token, refreshToken } }`

**POST /api/auth/logout**
- [ ] Endpoint exists
- [ ] Clears auth tokens
- [ ] Returns success response

**GET /api/auth/me**
- [ ] Returns current user data when authenticated
- [ ] Returns 401 when not authenticated

### 3.6 OAuth Callback Handlers
**Note:** OAuth testing requires configured providers

- [ ] GitHub OAuth callback route exists at `/api/auth/callback/github`
- [ ] Google OAuth callback route exists at `/api/auth/callback/google`
- [ ] Check Cognito console for OAuth configuration

### 3.7 Protected Route Middleware
**Test Protected Routes:**

- [ ] Try accessing `/dashboard` without login → Should redirect to `/login`
- [ ] Try accessing `/learning` without login → Should redirect to `/login`
- [ ] Login and access `/dashboard` → Should work
- [ ] Login and access `/learning` → Should work

### 3.8 Simplified Auth Flow
- [ ] No email verification required (can login immediately after signup)
- [ ] Password reset flow works (if implemented)
- [ ] Session persists on page refresh

---

## Task 4: Dashboard & Navigation ✅

### 4.1 Sidebar Navigation
**URL:** `http://localhost:3000/dashboard`

- [ ] Navbar component loads at top of page
- [ ] Logo/brand is visible
- [ ] Navigation links are present:
  - [ ] Dashboard
  - [ ] Learning (Courses)
  - [ ] Projects
- [ ] User avatar/profile dropdown is visible
- [ ] All links are clickable and navigate correctly

### 4.2 Dashboard Stats Cards
- [ ] Stats cards are visible on dashboard
- [ ] Cards show:
  - [ ] Completed projects count
  - [ ] Total hours
  - [ ] Integration count (for Developer Mode)
- [ ] Numbers display correctly (even if 0)
- [ ] Cards have proper styling and icons

### 4.3 Continue Learning Section
- [ ] "Continue Learning" section is visible
- [ ] Shows recent/in-progress projects (if any)
- [ ] Empty state shows when no projects
- [ ] Cards are clickable

### 4.4 Recommended Projects Section
- [ ] "Recommended Projects" section is visible
- [ ] Shows project recommendations
- [ ] Each project card displays:
  - [ ] Project name
  - [ ] Description
  - [ ] Difficulty level
  - [ ] Estimated time
- [ ] Cards are clickable

### 4.5 AI Mentor Widget
- [ ] AI Mentor chat widget is visible
- [ ] Widget can be opened/closed
- [ ] Chat interface is functional
- [ ] Input field accepts text

### 4.6 Daily Code Challenge
- [ ] Daily challenge section is visible (if implemented)
- [ ] Shows challenge title and description
- [ ] Has "Start Challenge" button

### 4.7 Community Activity Feed
- [ ] Activity feed section is visible (if implemented)
- [ ] Shows recent activities
- [ ] Updates display correctly

---

## Task 5: Learning Mode - Technology Selection

### 5.1 Technology Selector UI
**URL:** `http://localhost:3000/learning`

**Page Load:**
- [ ] Page loads without errors
- [ ] No console errors in DevTools
- [ ] Loading spinner shows briefly
- [ ] Technology cards appear after loading

**Header Section:**
- [ ] "Choose Your Technology" title is visible
- [ ] Description text is present
- [ ] "GitHub Certification Included" badge is visible with pulse animation

**Search & Filters:**
- [ ] Search input field is present
- [ ] Search placeholder text: "Search technologies (e.g. React, Backend, Mobile)..."
- [ ] "Difficulty" dropdown button is visible
- [ ] "Popularity" dropdown button is visible
- [ ] "All Filters" button is visible with icon
- [ ] All buttons have hover effects

**Search Functionality:**
- [ ] Type "React" in search → React card should remain visible
- [ ] Type "Vue" in search → Vue card should remain visible
- [ ] Type "xyz" in search → No cards should show
- [ ] Clear search → All cards reappear

### 5.2 Technology Cards Display
**Card Layout:**
- [ ] Cards are displayed in a 4-column grid (on desktop)
- [ ] Cards are responsive (fewer columns on mobile/tablet)
- [ ] All cards have consistent height and styling

**Each Technology Card Should Have:**
- [ ] Icon/emoji at top left
- [ ] Difficulty badge at top right (Beginner-friendly/Intermediate/Advanced)
- [ ] Technology name (e.g., "React.js", "Vue.js")
- [ ] Description text (2 lines, truncated)
- [ ] Project count with folder icon
- [ ] Learning path duration with clock icon
- [ ] "Start Learning" button at bottom
- [ ] Hover effect (border color change, shadow)

**Verify All Technology Cards:**
- [ ] React.js card displays correctly
- [ ] Vue.js card displays correctly
- [ ] Next.js card displays correctly
- [ ] Node.js card displays correctly
- [ ] TypeScript card displays correctly (if visible)
- [ ] Python card displays correctly (if visible)
- [ ] Express.js card displays correctly (if visible)
- [ ] Tailwind CSS card displays correctly (if visible)

**Card Interactions:**
- [ ] Hover over card → Border color changes
- [ ] Hover over card → Shadow appears
- [ ] Click "Start Learning" button → Console logs technology ID
- [ ] Click "Start Learning" button → No errors in console

### 5.3 Curator Agent (Backend)
**API Endpoint Test:**

Open DevTools → Console and run:
```javascript
fetch('/api/learning/technologies')
  .then(r => r.json())
  .then(console.log)
```

- [ ] API responds with 200 status
- [ ] Response format: `{ success: true, data: { technologies: [...] } }`
- [ ] Each technology has: id, name, description, icon, projectCount
- [ ] No errors in response

**Test Curator Agent:**
```javascript
fetch('/api/learning/curate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ technology: 'react', userId: 'test-user' })
}).then(r => r.json()).then(console.log)
```

- [ ] API responds with 200 status
- [ ] Response includes jobId
- [ ] Response format: `{ success: true, data: { jobId: '...', status: 'queued' } }`

### 5.4 Job Status Polling
**Test Job Status API:**
```javascript
// Replace JOB_ID with actual jobId from curate response
fetch('/api/jobs/JOB_ID')
  .then(r => r.json())
  .then(console.log)
```

- [ ] API responds with job status
- [ ] Status is one of: queued, processing, completed, failed
- [ ] Response includes progress (0-100)

### 5.5 Coming Soon Section
- [ ] "Coming Soon" heading is visible
- [ ] Python Core card is displayed
- [ ] Go (Golang) card is displayed
- [ ] Cards have "Coming Soon" badge
- [ ] Cards are slightly dimmed/disabled
- [ ] Cards show description text

### 5.6 Career Path Section
- [ ] Career Path section is visible at bottom
- [ ] Has gradient background
- [ ] Shows "Career Path" badge
- [ ] Shows graduation cap icon
- [ ] Title: "Don't know where to start?"
- [ ] Description text is present
- [ ] "Take Career Quiz" button is visible
- [ ] Shows "Frontend Architect" career title
- [ ] Shows salary range "$124k - $160k"
- [ ] Shows "Estimated Salary" label

### 5.7 Caching (24-hour TTL)
**Test Cache Behavior:**

1. **First Request (Cache Miss):**
```javascript
fetch('/api/learning/curate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ technology: 'react', userId: 'test-user' })
}).then(r => r.json()).then(console.log)
```
- [ ] Response includes `jobId` (indicates new job created)
- [ ] Check console logs for "Cache miss" message

2. **Second Request (Cache Hit):**
```javascript
// Run same request again immediately
fetch('/api/learning/curate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ technology: 'react', userId: 'test-user' })
}).then(r => r.json()).then(console.log)
```
- [ ] Response includes `cached: true`
- [ ] Response includes `projects` array directly
- [ ] No `jobId` in response (cache hit)
- [ ] Check console logs for "Cache hit" message

**Verify DynamoDB TTL:**
- [ ] Open AWS Console → DynamoDB
- [ ] Navigate to `learning_paths` table
- [ ] Check items have `expiresAt` field
- [ ] Verify `expiresAt` is ~24 hours from `generatedAt`
- [ ] Verify TTL is enabled on the table

---

## Integration Tests

### End-to-End User Flow
**Complete User Journey:**

1. **Signup & Login:**
   - [ ] Go to `/signup`
   - [ ] Create new account
   - [ ] Verify redirect to dashboard
   - [ ] Check user is authenticated

2. **Navigate to Learning:**
   - [ ] Click "Learning" or "Courses" in navbar
   - [ ] Verify redirect to `/learning`
   - [ ] Technology selector loads

3. **Select Technology:**
   - [ ] Click "Start Learning" on React card
   - [ ] Check console for technology selection log
   - [ ] Verify no errors

4. **Dashboard Navigation:**
   - [ ] Click "Dashboard" in navbar
   - [ ] Verify dashboard loads
   - [ ] Stats cards display

5. **Logout:**
   - [ ] Click user avatar/profile
   - [ ] Click "Logout"
   - [ ] Verify redirect to login page
   - [ ] Try accessing `/dashboard` → Should redirect to login

### Cross-Browser Testing
Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

### Responsive Design Testing
Test at different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Check:**
- [ ] Technology cards adjust to screen size
- [ ] Navbar is responsive
- [ ] Search bar is usable on mobile
- [ ] Buttons are tappable on mobile
- [ ] Text is readable at all sizes

---

## Performance Tests

### Page Load Performance
- [ ] Dashboard loads in < 2 seconds
- [ ] Learning page loads in < 2 seconds
- [ ] Technology cards render in < 1 second
- [ ] No layout shift during load

### API Response Times
- [ ] `/api/learning/technologies` responds in < 500ms
- [ ] `/api/auth/login` responds in < 1 second
- [ ] `/api/learning/curate` responds in < 1 second

### Network Efficiency
- [ ] Check Network tab for unnecessary requests
- [ ] Verify images are optimized
- [ ] Check for duplicate API calls

---

## Error Handling Tests

### Network Errors
**Simulate offline mode:**
- [ ] Open DevTools → Network → Set to "Offline"
- [ ] Try to load `/learning` page
- [ ] Verify graceful error handling
- [ ] Check fallback to mock data works

### Invalid Data
**Test with invalid inputs:**
- [ ] Login with empty email → Shows error
- [ ] Login with invalid email format → Shows error
- [ ] Signup with weak password → Shows error
- [ ] Search with special characters → No crash

### API Errors
**Test error responses:**
```javascript
// Test with invalid technology
fetch('/api/learning/curate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ technology: 'invalid', userId: 'test' })
}).then(r => r.json()).then(console.log)
```
- [ ] Returns appropriate error message
- [ ] Status code is 400 or 404
- [ ] Error format: `{ success: false, error: { code, message } }`

---

## Security Tests

### Authentication Security
- [ ] Passwords are not visible in network requests
- [ ] Tokens are stored securely (httpOnly cookies or secure storage)
- [ ] Protected routes require authentication
- [ ] Invalid tokens are rejected

### Input Validation
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized
- [ ] CSRF protection is in place

---

## Database Verification

### DynamoDB Tables
**Check in AWS Console:**

**users table:**
- [ ] Table exists
- [ ] Has correct schema (PK, SK, email, name, etc.)
- [ ] Test user records are created after signup

**learning_paths table:**
- [ ] Table exists
- [ ] Has correct schema (PK, SK, projectId, tasks, etc.)
- [ ] Has `expiresAt` field for TTL
- [ ] TTL is enabled on `expiresAt` attribute

**jobs table:**
- [ ] Table exists
- [ ] Has correct schema (PK, SK, type, status, etc.)
- [ ] Job records are created when curating

---

## Automated Tests

### Unit Tests
Run: `npm test`

- [ ] All tests pass
- [ ] No failing tests
- [ ] Coverage is > 70% (if configured)

**Specific test files to check:**
- [ ] `tests/unit/db/learning-paths.test.ts` passes
- [ ] `tests/unit/api/learning-curate.test.ts` passes
- [ ] `tests/unit/agents/curator-agent.test.ts` passes

### Build Test
Run: `npm run build`

- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No ESLint errors (or only warnings)
- [ ] Build output shows all pages compiled

---

## Final Checklist

### Code Quality
- [ ] No console errors in browser
- [ ] No console warnings (or only expected ones)
- [ ] Code follows project conventions
- [ ] All files are properly formatted

### Documentation
- [ ] README is up to date
- [ ] API endpoints are documented
- [ ] Environment variables are documented

### Git & Deployment
- [ ] All changes are committed
- [ ] Branch is pushed to remote
- [ ] No merge conflicts
- [ ] Build passes on CI/CD (if configured)

### Production Readiness
- [ ] Environment variables are set in Vercel
- [ ] AWS credentials are configured
- [ ] Database tables are created in production
- [ ] Cognito is configured for production domain

---

## Issue Tracking

### Found Issues
Document any issues found during testing:

| Issue # | Description | Severity | Status |
|---------|-------------|----------|--------|
| 1 | | High/Medium/Low | Open/Fixed |
| 2 | | High/Medium/Low | Open/Fixed |

---

## Sign-Off

**Tested By:** _______________  
**Date:** _______________  
**Environment:** Local / Staging / Production  
**Overall Status:** ✅ Pass / ❌ Fail / ⚠️ Pass with Issues

**Notes:**
_Add any additional notes or observations here_

---

## Quick Test Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run specific test file
npm test learning-paths.test.ts

# Build for production
npm run build

# Check TypeScript
npx tsc --noEmit

# Check ESLint
npm run lint
```

## Useful DevTools Console Commands

```javascript
// Test authentication status
console.log('Auth:', localStorage.getItem('token') ? 'Logged in' : 'Not logged in');

// Test API endpoints
fetch('/api/learning/technologies').then(r => r.json()).then(console.log);

// Clear all storage
localStorage.clear(); sessionStorage.clear();

// Check React components
// Open React DevTools → Components tab
```
