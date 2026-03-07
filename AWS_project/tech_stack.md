# Technical Stack Document
# CodeLearn - AI Learning & Developer Productivity Platform

**Document Version:** 1.0  
**Date:** February 26, 2026  
**Status:** Approved  
**Related Documents:** PRD.md, Understanding.md, Design_Explore.md

---

## Document Purpose

This document defines the complete technical stack, tools, frameworks, languages, platforms, and technical rules for the CodeLearn platform. All development must adhere to these specifications to ensure consistency, maintainability, and scalability.

---

## Architecture Overview

**Architecture Pattern:** Hybrid - Next.js Monolith with Async AI Workers (ADR-0001)

**Core Principle:** Monolithic simplicity for rapid development with asynchronous AI workers to handle long-running operations without timeout constraints.

```
Next.js App (Vercel) → SQS Queue → AI Workers (Fargate) → AWS Services
```

---

## 1. Frontend Stack

### 1.1 Core Framework

**Next.js 14.x** (MANDATORY)
- **Version:** 14.2.0 or higher
- **Router:** App Router (NOT Pages Router)
- **Rendering:** React Server Components + Client Components
- **Rationale:** Modern architecture, excellent DX, Vercel optimization

**React 18.x** (MANDATORY)
- **Version:** 18.2.0 or higher
- **Features:** Concurrent rendering, Suspense, Server Components
- **Hooks:** Use functional components with hooks (NO class components)

### 1.2 UI Framework & Styling

**Tailwind CSS 3.x** (MANDATORY)
- **Version:** 3.4.0 or higher
- **Configuration:** Custom theme in `tailwind.config.ts`
- **Plugins:** Typography, Forms, Container Queries
- **Custom Colors:** Define in config (primary, secondary, accent)

**shadcn/ui** (MANDATORY)
- **Version:** Latest
- **Components:** Install as needed (Button, Card, Dialog, etc.)
- **Customization:** Modify in `components/ui/` directory
- **Rationale:** Accessible, customizable, copy-paste friendly

**Design Tokens:**
```typescript
// tailwind.config.ts
colors: {
  primary: { 50-950 scale },
  secondary: { 50-950 scale },
  accent: { 50-950 scale },
  success: { 50-950 scale },
  warning: { 50-950 scale },
  error: { 50-950 scale }
}
```

### 1.3 Code Editor

**Monaco Editor** (MANDATORY)
- **Package:** `@monaco-editor/react`
- **Version:** 4.6.0 or higher
- **Language Support:** JavaScript, TypeScript, JSX, TSX, JSON, CSS, HTML
- **Theme:** VS Code Dark+ (default), VS Code Light (optional)
- **Features:** Syntax highlighting, IntelliSense, error detection
- **Configuration:**
  - Auto-save on change (debounced 500ms)
  - Minimap enabled
  - Line numbers enabled
  - Bracket matching enabled

### 1.4 State Management

**React Context API** (MANDATORY for global state)
- **Use Cases:** User auth, theme, app settings
- **Pattern:** Context + useReducer for complex state

**TanStack Query (React Query) v5** (MANDATORY for server state)
- **Version:** 5.x
- **Use Cases:** API calls, caching, background refetching
- **Configuration:**
  - `staleTime`: 5 minutes (default)
  - `cacheTime`: 10 minutes
  - `retry`: 3 attempts
  - `refetchOnWindowFocus`: true

**Zustand** (OPTIONAL for complex client state)
- **Version:** 4.x
- **Use Cases:** Editor state, UI preferences
- **Rationale:** Lightweight alternative to Redux

### 1.5 Form Handling

**React Hook Form** (MANDATORY)
- **Version:** 7.x
- **Validation:** Zod schema validation
- **Features:** Uncontrolled components, minimal re-renders

**Zod** (MANDATORY for validation)
- **Version:** 3.x
- **Use Cases:** Form validation, API response validation, env variables

### 1.6 Additional Frontend Libraries

**Framer Motion** (OPTIONAL for animations)
- **Version:** 11.x
- **Use Cases:** Page transitions, micro-interactions
- **Rule:** Use sparingly, prioritize performance

**React Icons** (MANDATORY)
- **Version:** 5.x
- **Icon Sets:** Lucide (primary), Heroicons (secondary)

**date-fns** (MANDATORY for date handling)
- **Version:** 3.x
- **Rationale:** Lightweight, tree-shakeable (vs. Moment.js)

---

## 2. Backend Stack

### 2.1 Runtime & Framework

**Node.js 20.x LTS** (MANDATORY)
- **Version:** 20.11.0 or higher
- **Runtime:** AWS Lambda (serverless)
- **Features:** ES Modules, top-level await

**Next.js API Routes** (MANDATORY for API layer)
- **Location:** `app/api/` directory
- **Pattern:** Route handlers (NOT pages/api)
- **Response:** Use `NextResponse` for consistency

### 2.2 API Design

**RESTful API** (MANDATORY)
- **Naming:** Plural nouns (`/api/projects`, `/api/templates`)
- **Methods:** GET, POST, PUT, PATCH, DELETE
- **Status Codes:**
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Internal Server Error

**API Response Format** (MANDATORY):
```typescript
// Success
{ success: true, data: {...}, message?: string }

// Error
{ success: false, error: { code: string, message: string, details?: any } }
```

**Rate Limiting** (MANDATORY):
- Free tier: 100 requests/hour
- Paid tier: 1000 requests/hour
- Implementation: Upstash Redis or AWS API Gateway throttling

### 2.3 Authentication & Authorization

**AWS Cognito** (MANDATORY)
- **User Pools:** Manage users, passwords, MFA
- **Identity Pools:** Federated identities (GitHub, Google)
- **JWT Tokens:** Access token (1 hour), Refresh token (30 days)

**OAuth Providers** (MANDATORY):
1. **GitHub** (Primary) - Developer-first
2. **Google** (Secondary) - Broad appeal
3. **Email/Password** (Fallback) - Traditional auth

**Authorization Pattern**:
```typescript
// Middleware for protected routes
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')
  if (!token) return NextResponse.redirect('/login')
  // Verify JWT with Cognito
}
```

### 2.4 Database & Storage

**Amazon DynamoDB** (MANDATORY for metadata)
- **Tables:**
  - `users` - User profiles, settings, subscription status
  - `projects` - Project metadata, progress, timestamps
  - `templates` - Template library, ratings, downloads
  - `learning_paths` - AI-generated curricula
  - `jobs` - Async job status tracking
- **Indexes:** GSI for common queries (user_id, created_at)
- **Capacity:** On-demand (pay per request)

**Amazon S3** (MANDATORY for file storage)
- **Buckets:**
  - `codelearn-user-projects` - Full project code
  - `codelearn-templates` - Extracted templates
  - `codelearn-assets` - Images, static files
- **Lifecycle:** Transition to Glacier after 90 days (inactive projects)
- **Encryption:** AES-256 (server-side)
- **Access:** Pre-signed URLs (15 min expiry)

**Data Model Example**:
```typescript
// DynamoDB User Table
{
  PK: "USER#<user_id>",
  SK: "PROFILE",
  email: string,
  name: string,
  avatar_url: string,
  subscription_tier: "free" | "pro" | "team",
  integrations_used: number,
  created_at: ISO8601,
  updated_at: ISO8601
}
```

---

## 3. AI/ML Stack

### 3.1 AI Provider

**AWS Bedrock** (MANDATORY)
- **Primary Model:** Claude 3.5 Sonnet (Anthropic)
  - Use for: Complex reasoning, code generation, explanations
  - Cost: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Secondary Model:** Llama 3.1 70B (Meta)
  - Use for: Simple tasks, cost optimization
  - Cost: ~$0.99 per 1M input tokens, ~$0.99 per 1M output tokens

**Model Selection Strategy**:
- Curator Agent: Llama (simple filtering)
- Teacher Agent: Claude (complex content generation)
- Code Agent: Claude (AST analysis, integration)
- Mentor Agent: Claude (explanations, Q&A)

### 3.2 AI Agent Framework

**LangChain.js** (RECOMMENDED)
- **Version:** 0.1.x
- **Use Cases:** Agent orchestration, prompt templates, memory
- **Alternative:** Custom orchestration (if LangChain overhead too high)

**Agent Architecture**:
```typescript
// Base Agent Interface
interface Agent {
  name: string;
  model: "claude" | "llama";
  systemPrompt: string;
  execute(input: AgentInput): Promise<AgentOutput>;
}

// Agents
- CuratorAgent: GitHub repo discovery & evaluation
- TeacherAgent: Learning content generation
- CodeAgent: Template extraction & integration
- MentorAgent: Q&A and explanations
```

### 3.3 Prompt Engineering

**Prompt Template Structure** (MANDATORY):
```typescript
const SYSTEM_PROMPT = `
You are a ${role}.
Your goal is to ${goal}.
Follow these rules:
1. ${rule1}
2. ${rule2}
Output format: ${format}
`;
```

**Prompt Storage**: Store in `lib/prompts/` directory
**Versioning**: Include version in prompt (v1, v2, etc.)
**Testing**: Unit test prompts with sample inputs

### 3.4 Caching Strategy

**Cache AI Responses** (MANDATORY):
- **Storage:** DynamoDB with TTL (24 hours)
- **Key:** Hash of (model + prompt + input)
- **Invalidation:** Manual or TTL expiry
- **Cost Savings:** 70-80% reduction in AI costs

---

## 4. Infrastructure & DevOps

### 4.1 Hosting & Deployment

**Vercel** (MANDATORY for Next.js app)
- **Plan:** Hobby (free) for MVP, Pro ($20/mo) if needed
- **Features:** Auto-deploy on git push, preview deployments, edge functions
- **Environment:** Production, Preview, Development
- **Domain:** Custom domain (codelearn.dev or similar)

**AWS Services** (MANDATORY for backend)
- **Lambda:** Serverless functions (quick operations)
- **ECS Fargate:** AI workers (long-running)
- **SQS:** Message queue (async jobs)
- **API Gateway:** WebSocket (real-time updates)
- **CloudFront:** CDN for S3 assets
- **CloudWatch:** Logging and monitoring
- **Secrets Manager:** API keys, credentials

### 4.2 Async Job Processing

**Amazon SQS** (MANDATORY)
- **Queue Types:**
  - `ai-jobs-queue` - Standard queue for AI operations
  - `ai-jobs-dlq` - Dead-letter queue for failed jobs
- **Visibility Timeout:** 5 minutes
- **Message Retention:** 4 days
- **Max Receives:** 3 (then move to DLQ)

**ECS Fargate Workers** (MANDATORY)
- **Task Definition:**
  - CPU: 1 vCPU
  - Memory: 2 GB
  - Image: Node.js 20 Alpine
- **Auto-scaling:** 0-10 tasks based on queue depth
- **Polling:** Long-polling SQS (20s wait time)

**Job Status Tracking**:
```typescript
// DynamoDB Jobs Table
{
  PK: "JOB#<job_id>",
  SK: "STATUS",
  user_id: string,
  type: "repo_analysis" | "template_extraction" | "integration",
  status: "pending" | "processing" | "completed" | "failed",
  result?: any,
  error?: string,
  created_at: ISO8601,
  updated_at: ISO8601
}
```

### 4.3 Code Execution Sandboxes

**AWS Lambda** (MANDATORY for quick previews)
- **Runtime:** Node.js 20
- **Timeout:** 15 seconds
- **Memory:** 512 MB
- **Use Cases:** Simple JavaScript execution, quick tests

**ECS Fargate** (MANDATORY for full sessions)
- **Runtime:** Custom Docker image (Node.js + tools)
- **Timeout:** 30 minutes
- **Memory:** 1 GB
- **Use Cases:** Full project execution, complex builds

**Security**:
- Isolated containers per user
- No network access (except whitelisted APIs)
- Resource limits enforced
- Automatic cleanup after execution

### 4.4 CI/CD Pipeline

**GitHub Actions** (MANDATORY)
- **Workflows:**
  - `ci.yml` - Lint, test, build on PR
  - `deploy.yml` - Deploy to Vercel on merge to main
  - `docker.yml` - Build and push worker image to ECR
- **Secrets:** Store in GitHub Secrets (AWS credentials, API keys)

**Deployment Strategy**:
- **Frontend:** Auto-deploy via Vercel (git push)
- **Workers:** Manual deploy via AWS CDK or Terraform
- **Database:** Schema migrations via scripts

---

## 5. Development Tools

### 5.1 Language & Type System

**TypeScript 5.x** (MANDATORY)
- **Version:** 5.3.0 or higher
- **Config:** Strict mode enabled
- **tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### 5.2 Code Quality

**ESLint** (MANDATORY)
- **Config:** `eslint-config-next` (Next.js recommended)
- **Plugins:** `@typescript-eslint`, `eslint-plugin-react-hooks`
- **Rules:** Enforce consistent code style

**Prettier** (MANDATORY)
- **Config:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Husky + lint-staged** (MANDATORY)
- **Pre-commit:** Run ESLint + Prettier on staged files
- **Pre-push:** Run tests

### 5.3 Testing

**Vitest** (MANDATORY for unit tests)
- **Version:** 1.x
- **Config:** `vitest.config.ts`
- **Coverage:** 70%+ target
- **Run:** `npm run test`

**Playwright** (MANDATORY for E2E tests)
- **Version:** 1.x
- **Browsers:** Chromium, Firefox, WebKit
- **Run:** `npm run test:e2e`

**Testing Strategy**:
- Unit tests: Utilities, helpers, pure functions
- Integration tests: API routes, database operations
- E2E tests: Critical user flows (signup, learning path, integration)

### 5.4 Package Management

**npm** (MANDATORY)
- **Version:** 10.x (comes with Node.js 20)
- **Lock File:** `package-lock.json` (commit to git)
- **Scripts:**
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --ext .ts,.tsx",
  "format": "prettier --write .",
  "test": "vitest",
  "test:e2e": "playwright test"
}
```

---

## 6. External Integrations

### 6.1 GitHub API

**GitHub REST API v3** (MANDATORY)
- **Authentication:** Personal Access Token (PAT) or GitHub App
- **Rate Limits:** 5,000 requests/hour (authenticated)
- **Endpoints:**
  - `/search/repositories` - Repo discovery
  - `/repos/{owner}/{repo}` - Repo details
  - `/repos/{owner}/{repo}/contents` - File contents
- **Caching:** Cache repo data for 24 hours

### 6.2 Deployment Platforms

**Vercel API** (MANDATORY)
- **Authentication:** OAuth or API token
- **Endpoints:**
  - `POST /v13/deployments` - Create deployment
  - `GET /v13/deployments/{id}` - Check status
- **Use Case:** One-click deploy from Learning Mode

**Netlify API** (OPTIONAL alternative)
- **Authentication:** OAuth or API token
- **Use Case:** Alternative deployment option

### 6.3 Payment Processing

**Stripe** (MANDATORY for Phase 2)
- **Products:**
  - Developer Pro: $19/mo (recurring)
  - Team: $99/mo (recurring)
- **Webhooks:** Handle subscription events
- **Customer Portal:** Self-service billing

---

## 7. Monitoring & Observability

### 7.1 Logging

**AWS CloudWatch Logs** (MANDATORY)
- **Log Groups:**
  - `/aws/lambda/codelearn-api` - API logs
  - `/ecs/codelearn-workers` - Worker logs
- **Retention:** 7 days (MVP), 30 days (production)
- **Structured Logging:**
```typescript
logger.info('User action', {
  user_id: userId,
  action: 'project_created',
  project_id: projectId,
  timestamp: new Date().toISOString()
});
```

### 7.2 Error Tracking

**Sentry** (MANDATORY)
- **Plan:** Free tier (5K events/month)
- **Integration:** Next.js SDK
- **Features:** Error grouping, source maps, user context
- **Alerts:** Slack notifications for critical errors

### 7.3 Analytics

**Vercel Analytics** (MANDATORY)
- **Metrics:** Page views, Web Vitals, user sessions
- **Cost:** Free with Vercel hosting

**PostHog** (OPTIONAL for product analytics)
- **Features:** Event tracking, funnels, cohorts
- **Self-hosted:** Free (AWS deployment)

### 7.4 Uptime Monitoring

**UptimeRobot** (MANDATORY)
- **Plan:** Free (50 monitors)
- **Checks:** Every 5 minutes
- **Alerts:** Email + Slack

---

## 8. Security & Compliance

### 8.1 Security Best Practices

**OWASP Top 10** (MANDATORY)
- SQL Injection: Use parameterized queries (DynamoDB safe by default)
- XSS: Sanitize user input, use React (auto-escapes)
- CSRF: Use SameSite cookies, CSRF tokens
- Authentication: Use Cognito, secure JWT storage
- Authorization: Verify user permissions on every request

**Data Encryption**:
- **At Rest:** S3 (AES-256), DynamoDB (AWS KMS)
- **In Transit:** HTTPS/TLS 1.3 (enforced)

**Secrets Management**:
- **Storage:** AWS Secrets Manager
- **Access:** IAM roles (no hardcoded credentials)
- **Rotation:** Automatic rotation every 90 days

### 8.2 Compliance

**GDPR** (MANDATORY for EU users)
- Data export: Provide user data on request
- Data deletion: Delete user data on request
- Cookie consent: Banner with opt-in

**CCPA** (MANDATORY for California users)
- Privacy policy: Disclose data collection
- Opt-out: Allow users to opt-out of data sale (N/A for us)

**Terms of Service & Privacy Policy** (MANDATORY)
- Legal review before launch
- Accessible from footer on all pages

---

## 9. Technical Rules & Conventions

### 9.1 Code Organization

**Directory Structure** (MANDATORY):
```
codelearn/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Protected routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── learning/          # Learning Mode components
│   ├── developer/         # Developer Mode components
│   └── shared/            # Shared components
├── lib/                   # Utilities, helpers
│   ├── agents/            # AI agents
│   ├── prompts/           # AI prompts
│   ├── db/                # Database utilities
│   └── utils/             # General utilities
├── types/                 # TypeScript types
├── public/                # Static assets
└── tests/                 # Test files
```

### 9.2 Naming Conventions

**Files**:
- Components: PascalCase (`UserProfile.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL.ts`)

**Variables**:
- camelCase for variables and functions
- PascalCase for classes and components
- UPPER_SNAKE_CASE for constants

**Database**:
- Tables: snake_case (`user_projects`)
- Columns: snake_case (`created_at`)
- Primary Keys: `PK`, `SK` (DynamoDB)

### 9.3 Git Workflow

**Branching Strategy**:
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

**Commit Messages** (Conventional Commits):
```
feat: Add template integration feature
fix: Resolve Monaco editor crash
docs: Update README with setup instructions
chore: Update dependencies
```

**Pull Requests**:
- Require 1 approval before merge
- Run CI checks (lint, test, build)
- Squash and merge to main

### 9.4 Performance Rules

**Frontend**:
- Code splitting: Use dynamic imports for large components
- Image optimization: Use Next.js `<Image>` component
- Lazy loading: Load Monaco editor on demand
- Bundle size: Keep under 200 KB (gzipped)

**Backend**:
- API response time: <3 seconds (95th percentile)
- Database queries: <100ms
- Cache aggressively: Use DynamoDB TTL, CloudFront CDN
- Batch operations: Group DynamoDB writes

**AI Operations**:
- Cache responses: 24-hour TTL
- Use cheaper models: Llama for simple tasks
- Streaming: Stream responses for long operations
- Timeouts: 60 seconds max for user-facing operations

---

## 10. Environment Configuration

### 10.1 Environment Variables

**Required Variables** (MANDATORY):
```bash
# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<secret>
AWS_SECRET_ACCESS_KEY=<secret>

# Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<pool_id>
NEXT_PUBLIC_COGNITO_CLIENT_ID=<client_id>
COGNITO_CLIENT_SECRET=<secret>

# Bedrock
BEDROCK_MODEL_CLAUDE=anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_MODEL_LLAMA=meta.llama3-1-70b-instruct-v1:0

# Database
DYNAMODB_TABLE_USERS=codelearn-users
DYNAMODB_TABLE_PROJECTS=codelearn-projects
S3_BUCKET_PROJECTS=codelearn-user-projects

# GitHub
GITHUB_CLIENT_ID=<client_id>
GITHUB_CLIENT_SECRET=<secret>
GITHUB_PAT=<personal_access_token>

# Vercel
VERCEL_TOKEN=<token>

# Sentry
NEXT_PUBLIC_SENTRY_DSN=<dsn>

# Stripe (Phase 2)
STRIPE_SECRET_KEY=<secret>
STRIPE_WEBHOOK_SECRET=<secret>
```

### 10.2 Environment Files

**Local Development**:
- `.env.local` - Local overrides (gitignored)
- `.env.example` - Template (committed)

**Production**:
- Vercel: Set in dashboard
- AWS: Use Secrets Manager

---

## 11. Version Requirements Summary

| Technology | Version | Status |
|------------|---------|--------|
| Node.js | 20.11.0+ | MANDATORY |
| Next.js | 14.2.0+ | MANDATORY |
| React | 18.2.0+ | MANDATORY |
| TypeScript | 5.3.0+ | MANDATORY |
| Tailwind CSS | 3.4.0+ | MANDATORY |
| TanStack Query | 5.x | MANDATORY |
| Monaco Editor | 4.6.0+ | MANDATORY |
| AWS SDK | 3.x | MANDATORY |
| LangChain.js | 0.1.x | RECOMMENDED |
| Vitest | 1.x | MANDATORY |
| Playwright | 1.x | MANDATORY |

---

## 12. Cost Optimization Rules

**AWS Credits Strategy**:
- Use AWS Activate credits ($5K-10K)
- Monitor usage weekly via Cost Explorer
- Set billing alerts at $100, $250, $500

**Cost Targets**:
- MVP Phase: $0 (within credits)
- Post-Credits: $500-1000/mo
- Break-even: 30-50 paid subscribers

**Optimization Tactics**:
1. Cache AI responses (70-80% cost reduction)
2. Use Llama for simple tasks (3x cheaper than Claude)
3. Auto-scale workers to zero when idle
4. Use S3 Intelligent-Tiering
5. Compress assets with CloudFront
6. Batch DynamoDB operations

---

## 13. Documentation Requirements

**Code Documentation**:
- JSDoc comments for public functions
- README.md in each major directory
- Inline comments for complex logic

**API Documentation**:
- OpenAPI/Swagger spec (auto-generated)
- Example requests/responses
- Error codes and meanings

**User Documentation**:
- Getting started guide
- Feature tutorials
- FAQ section
- Video walkthroughs (Phase 2)

---

## Approval & Sign-off

**Status:** ✅ APPROVED  
**Approved By:** Product Team  
**Date:** February 26, 2026  
**Next Review:** Post-MVP (May 2026)

---

**Related Documents:**
- [Understanding Lock](./Understanding.md)
- [Design Exploration](./Design_Explore.md)
- [Product Requirements Document](./PRD.md)
- [Stitch Design Prompt](./stitch_design_prompt.md)
