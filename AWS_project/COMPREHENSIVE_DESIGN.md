# CodeLearn MVP - Comprehensive Design Document

**Version:** 1.0  
**Date:** February 26, 2026  
**Status:** Final Design Specification  
**Related Documents:** requirements.md, PRD.md, design.md, tech_stack.md

---

## Document Purpose

This comprehensive design document integrates all requirements from the Requirements Document, Product Requirements Document (PRD), existing Design Specifications, and Technical Stack to provide a complete, implementation-ready blueprint for the CodeLearn MVP.

**CRITICAL FOR AI AGENTS:** This document establishes the SINGLE SOURCE OF TRUTH for all design decisions. When implementing features, you MUST:
1. Follow the exact HTML structures and Tailwind classes provided
2. Use the specified color palette and design tokens
3. Maintain consistency with existing component patterns
4. Never invent new UI patterns without explicit approval

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Design System](#design-system)
4. [Data Models](#data-models)
5. [API Specifications](#api-specifications)
6. [Component Library](#component-library)
7. [Page Specifications](#page-specifications)
8. [User Flows](#user-flows)
9. [Security & Performance](#security--performance)
10. [Implementation Roadmap](#implementation-roadmap)

---

## 1. Executive Summary

### 1.1 Platform Overview

CodeLearn is an AI-powered dual-mode platform that enables developers to:
- **Learning Mode (Free):** Reconstruct real GitHub projects step-by-step with AI guidance
- **Developer Mode (Freemium):** Extract and integrate code templates from open-source repositories

### 1.2 Core Value Proposition

- Transform passive learning into active project reconstruction
- Accelerate development with intelligent template integration
- Professional Git workflow from day one
- Live preview and instant feedback

### 1.3 Technical Foundation


- **Frontend:** Next.js 14 + React 18 + Tailwind CSS 3.4 + shadcn/ui
- **Backend:** Next.js API Routes + AWS Lambda + ECS Fargate
- **AI:** AWS Bedrock (Claude 3.5 Sonnet + Llama 3.1)
- **Database:** DynamoDB + S3
- **Auth:** AWS Cognito (GitHub, Google, Email)
- **Deployment:** Vercel (frontend) + AWS (backend)

### 1.4 MVP Scope

**Phase 1 (Weeks 1-8):**
- User authentication (GitHub, Google, Email)
- Technology selection (React, Vue, Next.js, Node.js)
- AI-powered learning path generation
- Monaco code editor with live preview
- Task-based project reconstruction
- Template library (10-15 curated templates)
- Context-aware template integration
- One-click Vercel deployment
- Auto-save and progress tracking

**Out of Scope for MVP:**
- Template Marketplace
- Team collaboration features
- Multi-language support (Python, Go, Rust)
- Mobile native apps
- Enterprise SSO

---

## 2. System Architecture

### 2.1 High-Level Architecture

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

