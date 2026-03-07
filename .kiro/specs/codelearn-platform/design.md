# CodeLearn Platform - Design Document

## Document Information

**Feature Name:** codelearn-platform  
**Version:** 1.0  
**Date:** 2024  
**Status:** Draft  
**Related Documents:** requirements.md, AWS_project/tech_stack.md, AWS_project/design.md

---

## Overview

The CodeLearn AI Learning & Developer Productivity Platform is a comprehensive web application that combines AI-powered learning with intelligent code template extraction and integration. The platform operates in two modes:

1. **Learning Mode (FREE):** Enables developers to learn new technologies by reconstructing real GitHub projects step-by-step with AI guidance, live code execution, and one-click deployment.

2. **Developer Mode (FREEMIUM):** Accelerates development by extracting reusable code templates from any GitHub repository and performing context-aware integration into existing projects.

The platform leverages AWS Bedrock (Claude 3.5 Sonnet and Llama 3.1) for AI capabilities, Next.js 14 for the frontend, and a hybrid architecture combining a monolithic Next.js application with asynchronous AI workers running on ECS Fargate.

### Key Design Principles

1. **Learning-First:** Prioritize educational value and clear guidance over feature complexity
2. **Instant Feedback:** Provide live previews and real-time updates with minimal latency
3. **Real-World Focus:** Use actual GitHub projects and production-quality code patterns
4. **AI-Augmented:** AI suggests and assists, but users maintain control
5. **Progressive Disclosure:** Start simple, reveal complexity gradually based on user needs

---

## Architecture

### System Architecture

The platform uses a **Hybrid Architecture** combining a Next.js monolith with asynchronous AI workers:

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Application (Vercel)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Frontend (React 18 + Monaco Editor)                   │ │
│  │  - Learning Mode UI                                    │ │
│  │  - Developer Mode UI                                   │ │
│  │  - Dashboard & Portfolio                               │ │
│  │  - Live Preview Iframe                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes (Next.js Backend)                          │ │
│  │  - /api/auth/* (Cognito integration)                   │ │
│  │  - /api/learning/* (sync operations)                   │ │
│  │  - /api/developer/* (sync operations)                  │ │
│  │  - /api/jobs/* (async job management)                  │ │
│  │  - /api/sandbox/* (code execution)                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌──────────────────────┐
                │   Amazon SQS         │
                │   - ai-jobs-queue    │
                │   - ai-jobs-dlq      │
                └──────────────────────┘
                            │
                            ▼
                ┌──────────────────────┐
                │  AI Worker Service   │
                │  (ECS Fargate)       │
                │  - Curator Agent     │
                │  - Teacher Agent     │
                │  - Code Agent        │
                │  - Mentor Agent      │
                └──────────────────────┘

                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
    ┌──────────────────┐   ┌──────────────────┐
    │  AWS Bedrock     │   │  GitHub API v3   │
    │  - Claude 3.5    │   │  - Repo Search   │
    │  - Llama 3.1     │   │  - File Content  │
    └──────────────────┘   └──────────────────┘
                │
    ┌───────────┴───────────┬───────────────┐
    │                       │               │
    ▼                       ▼               ▼
┌──────────┐   ┌──────────────┐   ┌──────────────┐
│ DynamoDB │   │  Amazon S3   │   │  CloudWatch  │
│ Tables   │   │  Buckets     │   │  Logs        │
└──────────┘   └──────────────┘   └──────────────┘
                            │
                            ▼
                ┌──────────────────────┐
                │  Sandbox Execution   │
                │  - Lambda (quick)    │
                │  - Fargate (full)    │
                └──────────────────────┘
```

### Architecture Rationale

**Why Hybrid Architecture?**
- **Monolith Benefits:** Rapid development, simple deployment, shared code, easy debugging
- **Async Workers:** Solves API Gateway 30-second timeout for long-running AI operations
- **Cost Efficiency:** Workers scale to zero when idle, pay only for actual AI processing
- **Scalability:** Workers auto-scale based on SQS queue depth (0-10 instances)

**Alternative Considered:** Pure microservices architecture was rejected due to increased complexity, operational overhead, and slower MVP development.

### Technology Stack

**Frontend:**
- **Framework:** Next.js 14.2+ (App Router, React Server Components)
- **UI Library:** Tailwind CSS 3.4+ with shadcn/ui components
- **Code Editor:** Monaco Editor 4.6+ (VS Code engine)
- **State Management:** React Context API + TanStack Query 5.0
- **Forms:** React Hook Form + Zod validation
- **Deployment:** Vercel (auto-deploy on git push)

**Backend:**
- **Runtime:** Node.js 20 LTS
- **API:** Next.js API Routes (serverless functions)
- **Queue:** Amazon SQS (Standard Queue)
- **Workers:** ECS Fargate (Node.js 20 containers)
- **Authentication:** AWS Cognito User Pools
- **Payments:** Stripe API (Phase 2)

**Data Layer:**
- **Database:** Amazon DynamoDB (on-demand billing)
- **Storage:** Amazon S3 (Standard tier)
- **Cache:** DynamoDB TTL (24-hour expiration for AI responses)
- **CDN:** CloudFront (for S3 assets)

**AI/ML:**
- **Provider:** AWS Bedrock
- **Models:** 
  - Claude 3.5 Sonnet (complex reasoning, code generation)
  - Llama 3.1 70B (simple tasks, cost optimization)
- **Framework:** LangChain.js 0.1 (agent orchestration)

**Infrastructure:**
- **Hosting:** Vercel (frontend) + AWS (backend services)
- **Sandboxes:** AWS Lambda (quick previews) + ECS Fargate (full sessions)
- **Monitoring:** CloudWatch + Sentry
- **CI/CD:** GitHub Actions
- **IaC:** AWS CDK (TypeScript)

---

## Components and Interfaces

### Frontend Components

#### 1. Authentication Components

**LoginPage Component**
- **Purpose:** User authentication entry point
- **Props:** None (route-based)
- **State:** email, password, loading, error
- **Features:**
  - GitHub OAuth button
  - Google OAuth button
  - Email/password form
  - Password reset link
  - Signup redirect link
- **API Calls:** POST /api/auth/login, POST /api/auth/oauth/{provider}

**SignupPage Component**
- **Purpose:** New user registration
- **Props:** None (route-based)
- **State:** email, password, confirmPassword, loading, error
- **Features:**
  - OAuth provider buttons
  - Email/password form with validation
  - Terms of Service checkbox
  - Login redirect link
- **API Calls:** POST /api/auth/signup

#### 2. Dashboard Components

**Dashboard Component**
- **Purpose:** Main user interface showing overview and activity
- **Props:** userId (from auth context)
- **State:** projects, stats, loading
- **Features:**
  - Statistics cards (completed projects, hours, integrations)
  - Continue Learning section
  - Recent projects grid
  - AI Mentor chat widget
  - Upgrade CTA (for free users)
- **API Calls:** GET /api/learning/progress/{userId}, GET /api/developer/usage/{userId}

**StatsCard Component**
- **Purpose:** Display individual statistic with icon
- **Props:** title, value, icon, trend, color
- **State:** None (presentational)
- **Features:**
  - Animated number counter
  - Trend indicator (up/down arrow)
  - Hover effects


#### 3. Learning Mode Components

**TechnologySelector Component**
- **Purpose:** Display available technologies for learning
- **Props:** onSelect (callback)
- **State:** technologies, selectedTech, loading
- **Features:**
  - Grid of technology cards (React, Vue, Next.js, Node.js)
  - Technology logos and descriptions
  - Difficulty indicators
  - Project count badges
- **API Calls:** GET /api/learning/technologies

**ProjectCard Component**
- **Purpose:** Display individual project in learning path
- **Props:** project (object), difficulty, onSelect
- **State:** None (presentational)
- **Features:**
  - Project name and description
  - Estimated time
  - Tech stack badges
  - GitHub link
  - Preview image
  - "Start Project" button

**ProjectWorkspace Component**
- **Purpose:** Main learning interface with editor and preview
- **Props:** projectId, userId
- **State:** code, currentTask, tasks, previewUrl, executing
- **Features:**
  - Task list sidebar
  - Monaco code editor (60% width)
  - Live preview iframe (40% width)
  - Console output panel
  - AI Mentor chat panel
  - Toolbar (Run, Save, Deploy, Get Hint)
- **API Calls:** 
  - GET /api/learning/project/{projectId}/tasks
  - POST /api/learning/project/{projectId}/save
  - POST /api/sandbox/execute
  - POST /api/sandbox/deploy

**TaskList Component**
- **Purpose:** Display and manage project tasks
- **Props:** tasks, currentTaskId, onTaskSelect
- **State:** expandedTasks
- **Features:**
  - Collapsible task items
  - Progress indicators
  - Checkboxes for completion
  - Difficulty badges
  - Estimated time
- **API Calls:** None (uses parent state)

**MonacoEditor Component**
- **Purpose:** Code editing interface
- **Props:** code, language, onChange, onSave
- **State:** editorInstance, decorations
- **Features:**
  - Syntax highlighting
  - IntelliSense
  - Error detection
  - Auto-save (30s interval)
  - Line numbers
  - Minimap
- **API Calls:** None (parent handles save)

**LivePreview Component**
- **Purpose:** Display executed code output
- **Props:** previewUrl, loading, error
- **State:** iframeLoaded
- **Features:**
  - Iframe sandbox
  - Loading spinner
  - Error display
  - Refresh button
  - Open in new tab button
  - Responsive viewport selector
- **API Calls:** None (receives URL from parent)


#### 4. Developer Mode Components

**TemplateLibrary Component**
- **Purpose:** Browse and search available templates
- **Props:** None (route-based)
- **State:** templates, filters, searchQuery, loading
- **Features:**
  - Grid of template cards
  - Search bar
  - Technology filters
  - Category filters
  - Sort options (rating, downloads, recent)
  - Pagination
- **API Calls:** GET /api/developer/templates

**TemplateCard Component**
- **Purpose:** Display individual template
- **Props:** template (object), onIntegrate
- **State:** None (presentational)
- **Features:**
  - Template name and description
  - Tech stack badges
  - Rating stars
  - Download count
  - Source repo link
  - "Preview" and "Integrate" buttons

**TemplateExtractor Component**
- **Purpose:** Extract templates from GitHub repos
- **Props:** None (route-based)
- **State:** repoUrl, analyzing, components, selectedComponent
- **Features:**
  - GitHub URL input
  - Validation and analysis trigger
  - Component suggestion list
  - Component preview
  - "Extract" button
- **API Calls:** POST /api/developer/extract

**IntegrationWorkspace Component**
- **Purpose:** Preview and approve template integration
- **Props:** integrationId, jobId
- **State:** diff, previewUrl, loading, error
- **Features:**
  - Split diff view (before/after)
  - Syntax highlighting
  - Addition/deletion highlighting
  - Live preview
  - "Approve" and "Undo" buttons
  - AI explanation panel
- **API Calls:**
  - GET /api/developer/integration/{jobId}/preview
  - POST /api/developer/integration/{jobId}/approve
  - POST /api/developer/integration/{jobId}/undo

**UsageMeter Component**
- **Purpose:** Display integration usage for free users
- **Props:** userId
- **State:** usage, limit, resetDate
- **Features:**
  - Progress bar (X/5 integrations)
  - Warning at 4/5
  - Upgrade CTA at 5/5
  - Reset date display
- **API Calls:** GET /api/developer/usage/{userId}

#### 5. Shared Components

**AIMentorChat Component**
- **Purpose:** Interactive AI assistance
- **Props:** context (current task/code)
- **State:** messages, input, loading
- **Features:**
  - Chat message list
  - User/AI message bubbles
  - Input field with send button
  - Quick action buttons (Explain, Find Bugs, Optimize)
  - Typing indicator
  - Streaming responses
- **API Calls:** POST /api/ai/mentor/chat

**JobStatusPoller Component**
- **Purpose:** Poll async job status and display progress
- **Props:** jobId, onComplete, onError
- **State:** status, progress, result, error
- **Features:**
  - Progress bar
  - Status messages
  - Cancel button
  - Auto-polling (2s interval)
  - WebSocket fallback
- **API Calls:** GET /api/jobs/{jobId}

**Navbar Component**
- **Purpose:** Global navigation
- **Props:** user (from auth context)
- **State:** None
- **Features:**
  - Logo and brand
  - Navigation links (Learning, Developer, Projects)
  - Search bar (Cmd+K)
  - Notifications bell
  - User avatar dropdown
  - Upgrade button (free users)


### Backend Components

#### 1. API Route Handlers

**Authentication Routes (/api/auth/*)**

```typescript
// POST /api/auth/signup
interface SignupRequest {
  email: string;
  password: string;
  provider?: 'email' | 'github' | 'google';
}

interface SignupResponse {
  success: boolean;
  data?: {
    userId: string;
    token: string;
    refreshToken: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    userId: string;
    token: string;
    refreshToken: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// POST /api/auth/oauth/{provider}
interface OAuthRequest {
  code: string;
  state?: string;
}

interface OAuthResponse {
  success: boolean;
  data?: {
    userId: string;
    token: string;
    refreshToken: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

**Learning Mode Routes (/api/learning/*)**

```typescript
// GET /api/learning/technologies
interface TechnologiesResponse {
  success: boolean;
  data?: {
    technologies: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      projectCount: number;
    }>;
  };
}

// POST /api/learning/curate
interface CurateRequest {
  technology: string;
  userId: string;
}

interface CurateResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: 'queued';
  };
}

// GET /api/learning/projects/{technology}
interface ProjectsResponse {
  success: boolean;
  data?: {
    projects: Array<{
      id: string;
      name: string;
      description: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      githubUrl: string;
      estimatedHours: number;
      techStack: string[];
    }>;
  };
}

// GET /api/learning/project/{projectId}/tasks
interface TasksResponse {
  success: boolean;
  data?: {
    tasks: Array<{
      id: string;
      title: string;
      description: string;
      order: number;
      estimatedMinutes: number;
      hints: string[];
      completed: boolean;
    }>;
  };
}

// POST /api/learning/project/{projectId}/save
interface SaveRequest {
  taskId: string;
  code: string;
  completed: boolean;
}

interface SaveResponse {
  success: boolean;
  data?: {
    autoSaved: boolean;
    timestamp: string;
  };
}
```


**Developer Mode Routes (/api/developer/*)**

```typescript
// GET /api/developer/templates
interface TemplatesRequest {
  technology?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface TemplatesResponse {
  success: boolean;
  data?: {
    templates: Array<{
      id: string;
      name: string;
      description: string;
      technology: string;
      category: string;
      rating: number;
      downloads: number;
      sourceRepo: string;
    }>;
    pagination: {
      page: number;
      total: number;
      hasMore: boolean;
    };
  };
}

// POST /api/developer/extract
interface ExtractRequest {
  githubUrl: string;
  componentPath?: string;
}

interface ExtractResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: 'queued';
  };
}

// POST /api/developer/integrate
interface IntegrateRequest {
  templateId: string;
  projectId: string;
}

interface IntegrateResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: 'queued';
  };
}

// GET /api/developer/integration/{jobId}/preview
interface IntegrationPreviewResponse {
  success: boolean;
  data?: {
    diff: {
      additions: number;
      deletions: number;
      files: Array<{
        path: string;
        changes: string;
      }>;
    };
    previewUrl: string;
    explanation: string;
  };
}

// POST /api/developer/integration/{jobId}/approve
interface ApproveResponse {
  success: boolean;
  data?: {
    projectUpdated: boolean;
    timestamp: string;
  };
}

// GET /api/developer/usage/{userId}
interface UsageResponse {
  success: boolean;
  data?: {
    integrationsThisMonth: number;
    limit: number;
    resetDate: string;
    tier: 'free' | 'pro' | 'team';
  };
}
```

**Sandbox Routes (/api/sandbox/*)**

```typescript
// POST /api/sandbox/execute
interface ExecuteRequest {
  code: string;
  language: 'javascript' | 'typescript' | 'python' | 'go';
  timeout?: number;
  environment?: 'lambda' | 'fargate';
}

interface ExecuteResponse {
  success: boolean;
  data?: {
    output: string;
    errors: string[];
    executionTime: number;
    previewUrl?: string;
  };
}

// POST /api/sandbox/deploy
interface DeployRequest {
  projectId: string;
  platform: 'vercel' | 'netlify';
}

interface DeployResponse {
  success: boolean;
  data?: {
    deploymentId: string;
    url: string;
    status: 'building' | 'ready' | 'error';
  };
}
```

**Job Management Routes (/api/jobs/*)**

```typescript
// GET /api/jobs/{jobId}
interface JobStatusResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number; // 0-100
    result?: any;
    error?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// POST /api/jobs/{jobId}/cancel
interface CancelJobResponse {
  success: boolean;
  data?: {
    cancelled: boolean;
  };
}
```


#### 2. AI Agent System

**Agent Architecture**

The platform uses four specialized AI agents orchestrated through LangChain.js:

**Curator Agent**
- **Purpose:** Discover and evaluate GitHub repositories for learning paths
- **Model:** Llama 3.1 70B (cost-optimized for simple filtering)
- **Inputs:** Technology name, difficulty level
- **Outputs:** List of 3 curated repositories with metadata
- **Process:**
  1. Search GitHub API for repositories matching technology
  2. Filter by stars (>50), recent activity (<6 months), documentation quality
  3. Rank by educational value (README quality, code structure, test coverage)
  4. Return top 3 repositories per difficulty level
- **Caching:** 24-hour TTL in DynamoDB

**Teacher Agent**
- **Purpose:** Generate learning content and task breakdowns from code
- **Model:** Claude 3.5 Sonnet (complex reasoning required)
- **Inputs:** GitHub repository URL, project structure
- **Outputs:** 10-15 sequential tasks with descriptions, hints, and estimated time
- **Process:**
  1. Analyze repository structure and dependencies
  2. Identify key features and components
  3. Generate logical learning sequence (simple → complex)
  4. Create task descriptions with clear objectives
  5. Generate hints without revealing solutions
- **Caching:** 24-hour TTL per repository

**Code Agent**
- **Purpose:** Extract templates and perform context-aware integration
- **Model:** Claude 3.5 Sonnet (AST analysis and code generation)
- **Inputs:** Source code, target project, integration context
- **Outputs:** Extracted template or integrated code with diff
- **Process:**
  1. Parse source code into AST (Abstract Syntax Tree)
  2. Identify self-contained components and dependencies
  3. Analyze target project structure and patterns
  4. Generate integration code with proper imports and adaptations
  5. Create diff showing changes
- **Caching:** 24-hour TTL per template

**Mentor Agent**
- **Purpose:** Provide explanations, hints, and answer questions
- **Model:** Claude 3.5 Sonnet (conversational and educational)
- **Inputs:** User question, code context, task context
- **Outputs:** Helpful explanation or hint
- **Process:**
  1. Understand user question and context
  2. Generate appropriate response (hint vs full explanation)
  3. Maintain conversation history for follow-ups
  4. Stream response for perceived speed
- **Caching:** No caching (personalized responses)



#### 3. Sandbox Execution System

**Lambda Execution (Quick Previews)**
- **Use Case:** Simple JavaScript execution, quick tests (<15 seconds)
- **Configuration:**
  - Runtime: Node.js 20
  - Memory: 512 MB
  - Timeout: 15 seconds
  - Concurrency: 100 concurrent executions
- **Security:**
  - No network access
  - Read-only file system
  - Resource limits enforced
- **Cost:** ~$0.20 per 1M requests

**Fargate Execution (Full Sessions)**
- **Use Case:** Complex builds, long-running operations (<30 minutes)
- **Configuration:**
  - CPU: 1 vCPU
  - Memory: 2 GB
  - Timeout: 30 minutes
  - Auto-scaling: 0-10 tasks
- **Security:**
  - Isolated containers per user
  - Network access to whitelisted APIs only
  - Temporary file system
  - Automatic cleanup after execution
- **Cost:** ~$0.04 per hour per task

**Execution Flow:**
```
User clicks "Run" → API Route → Determine execution type
                                      ↓
                    Simple code? → Lambda (15s)
                    Complex code? → Fargate (30min)
                                      ↓
                              Execute in sandbox
                                      ↓
                              Capture output/errors
                                      ↓
                              Return results to frontend
```

---

## Data Models

### DynamoDB Tables

**users Table**
```typescript
interface User {
  PK: string;              // "USER#{userId}"
  SK: string;              // "PROFILE"
  email: string;
  name: string;
  avatarUrl: string;
  provider: 'github' | 'google' | 'email';
  tier: 'free' | 'pro' | 'team';
  createdAt: number;       // Unix timestamp
  lastLoginAt: number;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}
```

**Example Record:**
```json
{
  "PK": "USER#user-123",
  "SK": "PROFILE",
  "email": "alex@example.com",
  "name": "Alex Developer",
  "avatarUrl": "https://...",
  "provider": "github",
  "tier": "free",
  "createdAt": 1709251200,
  "lastLoginAt": 1709337600,
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```



**projects Table**
```typescript
interface Project {
  PK: string;              // "PROJECT#{projectId}"
  SK: string;              // "USER#{userId}"
  name: string;
  technology: string;
  type: 'learning' | 'custom';
  status: 'active' | 'completed';
  progress: number;        // 0-100
  codeS3Key: string;       // S3 reference
  githubSourceUrl?: string;
  deploymentUrl?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}
```

**GSI: userId-status-index**
- Partition Key: SK (userId)
- Sort Key: status
- Purpose: Query all projects for a user by status

**Example Record:**
```json
{
  "PK": "PROJECT#proj-456",
  "SK": "USER#user-123",
  "name": "E-commerce Dashboard",
  "technology": "react",
  "type": "learning",
  "status": "active",
  "progress": 65,
  "codeS3Key": "user-123/proj-456/code.zip",
  "githubSourceUrl": "https://github.com/example/dashboard",
  "deploymentUrl": null,
  "createdAt": 1709251200,
  "updatedAt": 1709337600
}
```

**learning_paths Table**
```typescript
interface LearningPath {
  PK: string;              // "TECH#{technology}"
  SK: string;              // "DIFF#{difficulty}"
  projectId: string;
  name: string;
  description: string;
  githubUrl: string;
  estimatedHours: number;
  tasks: Task[];
  generatedAt: number;
  expiresAt: number;       // TTL for cache invalidation
}

interface Task {
  taskId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  hints: string[];
}
```

**Example Record:**
```json
{
  "PK": "TECH#react",
  "SK": "DIFF#intermediate",
  "projectId": "lp-789",
  "name": "Full-Stack E-commerce Dashboard",
  "description": "Build a modern dashboard with charts, data tables, and authentication",
  "githubUrl": "https://github.com/example/dashboard",
  "estimatedHours": 12,
  "tasks": [
    {
      "taskId": "task-1",
      "title": "Set up project structure",
      "description": "Initialize Next.js project with TypeScript and Tailwind CSS",
      "order": 1,
      "estimatedMinutes": 30,
      "hints": ["Use create-next-app with TypeScript template"]
    }
  ],
  "generatedAt": 1709251200,
  "expiresAt": 1709337600
}
```



**templates Table**
```typescript
interface Template {
  PK: string;              // "TEMPLATE#{templateId}"
  SK: string;              // "METADATA"
  name: string;
  description: string;
  technology: string;
  category: string;
  codeS3Key: string;       // S3 reference
  sourceRepo: string;
  rating: number;          // 0-5
  downloads: number;
  createdBy: string;       // userId
  createdAt: number;
  updatedAt: number;
}
```

**GSI: technology-rating-index**
- Partition Key: technology
- Sort Key: rating
- Purpose: Query templates by technology sorted by rating

**jobs Table**
```typescript
interface Job {
  PK: string;              // "JOB#{jobId}"
  SK: string;              // "USER#{userId}"
  type: 'curate' | 'extract' | 'integrate';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;        // 0-100
  input: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;       // TTL 24 hours
}
```

**integrations Table**
```typescript
interface Integration {
  PK: string;              // "INTEGRATION#{integrationId}"
  SK: string;              // "USER#{userId}"
  templateId: string;
  projectId: string;
  month: string;           // "2024-02" for rate limiting
  status: 'preview' | 'approved' | 'undone';
  diff: {
    additions: number;
    deletions: number;
    files: Array<{
      path: string;
      changes: string;
    }>;
  };
  createdAt: number;
}
```

**GSI: userId-month-index**
- Partition Key: SK (userId)
- Sort Key: month
- Purpose: Count integrations per user per month for rate limiting

### S3 Bucket Structure

**user-projects-{env}**
```
user-projects-prod/
├── user-123/
│   ├── proj-456/
│   │   ├── code.zip
│   │   ├── code-v1.zip (versioned)
│   │   └── code-v2.zip
│   └── proj-789/
│       └── code.zip
└── user-456/
    └── proj-101/
        └── code.zip
```

**templates-{env}**
```
templates-prod/
├── template-abc/
│   ├── code.zip
│   └── metadata.json
└── template-def/
    ├── code.zip
    └── metadata.json
```

**assets-{env}**
```
assets-prod/
├── users/
│   ├── user-123/
│   │   └── avatar.jpg
│   └── user-456/
│       └── avatar.jpg
└── projects/
    ├── proj-456/
    │   └── preview.png
    └── proj-789/
        └── preview.png
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following patterns:
- **Authentication & Authorization:** Multiple properties around token management, OAuth flows, and access control
- **Data Persistence:** Round-trip properties for save/restore operations
- **AI Operations:** Performance and caching properties for AI responses
- **Rate Limiting:** Boundary condition properties for usage limits
- **Integration:** Round-trip properties for template integration and undo

**Redundancy Elimination:**
- Combined multiple OAuth properties (GitHub, Google) into a single OAuth flow property
- Merged auto-save and manual save into a general persistence property
- Consolidated deployment platform properties into a single deployment property
- Combined filter and search properties into a general query property

### Property 1: OAuth Authentication Flow

*For any* OAuth provider (GitHub or Google), when a user initiates authentication, the system should redirect to the provider's authorization page, and upon approval, create a user account with valid JWT tokens.

**Validates: Requirements 1.2, 1.3**

### Property 2: Email/Password Validation

*For any* registration attempt with email/password, the system should reject inputs that don't match the format (valid email, 8+ characters, uppercase, lowercase, number) and accept inputs that do match.

**Validates: Requirements 1.4**

### Property 3: Token Refresh Round Trip

*For any* authenticated user, when their access token expires, refreshing with the refresh token should produce a new valid access token without requiring re-login.

**Validates: Requirements 1.5, 1.6**

### Property 4: Token Invalidation

*For any* authenticated user, when they log out, subsequent requests with their tokens should be rejected as unauthorized.

**Validates: Requirements 1.7**



### Property 5: Authorization by Tier

*For any* protected route access attempt, the system should grant access only if the user's JWT is valid and their tier (free, pro, team) has permission for that resource.

**Validates: Requirements 1.8**

### Property 6: AI Operation Triggers

*For any* user action that triggers an AI operation (technology selection, template extraction, integration), the system should create a job in the SQS queue and return a jobId with status "queued".

**Validates: Requirements 2.2, 11.2, 12.2, 15.1, 15.2**

### Property 7: Performance Bounds

*For any* AI operation (project curation, template extraction, integration preview), the system should complete and display results within the specified time limit (10 seconds for curation, 30 seconds for extraction, 10 seconds for integration).

**Validates: Requirements 2.4, 11.3, 12.5**

### Property 8: Learning Path Structure

*For any* generated learning path, the system should return exactly 3 projects (Beginner, Intermediate, Advanced), each containing name, description, estimated time, tech stack, GitHub URL, and preview image.

**Validates: Requirements 3.1, 3.2**

### Property 9: Project Selection Persistence

*For any* project selection, the system should save the selection to the user's profile and successfully navigate to the project workspace.

**Validates: Requirements 3.3**

### Property 10: Repository Filtering

*For any* AI-curated project list, all returned repositories should have >50 stars, activity within the last 6 months, and documentation.

**Validates: Requirements 3.4**

### Property 11: Caching Consistency

*For any* AI-generated content (learning paths, templates), repeated requests within 24 hours should return cached results without re-generating.

**Validates: Requirements 3.5, 18.2**

### Property 12: Task Structure

*For any* project, the system should generate 10-15 tasks, each containing title, description, estimated time, difficulty, and completion status.

**Validates: Requirements 4.1, 4.2**

### Property 13: Progress Calculation

*For any* project with tasks, the completion percentage should equal (completed tasks / total tasks) * 100.

**Validates: Requirements 4.6**

### Property 14: Code Persistence Round Trip

*For any* code edits, saving (auto or manual) and then reloading the editor should restore the exact same code state.

**Validates: Requirements 5.4, 5.6, 5.7, 17.1, 17.2, 17.3**

### Property 15: Code Execution Isolation

*For any* code execution, the system should run it in an isolated sandbox with enforced resource limits (2GB RAM, 1 vCPU, timeout), and automatically cleanup after completion.

**Validates: Requirements 6.1, 16.2, 16.5**

### Property 16: Execution Performance

*For any* successful code execution, the system should display output in the preview pane within 5 seconds.

**Validates: Requirements 6.3**

### Property 17: Timeout Enforcement

*For any* code execution that exceeds the timeout (15 seconds for Lambda, 30 minutes for Fargate), the system should terminate execution and display a timeout error.

**Validates: Requirements 6.7**

### Property 18: AI Response Performance

*For any* AI Mentor chat interaction, the system should respond within 3 seconds.

**Validates: Requirements 7.3**

### Property 19: Conversation Context Maintenance

*For any* series of follow-up questions in AI Mentor chat, the system should maintain conversation context across all messages in the session.

**Validates: Requirements 7.5**

### Property 20: Deployment Round Trip

*For any* project deployment, the system should provide a live URL within 2 minutes, and the deployed project should be accessible and added to the user's portfolio.

**Validates: Requirements 8.4, 8.5**

### Property 21: Portfolio Completeness

*For any* user's portfolio view, the system should display all completed projects with name, description, tech stack, GitHub link, and live demo link.

**Validates: Requirements 9.3, 9.5**

### Property 22: Template Display Completeness

*For any* template in the library, the displayed information should include name, description, tech stack, rating, download count, and source repository.

**Validates: Requirements 10.2**

### Property 23: Search and Filter Consistency

*For any* search query or filter combination, the results should only include templates that match all specified criteria (keyword, technology, category).

**Validates: Requirements 10.3, 10.4**

### Property 24: URL Validation

*For any* GitHub repository URL input, the system should accept valid GitHub URLs (https://github.com/{owner}/{repo}) and reject invalid formats.

**Validates: Requirements 11.1**

### Property 25: Template Extraction Persistence

*For any* successful template extraction, the system should save the template to the user's library and make it available for integration.

**Validates: Requirements 11.6**

### Property 26: Integration Undo Round Trip

*For any* approved template integration, clicking undo should revert all changes and restore the project to its exact previous state.

**Validates: Requirements 12.9**

### Property 27: Rate Limit Enforcement

*For any* user exceeding their rate limit (100 req/hour for free, 1000 req/hour for paid), the system should return HTTP 429 status with retry-after header.

**Validates: Requirements 13.6**

### Property 28: Monthly Integration Reset

*For any* free user, when a new month starts, the integration counter should reset to 0/5.

**Validates: Requirements 13.4**

### Property 29: Subscription Tier Update

*For any* successful payment, the system should immediately update the user's tier in DynamoDB and grant access to paid features.

**Validates: Requirements 14.3**

### Property 30: Job Status Polling

*For any* async job, polling the job status should return the current state (queued, processing, completed, failed) and progress (0-100).

**Validates: Requirements 15.3**

### Property 31: Job Retry Behavior

*For any* failed job, the system should retry up to 3 times with exponential backoff before moving to the dead-letter queue.

**Validates: Requirements 15.6**

### Property 32: Sandbox Network Isolation

*For any* code execution attempt to access network resources, the system should block all outbound connections except whitelisted APIs.

**Validates: Requirements 16.3**

### Property 33: Soft Delete Retention

*For any* project deletion, the system should mark the project as deleted (soft delete) and retain it for 30 days before permanent deletion.

**Validates: Requirements 17.6**

### Property 34: GitHub API Fallback

*For any* GitHub API request when the API is unavailable, the system should fall back to cached data and display a warning message.

**Validates: Requirements 18.5**

### Property 35: Request Logging

*For any* API request, the system should log request details (method, path, status, duration, userId) to CloudWatch.

**Validates: Requirements 19.1**

### Property 36: Error Reporting

*For any* error occurrence, the system should send error details to Sentry with user context and stack trace.

**Validates: Requirements 19.2**

### Property 37: Onboarding Completion State

*For any* user who completes onboarding, the system should mark onboarding as complete and not display the onboarding flow again on subsequent logins.

**Validates: Requirements 20.6**

---

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: any;          // Optional additional context
    timestamp: string;      // ISO 8601 timestamp
    requestId: string;      // For tracking and debugging
  };
}
```

### Error Categories

**1. Authentication Errors (401)**
- `AUTH_TOKEN_EXPIRED`: JWT access token has expired
- `AUTH_TOKEN_INVALID`: JWT token is malformed or invalid
- `AUTH_REFRESH_FAILED`: Refresh token is invalid or expired
- `AUTH_CREDENTIALS_INVALID`: Email/password combination is incorrect
- `AUTH_OAUTH_FAILED`: OAuth provider authentication failed

**2. Authorization Errors (403)**
- `FORBIDDEN_TIER_REQUIRED`: Feature requires paid tier
- `FORBIDDEN_RATE_LIMIT`: User has exceeded rate limit
- `FORBIDDEN_RESOURCE_ACCESS`: User doesn't own the requested resource

**3. Validation Errors (400)**
- `VALIDATION_EMAIL_INVALID`: Email format is invalid
- `VALIDATION_PASSWORD_WEAK`: Password doesn't meet requirements
- `VALIDATION_URL_INVALID`: GitHub URL format is invalid
- `VALIDATION_REQUIRED_FIELD`: Required field is missing
- `VALIDATION_FIELD_TYPE`: Field has wrong data type

**4. Resource Errors (404)**
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `PROJECT_NOT_FOUND`: Project ID doesn't exist
- `TEMPLATE_NOT_FOUND`: Template ID doesn't exist
- `JOB_NOT_FOUND`: Job ID doesn't exist

**5. Service Errors (500)**
- `INTERNAL_SERVER_ERROR`: Unexpected server error
- `AI_SERVICE_ERROR`: AWS Bedrock API error
- `GITHUB_API_ERROR`: GitHub API error
- `STORAGE_ERROR`: S3 or DynamoDB error
- `QUEUE_ERROR`: SQS queue error

**6. External Service Errors (502, 503)**
- `SERVICE_UNAVAILABLE`: External service is temporarily unavailable
- `GITHUB_RATE_LIMIT`: GitHub API rate limit exceeded
- `AI_TIMEOUT`: AI operation exceeded timeout
- `DEPLOYMENT_FAILED`: Vercel/Netlify deployment failed

### Error Handling Strategies

**Retry Logic**
- Automatic retry for transient errors (network, timeout)
- Exponential backoff: 1s, 2s, 4s
- Maximum 3 retry attempts
- Move to dead-letter queue after max retries

**Graceful Degradation**
- Fall back to cached data when AI services unavailable
- Display cached learning paths if GitHub API fails
- Show last known state if real-time updates fail

**User-Friendly Messages**
- Technical errors translated to user-friendly language
- Actionable suggestions provided ("Try again" vs "Contact support")
- Error codes hidden from users but logged for debugging

**Logging and Monitoring**
- All errors logged to CloudWatch with full context
- Critical errors sent to Sentry with stack traces
- Error rate monitored with CloudWatch alarms
- Slack notifications for error rate >2%

### Example Error Responses

**Authentication Error:**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_TOKEN_EXPIRED",
    "message": "Your session has expired. Please log in again.",
    "timestamp": "2024-02-26T10:30:00Z",
    "requestId": "req-abc123"
  }
}
```

**Rate Limit Error:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN_RATE_LIMIT",
    "message": "You've reached your monthly limit of 5 integrations. Upgrade to Pro for unlimited access.",
    "details": {
      "current": 5,
      "limit": 5,
      "resetDate": "2024-03-01T00:00:00Z"
    },
    "timestamp": "2024-02-26T10:30:00Z",
    "requestId": "req-def456"
  }
}
```

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_PASSWORD_WEAK",
    "message": "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
    "details": {
      "field": "password",
      "requirements": {
        "minLength": 8,
        "uppercase": true,
        "lowercase": true,
        "number": true
      }
    },
    "timestamp": "2024-02-26T10:30:00Z",
    "requestId": "req-ghi789"
  }
}
```

---

## Testing Strategy

### Dual Testing Approach

The platform requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests:**
- Specific examples and edge cases
- Integration points between components
- Error conditions and boundary cases
- UI component rendering and interactions

**Property-Based Tests:**
- Universal properties across all inputs
- Comprehensive input coverage through randomization
- Validation of correctness properties defined above
- Minimum 100 iterations per property test

### Property-Based Testing Configuration

**Framework:** fast-check (JavaScript/TypeScript property-based testing library)

**Configuration:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
});
```

**Property Test Template:**
```typescript
import { fc, test } from '@fast-check/vitest';

// Feature: codelearn-platform, Property 14: Code Persistence Round Trip
test.prop([fc.string()])('code persistence round trip', async (code) => {
  // Save code
  const saveResult = await saveCode(userId, projectId, code);
  expect(saveResult.success).toBe(true);
  
  // Reload code
  const loadResult = await loadCode(userId, projectId);
  
  // Verify exact match
  expect(loadResult.code).toBe(code);
}, { numRuns: 100 });
```

**Tagging Convention:**
Every property test must include a comment referencing the design document property:
```typescript
// Feature: codelearn-platform, Property {number}: {property_text}
```

### Test Organization

**Directory Structure:**
```
tests/
├── unit/
│   ├── auth/
│   │   ├── login.test.ts
│   │   ├── signup.test.ts
│   │   └── oauth.test.ts
│   ├── learning/
│   │   ├── project-selection.test.ts
│   │   ├── task-management.test.ts
│   │   └── code-editor.test.ts
│   ├── developer/
│   │   ├── template-library.test.ts
│   │   ├── template-extraction.test.ts
│   │   └── code-integration.test.ts
│   └── shared/
│       ├── ai-mentor.test.ts
│       └── job-poller.test.ts
├── property/
│   ├── auth.property.test.ts
│   ├── persistence.property.test.ts
│   ├── ai-operations.property.test.ts
│   ├── rate-limiting.property.test.ts
│   └── integration.property.test.ts
├── integration/
│   ├── api/
│   │   ├── auth-flow.test.ts
│   │   ├── learning-flow.test.ts
│   │   └── developer-flow.test.ts
│   └── database/
│       ├── dynamodb-operations.test.ts
│       └── s3-operations.test.ts
└── e2e/
    ├── learning-mode.spec.ts
    ├── developer-mode.spec.ts
    └── deployment.spec.ts
```

### Unit Test Examples

**Authentication Test:**
```typescript
describe('User Authentication', () => {
  it('should create account with valid email/password', async () => {
    const result = await signup({
      email: 'test@example.com',
      password: 'SecurePass123'
    });
    
    expect(result.success).toBe(true);
    expect(result.data.userId).toBeDefined();
    expect(result.data.token).toBeDefined();
  });
  
  it('should reject weak password', async () => {
    const result = await signup({
      email: 'test@example.com',
      password: 'weak'
    });
    
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('VALIDATION_PASSWORD_WEAK');
  });
});
```

**Code Editor Test:**
```typescript
describe('Code Editor Auto-Save', () => {
  it('should auto-save after 30 seconds of inactivity', async () => {
    const editor = renderEditor({ projectId: 'proj-123' });
    
    // Simulate typing
    await userEvent.type(editor.getByRole('textbox'), 'const x = 1;');
    
    // Wait for auto-save
    await waitFor(() => {
      expect(mockSaveCode).toHaveBeenCalledWith('proj-123', 'const x = 1;');
    }, { timeout: 31000 });
  });
});
```

### Property-Based Test Examples

**OAuth Flow Property:**
```typescript
// Feature: codelearn-platform, Property 1: OAuth Authentication Flow
test.prop([
  fc.constantFrom('github', 'google'),
  fc.string({ minLength: 20 })
])('OAuth flow creates valid account', async (provider, authCode) => {
  const result = await oauthLogin(provider, authCode);
  
  expect(result.success).toBe(true);
  expect(result.data.userId).toBeDefined();
  expect(result.data.token).toBeDefined();
  expect(result.data.refreshToken).toBeDefined();
  
  // Verify token is valid
  const verifyResult = await verifyToken(result.data.token);
  expect(verifyResult.valid).toBe(true);
}, { numRuns: 100 });
```

**Rate Limit Property:**
```typescript
// Feature: codelearn-platform, Property 27: Rate Limit Enforcement
test.prop([
  fc.integer({ min: 101, max: 200 })
])('rate limit blocks excess requests', async (requestCount) => {
  const user = await createFreeUser();
  
  // Make requests up to limit
  for (let i = 0; i < 100; i++) {
    const result = await makeApiRequest(user.token);
    expect(result.status).toBe(200);
  }
  
  // Next request should be rate limited
  const blockedResult = await makeApiRequest(user.token);
  expect(blockedResult.status).toBe(429);
  expect(blockedResult.headers['retry-after']).toBeDefined();
}, { numRuns: 100 });
```

**Integration Undo Property:**
```typescript
// Feature: codelearn-platform, Property 26: Integration Undo Round Trip
test.prop([
  fc.string({ minLength: 100 }),  // Original code
  fc.string({ minLength: 50 })    // Template code
])('integration undo restores original state', async (originalCode, templateCode) => {
  // Save original code
  await saveCode(projectId, originalCode);
  
  // Integrate template
  const integrationResult = await integrateTemplate(projectId, templateId);
  const integratedCode = await loadCode(projectId);
  
  // Verify code changed
  expect(integratedCode).not.toBe(originalCode);
  
  // Undo integration
  await undoIntegration(integrationResult.integrationId);
  const restoredCode = await loadCode(projectId);
  
  // Verify exact restoration
  expect(restoredCode).toBe(originalCode);
}, { numRuns: 100 });
```

### Integration Test Examples

**Learning Flow Integration:**
```typescript
describe('Complete Learning Flow', () => {
  it('should allow user to complete a project end-to-end', async () => {
    // 1. Select technology
    const techResult = await selectTechnology('react');
    expect(techResult.success).toBe(true);
    
    // 2. Wait for curation
    const projects = await pollJobUntilComplete(techResult.jobId);
    expect(projects).toHaveLength(3);
    
    // 3. Select project
    const projectResult = await selectProject(projects[0].id);
    expect(projectResult.success).toBe(true);
    
    // 4. Complete tasks
    const tasks = await getTasks(projectResult.projectId);
    for (const task of tasks) {
      await saveCode(projectResult.projectId, task.id, task.solutionCode);
      await markTaskComplete(task.id);
    }
    
    // 5. Deploy project
    const deployResult = await deployProject(projectResult.projectId, 'vercel');
    expect(deployResult.url).toBeDefined();
    
    // 6. Verify portfolio
    const portfolio = await getPortfolio(userId);
    expect(portfolio.projects).toContainEqual(
      expect.objectContaining({ id: projectResult.projectId })
    );
  });
});
```

### E2E Test Examples (Playwright)

**Learning Mode E2E:**
```typescript
test('user can complete learning path', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.click('text=Continue with GitHub');
  // ... OAuth flow ...
  
  // Select technology
  await page.goto('/learning');
  await page.click('text=React');
  
  // Wait for projects
  await page.waitForSelector('[data-testid="project-card"]');
  
  // Select beginner project
  await page.click('[data-testid="project-card"]:first-child');
  
  // Write code
  await page.fill('[data-testid="code-editor"]', 'const App = () => <div>Hello</div>;');
  
  // Run code
  await page.click('text=Run');
  await page.waitForSelector('[data-testid="preview-iframe"]');
  
  // Verify preview
  const preview = page.frameLocator('[data-testid="preview-iframe"]');
  await expect(preview.locator('text=Hello')).toBeVisible();
  
  // Mark task complete
  await page.click('[data-testid="mark-complete"]');
  
  // Verify progress
  await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('aria-valuenow', '7');
});
```

### Test Coverage Goals

**Unit Tests:**
- Utilities and helpers: 90%+ coverage
- API routes: 80%+ coverage
- React components: 70%+ coverage
- Overall: 70%+ coverage

**Property-Based Tests:**
- All 37 correctness properties must have corresponding tests
- Minimum 100 iterations per property
- Each property test must pass consistently

**Integration Tests:**
- All critical user flows covered
- Authentication flow
- Learning Mode flow (select → code → deploy)
- Developer Mode flow (browse → integrate → undo)
- Subscription flow (upgrade → payment → access)

**E2E Tests:**
- Happy path for Learning Mode
- Happy path for Developer Mode
- Error scenarios (network failure, timeout, invalid input)
- Cross-browser testing (Chrome, Firefox, Safari)

### Continuous Integration

**GitHub Actions Workflow:**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:property
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run build
```

**Test Execution Order:**
1. Linting (ESLint + Prettier)
2. Unit tests (fast, isolated)
3. Property-based tests (comprehensive)
4. Integration tests (database, API)
5. E2E tests (full user flows)
6. Build verification

---

## Deployment Architecture

### Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │   CloudFront   │
                │   (CDN)        │
                └────────┬───────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌────────────────┐              ┌────────────────┐
│  Vercel Edge   │              │   S3 Bucket    │
│  (Next.js App) │              │   (Assets)     │
└────────┬───────┘              └────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│        AWS Services                     │
│  ┌──────────────────────────────────┐  │
│  │  API Gateway (WebSocket)         │  │
│  └──────────────┬───────────────────┘  │
│                 │                       │
│  ┌──────────────┴───────────────────┐  │
│  │  Lambda Functions                │  │
│  │  - Quick code execution          │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  SQS Queue                       │  │
│  │  - AI job queue                  │  │
│  │  - Dead-letter queue             │  │
│  └──────────────┬───────────────────┘  │
│                 │                       │
│  ┌──────────────┴───────────────────┐  │
│  │  ECS Fargate                     │  │
│  │  - AI workers (0-10 tasks)       │  │
│  │  - Auto-scaling                  │  │
│  └──────────────┬───────────────────┘  │
│                 │                       │
│  ┌──────────────┴───────────────────┐  │
│  │  AWS Bedrock                     │  │
│  │  - Claude 3.5 Sonnet             │  │
│  │  - Llama 3.1 70B                 │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  DynamoDB                        │  │
│  │  - users, projects, templates    │  │
│  │  - jobs, integrations            │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  S3                              │  │
│  │  - user-projects                 │  │
│  │  - templates                     │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Cognito                         │  │
│  │  - User pools                    │  │
│  │  - Identity pools                │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  CloudWatch                      │  │
│  │  - Logs, Metrics, Alarms         │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Deployment Environments

**Development:**
- Vercel preview deployments (per PR)
- AWS dev environment (separate resources)
- Mock AI responses for faster testing
- Reduced resource limits

**Staging:**
- Vercel staging deployment
- AWS staging environment
- Real AI services with lower limits
- Full integration testing

**Production:**
- Vercel production deployment
- AWS production environment
- Full AI services with production limits
- Auto-scaling enabled
- Monitoring and alerting active

### Deployment Process

**Frontend (Vercel):**
1. Push to GitHub
2. Vercel auto-builds and deploys
3. Preview URL generated for PRs
4. Production deployment on merge to main
5. Automatic rollback on errors

**Backend (AWS):**
1. Infrastructure changes via AWS CDK
2. Deploy CDK stack to AWS
3. Update Lambda functions
4. Update Fargate task definitions
5. Update environment variables in Secrets Manager
6. Run database migrations if needed
7. Verify deployment with smoke tests

### Monitoring and Alerting

**CloudWatch Dashboards:**
- API response times (P50, P95, P99)
- Error rates by endpoint
- AI operation success rates
- Sandbox execution metrics
- Database query performance
- Queue depth and processing time

**Alarms:**
- API response time >3s (P95)
- Error rate >2%
- Queue depth >100 messages
- Failed job rate >5%
- DynamoDB throttling
- S3 error rate >1%

**Notifications:**
- Slack: Error rate alarms, deployment notifications
- PagerDuty: Critical alarms (uptime <95%, data loss)
- Email: Weekly summary reports

---

## Security Considerations

### Authentication Security

**JWT Token Management:**
- Access tokens: 1-hour expiration
- Refresh tokens: 30-day expiration with rotation
- Tokens stored in httpOnly cookies (not localStorage)
- CSRF protection with SameSite=Strict cookies

**Password Security:**
- Minimum 8 characters
- Must include uppercase, lowercase, and number
- Hashed with bcrypt (cost factor 12)
- Password reset via email with time-limited tokens

**OAuth Security:**
- State parameter for CSRF protection
- Verify OAuth provider responses
- Store OAuth tokens securely in Cognito
- Revoke tokens on logout

### Authorization Security

**Role-Based Access Control:**
- Roles: free, pro, team, admin
- Permissions checked on every request
- Resource ownership validated (userId match)
- API Gateway authorizer for centralized auth

**Rate Limiting:**
- Per-user rate limits (100/hour free, 1000/hour paid)
- Per-IP rate limits (1000/hour)
- Exponential backoff for repeated violations
- Temporary bans for abuse

### Data Security

**Encryption:**
- At rest: S3 (AES-256), DynamoDB (AWS managed keys)
- In transit: TLS 1.3 for all connections
- Secrets: AWS Secrets Manager with automatic rotation

**PII Protection:**
- Email encrypted in database
- No PII in logs or error messages
- Data export API for GDPR compliance
- Account deletion removes all user data

### Sandbox Security

**Isolation:**
- Fargate containers isolated per user
- No shared file systems
- Network access blocked except whitelisted APIs
- Resource limits enforced (CPU, memory, time)

**Code Execution:**
- No eval() or Function() constructor
- Restricted file system access
- No access to environment variables
- Automatic cleanup after execution

### API Security

**Input Validation:**
- Zod schemas for all API inputs
- SQL injection prevention (DynamoDB NoSQL)
- XSS prevention (React auto-escaping)
- CSRF tokens for state-changing operations

**Output Sanitization:**
- HTML sanitization for user-generated content
- JSON encoding for API responses
- Error messages don't leak sensitive info

### Compliance

**GDPR (EU users):**
- Data export on request
- Data deletion on request
- Cookie consent banner
- Privacy policy

**CCPA (California users):**
- Privacy policy disclosure
- Opt-out of data sale (N/A for us)
- Data access on request

---

## Performance Optimization

### Frontend Optimization

**Code Splitting:**
- Dynamic imports for large components
- Route-based code splitting
- Monaco Editor loaded on demand
- Lazy loading for images

**Caching:**
- Service worker for offline support
- Browser caching for static assets
- CDN caching via CloudFront
- API response caching with TanStack Query

**Bundle Size:**
- Target: <200 KB gzipped
- Tree shaking enabled
- Remove unused dependencies
- Optimize images (WebP format)

### Backend Optimization

**Database:**
- DynamoDB on-demand billing (auto-scaling)
- GSI for common query patterns
- Batch operations for bulk writes
- Connection pooling for efficiency

**API:**
- Response compression (gzip)
- Pagination for large result sets
- Field selection (only return requested fields)
- Caching with DynamoDB TTL

**AI Operations:**
- Cache responses for 24 hours (70-80% cost reduction)
- Use Llama for simple tasks (3x cheaper than Claude)
- Batch AI requests when possible
- Stream responses for perceived speed

### Scalability

**Auto-Scaling:**
- Fargate workers: 0-10 tasks based on queue depth
- Lambda: Automatic scaling to 100 concurrent executions
- DynamoDB: On-demand capacity mode

**Load Balancing:**
- Vercel Edge Network for global distribution
- CloudFront for S3 assets
- API Gateway for WebSocket connections

**Cost Optimization:**
- Workers scale to zero when idle
- S3 Intelligent-Tiering for old projects
- DynamoDB TTL for temporary data
- CloudWatch log retention (7 days MVP, 30 days prod)

---

## Implementation Guidance

### Development Workflow

**1. Setup (Week 1)**
- Initialize Next.js project with TypeScript
- Configure Tailwind CSS and shadcn/ui
- Set up AWS CDK for infrastructure
- Configure GitHub Actions for CI/CD
- Set up development environment

**2. Authentication (Week 2)**
- Implement Cognito integration
- Build login/signup pages
- Add OAuth providers (GitHub, Google)
- Implement JWT token management
- Add protected route middleware

**3. Learning Mode Core (Weeks 3-4)**
- Build technology selection UI
- Implement Curator Agent
- Implement Teacher Agent
- Build project workspace with Monaco Editor
- Add task list and progress tracking

**4. Code Execution (Week 5)**
- Set up Lambda for quick execution
- Set up Fargate for full sessions
- Implement sandbox security
- Build live preview component
- Add console output display

**5. Developer Mode (Weeks 6-7)**
- Build template library UI
- Implement Code Agent for extraction
- Implement context-aware integration
- Build diff view component
- Add undo functionality

**6. Deployment & Polish (Week 8)**
- Implement Vercel deployment integration
- Build portfolio page
- Add onboarding flow
- Performance optimization
- Bug fixes and testing

### Code Style Guidelines

**TypeScript:**
- Strict mode enabled
- No implicit any
- Explicit return types for functions
- Interface over type for objects

**React:**
- Functional components with hooks
- Custom hooks for reusable logic
- Props interfaces defined inline or exported
- Use React.memo for expensive components

**Naming:**
- Components: PascalCase (UserProfile.tsx)
- Functions: camelCase (getUserProfile)
- Constants: UPPER_SNAKE_CASE (API_BASE_URL)
- Files: kebab-case for non-components (api-client.ts)

**Comments:**
- JSDoc for public functions
- Inline comments for complex logic
- TODO comments with issue numbers
- No commented-out code in commits

### Git Workflow

**Branching:**
- main: Production-ready code
- develop: Integration branch
- feature/*: Feature branches
- bugfix/*: Bug fix branches

**Commits:**
- Conventional Commits format
- feat: New feature
- fix: Bug fix
- docs: Documentation
- chore: Maintenance
- test: Tests

**Pull Requests:**
- Require 1 approval
- Run CI checks (lint, test, build)
- Squash and merge to main
- Delete branch after merge

---

## Appendix

### Technology Versions

| Technology | Version | Status |
|------------|---------|--------|
| Node.js | 20.11.0+ | MANDATORY |
| Next.js | 14.2.0+ | MANDATORY |
| React | 18.2.0+ | MANDATORY |
| TypeScript | 5.3.0+ | MANDATORY |
| Tailwind CSS | 3.4.0+ | MANDATORY |
| Monaco Editor | 4.6.0+ | MANDATORY |
| TanStack Query | 5.x | MANDATORY |
| AWS SDK | 3.x | MANDATORY |
| LangChain.js | 0.1.x | RECOMMENDED |
| Vitest | 1.x | MANDATORY |
| Playwright | 1.x | MANDATORY |
| fast-check | 3.x | MANDATORY |

### API Endpoint Summary

**Authentication:**
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/oauth/{provider}
- POST /api/auth/refresh
- POST /api/auth/logout

**Learning Mode:**
- GET /api/learning/technologies
- POST /api/learning/curate
- GET /api/learning/projects/{technology}
- GET /api/learning/project/{projectId}/tasks
- POST /api/learning/project/{projectId}/save
- GET /api/learning/progress/{userId}

**Developer Mode:**
- GET /api/developer/templates
- POST /api/developer/extract
- POST /api/developer/integrate
- GET /api/developer/integration/{jobId}/preview
- POST /api/developer/integration/{jobId}/approve
- POST /api/developer/integration/{jobId}/undo
- GET /api/developer/usage/{userId}

**Sandbox:**
- POST /api/sandbox/execute
- POST /api/sandbox/deploy
- GET /api/sandbox/deployment/{deploymentId}

**Jobs:**
- GET /api/jobs/{jobId}
- POST /api/jobs/{jobId}/cancel

### Environment Variables

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
DYNAMODB_TABLE_TEMPLATES=codelearn-templates
DYNAMODB_TABLE_JOBS=codelearn-jobs
DYNAMODB_TABLE_INTEGRATIONS=codelearn-integrations
S3_BUCKET_PROJECTS=codelearn-user-projects
S3_BUCKET_TEMPLATES=codelearn-templates
S3_BUCKET_ASSETS=codelearn-assets

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

### Glossary

- **AST:** Abstract Syntax Tree - A tree representation of source code structure
- **CDN:** Content Delivery Network - Distributed network for serving static assets
- **CSRF:** Cross-Site Request Forgery - Security vulnerability where unauthorized commands are transmitted
- **DLQ:** Dead-Letter Queue - Queue for messages that failed processing
- **EARS:** Easy Approach to Requirements Syntax - Format for writing requirements
- **GSI:** Global Secondary Index - DynamoDB index for alternative query patterns
- **JWT:** JSON Web Token - Compact token format for authentication
- **OAuth:** Open Authorization - Standard for access delegation
- **PII:** Personally Identifiable Information - Data that can identify an individual
- **SQS:** Simple Queue Service - AWS message queue service
- **TTL:** Time To Live - Expiration time for cached data
- **XSS:** Cross-Site Scripting - Security vulnerability allowing script injection

---

## Document Approval

**Status:** ✅ APPROVED  
**Approved By:** Product Team  
**Date:** 2024  
**Next Phase:** Implementation (Task Creation)

**Related Documents:**
- [Requirements Document](./requirements.md)
- [Technical Stack](../../AWS_project/tech_stack.md)
- [Design System](../../AWS_project/design.md)
- [Product Requirements Document](../../AWS_project/PRD.md)

