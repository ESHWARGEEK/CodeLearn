# Understanding Lock - AI Learning & Developer Productivity Platform

**Date:** February 25, 2026  
**Status:** Confirmed  
**Phase:** Design Ready

---

## Understanding Summary

### What We're Building

An AI-powered dual-mode platform that enables learning through project reconstruction and accelerates development through intelligent code template integration, with a sustainable freemium business model.

### Two Core Modes

#### 1. Learning Mode (FREE)
Users select a technology (starting with JavaScript ecosystem), AI finds multiple GitHub projects (beginner → advanced), breaks them into buildable tasks, and guides users to recreate projects step-by-step with live preview in AWS cloud sandboxes.

#### 2. Developer Mode (FREEMIUM)
AI extracts reusable components from any open-source repo, analyzes user's existing codebase context, automatically integrates templates with instant preview and undo capability.

**Pricing Tiers:**
- **Free:** 5 template integrations/month
- **Developer Pro:** $19/mo unlimited integrations
- **Team:** $99/mo for 5 users with collaboration features (shared projects, comments, code reviews)

### Why It Exists

To meaningfully apply agentic AI to solve "AI for Learning & Developer Productivity" while building a sustainable business through professional developer tools.

### Target Users

- **Primary:** Developers learning new technologies (free users → conversion funnel)
- **Secondary:** Professional developers needing productivity tools (paying customers)
- **Tertiary:** Development teams and enterprises (higher-value customers)

### Business Model

- **Free Learning Mode** - Builds user base, educational mission, conversion funnel
- **Paid Developer Mode** - Core revenue stream ($19/mo individual, $99/mo team)
- **Template Marketplace** - Ecosystem revenue (80/20 creator split, platform takes 20%)
- **Revenue Projection:** 1000 users → 50-100 paid ($950-1900/mo) + marketplace revenue
- **Cost Structure:** AWS credits cover MVP phase, sustainable post-credits with paid tiers

### Key Constraints

- MVP scale: 10-100 concurrent users (expandable with AWS auto-scaling)
- JavaScript ecosystem first (React, Vue, Node.js, Next.js, etc.)
- Multiple auth options (GitHub, Google, email via AWS Cognito)
- Full project lifecycle: learn → build → deploy (Vercel/Netlify) → portfolio

### Explicit Non-Goals

- Multi-language support in MVP (Python, Go, etc. come post-MVP)
- Enterprise SSO/SAML (Team tier post-MVP feature)
- Real-time pair programming (future consideration)
- Mobile native apps (web-responsive only)
- Competing with GitHub Copilot (different use case: learning + templates vs. code completion)

---

## Core Assumptions

### Technical Architecture

1. **AI Provider:** AWS Bedrock (Claude/Llama models for cost optimization)

2. **Agent System:** Hybrid architecture with core agents:
   - **Curator Agent** - Finds and evaluates GitHub repos
   - **Teacher Agent** - Generates learning content from repos
   - **Code Agent** - Extracts templates, performs integrations
   - **Mentor Agent** - Answers questions, provides guidance

3. **Execution Environment:**
   - AWS Lambda for quick code execution and previews
   - ECS Fargate containers for full development sessions
   - Cost-optimized hybrid approach

4. **Storage:** S3 for user projects, DynamoDB for metadata/progress

5. **Authentication:** AWS Cognito with GitHub/Google/Email

6. **Frontend:** React/Next.js with Monaco editor

7. **Deployment Integration:** Vercel/Netlify APIs for one-click deploy

### Learning Experience

8. Context-aware template extraction using AI analysis
9. Progressive curriculum: beginner → intermediate → advanced projects
10. Guided learning with flexibility to skip ahead
11. Task-based reconstruction with AI assistance
12. Instant integration with live preview and undo capability
13. Auto-save every 30 seconds

### Business Model

14. 5-10% conversion rate from free to paid (industry standard)
15. $19/mo competitive with similar tools (Cursor $20, Replit $25)
16. Template marketplace launches 3-6 months post-MVP
17. **Marketplace Quality Control:** User ratings (1-5 stars), download counts, AI quality checks
18. **Team Collaboration Features:** Shared projects, inline comments, code review workflow
19. Free learning mode sustainable through Developer Mode revenue

### Operational

20. **Performance:** Sub-5 second response times for MVP
21. **Security:** S3 encryption, isolated Fargate containers, Cognito OAuth
22. **Reliability:** 95% uptime target, AWS auto-scaling, graceful degradation
23. **Rate Limits:**
    - Free Learning: Unlimited
    - Free Developer: 5 integrations/month
    - Paid: Unlimited with fair use policy
24. **Browser Support:** Chrome, Firefox, Safari, Edge (last 2 versions)
25. **Data Retention:** Projects stored indefinitely while active, 1-year grace period

---

## Technology Stack (Confirmed)

### Frontend
- **Framework:** Next.js 14 (React, App Router)
- **UI Library:** Tailwind CSS + shadcn/ui
- **Code Editor:** Monaco Editor (VS Code engine)
- **State Management:** React Context + TanStack Query

### Backend
- **Runtime:** Node.js on AWS Lambda
- **API:** Next.js API routes + AWS API Gateway
- **Database:** DynamoDB (user data, progress) + S3 (projects, templates)
- **Authentication:** AWS Cognito

### AI/ML
- **Provider:** AWS Bedrock
- **Models:** Claude 3.5 Sonnet (primary), Llama 3 (cost optimization)
- **Agent Framework:** LangChain or custom orchestration

### Infrastructure
- **Hosting:** Vercel (frontend) + AWS (backend/sandboxes)
- **Sandboxes:** AWS Lambda + ECS Fargate (hybrid)
- **CDN:** CloudFront
- **Monitoring:** CloudWatch + Sentry

### Integrations
- GitHub API (repo search, OAuth)
- Vercel API (deployment)
- Netlify API (deployment alternative)
- Stripe (payments for Developer Pro/Team)

---

## MVP Scope (Phase 1 - 8-12 weeks)

### Learning Mode
- Technology selection (React, Vue, Next.js, Node.js)
- GitHub repo discovery with filters
- AI-generated learning paths (3 projects: beginner → intermediate → advanced)
- Task breakdown and guided reconstruction
- Live preview in Lambda/Fargate sandboxes
- Progress tracking and auto-save
- One-click deployment to Vercel

### Developer Mode (Free tier only)
- Template extraction from GitHub repos
- 5 integrations/month limit
- Context-aware code integration
- Live preview with undo
- Basic template library (curated by team)

### Core Infrastructure
- User authentication (GitHub, Google, email)
- Project storage and management
- Basic analytics dashboard
- Responsive web UI

### Out of MVP
- Developer Pro/Team subscriptions (Phase 2)
- Template Marketplace (Phase 2)
- Team collaboration features (Phase 2)
- Additional languages beyond JavaScript (Phase 3)
- Mobile optimization (Phase 3)

---

## Success Metrics

### User Acquisition (3 months post-launch)
- 500+ registered users
- 50+ active weekly users
- 20+ completed learning paths

### Engagement
- Average 3+ sessions per user per week
- 60%+ task completion rate
- 4+ star average user rating

### Conversion (6 months post-launch)
- 5-10% free to paid conversion
- 25-50 Developer Pro subscribers
- 3-5 Team subscriptions
- $950-1900 MRR

### Technical
- <3 second average response time
- 95%+ uptime
- <2% error rate
- <$500/month AWS costs (within credits)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| AWS credits run out before revenue | Medium | High | Aggressive conversion optimization, usage limits |
| Low free-to-paid conversion | Medium | High | Strong onboarding, clear value prop, trial incentives |
| Template quality issues | Medium | Medium | AI quality checks, user ratings, manual review |
| GitHub API rate limits | Low | Medium | Caching, request optimization, paid GitHub tier |
| Sandbox security vulnerabilities | Low | Critical | Container isolation, security audits, AWS best practices |
| Slow AI response times | Medium | Medium | Model optimization, caching, hybrid approach |
| License compliance for templates | Medium | High | Legal review, license detection, user disclaimers |

---

## Open Questions

### Resolved
✅ AI model/provider → AWS Bedrock (Claude/Llama)  
✅ Cloud sandbox provider → AWS (Lambda + Fargate hybrid)  
✅ Priority technologies → JavaScript ecosystem  
✅ Template quality control → User ratings + AI checks  
✅ Team collaboration features → Shared projects, comments, reviews

### Remaining
1. Should we support private GitHub repos in MVP? (Requires GitHub App, more complex auth)
2. What's the fallback if Bedrock is unavailable? (OpenAI backup? Graceful degradation?)
3. How to handle repos with restrictive licenses? (Auto-detect and warn users?)

---

## Next Steps

1. ✅ Understanding Lock confirmed
2. ⏭️ Design exploration (2-3 architecture approaches)
3. ⏭️ Create detailed PRD
4. ⏭️ Implementation planning
5. ⏭️ Development kickoff

---

**Status:** Ready for Design Phase  
**Last Updated:** February 25, 2026
