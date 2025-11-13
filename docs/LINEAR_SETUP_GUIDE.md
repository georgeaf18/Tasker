# Linear Workspace Setup Guide

This guide walks you through setting up the Tasker project in Linear.

## Step 1: Create Project

1. Go to Linear → Create new project
2. **Name:** Tasker
3. **Identifier:** TASK
4. **Description:**

   ```
   ADHD-friendly, dyslexia-friendly task management application for visual learners.

   Solves: Backlog visibility + overwhelm-free task organization
   ```

## Step 2: Create Milestones

Create the following milestones in order:

### Alpha (v0.1)

- **Name:** Alpha (v0.1)
- **Target Date:** 2025-11-18 (1 week from now)
- **Description:**

  ```
  MVP: Backlog sidebar + basic kanban board

  Goal: See all tasks in one place without overwhelm
  Success: Using daily instead of Sunsama for basic tracking
  ```

### v0.2

- **Name:** v0.2 - Dopamine & Routines
- **Target Date:** 2025-11-22
- **Description:**

  ```
  Add motivation features: confetti, streaks, routine tasks

  Goal: Make task completion satisfying, support daily routines
  ```

### v0.3

- **Name:** v0.3 - Complexity & Planning
- **Target Date:** 2025-11-26
- **Description:**

  ```
  Handle complex tasks: subtasks, weekly planning, search

  Goal: Support larger projects and planning
  ```

### v0.4

- **Name:** v0.4 - Polish & UX
- **Target Date:** 2025-11-29
- **Description:**

  ```
  Keyboard shortcuts, dark mode, settings, onboarding

  Goal: Professional, polished user experience
  ```

### Beta (v0.5)

- **Name:** Beta (v0.5)
- **Target Date:** 2025-12-13
- **Description:**

  ```
  Integrations + AI: Jira, Calendar, Email, Standup generation

  Goal: Single source of truth for all tasks
  ```

### v1.0 Production

- **Name:** v1.0 Production
- **Target Date:** 2025-12-20
- **Description:**

  ```
  Production-ready: performance, error handling, docs

  Goal: Reliable, documented, ready for daily use
  ```

### v2.0+ Future

- **Name:** v2.0+ Future
- **Target Date:** 2026-Q1
- **Description:**

  ```
  ML-powered insights, analytics, predictions

  Goal: Intelligent task management assistant
  ```

## Step 3: Create Labels

### By Area

- `frontend` - Angular UI work
- `backend` - Node.js API work
- `database` - SQLite schema/queries
- `design` - UI/UX design work
- `infrastructure` - DevOps, CI/CD, deployment

### By Type

- `feature` - New functionality
- `bug` - Something broken
- `enhancement` - Improvement to existing feature
- `documentation` - Docs work
- `research` - Investigation/spike
- `refactor` - Code improvement without feature change
- `testing` - Test coverage

### By Integration

- `integration/jira` - Jira-related work
- `integration/calendar` - Calendar-related work
- `integration/email` - Email-related work
- `integration/reminders` - Apple Reminders-related work
- `integration/ai` - AI/LLM features

### By Priority

- `p0` - Critical, blocking
- `p1` - High priority
- `p2` - Medium priority
- `p3` - Low priority / nice-to-have

### Special

- `accessibility` - A11y work
- `performance` - Performance optimization
- `security` - Security-related

## Step 4: Create Initial Setup Issues

Copy these issues into Linear (Backlog → Todo as you work on them):

---

### TASK-1: Project Scaffolding & Repository Setup

**Labels:** `infrastructure`, `p0`
**Milestone:** Alpha (v0.1)
**Description:**

```markdown
Set up the foundational project structure and repository.

## Tasks

- [ ] Initialize Git repository
- [ ] Create `.gitignore` for Node.js + Angular
- [ ] Set up monorepo structure (frontend, backend, database, mcp-server)
- [ ] Create initial README.md
- [ ] Set up package.json with workspaces
- [ ] Configure EditorConfig for consistency
- [ ] Set up Prettier for code formatting
- [ ] Configure ESLint for TypeScript
- [ ] Create initial project documentation structure

## Success Criteria

- Repository initialized with clean structure
- All developers can clone and see project layout
- Linting and formatting work
- Documentation structure in place
```

---

### TASK-2: Architecture Decision Records (ADRs)

**Labels:** `documentation`, `research`, `p0`
**Milestone:** Alpha (v0.1)
**Description:**

```markdown
Document key architectural decisions before implementation.

## Decisions to Document

1. **Backend Framework:** NestJS vs Express vs Fastify
2. **Frontend State Management:** Angular signals vs NgRx vs services
3. **Drag-and-Drop Library:** ng-dnd vs Angular CDK vs custom
4. **CSS Approach:** CSS Modules vs Tailwind vs styled-components vs plain CSS
5. **Testing Strategy:** Unit, integration, e2e frameworks
6. **API Design:** REST structure, versioning strategy

## Format

Each ADR should include:

- Context (what problem are we solving?)
- Decision (what did we choose?)
- Rationale (why?)
- Consequences (trade-offs)
- Alternatives considered

## Success Criteria

- All major tech stack decisions documented
- ADRs reviewed and approved
- Ready to start scaffolding with chosen technologies
```

---

### TASK-3: Backend Framework & API Setup

**Labels:** `backend`, `infrastructure`, `p0`
**Milestone:** Alpha (v0.1)
**Depends on:** TASK-2
**Description:**

```markdown
Set up Node.js backend with chosen framework.

## Tasks

- [ ] Initialize backend project with TypeScript
- [ ] Set up chosen framework (NestJS/Express/Fastify)
- [ ] Configure environment variables (.env support)
- [ ] Set up API routing structure
- [ ] Configure CORS for local development
- [ ] Set up request logging (Morgan or similar)
- [ ] Configure error handling middleware
- [ ] Set up API documentation (Swagger/OpenAPI)
- [ ] Create health check endpoint

## API Structure (Initial)
```

/api/
/tasks
/channels
/health

```

## Success Criteria
- Backend server runs on localhost:3000 (or configured port)
- Health check endpoint responds
- API documentation accessible
- CORS configured for Angular dev server
- TypeScript compilation works
```

---

### TASK-4: Frontend Angular Setup

**Labels:** `frontend`, `infrastructure`, `p0`
**Milestone:** Alpha (v0.1)
**Depends on:** TASK-2
**Description:**

```markdown
Set up Angular application with latest standalone components.

## Tasks

- [ ] Create new Angular project (standalone components)
- [ ] Configure TypeScript strict mode
- [ ] Set up routing (lazy loading)
- [ ] Configure environment files (dev/prod)
- [ ] Set up HttpClient for API calls
- [ ] Configure proxy for backend API
- [ ] Set up Angular Material or chosen component library
- [ ] Configure build optimization
- [ ] Set up hot module replacement

## Initial Route Structure
```

/ - Main kanban view
/settings - User settings

```

## Success Criteria
- Angular dev server runs on localhost:4200
- Can make API calls to backend via proxy
- Routing works
- Production build succeeds
- All compilation errors resolved
```

---

### TASK-5: Database Schema Design & Implementation

**Labels:** `database`, `backend`, `p0`
**Milestone:** Alpha (v0.1)
**Description:**

```markdown
Design and implement SQLite database schema.

## Schema (v0.1)

### Tables

**tasks**

- id (INTEGER PRIMARY KEY)
- title (TEXT NOT NULL)
- description (TEXT)
- workspace (TEXT: 'work' | 'personal')
- channel_id (INTEGER FK)
- status (TEXT: 'backlog' | 'today' | 'in_progress' | 'done')
- due_date (TEXT ISO8601)
- is_routine (INTEGER BOOLEAN)
- created_at (TEXT ISO8601)
- updated_at (TEXT ISO8601)

**channels**

- id (INTEGER PRIMARY KEY)
- name (TEXT NOT NULL)
- workspace (TEXT: 'work' | 'personal')
- color (TEXT)
- created_at (TEXT ISO8601)

## Tasks

- [ ] Create schema SQL file
- [ ] Set up database connection (better-sqlite3 or similar)
- [ ] Create migration system
- [ ] Write initial migration (v0.1 schema)
- [ ] Create database seed file (sample data for development)
- [ ] Write database utility functions (CRUD)
- [ ] Add database tests
- [ ] Document database schema

## Success Criteria

- Database file created (tasker.db)
- Schema migrated successfully
- Seed data loads
- CRUD operations work
- Tests pass
```

---

### TASK-6: Design System Implementation

**Labels:** `frontend`, `design`, `p0`
**Milestone:** Alpha (v0.1)
**Depends on:** TASK-4
**Description:**

```markdown
Implement design system from docs/DESIGN_SYSTEM.md

## Tasks

- [ ] Create CSS custom properties (design tokens)
- [ ] Implement color palette (light + dark mode)
- [ ] Set up typography system (Verdana + fallbacks)
- [ ] Create spacing utility classes
- [ ] Implement base components:
  - [ ] Buttons (primary, secondary, destructive, ghost)
  - [ ] Form inputs (text, textarea, select, checkbox)
  - [ ] Cards (task card base)
  - [ ] Modal component
- [ ] Set up dark mode toggle mechanism
- [ ] Implement prefers-reduced-motion support
- [ ] Create Storybook or component showcase
- [ ] Document component usage

## Success Criteria

- All design tokens implemented as CSS variables
- Dark mode toggle works
- All base components render correctly
- Components match DESIGN_SYSTEM.md specs
- Accessibility requirements met (contrast, keyboard nav)
- Component showcase/docs available
```

---

### TASK-7: Development Environment & Tooling

**Labels:** `infrastructure`, `p0`
**Milestone:** Alpha (v0.1)
**Description:**

````markdown
Set up development environment and tooling.

## Tasks

- [ ] Create docker-compose.yml (optional, for future Postgres)
- [ ] Set up VS Code workspace settings
- [ ] Configure debugging for frontend + backend
- [ ] Set up hot reload for both frontend and backend
- [ ] Create development scripts (npm run dev, etc.)
- [ ] Set up environment variable management
- [ ] Configure source maps for debugging
- [ ] Create developer onboarding documentation

## Scripts to Create

```json
{
  "dev": "Run frontend + backend concurrently",
  "dev:frontend": "Run Angular dev server",
  "dev:backend": "Run Node.js with hot reload",
  "build": "Build production bundles",
  "test": "Run all tests",
  "lint": "Run ESLint + Prettier check",
  "format": "Run Prettier write"
}
```
````

## Success Criteria

- One command starts full dev environment
- Hot reload works for frontend and backend
- Debugging configured in VS Code
- All npm scripts documented
- New developer can get started in < 30 minutes

````

---

### TASK-8: Testing Infrastructure Setup
**Labels:** `testing`, `infrastructure`, `p0`
**Milestone:** Alpha (v0.1)
**Depends on:** TASK-2
**Description:**
```markdown
Set up testing infrastructure for frontend and backend.

## Backend Testing
- [ ] Set up Jest for unit tests
- [ ] Configure Supertest for API integration tests
- [ ] Set up test database (separate from dev)
- [ ] Create test utilities and helpers
- [ ] Configure code coverage reporting
- [ ] Set up watch mode for TDD

## Frontend Testing
- [ ] Set up Jasmine/Karma (Angular default) or Vitest
- [ ] Configure Angular testing utilities
- [ ] Set up component testing
- [ ] Configure code coverage
- [ ] Set up watch mode

## E2E Testing (Future - document for now)
- [ ] Choose framework (Playwright vs Cypress)
- [ ] Document E2E testing approach

## Success Criteria
- `npm test` runs all tests
- Tests run in CI/CD (document for TASK-9)
- Code coverage reports generated
- Test utilities documented
- Sample tests written for reference
````

---

### TASK-9: CI/CD Pipeline Setup

**Labels:** `infrastructure`, `p1`
**Milestone:** Alpha (v0.1)
**Depends on:** TASK-8
**Description:**

```markdown
Set up continuous integration and deployment pipeline.

## Tasks

- [ ] Create GitHub Actions workflow (or GitLab CI, etc.)
- [ ] Configure pipeline stages:
  - [ ] Lint (ESLint + Prettier)
  - [ ] Test (unit + integration)
  - [ ] Build (frontend + backend)
  - [ ] Deploy (future - document approach)
- [ ] Set up branch protection rules
- [ ] Configure required status checks
- [ ] Set up deployment preview for PRs (optional)
- [ ] Document CI/CD workflow

## Pipeline Triggers

- Push to main → full pipeline + deploy
- Pull request → lint + test + build
- Manual trigger → full pipeline

## Success Criteria

- Pipeline runs on every push/PR
- Tests must pass before merge
- Build artifacts generated
- Pipeline status visible in repo
- Documentation for extending pipeline
```

---

## Step 5: Create Epic Issues

These are high-level epics - don't break into subtasks yet. Create them in Backlog status.

---

### Epic: Morning Ritual Flow

**Labels:** `feature`, `frontend`, `integration/ai`, `p1`
**Milestone:** Beta (v0.5)
**Description:**

```markdown
Guided morning ritual with AI-generated standup.

## Features

- Personalized greeting (time, weather)
- Review yesterday's incomplete tasks
- Quick actions: Tomorrow, Next Week, Backlog, Delete
- Filter by workspace during review
- AI-generated daily standup (yesterday done + today planned)
- Dedicated tab/page for standup text (copy/paste to Slack)

## Success Criteria

- Ritual appears on first app open each day
- Weather API integrated
- AI standup generates readable update
- User uses it daily

## Dependencies

- AI/LLM integration (Claude API)
- Weather API
- Task filtering by date
```

---

### Epic: End-of-Day Reflection

**Labels:** `feature`, `frontend`, `integration/ai`, `p1`
**Milestone:** v0.2
**Description:**

```markdown
Reflective end-of-day flow with celebration and gentle accountability.

## Features

- "Close the day" button
- Two modes: Celebrate (wins) + Reflect (shortcomings)
- Supportive, non-judgmental tone
- Updates streak counter
- After completion: delayed reminder to phone (Pushover)

## Success Criteria

- User feels motivated to close the day
- Reflection feels supportive, not guilt-inducing
- Streaks tracked accurately
- Pushover notifications work

## Dependencies

- Streak tracking system
- Pushover API integration
- AI for reflection prompts (optional)
```

---

### Epic: Kanban Board View

**Labels:** `feature`, `frontend`, `p0`
**Milestone:** Alpha (v0.1)
**Description:**

```markdown
Main kanban board with 3 columns: Today, In Progress, Done.

## Features

- 3 columns with clear visual separation
- Drag tasks between columns
- Visual status indicators (color-coded)
- Empty states for each column
- Smooth animations (with reduced-motion support)

## Success Criteria

- Kanban board is main view
- Drag-and-drop feels smooth
- Status updates persist
- Works on desktop + responsive

## Dependencies

- Drag-and-drop library
- Design system components
- Task API
```

---

### Epic: Backlog Sidebar

**Labels:** `feature`, `frontend`, `p0`
**Milestone:** Alpha (v0.1)
**Description:**

```markdown
Always-visible backlog sidebar organized by workspace and channels.

## Features

- Collapsible sidebar (can hide)
- "Yesterday incomplete" section (v0.2)
- "Due soon" section (v0.2)
- Workspace sections (work/personal) - collapsible
- Channels within workspaces - collapsible
- Drag tasks from sidebar → kanban board
- Empty states

## Success Criteria

- All backlog tasks visible
- Easy to find tasks by workspace/channel
- Drag to board works smoothly
- Sidebar doesn't feel overwhelming

## Dependencies

- Task filtering/grouping
- Drag-and-drop
- Design system
```

---

### Epic: Task Management (CRUD)

**Labels:** `feature`, `frontend`, `backend`, `p0`
**Milestone:** Alpha (v0.1)
**Description:**

```markdown
Create, read, update, delete tasks.

## Features

- Create task modal/form
  - Title (required)
  - Description (optional)
  - Workspace (work/personal)
  - Channel selection
  - Due date picker (optional)
  - Routine toggle (v0.2)
- Edit task (same fields)
- Delete task (with confirmation)
- Task persistence in SQLite

## Success Criteria

- Can create tasks quickly
- All fields save correctly
- Edit/delete work
- Data persists across app restarts

## Dependencies

- Database schema
- API endpoints
- Form components
```

---

### Epic: Subtasks & Nested Kanban

**Labels:** `feature`, `frontend`, `backend`, `p1`
**Milestone:** v0.3
**Description:**

```markdown
Subtasks with mini kanban (To Do, Doing, Done).

## Features

- Add/edit/delete subtasks
- Each task card shows nested kanban
- Subtasks have 3 states: To Do, Doing, Done
- Drag subtasks between states
- Track subtask completion

## Success Criteria

- Complex tasks can be broken down
- Subtask kanban feels intuitive
- Progress visible at a glance

## Dependencies

- Main kanban working
- Nested drag-and-drop support
```

---

### Epic: Time Tracking & Timers

**Labels:** `feature`, `frontend`, `backend`, `p1`
**Milestone:** Beta (v0.5)
**Description:**

```markdown
Both focus timer + pomodoro visible simultaneously.

## Features

- Focus timer (counts up)
- Pomodoro timer (25/5 cycles)
- Both visible at same time
- Start/stop/pause controls
- Time logs stored per task/subtask
- Estimate vs actual comparison
- Pie chart visual timer (time blindness support)

## Success Criteria

- User can run both timers simultaneously
- Time logs accurate
- Visual representation helps with time blindness

## Dependencies

- Task API (time_logs table)
- Timer UI components
```

---

### Epic: Calendar Integration

**Labels:** `feature`, `integration/calendar`, `backend`, `p1`
**Milestone:** Beta (v0.5)
**Description:**

```markdown
Import and display calendar events.

## Features

- iOS Calendar integration
- iCal subscription support
- Timeline view (Sunsama-style)
- Read-only (don't create events)
- Events displayed alongside tasks

## Success Criteria

- Calendar events visible in app
- Timeline view works
- No manual sync needed

## Dependencies

- Calendar API research
- CalDAV or similar
```

---

### Epic: Jira Integration

**Labels:** `feature`, `integration/jira`, `backend`, `p1`
**Milestone:** Beta (v0.5)
**Description:**

```markdown
Import Jira tickets and sync status.

## Features

- See all assigned Jira tickets
- Import tickets with details + subtasks
- Sync status back to Jira when completed
- Widget on home screen showing ticket count
- Sprint review summary generation (AI)

## Success Criteria

- Jira tickets appear automatically
- Completing task updates Jira
- Sprint reviews generate stakeholder summaries

## Dependencies

- Jira API authentication
- AI integration for summaries
```

---

### Epic: Email Forward Integration

**Labels:** `feature`, `integration/email`, `backend`, `p2`
**Milestone:** Beta (v0.5)
**Description:**

```markdown
Forward email → create task automatically.

## Features

- Unique email address per user (tasks-abc123@app.com)
- Email parser:
  - Subject → Task title
  - Body → Description
  - Auto-tagged as "work"
- Manual channel assignment after creation

## Success Criteria

- Email forwarding works
- Tasks created correctly
- Email context preserved

## Dependencies

- Email service (SendGrid/Mailgun/SES)
- Email parsing library
```

---

### Epic: Apple Reminders Integration

**Labels:** `feature`, `integration/reminders`, `backend`, `p2`
**Milestone:** Beta (v0.5)
**Description:**

```markdown
Sync with Apple Reminders for mobile capture.

## Features

- Import reminders from Apple Reminders
- Sync bidirectionally
- Mobile capture workflow (create in Reminders, appears in Tasker)

## Success Criteria

- Reminders sync automatically
- Mobile capture workflow seamless

## Dependencies

- EventKit/Shortcuts/AppleScript research
- macOS-specific code
```

---

### Epic: AI Features (Standup, Sprint Reviews)

**Labels:** `feature`, `integration/ai`, `backend`, `p1`
**Milestone:** Beta (v0.5)
**Description:**

```markdown
AI-generated standup and sprint review summaries.

## Features

- Daily standup generation (yesterday + today)
- Sprint review summaries (bi-weekly, select tickets)
- Professional, stakeholder-appropriate tone
- Copy/paste to Slack/email
- Stored for history

## Success Criteria

- Standup saves time every morning
- Sprint reviews impress stakeholders
- Tone matches user needs

## Dependencies

- Claude API or similar LLM
- Jira integration (for sprint reviews)
- Prompt engineering
```

---

### Epic: Gamification & Streaks

**Labels:** `feature`, `frontend`, `backend`, `p1`
**Milestone:** v0.2
**Description:**

```markdown
Confetti, sound, streaks - make task completion satisfying.

## Features

- Confetti animation on task completion
- Sound effect (toggle in settings)
- Color pulse/glow effect
- Streak counter (days in a row)
- Streak milestones (7 days, 30 days, etc.)
- Visual progress indicators

## Success Criteria

- Task completion feels rewarding (dopamine hit)
- Streaks motivate consistency
- Not overwhelming/annoying

## Dependencies

- canvas-confetti library
- Audio files
- Streak tracking in database
```

---

### Epic: Weekly Planning View

**Labels:** `feature`, `frontend`, `p2`
**Milestone:** v0.3
**Description:**

```markdown
Week-as-sprint planning view.

## Features

- View current week as sprint
- See tasks planned for each day
- Drag tasks from backlog → specific day
- Simple, not overwhelming

## Success Criteria

- User can plan week quickly
- Doesn't add cognitive load
- Feels helpful, not mandatory

## Dependencies

- Task date filtering
- Drag-and-drop to days
```

---

### Epic: Multiple View Modes

**Labels:** `feature`, `frontend`, `p2`
**Milestone:** v1.0
**Description:**

```markdown
Kanban, List, Calendar views.

## Features

- Kanban view (default)
- List view (simple task list)
- Calendar view (timeline with tasks + events)
- Easy toggle between views
- Preferences saved

## Success Criteria

- All views show same data
- Toggle feels seamless
- User can choose preferred view

## Dependencies

- Calendar integration
- View state management
```

---

### Epic: Home Dashboard

**Labels:** `feature`, `frontend`, `p2`
**Milestone:** v1.0
**Description:**

```markdown
Widget-like command center showing all integrations.

## Features

- Quick stats (tasks done today, streak)
- Jira tickets preview
- Calendar upcoming events
- Email tasks pending review
- Each integration has widget
- All-in-one view

## Success Criteria

- Dashboard is useful landing page
- Widgets load quickly
- Info at a glance

## Dependencies

- All integrations complete
```

---

### Epic: MCP Server for Claude

**Labels:** `feature`, `backend`, `integration/ai`, `p2`
**Milestone:** Beta (v0.5)
**Description:**

```markdown
MCP server so Claude can manage tasks.

## Features

- Claude can read tasks
- Claude can create/update tasks
- Claude can organize backlog
- Claude can suggest priorities
- Voice-like interaction

## Success Criteria

- "Claude, what should I work on next?" works
- Claude can reorganize based on deadlines
- Feels like having an assistant

## Dependencies

- MCP SDK
- Task API complete
- Authentication/permissions
```

---

## Step 6: Set Up Workflow States

Configure these states in Linear:

1. **Backlog** - Not prioritized yet
2. **Todo** - Ready to work on, prioritized
3. **In Progress** - Actively being worked on
4. **In Review** - Ready for review (self-review for solo work)
5. **Done** - Completed

## Step 7: Start First Sprint

1. Move TASK-1 through TASK-9 (setup issues) from Backlog → Todo
2. Assign to yourself
3. Set sprint dates (Monday - Friday this week)
4. Start with TASK-1 (Project Scaffolding)

## Step 8: Daily Workflow

### Monday (Sprint Planning)

- Review backlog
- Move issues to Todo for the week
- Update priorities

### Tuesday-Thursday

- Work on issues
- Update status (In Progress → In Review → Done)
- Update Linear daily

### Friday (Review & Retro)

- Review completed work
- Retrospective notes
- Plan next week

## Tips

- **Keep it simple:** Don't over-engineer the Linear setup
- **Update daily:** Move cards, add comments
- **Link commits:** Use "TASK-123" in commit messages
- **Close issues:** Mark done when truly complete
- **Ask questions:** Use issue comments for decisions

---

**Next Step:** Start with TASK-1 (Project Scaffolding)
