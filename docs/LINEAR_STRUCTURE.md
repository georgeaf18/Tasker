# Linear Workspace Structure - Tasker

## 1. Project Structure

### Project Name
**Tasker**

### Description
A visual task management application designed for users with ADHD and memory challenges. Tasker provides a simple, visually-driven interface that shows today's tasks and the complete backlog simultaneously, eliminating cognitive overhead while preventing tasks from being forgotten.

### Key Objectives
1. Provide a visual backlog sidebar alongside a kanban board to show all tasks without overwhelming the user
2. Enable zero-friction task movement from backlog to completion
3. Create satisfying completion experiences (confetti, sound, visual feedback) to maintain engagement
4. Support morning rituals and end-of-day reflections with AI assistance
5. Integrate with existing tools (Jira, Calendar, Email, Apple Reminders) to centralize task management
6. Build an ADHD-friendly, dyslexia-accessible interface with high contrast and generous spacing

---

## 2. Milestones

### Alpha (v0.1) - MVP
**Goal:** Solve the ONE core problem: "I need to see my backlog and today's tasks in one simple visual view"

**Timeline:** Week 1-2

**Success Criteria:**
- User switches from Sunsama to Tasker for daily task management
- No tasks are forgotten in the backlog
- Task completion feels effortless and satisfying
- Morning routine successfully auto-populates
- End-of-day flow becomes part of daily routine

**Core Features:**
- Backlog sidebar with organizational hierarchy
- 3-column kanban board (Today, In Progress, Done)
- Morning routine auto-population
- Task creation with nested subtask kanban
- Drag-and-drop task management
- Task completion with confetti + sound + color animations
- End-of-day streak tracking
- Weekly planning view (sprint concept)
- SQLite data persistence
- Dyslexia-friendly UI design

---

### Beta (v0.5) - Integration Completeness
**Goal:** Add integrations and AI-powered assistance

**Timeline:** Week 5-8

**Success Criteria:**
- All external task sources (Jira, Email, Reminders, Calendar) flow into Tasker
- AI standup generation saves time every morning
- Sprint review summaries are professional and ready to share
- Time tracking provides accurate project insights
- Notifications work reliably via Pushover
- MCP server enables Claude to manage tasks

**Core Features:**
- Jira integration (import tickets with subtasks)
- Calendar integration (timeline view)
- Apple Reminders integration (import + sync)
- Email forward import (unique address per user)
- AI daily standup generation
- AI sprint review summaries (bi-weekly)
- Time tracking per task and subtask
- Visual timeline for time spent
- Estimate vs actual time comparison
- Server-side notifications via Pushover
- MCP server for Claude integration

---

### v1.0 - Production Ready
**Goal:** Polish, optimize, and prepare for real-world deployment

**Timeline:** Week 9-12

**Success Criteria:**
- App performs well with 1000+ tasks
- Error handling prevents data loss
- Documentation enables new users to onboard
- Multiple view modes support different workflows
- Data export/backup provides peace of mind
- Ready for home server deployment

**Core Features:**
- Performance optimization
- Comprehensive error handling
- User documentation and onboarding
- Home dashboard (widget-based overview)
- Multiple view modes (Kanban, List, Calendar timeline)
- Export/backup data functionality
- Migration from SQLite to PostgreSQL
- Deployment to home server
- Monitoring and logging

---

### v2.0+ - Advanced Intelligence
**Goal:** Machine learning insights and advanced features

**Timeline:** Future (post-production)

**Success Criteria:**
- ML time estimates are more accurate than manual estimates
- Pattern recognition identifies productivity trends
- Insights lead to measurable productivity improvements
- Advanced analytics provide actionable recommendations

**Core Features:**
- ML-powered time estimates based on historical data
- Pattern recognition for task duration predictions
- Productivity insights and trends
- Advanced analytics dashboard
- Multi-user support (if needed)
- Mobile native app (if web insufficient)
- Predictive task scheduling

---

## 3. Labels/Tags

### Category Labels
- `frontend` - Frontend code, UI components, Angular work
- `backend` - Backend code, API endpoints, server logic
- `database` - Database schema, migrations, queries
- `design` - UI/UX design, wireframes, accessibility
- `research` - Technical research, proof of concepts, exploration
- `integration` - External API integrations (Jira, Calendar, etc.)
- `testing` - Unit tests, integration tests, E2E tests
- `documentation` - User docs, technical docs, README updates
- `ai` - AI/LLM features (standup, sprint reviews, MCP)

### Type Labels
- `bug` - Something isn't working correctly
- `enhancement` - Improvement to existing feature
- `feature` - New functionality
- `refactor` - Code quality improvement without changing behavior
- `performance` - Performance optimization
- `security` - Security-related work

### Priority Labels
- `p0-critical` - Blocking issue, must fix immediately
- `p1-high` - Important for milestone completion
- `p2-medium` - Should have, but not blocking
- `p3-low` - Nice to have

### Workspace Labels
- `work-tasks` - Features specific to work task management
- `personal-tasks` - Features specific to personal task management
- `core-ux` - Core user experience flows

---

## 4. Epics/Features

### Epic 1: Morning Ritual Flow
**Description:** Guided morning ritual that reviews yesterday's incomplete tasks, auto-populates routine tasks, and generates an AI-powered daily standup.

**Target Milestone:** Alpha (v0.1) - Basic flow; Beta (v0.5) - AI standup

**Labels:** `feature`, `core-ux`, `ai`

**Dependencies:** Task Management, AI Features

**Key Features:**
- Good morning message with time, weather, personalized greeting
- Review yesterday's incomplete tasks with quick actions
- Filter by workspace during review
- Auto-populate Today column with routine tasks
- AI-generated daily standup based on yesterday's completions and today's plan

---

### Epic 2: End-of-Day Reflection
**Description:** Satisfying end-of-day ritual with celebration mode, reflection prompts, and streak tracking. Includes delayed personal task reminders via Pushover.

**Target Milestone:** Alpha (v0.1) - Basic flow; Beta (v0.5) - Full reflection + notifications

**Labels:** `feature`, `core-ux`, `ai`, `integration`

**Dependencies:** Task Management, Streak Tracking, Pushover Integration

**Key Features:**
- "Close the day" flow with two modes: Celebrate and Reflect
- Supportive, non-judgmental tone
- Streak counter updates
- Destress period configuration
- Pushover notifications for personal task reminders

---

### Epic 3: Kanban Board View
**Description:** Three-column kanban board (Today, In Progress, Done) that serves as the primary task management interface.

**Target Milestone:** Alpha (v0.1)

**Labels:** `feature`, `frontend`, `core-ux`

**Dependencies:** Task Management

**Key Features:**
- Three clearly labeled columns
- Drag-and-drop between columns
- Task cards with nested subtask kanban
- High-contrast, dyslexia-friendly design
- Generous spacing and clear visual hierarchy

---

### Epic 4: Backlog Sidebar
**Description:** Hierarchical backlog sidebar that organizes tasks by yesterday incomplete, due soon, workspace, and channels. Always visible, preventing tasks from being forgotten.

**Target Milestone:** Alpha (v0.1)

**Labels:** `feature`, `frontend`, `core-ux`

**Dependencies:** Task Management, Channels/Workspaces

**Key Features:**
- Yesterday incomplete section (top priority)
- Due soon section
- Workspace sections (work/personal) - collapsible
- Channels within workspaces - collapsible
- Drag tasks to kanban board
- No pagination - all tasks visible

---

### Epic 5: Task Management
**Description:** Core task CRUD operations including creation, editing, deletion, and completion with satisfying animations.

**Target Milestone:** Alpha (v0.1)

**Labels:** `feature`, `backend`, `frontend`, `core-ux`

**Dependencies:** Database Schema

**Key Features:**
- Create tasks with title, description, workspace, channel, due date
- Routine task toggle for morning auto-population
- Add/edit/delete subtasks with nested kanban
- Drag-and-drop task movement
- Task completion triggers confetti + sound + color change
- All three animations (confetti, sound, color) fire simultaneously

---

### Epic 6: Time Tracking & Timers
**Description:** Dual timer system (regular focus timer + pomodoro) with time estimates, actual tracking, and visual timeline.

**Target Milestone:** Beta (v0.5)

**Labels:** `feature`, `frontend`, `backend`

**Dependencies:** Task Management

**Key Features:**
- Regular focus timer (counts up)
- Pomodoro timer (25/5 cycles)
- Both timers visible simultaneously
- Time estimates (optional field)
- Track actual time per task and subtask
- Visual comparison: estimate vs actual
- Timeline view of time spent

---

### Epic 7: Calendar Integration
**Description:** Import iOS Calendar events and iCal subscriptions. Display events in timeline view alongside tasks.

**Target Milestone:** Beta (v0.5)

**Labels:** `feature`, `integration`, `research`

**Dependencies:** None

**Key Features:**
- iOS Calendar access (CalDAV research needed)
- iCal subscription URL parsing
- Visual timeline view (like Sunsama)
- Read-only calendar events
- Display events alongside tasks

---

### Epic 8: Jira Integration
**Description:** Import assigned Jira tickets with subtasks, sync status back, and generate AI sprint review summaries.

**Target Milestone:** Beta (v0.5)

**Labels:** `feature`, `integration`, `ai`

**Dependencies:** Task Management, AI Features

**Key Features:**
- View all assigned Jira tickets
- Home screen widget preview
- Import tickets with details and subtasks
- Sync completion status back to Jira
- Bi-weekly sprint review AI summaries
- Professional, stakeholder-friendly tone

---

### Epic 9: Email Integration
**Description:** Forward emails to unique address to create tasks automatically. Parse subject/body into task title/description.

**Target Milestone:** Beta (v0.5)

**Labels:** `feature`, `integration`, `backend`, `research`

**Dependencies:** Task Management

**Key Features:**
- Unique email address per user
- Email parser (subject → title, body → description)
- Link back to original email
- Auto-tag as "work" workspace
- Manual channel assignment after creation

---

### Epic 10: Apple Reminders Integration
**Description:** Import and sync tasks from Apple Reminders into Tasker backlog.

**Target Milestone:** Beta (v0.5)

**Labels:** `feature`, `integration`, `research`

**Dependencies:** Task Management

**Key Features:**
- EventKit integration (research needed)
- Shortcuts automation exploration
- AppleScript fallback option
- Two-way sync (optional)

---

### Epic 11: AI Features (Standup, Sprint Reviews)
**Description:** AI-powered text generation for daily standups and bi-weekly sprint reviews.

**Target Milestone:** Beta (v0.5)

**Labels:** `feature`, `ai`, `backend`, `research`

**Dependencies:** Task Management, Jira Integration

**Key Features:**
- Daily standup generation (yesterday's completions + today's plan)
- Dedicated page for standup text (copy/paste to Slack)
- Sprint review summary generation (select tickets, AI summarizes)
- Professional, business-appropriate tone
- Save/export summaries

---

### Epic 12: Gamification & Streaks
**Description:** Streak tracking for daily routine completion with visual celebrations and milestones.

**Target Milestone:** Alpha (v0.1)

**Labels:** `feature`, `frontend`, `backend`

**Dependencies:** Task Management, End-of-Day Reflection

**Key Features:**
- Streak counter (days in a row)
- Visual celebration on milestones
- End-of-day streak update
- Routine task completion tracking

---

### Epic 13: Weekly Planning
**Description:** Week-as-sprint planning view to organize tasks across the current week.

**Target Milestone:** Alpha (v0.1)

**Labels:** `feature`, `frontend`

**Dependencies:** Task Management

**Key Features:**
- Weekly calendar view
- Drag tasks to specific days
- See current week as a sprint
- Simple, non-overwhelming layout

---

### Epic 14: Multiple View Modes
**Description:** Support for different view modes: Kanban (default), List, and Calendar timeline.

**Target Milestone:** v1.0

**Labels:** `feature`, `frontend`

**Dependencies:** Kanban Board, Calendar Integration

**Key Features:**
- Kanban view (default)
- List view (simple task list)
- Calendar timeline view (tasks + events)
- Easy toggle between views

---

### Epic 15: Home Dashboard
**Description:** Widget-based dashboard showing overview of all integrations (Jira, Calendar, Email, Stats).

**Target Milestone:** v1.0

**Labels:** `feature`, `frontend`, `design`

**Dependencies:** All Integrations

**Key Features:**
- Quick stats widget (tasks done, streak, etc.)
- Jira assigned tickets preview
- Calendar upcoming events
- Email-imported tasks pending review
- All-in-one command center
- Optional landing page or toggle view

---

### Epic 16: MCP Server
**Description:** Model Context Protocol server to enable Claude to manage tasks directly.

**Target Milestone:** Beta (v0.5)

**Labels:** `feature`, `backend`, `ai`, `research`

**Dependencies:** Task Management API

**Key Features:**
- MCP server implementation
- Claude can create/read/update/delete tasks
- Claude can query backlog, today's tasks, streaks
- Secure authentication
- API documentation for MCP tools

---

## 5. Initial Setup Issues

These foundational issues should be created and completed before feature development begins.

### Setup Issue 1: Project Scaffolding
**Description:** Initialize frontend (Angular) and backend (Node.js) project repositories with proper folder structure.

**Target Milestone:** Alpha (v0.1)

**Labels:** `setup`, `frontend`, `backend`

**Dependencies:** None

**Tasks:**
- Create Angular project with standalone components
- Create Node.js backend project (framework TBD)
- Set up monorepo or separate repos (decision needed)
- Initialize Git repositories
- Create .gitignore files
- Set up package.json with initial dependencies

---

### Setup Issue 2: Architecture Decisions
**Description:** Make critical technical decisions for tech stack and architecture.

**Target Milestone:** Alpha (v0.1)

**Labels:** `setup`, `research`

**Dependencies:** None

**Decisions Needed:**
- Backend framework (NestJS vs Express vs Fastify)
- UI component library (Material vs Tailwind vs PrimeNG vs Custom)
- Drag-and-drop library (supports nested zones)
- Testing frameworks confirmation
- Deployment strategy
- Monorepo vs multi-repo

---

### Setup Issue 3: Technology Stack Setup
**Description:** Install and configure all core technologies, libraries, and tools.

**Target Milestone:** Alpha (v0.1)

**Labels:** `setup`, `frontend`, `backend`

**Dependencies:** Architecture Decisions

**Tasks:**
- Install Angular CLI and dependencies
- Install Node.js framework and dependencies
- Install SQLite and database client
- Install testing frameworks (Jest, Jasmine, Playwright)
- Install drag-and-drop library
- Install confetti animation library (canvas-confetti)
- Set up TypeScript configuration
- Set up ESLint/Prettier

---

### Setup Issue 4: Database Schema Design
**Description:** Design and implement the initial SQLite database schema for v0.1.

**Target Milestone:** Alpha (v0.1)

**Labels:** `setup`, `database`, `backend`

**Dependencies:** Architecture Decisions

**Tasks:**
- Design schema for: tasks, subtasks, channels, streaks
- Create migration files
- Implement database connection module
- Create seed data for testing
- Document schema decisions
- Plan for future migrations (time_logs, calendar_events, integrations, reflections)

---

### Setup Issue 5: Design System Implementation
**Description:** Create dyslexia-friendly design system with colors, typography, spacing, and component styles.

**Target Milestone:** Alpha (v0.1)

**Labels:** `setup`, `design`, `frontend`

**Dependencies:** Architecture Decisions

**Tasks:**
- Define color palette (high contrast options)
- Define typography scale (sans-serif, 1.5-2x line spacing)
- Define spacing system
- Research OpenDyslexic vs standard sans-serif fonts
- Research Bionic Reading implementation
- Create component style guidelines
- Implement dark mode option
- Create accessibility checklist
- Set up CSS variables or theme system

---

### Setup Issue 6: Development Environment Setup
**Description:** Configure local development environment with hot reload, debugging, and tools.

**Target Milestone:** Alpha (v0.1)

**Labels:** `setup`, `frontend`, `backend`

**Dependencies:** Technology Stack Setup

**Tasks:**
- Configure frontend dev server with hot reload
- Configure backend dev server with hot reload (nodemon)
- Set up concurrent frontend + backend development
- Configure debugging for VS Code (or preferred IDE)
- Set up environment variables (.env files)
- Create development documentation
- Set up database migrations script
- Create seed data script

---

### Setup Issue 7: Testing Infrastructure
**Description:** Set up testing frameworks and create initial test examples.

**Target Milestone:** Alpha (v0.1)

**Labels:** `setup`, `testing`

**Dependencies:** Technology Stack Setup

**Tasks:**
- Configure Jest for backend unit tests
- Configure Jasmine/Karma for frontend unit tests (or Vitest)
- Configure Playwright for E2E tests
- Create test database setup/teardown utilities
- Write example unit test (backend)
- Write example unit test (frontend)
- Write example E2E test
- Set up test coverage reporting
- Document testing strategy

---

### Setup Issue 8: CI/CD Pipeline
**Description:** Set up automated testing and deployment pipeline.

**Target Milestone:** Alpha (v0.1)

**Labels:** `setup`, `testing`

**Dependencies:** Testing Infrastructure

**Tasks:**
- Choose CI/CD platform (GitHub Actions recommended)
- Configure automated test runs on commit
- Configure automated test runs on PR
- Set up test failure blocking for merges
- Create build pipeline
- Set up linting in CI
- Document CI/CD workflow
- (Future) Configure deployment pipeline for production

---

## 6. Dependencies Map

### Core Dependencies
```
Database Schema Design
  └─> Task Management
       ├─> Kanban Board View
       ├─> Backlog Sidebar
       ├─> Morning Ritual Flow
       ├─> End-of-Day Reflection
       ├─> Gamification & Streaks
       ├─> Weekly Planning
       └─> Time Tracking & Timers

Task Management
  └─> All Integration Epics
       ├─> Jira Integration
       ├─> Calendar Integration
       ├─> Email Integration
       └─> Apple Reminders Integration

AI Features
  ├─> Morning Ritual Flow (standup generation)
  ├─> Jira Integration (sprint reviews)
  └─> End-of-Day Reflection (reflection prompts)

All Integrations
  └─> Home Dashboard

Calendar Integration + Kanban Board
  └─> Multiple View Modes

Task Management API
  └─> MCP Server
```

---

## 7. Workflow States

Tasks will progress through these states in Linear:

1. **Backlog** - Not yet prioritized or scheduled
2. **Todo** - Prioritized and ready to be picked up
3. **In Progress** - Actively being worked on
4. **In Review** - Complete but needs review (self-review checklist)
5. **Done** - Complete and reviewed

---

## 8. Sprint Structure

### Weekly Sprint Cycle

**Monday:**
- Sprint planning
- Pick issues from current milestone
- Update Linear with sprint tasks
- Estimate effort

**Tuesday-Thursday:**
- Build features
- Write tests
- Update Linear task status daily
- Commit frequently

**Friday:**
- Self-review checklist
- Retrospective notes
- Plan next sprint
- Update documentation

---

## 9. Git Workflow

- `main` branch - Production-ready code
- `develop` branch - Active development
- Feature branches - `feature/task-creation`, `feature/morning-ritual`, etc.
- Pull requests required (even solo work for discipline)
- Link commits to Linear issues
- Conventional commit messages

---

## 10. Success Metrics

### Alpha (v0.1)
- Use Tasker instead of Sunsama for 1 full week
- Zero forgotten tasks in backlog
- Complete morning ritual daily
- Close day with streak tracking daily

### Beta (v0.5)
- All task sources integrated (Jira, Email, Calendar, Reminders)
- AI standup saves 5+ minutes daily
- Sprint reviews ready to share with stakeholders
- Notifications working reliably

### v1.0
- App handles 1000+ tasks without performance issues
- Data export/backup successful
- Documentation complete
- Deployed to home server

### v2.0+
- ML time estimates more accurate than manual
- Productivity insights actionable
- Advanced analytics used weekly

---

## 11. Open Questions & Research Tasks

### Technical Research Needed
- [ ] Calendar integration approach (CalDAV for iOS Calendar?)
- [ ] Apple Reminders integration (EventKit, Shortcuts, AppleScript?)
- [ ] Jira API authentication (OAuth vs API token)
- [ ] Email receiving service (SendGrid, Mailgun, AWS SES?)
- [ ] Weather API for morning greeting (OpenWeather, Apple Weather?)
- [ ] Pushover API integration details
- [ ] MCP server implementation guidelines
- [ ] AI model selection (Claude API, local LLM, other?)

### Design Research Needed
- [ ] OpenDyslexic font effectiveness
- [ ] Bionic Reading implementation
- [ ] Best drag-and-drop library for nested zones
- [ ] Confetti animation performance considerations

---

## 12. Notes

This structure is designed to be imported into Linear as:

1. **Project:** Tasker
2. **Milestones:** Alpha (v0.1), Beta (v0.5), v1.0, v2.0+
3. **Labels:** Create all labels listed in Section 3
4. **Epics:** Create 16 epics as parent issues (no subtasks yet)
5. **Initial Issues:** Create 8 setup issues first, prioritize for Week 1

The structure follows the INITIAL_PLANNING.md vision while organizing work into clear, manageable chunks. Each epic can be broken down into individual issues/tasks as development progresses.

**Key Principles:**
- Start with setup issues before feature work
- v0.1 solves ONE core problem
- Dependencies clearly documented
- ADHD-friendly workflow (clear next actions)
- Ship ugly but functional, iterate based on usage
