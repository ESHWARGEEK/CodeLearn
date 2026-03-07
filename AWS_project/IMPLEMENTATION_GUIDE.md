# CodeLearn MVP - Implementation Guide

**Version:** 1.0  
**Date:** February 26, 2026  
**Status:** Ready for Development

---

## Quick Start

This guide provides a complete roadmap for implementing the CodeLearn MVP based on:
- **Requirements:** `.kiro/specs/codelearn-mvp/requirements.md`
- **PRD:** `AWS_project/PRD.md`
- **Design:** `AWS_project/design.md` + `.kiro/specs/codelearn-mvp/design.md`
- **Tech Stack:** `AWS_project/tech_stack.md`
- **Design System:** `AWS_project/design/01_DESIGN_SYSTEM.md`

---

## Architecture Decision

**Approved Pattern:** Hybrid - Next.js Monolith with Async AI Workers

```
Next.js App (Vercel) → SQS Queue → AI Workers (Fargate) → AWS Services
```

**Rationale:**
- Monolithic simplicity for rapid MVP development
- Async workers solve AI timeout issues
- Cost-effective within AWS credits
- Easy to scale post-MVP

---

## Tech Stack Summary

### Frontend
- **Framework:** Next.js 14.2+ (App Router, React Server Components)
- **UI:** Tailwind CSS 3.4+ + shadcn/ui
- **Editor:** Monaco Editor 4.6+
- **State:** React Context + TanStack Query 5.x
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js 20 LTS
- **API:** Next.js API Routes (serverless)
- **Queue:** AWS SQS
- **Workers:** ECS Fargate (Node.js containers)
- **Auth:** AWS Cognito

### Data
- **Database:** DynamoDB (on-demand)
- **Storage:** S3 (Standard tier)
- **Cache:** DynamoDB TTL (24-hour)

### AI
- **Provider:** AWS Bedrock
- **Models:** Claude 3.5 Sonnet (primary), Llama 3.1 (fallback)
- **Framework:** LangChain.js 0.1.x

### Infrastructure
- **Hosting:** Vercel (frontend) + AWS (backend)
- **Sandboxes:** AWS Lambda + ECS Fargate
- **Monitoring:** CloudWatch + Sentry
- **CI/CD:** GitHub Actions

---

## Design System

### Color Palette

```css
/* Primary */
--primary: #6366F1;           /* Indigo 500 */
--primary-hover: #4F46E5;     /* Indigo 600 */

/* Background */
--dark-bg: #0F172A;           /* Slate 900 */
--card-bg: #1E293B;           /* Slate 800 */
--surface: #334155;           /* Slate 700 */

/* Text */
--text-primary: #F8FAFC;      /* Slate 50 */
--text-secondary: #94A3B8;    /* Slate 400 */

/* Accent */
--success: #10B981;           /* Emerald 500 */
--warning: #F59E0B;           /* Amber 500 */
--error: #EF4444;             /* Red 500 */
```

### Typography

```css
--font-sans: 'Inter', sans-serif;
--font-heading: 'Space Grotesk', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Component Patterns

**Buttons:**
```html
<!-- Primary -->
<button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]">
  Primary Action
</button>

<!-- Secondary -->
<button class="px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg font-medium hover:bg-slate-750 transition-colors">
  Secondary Action
</button>
```

**Cards:**
```html
<div class="bg-[#1E293B] p-5 rounded-xl border border-[#334155] hover:border-indigo-500/30 transition-colors">
  <h3 class="text-lg font-semibold text-white mb-2">Card Title</h3>
  <p class="text-sm text-gray-400">Card content</p>
</div>
```

**Inputs:**
```html
<input 
  type="text"
  class="w-full bg-[#1E293B] border border-[#334155] text-sm text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-500"
  placeholder="Enter text..."
/>
```

---

## Implementation Phases

### Phase 1: Infrastructure Setup (Week 1)

**Tasks:**
1. Initialize Next.js 14 project with TypeScript
2. Configure Tailwind CSS + shadcn/ui
3. Set up AWS account and services:
   - Cognito User Pool
   - DynamoDB tables
   - S3 buckets
   - SQS queues
4. Configure Vercel deployment
5. Set up GitHub Actions CI/CD

**Deliverables:**
- Working Next.js app deployed to Vercel
- AWS resources provisioned
- CI/CD pipeline functional

### Phase 2: Authentication (Week 2)

**Tasks:**
1. Implement Cognito integration
2. Create login/register pages
3. Add GitHub OAuth
4. Add Google OAuth
5. Add email/password auth
6. Implement session management
7. Create protected route middleware

**Deliverables:**
- Users can sign up/login
- Session tokens work
- Protected routes redirect to login

**Key Files:**
- `app/api/auth/[...nextauth]/route.ts`
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `middleware.ts`

### Phase 3: Learning Mode Core (Weeks 3-4)

**Tasks:**
1. Create technology selection UI
2. Implement GitHub repo search
3. Build AI project curation (async via SQS)
4. Create learning path display
5. Implement task breakdown generation
6. Build project initialization

**Deliverables:**
- User can select technology
- AI returns 3 projects
- Projects display with tasks

**Key Files:**
- `app/(dashboard)/learning/page.tsx`
- `app/api/learning/curate/route.ts`
- `app/api/learning/projects/[technology]/route.ts`
- `lib/agents/curator-agent.ts`
- `lib/agents/teacher-agent.ts`

### Phase 4: Code Editor Workspace (Weeks 5-6)

**Tasks:**
1. Integrate Monaco Editor
2. Build three-panel layout (tasks, editor, preview)
3. Implement file tree navigation
4. Add code execution (Lambda)
5. Create live preview iframe
6. Implement auto-save (30s intervals)
7. Add syntax highlighting and IntelliSense

**Deliverables:**
- User can write code
- Code executes successfully
- Preview shows output
- No data loss

**Key Files:**
- `app/(workspace)/project/[id]/page.tsx`
- `components/editor/monaco-editor.tsx`
- `components/editor/preview-panel.tsx`
- `app/api/sandbox/preview/route.ts`
- `app/api/projects/[id]/save/route.ts`

### Phase 5: Developer Mode (Weeks 6-7)

**Tasks:**
1. Create template library UI
2. Implement template extraction (async)
3. Build context-aware integration
4. Add preview and undo functionality
5. Enforce usage limits (5/month free)

**Deliverables:**
- User can browse templates
- Integration works
- Preview shows changes
- Undo restores state

**Key Files:**
- `app/(dashboard)/developer/page.tsx`
- `app/api/developer/templates/route.ts`
- `app/api/developer/integrate/route.ts`
- `lib/agents/code-agent.ts`

### Phase 6: Deployment & Polish (Weeks 7-8)

**Tasks:**
1. Implement Vercel deployment integration
2. Create portfolio page
3. Build onboarding flow
4. Fix bugs and optimize performance
5. Add error handling and loading states
6. Write documentation

**Deliverables:**
- One-click deploy works
- Portfolio displays projects
- Onboarding <5 min
- <2% error rate

**Key Files:**
- `app/api/deploy/route.ts`
- `app/(dashboard)/portfolio/page.tsx`
- `app/(onboarding)/welcome/page.tsx`

---

## Key Requirements Mapping

### Authentication (Requirement 1)
- **Implementation:** AWS Cognito + Next.js API Routes
- **Files:** `app/api/auth/*`, `middleware.ts`
- **OAuth:** GitHub (primary), Google (secondary), Email (fallback)

### Technology Selection (Requirement 2)
- **Implementation:** Static UI + AI validation
- **Files:** `app/(dashboard)/learning/page.tsx`
- **Technologies:** React, Vue, Next.js, Node.js

### Learning Path Generation (Requirement 3)
- **Implementation:** Async SQS + Bedrock Claude
- **Files:** `app/api/learning/curate/route.ts`, `lib/agents/curator-agent.ts`
- **Output:** 3 projects (beginner → intermediate → advanced)

### Task Breakdown (Requirement 4)
- **Implementation:** Bedrock Claude + AST analysis
- **Files:** `lib/agents/teacher-agent.ts`
- **Output:** 10-15 buildable tasks

### Code Editor (Requirement 5)
- **Implementation:** Monaco Editor 4.6+
- **Files:** `components/editor/monaco-editor.tsx`
- **Features:** Syntax highlighting, IntelliSense, multi-file

### Live Preview (Requirement 6)
- **Implementation:** Lambda (stateless) + Fargate (stateful)
- **Files:** `app/api/sandbox/preview/route.ts`
- **Timeout:** <5 seconds

### Auto-Save (Requirement 7)
- **Implementation:** React useEffect + debounce (30s)
- **Files:** `hooks/use-auto-save.ts`
- **Storage:** S3 + DynamoDB

### Git Workflow (Requirement 8)
- **Implementation:** GitHub API + conventional commits
- **Files:** `app/api/git/create-pr/route.ts`
- **Pattern:** Feature branch → PR → CI/CD → Merge

### CI/CD Pipeline (Requirement 9)
- **Implementation:** GitHub Actions
- **Files:** `.github/workflows/ci.yml`
- **Checks:** Lint, test, build

### Deployment (Requirement 10)
- **Implementation:** Vercel API
- **Files:** `app/api/deploy/route.ts`
- **Target:** Vercel

### Template Discovery (Requirement 11)
- **Implementation:** Bedrock + GitHub API
- **Files:** `app/api/developer/templates/route.ts`
- **Library:** 10-15 curated templates

### Template Integration (Requirement 12)
- **Implementation:** Bedrock Claude + AST analysis
- **Files:** `lib/agents/code-agent.ts`
- **Features:** Context-aware, style-matching, undo

### Usage Limits (Requirement 13)
- **Implementation:** DynamoDB counter + monthly reset
- **Files:** `app/api/developer/usage/route.ts`
- **Limits:** 5 integrations/month (free)

---

## Data Models

### User
```typescript
interface User {
  userId: string;              // Cognito ID
  email: string;
  name: string;
  avatarUrl?: string;
  authProvider: 'github' | 'google' | 'email';
  tier: 'free' | 'premium';
  monthlyIntegrations: number;
  integrationLimit: number;    // 5 for free
  createdAt: Date;
  lastLoginAt: Date;
}
```

### Project
```typescript
interface Project {
  projectId: string;
  userId: string;
  title: string;
  technology: 'react' | 'vue' | 'nextjs' | 'nodejs';
  mode: 'learning' | 'developer';
  status: 'in-progress' | 'completed' | 'archived';
  progress: number;            // 0-100
  currentTaskId?: string;
  completedTaskIds: string[];
  githubRepoUrl?: string;
  vercelProjectId?: string;
  activeDeploymentUrl?: string;
  createdAt: Date;
  lastModified: Date;
}
```

### Task
```typescript
interface Task {
  taskId: string;
  projectId: string;
  number: number;
  title: string;
  description: string;
  guidance: string;            // AI-generated
  status: 'pending' | 'in-progress' | 'completed';
  branchName?: string;
  prUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}
```

---

## API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

### Learning Mode
```
GET  /api/learning/technologies
POST /api/learning/curate
GET  /api/learning/projects/{technology}
GET  /api/learning/project/{projectId}/tasks
POST /api/learning/project/{projectId}/save
GET  /api/learning/progress/{userId}
```

### Developer Mode
```
GET  /api/developer/templates
POST /api/developer/extract
POST /api/developer/integrate
GET  /api/developer/integration/{jobId}/preview
POST /api/developer/integration/{jobId}/approve
POST /api/developer/integration/{jobId}/undo
GET  /api/developer/usage/{userId}
```

### Sandbox
```
POST /api/sandbox/execute
POST /api/sandbox/deploy
GET  /api/sandbox/deployment/{deploymentId}
```

### Jobs
```
GET  /api/jobs/{jobId}
POST /api/jobs/{jobId}/cancel
```

---

## Environment Variables

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
```

---

## Testing Strategy

### Unit Tests (Vitest)
- Utilities and helpers
- Pure functions
- Data transformations
- 70%+ coverage target

### Integration Tests (Vitest)
- API routes
- Database operations
- AI agent interactions

### E2E Tests (Playwright)
- User signup/login
- Learning path selection
- Code editor workflow
- Template integration
- Deployment

---

## Performance Targets

- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **API Response Time (P95):** <3s
- **Page Load Time (P95):** <2s
- **AI Response Time (P95):** <10s
- **Sandbox Execution (P95):** <5s

---

## Security Checklist

- [ ] All data encrypted at rest (S3, DynamoDB)
- [ ] All data encrypted in transit (HTTPS/TLS 1.3)
- [ ] Input validation on all API endpoints
- [ ] CORS policies configured
- [ ] Rate limiting implemented
- [ ] Sandboxes isolated per user
- [ ] No PII in logs
- [ ] OAuth tokens stored securely
- [ ] Password complexity enforced
- [ ] OWASP Top 10 addressed

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] AWS resources provisioned
- [ ] Cognito user pool created
- [ ] DynamoDB tables created
- [ ] S3 buckets created
- [ ] SQS queues created
- [ ] Fargate task definitions created
- [ ] GitHub Actions workflows configured
- [ ] Vercel project connected
- [ ] Domain configured
- [ ] Monitoring set up (CloudWatch, Sentry)
- [ ] Error tracking configured
- [ ] Analytics configured

---

## Success Metrics

### User Acquisition (3 months)
- Total Registered Users: 500+
- Weekly Active Users: 50+
- Completed Learning Paths: 20+

### Engagement
- Sessions per User per Week: 3+
- Task Completion Rate: 60%+
- Average Session Duration: 20+ min
- Template Integration Success: 90%+

### Technical
- API Response Time (P95): <3s
- Page Load Time (P95): <2s
- Uptime: 95%+
- Error Rate: <2%

---

## Support Resources

### Documentation
- [Requirements Document](.kiro/specs/codelearn-mvp/requirements.md)
- [Product Requirements Document](AWS_project/PRD.md)
- [Design Specifications](AWS_project/design.md)
- [Technical Stack](AWS_project/tech_stack.md)
- [Design System](AWS_project/design/01_DESIGN_SYSTEM.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)

---

## Contact & Support

For questions or issues during implementation:
1. Review this guide and related documentation
2. Check existing design patterns in `AWS_project/design.md`
3. Refer to tech stack specifications in `AWS_project/tech_stack.md`
4. Consult requirements in `.kiro/specs/codelearn-mvp/requirements.md`

---

**Last Updated:** February 26, 2026  
**Version:** 1.0  
**Status:** Ready for Development

