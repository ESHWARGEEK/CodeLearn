# Implementation Plan: CodeLearn Platform

## Overview

This implementation plan breaks down the CodeLearn AI Learning & Developer Productivity Platform into sequential, actionable tasks. The platform uses Next.js 14 (App Router), TypeScript, AWS services (Cognito, DynamoDB, S3, Bedrock, SQS, Fargate), and follows the exact design system specified in AWS_project/design.md.

**Key Implementation Principles:**
- Strictly adhere to tech stack versions in AWS_project/tech_stack.md (all versions are MANDATORY)
- Use exact HTML templates, Tailwind classes, and design tokens from AWS_project/design.md
- Follow Next.js 14 App Router (NOT Pages Router)
- Implement hybrid architecture: Next.js monolith + async AI workers on Fargate
- Use conventional commits (feat:, fix:, docs:, chore:)
- Create pull requests at the end of each major task

**Git Workflow:**
- **Repository:** https://github.com/ESHWARGEEK/CodeLearn.git
- **Branch Strategy:** Create feature branch for each task: `feature/task-X-description`
- **PR Process:** Push branch → Create PR on GitHub → Review → Merge to main
- **Tracking:** Update TODO.md after each task completion

## Tasks

- [x] 1. Project Setup and Infrastructure Foundation
  - Initialize Next.js 14.2+ project with TypeScript 5.3+, App Router, and Tailwind CSS 3.4+
  - Configure tsconfig.json with strict mode and required compiler options per tech_stack.md
  - Install and configure shadcn/ui components (Button, Card, Dialog, Input, etc.)
  - Set up ESLint, Prettier, Husky, and lint-staged for code quality
  - Configure Vitest 1.x for unit tests and Playwright 1.x for E2E tests
  - Create directory structure: app/, components/, lib/, types/, tests/
  - Set up environment variables template (.env.example) with all required AWS, Cognito, GitHub, Vercel variables
  - Initialize Git repository with conventional commits configuration
  - _Requirements: Tech Stack (all sections), Design System_
  - _Commit: `feat: initialize Next.js 14 project with TypeScript and Tailwind CSS`_
  - _PR: Create pull request "Project Setup and Infrastructure"_


- [x] 2. AWS Infrastructure Setup with CDK ✅ COMPLETED
  - [x] 2.1 Initialize AWS CDK project with TypeScript ✅
    - Create CDK app structure in infrastructure/ directory
    - Define stacks for DynamoDB tables, S3 buckets, Cognito, SQS queues
    - _Requirements: Architecture, Data Models, Tech Stack Section 4_
    - _Commit: `feat: initialize AWS CDK infrastructure project`_
  
  - [x] 2.2 Create DynamoDB tables with CDK ✅
    - Define users table (PK: USER#{userId}, SK: PROFILE) with GSI
    - Define projects table (PK: PROJECT#{projectId}, SK: USER#{userId}) with userId-status-index GSI
    - Define learning_paths table (PK: TECH#{technology}, SK: DIFF#{difficulty}) with TTL
    - Define templates table (PK: TEMPLATE#{templateId}, SK: METADATA) with technology-rating-index GSI
    - Define jobs table (PK: JOB#{jobId}, SK: USER#{userId}) with TTL
    - Define integrations table (PK: INTEGRATION#{integrationId}, SK: USER#{userId}) with userId-month-index GSI
    - Configure on-demand billing mode for all tables
    - _Requirements: Data Models (DynamoDB Tables section)_
    - _Commit: `feat: define DynamoDB tables with GSIs and TTL`_
  
  - [x] 2.3 Create S3 buckets with CDK ✅
    - Create user-projects-{env} bucket with versioning enabled
    - Create templates-{env} bucket with lifecycle policies
    - Create assets-{env} bucket with CloudFront CDN configuration
    - Configure AES-256 encryption for all buckets
    - Set up CORS policies for browser uploads
    - _Requirements: Data Models (S3 Bucket Structure section)_
    - _Commit: `feat: create S3 buckets with encryption and CDN`_
  
  - [x] 2.4 Set up AWS Cognito User Pools ✅
    - Create Cognito User Pool with email/password authentication
    - Configure password policy (8+ chars, uppercase, lowercase, number)
    - Set up OAuth providers (GitHub, Google) with callback URLs
    - Configure JWT token expiration (1 hour access, 30 days refresh)
    - Create Identity Pool for federated identities
    - _Requirements: 1.2, 1.3, 1.4, 1.5, Tech Stack Section 2.3_
    - _Commit: `feat: configure Cognito with OAuth providers`_
  
  - [x] 2.5 Create SQS queues for async job processing ✅
    - Create ai-jobs-queue (Standard Queue) with 5-minute visibility timeout
    - Create ai-jobs-dlq (Dead-Letter Queue) with 4-day retention
    - Configure max receives (3) before moving to DLQ
    - Set up CloudWatch alarms for queue depth >100
    - _Requirements: 15.1, 15.2, 15.6, Tech Stack Section 4.2_
    - _Commit: `feat: set up SQS queues for AI job processing`_
  
  - [x] 2.6 Deploy CDK stacks to AWS ✅
    - Run cdk synth to generate CloudFormation templates
    - Deploy to development environment
    - Verify all resources created successfully
    - Export environment variables (table names, bucket names, queue URLs)
    - _Requirements: Infrastructure, Deployment Architecture_
    - _Commit: `chore: deploy AWS infrastructure to development`_
  
  - [x] 2.7 Configure OAuth providers and update environment variables ✅
    - Create GitHub OAuth App at https://github.com/settings/developers
    - Create Google OAuth credentials at https://console.cloud.google.com/
    - Add callback URLs pointing to Cognito domain
    - Update .env file with real Cognito User Pool ID and Client ID from CDK output
    - Update .env file with real OAuth client IDs and secrets
    - Verify AWS resources in Console (Cognito, DynamoDB, S3, SQS)
    - Test AWS CLI access to deployed resources
    - Deploy Next.js app to Vercel production
    - Add environment variables to Vercel Dashboard
    - _Requirements: 1.2, 1.3, 1.4, Tech Stack Section 2.3_
    - _Commit: `feat: complete OAuth configuration for GitHub and Google`_
    - _PR: Create pull request "AWS Infrastructure Setup"_ ✅
  
  **Task 2 Deliverables:** ✅ ALL COMPLETE
  - ✅ 4 CloudFormation stacks deployed to AWS (us-east-1, account: 870631428381)
  - ✅ 6 DynamoDB tables with GSIs and TTL (codelearn-*-dev)
  - ✅ 3 S3 buckets with CloudFront CDN (codelearn-*-dev)
  - ✅ Cognito User Pool (us-east-1_bNco2tmIx) with GitHub and Google OAuth providers
  - ✅ 2 SQS queues with DLQ and CloudWatch alarms
  - ✅ Next.js app deployed to Vercel (https://codelearn-lemon.vercel.app)
  - ✅ OAuth providers configured with production callback URLs
  - ✅ Comprehensive deployment documentation (12+ guides)
  - ✅ PowerShell automation scripts for OAuth configuration
  - ✅ Branch: feature/task-2-aws-infrastructure (ready for PR)
  
  **Task 2 Status:** ✅ COMPLETED (February 27, 2026)
  - All subtasks 2.1-2.7 completed successfully
  - AWS infrastructure deployed and verified
  - Vercel deployment live and operational
  - OAuth providers (GitHub + Google) configured in Cognito
  - Environment variables documented (pending: add to Vercel Dashboard)
  - PR ready: Use `PR_DESCRIPTION.md` for pull request
  - Next: Add environment variables to Vercel, then start Task 3


- [x] 3. Authentication System Implementation ✅ CORE COMPLETE (Tasks 3.1-3.5)
  - [x] 3.1 Create authentication utilities and types ✅
    - Define TypeScript interfaces for User, AuthTokens, LoginRequest, SignupRequest
    - Create lib/auth/cognito.ts with Cognito SDK integration
    - Implement JWT token verification and refresh functions
    - Create auth context provider with React Context API
    - _Requirements: 1.1, 1.5, 1.6, Design: Authentication Routes_
    - _Commit: `feat: create authentication utilities and types`_ ✅
  
  - [x] 3.2 Build login page with OAuth and email/password ✅
    - Create app/(auth)/login/page.tsx using exact HTML from AWS_project/design.md
    - Implement GitHub OAuth button with Cognito integration
    - Implement Google OAuth button with Cognito integration
    - Create email/password form with React Hook Form + Zod validation
    - Add password reset link and signup redirect
    - Style with exact Tailwind classes from design system
    - _Requirements: 1.2, 1.3, 1.4, Design: LoginPage Component_
    - _Commit: `feat: implement login page with OAuth and email/password`_ ✅
  
  - [x] 3.3 Build signup page with validation ✅
    - Create app/(auth)/signup/page.tsx using design system templates
    - Implement OAuth provider buttons (GitHub, Google)
    - Create email/password form with validation (8+ chars, uppercase, lowercase, number)
    - Add Terms of Service checkbox and login redirect
    - Implement client-side and server-side validation with Zod
    - _Requirements: 1.4, Design: SignupPage Component_
    - _Commit: `feat: implement signup page with validation`_ ✅
  
  - [x] 3.4 Create API routes for authentication ✅
    - Implement POST /api/auth/signup with Cognito user creation
    - Implement POST /api/auth/login with JWT token generation
    - Implement POST /api/auth/oauth/{provider} with OAuth flow
    - Implement POST /api/auth/refresh for token refresh
    - Implement POST /api/auth/logout with token invalidation
    - Return consistent API response format (success/error structure)
    - _Requirements: 1.2, 1.3, 1.5, 1.6, 1.7, Design: Authentication Routes_
    - _Commit: `feat: create authentication API routes`_ ✅
  
  - [x] 3.5 Implement protected route middleware ✅
    - Create middleware.ts for JWT verification on protected routes
    - Check user tier (free, pro, team) for authorization
    - Redirect to /login if token invalid or expired
    - Store tokens in httpOnly cookies with SameSite=Strict
    - _Requirements: 1.6, 1.7, 1.8, Design: Authorization by Tier_
    - _Commit: `feat: implement protected route middleware`_ ✅
  
  **Task 3 Core Deliverables (3.1-3.5):** ✅ COMPLETE
  - ✅ TypeScript types and interfaces for authentication
  - ✅ AWS Cognito SDK integration with JWT verification
  - ✅ React Context provider for global auth state
  - ✅ Login page with OAuth (GitHub, Google) and email/password
  - ✅ Signup page with password validation and Terms checkbox
  - ✅ 6 API routes (signup, login, refresh, logout, me, OAuth callback)
  - ✅ Protected route middleware with tier-based authorization
  - ✅ httpOnly cookies with SameSite=Strict security
  - ✅ Exact design templates from AWS_project/design.md
  - ✅ Branch: feature/task-3-authentication (pushed to GitHub)
  
  **Task 3 Status:** ✅ CORE COMPLETE (February 28, 2026)
  - Subtasks 3.1-3.5 completed successfully
  - Authentication system production-ready
  - Security best practices implemented
  - Tests (3.6-3.8) pending - can be completed now or in Task 24
  - Next: Complete tests OR move to Task 4 (Dashboard)
  
  - [ ] 3.6 Write property test for OAuth authentication flow
    - **Property 1: OAuth Authentication Flow**
    - **Validates: Requirements 1.2, 1.3**
    - Test that OAuth flow creates valid user account with JWT tokens
    - Use fast-check to generate random OAuth providers (GitHub, Google)
    - Verify tokens are valid and user profile is created in DynamoDB
    - _Commit: `test: add property test for OAuth authentication`_
  
  - [ ] 3.7 Write property test for token refresh round trip
    - **Property 3: Token Refresh Round Trip**
    - **Validates: Requirements 1.5, 1.6**
    - Test that expired access token can be refreshed without re-login
    - Verify new access token is valid and has correct expiration
    - _Commit: `test: add property test for token refresh`_
  
  - [ ] 3.8 Write unit tests for authentication
    - Test email/password validation (valid/invalid formats)
    - Test password strength requirements
    - Test token invalidation on logout
    - Test authorization by tier (free, pro, team)
    - _Commit: `test: add unit tests for authentication`_
  
  - [x] 3.9 Implement email verification flow (Future Enhancement)
    - Create app/(auth)/verify-email/page.tsx for verification code entry
    - Build VerificationCodeInput component with 6-digit code input
    - Implement POST /api/auth/verify API route using confirmSignUp from cognito.ts
    - Add "Resend Code" button with rate limiting (1 per minute)
    - Implement POST /api/auth/resend-code API route
    - Redirect to login page after successful verification
    - Show error messages for invalid/expired codes
    - Customize Cognito email templates with branding
    - Update signup flow to redirect to /verify-email instead of home
    - _Requirements: 1.4, Production Security Best Practices_
    - _Note: Currently disabled for development. Enable in Cognito for production._
    - _Commit: `feat: implement email verification flow`_
    - _PR: Create pull request "Authentication System"_


- [ ] 4. Dashboard and Navigation Components
  - [x] 4.1 Create global navigation bar
    - Build Navbar component using exact HTML from AWS_project/design.md
    - Implement logo, navigation links (Learning, Developer, Projects)
    - Add search bar with Cmd+K shortcut
    - Add notifications bell and user avatar dropdown
    - Show "Upgrade" button for free tier users
    - Style with exact Tailwind classes and design tokens
    - _Requirements: Design: Navbar Component_
    - _Commit: `feat: create global navigation bar`_
  
  - [x] 4.2 Build dashboard page with statistics
    - Create app/(dashboard)/dashboard/page.tsx
    - Implement StatsCard components (completed projects, hours, integrations)
    - Add "Continue Learning" section with recent projects
    - Add recent projects grid with ProjectCard components
    - Integrate AI Mentor chat widget
    - Show upgrade CTA for free users
    - _Requirements: Design: Dashboard Component, StatsCard Component_
    - _Commit: `feat: implement dashboard with statistics`_
  
  - [x] 4.3 Create reusable UI components
    - Build StatsCard component with animated number counter and trend indicator
    - Build ProjectCard component with project metadata and preview
    - Build AIMentorChat component with message bubbles and streaming responses
    - Build JobStatusPoller component for async job progress tracking
    - Use shadcn/ui primitives and design system styling
    - _Requirements: Design: Shared Components_
    - _Commit: `feat: create reusable UI components`_
  
  - [x] 4.4 Implement API routes for dashboard data
    - Create GET /api/learning/progress/{userId} for learning statistics
    - Create GET /api/developer/usage/{userId} for integration usage
    - Fetch data from DynamoDB (users, projects, integrations tables)
    - Return statistics (completed projects, hours, integrations count)
    - _Requirements: Design: Dashboard Component API calls_
    - _Commit: `feat: create dashboard data API routes`_
  
  - [ ]* 4.5 Write unit tests for dashboard components
    - Test StatsCard rendering with different props
    - Test ProjectCard display and interactions
    - Test dashboard data fetching and display
    - _Commit: `test: add unit tests for dashboard components`_
    - _PR: Create pull request "Dashboard and Navigation"_

- [x] 5. Checkpoint - Verify authentication and dashboard
  - Ensure all tests pass (unit and property tests)
  - Verify login/signup flows work end-to-end
  - Verify dashboard displays correctly with mock data
  - Ask the user if questions arise


- [-] 6. AI Agent System - Curator and Teacher Agents
  - [-] 6.1 Set up AWS Bedrock integration
    - Create lib/ai/bedrock.ts with AWS Bedrock SDK client
    - Configure Claude 3.5 Sonnet model (anthropic.claude-3-5-sonnet-20240620-v1:0)
    - Configure Llama 3.1 70B model (meta.llama3-1-70b-instruct-v1:0)
    - Implement model selection strategy (Claude for complex, Llama for simple)
    - Add error handling and retry logic with exponential backoff
    - _Requirements: Tech Stack Section 3.1, 3.2, Design: AI Agent System_
    - _Commit: `feat: integrate AWS Bedrock with Claude and Llama models`_
  
  - [ ] 6.2 Implement AI response caching layer
    - Create lib/ai/cache.ts with DynamoDB caching logic
    - Generate cache keys from hash of (model + prompt + input)
    - Store AI responses in DynamoDB with 24-hour TTL
    - Implement cache hit/miss logic with fallback to Bedrock
    - _Requirements: 3.5, 18.2, Design: Property 11 (Caching Consistency)_
    - _Commit: `feat: implement AI response caching with DynamoDB TTL`_
  
  - [ ] 6.3 Create Curator Agent for GitHub repository discovery
    - Create lib/agents/curator.ts with CuratorAgent class
    - Implement GitHub API integration for repository search
    - Use Llama 3.1 70B for cost-optimized filtering
    - Filter repos by stars (>50), recent activity (<6 months), documentation quality
    - Rank by educational value and return top 3 per difficulty level
    - _Requirements: 2.2, 3.4, Design: Curator Agent_
    - _Commit: `feat: implement Curator Agent for repo discovery`_
  
  - [ ] 6.4 Create Teacher Agent for learning content generation
    - Create lib/agents/teacher.ts with TeacherAgent class
    - Use Claude 3.5 Sonnet for complex reasoning
    - Analyze repository structure and dependencies
    - Generate 10-15 sequential tasks with descriptions, hints, estimated time
    - Create logical learning sequence (simple → complex)
    - _Requirements: 4.1, 4.2, Design: Teacher Agent_
    - _Commit: `feat: implement Teacher Agent for task generation`_
  
  - [ ] 6.5 Create prompt templates for agents
    - Create lib/prompts/curator.ts with Curator Agent system prompt
    - Create lib/prompts/teacher.ts with Teacher Agent system prompt
    - Include versioning (v1, v2) and output format specifications
    - Store prompts as constants with clear documentation
    - _Requirements: Tech Stack Section 3.3, Design: Prompt Engineering_
    - _Commit: `feat: create prompt templates for AI agents`_
  
  - [ ]* 6.6 Write property test for AI operation triggers
    - **Property 6: AI Operation Triggers**
    - **Validates: Requirements 2.2, 11.2, 12.2, 15.1, 15.2**
    - Test that AI operations create SQS job and return jobId with status "queued"
    - Verify job is created in DynamoDB jobs table
    - _Commit: `test: add property test for AI operation triggers`_
  
  - [ ]* 6.7 Write property test for caching consistency
    - **Property 11: Caching Consistency**
    - **Validates: Requirements 3.5, 18.2**
    - Test that repeated requests within 24 hours return cached results
    - Verify cache hit/miss behavior with different inputs
    - _Commit: `test: add property test for AI caching`_
  
  - [ ]* 6.8 Write unit tests for AI agents
    - Test Curator Agent repo filtering logic
    - Test Teacher Agent task generation
    - Test cache key generation and TTL behavior
    - Mock Bedrock API responses
    - _Commit: `test: add unit tests for AI agents`_
    - _PR: Create pull request "AI Agent System - Curator and Teacher"_


- [ ] 7. Learning Mode - Technology Selection and Project Curation
  - [ ] 7.1 Build technology selector page
    - Create app/(dashboard)/learning/page.tsx
    - Implement TechnologySelector component with grid of technology cards
    - Display technologies (React, Vue, Next.js, Node.js, Python, Go)
    - Show technology logos, descriptions, difficulty indicators, project count
    - Use exact HTML and Tailwind classes from AWS_project/design.md
    - _Requirements: 2.1, Design: TechnologySelector Component_
    - _Commit: `feat: create technology selector page`_
  
  - [ ] 7.2 Implement project curation workflow
    - Create POST /api/learning/curate API route
    - Trigger Curator Agent to discover GitHub repositories
    - Create job in SQS queue for async processing
    - Return jobId with status "queued" immediately
    - Store job metadata in DynamoDB jobs table
    - _Requirements: 2.2, 2.3, Design: Learning Mode Routes_
    - _Commit: `feat: implement project curation workflow`_
  
  - [ ] 7.3 Create ECS Fargate worker for AI job processing
    - Create worker/index.ts with SQS long-polling (20s wait time)
    - Process jobs from ai-jobs-queue
    - Execute Curator Agent and Teacher Agent based on job type
    - Update job status in DynamoDB (queued → processing → completed/failed)
    - Move failed jobs to DLQ after 3 retries
    - _Requirements: 15.3, 15.6, Tech Stack Section 4.2_
    - _Commit: `feat: create Fargate worker for AI job processing`_
  
  - [ ] 7.4 Build project selection page
    - Create app/(dashboard)/learning/[technology]/page.tsx
    - Display 3 curated projects (Beginner, Intermediate, Advanced)
    - Show ProjectCard components with name, description, estimated time, tech stack, GitHub URL
    - Implement project selection and navigation to workspace
    - Poll job status with JobStatusPoller component
    - _Requirements: 3.1, 3.2, 3.3, Design: ProjectCard Component_
    - _Commit: `feat: create project selection page`_
  
  - [ ] 7.5 Implement API routes for learning mode
    - Create GET /api/learning/technologies to list available technologies
    - Create GET /api/learning/projects/{technology} to fetch curated projects
    - Create GET /api/learning/project/{projectId}/tasks to fetch task list
    - Fetch data from DynamoDB learning_paths table
    - _Requirements: Design: Learning Mode Routes_
    - _Commit: `feat: create learning mode API routes`_
  
  - [ ]* 7.6 Write property test for learning path structure
    - **Property 8: Learning Path Structure**
    - **Validates: Requirements 3.1, 3.2**
    - Test that generated learning paths return exactly 3 projects with required metadata
    - Verify each project has name, description, estimated time, tech stack, GitHub URL
    - _Commit: `test: add property test for learning path structure`_
  
  - [ ]* 7.7 Write property test for repository filtering
    - **Property 10: Repository Filtering**
    - **Validates: Requirements 3.4**
    - Test that all returned repos have >50 stars, activity <6 months, documentation
    - _Commit: `test: add property test for repo filtering`_
  
  - [ ]* 7.8 Write unit tests for learning mode
    - Test technology selector rendering
    - Test project curation API endpoint
    - Test job creation and status updates
    - _Commit: `test: add unit tests for learning mode`_
    - _PR: Create pull request "Learning Mode - Technology Selection"_


- [ ] 8. Learning Mode - Project Workspace with Code Editor
  - [ ] 8.1 Build project workspace layout
    - Create app/(dashboard)/learning/project/[projectId]/page.tsx
    - Implement split-pane layout: task list sidebar (20%), editor (50%), preview (30%)
    - Add toolbar with Run, Save, Deploy, Get Hint buttons
    - Add console output panel (collapsible)
    - Use exact HTML structure from AWS_project/design.md ProjectWorkspace
    - _Requirements: 5.1, 5.2, Design: ProjectWorkspace Component_
    - _Commit: `feat: create project workspace layout`_
  
  - [ ] 8.2 Integrate Monaco Editor
    - Install @monaco-editor/react 4.6+
    - Create MonacoEditor component with syntax highlighting
    - Configure IntelliSense, error detection, line numbers, minimap
    - Implement auto-save with 30-second debounce
    - Support JavaScript, TypeScript, JSX, TSX, JSON, CSS, HTML
    - Use VS Code Dark+ theme
    - _Requirements: 5.3, 5.4, 5.6, Tech Stack Section 1.3, Design: MonacoEditor Component_
    - _Commit: `feat: integrate Monaco Editor with auto-save`_
  
  - [ ] 8.3 Build task list sidebar
    - Create TaskList component with collapsible task items
    - Display task title, description, estimated time, difficulty
    - Show progress indicators and checkboxes for completion
    - Highlight current task
    - Implement task selection and navigation
    - _Requirements: 4.1, 4.2, 4.3, Design: TaskList Component_
    - _Commit: `feat: create task list sidebar`_
  
  - [ ] 8.4 Implement code persistence
    - Create POST /api/learning/project/{projectId}/save API route
    - Save code to S3 bucket (user-projects-{env}/{userId}/{projectId}/code.zip)
    - Store project metadata in DynamoDB projects table
    - Implement versioning (code-v1.zip, code-v2.zip)
    - Support both manual save and auto-save
    - _Requirements: 5.4, 5.6, 5.7, 17.1, 17.2, 17.3, Design: SaveRequest/SaveResponse_
    - _Commit: `feat: implement code persistence with S3 and versioning`_
  
  - [ ] 8.5 Build live preview component
    - Create LivePreview component with iframe sandbox
    - Display loading spinner during execution
    - Show error messages if execution fails
    - Add refresh button and "open in new tab" button
    - Implement responsive viewport selector
    - _Requirements: 6.2, Design: LivePreview Component_
    - _Commit: `feat: create live preview component`_
  
  - [ ] 8.6 Implement progress tracking
    - Calculate completion percentage: (completed tasks / total tasks) * 100
    - Update progress in DynamoDB projects table
    - Display progress bar in workspace header
    - Mark tasks as completed when user checks checkbox
    - _Requirements: 4.6, Design: Property 13 (Progress Calculation)_
    - _Commit: `feat: implement progress tracking`_
  
  - [ ]* 8.7 Write property test for code persistence round trip
    - **Property 14: Code Persistence Round Trip**
    - **Validates: Requirements 5.4, 5.6, 5.7, 17.1, 17.2, 17.3**
    - Test that saving and reloading code restores exact same state
    - Use fast-check to generate random code strings
    - _Commit: `test: add property test for code persistence`_
  
  - [ ]* 8.8 Write property test for progress calculation
    - **Property 13: Progress Calculation**
    - **Validates: Requirements 4.6**
    - Test that progress percentage equals (completed / total) * 100
    - _Commit: `test: add property test for progress calculation`_
  
  - [ ]* 8.9 Write unit tests for workspace components
    - Test Monaco Editor initialization and auto-save
    - Test task list rendering and selection
    - Test code save API endpoint
    - Test progress calculation logic
    - _Commit: `test: add unit tests for workspace components`_
    - _PR: Create pull request "Learning Mode - Project Workspace"_

- [ ] 9. Checkpoint - Verify learning mode end-to-end
  - Ensure all tests pass
  - Verify technology selection → project curation → workspace flow
  - Test code editing, saving, and progress tracking
  - Ask the user if questions arise


- [ ] 10. Code Execution Sandboxes - Lambda and Fargate
  - [ ] 10.1 Set up AWS Lambda for quick code execution
    - Create Lambda function with Node.js 20 runtime
    - Configure 512 MB memory and 15-second timeout
    - Implement code execution with resource limits
    - Block network access except whitelisted APIs
    - Return output, errors, and execution time
    - _Requirements: 6.1, 6.3, 16.2, Tech Stack Section 4.3_
    - _Commit: `feat: create Lambda function for quick code execution`_
  
  - [ ] 10.2 Set up ECS Fargate for full session execution
    - Create Fargate task definition with Node.js 20 Alpine image
    - Configure 1 vCPU, 2 GB memory, 30-minute timeout
    - Implement isolated containers per user
    - Enforce resource limits and automatic cleanup
    - _Requirements: 6.1, 6.7, 16.2, 16.5, Tech Stack Section 4.3_
    - _Commit: `feat: create Fargate task for full session execution`_
  
  - [ ] 10.3 Create sandbox execution API route
    - Create POST /api/sandbox/execute API route
    - Determine execution type (Lambda for <15s, Fargate for longer)
    - Execute code in isolated sandbox
    - Capture output, errors, and execution time
    - Return preview URL for web applications
    - _Requirements: 6.1, 6.2, 6.3, Design: ExecuteRequest/ExecuteResponse_
    - _Commit: `feat: create sandbox execution API route`_
  
  - [ ] 10.4 Implement sandbox security measures
    - Block outbound network connections except whitelisted APIs
    - Restrict file system access (read-only)
    - Prevent access to environment variables
    - Enforce timeout limits (15s Lambda, 30min Fargate)
    - Automatic cleanup after execution
    - _Requirements: 16.2, 16.3, 16.5, Design: Sandbox Security_
    - _Commit: `feat: implement sandbox security measures`_
  
  - [ ]* 10.5 Write property test for code execution isolation
    - **Property 15: Code Execution Isolation**
    - **Validates: Requirements 6.1, 16.2, 16.5**
    - Test that code runs in isolated sandbox with enforced resource limits
    - Verify automatic cleanup after completion
    - _Commit: `test: add property test for execution isolation`_
  
  - [ ]* 10.6 Write property test for timeout enforcement
    - **Property 17: Timeout Enforcement**
    - **Validates: Requirements 6.7**
    - Test that execution exceeding timeout is terminated with error
    - _Commit: `test: add property test for timeout enforcement`_
  
  - [ ]* 10.7 Write property test for network isolation
    - **Property 32: Sandbox Network Isolation**
    - **Validates: Requirements 16.3**
    - Test that network access is blocked except whitelisted APIs
    - _Commit: `test: add property test for network isolation`_
  
  - [ ]* 10.8 Write unit tests for sandbox execution
    - Test Lambda execution with simple code
    - Test Fargate execution with complex builds
    - Test error handling and timeout scenarios
    - _Commit: `test: add unit tests for sandbox execution`_
    - _PR: Create pull request "Code Execution Sandboxes"_


- [ ] 11. AI Mentor Chat System
  - [ ] 11.1 Create Mentor Agent for Q&A and explanations
    - Create lib/agents/mentor.ts with MentorAgent class
    - Use Claude 3.5 Sonnet for conversational responses
    - Implement context-aware responses (current task, code)
    - Support streaming responses for perceived speed
    - Maintain conversation history for follow-ups
    - _Requirements: 7.1, 7.2, 7.5, Design: Mentor Agent_
    - _Commit: `feat: implement Mentor Agent for Q&A`_
  
  - [ ] 11.2 Build AI Mentor chat component
    - Create AIMentorChat component with message bubbles
    - Display user/AI messages with distinct styling
    - Add input field with send button
    - Implement quick action buttons (Explain, Find Bugs, Optimize)
    - Show typing indicator during AI response
    - Support streaming responses with real-time updates
    - _Requirements: 7.1, 7.2, 7.4, Design: AIMentorChat Component_
    - _Commit: `feat: create AI Mentor chat component`_
  
  - [ ] 11.3 Create API route for AI Mentor chat
    - Create POST /api/ai/mentor/chat API route
    - Accept user message and context (current task, code)
    - Execute Mentor Agent with conversation history
    - Stream response back to client using Server-Sent Events (SSE)
    - Store conversation in session state
    - _Requirements: 7.3, Design: AI Mentor Chat API_
    - _Commit: `feat: create AI Mentor chat API route`_
  
  - [ ]* 11.4 Write property test for AI response performance
    - **Property 18: AI Response Performance**
    - **Validates: Requirements 7.3**
    - Test that AI Mentor responds within 3 seconds
    - _Commit: `test: add property test for AI response time`_
  
  - [ ]* 11.5 Write property test for conversation context
    - **Property 19: Conversation Context Maintenance**
    - **Validates: Requirements 7.5**
    - Test that follow-up questions maintain conversation context
    - _Commit: `test: add property test for conversation context`_
  
  - [ ]* 11.6 Write unit tests for AI Mentor
    - Test Mentor Agent response generation
    - Test chat component rendering and interactions
    - Test streaming response handling
    - _Commit: `test: add unit tests for AI Mentor`_
    - _PR: Create pull request "AI Mentor Chat System"_


- [ ] 12. Project Deployment and Portfolio
  - [ ] 12.1 Implement Vercel deployment integration
    - Create lib/deployment/vercel.ts with Vercel API client
    - Implement OAuth flow for Vercel authentication
    - Create deployment function to push code to Vercel
    - Poll deployment status until ready
    - Return live deployment URL
    - _Requirements: 8.1, 8.2, 8.3, Tech Stack Section 6.2_
    - _Commit: `feat: integrate Vercel deployment API`_
  
  - [ ] 12.2 Create deployment API route
    - Create POST /api/sandbox/deploy API route
    - Accept projectId and platform (vercel, netlify)
    - Fetch project code from S3
    - Trigger deployment to selected platform
    - Update project record with deployment URL
    - _Requirements: 8.4, Design: DeployRequest/DeployResponse_
    - _Commit: `feat: create deployment API route`_
  
  - [ ] 12.3 Build portfolio page
    - Create app/(dashboard)/portfolio/page.tsx
    - Display all completed projects in grid layout
    - Show project name, description, tech stack, GitHub link, live demo link
    - Add filters by technology and completion date
    - Use exact HTML and styling from AWS_project/design.md
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
    - _Commit: `feat: create portfolio page`_
  
  - [ ] 12.4 Implement portfolio API route
    - Create GET /api/portfolio/{userId} API route
    - Fetch completed projects from DynamoDB projects table
    - Filter by status = 'completed'
    - Return project metadata with deployment URLs
    - _Requirements: 9.3, 9.5_
    - _Commit: `feat: create portfolio API route`_
  
  - [ ]* 12.5 Write property test for deployment round trip
    - **Property 20: Deployment Round Trip**
    - **Validates: Requirements 8.4, 8.5**
    - Test that deployment provides live URL within 2 minutes
    - Verify deployed project is accessible and added to portfolio
    - _Commit: `test: add property test for deployment`_
  
  - [ ]* 12.6 Write property test for portfolio completeness
    - **Property 21: Portfolio Completeness**
    - **Validates: Requirements 9.3, 9.5**
    - Test that portfolio displays all completed projects with required metadata
    - _Commit: `test: add property test for portfolio`_
  
  - [ ]* 12.7 Write unit tests for deployment
    - Test Vercel API integration
    - Test deployment status polling
    - Test portfolio page rendering
    - _Commit: `test: add unit tests for deployment`_
    - _PR: Create pull request "Project Deployment and Portfolio"_

- [ ] 13. Checkpoint - Verify learning mode complete
  - Ensure all tests pass
  - Verify end-to-end flow: select tech → curate → code → execute → deploy → portfolio
  - Test AI Mentor chat functionality
  - Ask the user if questions arise


- [ ] 14. Developer Mode - Template Library and Extraction
  - [ ] 14.1 Build template library page
    - Create app/(dashboard)/developer/templates/page.tsx
    - Display grid of TemplateCard components
    - Implement search bar with keyword filtering
    - Add technology filters (React, Vue, Node.js, etc.)
    - Add category filters (Authentication, UI Components, etc.)
    - Implement sort options (rating, downloads, recent)
    - Add pagination for large result sets
    - _Requirements: 10.1, 10.2, Design: TemplateLibrary Component_
    - _Commit: `feat: create template library page`_
  
  - [ ] 14.2 Create Code Agent for template extraction
    - Create lib/agents/code.ts with CodeAgent class
    - Use Claude 3.5 Sonnet for AST analysis
    - Parse source code into Abstract Syntax Tree
    - Identify self-contained components and dependencies
    - Extract reusable templates with proper imports
    - _Requirements: 11.4, 11.5, Design: Code Agent_
    - _Commit: `feat: implement Code Agent for template extraction`_
  
  - [ ] 14.3 Build template extractor page
    - Create app/(dashboard)/developer/extract/page.tsx
    - Add GitHub URL input with validation
    - Implement analysis trigger button
    - Display component suggestion list from AI analysis
    - Show component preview with syntax highlighting
    - Add "Extract" button to save template
    - _Requirements: 11.1, 11.2, Design: TemplateExtractor Component_
    - _Commit: `feat: create template extractor page`_
  
  - [ ] 14.4 Implement template extraction API routes
    - Create POST /api/developer/extract API route
    - Validate GitHub URL format (https://github.com/{owner}/{repo})
    - Create job in SQS queue for async processing
    - Execute Code Agent to analyze repository
    - Extract templates and save to S3 templates bucket
    - Store template metadata in DynamoDB templates table
    - _Requirements: 11.1, 11.2, 11.3, 11.6, Design: ExtractRequest/ExtractResponse_
    - _Commit: `feat: create template extraction API routes`_
  
  - [ ] 14.5 Create template library API routes
    - Create GET /api/developer/templates API route
    - Support query parameters (technology, category, search, page, limit)
    - Fetch templates from DynamoDB templates table
    - Use technology-rating-index GSI for sorted queries
    - Return paginated results with metadata
    - _Requirements: 10.2, 10.3, 10.4, Design: TemplatesRequest/TemplatesResponse_
    - _Commit: `feat: create template library API routes`_
  
  - [ ]* 14.6 Write property test for URL validation
    - **Property 24: URL Validation**
    - **Validates: Requirements 11.1**
    - Test that valid GitHub URLs are accepted and invalid formats rejected
    - _Commit: `test: add property test for URL validation`_
  
  - [ ]* 14.7 Write property test for template extraction persistence
    - **Property 25: Template Extraction Persistence**
    - **Validates: Requirements 11.6**
    - Test that extracted templates are saved and available in library
    - _Commit: `test: add property test for template persistence`_
  
  - [ ]* 14.8 Write property test for search and filter consistency
    - **Property 23: Search and Filter Consistency**
    - **Validates: Requirements 10.3, 10.4**
    - Test that search results match all specified criteria
    - _Commit: `test: add property test for search filtering`_
  
  - [ ]* 14.9 Write unit tests for template extraction
    - Test Code Agent AST parsing
    - Test GitHub URL validation
    - Test template library filtering and pagination
    - _Commit: `test: add unit tests for template extraction`_
    - _PR: Create pull request "Developer Mode - Template Library"_


- [ ] 15. Developer Mode - Code Integration and Undo
  - [ ] 15.1 Enhance Code Agent for context-aware integration
    - Extend lib/agents/code.ts with integration capabilities
    - Analyze target project structure and patterns
    - Generate integration code with proper imports and adaptations
    - Create diff showing additions, deletions, and modifications
    - Provide AI explanation of changes
    - _Requirements: 12.3, 12.4, 12.6, Design: Code Agent_
    - _Commit: `feat: enhance Code Agent for context-aware integration`_
  
  - [ ] 15.2 Build integration workspace page
    - Create app/(dashboard)/developer/integrate/[jobId]/page.tsx
    - Implement split diff view (before/after)
    - Add syntax highlighting for code changes
    - Highlight additions (green) and deletions (red)
    - Show live preview of integrated code
    - Add "Approve" and "Undo" buttons
    - Display AI explanation panel
    - _Requirements: 12.7, 12.8, Design: IntegrationWorkspace Component_
    - _Commit: `feat: create integration workspace page`_
  
  - [ ] 15.3 Implement integration API routes
    - Create POST /api/developer/integrate API route
    - Accept templateId and projectId
    - Create job in SQS queue for async processing
    - Execute Code Agent to generate integration code
    - Store integration preview in DynamoDB integrations table
    - _Requirements: 12.2, 12.3, Design: IntegrateRequest/IntegrateResponse_
    - _Commit: `feat: create integration API routes`_
  
  - [ ] 15.4 Create integration preview API route
    - Create GET /api/developer/integration/{jobId}/preview API route
    - Fetch integration diff from DynamoDB
    - Return additions, deletions, file changes
    - Include preview URL and AI explanation
    - _Requirements: 12.6, Design: IntegrationPreviewResponse_
    - _Commit: `feat: create integration preview API route`_
  
  - [ ] 15.5 Implement integration approval and undo
    - Create POST /api/developer/integration/{jobId}/approve API route
    - Apply integration changes to project code in S3
    - Update project metadata in DynamoDB
    - Mark integration as 'approved' in integrations table
    - Create POST /api/developer/integration/{jobId}/undo API route
    - Restore project to previous state from S3 versioning
    - Mark integration as 'undone' in integrations table
    - _Requirements: 12.8, 12.9, Design: ApproveResponse_
    - _Commit: `feat: implement integration approval and undo`_
  
  - [ ]* 15.6 Write property test for integration undo round trip
    - **Property 26: Integration Undo Round Trip**
    - **Validates: Requirements 12.9**
    - Test that undo restores project to exact previous state
    - Use fast-check to generate random code and templates
    - _Commit: `test: add property test for integration undo`_
  
  - [ ]* 15.7 Write unit tests for code integration
    - Test Code Agent integration logic
    - Test diff generation
    - Test approval and undo functionality
    - _Commit: `test: add unit tests for code integration`_
    - _PR: Create pull request "Developer Mode - Code Integration"_


- [ ] 16. Rate Limiting and Usage Tracking
  - [ ] 16.1 Implement rate limiting middleware
    - Create lib/rate-limit/index.ts with rate limiting logic
    - Use DynamoDB to track request counts per user
    - Enforce limits: 100 req/hour (free), 1000 req/hour (paid)
    - Return HTTP 429 with retry-after header when limit exceeded
    - Implement exponential backoff for repeated violations
    - _Requirements: 13.6, Design: Property 27 (Rate Limit Enforcement)_
    - _Commit: `feat: implement rate limiting middleware`_
  
  - [ ] 16.2 Create usage tracking for integrations
    - Track integration count per user per month in DynamoDB
    - Use userId-month-index GSI for efficient queries
    - Enforce limit: 5 integrations/month (free), unlimited (paid)
    - Reset counter on first day of new month
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
    - _Commit: `feat: implement integration usage tracking`_
  
  - [ ] 16.3 Build usage meter component
    - Create UsageMeter component showing X/5 integrations
    - Display progress bar with color coding (green → yellow → red)
    - Show warning at 4/5 integrations
    - Display upgrade CTA at 5/5 integrations
    - Show reset date for free users
    - _Requirements: 13.5, Design: UsageMeter Component_
    - _Commit: `feat: create usage meter component`_
  
  - [ ] 16.4 Create usage API route
    - Create GET /api/developer/usage/{userId} API route
    - Fetch integration count from DynamoDB integrations table
    - Calculate usage for current month
    - Return usage, limit, reset date, and tier
    - _Requirements: 13.5, Design: UsageResponse_
    - _Commit: `feat: create usage tracking API route`_
  
  - [ ]* 16.5 Write property test for rate limit enforcement
    - **Property 27: Rate Limit Enforcement**
    - **Validates: Requirements 13.6**
    - Test that requests exceeding limit return HTTP 429
    - _Commit: `test: add property test for rate limiting`_
  
  - [ ]* 16.6 Write property test for monthly integration reset
    - **Property 28: Monthly Integration Reset**
    - **Validates: Requirements 13.4**
    - Test that integration counter resets on new month
    - _Commit: `test: add property test for monthly reset`_
  
  - [ ]* 16.7 Write unit tests for rate limiting
    - Test rate limit calculation and enforcement
    - Test usage tracking and reset logic
    - Test usage meter display
    - _Commit: `test: add unit tests for rate limiting`_
    - _PR: Create pull request "Rate Limiting and Usage Tracking"_

- [ ] 17. Checkpoint - Verify developer mode complete
  - Ensure all tests pass
  - Verify end-to-end flow: browse templates → extract → integrate → undo
  - Test rate limiting and usage tracking
  - Ask the user if questions arise


- [ ] 18. Subscription and Payment System (Phase 2)
  - [ ] 18.1 Integrate Stripe API
    - Install Stripe SDK and configure API keys
    - Create lib/payment/stripe.ts with Stripe client
    - Define subscription products (Pro: $19/mo, Team: $99/mo)
    - Implement checkout session creation
    - _Requirements: 14.1, 14.2, Tech Stack Section 6.3_
    - _Commit: `feat: integrate Stripe payment API`_
  
  - [ ] 18.2 Build pricing page
    - Create app/(marketing)/pricing/page.tsx
    - Display three tiers (Hobby: $0, Pro: $19, Team: $99)
    - Show feature comparison table
    - Add "Get Started" buttons with Stripe checkout links
    - Use exact HTML and styling from AWS_project/design.md
    - _Requirements: 14.1, Design: Pricing section_
    - _Commit: `feat: create pricing page`_
  
  - [ ] 18.3 Implement subscription API routes
    - Create POST /api/subscription/checkout API route
    - Create Stripe checkout session
    - Handle successful payment webhook
    - Update user tier in DynamoDB users table
    - Grant access to paid features immediately
    - _Requirements: 14.2, 14.3_
    - _Commit: `feat: create subscription API routes`_
  
  - [ ] 18.4 Create subscription management page
    - Create app/(dashboard)/settings/subscription/page.tsx
    - Display current plan and billing information
    - Add "Upgrade" and "Cancel" buttons
    - Integrate Stripe Customer Portal for self-service billing
    - _Requirements: 14.4, 14.5_
    - _Commit: `feat: create subscription management page`_
  
  - [ ]* 18.5 Write property test for subscription tier update
    - **Property 29: Subscription Tier Update**
    - **Validates: Requirements 14.3**
    - Test that successful payment updates user tier immediately
    - _Commit: `test: add property test for tier update`_
  
  - [ ]* 18.6 Write unit tests for payment system
    - Test Stripe checkout session creation
    - Test webhook handling
    - Test tier update logic
    - _Commit: `test: add unit tests for payment system`_
    - _PR: Create pull request "Subscription and Payment System"_


- [ ] 19. Monitoring, Logging, and Error Handling
  - [ ] 19.1 Set up CloudWatch logging
    - Configure structured logging with Winston or Pino
    - Create log groups for API routes and workers
    - Log all API requests (method, path, status, duration, userId)
    - Set retention policy (7 days dev, 30 days prod)
    - _Requirements: 19.1, Tech Stack Section 7.1_
    - _Commit: `feat: set up CloudWatch logging`_
  
  - [ ] 19.2 Integrate Sentry for error tracking
    - Install Sentry Next.js SDK
    - Configure Sentry DSN and environment
    - Capture errors with user context and stack traces
    - Set up source maps for production debugging
    - Configure Slack notifications for critical errors
    - _Requirements: 19.2, Tech Stack Section 7.2_
    - _Commit: `feat: integrate Sentry error tracking`_
  
  - [ ] 19.3 Implement consistent error handling
    - Create lib/errors/index.ts with error classes
    - Define error response format (code, message, details, timestamp, requestId)
    - Implement error categories (401, 403, 400, 404, 500, 502, 503)
    - Add user-friendly error messages
    - _Requirements: Design: Error Handling section_
    - _Commit: `feat: implement consistent error handling`_
  
  - [ ] 19.4 Set up CloudWatch dashboards and alarms
    - Create dashboard for API response times (P50, P95, P99)
    - Create dashboard for error rates by endpoint
    - Create dashboard for AI operation success rates
    - Set up alarms: API response >3s, error rate >2%, queue depth >100
    - Configure Slack notifications for alarms
    - _Requirements: Design: Monitoring and Alerting_
    - _Commit: `feat: set up CloudWatch dashboards and alarms`_
  
  - [ ]* 19.5 Write property test for request logging
    - **Property 35: Request Logging**
    - **Validates: Requirements 19.1**
    - Test that all API requests are logged to CloudWatch
    - _Commit: `test: add property test for request logging`_
  
  - [ ]* 19.6 Write property test for error reporting
    - **Property 36: Error Reporting**
    - **Validates: Requirements 19.2**
    - Test that errors are sent to Sentry with context
    - _Commit: `test: add property test for error reporting`_
  
  - [ ]* 19.7 Write unit tests for error handling
    - Test error response format
    - Test error categorization
    - Test user-friendly message generation
    - _Commit: `test: add unit tests for error handling`_
    - _PR: Create pull request "Monitoring and Error Handling"_


- [ ] 20. Onboarding Flow and User Experience
  - [ ] 20.1 Build onboarding wizard
    - Create app/(auth)/onboarding/page.tsx
    - Implement multi-step wizard (Welcome → Profile → Preferences → Complete)
    - Collect user information (name, avatar, interests)
    - Set user preferences (theme, notifications)
    - Mark onboarding as complete in DynamoDB
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
    - _Commit: `feat: create onboarding wizard`_
  
  - [ ] 20.2 Create landing page
    - Create app/page.tsx using exact HTML from AWS_project/design.md
    - Implement hero section with gradient text and animations
    - Add "Learning Mode" and "Developer Mode" feature sections
    - Add "How It Works" section with 3-step process
    - Add pricing section with tier comparison
    - Add footer with links and social media
    - _Requirements: Design: Landing Page template_
    - _Commit: `feat: create landing page`_
  
  - [ ] 20.3 Implement theme toggle (dark/light mode)
    - Create theme context provider
    - Add theme toggle button in navbar
    - Store preference in localStorage and DynamoDB
    - Apply theme classes to all components
    - _Requirements: User preferences_
    - _Commit: `feat: implement theme toggle`_
  
  - [ ] 20.4 Add loading states and skeletons
    - Create skeleton components for cards, lists, editor
    - Add loading spinners for async operations
    - Implement optimistic UI updates
    - Show progress indicators for long-running tasks
    - _Requirements: User experience_
    - _Commit: `feat: add loading states and skeletons`_
  
  - [ ]* 20.5 Write property test for onboarding completion
    - **Property 37: Onboarding Completion State**
    - **Validates: Requirements 20.6**
    - Test that completed onboarding is not shown again
    - _Commit: `test: add property test for onboarding`_
  
  - [ ]* 20.6 Write unit tests for onboarding
    - Test wizard step navigation
    - Test preference saving
    - Test theme toggle functionality
    - _Commit: `test: add unit tests for onboarding`_
    - _PR: Create pull request "Onboarding and User Experience"_


- [ ] 21. Performance Optimization and Caching
  - [ ] 21.1 Implement frontend code splitting
    - Use dynamic imports for large components (Monaco Editor)
    - Implement route-based code splitting
    - Lazy load images with Next.js Image component
    - Configure webpack bundle analyzer
    - Target bundle size: <200 KB gzipped
    - _Requirements: Design: Frontend Optimization_
    - _Commit: `feat: implement code splitting and lazy loading`_
  
  - [ ] 21.2 Set up TanStack Query for API caching
    - Configure TanStack Query with staleTime (5 min), cacheTime (10 min)
    - Implement query keys for all API endpoints
    - Add background refetching for stale data
    - Implement optimistic updates for mutations
    - _Requirements: Tech Stack Section 1.4_
    - _Commit: `feat: set up TanStack Query for caching`_
  
  - [ ] 21.3 Optimize database queries
    - Use GSIs for common query patterns
    - Implement batch operations for bulk writes
    - Add pagination for large result sets
    - Use DynamoDB TTL for temporary data
    - _Requirements: Design: Backend Optimization_
    - _Commit: `feat: optimize database queries`_
  
  - [ ] 21.4 Configure CloudFront CDN
    - Set up CloudFront distribution for S3 assets
    - Configure cache policies (1 day for static assets)
    - Enable gzip compression
    - Set up custom domain with SSL certificate
    - _Requirements: Design: Performance Optimization_
    - _Commit: `feat: configure CloudFront CDN`_
  
  - [ ]* 21.5 Write performance tests
    - Test API response times (<3s P95)
    - Test bundle size (<200 KB gzipped)
    - Test database query performance (<100ms)
    - _Commit: `test: add performance tests`_
    - _PR: Create pull request "Performance Optimization"_

- [ ] 22. Checkpoint - Verify performance and monitoring
  - Ensure all tests pass
  - Verify API response times meet targets
  - Check CloudWatch dashboards and alarms
  - Test error tracking with Sentry
  - Ask the user if questions arise


- [ ] 23. Security Hardening and Compliance
  - [ ] 23.1 Implement security best practices
    - Store JWT tokens in httpOnly cookies with SameSite=Strict
    - Add CSRF protection with tokens for state-changing operations
    - Sanitize user input to prevent XSS attacks
    - Validate all API inputs with Zod schemas
    - Implement Content Security Policy (CSP) headers
    - _Requirements: Design: Security Considerations_
    - _Commit: `feat: implement security best practices`_
  
  - [ ] 23.2 Set up secrets management
    - Store all secrets in AWS Secrets Manager
    - Configure automatic secret rotation (90 days)
    - Use IAM roles for AWS service access (no hardcoded credentials)
    - Remove any hardcoded secrets from codebase
    - _Requirements: Tech Stack Section 8.1_
    - _Commit: `feat: set up secrets management`_
  
  - [ ] 23.3 Implement data encryption
    - Enable S3 bucket encryption (AES-256)
    - Enable DynamoDB encryption with AWS KMS
    - Enforce HTTPS/TLS 1.3 for all connections
    - Encrypt sensitive data in database (email addresses)
    - _Requirements: Design: Data Security_
    - _Commit: `feat: implement data encryption`_
  
  - [ ] 23.4 Add GDPR compliance features
    - Create data export API for user data
    - Implement data deletion on user request
    - Add cookie consent banner
    - Create privacy policy page
    - _Requirements: Design: Compliance (GDPR)_
    - _Commit: `feat: add GDPR compliance features`_
  
  - [ ] 23.5 Create Terms of Service and Privacy Policy
    - Write Terms of Service document
    - Write Privacy Policy document
    - Add links in footer
    - Require acceptance during signup
    - _Requirements: Tech Stack Section 8.2_
    - _Commit: `docs: add Terms of Service and Privacy Policy`_
  
  - [ ]* 23.6 Write security tests
    - Test CSRF protection
    - Test XSS prevention
    - Test input validation
    - Test authentication and authorization
    - _Commit: `test: add security tests`_
    - _PR: Create pull request "Security Hardening"_


- [ ] 24. End-to-End Testing and Quality Assurance
  - [ ] 24.1 Write E2E tests for Learning Mode
    - Test complete flow: login → select tech → curate → code → execute → deploy
    - Test Monaco Editor interactions
    - Test AI Mentor chat
    - Test task completion and progress tracking
    - Use Playwright with Chromium, Firefox, WebKit
    - _Requirements: Design: E2E Test Examples_
    - _Commit: `test: add E2E tests for Learning Mode`_
  
  - [ ] 24.2 Write E2E tests for Developer Mode
    - Test complete flow: login → browse templates → extract → integrate → undo
    - Test template search and filtering
    - Test integration preview and approval
    - Test usage tracking and rate limiting
    - _Requirements: Design: E2E Test Examples_
    - _Commit: `test: add E2E tests for Developer Mode`_
  
  - [ ] 24.3 Write E2E tests for authentication
    - Test signup with email/password
    - Test login with OAuth (GitHub, Google)
    - Test token refresh
    - Test logout and session invalidation
    - _Requirements: Design: E2E Test Examples_
    - _Commit: `test: add E2E tests for authentication`_
  
  - [ ] 24.4 Set up CI/CD pipeline
    - Create GitHub Actions workflow for CI
    - Run linting (ESLint + Prettier)
    - Run unit tests (Vitest)
    - Run property-based tests (fast-check)
    - Run integration tests
    - Run E2E tests (Playwright)
    - Run build verification
    - _Requirements: Tech Stack Section 4.4_
    - _Commit: `chore: set up CI/CD pipeline`_
  
  - [ ] 24.5 Configure test coverage reporting
    - Set up Vitest coverage with v8 provider
    - Set coverage thresholds (70% lines, functions, branches, statements)
    - Generate HTML coverage reports
    - Fail CI if coverage below threshold
    - _Requirements: Design: Test Coverage Goals_
    - _Commit: `chore: configure test coverage reporting`_
  
  - [ ]* 24.6 Verify all property tests pass
    - Run all 37 property tests with 100 iterations each
    - Verify no flaky tests
    - Document any known issues
    - _Commit: `test: verify all property tests pass`_
    - _PR: Create pull request "E2E Testing and QA"_

- [ ] 25. Checkpoint - Verify all tests pass
  - Run complete test suite (unit, property, integration, E2E)
  - Verify test coverage meets 70% threshold
  - Check CI/CD pipeline passes
  - Ask the user if questions arise


- [ ] 26. Documentation and Developer Experience
  - [ ] 26.1 Write API documentation
    - Create OpenAPI/Swagger specification for all API endpoints
    - Document request/response schemas
    - Add example requests and responses
    - Document error codes and meanings
    - Host documentation with Swagger UI
    - _Requirements: Tech Stack Section 13_
    - _Commit: `docs: create API documentation`_
  
  - [ ] 26.2 Create README and setup guide
    - Write comprehensive README.md with project overview
    - Document prerequisites (Node.js 20, AWS account, etc.)
    - Add step-by-step setup instructions
    - Document environment variables
    - Add troubleshooting section
    - _Requirements: Tech Stack Section 13_
    - _Commit: `docs: create README and setup guide`_
  
  - [ ] 26.3 Document architecture and design decisions
    - Create ARCHITECTURE.md with system diagrams
    - Document hybrid architecture rationale
    - Document technology choices (ADRs)
    - Add data model documentation
    - Document AI agent system
    - _Requirements: Design: Architecture section_
    - _Commit: `docs: document architecture and design`_
  
  - [ ] 26.4 Create developer guides
    - Write CONTRIBUTING.md with contribution guidelines
    - Document Git workflow and commit conventions
    - Add code style guide
    - Document testing strategy
    - Add deployment guide
    - _Requirements: Design: Development Workflow_
    - _Commit: `docs: create developer guides`_
  
  - [ ] 26.5 Add inline code documentation
    - Add JSDoc comments to all public functions
    - Document complex algorithms and logic
    - Add README.md to major directories
    - Document component props and usage
    - _Requirements: Tech Stack Section 13_
    - _Commit: `docs: add inline code documentation`_
    - _PR: Create pull request "Documentation"_


- [ ] 27. AWS Deployment and Production Setup
  - [ ] 27.1 Deploy CDK stacks to production
    - Review and update CDK stack configurations for production
    - Deploy DynamoDB tables with production capacity settings
    - Deploy S3 buckets with production lifecycle policies
    - Deploy Cognito User Pools with production settings
    - Deploy SQS queues with production alarms
    - Verify all resources created successfully
    - _Requirements: Design: Deployment Architecture_
    - _Commit: `chore: deploy AWS infrastructure to production`_
  
  - [ ] 27.2 Deploy Fargate workers to production
    - Build Docker image for AI workers
    - Push image to Amazon ECR
    - Create ECS cluster and task definition
    - Configure auto-scaling (0-10 tasks based on queue depth)
    - Set up CloudWatch logs for workers
    - Verify workers process jobs successfully
    - _Requirements: Tech Stack Section 4.2_
    - _Commit: `chore: deploy Fargate workers to production`_
  
  - [ ] 27.3 Deploy Next.js app to Vercel
    - Connect GitHub repository to Vercel
    - Configure environment variables in Vercel dashboard
    - Set up custom domain with SSL certificate
    - Configure production and preview deployments
    - Enable Vercel Analytics
    - Verify deployment successful
    - _Requirements: Tech Stack Section 4.1_
    - _Commit: `chore: deploy Next.js app to Vercel`_
  
  - [ ] 27.4 Configure production monitoring
    - Set up CloudWatch dashboards for production
    - Configure alarms with Slack notifications
    - Set up UptimeRobot for uptime monitoring
    - Configure Sentry for production error tracking
    - Set up billing alerts ($100, $250, $500)
    - _Requirements: Design: Monitoring and Alerting_
    - _Commit: `chore: configure production monitoring`_
  
  - [ ] 27.5 Run production smoke tests
    - Test authentication flows (signup, login, OAuth)
    - Test Learning Mode end-to-end
    - Test Developer Mode end-to-end
    - Test AI operations and job processing
    - Test deployment and portfolio
    - Verify all critical paths work
    - _Requirements: Design: Deployment Process_
    - _Commit: `test: run production smoke tests`_
  
  - [ ] 27.6 Set up database backups
    - Enable DynamoDB point-in-time recovery
    - Configure S3 bucket versioning and lifecycle policies
    - Set up automated backup schedule
    - Document restore procedures
    - _Requirements: Data persistence and recovery_
    - _Commit: `chore: set up database backups`_
    - _PR: Create pull request "Production Deployment"_

- [ ] 28. Final Checkpoint - Production Readiness
  - Verify all production services are running
  - Check monitoring dashboards and alarms
  - Run complete smoke test suite
  - Verify backups are configured
  - Review security checklist
  - Ask the user if questions arise


- [ ] 29. Post-Launch Optimization and Monitoring
  - [ ] 29.1 Monitor production metrics
    - Review CloudWatch dashboards daily
    - Check error rates and response times
    - Monitor AI operation success rates
    - Track user engagement metrics
    - Review cost and usage reports
    - _Requirements: Design: Monitoring and Alerting_
    - _Commit: `chore: set up production monitoring routine`_
  
  - [ ] 29.2 Optimize based on real usage
    - Identify slow API endpoints and optimize
    - Adjust cache TTLs based on hit rates
    - Optimize AI prompts based on quality feedback
    - Tune auto-scaling parameters
    - Reduce costs where possible
    - _Requirements: Design: Performance Optimization, Cost Optimization_
    - _Commit: `perf: optimize based on production metrics`_
  
  - [ ] 29.3 Implement user feedback collection
    - Add feedback widget to dashboard
    - Create feedback submission API
    - Set up feedback review process
    - Track feature requests and bug reports
    - _Requirements: User experience_
    - _Commit: `feat: add user feedback collection`_
  
  - [ ] 29.4 Plan Phase 2 features
    - Review user feedback and analytics
    - Prioritize feature requests
    - Plan subscription system enhancements
    - Plan additional AI capabilities
    - Document Phase 2 roadmap
    - _Requirements: Future enhancements_
    - _Commit: `docs: create Phase 2 roadmap`_
    - _PR: Create pull request "Post-Launch Optimization"_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties from design document
- Unit tests validate specific examples and edge cases
- All code must strictly adhere to AWS_project/tech_stack.md versions (MANDATORY)
- All UI must use exact HTML templates and Tailwind classes from AWS_project/design.md
- Use conventional commits for all changes (feat:, fix:, docs:, chore:, test:)
- Create pull requests at the end of each major task group

## Git Workflow

**Conventional Commits:**
- `feat:` New feature implementation
- `fix:` Bug fix
- `docs:` Documentation changes
- `chore:` Infrastructure, configuration, dependencies
- `test:` Test additions or modifications
- `perf:` Performance improvements

**Pull Request Process:**
1. Create feature branch from main
2. Implement task(s) with conventional commits
3. Run all tests locally (lint, unit, property, integration)
4. Push branch and create pull request
5. Request review (if team)
6. Merge to main after approval
7. Delete feature branch

## Success Criteria

**MVP Launch Checklist:**
- [ ] All authentication flows working (email, GitHub, Google OAuth)
- [ ] Learning Mode: Technology selection → project curation → coding → deployment
- [ ] Developer Mode: Template browsing → extraction → integration → undo
- [ ] AI Mentor chat functional with <3s response time
- [ ] Code execution sandboxes working (Lambda + Fargate)
- [ ] Rate limiting and usage tracking enforced
- [ ] All 37 property tests passing with 100 iterations
- [ ] Test coverage ≥70% (lines, functions, branches, statements)
- [ ] All E2E tests passing (Learning Mode, Developer Mode, Auth)
- [ ] Production deployment successful on Vercel + AWS
- [ ] Monitoring and alerting configured
- [ ] Security hardening complete (HTTPS, encryption, CSRF, XSS)
- [ ] Documentation complete (README, API docs, architecture)

**Performance Targets:**
- API response time: <3 seconds (P95)
- AI operations: <10 seconds (curation), <30 seconds (extraction)
- Bundle size: <200 KB gzipped
- Database queries: <100ms
- Uptime: >99% (monitored by UptimeRobot)

**Cost Targets:**
- MVP Phase: $0 (within AWS credits)
- Post-Credits: $500-1000/month
- Break-even: 30-50 paid subscribers

