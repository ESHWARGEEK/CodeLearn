# How to Create a Pull Request - Step by Step Guide

## 🚀 Quick Steps

### Option A: Direct Link (Fastest)

1. **Click this link:**
   ```
   https://github.com/ESHWARGEEK/CodeLearn/compare/main...feature/task-1-project-setup
   ```

2. **Click the green "Create pull request" button**

3. **Fill in the details:**
   - **Title:** `Project Setup and Infrastructure Foundation`
   - **Description:** See below

4. **Click "Create pull request"**

5. **Review and merge:**
   - Click "Merge pull request"
   - Click "Confirm merge"
   - Optionally delete the branch after merge

---

### Option B: From Repository Page

1. **Go to:** https://github.com/ESHWARGEEK/CodeLearn

2. **Look for the yellow banner** at the top that says:
   > "feature/task-1-project-setup had recent pushes"

3. **Click "Compare & pull request"** button

4. **Fill in the PR form** (see details below)

5. **Create and merge**

---

## 📝 PR Details to Copy-Paste

### Title:
```
Project Setup and Infrastructure Foundation
```

### Description:
```markdown
## Summary
Completes Task 1 of the CodeLearn Platform - establishes foundational project structure with Next.js 14, TypeScript, and all required development tools.

## Changes Made
- ✅ Initialized Next.js 14.2.18 with App Router and TypeScript 5.3+
- ✅ Configured Tailwind CSS 3.4+ with custom theme
- ✅ Installed and configured shadcn/ui components (Button, Card, Dialog, Input)
- ✅ Set up ESLint, Prettier, Husky, and lint-staged
- ✅ Configured Vitest 1.x for unit tests and Playwright 1.x for E2E tests
- ✅ Created complete directory structure (app/, components/, lib/, types/, tests/)
- ✅ Set up .env.example with all required AWS, Cognito, GitHub, Vercel variables
- ✅ Initialized Git repository with conventional commits configuration
- ✅ Created TODO.md for tracking development progress

## Verification
- ✅ Build passes successfully
- ✅ No linting errors
- ✅ No type errors
- ✅ All configurations tested

## Commits
1. `feat: initialize Next.js 14 project with TypeScript and Tailwind CSS`
2. `chore: update dependencies for project setup`
3. `docs: add TODO.md for tracking development progress`

## Related Files
- Spec: `.kiro/specs/codelearn-platform/tasks.md`
- Tech Stack: `AWS_project/tech_stack.md`

## Next Steps
After merge: Begin Task 2 - AWS Infrastructure Setup with CDK
```

---

## 🔄 After Merging the PR

Once the PR is merged, run these commands in your terminal:

```bash
# Switch back to main branch
git checkout main

# Pull the latest changes (including your merged PR)
git pull origin main

# Verify you're up to date
git log --oneline -3

# Delete the feature branch locally (optional cleanup)
git branch -d feature/task-1-project-setup
```

---

## 📸 Visual Reference

When you open the PR link, you'll see:

1. **Base branch:** `main` ← This is where code will be merged TO
2. **Compare branch:** `feature/task-1-project-setup` ← This is your feature branch
3. **Green "Create pull request" button** ← Click this
4. **PR form** ← Fill in title and description
5. **"Create pull request" button** ← Click to create
6. **"Merge pull request" button** ← Click to merge (after review if needed)
7. **"Confirm merge" button** ← Final confirmation

---

## ✅ Checklist

Before creating PR:
- [x] All changes committed
- [x] Branch pushed to GitHub
- [x] Build passes locally
- [x] No linting errors

After creating PR:
- [ ] PR created on GitHub
- [ ] PR reviewed (if team review required)
- [ ] PR merged to main
- [ ] Local main branch updated
- [ ] Feature branch deleted (optional)

---

## 🆘 Troubleshooting

**Problem:** "No changes to merge"
- **Solution:** Make sure you pushed your branch: `git push origin feature/task-1-project-setup`

**Problem:** "Conflicts detected"
- **Solution:** Pull latest main and resolve conflicts:
  ```bash
  git checkout feature/task-1-project-setup
  git pull origin main
  # Resolve conflicts
  git add .
  git commit -m "fix: resolve merge conflicts"
  git push
  ```

**Problem:** Can't find the yellow banner
- **Solution:** Use the direct link or go to "Pull requests" tab → "New pull request"

---

## 🎯 Quick Reference

**Repository:** https://github.com/ESHWARGEEK/CodeLearn
**Direct PR Link:** https://github.com/ESHWARGEEK/CodeLearn/compare/main...feature/task-1-project-setup
**Current Branch:** feature/task-1-project-setup
**Target Branch:** main
