# Design Exploration - AI Learning & Developer Productivity Platform

**Date:** February 25, 2026  
**Status:** In Review  
**Phase:** Design Exploration  
**Related:** Understanding.md

---

## 5️⃣ Design Approaches

This document explores 2-3 viable architectural approaches for building the AI Learning & Developer Productivity Platform, analyzing trade-offs to select the optimal design.

---

## Approach 1: Monolithic Next.js with Embedded AI (Recommended)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Frontend (React + Monaco Editor)                      │ │
│  │  - Learning Mode UI                                    │ │
│  │  - Developer Mode UI                                   │ │
│  │  - Live Preview Iframe                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes (Next.js Backend)                          │ │
│  │  - /api/learning/* (repo search, content generation)   │ │
│  │  - /api/developer/* (template extraction, integration) │ │
│  │  - /api/sandbox/* (execution management)               │ │
│  │  - /api/auth/* (Cognito integration)                   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AI Agent Orchestrator (Server-side)                   │ │
│  │  - Curator Agent                                       │ │
│  │  - Teacher Agent                                       │ │
│  │  - Code Agent                                          │ │
│  │  - Mentor Agent                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ AWS Bedrock  │   │  DynamoDB    │   │  S3 Bucket   │
│ (AI Models)  │   │  (Metadata)  │   │  (Projects)  │
└──────────────┘   └──────────────┘   └──────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  Sandbox Execution Layer         │
│  - Lambda (quick previews)       │
│  - Fargate (full sessions)       │
└──────────────────────────────────┘
```

### Component Breakdown

#### Frontend Layer
- **Technology:** Next.js 14 App Router, React Server Components
- **UI:** Tailwind CSS + shadcn/ui components
- **Editor:** Monaco Editor with syntax highlighting
- **State:** React Context + TanStack Query for server state

#### Backend Layer
- **API Routes:** Next.js API routes (serverless on Vercel)
- **Authentication:** AWS Cognito (GitHub, Google, Email)
- **Session Management:** JWT tokens, secure cookies

#### AI Agent System
- **Orchestrator:** Central coordinator for agent tasks
- **Agents:** Specialized modules for different responsibilities
  - **Curator Agent:** GitHub API integration, repo evaluation
  - **Teacher Agent:** Learning content generation from code
  - **Code Agent:** Template extraction, AST analysis, integration
  - **Mentor Agent:** Q&A, explanations, guidance
- **Communication:** Direct function calls (same process)

#### Data Layer
- **DynamoDB Tables:**
  - `users` - User profiles, auth data
  - `projects` - Project metadata, progress
  - `templates` - Template library, ratings
  - `learning_paths` - Generated curricula
- **S3 Buckets:**
  - `user-projects` - Full project code
  - `templates` - Extracted template code
  - `assets` - Images, static files

#### Execution Layer
- **Lambda Functions:** Quick code execution (<15 min)
- **Fargate Containers:** Full development sessions
- **Orchestration:** Step Functions for complex workflows

### Data Flow Examples

#### Learning Mode Flow
```
1. User selects "React" → Frontend
2. API call to /api/learning/search → Next.js API Route
3. Curator Agent queries GitHub API → Filters repos
4. Teacher Agent analyzes top 3 repos → Generates tasks
5. Store learning path → DynamoDB
6. Return curriculum → Frontend displays
7. User starts task → Code in Monaco Editor
8. Run code → Lambda/Fargate execution
9. Preview result → Iframe display
10. Save progress → S3 + DynamoDB
```

#### Developer Mode Flow
```
1. User browses templates → Frontend
2. User selects "Monaco Editor Component" → Click
3. API call to /api/developer/integrate → Next.js API Route
4. Code Agent reads user's current project → S3
5. Code Agent analyzes template → AST parsing
6. Code Agent performs integration → Context-aware merge
7. Preview changes → Fargate sandbox
8. Return preview URL → Frontend iframe
9. User approves → Save to S3
10. Update project metadata → DynamoDB
```

### Pros
✅ **Simplicity:** Single codebase, unified deployment  
✅ **Fast Development:** Shared code, no API contracts  
✅ **Cost-Effective:** Vercel free tier + AWS credits  
✅ **Easy Debugging:** All code in one place  
✅ **Type Safety:** End-to-end TypeScript  
✅ **Fast Iteration:** Hot reload, quick deploys  

### Cons
❌ **Scaling Limits:** Vercel serverless timeout (10s hobby, 60s pro)  
❌ **Agent Coupling:** Agents tightly coupled to Next.js  
❌ **Resource Constraints:** Memory limits on serverless  
❌ **Long Operations:** AI generation may timeout  
❌ **Vendor Lock-in:** Tied to Vercel + AWS  

### Mitigations
- Use async jobs for long AI operations (queue pattern)
- Implement streaming responses for real-time feedback
- Cache AI results aggressively (DynamoDB)
- Upgrade to Vercel Pro if needed ($20/mo)

### Complexity: ⭐⭐ (Low-Medium)
### Extensibility: ⭐⭐⭐ (Medium)
### Risk: ⭐⭐ (Low-Medium)
### Maintenance: ⭐⭐⭐⭐ (Easy)

---

## Approach 2: Microservices with Dedicated AI Service

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Frontend (Vercel)                   │
│  - React UI                                                  │
│  - Monaco Editor                                             │
│  - API Client (REST/GraphQL)                                 │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Auth Service │   │ Learning API │   │Developer API │
│  (Cognito)   │   │  (Lambda)    │   │  (Lambda)    │
└──────────────┘   └──────────────┘   └──────────────┘
                            │
                            ▼
                ┌──────────────────────┐
                │   AI Agent Service   │
                │   (ECS Fargate)      │
                │   - Long-running     │
                │   - Stateful agents  │
                │   - WebSocket support│
                └──────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ AWS Bedrock  │   │  DynamoDB    │   │  S3 Bucket   │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Component Breakdown

#### Frontend Service
- **Deployment:** Vercel
- **Responsibility:** UI only, thin client
- **Communication:** REST API calls to backend services

#### Auth Service
- **Technology:** AWS Cognito + API Gateway
- **Responsibility:** Authentication, authorization
- **Endpoints:** /login, /register, /refresh

#### Learning API Service
- **Technology:** AWS Lambda + API Gateway
- **Responsibility:** Learning mode operations
- **Endpoints:** /search, /generate-path, /save-progress

#### Developer API Service
- **Technology:** AWS Lambda + API Gateway
- **Responsibility:** Developer mode operations
- **Endpoints:** /templates, /extract, /integrate

#### AI Agent Service
- **Technology:** ECS Fargate (long-running containers)
- **Responsibility:** All AI operations
- **Communication:** REST API + WebSocket for streaming
- **Agents:** Curator, Teacher, Code, Mentor (same as Approach 1)
- **Benefits:** No timeout limits, stateful conversations

#### Sandbox Service
- **Technology:** Lambda + Fargate (same as Approach 1)
- **Responsibility:** Code execution

### Pros
✅ **Scalability:** Independent scaling per service  
✅ **No Timeouts:** AI service can run indefinitely  
✅ **Flexibility:** Replace services independently  
✅ **Team Autonomy:** Different teams own services  
✅ **Technology Freedom:** Mix languages/frameworks  
✅ **Resilience:** Service failures isolated  

### Cons
❌ **Complexity:** Multiple deployments, API contracts  
❌ **Latency:** Network hops between services  
❌ **Cost:** More infrastructure (API Gateway, ALB, etc.)  
❌ **Debugging:** Distributed tracing required  
❌ **Development Speed:** Slower iteration  
❌ **Overkill for MVP:** Too much for 100 users  

### Complexity: ⭐⭐⭐⭐ (High)
### Extensibility: ⭐⭐⭐⭐⭐ (Excellent)
### Risk: ⭐⭐⭐⭐ (Medium-High)
### Maintenance: ⭐⭐ (Complex)

---

## Approach 3: Hybrid - Monolith with Async AI Workers

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│  - Frontend (React + Monaco)                                 │
│  - API Routes (sync operations)                              │
│  - Auth, CRUD, simple queries                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌──────────────────────┐
                │   SQS Queue          │
                │   - AI job requests  │
                └──────────────────────┘
                            │
                            ▼
                ┌──────────────────────┐
                │  AI Worker Service   │
                │  (ECS Fargate)       │
                │  - Polls SQS         │
                │  - Runs AI agents    │
                │  - No timeout limits │
                └──────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ AWS Bedrock  │   │  DynamoDB    │   │  S3 Bucket   │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Component Breakdown

#### Next.js Application
- Same as Approach 1 for most features
- **Difference:** Long AI operations queued, not executed inline

#### SQS Queue
- **Purpose:** Decouple AI operations from API requests
- **Messages:** Job requests (repo analysis, template extraction, etc.)
- **Benefits:** Async processing, retry logic, dead-letter queue

#### AI Worker Service
- **Technology:** ECS Fargate (always-on or auto-scaled)
- **Responsibility:** Process AI jobs from queue
- **Polling:** Long-polling SQS for new jobs
- **Execution:** Run AI agents without timeout constraints
- **Results:** Write to DynamoDB, notify via WebSocket/SSE

#### Real-time Updates
- **Technology:** WebSocket (API Gateway WebSocket) or SSE
- **Purpose:** Notify frontend when AI job completes
- **Alternative:** Polling (simpler but less efficient)

### Data Flow Example

#### Async Learning Path Generation
```
1. User selects "React" → Frontend
2. API call to /api/learning/search → Next.js API Route
3. Create job message → SQS Queue
4. Return job ID → Frontend (shows "Generating...")
5. AI Worker polls SQS → Receives job
6. Curator + Teacher agents work → 30-60 seconds
7. Save results → DynamoDB
8. Send WebSocket message → Frontend
9. Frontend updates → Display curriculum
```

### Pros
✅ **Best of Both:** Monolith simplicity + async power  
✅ **No Timeouts:** Long AI operations handled  
✅ **Scalable:** Workers scale independently  
✅ **Cost-Effective:** Workers only run when needed  
✅ **Simple for MVP:** Start with 1 worker, scale later  
✅ **Familiar:** Queue pattern well-understood  

### Cons
❌ **Added Complexity:** Queue + workers to manage  
❌ **Async UX:** Users wait for results (need good UX)  
❌ **Debugging:** Harder than pure monolith  
❌ **Infrastructure:** More AWS services (SQS, WebSocket)  
❌ **State Management:** Job status tracking needed  

### Complexity: ⭐⭐⭐ (Medium)
### Extensibility: ⭐⭐⭐⭐ (Good)
### Risk: ⭐⭐⭐ (Medium)
### Maintenance: ⭐⭐⭐ (Moderate)

---

## Decision Matrix

| Criteria | Approach 1: Monolith | Approach 2: Microservices | Approach 3: Hybrid |
|----------|---------------------|---------------------------|-------------------|
| **Development Speed** | ⭐⭐⭐⭐⭐ Fast | ⭐⭐ Slow | ⭐⭐⭐⭐ Good |
| **MVP Suitability** | ⭐⭐⭐⭐⭐ Perfect | ⭐⭐ Overkill | ⭐⭐⭐⭐ Great |
| **Scalability** | ⭐⭐⭐ Limited | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good |
| **Cost (MVP)** | ⭐⭐⭐⭐⭐ Lowest | ⭐⭐ Highest | ⭐⭐⭐⭐ Low |
| **Complexity** | ⭐⭐⭐⭐⭐ Simple | ⭐⭐ Complex | ⭐⭐⭐ Moderate |
| **AI Timeout Risk** | ⭐⭐ High | ⭐⭐⭐⭐⭐ None | ⭐⭐⭐⭐⭐ None |
| **Debugging** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐ Hard | ⭐⭐⭐ Moderate |
| **Team Size Fit** | ⭐⭐⭐⭐⭐ 1-3 devs | ⭐⭐ 5+ devs | ⭐⭐⭐⭐ 2-4 devs |
| **Future-Proof** | ⭐⭐⭐ Refactor needed | ⭐⭐⭐⭐⭐ Ready | ⭐⭐⭐⭐ Evolvable |

---

## Recommended Approach: Hybrid (Approach 3)

### Rationale

**Why Hybrid wins:**

1. **Solves the timeout problem** - AI operations can run as long as needed
2. **Maintains simplicity** - Most code stays in Next.js monolith
3. **Cost-effective** - Workers only run when processing jobs
4. **Scalable** - Can add more workers as usage grows
5. **Good UX** - Async operations with real-time updates feel modern
6. **Future-proof** - Easy to extract more services later if needed

**Why not Monolith (Approach 1):**
- AI operations (repo analysis, content generation) can take 30-60+ seconds
- Vercel serverless timeout (10s hobby, 60s pro) is a real risk
- Streaming helps but doesn't solve the fundamental timeout issue

**Why not Microservices (Approach 2):**
- Massive overkill for MVP with 10-100 users
- Development velocity would be 2-3x slower
- Higher costs ($200-500/mo vs $50-100/mo)
- Team of 1-3 developers can't maintain effectively

### Implementation Strategy

**Phase 1: MVP (Weeks 1-8)**
- Build Next.js application (Approach 1 style)
- Implement simple operations inline (auth, CRUD, quick queries)
- Add SQS queue for AI operations
- Deploy single AI worker on Fargate
- Use polling for job status (simpler than WebSocket)

**Phase 2: Optimization (Weeks 9-12)**
- Add WebSocket for real-time updates
- Implement worker auto-scaling
- Add caching layer (Redis/ElastiCache)
- Optimize AI prompts for speed

**Phase 3: Scale (Post-MVP)**
- Extract more services if needed (template marketplace, team features)
- Add more worker types (specialized agents)
- Implement advanced features (collaboration, analytics)

---

## Architecture Decision Record

### ADR-0001: Use Hybrid Architecture with Async AI Workers

**Status:** ✅ ACCEPTED

**Context:**
We need to build an AI-powered learning platform with two modes (Learning + Developer). AI operations (repo analysis, content generation, template extraction) can take 30-60+ seconds, which exceeds serverless timeout limits. We have a small team (1-3 developers) and need to move fast for MVP.

**Decision:**
Adopt Hybrid Architecture (Approach 3):
- Next.js monolith for frontend + API routes
- SQS queue for long-running AI operations
- ECS Fargate workers for AI agent processing
- DynamoDB + S3 for data storage
- Polling (MVP) → WebSocket (post-MVP) for real-time updates

**Consequences:**

**Positive:**
- No timeout constraints for AI operations
- Fast development velocity (monolith benefits)
- Cost-effective for MVP scale
- Scalable worker pool
- Simple debugging for most features

**Negative:**
- Async UX requires good loading states
- Queue + workers add operational complexity
- Job status tracking needed
- More AWS services to manage

**Risks:**
- SQS costs if high message volume (mitigate: batch operations)
- Worker idle costs (mitigate: auto-scaling to zero)
- WebSocket complexity (mitigate: start with polling)

---

## Next Steps

1. ✅ Understanding Lock confirmed
2. ✅ Design exploration complete
3. ✅ Hybrid Architecture APPROVED
4. ⏭️ Create detailed PRD with Hybrid Architecture
5. ⏭️ Technical specification document
6. ⏭️ Implementation planning and milestones

---

**Status:** ✅ APPROVED  
**Decision:** Hybrid Architecture (Approach 3) - CONFIRMED  
**Last Updated:** February 25, 2026
