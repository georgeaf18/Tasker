# Linear Workflow - Git Commit Integration

## Overview

Every commit in this project should be tied to a Linear issue. This provides:
- **Traceability:** Know why each change was made
- **Context:** Full issue description and acceptance criteria
- **Automation:** Linear automatically links commits to issues
- **Progress tracking:** See which commits are part of which features

---

## Commit Message Format

Use Linear's issue identifier in your commit messages:

```
<type>: <description> (TASK-XX)

Optional body with more details.

Linear: TASK-XX
```

### Examples:

```bash
# Good commit messages
git commit -m "feat: setup PostgreSQL with Docker Compose (TASK-30)"
git commit -m "feat: create Prisma schema and run migrations (TASK-31)"
git commit -m "feat: implement Tasks REST API endpoints (TASK-33)"
git commit -m "feat: build Kanban board with drag-and-drop (TASK-39)"
git commit -m "fix: correct task status update in API (TASK-33)"
git commit -m "docs: add API documentation (TASK-46)"
```

---

## Commit Types

Follow conventional commits:

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation only changes
- **style:** Formatting, missing semi-colons, etc (no code change)
- **refactor:** Code change that neither fixes a bug nor adds a feature
- **perf:** Performance improvement
- **test:** Adding or updating tests
- **chore:** Changes to build process or auxiliary tools

---

## Workflow: From Linear Issue to Commit

### 1. Pick an Issue from Linear

Go to your [v0.1 project](https://linear.app/taskerapp/project/v01-alpha-the-visual-core-659947102561) and pick an issue to work on.

Example: **TASK-30: Setup PostgreSQL with Docker Compose**

### 2. Create a Branch (Optional but Recommended)

Linear provides a suggested branch name:

```bash
git checkout -b georgeaf1825/task-30-setup-postgresql-with-docker-compose
```

Or use your own naming:

```bash
git checkout -b feature/task-30-postgres-setup
```

### 3. Update Issue Status in Linear

Move the issue to **"In Progress"** in Linear.

### 4. Do the Work

Follow the acceptance criteria in the issue description.

### 5. Commit Your Changes

Reference the issue in your commit:

```bash
git add docker-compose.yml .env.example
git commit -m "feat: setup PostgreSQL with Docker Compose (TASK-30)

- Create docker-compose.yml with postgres:16-alpine
- Configure environment variables
- Add volume mapping for data persistence
- PostgreSQL accessible on port 5432

Linear: TASK-30"
```

### 6. Push and Create PR (If Using Branches)

```bash
git push -u origin georgeaf1825/task-30-setup-postgresql-with-docker-compose
```

Then create a PR on GitHub with:
- Title: Same as commit message
- Description: Link to Linear issue and list acceptance criteria checked off

### 7. Update Linear Issue

Once merged/completed:
- Mark issue as **"Done"** in Linear
- Linear will automatically show linked commits

---

## Linear Automation

Linear automatically detects:

- **Commit references:** Mentions like `TASK-30` or `Linear: TASK-30`
- **Branch names:** Branches named `*/task-30-*`
- **PR links:** GitHub PRs linked to issues

### What Linear Shows:

- All commits that reference an issue
- GitHub PR status
- Git branch information
- Timeline of code changes

---

## Quick Reference Table

| Scenario | Branch Name | Commit Message |
|----------|-------------|----------------|
| New feature | `feature/task-33-tasks-api` | `feat: implement Tasks REST API (TASK-33)` |
| Bug fix | `fix/task-33-status-update` | `fix: correct task status update (TASK-33)` |
| Multiple issues | `feature/task-39-40-ui` | `feat: build kanban and sidebar (TASK-39, TASK-40)` |
| Work in progress | `wip/task-42-layout` | `wip: scaffold main layout (TASK-42)` |

---

## Working on Multiple Issues

If a commit touches multiple issues:

```bash
git commit -m "feat: integrate kanban board with state service (TASK-38, TASK-39)

Connects KanbanBoardComponent with TaskStateService for
reactive task updates.

Linear: TASK-38, TASK-39"
```

---

## Issue Dependencies

Some issues depend on others. Check the **Dependencies** section in each issue:

**Example:** TASK-33 depends on TASK-32 (PrismaService)

1. Complete TASK-32 first
2. Commit and mark as done
3. Then start TASK-33

This ensures logical progression and avoids blockers.

---

## v0.1 Issue List (Created)

### Backend Infrastructure
- **TASK-30:** Setup PostgreSQL with Docker Compose
- **TASK-31:** Initialize Prisma and create database schema
- **TASK-32:** Create Prisma service and module in NestJS
- **TASK-33:** Implement Tasks REST API endpoints ⭐ (Critical)
- **TASK-34:** Implement Channels REST API endpoints
- **TASK-35:** Create database seed script with test data

### Frontend Infrastructure
- **TASK-36:** Configure Angular 20 with zoneless and Tailwind CSS ⭐ (Critical)
- **TASK-37:** Create Task API service with HttpClient
- **TASK-38:** Create signal-based Task state service ⭐ (Critical)

### Frontend Features
- **TASK-39:** Build Kanban board component with drag-and-drop ⭐ (Critical)
- **TASK-40:** Build backlog sidebar component ⭐ (Critical)
- **TASK-41:** Create task creation and edit form
- **TASK-42:** Build main app layout and routing ⭐ (Critical)
- **TASK-43:** Apply design system styling and accessibility

### Testing & Deployment
- **TASK-44:** Write E2E tests for critical user flows
- **TASK-45:** Create Docker setup and GitHub Actions deployment ⭐ (Critical)
- **TASK-46:** Update README and project documentation

**Total:** 17 issues
**Critical Path:** TASK-30 → 31 → 32 → 33 → 36 → 37 → 38 → 39 → 40 → 42 → 45

---

## Tips

### 1. Small, Focused Commits
Better to have multiple small commits per issue than one giant commit.

```bash
# Good
git commit -m "feat: create Prisma schema models (TASK-31)"
git commit -m "feat: generate initial migration (TASK-31)"
git commit -m "feat: configure Prisma client generation (TASK-31)"

# Less ideal
git commit -m "feat: complete all Prisma setup (TASK-31)"
```

### 2. Verify Before Committing
Check the issue's acceptance criteria before committing:

```bash
# Before committing, ask yourself:
# - Did I complete all acceptance criteria?
# - Are there tests?
# - Does it follow the design system?
```

### 3. Update Issue Comments
Add comments to Linear issues with:
- Implementation notes
- Challenges encountered
- Decisions made
- Screenshots (for UI work)

### 4. Close Issues When Done
Don't leave issues in "In Progress" if they're complete. Update status to "Done".

---

## GitHub Actions Integration

When you push with issue references, our CI will:

1. Run tests
2. Build Docker images (on main branch)
3. Deploy to production (on main branch)
4. Update Linear issue with deployment status

Make sure your commit message includes the issue number for full automation!

---

## Example: Full Workflow for TASK-30

```bash
# 1. Pick issue TASK-30 from Linear (move to "In Progress")

# 2. Create branch
git checkout -b georgeaf1825/task-30-setup-postgresql-with-docker-compose

# 3. Do the work
# ... create docker-compose.yml, .env.example ...

# 4. Commit
git add docker-compose.yml .env.example
git commit -m "feat: setup PostgreSQL with Docker Compose (TASK-30)

- postgres:16-alpine with volume persistence
- environment variables for user/password/db
- accessible on localhost:5432

All acceptance criteria met.

Linear: TASK-30"

# 5. Push
git push -u origin georgeaf1825/task-30-setup-postgresql-with-docker-compose

# 6. Verify in Linear
# - Check that commit appears in TASK-30
# - Update status to "Done"

# 7. Continue with next issue (TASK-31)
git checkout main
git pull
git checkout -b georgeaf1825/task-31-prisma-schema
```

---

## Questions?

Check:
- [Linear Documentation](https://linear.app/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- Project docs: `docs/VERSION_ROADMAP.md`

---

**Last Updated:** 2025-11-12
**Project:** Tasker v0.1 Alpha
