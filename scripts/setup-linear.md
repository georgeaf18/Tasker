# Linear Setup Script for Tasker

## Setup Overview

This document contains all the information needed to set up the Tasker project in Linear.

**Workspace:** Taskerapp (already created ✓)

---

## Step 1: Create Main Project

**Project Name:** Tasker
**Identifier:** TASK
**Description:**
```
ADHD-friendly, dyslexia-friendly task management application for visual learners.

Core Problem: See backlog + today's tasks simultaneously without overwhelm.
```

---

## Step 2: Create Milestones

### 1. Alpha (v0.1) - MVP
- **Name:** Alpha (v0.1)
- **Target Date:** 2025-11-25 (2 weeks from now)
- **Description:**
```
MVP: Backlog sidebar + basic kanban board

Goal: See all tasks in one place without overwhelm
Success: Using daily instead of Sunsama for basic tracking
```

### 2. Beta (v0.5) - Integrations
- **Name:** Beta (v0.5)
- **Target Date:** 2025-12-16
- **Description:**
```
Integrations + AI: Jira, Calendar, Email, Standup generation

Goal: Single source of truth for all tasks
```

### 3. v1.0 - Production
- **Name:** v1.0 Production
- **Target Date:** 2026-01-06
- **Description:**
```
Production-ready: performance, error handling, docs, multiple views

Goal: Reliable, documented, ready for daily use
```

### 4. v2.0+ - Intelligence
- **Name:** v2.0+ Future
- **Target Date:** 2026-Q1
- **Description:**
```
ML-powered insights, analytics, predictions

Goal: Intelligent task management assistant
```

---

## Step 3: Create Labels

### Category Labels
- `frontend` - Frontend code, UI components, Angular
- `backend` - Backend code, API endpoints, server logic
- `database` - Database schema, migrations, queries
- `design` - UI/UX design, wireframes, accessibility
- `research` - Technical research, POCs, exploration
- `integration` - External API integrations
- `testing` - Unit, integration, E2E tests
- `documentation` - User docs, technical docs
- `ai` - AI/LLM features
- `infrastructure` - DevOps, CI/CD, deployment

### Type Labels
- `bug` - Something broken
- `enhancement` - Improvement to existing feature
- `feature` - New functionality
- `refactor` - Code quality improvement
- `performance` - Performance optimization
- `security` - Security work

### Priority Labels
- `p0-critical` - Blocking, must fix immediately
- `p1-high` - Important for milestone
- `p2-medium` - Should have
- `p3-low` - Nice to have

### Integration-Specific Labels
- `jira-integration`
- `calendar-integration`
- `email-integration`
- `reminders-integration`
- `ai-integration`

---

## Step 4: Create Projects (Feature Areas)

### Option A: Single Project with Epics (Recommended)
Create one "Tasker" project with all features as issues/epics.

### Option B: Multiple Projects by Feature Area
Create separate projects for major feature areas:

1. **Core Platform**
   - Project: "Tasker - Core"
   - Includes: Kanban, Backlog, Task Management, UI/UX

2. **Integrations**
   - Project: "Tasker - Integrations"
   - Includes: Jira, Calendar, Email, Reminders

3. **AI Features**
   - Project: "Tasker - AI"
   - Includes: Standup generation, Sprint reviews, MCP server

4. **Time Tracking**
   - Project: "Tasker - Time"
   - Includes: Timers, Time logs, Estimates vs Actual

5. **Gamification**
   - Project: "Tasker - Engagement"
   - Includes: Streaks, Confetti, Celebrations

**Recommendation:** Start with Option A (single project), split later if needed.

---

## Step 5: Create Initial Setup Issues

These go in the main "Tasker" project, Milestone: Alpha (v0.1)

### TASK-1: Project Scaffolding & Repository Setup
**Labels:** infrastructure, p0-critical
**Assignee:** George
**Description:**
```markdown
Set up foundational project structure and repository.

## Tasks
- [ ] Initialize Git repository
- [ ] Create .gitignore for Node.js + Angular
- [ ] Set up monorepo structure (frontend, backend, database, mcp-server)
- [ ] Create initial README.md
- [ ] Set up package.json with workspaces
- [ ] Configure EditorConfig
- [ ] Set up Prettier for code formatting
- [ ] Configure ESLint for TypeScript
- [ ] Create initial project documentation structure

## Success Criteria
- Repository initialized with clean structure
- Linting and formatting configured
- Documentation structure in place

## Estimate
2-3 hours
```

### TASK-2: Architecture Decision Records (ADRs)
**Labels:** documentation, research, p0-critical
**Assignee:** George
**Description:**
```markdown
Document key architectural decisions before implementation.

## Decisions to Document
1. Backend Framework: NestJS vs Express vs Fastify
2. Frontend State Management: Signals vs NgRx vs Services
3. Drag-and-Drop Library: ng-dnd vs Angular CDK vs custom
4. CSS Approach: Modules vs Tailwind vs plain CSS
5. Testing Strategy: Unit, integration, e2e frameworks
6. API Design: REST structure, versioning

## Format
Each ADR: Context, Decision, Rationale, Consequences, Alternatives

## Success Criteria
- All major tech decisions documented
- ADRs reviewed and approved
- Ready to start scaffolding

## Estimate
3-4 hours
```

### TASK-3: Backend Framework & API Setup
**Labels:** backend, infrastructure, p0-critical
**Assignee:** George
**Depends on:** TASK-2
**Description:**
```markdown
Set up Node.js backend with chosen framework.

## Tasks
- [ ] Initialize backend project with TypeScript
- [ ] Set up chosen framework
- [ ] Configure environment variables
- [ ] Set up API routing structure
- [ ] Configure CORS
- [ ] Set up request logging
- [ ] Configure error handling middleware
- [ ] Set up API documentation (Swagger/OpenAPI)
- [ ] Create health check endpoint

## API Structure (Initial)
/api/tasks
/api/channels
/api/health

## Success Criteria
- Backend server runs on localhost:3000
- Health check responds
- API documentation accessible
- CORS configured
- TypeScript compiles

## Estimate
2-3 hours
```

### TASK-4: Frontend Angular Setup
**Labels:** frontend, infrastructure, p0-critical
**Assignee:** George
**Depends on:** TASK-2
**Description:**
```markdown
Set up Angular application with standalone components.

## Tasks
- [ ] Create new Angular project (standalone)
- [ ] Configure TypeScript strict mode
- [ ] Set up routing (lazy loading)
- [ ] Configure environment files
- [ ] Set up HttpClient for API calls
- [ ] Configure proxy for backend API
- [ ] Set up component library
- [ ] Configure build optimization
- [ ] Set up hot module replacement

## Initial Routes
/ - Main kanban view
/settings - User settings

## Success Criteria
- Angular dev server runs on localhost:4200
- API calls work via proxy
- Routing functional
- Production build succeeds

## Estimate
2-3 hours
```

### TASK-5: Database Schema Design & Implementation
**Labels:** database, backend, p0-critical
**Assignee:** George
**Description:**
```markdown
Design and implement SQLite database schema.

## Schema (v0.1)

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
- [ ] Set up database connection
- [ ] Create migration system
- [ ] Write initial migration
- [ ] Create seed file
- [ ] Write CRUD utilities
- [ ] Add database tests
- [ ] Document schema

## Success Criteria
- Database file created (tasker.db)
- Schema migrated successfully
- Seed data loads
- CRUD operations work
- Tests pass

## Estimate
1-2 hours
```

### TASK-6: Design System Implementation
**Labels:** frontend, design, p0-critical
**Assignee:** George
**Depends on:** TASK-4
**Description:**
```markdown
Implement design system from docs/DESIGN_SYSTEM.md

## Tasks
- [ ] Create CSS custom properties (design tokens)
- [ ] Implement color palette (light + dark mode)
- [ ] Set up typography system
- [ ] Create spacing utility classes
- [ ] Implement base components:
  - [ ] Buttons
  - [ ] Form inputs
  - [ ] Cards
  - [ ] Modal
- [ ] Set up dark mode toggle
- [ ] Implement prefers-reduced-motion support
- [ ] Create component showcase
- [ ] Document component usage

## Success Criteria
- All design tokens implemented
- Dark mode toggle works
- Components match specs
- Accessibility requirements met
- Component showcase available

## Estimate
3-4 hours
```

### TASK-7: Development Environment & Tooling
**Labels:** infrastructure, p0-critical
**Assignee:** George
**Description:**
```markdown
Set up development environment and tooling.

## Tasks
- [ ] Create docker-compose.yml (optional)
- [ ] Set up VS Code workspace settings
- [ ] Configure debugging
- [ ] Set up hot reload
- [ ] Create development scripts
- [ ] Set up env variable management
- [ ] Configure source maps
- [ ] Create developer onboarding docs

## Scripts
- "dev" - Run frontend + backend
- "dev:frontend" - Angular dev server
- "dev:backend" - Node with hot reload
- "build" - Production bundles
- "test" - All tests
- "lint" - ESLint + Prettier
- "format" - Prettier write

## Success Criteria
- One command starts full dev environment
- Hot reload works
- Debugging configured
- Scripts documented
- Onboarding takes < 30 min

## Estimate
1-2 hours
```

### TASK-8: Testing Infrastructure Setup
**Labels:** testing, infrastructure, p0-critical
**Assignee:** George
**Depends on:** TASK-2
**Description:**
```markdown
Set up testing infrastructure.

## Backend Testing
- [ ] Set up Jest for unit tests
- [ ] Configure Supertest for integration tests
- [ ] Set up test database
- [ ] Create test utilities
- [ ] Configure coverage reporting
- [ ] Set up watch mode

## Frontend Testing
- [ ] Set up Jasmine/Karma or Vitest
- [ ] Configure Angular testing utilities
- [ ] Set up component testing
- [ ] Configure coverage
- [ ] Set up watch mode

## E2E Testing (Document for later)
- [ ] Choose framework (Playwright vs Cypress)
- [ ] Document approach

## Success Criteria
- npm test runs all tests
- Coverage reports generated
- Test utilities documented
- Sample tests for reference

## Estimate
2-3 hours
```

### TASK-9: CI/CD Pipeline Setup
**Labels:** infrastructure, p1-high
**Assignee:** George
**Depends on:** TASK-8
**Description:**
```markdown
Set up continuous integration and deployment.

## Tasks
- [ ] Create GitHub Actions workflow
- [ ] Configure pipeline stages:
  - [ ] Lint
  - [ ] Test
  - [ ] Build
  - [ ] Deploy (future)
- [ ] Set up branch protection
- [ ] Configure required status checks
- [ ] Set up deployment preview
- [ ] Document CI/CD workflow

## Pipeline Triggers
- Push to main → full pipeline + deploy
- Pull request → lint + test + build
- Manual trigger → full pipeline

## Success Criteria
- Pipeline runs on push/PR
- Tests must pass before merge
- Build artifacts generated
- Pipeline status visible
- Documentation complete

## Estimate
2-3 hours
```

---

## Step 6: Create Epic/Feature Issues

These are the main feature epics. Create as issues in the "Tasker" project.

### Epic 1: Kanban Board View
**Labels:** feature, frontend, p0-critical
**Milestone:** Alpha (v0.1)
**Description:**
```markdown
Main kanban board with 3 columns: Today, In Progress, Done.

## Features
- 3 columns with visual separation
- Drag tasks between columns
- Visual status indicators
- Empty states
- Smooth animations (reduced-motion support)

## Success Criteria
- Kanban is main view
- Drag-and-drop smooth
- Status updates persist
- Responsive design

## Dependencies
- Drag-and-drop library
- Design system
- Task API
```

### Epic 2: Backlog Sidebar
**Labels:** feature, frontend, p0-critical
**Milestone:** Alpha (v0.1)
**Description:**
```markdown
Always-visible backlog sidebar organized by workspace/channels.

## Features
- Collapsible sidebar
- Workspace sections (work/personal)
- Channels within workspaces
- Drag from sidebar → kanban
- Empty states

## Success Criteria
- All backlog tasks visible
- Easy to find by workspace/channel
- Drag to board works
- Not overwhelming

## Dependencies
- Task filtering/grouping
- Drag-and-drop
- Design system
```

### Epic 3: Task Management (CRUD)
**Labels:** feature, frontend, backend, p0-critical
**Milestone:** Alpha (v0.1)
**Description:**
```markdown
Create, read, update, delete tasks.

## Features
- Create task modal:
  - Title (required)
  - Description
  - Workspace
  - Channel
  - Due date
- Edit task
- Delete task (with confirmation)
- SQLite persistence

## Success Criteria
- Quick task creation
- All fields save
- Edit/delete work
- Data persists

## Dependencies
- Database schema
- API endpoints
- Form components
```

### Epic 4: Morning Ritual Flow
**Labels:** feature, frontend, ai-integration, p1-high
**Milestone:** Beta (v0.5)
**Description:**
```markdown
Guided morning ritual with AI-generated standup.

## Features
- Personalized greeting (time, weather)
- Review yesterday's incomplete
- Quick actions: Tomorrow, Next Week, Backlog, Delete
- Filter by workspace
- AI-generated standup
- Dedicated standup page

## Success Criteria
- Appears on first open
- Weather API works
- AI standup readable
- Daily usage

## Dependencies
- AI/LLM integration
- Weather API
- Task filtering
```

### Epic 5: End-of-Day Reflection
**Labels:** feature, frontend, ai-integration, p1-high
**Milestone:** Beta (v0.5)
**Description:**
```markdown
Reflective end-of-day with celebration and accountability.

## Features
- "Close the day" button
- Celebrate mode (wins) + Reflect mode (shortcomings)
- Supportive tone
- Updates streak
- Delayed Pushover reminder

## Success Criteria
- Feels motivating
- Supportive, not guilty
- Streaks accurate
- Notifications work

## Dependencies
- Streak tracking
- Pushover API
- AI for prompts
```

### Epic 6: Gamification & Streaks
**Labels:** feature, frontend, backend, p1-high
**Milestone:** Beta (v0.5)
**Description:**
```markdown
Confetti, sound, streaks - satisfying completion.

## Features
- Confetti animation
- Sound effect (toggleable)
- Color pulse/glow
- Streak counter
- Milestone celebrations
- Progress indicators

## Success Criteria
- Completion rewarding
- Streaks motivate
- Not overwhelming

## Dependencies
- canvas-confetti
- Audio files
- Streak DB
```

### Epic 7: Time Tracking & Timers
**Labels:** feature, frontend, backend, p1-high
**Milestone:** Beta (v0.5)
**Description:**
```markdown
Focus + pomodoro timers visible simultaneously.

## Features
- Focus timer (counts up)
- Pomodoro timer (25/5 cycles)
- Both visible at once
- Start/stop/pause
- Time logs per task/subtask
- Estimate vs actual
- Pie chart visual

## Success Criteria
- Both timers work together
- Logs accurate
- Visual helps time blindness

## Dependencies
- Task API (time_logs)
- Timer UI components
```

### Epic 8: Jira Integration
**Labels:** feature, integration, backend, jira-integration, p1-high
**Milestone:** Beta (v0.5)
**Description:**
```markdown
Import Jira tickets and sync status.

## Features
- See assigned tickets
- Import with details + subtasks
- Sync status back to Jira
- Home widget showing count
- Sprint review AI summary

## Success Criteria
- Tickets appear automatically
- Completing updates Jira
- Sprint reviews professional

## Dependencies
- Jira API auth
- AI integration
```

### Epic 9: Calendar Integration
**Labels:** feature, integration, backend, calendar-integration, p1-high
**Milestone:** Beta (v0.5)
**Description:**
```markdown
Import and display calendar events.

## Features
- iOS Calendar integration
- iCal subscription support
- Timeline view
- Read-only
- Events alongside tasks

## Success Criteria
- Events visible
- Timeline works
- No manual sync

## Dependencies
- Calendar API
- CalDAV research
```

### Epic 10: Email Forward Integration
**Labels:** feature, integration, backend, email-integration, p2-medium
**Milestone:** Beta (v0.5)
**Description:**
```markdown
Forward email → create task.

## Features
- Unique email per user
- Email parser:
  - Subject → Title
  - Body → Description
  - Auto-tag "work"
- Manual channel assignment

## Success Criteria
- Forwarding works
- Tasks created correctly
- Context preserved

## Dependencies
- Email service
- Email parsing
```

### Epic 11: Apple Reminders Integration
**Labels:** feature, integration, backend, reminders-integration, p2-medium
**Milestone:** Beta (v0.5)
**Description:**
```markdown
Sync with Apple Reminders for mobile capture.

## Features
- Import reminders
- Bidirectional sync
- Mobile capture workflow

## Success Criteria
- Sync automatic
- Mobile workflow seamless

## Dependencies
- EventKit/Shortcuts research
```

### Epic 12: AI Features (Standup, Sprint Reviews)
**Labels:** feature, ai-integration, backend, p1-high
**Milestone:** Beta (v0.5)
**Description:**
```markdown
AI standup and sprint review summaries.

## Features
- Daily standup generation
- Sprint review summaries (bi-weekly)
- Professional tone
- Copy/paste ready
- Stored history

## Success Criteria
- Saves time daily
- Impresses stakeholders
- Tone matches needs

## Dependencies
- Claude API
- Jira integration
- Prompt engineering
```

### Epic 13: Subtasks & Nested Kanban
**Labels:** feature, frontend, backend, p2-medium
**Milestone:** Alpha (v0.1)
**Description:**
```markdown
Subtasks with mini kanban (To Do, Doing, Done).

## Features
- Add/edit/delete subtasks
- Nested kanban in task card
- 3 states
- Drag between states
- Track completion

## Success Criteria
- Complex tasks breakable
- Intuitive interface
- Progress visible

## Dependencies
- Main kanban working
- Nested drag support
```

### Epic 14: Weekly Planning View
**Labels:** feature, frontend, p2-medium
**Milestone:** Alpha (v0.1)
**Description:**
```markdown
Week-as-sprint planning.

## Features
- View week as sprint
- Tasks per day
- Drag from backlog → day
- Simple, not overwhelming

## Success Criteria
- Quick week planning
- No cognitive load
- Helpful, not mandatory

## Dependencies
- Task date filtering
- Drag to days
```

### Epic 15: Multiple View Modes
**Labels:** feature, frontend, p2-medium
**Milestone:** v1.0
**Description:**
```markdown
Kanban, List, Calendar views.

## Features
- Kanban (default)
- List view
- Calendar timeline
- Easy toggle
- Saved preferences

## Success Criteria
- All views show same data
- Seamless toggle
- User choice

## Dependencies
- Calendar integration
- State management
```

### Epic 16: Home Dashboard
**Labels:** feature, frontend, p2-medium
**Milestone:** v1.0
**Description:**
```markdown
Widget-based command center.

## Features
- Quick stats
- Jira preview
- Calendar events
- Email tasks
- Integration widgets
- All-in-one view

## Success Criteria
- Useful landing page
- Fast loading
- Info at a glance

## Dependencies
- All integrations
```

### Epic 17: MCP Server for Claude
**Labels:** feature, backend, ai-integration, p2-medium
**Milestone:** Beta (v0.5)
**Description:**
```markdown
MCP server for Claude task management.

## Features
- Claude reads tasks
- Claude creates/updates
- Claude organizes backlog
- Claude suggests priorities
- Voice-like interaction

## Success Criteria
- "What should I work on?" works
- Reorganizes based on deadlines
- Feels like assistant

## Dependencies
- MCP SDK
- Task API
- Auth/permissions
```

---

## Next Steps

1. **Create the project structure in Linear**
   - Use the Linear web interface or CLI
   - Create "Tasker" project in Taskerapp workspace
   - Set up milestones
   - Create labels

2. **Create initial setup issues (TASK-1 through TASK-9)**
   - Copy descriptions from above
   - Set to Alpha (v0.1) milestone
   - Assign to yourself
   - Set dependencies

3. **Create epic issues (Epic 1-17)**
   - Copy descriptions from above
   - Set appropriate milestones
   - Add dependencies

4. **Start first sprint**
   - Move TASK-1 to "In Progress"
   - Begin project scaffolding

---

## Linear CLI Commands (if available)

```bash
# Create project
linear project create --name "Tasker" --key "TASK"

# Create label
linear label create --name "frontend" --color "#3B82F6"

# Create issue
linear issue create --title "TASK-1: Project Scaffolding" --description "..." --label "infrastructure" --priority 0

# Create milestone
linear milestone create --name "Alpha (v0.1)" --target-date "2025-11-25"
```

---

**Total Issues to Create:**
- 9 Setup issues (TASK-1 through TASK-9)
- 17 Epic/Feature issues
- **Total: 26 issues**

Let me know if you need help with any specific part!
