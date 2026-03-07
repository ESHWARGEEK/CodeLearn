# CodeLearn - AI Learning & Developer Productivity Platform

> Build real projects faster with AI-guided learning and smart code templates

## 🎯 **HACKATHON VERSION V4 FINAL** - 100% PRD Coverage! 🔥

**👉 START HERE:** [HACKATHON_PLAN_V4_FINAL.md](./HACKATHON_PLAN_V4_FINAL.md) ⚡ **COMPLETE PRD - ALL 69 FEATURES!**

**Budget:** $90 AWS Credits → **Will use ~$78 (86%)**  
**Timeline:** 4-5 weeks (160 hours)  
**Users:** 1-10 max  
**Features:** 100% of PRD (69/69 features) - EVERYTHING!

### 🏆 What's Included (100% PRD)
- ✅ All 4 AI Agents (Curator, Teacher, Code, Mentor)
- ✅ Complete Learning Mode (5 languages)
- ✅ Complete Developer Mode (30+ templates)
- ✅ Payments & Subscriptions (Stripe)
- ✅ Team Collaboration
- ✅ Template Marketplace
- ✅ Real-time Updates (WebSocket)
- ✅ Analytics Dashboard
- ✅ Portfolio & Deployment
- ✅ Python Support

### Hackathon Documents (V4 - FINAL - 100% PRD!)
- **[HACKATHON_PLAN_V4_FINAL.md](./HACKATHON_PLAN_V4_FINAL.md)** - 🔥 **100% PRD (69/69 features)**
- **[HACKATHON_COMPARISON.md](./HACKATHON_COMPARISON.md)** - Compare all versions
- **[HACKATHON_PLAN_V3.md](./HACKATHON_PLAN_V3.md)** - V3 (90% PRD)
- **[HACKATHON_PLAN_V2.md](./HACKATHON_PLAN_V2.md)** - V2 (40% PRD)
- **[HACKATHON_PLAN.md](./HACKATHON_PLAN.md)** - V1 (30% PRD)

---

## 📚 Project Documentation

### Core Documents
- **[TODO.md](./TODO.md)** - Complete task tracker (120+ tasks, 8-12 week timeline)
- **[PRD.md](./PRD.md)** - Product Requirements Document
- **[tech_stack.md](./tech_stack.md)** - Technical specifications and stack
- **[design.md](./design.md)** - UI/UX design system and templates
- **[COST_ESTIMATE.md](./COST_ESTIMATE.md)** - Detailed cost breakdown and projections
- **[COST_SUMMARY.md](./COST_SUMMARY.md)** - Quick cost reference

### Workflow & Process
- **[GIT_WORKFLOW.md](./GIT_WORKFLOW.md)** - Detailed Git workflow guide (Pull Request based)
- **[WORKFLOW_SUMMARY.md](./WORKFLOW_SUMMARY.md)** - Quick workflow overview
- **[pr_template.md](./pr_template.md)** - Pull request template
- **[.github/pull_request_template.md](./.github/pull_request_template.md)** - GitHub PR template (auto-loads)

### Planning & Architecture
- **[Understanding.md](./Understanding.md)** - Project understanding and analysis
- **[Design_Explore.md](./Design_Explore.md)** - Design exploration and decisions
- **[stitch_design_prompt.md](./stitch_design_prompt.md)** - Design system prompt

## 🚀 Quick Start

### 1. Read the Documentation
```bash
# Start here
1. Read COST_SUMMARY.md to understand budget (5 min)
2. Read WORKFLOW_SUMMARY.md for process (5 min)
3. Skim TODO.md to see all tasks (10 min)
4. Review GIT_WORKFLOW.md for detailed process (15 min)
```

### 2. Set Up Your Environment
```bash
# Clone repository
git clone <your-repo-url>
cd codelearn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Start Your First Task
```bash
# Create feature branch
git checkout -b feat/INFRA-001-aws-setup

# Work on task (see TODO.md for details)
# ...

# Commit and push
git add .
git commit -m "feat: INFRA-001 Complete AWS infrastructure setup"
git push origin feat/INFRA-001-aws-setup

# Create PR on GitHub
```

## 🎯 Project Overview

### What is CodeLearn?
An AI-powered platform with two modes:
1. **Learning Mode** - Learn by rebuilding real GitHub projects with AI guidance
2. **Developer Mode** - Extract and integrate code templates from open-source repos

### Tech Stack
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js 20
- **AI:** AWS Bedrock (Claude 3.5 Sonnet, Llama 3.1)
- **Database:** DynamoDB, S3
- **Infrastructure:** AWS (Lambda, Fargate, SQS, Cognito)
- **Deployment:** Vercel

### Timeline
- **Phase 1 (MVP):** Weeks 1-8 (March 1 - May 15, 2026)
- **Phase 2 (Monetization):** Weeks 9-12
- **Phase 3 (Scale):** Post-MVP

## 📋 Development Workflow

### Every Task Follows This Pattern:
1. Create feature branch: `git checkout -b feat/TASK-ID-description`
2. Make changes and commit: `git commit -m "feat: TASK-ID Description"`
3. Push to GitHub: `git push origin feat/TASK-ID-description`
4. Create Pull Request (use template)
5. Review and merge (squash and merge)
6. Update main: `git checkout main && git pull`
7. Mark task complete in TODO.md

**See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) for detailed instructions**

## 📊 Progress Tracking

### Current Status
- **Phase:** Week 1 - Infrastructure Setup
- **Progress:** 0% Complete
- **Tasks Completed:** 0/120
- **Next Milestone:** Infrastructure Setup

### Task Status Legend
- 🔴 TODO - Not started
- 🟡 IN PROGRESS - Currently working
- 🟢 TESTING - Testing in progress
- ✅ DONE - Completed and merged
- ⏸️ BLOCKED - Waiting on dependency
- ❌ CANCELLED - No longer needed

## 🏗️ Project Structure

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

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run unit tests (Vitest)
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:coverage    # Generate coverage report

# Git Workflow
git checkout -b feat/TASK-ID-description  # Create branch
git push origin feat/TASK-ID-description  # Push branch
```

## 📖 Key Features

### Learning Mode (FREE)
- AI-curated project curriculum
- Step-by-step task breakdown
- Monaco code editor
- Live preview sandboxes
- AI Mentor assistance
- One-click deployment
- Progress tracking

### Developer Mode (FREEMIUM)
- Template extraction from GitHub
- Context-aware code integration
- Instant preview with undo
- Template library with search
- 5 integrations/month (free)
- Unlimited (paid)

## 💰 Pricing Strategy

- **Free:** Unlimited Learning Mode + 5 template integrations/month
- **Pro ($19/mo):** Unlimited integrations + AI Mentor priority
- **Team ($99/mo):** 5 users + collaboration features

## 🔐 Environment Variables

Required variables (see `.env.example`):
```bash
# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<secret>
AWS_SECRET_ACCESS_KEY=<secret>

# Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<pool_id>
NEXT_PUBLIC_COGNITO_CLIENT_ID=<client_id>

# Bedrock
BEDROCK_MODEL_CLAUDE=anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_MODEL_LLAMA=meta.llama3-1-70b-instruct-v1:0

# GitHub
GITHUB_CLIENT_ID=<client_id>
GITHUB_CLIENT_SECRET=<secret>

# Vercel
VERCEL_TOKEN=<token>
```

## 🧪 Testing Strategy

- **Unit Tests:** Utilities, helpers, pure functions (Vitest)
- **Integration Tests:** API routes, database operations
- **E2E Tests:** Critical user flows (Playwright)
- **Target Coverage:** 70%+

## 📈 Success Metrics

### 3 Months Post-Launch
- 500+ registered users
- 50+ weekly active users
- 20+ completed learning paths
- 5-10% free-to-paid conversion

### 6 Months Post-Launch
- 5,000+ users
- 25-50 paid subscribers
- $950-1,900 MRR
- <5% churn rate

## 🤝 Contributing

1. Pick a task from TODO.md
2. Follow the workflow in GIT_WORKFLOW.md
3. Create a PR using the template
4. Wait for review and CI checks
5. Merge and celebrate! 🎉

## 📝 License

[Add your license here]

## 🙏 Acknowledgments

- Design system inspired by modern SaaS platforms
- AI agents powered by AWS Bedrock
- UI components from shadcn/ui

---

## 📞 Support

- **Documentation:** See docs in this folder
- **Issues:** Create a GitHub issue
- **Questions:** Check GIT_WORKFLOW.md or WORKFLOW_SUMMARY.md

---

**Ready to build?** Start with [WORKFLOW_SUMMARY.md](./WORKFLOW_SUMMARY.md) and pick your first task from [TODO.md](./TODO.md)!

**Last Updated:** February 26, 2026
