# Product Requirements Document (PRD)
# AI Learning & Developer Productivity Platform

**Document Version:** 1.0  
**Date:** February 25, 2026  
**Status:** Draft  
**Author:** Product Team  
**Related Documents:** Understanding.md, Design_Explore.md

---

## 1. Executive Summary

### Problem Statement
Developers face two critical challenges: (1) learning new technologies is time-consuming and lacks hands-on practice with real-world projects, and (2) integrating reusable code components from open-source projects is manual, error-prone, and slows development velocity. Current solutions either focus on theoretical learning without practical application or require developers to manually search, extract, and adapt code templates.

### Proposed Solution
An AI-powered dual-mode platform that enables developers to learn technologies by reconstructing real GitHub projects step-by-step (Learning Mode) and accelerates development by intelligently extracting and integrating code templates from any open-source repository (Developer Mode). The platform uses agentic AI to curate projects, generate personalized learning paths, extract reusable components, and perform context-aware code integration with live preview.

### Business Impact
- **Revenue Stream:** Freemium model with Developer Pro ($19/mo) and Team ($99/mo) subscriptions, plus Template Marketplace (20% platform fee)
- **Market Opportunity:** Targeting 10M+ developers learning new frameworks annually and professional developers seeking productivity tools
- **Competitive Advantage:** Only platform combining AI-powered learning-by-building with intelligent template integration

### Timeline
- **Phase 1 (MVP):** Weeks 1-8 - Learning Mode + Free Developer Mode
- **Phase 2 (Monetization):** Weeks 9-12 - Paid tiers, optimization, WebSocket
- **Phase 3 (Scale):** Post-MVP - Template Marketplace, team features, additional languages

### Resources Required
- **Team:** 2-3 full-stack engineers, 1 product manager, 1 designer
- **Budget:** AWS credits (MVP phase), $500-1000/mo post-credits
- **Infrastructure:** AWS (Bedrock, Lambda, Fargate, DynamoDB, S3), Vercel, Stripe

### Success Metrics
- **3 months:** 500+ users, 50+ weekly active, 20+ completed learning paths
- **6 months:** 5-10% conversion rate, 25-50 paid subscribers, $950-1900 MRR
- **Technical:** <3s response time, 95% uptime, <2% error rate

---

## 2. Problem Definition

### 2.1 Customer Problem

**Who:** Developers at all skill levels
- **Primary:** Junior/mid-level developers learning new frameworks (React, Vue, Next.js)
- **Secondary:** Professional developers needing productivity tools
- **Tertiary:** Development teams seeking standardized components

**What:** Two interconnected problems
1. **Learning Problem:** Tutorials are theoretical; developers need hands-on experience with real-world projects but don't know where to start
2. **Productivity Problem:** Finding, extracting, and integrating reusable code from open-source projects is manual and time-consuming

**When:** 
- Learning: When starting a new job, switching frameworks, or building portfolio projects
- Productivity: Daily during feature development when needing common components

**Where:**
- Learning: Online courses, documentation, YouTube tutorials (passive consumption)
- Productivity: GitHub search, Stack Overflow, manual copy-paste (fragmented workflow)

**Why:** Root causes
- Lack of structured, project-based learning paths from real codebases
- No AI assistance to break down complex projects into learnable tasks
- Manual template extraction requires understanding entire codebases
- Context-unaware integration leads to conflicts and bugs

**Impact:** Cost of not solving
- **Learning:** 3-6 months to become productive in new framework (slow career growth)
- **Productivity:** 2-4 hours/week wasted on template search and integration (20-40 hours/year per developer)
- **Quality:** Copy-paste errors, inconsistent patterns, technical debt

### 2.2 Market Opportunity

**Market Size:**
- **TAM (Total Addressable Market):** 27M developers worldwide (Stack Overflow 2024)
- **SAM (Serviceable Addressable Market):** 10M developers learning JavaScript frameworks annually
- **SOM (Serviceable Obtainable Market):** 100K developers (1% of SAM in Year 1)

**Growth Rate:**
- Developer population growing 5% annually
- AI developer tools market growing 40% CAGR (2024-2028)
- Remote learning and self-paced education accelerating post-pandemic

**Competition:**
| Competitor | Strengths | Gaps |
|------------|-----------|------|
| **Codecademy/Udemy** | Structured courses | No real-world projects, no AI guidance |
| **GitHub Copilot** | Code completion | No learning mode, no template extraction |
| **Replit/CodeSandbox** | Cloud IDE | No AI learning paths, manual setup |
| **FreeCodeCamp** | Free, project-based | Static curriculum, no personalization |

**Our Differentiation:**
- Only platform combining AI-powered learning with productivity tools
- Real GitHub projects as learning material (not synthetic examples)
- Context-aware template integration (not just code snippets)
- Freemium model with free learning (accessible to all)

**Timing: Why Now?**
- AI models (Claude, Llama) capable of code understanding and generation
- Developers expect AI assistance in workflows (GitHub Copilot normalized AI tools)
- Cloud sandboxes (Lambda, Fargate) make execution affordable
- Open-source ecosystem mature with millions of quality projects

### 2.3 Business Case

**Revenue Potential:**
- **Year 1:** 1,000 users → 50-100 paid ($950-1,900/mo) = $11K-23K ARR
- **Year 2:** 10,000 users → 500-1,000 paid ($9.5K-19K/mo) = $114K-228K ARR
- **Year 3:** 50,000 users → 2,500-5,000 paid ($47.5K-95K/mo) + Marketplace = $600K-1.2M ARR

**Cost Structure:**
- **MVP Phase:** AWS credits cover infrastructure ($0 out-of-pocket)
- **Post-Credits:** $500-1,000/mo AWS costs (sustainable with 50+ paid users)
- **Break-even:** 30-50 paid subscribers

**Strategic Value:**
- **Network Effects:** Template Marketplace creates flywheel (more templates → more users → more creators)
- **Data Moat:** Learning analytics improve AI recommendations over time
- **Platform Play:** Foundation for team collaboration, enterprise features

**Risk Assessment: What if we don't do this?**
- Competitors (Replit, Cursor) may add similar features
- Miss window of AI developer tools adoption
- Developers continue inefficient manual workflows

---

## 3. Solution Overview

### 3.1 Proposed Solution

**High-Level Description:**
An AI-powered platform with two integrated modes: (1) Learning Mode where developers select a technology, AI curates real GitHub projects, breaks them into buildable tasks, and guides step-by-step reconstruction with live preview; (2) Developer Mode where AI extracts reusable components from any repo, analyzes the user's codebase, and performs context-aware integration with instant preview and undo.

**Key Capabilities:**

**Learning Mode (FREE):**
- Technology selection (React, Vue, Next.js, Node.js)
- AI-curated progressive curriculum (beginner → intermediate → advanced projects)
- Task-based project reconstruction with AI guidance
- Live code preview in cloud sandboxes (Lambda/Fargate)
- Progress tracking and auto-save
- One-click deployment to Vercel/Netlify
- Portfolio showcase of completed projects

**Developer Mode (FREEMIUM):**
- Template extraction from any GitHub repo using AI analysis
- Context-aware code integration (understands existing codebase)
- Instant preview with undo capability
- Template library with ratings and search
- 5 integrations/month (free), unlimited (paid)

**AI Agent System:**
- **Curator Agent:** Finds and evaluates GitHub repos based on quality criteria
- **Teacher Agent:** Generates learning content and task breakdowns from code
- **Code Agent:** Extracts templates, performs AST analysis, integrates code
- **Mentor Agent:** Answers questions, explains concepts, provides guidance

**User Journey:**

**Learning Path:**
```
1. User signs up (GitHub/Google/Email)
2. Selects technology (e.g., "React")
3. AI presents 3 projects (beginner → advanced)
4. User chooses project
5. AI breaks project into 10-15 tasks
6. User completes tasks in Monaco editor
7. Live preview shows results
8. AI provides hints/explanations on demand
9. User deploys completed project
10. Project added to portfolio
```

**Developer Path:**
```
1. User browses template library
2. Searches for "authentication system"
3. Selects template from Next.js project
4. AI analyzes user's current codebase
5. AI performs context-aware integration
6. Live preview shows integrated result
7. User reviews changes (diff view)
8. User approves or undoes
9. Code saved to project
10. User continues development
```

**Differentiation:**
- **vs. Codecademy:** Real projects, not synthetic exercises; AI-personalized paths
- **vs. GitHub Copilot:** Learning mode + template extraction, not just completion
- **vs. Replit:** AI-guided learning, not just cloud IDE
- **vs. FreeCodeCamp:** Dynamic curriculum from real repos, not static lessons

### 3.2 In Scope (MVP - Phase 1)

**P0 (Critical for MVP):**
- **LM-001:** Technology selection UI (React, Vue, Next.js, Node.js)
- **LM-002:** GitHub repo discovery with AI filtering
- **LM-003:** AI-generated learning paths (3 projects per technology)
- **LM-004:** Task breakdown and step-by-step guidance
- **LM-005:** Monaco code editor integration
- **LM-006:** Live preview in Lambda/Fargate sandboxes
- **LM-007:** Progress tracking and auto-save (30s intervals)
- **LM-008:** One-click Vercel deployment
- **DM-001:** Template extraction from GitHub repos
- **DM-002:** Basic template library (10-15 curated templates)
- **DM-003:** Context-aware code integration
- **DM-004:** Live preview with undo
- **DM-005:** 5 integrations/month limit (free tier)
- **AUTH-001:** User authentication (GitHub, Google, Email via Cognito)
- **INFRA-001:** Project storage (S3 + DynamoDB)
- **INFRA-002:** Responsive web UI (desktop/tablet optimized)

**P1 (Important, post-MVP):**
- **DM-006:** Developer Pro subscription ($19/mo)
- **DM-007:** Team subscription ($99/mo for 5 users)
- **LM-009:** AI Mentor chat interface
- **UI-001:** User dashboard with analytics
- **UI-002:** Portfolio page (public profile)

### 3.3 Out of Scope

**Explicitly NOT doing in MVP:**
- ❌ Template Marketplace (Phase 2 - Week 9-12)
- ❌ Team collaboration features (Phase 2)
- ❌ Real-time pair programming
- ❌ Multi-language support beyond JavaScript (Python, Go, Rust in Phase 3)
- ❌ Mobile native apps (web-responsive only)
- ❌ Enterprise SSO/SAML
- ❌ Private GitHub repo support
- ❌ Custom AI model training
- ❌ Video tutorials or screencasts
- ❌ Community forums or social features

**Future Considerations (Phase 3+):**
- Template Marketplace with creator revenue share
- Team collaboration (shared projects, code reviews, comments)
- Additional languages (Python, Go, Rust, Java)
- Mobile optimization
- Enterprise features (SSO, audit logs, admin dashboard)
- AI code review and suggestions
- Integration with VS Code extension

**Dependencies:**
- AWS Bedrock availability and pricing stability
- GitHub API rate limits (5,000 requests/hour authenticated)
- Vercel/Netlify API stability for deployments
- Stripe for payment processing (Phase 2)

### 3.4 MVP Definition

**Core Features (Must Have):**
1. User can sign up and authenticate
2. User can select a technology and receive 3 AI-curated projects
3. User can view task breakdown for a project
4. User can write code in Monaco editor
5. User can see live preview of code execution
6. User can save progress automatically
7. User can deploy completed project to Vercel
8. User can browse template library
9. User can integrate template into their project (5/month limit)
10. User can preview integration and undo if needed

**Success Criteria (Definition of "Working"):**
- ✅ 90%+ of selected technologies return valid projects
- ✅ AI-generated tasks are coherent and buildable
- ✅ Code execution works for JavaScript/Node.js projects
- ✅ Preview loads within 5 seconds
- ✅ Template integration succeeds without breaking existing code
- ✅ Deployment to Vercel completes successfully
- ✅ Auto-save prevents data loss
- ✅ Authentication works across all providers

**Timeline:** 8-12 weeks (March 1 - May 15, 2026)

**Learning Goals (What we want to validate):**
- Do users complete learning paths? (Target: 60%+ task completion rate)
- Does AI-generated content quality meet expectations? (Target: 4+ star rating)
- Do users convert from Learning to Developer Mode? (Target: 30%+ try Developer Mode)
- Is 5 integrations/month enough to demonstrate value? (Target: 20%+ hit limit)
- Do users deploy projects? (Target: 40%+ deploy at least once)

---

## 4. User Stories & Requirements

### 4.1 User Stories

#### Learning Mode Stories

**US-LM-001: Technology Selection**
```
As a developer learning a new framework
I want to select a technology from a list
So that I can see relevant learning projects

Acceptance Criteria:
- [ ] User sees list of supported technologies (React, Vue, Next.js, Node.js)
- [ ] User can click to select a technology
- [ ] Selection triggers AI project curation
- [ ] Loading state shows "Finding projects for you..."
- [ ] Results display within 10 seconds
```

**US-LM-002: View Learning Path**
```
As a learner
I want to see a progressive curriculum of projects
So that I can choose my starting point based on skill level

Acceptance Criteria:
- [ ] User sees 3 projects labeled (Beginner, Intermediate, Advanced)
- [ ] Each project shows: name, description, estimated time, tech stack
- [ ] User can preview project (GitHub link, demo if available)
- [ ] User can select a project to start
- [ ] Selection saves to user profile
```

**US-LM-003: Task-Based Learning**
```
As a learner working on a project
I want to see the project broken into small tasks
So that I'm not overwhelmed and know what to build next

Acceptance Criteria:
- [ ] Project displays 10-15 tasks in logical order
- [ ] Each task shows: title, description, estimated time, difficulty
- [ ] User can expand task to see detailed instructions
- [ ] User can mark task as complete
- [ ] Progress bar shows completion percentage
- [ ] User can skip ahead to any task (not locked)
```

**US-LM-004: Code and Preview**
```
As a learner writing code
I want to see my code execute in real-time
So that I can verify my implementation works

Acceptance Criteria:
- [ ] Monaco editor loads with syntax highlighting
- [ ] User can write/edit code
- [ ] "Run" button triggers code execution
- [ ] Preview pane shows output within 5 seconds
- [ ] Errors display in console with helpful messages
- [ ] Code auto-saves every 30 seconds
```

**US-LM-005: AI Assistance**
```
As a learner stuck on a task
I want to ask the AI for help
So that I can unblock myself without leaving the platform

Acceptance Criteria:
- [ ] "Get Hint" button available on each task
- [ ] AI provides contextual hint without full solution
- [ ] "Explain This" button explains code concepts
- [ ] AI responses appear within 3 seconds
- [ ] User can ask follow-up questions
```

**US-LM-006: Deploy Project**
```
As a learner who completed a project
I want to deploy it with one click
So that I can share it and add to my portfolio

Acceptance Criteria:
- [ ] "Deploy" button available when project is complete
- [ ] User connects Vercel account (OAuth)
- [ ] Deployment starts with progress indicator
- [ ] User receives live URL within 2 minutes
- [ ] Deployed project added to portfolio page
- [ ] User can redeploy after changes
```

#### Developer Mode Stories

**US-DM-001: Browse Templates**
```
As a professional developer
I want to browse available code templates
So that I can find reusable components for my project

Acceptance Criteria:
- [ ] Template library displays grid of templates
- [ ] Each template shows: name, description, tech stack, rating, downloads
- [ ] User can filter by technology (React, Vue, etc.)
- [ ] User can search by keyword
- [ ] User can preview template code
- [ ] User can see source GitHub repo
```

**US-DM-002: Integrate Template**
```
As a developer who found a useful template
I want to integrate it into my existing project
So that I don't have to manually copy and adapt code

Acceptance Criteria:
- [ ] "Integrate" button available on template
- [ ] User selects target project
- [ ] AI analyzes project and template (shows "Analyzing...")
- [ ] AI performs integration automatically
- [ ] Preview shows integrated result within 10 seconds
- [ ] User sees diff of changes
- [ ] User can approve or undo integration
```

**US-DM-003: Extract Custom Template**
```
As a developer who found a component in a GitHub repo
I want to extract it as a template
So that I can reuse it in my projects

Acceptance Criteria:
- [ ] User pastes GitHub repo URL
- [ ] AI analyzes repo structure
- [ ] AI suggests extractable components
- [ ] User selects component to extract
- [ ] Template saved to user's library
- [ ] Template available for integration
```

**US-DM-004: Usage Limits**
```
As a free tier user
I want to see my remaining integrations
So that I know when I'll hit the limit

Acceptance Criteria:
- [ ] Dashboard shows "X/5 integrations this month"
- [ ] Warning appears at 4/5 integrations
- [ ] Upgrade prompt shows when limit reached
- [ ] Limit resets on 1st of each month
- [ ] Paid users see "Unlimited" badge
```

#### Authentication Stories

**US-AUTH-001: Sign Up**
```
As a new user
I want to create an account quickly
So that I can start learning immediately

Acceptance Criteria:
- [ ] User can sign up with GitHub (OAuth)
- [ ] User can sign up with Google (OAuth)
- [ ] User can sign up with email/password
- [ ] Email verification sent for email signups
- [ ] User redirected to onboarding after signup
- [ ] Account created in <2 seconds
```

**US-AUTH-002: Onboarding**
```
As a new user who just signed up
I want to be guided through the platform
So that I understand how to use it

Acceptance Criteria:
- [ ] Welcome screen explains two modes
- [ ] User selects primary goal (Learn / Build)
- [ ] User selects technologies of interest
- [ ] User sees personalized dashboard
- [ ] Onboarding skippable (not forced)
```

### 4.2 Functional Requirements

| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| **Learning Mode** |
| FR-LM-001 | System shall support React, Vue, Next.js, Node.js | P0 | MVP technologies |
| FR-LM-002 | System shall curate 3 projects per technology (beginner/intermediate/advanced) | P0 | AI-powered curation |
| FR-LM-003 | System shall break projects into 10-15 buildable tasks | P0 | Using Teacher Agent |
| FR-LM-004 | System shall provide Monaco code editor with syntax highlighting | P0 | VS Code engine |
| FR-LM-005 | System shall execute JavaScript/Node.js code in cloud sandboxes | P0 | Lambda + Fargate |
| FR-LM-006 | System shall display live preview within 5 seconds | P0 | Performance requirement |
| FR-LM-007 | System shall auto-save code every 30 seconds | P0 | Prevent data loss |
| FR-LM-008 | System shall track task completion and progress | P0 | DynamoDB storage |
| FR-LM-009 | System shall deploy to Vercel with one click | P0 | Vercel API integration |
| FR-LM-010 | System shall provide AI hints and explanations | P1 | Mentor Agent |
| FR-LM-011 | System shall allow skipping ahead to any task | P0 | Non-linear learning |
| **Developer Mode** |
| FR-DM-001 | System shall extract templates from GitHub repos using AI | P0 | Code Agent |
| FR-DM-002 | System shall maintain template library with metadata | P0 | DynamoDB + S3 |
| FR-DM-003 | System shall perform context-aware code integration | P0 | AST analysis |
| FR-DM-004 | System shall show live preview of integration | P0 | Sandbox execution |
| FR-DM-005 | System shall allow undo of integrations | P0 | Version control |
| FR-DM-006 | System shall enforce 5 integrations/month for free users | P0 | Rate limiting |
| FR-DM-007 | System shall support template search and filtering | P0 | Search functionality |
| FR-DM-008 | System shall display template ratings and downloads | P1 | Social proof |
| **Authentication & User Management** |
| FR-AUTH-001 | System shall support GitHub OAuth | P0 | AWS Cognito |
| FR-AUTH-002 | System shall support Google OAuth | P0 | AWS Cognito |
| FR-AUTH-003 | System shall support email/password auth | P0 | AWS Cognito |
| FR-AUTH-004 | System shall send email verification | P0 | Security |
| FR-AUTH-005 | System shall support password reset | P0 | Standard feature |
| FR-AUTH-006 | System shall maintain user profiles | P0 | DynamoDB |
| **Data & Storage** |
| FR-DATA-001 | System shall store user projects in S3 | P0 | Scalable storage |
| FR-DATA-002 | System shall store metadata in DynamoDB | P0 | Fast queries |
| FR-DATA-003 | System shall encrypt data at rest | P0 | Security requirement |
| FR-DATA-004 | System shall retain projects indefinitely while active | P0 | User expectation |
| FR-DATA-005 | System shall backup data daily | P1 | Disaster recovery |
| **AI Agents** |
| FR-AI-001 | Curator Agent shall filter repos by stars (>50), activity (<6mo), docs | P0 | Quality criteria |
| FR-AI-002 | Teacher Agent shall generate coherent task descriptions | P0 | Content quality |
| FR-AI-003 | Code Agent shall extract self-contained components | P0 | Template quality |
| FR-AI-004 | Mentor Agent shall provide helpful explanations | P1 | Learning support |
| FR-AI-005 | System shall use AWS Bedrock (Claude/Llama) | P0 | AI provider |
| FR-AI-006 | System shall cache AI responses for 24 hours | P1 | Cost optimization |

### 4.3 Non-Functional Requirements

**Performance:**
- Response time <3 seconds for 95% of API requests
- Page load time <2 seconds on 4G connection
- Code execution preview <5 seconds
- AI response time <10 seconds for complex operations
- Support 100 concurrent users without degradation

**Scalability:**
- Handle 10-100 concurrent users (MVP)
- Scale to 1,000 users within 6 months
- Database queries <100ms at 1,000 users
- Auto-scaling for Fargate workers (0-10 instances)
- SQS queue handles 1,000 messages/hour

**Security:**
- All data encrypted at rest (S3, DynamoDB)
- All data encrypted in transit (HTTPS/TLS 1.3)
- Sandboxes isolated per user (Fargate containers)
- OAuth tokens stored securely (Cognito)
- No PII in logs or error messages
- OWASP Top 10 vulnerabilities addressed
- Regular security audits (quarterly)

**Reliability:**
- 95% uptime target (MVP), 99% post-MVP
- Graceful degradation if AI unavailable
- Auto-retry for failed operations (3 attempts)
- Dead-letter queue for failed jobs
- Monitoring and alerting (CloudWatch)
- Incident response plan documented

**Usability:**
- WCAG 2.1 AA accessibility compliance
- Keyboard navigation support
- Screen reader compatible
- Mobile responsive (tablet optimized)
- Browser support: Chrome, Firefox, Safari, Edge (last 2 versions)
- Onboarding completion <5 minutes
- Task instructions clear to 90%+ of users

**Compliance:**
- GDPR compliant (EU users)
- CCPA compliant (California users)
- Terms of Service and Privacy Policy
- Cookie consent banner
- Data export capability (user request)
- Account deletion capability

---

## 5. Design & User Experience

### 5.1 Design Principles

**1. Learning-First, Not Tool-First**
- Prioritize educational value over feature complexity
- Guide users through learning journey with clear next steps
- Celebrate progress and achievements
- Make AI assistance feel like a mentor, not a black box

**2. Instant Feedback, Zero Friction**
- Live preview shows results immediately
- No manual setup or configuration required
- One-click actions (deploy, integrate, run)
- Auto-save prevents data loss
- Undo always available

**3. Real-World, Not Synthetic**
- Use actual GitHub projects, not toy examples
- Show production-quality code patterns
- Deploy to real hosting platforms
- Build portfolio-worthy projects

**4. Progressive Disclosure**
- Start simple, reveal complexity gradually
- Advanced features hidden until needed
- Onboarding adapts to user skill level
- Power users can skip to advanced features

**5. AI-Augmented, Human-Controlled**
- AI suggests, user decides
- Always show what AI is doing
- Provide escape hatches (manual mode)
- Explain AI decisions transparently

### 5.2 Wireframes/Mockups

**Key Screens:** (To be designed in Figma)

1. **Landing Page**
   - Hero: "Learn by Building Real Projects"
   - Two-mode explanation (Learning / Developer)
   - Social proof (user count, projects built)
   - CTA: "Start Learning Free"

2. **Dashboard**
   - Left sidebar: Navigation (Learning, Developer, Projects, Profile)
   - Main area: Current learning path or recent projects
   - Right sidebar: Progress stats, AI mentor chat
   - Top bar: Search, notifications, user menu

3. **Technology Selection**
   - Grid of technology cards (React, Vue, Next.js, Node.js)
   - Each card: logo, description, difficulty, project count
   - Filter/sort options
   - "Coming Soon" badges for future technologies

4. **Learning Path View**
   - 3 project cards (Beginner, Intermediate, Advanced)
   - Each card: project name, description, time estimate, preview image
   - "Start Project" button
   - GitHub link to source repo

5. **Project Workspace**
   - Top: Project name, progress bar, task selector
   - Left: Task list with checkboxes
   - Center: Monaco code editor (60% width)
   - Right: Live preview iframe (40% width)
   - Bottom: Console output, AI mentor chat
   - Toolbar: Run, Save, Deploy, Get Hint

6. **Template Library**
   - Grid of template cards
   - Each card: name, description, tech stack, rating, downloads
   - Filters: Technology, category, rating
   - Search bar
   - "Extract from GitHub" button

7. **Template Integration**
   - Split view: Current code (left) vs. Integrated code (right)
   - Diff highlighting (green additions, red deletions)
   - Preview button
   - Approve/Undo buttons
   - AI explanation of changes

8. **User Profile/Portfolio**
   - Profile info, avatar, bio
   - Completed projects grid with live links
   - Learning stats (projects completed, hours spent)
   - Badges/achievements
   - Public/private toggle

### 5.3 Information Architecture

**Navigation Structure:**
```
├── Home (Dashboard)
├── Learning Mode
│   ├── Technology Selection
│   ├── Learning Path (3 projects)
│   └── Project Workspace
│       ├── Task List
│       ├── Code Editor
│       ├── Live Preview
│       └── AI Mentor
├── Developer Mode
│   ├── Template Library
│   ├── My Templates
│   ├── Extract from GitHub
│   └── Integration Workspace
├── Projects
│   ├── Active Projects
│   ├── Completed Projects
│   └── Deployed Projects
├── Profile
│   ├── Account Settings
│   ├── Portfolio (Public)
│   ├── Usage Stats
│   └── Billing (Phase 2)
└── Help
    ├── Documentation
    ├── Tutorials
    └── Support
```

**Data Organization:**
- Projects organized by technology and status (active/completed)
- Templates organized by category and technology
- Learning paths organized by difficulty
- User data organized by profile, projects, progress

**Content Hierarchy:**
1. Primary: Code editor and preview (learning/building)
2. Secondary: Task list, template library (guidance)
3. Tertiary: AI mentor, stats, settings (support)

---

## 6. Technical Specifications

### 6.1 Architecture Overview

**System Architecture:** Hybrid - Monolith with Async AI Workers (Approved in ADR-0001)

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application (Vercel)             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Frontend (React + Monaco Editor)                      │ │
│  │  - Learning Mode UI                                    │ │
│  │  - Developer Mode UI                                   │ │
│  │  - Live Preview Iframe                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes (Next.js Backend)                          │ │
│  │  - /api/auth/* (Cognito integration)                   │ │
│  │  - /api/learning/* (sync operations)                   │ │
│  │  - /api/developer/* (sync operations)                  │ │
│  │  - /api/jobs/* (queue management)                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌──────────────────────┐
                │   SQS Queue          │
                │   - AI job requests  │
                │   - Async processing │
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

**Technology Stack:**

**Frontend:**
- Framework: Next.js 14 (React 18, App Router)
- UI Library: Tailwind CSS 3.4 + shadcn/ui
- Code Editor: Monaco Editor 0.45
- State Management: React Context + TanStack Query 5.0
- Forms: React Hook Form + Zod validation
- Deployment: Vercel

**Backend:**
- Runtime: Node.js 20 LTS
- API: Next.js API routes (serverless)
- Queue: AWS SQS (Standard Queue)
- Workers: ECS Fargate (Node.js containers)
- Authentication: AWS Cognito
- Payments: Stripe API (Phase 2)

**Data Layer:**
- Database: DynamoDB (on-demand billing)
- Storage: S3 (Standard tier)
- Cache: DynamoDB TTL (24-hour expiration)
- CDN: CloudFront

**AI/ML:**
- Provider: AWS Bedrock
- Models: Claude 3.5 Sonnet (primary), Llama 3.1 (fallback)
- Framework: LangChain.js 0.1
- Orchestration: Custom agent system

**Infrastructure:**
- Hosting: Vercel (frontend) + AWS (backend)
- Sandboxes: AWS Lambda + ECS Fargate
- Monitoring: CloudWatch + Sentry
- CI/CD: GitHub Actions
- IaC: AWS CDK (TypeScript)

**Integrations:**
- GitHub API v3 (repo search, OAuth)
- Vercel API (deployment)
- Netlify API (deployment alternative)
- Stripe API (payments, Phase 2)

### 6.2 API Design

**Authentication Endpoints:**

```
POST /api/auth/signup
Request: { email, password, provider }
Response: { userId, token, refreshToken }

POST /api/auth/login
Request: { email, password }
Response: { userId, token, refreshToken }

POST /api/auth/oauth/github
Request: { code }
Response: { userId, token, refreshToken }

POST /api/auth/refresh
Request: { refreshToken }
Response: { token, refreshToken }

POST /api/auth/logout
Request: { token }
Response: { success: true }
```

**Learning Mode Endpoints:**

```
GET /api/learning/technologies
Response: { technologies: [{ id, name, description, icon }] }

POST /api/learning/curate
Request: { technology: "react" }
Response: { jobId, status: "queued" }
// Async operation - polls /api/jobs/{jobId}

GET /api/learning/projects/{technology}
Response: { 
  projects: [
    { id, name, description, difficulty, githubUrl, estimatedHours }
  ]
}

GET /api/learning/project/{projectId}/tasks
Response: {
  tasks: [
    { id, title, description, order, estimatedMinutes, hints }
  ]
}

POST /api/learning/project/{projectId}/save
Request: { taskId, code, completed }
Response: { success: true, autoSaved: true }

GET /api/learning/progress/{userId}
Response: {
  completedProjects: number,
  activeProjects: [{ projectId, progress }],
  totalHours: number
}
```

**Developer Mode Endpoints:**

```
GET /api/developer/templates
Query: ?technology=react&category=auth&search=login
Response: {
  templates: [
    { id, name, description, technology, rating, downloads, sourceRepo }
  ],
  pagination: { page, total }
}

POST /api/developer/extract
Request: { githubUrl, componentPath }
Response: { jobId, status: "queued" }
// Async operation

POST /api/developer/integrate
Request: { templateId, projectId }
Response: { jobId, status: "queued" }
// Async operation

GET /api/developer/integration/{jobId}/preview
Response: {
  diff: { additions, deletions, files },
  previewUrl: "https://sandbox.example.com/preview-123"
}

POST /api/developer/integration/{jobId}/approve
Response: { success: true, projectUpdated: true }

POST /api/developer/integration/{jobId}/undo
Response: { success: true, reverted: true }

GET /api/developer/usage/{userId}
Response: {
  integrationsThisMonth: 3,
  limit: 5,
  resetDate: "2026-03-01"
}
```

**Sandbox Endpoints:**

```
POST /api/sandbox/execute
Request: { code, language: "javascript", timeout: 30 }
Response: { 
  output, 
  errors, 
  executionTime,
  previewUrl (if applicable)
}

POST /api/sandbox/deploy
Request: { projectId, platform: "vercel" }
Response: { 
  deploymentId, 
  url, 
  status: "building" 
}

GET /api/sandbox/deployment/{deploymentId}
Response: {
  status: "ready" | "building" | "error",
  url,
  logs
}
```

**Job Status Endpoints:**

```
GET /api/jobs/{jobId}
Response: {
  jobId,
  status: "queued" | "processing" | "completed" | "failed",
  progress: 0-100,
  result: { ... } (if completed),
  error: "..." (if failed)
}

POST /api/jobs/{jobId}/cancel
Response: { success: true, cancelled: true }
```

**Rate Limiting:**
- Free users: 100 requests/hour
- Paid users: 1000 requests/hour
- AI operations: 50/day (free), unlimited (paid)
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Authentication:**
- Bearer token in `Authorization` header
- JWT with 1-hour expiration
- Refresh token with 30-day expiration
- Cognito handles token validation

### 6.3 Database Design

**DynamoDB Tables:**

**users**
```
PK: userId (String)
Attributes:
- email (String)
- name (String)
- avatarUrl (String)
- provider (String) // "github" | "google" | "email"
- tier (String) // "free" | "pro" | "team"
- createdAt (Number)
- lastLoginAt (Number)
- preferences (Map)
  - theme: "light" | "dark"
  - notifications: Boolean
```

**projects**
```
PK: projectId (String)
SK: userId (String)
GSI1: userId-status-index
Attributes:
- name (String)
- technology (String)
- type (String) // "learning" | "custom"
- status (String) // "active" | "completed"
- progress (Number) // 0-100
- code (String) // S3 key reference
- githubSourceUrl (String)
- deploymentUrl (String)
- createdAt (Number)
- updatedAt (Number)
- completedAt (Number)
```

**learning_paths**
```
PK: technology (String)
SK: difficulty (String) // "beginner" | "intermediate" | "advanced"
Attributes:
- projectId (String)
- name (String)
- description (String)
- githubUrl (String)
- estimatedHours (Number)
- tasks (List<Map>)
  - taskId, title, description, order, hints
- generatedAt (Number)
- expiresAt (Number) // TTL for cache invalidation
```

**templates**
```
PK: templateId (String)
GSI1: technology-rating-index
Attributes:
- name (String)
- description (String)
- technology (String)
- category (String)
- code (String) // S3 key reference
- sourceRepo (String)
- rating (Number) // 0-5
- downloads (Number)
- createdBy (String) // userId
- createdAt (Number)
- updatedAt (Number)
```

**jobs**
```
PK: jobId (String)
SK: userId (String)
Attributes:
- type (String) // "curate" | "extract" | "integrate"
- status (String) // "queued" | "processing" | "completed" | "failed"
- progress (Number) // 0-100
- input (Map) // job parameters
- result (Map) // job output
- error (String)
- createdAt (Number)
- updatedAt (Number)
- expiresAt (Number) // TTL 24 hours
```

**integrations**
```
PK: integrationId (String)
SK: userId (String)
GSI1: userId-month-index
Attributes:
- templateId (String)
- projectId (String)
- month (String) // "2026-02" for rate limiting
- status (String) // "preview" | "approved" | "undone"
- diff (Map) // changes made
- createdAt (Number)
```

**S3 Buckets:**

**user-projects-{env}**
- Path: `{userId}/{projectId}/code.zip`
- Versioning: Enabled
- Encryption: AES-256
- Lifecycle: Retain indefinitely

**templates-{env}**
- Path: `{templateId}/code.zip`
- Versioning: Enabled
- Encryption: AES-256
- Public read: No

**assets-{env}**
- Path: `{userId}/avatar.jpg`, `projects/{projectId}/preview.png`
- CDN: CloudFront
- Public read: Yes (signed URLs)

### 6.4 Security Considerations

**Authentication:**
- AWS Cognito User Pools
- OAuth 2.0 for GitHub/Google
- JWT tokens with short expiration (1 hour)
- Refresh tokens with rotation
- Password requirements: 8+ chars, uppercase, lowercase, number

**Authorization:**
- Role-based access control (RBAC)
- Roles: free, pro, team, admin
- Resource ownership validation (userId check)
- API Gateway authorizer (Lambda)

**Data Encryption:**
- At rest: S3 (AES-256), DynamoDB (AWS managed keys)
- In transit: TLS 1.3 for all connections
- Secrets: AWS Secrets Manager (API keys, tokens)

**Sandbox Security:**
- Fargate containers isolated per user
- No network access from sandboxes (except whitelisted)
- Resource limits: 2GB RAM, 1 vCPU, 15min timeout
- Code execution in restricted environment
- No file system persistence

**PII Handling:**
- Email encrypted in database
- No PII in logs or error messages
- Data export API for GDPR compliance
- Account deletion removes all user data
- Audit logs for data access

**Input Validation:**
- Zod schemas for all API inputs
- SQL injection prevention (DynamoDB NoSQL)
- XSS prevention (React escaping)
- CSRF tokens for state-changing operations
- Rate limiting per user/IP

**Vulnerability Management:**
- Dependabot for dependency updates
- Snyk for vulnerability scanning
- OWASP Top 10 checklist
- Quarterly security audits
- Bug bounty program (post-MVP)

---

## 7. Go-to-Market Strategy

### 7.1 Launch Plan

**Soft Launch (Beta) - Week 8-10:**
- **Target:** 50-100 beta users
- **Channels:** 
  - Personal network and developer communities
  - Product Hunt "Coming Soon" page
  - Twitter/X announcements
  - Dev.to and Hashnode blog posts
- **Goals:**
  - Validate core functionality
  - Gather user feedback
  - Identify bugs and UX issues
  - Measure engagement metrics
- **Incentives:**
  - Beta users get lifetime Pro access
  - Early access to new features
  - Direct line to product team

**Full Launch - Week 12:**
- **Target:** 500+ users in first month
- **Channels:**
  - Product Hunt launch (aim for top 5)
  - Hacker News "Show HN" post
  - Reddit (r/webdev, r/learnprogramming, r/reactjs)
  - Twitter/X campaign with demo videos
  - Dev.to featured post
  - YouTube demo video
  - Email to beta users for referrals
- **Content:**
  - Launch blog post with vision and roadmap
  - Demo video (3-5 minutes)
  - Case studies from beta users
  - Comparison with alternatives
- **Support:**
  - Documentation site (docs.example.com)
  - Video tutorials for key features
  - Discord community for support
  - Email support (response within 24 hours)

**Marketing Timeline:**
- **Week 6:** Create marketing materials (videos, screenshots, copy)
- **Week 7:** Set up Product Hunt, social media accounts
- **Week 8:** Beta launch, gather testimonials
- **Week 10:** Finalize launch materials based on feedback
- **Week 12:** Full launch across all channels
- **Week 13-16:** Content marketing, SEO optimization

### 7.2 Pricing Strategy

**Pricing Model:** Freemium with clear value tiers

**Free Tier:**
- **Learning Mode:** Unlimited (forever free)
- **Developer Mode:** 5 template integrations/month
- **Storage:** 10 projects
- **Support:** Community (Discord)
- **Value Prop:** "Learn any technology for free"

**Developer Pro - $19/month ($190/year):**
- **Learning Mode:** Unlimited
- **Developer Mode:** Unlimited integrations
- **Storage:** Unlimited projects
- **AI Mentor:** Priority access
- **Support:** Email (24-hour response)
- **Deployment:** Unlimited
- **Value Prop:** "Accelerate your development workflow"

**Team - $99/month (5 users):**
- **All Pro features** for each user
- **Collaboration:** Shared projects, comments, code reviews
- **Team Library:** Shared template library
- **Analytics:** Team usage dashboard
- **Support:** Priority email + Slack channel
- **Admin:** User management, billing
- **Value Prop:** "Build faster as a team"

**Competitive Analysis:**

| Platform | Price | Learning | Templates | AI | Sandboxes |
|----------|-------|----------|-----------|-----|-----------|
| **Our Platform** | $0-19/mo | ✅ Real projects | ✅ AI extraction | ✅ Agentic | ✅ Included |
| Codecademy | $20/mo | ✅ Synthetic | ❌ | ❌ | ❌ |
| Replit | $25/mo | ❌ | ❌ | ⚠️ Basic | ✅ Included |
| GitHub Copilot | $10/mo | ❌ | ❌ | ✅ Completion | ❌ |
| Cursor | $20/mo | ❌ | ❌ | ✅ Chat | ❌ |

**Pricing Rationale:**
- **Free Learning:** Builds user base, educational mission, conversion funnel
- **$19 Pro:** Competitive with Cursor ($20), Replit ($25), Codecademy ($20)
- **$99 Team:** Standard SaaS team pricing (5 users = $19.80/user)
- **Annual Discount:** 17% off ($190 vs $228) to improve retention

**Value Proposition:**
- **vs. Codecademy:** Real projects, not synthetic exercises ($19 vs $20)
- **vs. Replit:** AI-guided learning + templates ($19 vs $25)
- **vs. Copilot:** Learning mode + template extraction ($19 vs $10)
- **Unique:** Only platform combining learning and productivity

### 7.3 Success Metrics

**User Acquisition (3 months post-launch):**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Total Registered Users | 500+ | Cognito user count |
| Weekly Active Users | 50+ | DynamoDB query (lastLoginAt < 7 days) |
| Completed Learning Paths | 20+ | projects table (status = "completed") |
| Referral Rate | 10% | Referral tracking (UTM params) |
| Organic Traffic | 1,000/mo | Google Analytics |

**Engagement:**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Sessions per User per Week | 3+ | CloudWatch logs |
| Task Completion Rate | 60%+ | learning_paths table (completed tasks / total tasks) |
| Average Session Duration | 20+ min | Frontend analytics |
| Template Integration Success | 90%+ | integrations table (approved / total) |
| User Satisfaction (NPS) | 4+ stars | In-app survey |

**Conversion (6 months post-launch):**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Free to Paid Conversion | 5-10% | Stripe subscriptions / total users |
| Developer Pro Subscribers | 25-50 | Stripe active subscriptions (pro tier) |
| Team Subscriptions | 3-5 | Stripe active subscriptions (team tier) |
| Monthly Recurring Revenue | $950-1900 | Stripe MRR report |
| Churn Rate | <5%/mo | Stripe cancellations / active subs |
| Lifetime Value (LTV) | $200+ | Average subscription duration * price |

**Technical:**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| API Response Time (P95) | <3s | CloudWatch metrics |
| Page Load Time (P95) | <2s | Vercel Analytics |
| Uptime | 95%+ | CloudWatch alarms |
| Error Rate | <2% | Sentry error tracking |
| AI Response Time (P95) | <10s | Custom CloudWatch metric |
| Sandbox Execution Time (P95) | <5s | Custom CloudWatch metric |

**Cost Efficiency:**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| AWS Costs | <$500/mo | AWS Cost Explorer |
| Cost per User | <$5/mo | AWS costs / active users |
| AI Costs | <$200/mo | Bedrock billing |
| Sandbox Costs | <$150/mo | Lambda + Fargate billing |
| Break-even Users | 30-50 paid | Revenue > costs |

---

## 8. Risks & Mitigations

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| **AWS credits run out before revenue** | Medium | High | - Aggressive conversion optimization (email campaigns, in-app prompts)<br>- Usage limits for free tier<br>- Seek additional credits or grants<br>- Have backup funding plan |
| **Low free-to-paid conversion (<5%)** | Medium | High | - Strong onboarding with value demonstration<br>- Clear upgrade prompts at limit<br>- Trial incentives (7-day Pro trial)<br>- User interviews to understand barriers |
| **AI-generated content quality issues** | Medium | Medium | - Human review of curated projects<br>- User ratings and feedback loops<br>- A/B test different prompts<br>- Fallback to curated content |
| **Template quality and compatibility** | Medium | Medium | - AI quality checks before listing<br>- User ratings (1-5 stars)<br>- Manual review for featured templates<br>- Clear compatibility warnings |
| **GitHub API rate limits** | Low | Medium | - Aggressive caching (24-hour TTL)<br>- Request optimization (batch queries)<br>- Upgrade to paid GitHub tier if needed<br>- Fallback to cached data |
| **Sandbox security vulnerabilities** | Low | Critical | - Container isolation (Fargate)<br>- Network restrictions (no outbound except whitelist)<br>- Resource limits (CPU, memory, time)<br>- Regular security audits<br>- Bug bounty program |
| **Slow AI response times (>10s)** | Medium | Medium | - Model optimization (smaller prompts)<br>- Aggressive caching<br>- Streaming responses for perceived speed<br>- Hybrid Lambda/Fargate approach<br>- Fallback to faster models |
| **License compliance for templates** | Medium | High | - Legal review of extraction process<br>- License detection (GitHub API)<br>- User disclaimers and warnings<br>- Respect restrictive licenses (GPL, etc.)<br>- Community reporting system |
| **User data loss** | Low | Critical | - Auto-save every 30 seconds<br>- S3 versioning enabled<br>- Daily backups to separate region<br>- Disaster recovery plan<br>- User export capability |
| **Competitor launches similar product** | Medium | Medium | - Fast iteration and feature velocity<br>- Build community and brand loyalty<br>- Focus on unique value (learning + productivity)<br>- Patent/IP protection if applicable |
| **Scaling issues at 1,000+ users** | Low | Medium | - Load testing before launch<br>- Auto-scaling configured<br>- Database optimization (indexes, caching)<br>- CDN for static assets<br>- Monitoring and alerting |
| **Team burnout (small team)** | Medium | Medium | - Realistic timeline and scope<br>- Prioritize ruthlessly (MVP focus)<br>- Automate repetitive tasks<br>- Hire contractors for specific tasks<br>- Take breaks and avoid crunch |

---

## 9. Timeline & Milestones

### Phase 1: MVP Development (Weeks 1-8)

| Milestone | Week | Deliverables | Success Criteria | Owner |
|-----------|------|--------------|-----------------|-------|
| **Infrastructure Setup** | 1 | - AWS account setup<br>- Cognito user pool<br>- DynamoDB tables<br>- S3 buckets<br>- Next.js project scaffold | - All AWS resources provisioned<br>- Local dev environment working<br>- CI/CD pipeline configured | Engineering |
| **Authentication** | 2 | - GitHub OAuth<br>- Google OAuth<br>- Email/password auth<br>- User profile page | - Users can sign up/login<br>- Session management works<br>- Profile data persists | Engineering |
| **Learning Mode - Core** | 3-4 | - Technology selection UI<br>- GitHub repo search<br>- AI project curation (async)<br>- Learning path display | - User can select technology<br>- AI returns 3 projects<br>- Projects display correctly | Engineering + Design |
| **Learning Mode - Workspace** | 5-6 | - Monaco editor integration<br>- Task list UI<br>- Code execution (Lambda)<br>- Live preview iframe<br>- Auto-save | - User can write code<br>- Code executes successfully<br>- Preview shows output<br>- No data loss | Engineering |
| **Developer Mode - Core** | 6-7 | - Template library UI<br>- Template extraction (async)<br>- Context-aware integration<br>- Preview and undo | - User can browse templates<br>- Integration works<br>- Preview shows changes<br>- Undo restores state | Engineering |
| **Deployment & Polish** | 7-8 | - Vercel deployment integration<br>- Portfolio page<br>- Onboarding flow<br>- Bug fixes<br>- Performance optimization | - One-click deploy works<br>- Portfolio displays projects<br>- Onboarding <5 min<br>- <2% error rate | Engineering + Design |
| **Beta Launch** | 8 | - Deploy to production<br>- Invite 50 beta users<br>- Set up monitoring<br>- Documentation | - 50+ beta signups<br>- 95% uptime<br>- Feedback collected | Product + Marketing |

### Phase 2: Optimization & Monetization (Weeks 9-12)

| Milestone | Week | Deliverables | Success Criteria | Owner |
|-----------|------|--------------|-----------------|-------|
| **Paid Tiers** | 9 | - Stripe integration<br>- Subscription management<br>- Usage limits enforcement<br>- Billing page | - Users can upgrade to Pro<br>- Payments process successfully<br>- Limits enforced correctly | Engineering |
| **Real-time Updates** | 10 | - WebSocket integration<br>- Job status notifications<br>- AI streaming responses | - Users see real-time progress<br>- No polling needed<br>- Feels instant | Engineering |
| **Performance** | 11 | - Redis caching layer<br>- Worker auto-scaling<br>- Database optimization<br>- CDN setup | - Response time <3s<br>- Handles 100 concurrent users<br>- Cost <$500/mo | Engineering |
| **Full Launch** | 12 | - Product Hunt launch<br>- Marketing campaign<br>- Content creation<br>- Community setup | - 500+ users<br>- Top 5 on Product Hunt<br>- 50+ weekly active | Product + Marketing |

### Phase 3: Scale & Marketplace (Weeks 13-24)

| Milestone | Week | Deliverables | Success Criteria | Owner |
|-----------|------|--------------|-----------------|-------|
| **Template Marketplace** | 13-16 | - Creator dashboard<br>- Template submission<br>- Review system<br>- Revenue sharing (Stripe Connect) | - 10+ creators<br>- 50+ marketplace templates<br>- First creator payout | Engineering + Product |
| **Team Features** | 17-20 | - Shared projects<br>- Inline comments<br>- Code review workflow<br>- Team analytics | - 3+ team subscriptions<br>- Collaboration features used<br>- Positive feedback | Engineering + Design |
| **Additional Languages** | 21-24 | - Python support<br>- Go support<br>- Expanded sandbox capabilities | - Python projects work<br>- Go projects work<br>- User requests satisfied | Engineering |

### Critical Path

**Must-Have for Beta Launch (Week 8):**
1. Authentication (Week 2)
2. Learning Mode Core (Week 3-4)
3. Learning Mode Workspace (Week 5-6)
4. Developer Mode Core (Week 6-7)
5. Deployment & Polish (Week 7-8)

**Blockers:**
- AWS Bedrock access approval (apply Week 1)
- GitHub OAuth app approval (apply Week 1)
- Vercel API access (apply Week 1)

**Buffer:**
- 2-week buffer built into timeline
- Can cut Developer Mode from MVP if needed (focus on Learning Mode)
- Can launch with fewer technologies (React only)

---

## 10. Team & Resources

### 10.1 Team Structure

**Core Team (MVP):**

**Product Manager** (1 FTE)
- Responsibilities: Product vision, roadmap, user research, stakeholder management
- Skills: Product strategy, user research, data analysis
- Time Commitment: Full-time (40 hours/week)

**Engineering Lead** (1 FTE)
- Responsibilities: Architecture, backend development, AI integration, DevOps
- Skills: Node.js, AWS, AI/ML, system design
- Time Commitment: Full-time (40 hours/week)

**Full-Stack Engineer** (1-2 FTE)
- Responsibilities: Frontend development, API development, testing
- Skills: React, Next.js, TypeScript, API design
- Time Commitment: Full-time (40 hours/week each)

**Product Designer** (0.5 FTE)
- Responsibilities: UI/UX design, wireframes, user testing
- Skills: Figma, user research, interaction design
- Time Commitment: Part-time (20 hours/week)

**Total Team Size:** 3.5-4.5 FTEs

**Extended Team (Phase 2+):**
- QA Engineer (0.5 FTE) - Testing, bug tracking
- DevRel/Community Manager (0.5 FTE) - Community, content, support
- Marketing Manager (0.5 FTE) - Growth, campaigns, SEO

### 10.2 Budget

**Development Costs (MVP - 8 weeks):**
- Engineering: $80K-120K (3-4 FTEs * 2 months * $10K-15K/mo)
- Design: $8K-12K (0.5 FTE * 2 months * $8K-12K/mo)
- **Total Development:** $88K-132K

**Infrastructure Costs (MVP):**
- AWS: $0 (covered by credits)
- Vercel: $0 (free tier)
- Domain: $20/year
- Tools (Figma, Sentry, etc.): $100/mo
- **Total Infrastructure (MVP):** $1,000

**Infrastructure Costs (Post-MVP, monthly):**
- AWS: $500-1,000/mo (Bedrock, Lambda, Fargate, DynamoDB, S3)
- Vercel: $20/mo (Pro tier)
- Stripe: 2.9% + $0.30 per transaction
- Tools: $200/mo (Sentry, analytics, etc.)
- **Total Infrastructure (Ongoing):** $720-1,220/mo

**Marketing Costs:**
- Product Hunt promotion: $500
- Content creation (videos, graphics): $1,000
- Paid ads (optional): $1,000-5,000
- **Total Marketing:** $2,500-6,500

**Total MVP Budget:** $92K-140K (development + infrastructure + marketing)

**Break-Even Analysis:**
- Monthly costs (post-credits): $720-1,220
- Revenue per Pro user: $19/mo
- Break-even: 38-65 paid subscribers
- Target: 50-100 paid subscribers by Month 6

**Funding Sources:**
- Bootstrapped (personal funds)
- AWS Activate credits ($5K-25K)
- Accelerator/incubator (Y Combinator, Techstars)
- Angel investment ($100K-250K seed round)
- Grants (educational, open-source)

---

## 11. Appendix

### 11.1 User Research Data

**Target User Personas:**

**Persona 1: "Learning Leo"**
- Age: 22-28
- Role: Junior Developer, Bootcamp Graduate
- Goals: Learn React to get first job, build portfolio projects
- Pain Points: Tutorials are too theoretical, don't know what to build
- Motivation: Career advancement, prove skills to employers
- Tech Savvy: Medium
- Willingness to Pay: Low (student/early career)

**Persona 2: "Productive Paula"**
- Age: 28-35
- Role: Mid-Level Developer, Full-Stack Engineer
- Goals: Ship features faster, reuse common patterns
- Pain Points: Wasting time on boilerplate, manual copy-paste errors
- Motivation: Efficiency, meet deadlines, reduce repetitive work
- Tech Savvy: High
- Willingness to Pay: High ($19/mo is reasonable)

**Persona 3: "Team Lead Tom"**
- Age: 32-40
- Role: Engineering Manager, Tech Lead
- Goals: Standardize team practices, onboard new developers faster
- Pain Points: Inconsistent code patterns, slow onboarding
- Motivation: Team productivity, code quality, knowledge sharing
- Tech Savvy: High
- Willingness to Pay: Very High ($99/mo for team is justified)

### 11.2 Competitive Analysis

**Direct Competitors:**

**Codecademy**
- Strengths: Structured curriculum, large user base, brand recognition
- Weaknesses: Synthetic exercises, no real projects, expensive ($20/mo)
- Differentiation: We use real GitHub projects, AI-personalized paths

**Replit**
- Strengths: Cloud IDE, multiplayer, large community
- Weaknesses: No learning paths, manual setup, expensive ($25/mo)
- Differentiation: We provide AI-guided learning, not just IDE

**FreeCodeCamp**
- Strengths: Free, project-based, large community
- Weaknesses: Static curriculum, no AI, no template extraction
- Differentiation: We offer AI-personalized paths and productivity tools

**Indirect Competitors:**

**GitHub Copilot**
- Strengths: Code completion, widely adopted, $10/mo
- Weaknesses: No learning mode, no template extraction
- Differentiation: We combine learning with productivity

**Cursor**
- Strengths: AI chat, codebase understanding, $20/mo
- Weaknesses: No learning mode, requires local setup
- Differentiation: We offer cloud-based learning and templates

### 11.3 Technical Diagrams

**Data Flow: Learning Mode**
```
User → Frontend → API Route → SQS Queue → AI Worker → Bedrock
                                    ↓
                              DynamoDB (save job)
                                    ↓
                              Poll job status
                                    ↓
                              Frontend updates
```

**Data Flow: Developer Mode**
```
User → Frontend → API Route → SQS Queue → AI Worker → GitHub API
                                    ↓                      ↓
                              DynamoDB (save job)    Fetch code
                                    ↓                      ↓
                              Code Agent (AST analysis)
                                    ↓
                              S3 (save template)
                                    ↓
                              Integration preview
                                    ↓
                              User approves
                                    ↓
                              S3 (update project)
```

**AI Agent Architecture:**
```
Orchestrator
    ├── Curator Agent (GitHub search, repo evaluation)
    ├── Teacher Agent (task generation, content creation)
    ├── Code Agent (template extraction, integration)
    └── Mentor Agent (Q&A, explanations)
```

### 11.4 Legal & Compliance

**Terms of Service:**
- User-generated content ownership
- Platform usage guidelines
- Prohibited activities (abuse, spam)
- Termination conditions
- Liability limitations

**Privacy Policy:**
- Data collection practices
- Data usage and sharing
- Cookie policy
- User rights (access, deletion, export)
- GDPR and CCPA compliance

**License Compliance:**
- Respect open-source licenses
- Detect restrictive licenses (GPL, AGPL)
- Warn users about license requirements
- Provide attribution to original authors
- Community reporting for violations

**Intellectual Property:**
- User owns their code
- Platform owns AI-generated content
- Template creators retain ownership
- License for platform to display/distribute

---

## 12. Decision Log

### Decision 1: Hybrid Architecture (ADR-0001)
**Date:** February 25, 2026  
**Decision:** Use hybrid architecture (Next.js monolith + async AI workers)  
**Alternatives:** Pure monolith, microservices  
**Rationale:** Balances simplicity with scalability, solves timeout issues, cost-effective for MVP  
**Impact:** Moderate complexity, excellent scalability, fast development

### Decision 2: AWS Bedrock for AI
**Date:** February 25, 2026  
**Decision:** Use AWS Bedrock (Claude 3.5 Sonnet + Llama 3.1)  
**Alternatives:** OpenAI API, Anthropic API, open-source models  
**Rationale:** AWS credits available, unified billing, multiple model options, cost optimization  
**Impact:** Vendor lock-in to AWS, but acceptable for MVP

### Decision 3: Freemium Business Model
**Date:** February 25, 2026  
**Decision:** Free Learning Mode + Paid Developer Mode ($19/mo Pro, $99/mo Team)  
**Alternatives:** Fully paid, usage-based, advertising  
**Rationale:** Builds user base with free learning, monetizes professional use, clear value tiers  
**Impact:** Conversion risk, but aligns mission with revenue

### Decision 4: JavaScript Ecosystem First
**Date:** February 25, 2026  
**Decision:** Support React, Vue, Next.js, Node.js in MVP  
**Alternatives:** Multi-language from start, Python first  
**Rationale:** Largest developer audience, unified tech stack, faster MVP  
**Impact:** Limits initial market, but allows focus and quality

### Decision 5: Template Marketplace in Phase 2
**Date:** February 25, 2026  
**Decision:** Launch marketplace 3-6 months post-MVP  
**Alternatives:** Include in MVP, skip entirely  
**Rationale:** Reduces MVP scope, validates core product first, builds creator community gradually  
**Impact:** Delays ecosystem revenue, but ensures quality foundation

---

## 13. Approval & Sign-Off

**Document Status:** Draft  
**Version:** 1.0  
**Date:** February 25, 2026

**Approvals Required:**

| Role | Name | Approval | Date |
|------|------|----------|------|
| Product Manager | [Name] | ⏳ Pending | - |
| Engineering Lead | [Name] | ⏳ Pending | - |
| Design Lead | [Name] | ⏳ Pending | - |
| Stakeholder | [Name] | ⏳ Pending | - |

**Next Steps After Approval:**
1. ✅ PRD approved
2. ⏭️ Create technical specification document
3. ⏭️ Design wireframes and mockups (Figma)
4. ⏭️ Set up project management (Jira/Linear)
5. ⏭️ Begin Sprint 1 (Infrastructure setup)

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 25, 2026 | Product Team | Initial PRD based on Understanding Lock and Design Exploration |

---

**Related Documents:**
- [Understanding Lock](./Understanding.md)
- [Design Exploration](./Design_Explore.md)
- [ADR-0001: Hybrid Architecture](./Design_Explore.md#adr-0001)

---

*End of Product Requirements Document*
