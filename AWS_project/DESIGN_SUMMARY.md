# CodeLearn MVP - Design Summary

**Quick Reference Guide**  
**Version:** 1.0  
**Date:** February 26, 2026

---

## 📋 Document Overview

This is the MASTER REFERENCE for CodeLearn MVP design. All implementation must follow these specifications.

### Related Documents
1. **Requirements:** `.kiro/specs/codelearn-mvp/requirements.md` - 30 functional requirements
2. **PRD:** `AWS_project/PRD.md` - Product strategy and business requirements
3. **Design:** `AWS_project/design.md` + `.kiro/specs/codelearn-mvp/design.md` - UI templates
4. **Tech Stack:** `AWS_project/tech_stack.md` - Technology specifications
5. **Design System:** `AWS_project/design/01_DESIGN_SYSTEM.md` - Visual design tokens
6. **Implementation Guide:** `AWS_project/IMPLEMENTATION_GUIDE.md` - Development roadmap

---

## 🎯 Core Concept

**CodeLearn** = AI-Powered Learning + Developer Productivity Platform

### Two Modes

**Learning Mode (FREE):**
- Select technology (React, Vue, Next.js, Node.js)
- AI curates 3 real GitHub projects (beginner → advanced)
- Reconstruct projects step-by-step with AI guidance
- Live preview + auto-save
- Deploy to Vercel
- Build portfolio

**Developer Mode (FREEMIUM):**
- Browse template library (10-15 curated)
- Extract templates from any GitHub repo
- AI performs context-aware integration
- Preview + undo
- 5 integrations/month (free), unlimited (paid)

---

## 🏗️ Architecture

```
Next.js (Vercel) → SQS → Fargate Workers → Bedrock + DynamoDB + S3
```

**Key Decisions:**
- Monolithic Next.js app for simplicity
- Async AI workers to avoid timeouts
- AWS Bedrock for AI (Claude + Llama)
- DynamoDB + S3 for data
- Lambda + Fargate for sandboxes

---

## 🎨 Design System

### Colors
```css
--primary: #6366F1;           /* Indigo 500 */
--dark-bg: #0F172A;           /* Slate 900 */
--card-bg: #1E293B;           /* Slate 800 */
--text-primary: #F8FAFC;      /* Slate 50 */
--text-secondary: #94A3B8;    /* Slate 400 */
--success: #10B981;           /* Emerald 500 */
```

### Typography
```css
--font-sans: 'Inter', sans-serif;
--font-heading: 'Space Grotesk', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Component Examples

**Button:**
```html
<button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]">
  Primary Action
</button>
```

**Card:**
```html
<div class="bg-[#1E293B] p-5 rounded-xl border border-[#334155] hover:border-indigo-500/30 transition-colors">
  <h3 class="text-lg font-semibold text-white mb-2">Card Title</h3>
  <p class="text-sm text-gray-400">Card content</p>
</div>
```

**Input:**
```html
<input 
  type="text"
  class="w-full bg-[#1E293B] border border-[#334155] text-sm text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-500"
  placeholder="Enter text..."
/>
```

---

## 🛠️ Tech Stack

### Frontend
- Next.js 14.2+ (App Router)
- React 18.2+
- Tailwind CSS 3.4+
- shadcn/ui
- Monaco Editor 4.6+
- TanStack Query 5.x

### Backend
- Node.js 20 LTS
- Next.js API Routes
- AWS SQS
- ECS Fargate

### Data
- DynamoDB (on-demand)
- S3 (Standard)
- AWS KMS (encryption)

### AI
- AWS Bedrock
- Claude 3.5 Sonnet (primary)
- Llama 3.1 (fallback)
- LangChain.js 0.1.x

### Infrastructure
- Vercel (hosting)
- AWS Lambda (sandboxes)
- CloudWatch (monitoring)
- Sentry (errors)
- GitHub Actions (CI/CD)

---

## 📊 Data Models

### User
```typescript
{
  userId: string;
  email: string;
  name: string;
  tier: 'free' | 'premium';
  monthlyIntegrations: number;
  integrationLimit: number;  // 5 for free
}
```

### Project
```typescript
{
  projectId: string;
  userId: string;
  title: string;
  technology: 'react' | 'vue' | 'nextjs' | 'nodejs';
  status: 'in-progress' | 'completed';
  progress: number;  // 0-100
  currentTaskId?: string;
}
```

### Task
```typescript
{
  taskId: string;
  projectId: string;
  number: number;
  title: string;
  description: string;
  guidance: string;  // AI-generated
  status: 'pending' | 'in-progress' | 'completed';
}
```

---

## 🔌 Key API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
```

### Learning Mode
```
POST /api/learning/curate
GET  /api/learning/projects/{technology}
GET  /api/learning/project/{projectId}/tasks
POST /api/learning/project/{projectId}/save
```

### Developer Mode
```
GET  /api/developer/templates
POST /api/developer/integrate
GET  /api/developer/integration/{jobId}/preview
POST /api/developer/integration/{jobId}/approve
```

### Sandbox
```
POST /api/sandbox/execute
POST /api/sandbox/deploy
```

---

## 📱 Key Pages

### 1. Landing Page
- Hero with value proposition
- Two-mode explanation
- How it works (3 steps)
- Pricing preview
- Social proof

### 2. Dashboard
- Welcome message
- Stats cards (projects, hours, streak)
- Continue learning section
- Recommended projects
- AI mentor widget

### 3. Technology Selection
- Grid of technology cards
- React, Vue, Next.js, Node.js
- Difficulty indicators
- Project counts

### 4. Learning Path View
- 3 project cards (beginner → advanced)
- Project details and metadata
- GitHub source links
- Start/Continue buttons

### 5. Project Workspace
- Three-panel layout:
  - Left: Task list + file explorer
  - Center: Monaco editor + terminal
  - Right: Live preview + AI mentor
- Auto-save every 30s
- Run/Save/Deploy buttons

### 6. Template Library
- Grid of template cards
- Search and filters
- Technology categories
- Usage limit indicator (free users)

### 7. Portfolio
- Completed projects showcase
- Deployment URLs
- Achievement badges
- Public/private toggles

---

## 🚀 Implementation Phases

### Week 1: Infrastructure
- Next.js setup
- AWS resources
- Vercel deployment
- CI/CD pipeline

### Week 2: Authentication
- Cognito integration
- Login/register pages
- OAuth (GitHub, Google)
- Session management

### Weeks 3-4: Learning Mode Core
- Technology selection
- AI project curation
- Learning path display
- Task breakdown

### Weeks 5-6: Code Editor
- Monaco integration
- Three-panel layout
- Code execution
- Live preview
- Auto-save

### Weeks 6-7: Developer Mode
- Template library
- Template extraction
- Context-aware integration
- Preview + undo

### Weeks 7-8: Polish
- Vercel deployment
- Portfolio page
- Onboarding
- Bug fixes
- Documentation

---

## ✅ Success Criteria

### MVP Launch (Week 8)
- [ ] Users can sign up/login
- [ ] Users can select technology
- [ ] AI returns 3 valid projects
- [ ] Users can view task breakdown
- [ ] Users can write code in editor
- [ ] Code executes and shows preview
- [ ] Auto-save prevents data loss
- [ ] Users can browse templates
- [ ] Template integration works
- [ ] Users can deploy to Vercel

### Metrics (3 months)
- 500+ registered users
- 50+ weekly active users
- 20+ completed learning paths
- 60%+ task completion rate
- 90%+ template integration success
- <3s API response time
- 95%+ uptime
- <2% error rate

---

## 🔒 Security Requirements

- [ ] All data encrypted at rest
- [ ] All data encrypted in transit (TLS 1.3)
- [ ] Input validation on all endpoints
- [ ] CORS policies configured
- [ ] Rate limiting (100 req/min free, 1000 req/min paid)
- [ ] Sandboxes isolated per user
- [ ] No PII in logs
- [ ] OAuth tokens stored securely
- [ ] Password complexity enforced

---

## 📈 Performance Targets

- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- API Response Time (P95): <3s
- Page Load Time (P95): <2s
- AI Response Time (P95): <10s
- Sandbox Execution (P95): <5s

---

## 🎯 Key Requirements

### Must-Have (P0)
1. User authentication (GitHub, Google, Email)
2. Technology selection (React, Vue, Next.js, Node.js)
3. AI learning path generation (3 projects)
4. Task breakdown (10-15 tasks)
5. Monaco code editor
6. Live preview (<5s)
7. Auto-save (30s intervals)
8. Template library (10-15 curated)
9. Context-aware integration
10. One-click Vercel deployment

### Nice-to-Have (P1)
- AI Mentor chat
- User portfolio page
- Achievement badges
- Daily code challenges
- Community activity feed

### Out of Scope
- Template Marketplace
- Team collaboration
- Multi-language support
- Mobile apps
- Enterprise features

---

## 🚨 Critical Rules for Implementation

### For AI Agents

**MUST DO:**
1. Use EXACT HTML structures from design templates
2. Use EXACT Tailwind classes specified
3. Follow color palette precisely
4. Maintain component patterns
5. Implement all P0 requirements
6. Follow tech stack specifications
7. Adhere to data models
8. Use specified API endpoints

**MUST NOT DO:**
1. Invent new UI patterns
2. Change color palette
3. Skip requirements
4. Use different tech stack
5. Modify data models without approval
6. Create new API endpoints without approval
7. Skip security measures
8. Ignore performance targets

### For Developers

**Before Starting:**
1. Read all related documents
2. Review design templates
3. Understand architecture
4. Set up environment variables
5. Provision AWS resources

**During Development:**
1. Follow implementation phases
2. Write tests for critical paths
3. Use TypeScript strict mode
4. Follow ESLint rules
5. Commit with conventional commits
6. Create PRs for review

**Before Deployment:**
1. Run all tests
2. Check performance metrics
3. Verify security checklist
4. Test on multiple browsers
5. Review error handling
6. Update documentation

---

## 📞 Support

### Questions?
1. Check this summary
2. Review [Implementation Guide](IMPLEMENTATION_GUIDE.md)
3. Consult [Design System](design/01_DESIGN_SYSTEM.md)
4. Read [Requirements](../.kiro/specs/codelearn-mvp/requirements.md)
5. Review [PRD](PRD.md)

### Issues?
1. Check error logs (CloudWatch, Sentry)
2. Review API responses
3. Verify environment variables
4. Check AWS resource status
5. Review GitHub Actions logs

---

## 🎉 Ready to Build!

You now have everything needed to implement CodeLearn MVP:
- ✅ Clear requirements (30 functional requirements)
- ✅ Complete design system (colors, typography, components)
- ✅ Detailed architecture (hybrid monolith + async workers)
- ✅ Specified tech stack (Next.js, AWS, Bedrock)
- ✅ Data models (User, Project, Task, etc.)
- ✅ API specifications (REST endpoints)
- ✅ UI templates (HTML + Tailwind)
- ✅ Implementation roadmap (8-week plan)
- ✅ Success metrics (user, engagement, technical)

**Start with Week 1: Infrastructure Setup**

Good luck! 🚀

---

**Last Updated:** February 26, 2026  
**Version:** 1.0  
**Status:** Ready for Development

