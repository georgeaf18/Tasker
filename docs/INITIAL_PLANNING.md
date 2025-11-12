# Daily Task Manager - Initial Planning

## 1. Problem Definition

### What problem are we solving?

**The core pain point:**
As someone with ADHD and memory issues, I can't remember what I need to do without seeing it visually. Current tools either hide my backlog (so I forget things) or show too much at once (overwhelming). I need a simple, visual system that shows today's tasks AND my backlog simultaneously, without requiring cognitive overhead to organize.

**Current state (Sunsama):**
- Week-column view doesn't match how I work (I don't plan days ahead)
- Tasks pile up in columns with nowhere to go
- Moving tasks between days requires too much mental energy
- Backlog is hidden - out of sight, out of mind
- Becomes overwhelming with too many options/views
- Forces planning behavior I don't naturally have

**Desired state:**
- **Separate backlog sidebar** (not a kanban column) organized by workspace/channels
- **Kanban board:** Today → In Progress → Done
- **Backlog organized:** "Yesterday incomplete", "Due soon", then by workspace (work/personal) and channels
- **Week-as-sprint planning:** Use weeks like sprints for simple planning
- Everything visible at once - no hidden tasks
- Zero cognitive load to move tasks (simple drag or single click)
- Satisfying task completion (confetti + sound + color = dopamine hit)
- Morning view: routine tasks auto-populate Today, then pull from backlog
- **Nested kanban for subtasks** within each task
- **Streaks** for closing the day (gamification)

### Who is this for?

**Primary User: George**
- 29-year-old software engineer
- Works remotely for car insurance company
- ADHD + dyslexia
- **Core challenges:**
  - Cannot remember tasks, routines, or events without visual reminders
  - Executive dysfunction - hard to plan ahead, gets overwhelmed easily
  - Cognitive load is limited - needs to preserve mental energy for actual work
  - Visual learner - must SEE everything to process it
  - Struggles with typical neurotypical organizational skills

**Current workflow (Sunsama):**
- Morning ritual: sees today's tasks
- Timeline view shows calendar events visually
- Tasks from multiple sources: Jira tickets, manual tasks, email imports, Apple Reminders
- Filters: "work" channel vs personal
- Routine tasks prevent forgetting basics (breakfast, meds, yoga, dog)
- Subtasks track progress (e.g., "release to QAG", "submit PR")
- Focus mode timer (regular + pomodoro)
- Time tracking per subtask
- Marks tasks done when complete

**What works:**
- Visual timeline of events
- Seeing all tasks in one place
- Subtask tracking
- Timer/focus modes
- Easy task completion
- Multiple integrations

**What doesn't work:**
- Week-column view (doesn't plan like that)
- Tasks pile up with nowhere to go
- Moving tasks between days = too much cognitive load
- Backlog hidden - things get forgotten
- Can only use one timer mode at a time (wants both)
- Becomes overwhelming easily
- Too much planning overhead

### What are we NOT solving? (Out of scope)

**v0.1 explicitly excludes:**
- Week/month planning views
- Complex scheduling features
- Team collaboration
- Time tracking (add in v0.2+)
- Integrations (Jira, Calendar, Reminders - v0.2+)
- Mobile app
- Notifications/reminders
- Recurring tasks automation
- Analytics/reports

---

## 2. Success Criteria (Version 0.1 - MVP)

**The ONE core problem v0.1 solves:**
"I need to see my backlog and today's tasks in one simple visual view, so I never forget what needs to be done and don't get overwhelmed"

**How do we know it's working?**
- I use it every morning instead of Sunsama
- I don't forget tasks that are sitting in backlog
- I feel satisfied when completing tasks (not overwhelmed)
- I can add a task and see it immediately
- Moving tasks from backlog → today → done feels effortless

**What can the user do in v0.1?**
1. See **Backlog sidebar** organized by:
   - Yesterday's incomplete tasks (top)
   - Due soon section
   - Workspace sections (work/personal)
   - Channels/categories within workspaces
2. See **Kanban board** with 3 columns: Today → In Progress → Done
3. **Morning routine:** Today column auto-populated with routine tasks
4. Create tasks manually (title, description, workspace, channel, due date)
5. Add subtasks with **nested kanban** (To Do → Doing → Done for subtasks)
6. Drag tasks from backlog → Today, then through the board
7. Mark tasks complete with **confetti + sound + color change** (all three!)
8. **Close the day** with streak tracking
9. Use **weekly view** to plan the week like a sprint

**Definition of Done for v0.1:**
- [ ] Backlog sidebar shows tasks organized by: yesterday incomplete, due soon, workspace, channels
- [ ] Kanban board displays 3 columns: Today, In Progress, Done
- [ ] Today column auto-populates with routine tasks each morning
- [ ] Can create tasks with title, description, workspace, channel, due date, subtasks
- [ ] Each task has nested kanban for subtasks (To Do → Doing → Done)
- [ ] Can drag tasks from backlog → kanban board
- [ ] Can move tasks between kanban columns
- [ ] Task completion triggers: confetti animation + sound effect + color change
- [ ] End-of-day flow with streak tracking
- [ ] Weekly planning view (explore week-as-sprint concept)
- [ ] All backlog tasks visible - no hidden/paginated tasks
- [ ] Data persists in SQLite across sessions
- [ ] UI is high-contrast, dyslexia-friendly (readable font, generous spacing)
- [ ] Automated tests pass (unit + integration)
- [ ] Deployed and running locally
- [ ] Used for 1 full week to gather feedback

---

## 3. Feature Breakdown & Versioning

### Version 0.1 (MVP - Week 1-2)
**Goal:** Simple visual task board that shows backlog + today without overwhelming

**Features:**

**1. Layout: Backlog Sidebar + Kanban Board**
- Acceptance criteria:
  - [ ] **Left sidebar:** Backlog organized hierarchically
    - [ ] "Yesterday incomplete" section at top
    - [ ] "Due soon" section
    - [ ] Workspace sections (work/personal) - collapsible
    - [ ] Channels within workspaces - collapsible
  - [ ] **Main area:** Kanban with 3 columns: Today, In Progress, Done
  - [ ] Sidebar can be collapsed/expanded
  - [ ] High contrast, generous spacing, readable font
  - [ ] Column headers clearly labeled
- Technical requirements:
  - [ ] Responsive grid layout (sidebar + main area)
  - [ ] CSS for dyslexia-friendly design (1.5-2x line spacing, high contrast)
  - [ ] Collapsible sections in sidebar (accordion or similar)

**2. Task Creation**
- Acceptance criteria:
  - [ ] Can create task with:
    - [ ] Title (required)
    - [ ] Description (optional)
    - [ ] Workspace (work/personal)
    - [ ] Channel/category
    - [ ] Due date (optional)
    - [ ] Routine task toggle (appears in Today automatically each morning)
  - [ ] Can add subtasks with nested kanban (To Do, Doing, Done)
  - [ ] Task appears in backlog sidebar immediately (in correct workspace/channel)
- Technical requirements:
  - [ ] POST /api/tasks endpoint
  - [ ] POST /api/tasks/:id/subtasks endpoint
  - [ ] Modal or inline form
  - [ ] Validation (title, workspace required)

**3. Task Management**
- Acceptance criteria:
  - [ ] Can drag task from backlog sidebar → Today column
  - [ ] Can drag task between kanban columns (Today → In Progress → Done)
  - [ ] Can edit task title/description/workspace/channel/due date
  - [ ] Can delete task
  - [ ] **Nested subtask kanban:**
    - [ ] Each task card shows mini kanban for subtasks
    - [ ] Subtasks move: To Do → Doing → Done
    - [ ] Can add/edit/delete subtasks
- Technical requirements:
  - [ ] PATCH /api/tasks/:id endpoint
  - [ ] PATCH /api/subtasks/:id endpoint
  - [ ] DELETE /api/tasks/:id endpoint
  - [ ] Drag-and-drop library (supports nested drag zones)

**4. Task Completion Satisfaction**
- Acceptance criteria:
  - [ ] Marking task complete triggers ALL of:
    - [ ] Confetti animation (canvas-confetti)
    - [ ] Sound effect (satisfying "ding" or similar)
    - [ ] Color change (task card pulses/glows before disappearing)
    - [ ] Optional celebratory message
  - [ ] Dopamine hit for ADHD brain
  - [ ] Sound can be toggled in settings
- Technical requirements:
  - [ ] Animation library (canvas-confetti)
  - [ ] Audio file + Web Audio API
  - [ ] CSS animations for color/glow effect
  - [ ] Settings to disable sound if needed

**5. Morning Routine Auto-Population**
- Acceptance criteria:
  - [ ] When app opens in morning, Today column shows:
    - [ ] All tasks marked as "routine" (breakfast, meds, yoga, dog, etc.)
    - [ ] Tasks from yesterday that weren't completed (carried over)
  - [ ] User manually drags additional tasks from backlog → Today
- Technical requirements:
  - [ ] Daily reset logic (detect new day)
  - [ ] Routine task template system
  - [ ] GET /api/tasks/today endpoint (returns routine + carryover)

**6. Streak Tracking & End-of-Day Flow**
- Acceptance criteria:
  - [ ] "Close the day" button/flow
  - [ ] Shows streak counter (days in a row completing routine tasks)
  - [ ] Optionally: daily reflection prompt or summary
  - [ ] Feels satisfying - visual celebration
- Technical requirements:
  - [ ] Streak calculation logic
  - [ ] POST /api/streaks/close-day endpoint
  - [ ] Simple animation/celebration on streak milestone

**7. Weekly Planning View**
- Acceptance criteria:
  - [ ] Can view current week as a "sprint"
  - [ ] See what's planned for each day
  - [ ] Drag tasks to specific days in the week
  - [ ] Simple, not overwhelming (explore concept in v0.1)
- Technical requirements:
  - [ ] Weekly calendar view component
  - [ ] GET /api/tasks/week endpoint
  - [ ] Drag tasks from backlog → specific day

**8. Data Persistence**
- Acceptance criteria:
  - [ ] Tasks persist across browser refresh
  - [ ] SQLite database stores all task data
- Technical requirements:
  - [ ] SQLite schema for tasks, subtasks, workspaces, channels, streaks
  - [ ] Backend CRUD operations

### Version 0.2 (Alpha - Week 3-4)
**Goal:** Add routine tasks and basic time awareness

**Features:**
- [ ] Recurring routine tasks (breakfast, meds, yoga, dog)
- [ ] Today's date prominently displayed
- [ ] Simple calendar event display (read-only, no timeline yet)
- [ ] Both focus timers visible (regular + pomodoro simultaneously)
- [ ] Time tracking per task (manual start/stop)
- [ ] Time estimates (optional field when creating task)
- [ ] End-of-day reflection ritual (celebrate + reflect)

### Version 0.5 (Beta - Week 5-8)
**Goal:** Integration completeness + AI assistance

**Features:**
- [ ] Jira integration (import tickets with subtasks)
- [ ] Sprint review summary generation (bi-weekly)
- [ ] Calendar integration (timeline view like Sunsama)
- [ ] Apple Reminders integration (import + sync)
- [ ] Email forward import (unique email address per user)
- [ ] Time tracking per subtask
- [ ] Visual timeline showing time spent on tasks
- [ ] Estimate vs actual time comparison UI
- [ ] Server-side notifications via Pushover
- [ ] Personal task reminders to phone (after destress delay)
- [ ] MCP server for Claude to manage tasks

### Version 1.0 (Production)
**Goal:** Polish and production-ready

**Features:**
- [ ] Performance optimization
- [ ] Error handling
- [ ] User documentation
- [ ] Home dashboard (widget-like overview of all integrations)
- [ ] Multiple view modes (Kanban, List, Calendar timeline)
- [ ] Export/backup data functionality

### Version 2.0+ (Future)
**Goal:** ML and advanced insights

**Features:**
- [ ] ML-powered time estimates based on historical data
- [ ] Pattern recognition (task duration predictions)
- [ ] Productivity insights and trends
- [ ] Advanced analytics
- [ ] Multi-user support (if needed)
- [ ] Mobile native app (if web app insufficient)

---

## 3a. Sunsama Feature Parity & Improvements

### Morning Ritual Flow (keep + improve)
**Current Sunsama behavior:**
- Good morning message
- Shows tasks from yesterday that didn't get done
- Decision flow: move to tomorrow, next week, or backlog
- Filter by workspace during ritual

**Our improvements:**
- [ ] Good morning message with:
  - [ ] Current time
  - [ ] Weather/temperature
  - [ ] Personalized greeting
- [ ] Guided morning ritual workflow:
  - [ ] Review yesterday's incomplete tasks
  - [ ] Quick actions: "Tomorrow", "Next Week", "Backlog", "Delete"
  - [ ] Filter by workspace during review
- [ ] **AI-generated daily standup:**
  - [ ] Uses yesterday's completed tasks
  - [ ] Uses today's planned tasks
  - [ ] Generates standup update text
  - [ ] Stored in dedicated tab/page for copy/paste to Slack/etc.

### End-of-Day Reflection Ritual
**Vision:**
- [ ] "Close the day" flow with reflection component
- [ ] Two modes:
  - [ ] **Celebrate mode:** Show what was accomplished, positive reinforcement
  - [ ] **Reflect mode:** Gentle prompts to address shortcomings or issues
- [ ] Not judgmental - supportive tone
- [ ] Updates streak counter
- [ ] After ritual complete:
  - [ ] Wait for destress period (configurable time)
  - [ ] Send gentle reminder of personal tasks to phone
  - [ ] Use Pushover for server-side notifications (so it works even if app closed)

### Calendar Integration (critical)
**Requirements:**
- [ ] Import events from iOS Calendar
- [ ] Support iCal subscription URLs
- [ ] Visual timeline view (like Sunsama)
- [ ] See calendar events alongside tasks
- [ ] Read-only (don't need to create events in app)

### Jira Integration
**Requirements:**
- [ ] See all assigned Jira tickets
- [ ] Easy access - maybe widget on home screen
- [ ] Import tickets with details + subtasks
- [ ] Sync status back to Jira when completed
- [ ] **Sprint review summaries:**
  - [ ] Bi-weekly sprint reviews (every Thursday at work)
  - [ ] Select tickets worked on during sprint (2-week period)
  - [ ] AI generates stakeholder-friendly summary
  - [ ] Professional tone, business-appropriate
  - [ ] Save/export for meetings

### Multiple View Modes
**View options to support:**
- [ ] Kanban view (default)
- [ ] List view (simple task list)
- [ ] Calendar view (timeline with tasks + events)
- [ ] Other views TBD (explore based on usage)

### Email Integration
**Use case:**
- Work emails with action items or follow-ups
- Forward email to app → creates task automatically
- Task contains email context/link

**Requirements:**
- [ ] Unique email address per user (e.g., tasks-abc123@app.com)
- [ ] Email parser extracts:
  - [ ] Subject → Task title
  - [ ] Body → Task description
  - [ ] Link back to original email (if possible)
  - [ ] Automatically tagged as "work" workspace
- [ ] Manual assignment to channel after creation

### Time Tracking & Estimates
**Current Sunsama behavior:**
- Focus mode timer (regular)
- Pomodoro mode timer
- Track time per task
- Track time per subtask

**Our improvements:**
- [ ] **Both timer modes visible simultaneously:**
  - [ ] Regular focus timer (counts up)
  - [ ] Pomodoro timer (25/5 cycles)
  - [ ] User can see both, choose which to follow
- [ ] **Estimates vs Actual:**
  - [ ] Add time estimate when creating task (optional)
  - [ ] Track actual time spent
  - [ ] Compare estimate vs actual for learning
  - [ ] Visual indicator if over/under estimate
- [ ] **Future ML possibilities:**
  - [ ] Analyze historical task times
  - [ ] Suggest estimates for similar tasks
  - [ ] Identify patterns (work tasks take 2x estimates, etc.)
  - [ ] Not in v1 - document for future exploration

### Home Screen/Dashboard Concept
**Vision:**
- Widget-like layout showing:
  - [ ] Quick stats (tasks done today, streak, etc.)
  - [ ] Jira assigned tickets count/preview
  - [ ] Calendar upcoming events
  - [ ] Email-imported tasks pending review
  - [ ] Each integration has a widget
  - [ ] All-in-one command center view
- Different from main kanban board
- Optional landing page or toggle view

---

## 4. Technical Architecture

### Tech Stack
- **Frontend:** Angular (latest, standalone components)
- **Backend:** Node.js + [Framework TBD: NestJS vs Express vs Fastify]
- **Database:** SQLite (migrate to PostgreSQL post-v1 if needed)
- **API:** REST
- **Deployment:** Local (dev) → [Production TBD]

### Data Model (Draft)
```sql
-- Core tables for v0.1
tasks:
  - id
  - title
  - description
  - workspace (work/personal)
  - channel_id (FK to channels)
  - status (backlog/today/in_progress/done)
  - due_date
  - is_routine (boolean - auto-adds to Today each morning)
  - time_estimate_minutes (optional)
  - time_actual_minutes (calculated from time logs)
  - source (manual/jira/email/reminders)
  - source_id (e.g., Jira ticket ID, email ID)
  - completed_at
  - created_at
  - updated_at

subtasks:
  - id
  - task_id (FK)
  - title
  - status (todo/doing/done)
  - order
  - created_at
  - updated_at

channels:
  - id
  - name
  - workspace (work/personal)
  - color (optional, for UI)
  - created_at

streaks:
  - id
  - date
  - routine_tasks_completed (count)
  - streak_count (running total)
  - created_at

-- Future tables (v0.2+)
time_logs (v0.2):
  - id
  - task_id (FK)
  - subtask_id (FK, nullable)
  - started_at
  - ended_at
  - duration_minutes
  - timer_mode (focus/pomodoro)
  - created_at

calendar_events (v0.2):
  - id
  - title
  - start_time
  - end_time
  - source (ios_calendar/ical)
  - source_id
  - created_at

integrations (v0.5):
  - id
  - type (jira/email/reminders/calendar)
  - config (JSON - API keys, settings, etc.)
  - last_sync_at
  - created_at

reflections (v0.2):
  - id
  - date
  - accomplishments (text)
  - challenges (text)
  - ai_generated_insight (optional)
  - created_at
```

### API Endpoints (v0.1 only)
```
Tasks:
POST   /api/tasks                  - Create task
GET    /api/tasks                  - List all tasks (with filters for status, workspace)
GET    /api/tasks/today            - Get today's tasks (routine + carryover)
GET    /api/tasks/week             - Get week view
GET    /api/tasks/backlog          - Get backlog organized by workspace/channel
GET    /api/tasks/yesterday        - Get yesterday's incomplete tasks
GET    /api/tasks/:id              - Get task details
PATCH  /api/tasks/:id              - Update task (status, title, etc.)
DELETE /api/tasks/:id              - Delete task
POST   /api/tasks/:id/complete     - Mark complete (triggers confetti/sound)

Subtasks:
POST   /api/tasks/:id/subtasks     - Add subtask
PATCH  /api/subtasks/:id           - Update subtask (status, title)
DELETE /api/subtasks/:id           - Delete subtask

Channels:
GET    /api/channels               - List all channels
POST   /api/channels               - Create channel
PATCH  /api/channels/:id           - Update channel
DELETE /api/channels/:id           - Delete channel

Streaks:
GET    /api/streaks                - Get streak history
POST   /api/streaks/close-day      - Close the day, update streak
```

---

## 5. UI/UX Planning

### Dyslexia-Friendly Requirements (Critical for v0.1)
- [ ] Generous line spacing (1.5-2x minimum)
- [ ] High contrast mode (dark text on light bg, or dark mode option)
- [ ] Adjustable font size (settings panel)
- [ ] Clear visual hierarchy (size/weight/color to distinguish importance)
- [ ] Minimal clutter - one primary view, no hidden menus
- [ ] Left-aligned text (no justified text)
- [ ] Short line lengths for reading (40-60 characters)
- [ ] Sans-serif font (easier to read)
- [ ] Avoid red/green for critical info (colorblind considerations)

**Research needed:**
- [ ] Test OpenDyslexic font vs standard sans-serif
- [ ] Bionic Reading implementation (bold first letters)
- [ ] User preference: does highlighting help or hurt?

### Wireframes Needed (v0.1)
- [ ] **Main layout:** Backlog sidebar + Kanban board (3 columns)
- [ ] **Backlog sidebar structure:**
  - [ ] Yesterday incomplete section
  - [ ] Due soon section
  - [ ] Workspace sections (collapsible)
  - [ ] Channels within workspaces (collapsible)
- [ ] **Task card design:**
  - [ ] Title, description, workspace/channel tags
  - [ ] Nested kanban for subtasks (mini columns: To Do, Doing, Done)
  - [ ] Due date badge
  - [ ] Routine task indicator
- [ ] **Task creation modal**
- [ ] **Task completion animation** (confetti + color change mockup)
- [ ] **Weekly planning view** (week-as-sprint layout)
- [ ] **End-of-day flow** (streak display, celebration)
- [ ] Mobile-responsive layout (even though desktop-first)

**Design principles:**
- Visual learner: colors, shapes, clear boundaries
- ADHD-friendly: minimize decisions, obvious next actions
- Satisfying interactions: animations, feedback, dopamine hits
- **Nested organization:** Backlog sidebar prevents board overwhelm

### Design System
- [ ] Color palette (high contrast options)
- [ ] Typography scale
- [ ] Spacing system
- [ ] Component library choice: [TBD: Material/Tailwind/PrimeNG/Custom]

---

## 6. Testing Strategy

### Automated Testing Pyramid

**Unit Tests:**
- All business logic functions
- Database operations
- API endpoints
- Target: 80% coverage minimum

**Integration Tests:**
- API → Database flow
- Frontend → Backend communication
- External API integrations (Jira, Calendar)

**E2E Tests:**
- Critical user paths:
  - [ ] Create task → view in today list → mark complete
  - [ ] [Add more paths as features grow]

**Testing Tools:**
- Backend: Jest + Supertest
- Frontend: Jasmine/Karma (Angular default) or Vitest
- E2E: Playwright or Cypress

**CI/CD:**
- Run tests on every commit
- Block merge if tests fail
- [Tool TBD: GitHub Actions?]

---

## 7. Environment Strategy

### Development
- Local SQLite database
- Hot reload for frontend/backend
- Mock external APIs
- Seed data for testing

### Testing/Staging
- Separate SQLite database
- Automated test suite runs here
- Real API integrations (sandboxed accounts)

### Production (v0.1 = local)
- Local deployment first
- Real data
- Backup strategy: [TBD]

### Future Production (post-v1)
- Home server deployment
- PostgreSQL migration
- Proper backup/restore
- Monitoring

---

## 8. Development Workflow

### Sprint Structure (1-week cycles)
**Monday:**
- Sprint planning
- Pick issues from milestone
- Update Linear

**Tuesday-Thursday:**
- Build
- Write tests
- Update Linear daily

**Friday:**
- Code review (self-review checklist)
- Retro notes
- Plan next sprint

### Git Workflow
- `main` branch = production-ready
- `develop` branch = active development
- Feature branches: `feature/task-creation`
- PR required even solo (self-discipline)

### Linear Workflow
- **Backlog** → **Todo** → **In Progress** → **In Review** → **Done**
- Update status daily
- Link commits to issues

---

## 9. Risk Management & Flexibility

### Known Risks
1. **Risk:** Scope creep
   - **Mitigation:** Ruthless prioritization, v0.1 only solves ONE problem

2. **Risk:** Perfect UI rabbit hole
   - **Mitigation:** Ship ugly but functional v0.1, iterate based on feedback

3. **Risk:** Integration complexity (Jira/Calendar/Reminders)
   - **Mitigation:** Mock integrations in v0.1, real APIs in v0.2+

4. **Risk:** Database migration pain (SQLite → Postgres)
   - **Mitigation:** Design schema with migration in mind, document assumptions

### Change Readiness
- Architecture allows swapping components (backend framework, UI library)
- Database schema versioning from day 1
- Feature flags for gradual rollout
- Regular checkpoints: "Is this still solving the right problem?"

---

## 10. Timeline & Milestones

### Week 1: Planning & Setup
- [ ] Finalize v0.1 scope (THE ONE PROBLEM)
- [ ] Create wireframes
- [ ] Database schema design
- [ ] Project scaffolding (Angular + Node + SQLite)
- [ ] Testing infrastructure setup

### Week 2: Build v0.1
- [ ] Backend API (tasks CRUD)
- [ ] Frontend "today" view
- [ ] Basic task creation
- [ ] Automated tests
- [ ] Deploy locally

### Week 3: Feedback & Iterate
- [ ] Use the app daily
- [ ] Collect pain points
- [ ] Prioritize v0.2 features
- [ ] Plan next sprint

---

## 11. Open Questions & Research Needed

### Technical Decisions
- [ ] Which Node.js framework? (NestJS vs Express vs Fastify)
- [ ] UI component library for dyslexia-friendly design?
- [ ] Drag-and-drop library (supports nested zones for subtasks)

### Integration Research
- [ ] Calendar API integration:
  - [ ] iOS Calendar access from web app (CalDAV?)
  - [ ] iCal subscription parsing
  - [ ] How to sync without native iOS access?
- [ ] Apple Reminders integration approach:
  - [ ] EventKit (requires native macOS app?)
  - [ ] Shortcuts automation?
  - [ ] AppleScript?
- [ ] Jira API:
  - [ ] Authentication flow (OAuth? API token?)
  - [ ] Webhook for real-time sync?
  - [ ] Rate limits?

### AI/LLM Features
- [ ] Daily standup generation:
  - [ ] Which model? (Claude API, local LLM, other?)
  - [ ] Prompt engineering for standup format
  - [ ] Store in database or generate on-demand?
- [ ] Sprint review summary generation:
  - [ ] Professional stakeholder-appropriate tone
  - [ ] Based on selected Jira tickets from 2-week sprint
  - [ ] Format for meetings/presentations
- [ ] End-of-day reflection prompts:
  - [ ] Supportive, non-judgmental tone
  - [ ] Contextual based on day's accomplishments
- [ ] MCP server capabilities (future)
- [ ] Future ML for time estimates (v2.0+)

### Weather API
- [ ] Weather service for morning greeting (OpenWeather? Apple Weather?)

### Email Integration
- [ ] Email receiving service (SendGrid? Mailgun? AWS SES?)
- [ ] Unique address generation per user
- [ ] Email parsing library
- [ ] Spam/security considerations

### Notification Service
- [ ] Pushover API integration (server-side push notifications)
- [ ] Delayed notification logic (destress period after end-of-day)
- [ ] Personal task filtering for phone reminders

### Database & Storage
- [ ] Backup strategy for SQLite file
- [ ] Export/import format for data portability

### Accessibility
- [ ] OpenDyslexic font - helpful or not?
- [ ] Bionic Reading implementation
- [ ] Screen reader compatibility?

---

## 12. Next Steps

1. **Define THE ONE CORE PROBLEM v0.1 solves** (Section 2)
2. **Sketch wireframes** (pen and paper or tool?)
3. **Design database schema** (detailed)
4. **Choose Node.js framework** (research + decide)
5. **Set up Linear project** (milestones, labels, initial issues)
6. **Create project repositories**
7. **Start Week 1 sprint**

---

## Notes & Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-11-11 | SQLite for v0.1, migrate to Postgres post-v1 if needed | Start simple, avoid database overhead, can migrate later |
| 2025-11-11 | Angular latest for frontend | User preference, standalone components, modern patterns |
| 2025-11-11 | Backlog as sidebar, not kanban column | Prevents overwhelm, keeps board clean, backlog always visible |
| 2025-11-11 | Morning ritual + AI standup generation | Matches Sunsama workflow user loves, adds AI value |
| 2025-11-11 | Multiple view modes (Kanban, List, Calendar) | Flexibility for different workflows, visual variety |
| 2025-11-11 | Home dashboard with widgets | All integrations visible at once, command center concept |
| 2025-11-11 | End-of-day reflection ritual | ADHD-friendly closure, celebrate wins, gentle accountability |
| 2025-11-11 | Both timers visible (focus + pomodoro) | User wants both simultaneously, not either/or |
| 2025-11-11 | Email forward integration | Match Sunsama workflow for work email action items |
| 2025-11-11 | Sprint review AI summaries | Work requirement: bi-weekly stakeholder updates |
| 2025-11-11 | Pushover for notifications | Server-side push even when app closed, delayed personal reminders |
| 2025-11-11 | Time estimates + ML future | Learn how long tasks take, improve planning over time |
| | | |

