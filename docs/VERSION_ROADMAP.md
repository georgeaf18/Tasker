# Tasker - Version Roadmap

**Philosophy:** Release fast and often. Ship small bits. Get into feedback loops quickly. Each version solves ONE core problem.

---

## v0.1 Alpha - "The Visual Core"

**Version:** 0.1.0
**Timeline:** 1 week
**Status:** Not Started

### Core Goal
Create a minimal visual task manager that lets me see my backlog and today's tasks in one view, so I never forget what needs to be done.

### The ONE Problem This Solves
"I can't remember tasks if they're hidden, but seeing everything at once is overwhelming. I need backlog visible but separate from my daily focus."

### Features Included
1. **Backlog sidebar** - organized by workspace (work/personal) and channels
2. **Kanban board** - 3 columns: Today, In Progress, Done
3. **Create tasks** - title, workspace, channel, due date (basic form)
4. **Drag tasks** - from backlog to Today column
5. **Move tasks** - between kanban columns
6. **Mark complete** - simple click to complete
7. **Data persists** - SQLite, survives refresh

### Features Explicitly NOT Included
- NO subtasks (v0.2)
- NO routine tasks auto-population (v0.2)
- NO confetti/animations (v0.2)
- NO weekly planning view (v0.3)
- NO streak tracking (v0.2)
- NO time tracking (v0.5)
- NO integrations (v0.5+)
- NO filters/search (v0.3)
- NO "yesterday incomplete" section (v0.2)
- NO "due soon" section (v0.2)
- NO end-of-day flow (v0.2)

### User Can Do
- Add a task to backlog with workspace/channel
- See all backlog tasks organized by workspace
- Drag a task from backlog to Today
- Move task through: Today → In Progress → Done
- Mark a task complete
- See their tasks persist after closing app

### Success Criteria
- I use it for 3 days straight instead of Sunsama
- I can see my entire backlog without feeling overwhelmed
- Moving tasks feels effortless (drag or click)
- No tasks get forgotten in hidden views

### Definition of Done
- [ ] Left sidebar shows backlog organized by workspace/channels (collapsible sections)
- [ ] Main area shows 3-column kanban: Today, In Progress, Done
- [ ] Can create task with title, workspace, channel, due date
- [ ] Can drag task from backlog to Today column
- [ ] Can drag task between kanban columns
- [ ] Can mark task complete (moves to Done column)
- [ ] Can delete task
- [ ] SQLite database persists all data
- [ ] Dyslexia-friendly: high contrast, generous spacing, readable font
- [ ] Deployed and running locally
- [ ] Basic automated tests pass (CRUD operations)

---

## v0.2 Alpha - "The Dopamine Hit"

**Version:** 0.2.0
**Timeline:** 3-4 days
**Status:** Not Started

### Core Goal
Make task completion satisfying and handle my daily routine tasks automatically, so I get motivated to use it every day.

### The ONE Problem This Solves
"I need my ADHD brain to WANT to complete tasks, and I need my daily routines to show up automatically without thinking."

### Features Included
1. **Routine tasks** - flag tasks to auto-populate Today each morning
2. **Morning ritual** - Today auto-filled with routines + yesterday's incomplete
3. **Task completion celebration** - confetti + sound + color animation (all three!)
4. **Yesterday incomplete section** - in backlog sidebar (top)
5. **Due soon section** - in backlog sidebar (below yesterday)
6. **End-of-day flow** - "close the day" button
7. **Streak tracking** - days in a row completing routines

### Features Explicitly NOT Included
- NO subtasks yet (v0.3)
- NO weekly planning (v0.3)
- NO time tracking (v0.5)
- NO calendar integration (v0.5)
- NO reflection prompts (v0.4)
- NO AI standup generation (v0.5)

### User Can Do
- Mark a task as "routine" (breakfast, meds, yoga, dog)
- Open app in morning and see Today pre-filled with routines
- See yesterday's incomplete tasks at top of backlog
- See tasks due soon in dedicated section
- Complete task and get confetti + sound + color celebration
- Close the day and see streak counter increment

### Success Criteria
- I look forward to completing tasks (dopamine hit works)
- I don't forget my daily routines (breakfast, meds, etc.)
- I feel satisfied when closing the day
- My streak motivates me to maintain consistency

### Definition of Done
- [ ] Can toggle "routine task" when creating task
- [ ] Morning view auto-populates Today with routine tasks
- [ ] Yesterday incomplete section at top of backlog sidebar
- [ ] Due soon section in backlog sidebar
- [ ] Task completion triggers: confetti animation + sound + color change
- [ ] "Close the day" button/flow
- [ ] Streak counter shows days in a row
- [ ] Can toggle sound effects on/off in settings

---

## v0.3 Alpha - "The Subtask Manager"

**Version:** 0.3.0
**Timeline:** 3-4 days
**Status:** Not Started

### Core Goal
Let me break down complex tasks into subtasks with their own mini-kanban, so I can track progress on multi-step work.

### The ONE Problem This Solves
"Work tasks aren't single-step. I need to track 'submit PR', 'release to QAG', etc. within each Jira ticket without creating separate tasks."

### Features Included
1. **Subtasks** - add subtasks to any task
2. **Nested kanban** - each task shows mini columns: To Do, Doing, Done for subtasks
3. **Subtask drag** - move subtasks between mini columns
4. **Weekly planning view** - see current week, drag tasks to specific days
5. **Basic filters** - filter by workspace (work/personal)

### Features Explicitly NOT Included
- NO subtask time tracking (v0.5)
- NO advanced filters (v0.4)
- NO search (v0.4)
- NO multi-week view (v1.0)
- NO sprint planning (v0.5)

### User Can Do
- Add subtasks to a task
- See nested mini-kanban within each task card
- Drag subtasks through: To Do → Doing → Done
- View current week as calendar
- Drag tasks to specific days in week view
- Filter backlog by work or personal workspace

### Success Criteria
- I can track multi-step Jira tickets with subtasks
- I can plan my week by dragging tasks to specific days
- I can focus on work tasks only when needed

### Definition of Done
- [ ] Can add subtasks to any task
- [ ] Each task card shows nested kanban for subtasks (3 mini columns)
- [ ] Can drag subtasks between mini columns
- [ ] Can edit/delete subtasks
- [ ] Weekly calendar view shows current week
- [ ] Can drag tasks from backlog to specific days in week view
- [ ] Filter dropdown: All, Work, Personal
- [ ] Filtered view updates backlog sidebar

---

## v0.4 Beta - "The Polish"

**Version:** 0.4.0
**Timeline:** 3-4 days
**Status:** Not Started

### Core Goal
Improve usability with search, better organization, and reflection, so the app feels complete for daily use.

### The ONE Problem This Solves
"As my backlog grows, I need to find tasks quickly and get closure at end of day with reflection."

### Features Included
1. **Search** - search tasks by title/description
2. **Task editing** - inline edit task title, description, workspace, channel, due date
3. **End-of-day reflection** - celebrate mode shows accomplishments with positive reinforcement
4. **Better task cards** - show due date badges, routine indicators, workspace tags
5. **Archive done tasks** - auto-archive after 7 days or manual archive
6. **Settings panel** - toggle sound, adjust font size, theme (light/dark)

### Features Explicitly NOT Included
- NO time tracking (v0.5)
- NO integrations (v0.5+)
- NO AI features (v0.5+)
- NO advanced analytics (v2.0+)
- NO notifications (v0.5)

### User Can Do
- Search for tasks across backlog and board
- Edit task details inline without modal
- See end-of-day celebration with accomplishments
- Distinguish tasks visually (due date, routine, workspace)
- Archive completed tasks to clean up Done column
- Adjust app appearance and behavior in settings

### Success Criteria
- I can find any task quickly with search
- End-of-day reflection feels rewarding
- The app looks polished and professional
- I can customize it to my preferences

### Definition of Done
- [ ] Search bar filters tasks in real-time
- [ ] Click task to edit inline (title, description, workspace, channel, due date)
- [ ] End-of-day flow shows accomplishments with celebration
- [ ] Task cards display badges: due date, routine icon, workspace tag
- [ ] Done tasks auto-archive after 7 days
- [ ] Manual archive button in Done column
- [ ] Settings panel: sound toggle, font size slider, theme selector
- [ ] Dark mode theme option

---

## v0.5 Beta - "The Integration Beast"

**Version:** 0.5.0
**Timeline:** 2 weeks
**Status:** Not Started

### Core Goal
Connect to external tools (Jira, Calendar, Reminders) and add AI-powered features, so this becomes my single source of truth.

### The ONE Problem This Solves
"My tasks are scattered across Jira, Calendar, Apple Reminders, and email. I need them all in one place with intelligent assistance."

### Features Included
1. **Jira integration** - import assigned tickets with subtasks, sync status back
2. **Calendar integration** - read-only iOS Calendar events in timeline view
3. **Apple Reminders import** - one-way sync to import reminders as tasks
4. **Email forward** - unique email address per user to create tasks from emails
5. **AI daily standup** - generate standup text from yesterday/today tasks
6. **AI sprint review** - generate stakeholder summary from selected Jira tickets
7. **Basic time tracking** - manual start/stop timer per task
8. **Pushover notifications** - server-side push notifications for reminders
9. **Timeline view** - visual timeline showing calendar events + tasks

### Features Explicitly NOT Included
- NO bidirectional calendar sync (read-only only)
- NO reminders write-back (one-way import)
- NO automated email parsing (manual review required)
- NO subtask time tracking (v1.0)
- NO ML time estimates (v2.0+)
- NO home dashboard (v1.0)

### User Can Do
- Connect Jira account and see assigned tickets
- Import Jira tickets as tasks with subtasks
- Update task in app and sync status back to Jira
- See calendar events in timeline view
- Import Apple Reminders as tasks
- Forward work emails to create tasks
- Generate daily standup update text
- Generate sprint review summary for meetings
- Track time spent on tasks with simple timer
- Receive phone notifications for personal tasks after work

### Success Criteria
- I no longer open Jira/Reminders/Calendar apps separately
- AI standup saves me 5-10 minutes every morning
- Sprint reviews are professional and ready to present
- I can close work and get reminded of personal tasks later

### Definition of Done
- [ ] Jira OAuth integration with ticket import
- [ ] Jira webhook or polling for status sync
- [ ] iOS Calendar/iCal integration (read-only)
- [ ] Timeline view shows calendar events + tasks
- [ ] Apple Reminders import (one-way, manual trigger)
- [ ] Email receiving service with unique user addresses
- [ ] Email parser creates tasks with email context
- [ ] AI standup generation using Claude API
- [ ] AI sprint review generation with ticket selection
- [ ] Simple timer: start/stop/pause per task
- [ ] Time tracked stored and displayed on task cards
- [ ] Pushover integration for notifications
- [ ] Delayed notification logic (destress period after work)
- [ ] Settings: configure integrations, API keys, notification preferences

---

## v1.0 Production - "The Complete Product"

**Version:** 1.0.0
**Timeline:** 1 week
**Status:** Not Started

### Core Goal
Polish, optimize, and document everything to make this production-ready and maintainable.

### The ONE Problem This Solves
"The app works but needs performance optimization, error handling, and documentation to be truly reliable."

### Features Included
1. **Performance optimization** - lazy loading, virtual scrolling for long lists
2. **Error handling** - user-friendly error messages, retry logic
3. **Loading states** - skeleton screens, progress indicators
4. **User documentation** - help tooltips, onboarding tour, FAQ
5. **Home dashboard** - widget-like overview of integrations (Jira count, calendar preview)
6. **Multiple view modes** - toggle between Kanban, List, Timeline views
7. **Export/backup** - export all data to JSON, restore from backup
8. **Monitoring** - basic error logging and health checks

### Features Explicitly NOT Included
- NO ML features (v2.0+)
- NO mobile app (future if needed)
- NO multi-user/teams (future if needed)
- NO advanced analytics (v2.0+)
- NO PostgreSQL migration yet (post-v1 if needed)

### User Can Do
- Use app smoothly even with 1000+ tasks
- Recover from errors without losing data
- Understand how to use features with tooltips/help
- Switch between Kanban, List, and Timeline views
- See dashboard overview of all integrations
- Export all data for backup or migration
- Restore from backup if needed

### Success Criteria
- App loads in under 2 seconds
- No crashes or data loss for 30 days
- I can recommend it to others with confidence
- Documentation answers common questions

### Definition of Done
- [ ] Virtual scrolling for backlog sidebar
- [ ] Lazy loading for task cards and subtasks
- [ ] Error boundary components with retry buttons
- [ ] User-friendly error messages (not technical stack traces)
- [ ] Skeleton loading states for all async operations
- [ ] Onboarding tour on first launch
- [ ] Tooltips for all features
- [ ] FAQ/help page
- [ ] Home dashboard with integration widgets
- [ ] View mode toggle: Kanban / List / Timeline
- [ ] Export data to JSON button
- [ ] Import/restore from JSON button
- [ ] Basic error logging to file
- [ ] Health check endpoint for monitoring
- [ ] Performance testing: 1000+ tasks load smoothly
- [ ] 90%+ test coverage
- [ ] All features documented

---

## v2.0+ Future - "The Intelligence Layer"

**Version:** 2.0.0+
**Timeline:** TBD
**Status:** Future

### Core Goal
Add machine learning insights and advanced features based on usage patterns.

### The ONE Problem This Solves
"I want the app to learn from my behavior and help me plan more accurately over time."

### Features Included (Ideas, Not Committed)
1. **ML time estimates** - predict task duration based on historical data
2. **Pattern recognition** - identify when tasks take longer than expected
3. **Productivity insights** - trends, bottlenecks, suggestions
4. **Advanced analytics** - charts, reports, comparisons
5. **MCP server** - let Claude manage tasks via Model Context Protocol
6. **Multi-user support** - if sharing with others becomes needed
7. **Mobile native app** - if web app is insufficient
8. **Advanced recurring tasks** - complex schedules, dependencies
9. **PostgreSQL migration** - if SQLite becomes a bottleneck

### Features Explicitly NOT Included
- TBD based on v1.0 feedback

### User Can Do
- Get accurate time estimates for new tasks
- See insights about productivity patterns
- Understand what affects task completion times
- Let AI assistant manage tasks via voice/chat
- (Maybe) Share task lists with others
- (Maybe) Use mobile app for on-the-go

### Success Criteria
- TBD based on v1.0 usage data
- Focus on what users actually need

### Definition of Done
- TBD when v1.0 is complete and feedback is gathered

---

## Version Comparison Matrix

| Feature | v0.1 | v0.2 | v0.3 | v0.4 | v0.5 | v1.0 | v2.0+ |
|---------|------|------|------|------|------|------|-------|
| Backlog sidebar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Kanban board | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create tasks | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Drag & drop | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Data persistence | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Routine tasks | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Confetti/sound | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Streak tracking | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Yesterday section | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Due soon section | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subtasks | - | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Weekly planning | - | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Basic filters | - | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search | - | - | - | ✓ | ✓ | ✓ | ✓ |
| Reflection | - | - | - | ✓ | ✓ | ✓ | ✓ |
| Settings | - | - | - | ✓ | ✓ | ✓ | ✓ |
| Jira integration | - | - | - | - | ✓ | ✓ | ✓ |
| Calendar | - | - | - | - | ✓ | ✓ | ✓ |
| Reminders import | - | - | - | - | ✓ | ✓ | ✓ |
| Email forward | - | - | - | - | ✓ | ✓ | ✓ |
| AI standup | - | - | - | - | ✓ | ✓ | ✓ |
| AI sprint review | - | - | - | - | ✓ | ✓ | ✓ |
| Time tracking | - | - | - | - | ✓ | ✓ | ✓ |
| Notifications | - | - | - | - | ✓ | ✓ | ✓ |
| Timeline view | - | - | - | - | ✓ | ✓ | ✓ |
| Dashboard | - | - | - | - | - | ✓ | ✓ |
| Multiple views | - | - | - | - | - | ✓ | ✓ |
| Export/backup | - | - | - | - | - | ✓ | ✓ |
| Performance opt | - | - | - | - | - | ✓ | ✓ |
| Documentation | - | - | - | - | - | ✓ | ✓ |
| ML estimates | - | - | - | - | - | - | ✓ |
| Analytics | - | - | - | - | - | - | ✓ |
| MCP server | - | - | - | - | - | - | ✓ |

---

## Release Philosophy

### Guiding Principles
1. **One problem per version** - Each release solves a single, well-defined pain point
2. **Ship fast** - 1 week for v0.1, 3-4 days for subsequent alphas
3. **Feedback loops** - Use it daily, identify pain points, prioritize next version
4. **Ruthless scope control** - If it's not solving THE problem, move it to next version
5. **Incremental complexity** - Start simple (v0.1), layer on features gradually
6. **No gold plating** - Ship ugly but functional, polish comes later (v0.4+)

### Why This Approach?
- **ADHD-friendly:** Small wins create momentum
- **Risk reduction:** Find issues early when they're cheap to fix
- **Learning:** User feedback shapes priorities better than upfront planning
- **Motivation:** Frequent releases = visible progress = sustained energy
- **Flexibility:** Can pivot based on what actually works vs assumptions

### Version Timing Strategy
- **v0.1-0.3:** Ship weekly (3 weeks total) - establish core functionality
- **v0.4:** Polish pass (1 week) - make it feel complete
- **v0.5:** Integration sprint (2 weeks) - connect external tools
- **v1.0:** Production prep (1 week) - optimize and document
- **Total to v1.0:** ~8 weeks from start to production-ready

### Success Metrics
- **Usage:** Do I open it daily?
- **Completion:** Do I close tasks regularly?
- **Satisfaction:** Do I feel good using it?
- **Replacement:** Did I stop using Sunsama?

If these aren't true by v0.3, stop and reassess the approach.

---

## Notes

### Key Decisions
- **v0.1 is MINIMAL:** No subtasks, no animations, no weekly view. Just backlog + kanban + persistence.
- **v0.2 adds dopamine:** Confetti + routine tasks make it addictive to use.
- **v0.3 adds depth:** Subtasks + weekly planning for complex work.
- **v0.4 adds polish:** Search + reflection + settings make it complete.
- **v0.5 adds integrations:** External tools + AI make it powerful.
- **v1.0 adds production:** Performance + docs make it reliable.
- **v2.0+ adds intelligence:** ML + insights make it predictive.

### What Got Cut from Original v0.1
Moved to later versions:
- Subtasks → v0.3 (not core to backlog visibility)
- Confetti/animations → v0.2 (dopamine, but not minimum viable)
- Routine tasks → v0.2 (important but can add manually first)
- Weekly planning → v0.3 (nice to have, not essential day 1)
- Streak tracking → v0.2 (gamification comes after core works)
- Yesterday/due soon sections → v0.2 (organization improvements)
- End-of-day flow → v0.2 (closure ritual after basics work)

### Why This Works for ADHD
- **v0.1:** Solves the forgetting problem (backlog visible)
- **v0.2:** Solves the motivation problem (dopamine + routines)
- **v0.3:** Solves the complexity problem (subtasks for work)
- **v0.4:** Solves the usability problem (search + polish)
- **v0.5:** Solves the integration problem (single source of truth)
- **v1.0:** Solves the reliability problem (production-ready)
- **v2.0+:** Solves the prediction problem (AI assistance)

Each version builds on the previous, adding value without overwhelming.
