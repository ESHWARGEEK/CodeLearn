# Git Workflow Guide - Pull Request Based Development

## 🔄 Standard Workflow for Each Task

### Step 1: Create Feature Branch
```bash
# Format: <type>/<TASK-ID>-<brief-description>
git checkout main
git pull origin main
git checkout -b feat/INFRA-001-aws-setup
```

### Step 2: Make Changes & Commit
```bash
# Make your code changes
git add .
git commit -m "feat: INFRA-001 Complete AWS infrastructure setup"
```

### Step 3: Push to GitHub
```bash
git push origin feat/INFRA-001-aws-setup
```

### Step 4: Create Pull Request
1. Go to GitHub repository
2. Click "Compare & pull request" button (appears after push)
3. Fill in PR details using template:
   - **Title:** `[INFRA-001] Complete AWS infrastructure setup`
   - **Description:** Use the PR template (see pr_template.md)
4. Assign yourself as reviewer
5. Add appropriate labels
6. Click "Create pull request"

### Step 5: Review & Merge
1. Review your own code for quality
2. Wait for CI/CD checks to pass (lint, test, build)
3. Merge using "Squash and merge"
4. Delete the feature branch

### Step 6: Update Local Main
```bash
git checkout main
git pull origin main
```

### Step 7: Update TODO.md
- Mark task as ✅ DONE
- Update progress percentage
- Commit the todo.md update directly to main

---

## 📝 Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feat/<TASK-ID>-<description>` | `feat/AUTH-001-cognito-integration` |
| Bug Fix | `fix/<TASK-ID>-<description>` | `fix/LM-006-sandbox-timeout` |
| Style | `style/<TASK-ID>-<description>` | `style/UI-001-dashboard-layout` |
| Test | `test/<TASK-ID>-<description>` | `test/TEST-001-unit-tests` |
| Docs | `docs/<description>` | `docs/readme-update` |
| Refactor | `refactor/<TASK-ID>-<description>` | `refactor/AUTH-003-extract-logic` |
| Performance | `perf/<TASK-ID>-<description>` | `perf/SCALE-001-redis-cache` |
| CI/CD | `ci/<TASK-ID>-<description>` | `ci/INFRA-004-github-actions` |

---

## 💬 Commit Message Format (Conventional Commits)

### Format
```
<type>: [TASK-ID] <description>

[optional body]

[optional footer]
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style/formatting (not CSS)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes
- `build:` - Build system changes

### Examples
```bash
# Feature
git commit -m "feat: AUTH-001 Implement AWS Cognito authentication"

# Bug fix
git commit -m "fix: LM-006 Resolve sandbox execution timeout"

# Style
git commit -m "style: UI-001 Update dashboard card styling"

# Test
git commit -m "test: TEST-001 Add unit tests for auth utilities"

# With body
git commit -m "feat: DM-002 Implement template extraction

- Added AST analysis for code parsing
- Implemented quality checks
- Integrated with SQS for async processing"
```

---

## 🔍 Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Task ID
[TASK-ID] - Brief description

## Changes Made
- [ ] Implemented feature X
- [ ] Added tests for Y
- [ ] Updated documentation

## Testing Done
- [ ] Manual testing completed
- [ ] Unit tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Tested on Chrome, Firefox, Safari

## Screenshots (if UI changes)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Responsive design tested (mobile, tablet, desktop)

## Related Issues
Closes #[issue-number] (if applicable)
```

---

## 🚀 Quick Reference Commands

### Start New Task
```bash
git checkout main
git pull origin main
git checkout -b feat/TASK-ID-description
```

### Commit & Push
```bash
git add .
git commit -m "feat: TASK-ID Description"
git push origin feat/TASK-ID-description
```

### After PR Merged
```bash
git checkout main
git pull origin main
git branch -d feat/TASK-ID-description  # Delete local branch
```

### Update TODO.md
```bash
git checkout main
git add AWS_project/todo.md
git commit -m "docs: Update TODO.md - Mark TASK-ID as complete"
git push origin main
```

---

## 🛡️ Branch Protection Rules (Recommended)

Configure on GitHub:
1. Go to Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass (CI/CD)
   - ✅ Require branches to be up to date
   - ✅ Require linear history (squash merge)
   - ✅ Delete head branches automatically

---

## 📊 Example Workflow for INFRA-001

```bash
# 1. Create branch
git checkout main
git pull origin main
git checkout -b feat/INFRA-001-aws-setup

# 2. Make changes (set up AWS services)
# ... work on task ...

# 3. Commit
git add .
git commit -m "feat: INFRA-001 Complete AWS infrastructure setup

- Created S3 buckets for projects, templates, and assets
- Set up DynamoDB tables with proper indexes
- Configured Cognito User Pool with OAuth providers
- Created SQS queues for async job processing
- Set up CloudWatch log groups"

# 4. Push
git push origin feat/INFRA-001-aws-setup

# 5. Create PR on GitHub
# - Go to repo, click "Compare & pull request"
# - Fill in template
# - Create PR

# 6. Review & Merge
# - Check CI passes
# - Review code
# - Squash and merge

# 7. Clean up
git checkout main
git pull origin main
git branch -d feat/INFRA-001-aws-setup

# 8. Update TODO
# Edit AWS_project/todo.md - mark INFRA-001 as ✅ DONE
git add AWS_project/todo.md
git commit -m "docs: Mark INFRA-001 as complete"
git push origin main
```

---

## ⚠️ Important Notes

1. **Never commit directly to main** - Always use feature branches and PRs
2. **Keep PRs focused** - One task = one PR
3. **Write descriptive commit messages** - Future you will thank you
4. **Review your own code** - Catch issues before merging
5. **Delete branches after merge** - Keep repo clean
6. **Update TODO.md regularly** - Track progress accurately
7. **Use squash merge** - Keep main branch history clean
8. **Run tests before pushing** - Ensure CI will pass

---

## 🔧 Troubleshooting

### Forgot to create branch
```bash
# Stash changes
git stash

# Create branch
git checkout -b feat/TASK-ID-description

# Apply changes
git stash pop
```

### Need to update branch with main
```bash
git checkout main
git pull origin main
git checkout feat/TASK-ID-description
git rebase main
# Resolve conflicts if any
git push origin feat/TASK-ID-description --force-with-lease
```

### Accidentally committed to main
```bash
# Create branch from current state
git branch feat/TASK-ID-description

# Reset main to remote
git reset --hard origin/main

# Switch to feature branch
git checkout feat/TASK-ID-description
```

---

**Last Updated:** February 26, 2026
