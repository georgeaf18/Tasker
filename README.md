# Tasker

An ADHD-friendly, dyslexia-friendly task management application designed for visual learners who need to see their backlog and today's tasks simultaneously without cognitive overload.

## Project Status

**Current Version:** Pre-Alpha (Planning Phase)
**Target v0.1 Alpha:** Week of 2025-11-18

## Problem We're Solving

As someone with ADHD and memory issues, I can't remember what I need to do without seeing it visually. Current tools either hide my backlog (so I forget things) or show too much at once (overwhelming). I need a simple, visual system that shows today's tasks AND my backlog simultaneously, without requiring cognitive overhead to organize.

## Core Features (v1.0 Vision)

### Morning Ritual

- Personalized greeting with weather and time
- Review yesterday's incomplete tasks
- AI-generated daily standup for work

### Visual Task Management

- Backlog sidebar organized by workspace/channels
- Kanban board: Today → In Progress → Done
- Nested subtask management
- Drag-and-drop task organization

### Time Tracking

- Both focus timer AND pomodoro visible simultaneously
- Time estimates vs actual tracking
- Visual time representation (pie chart)

### Integrations

- Jira tickets import
- Calendar events (iOS Calendar, iCal)
- Apple Reminders sync
- Email forward to task

### AI Features

- Daily standup generation
- Sprint review summaries (bi-weekly)
- End-of-day reflection prompts
- Task organization via MCP server

### Gamification

- Streak tracking
- Confetti + sound on task completion
- Visual progress indicators

## Tech Stack

### Frontend

- **Framework:** Angular (latest, standalone components)
- **UI Library:** TBD (dyslexia-friendly focus)
- **Styling:** CSS with design tokens
- **Drag & Drop:** TBD (supports nested zones)

### Backend

- **Runtime:** Node.js
- **Framework:** TBD (NestJS vs Express vs Fastify)
- **API:** REST
- **Language:** TypeScript

### Database

- **v0.1-v1.0:** SQLite (local file)
- **v2.0+:** PostgreSQL (if multi-device needed)

### AI/LLM

- Claude API for standup/sprint review generation
- MCP server for task management

### Integrations

- Jira API
- iOS Calendar / iCal
- Apple Reminders (via EventKit/Shortcuts/AppleScript)
- Email (SendGrid/Mailgun/AWS SES)
- Pushover (notifications)

## Design Principles

### ADHD-Friendly

- Minimize visual clutter
- One primary action always obvious
- Reduce decision fatigue
- Progressive disclosure (max 3 levels)
- Gamification for dopamine hits
- Visual timers for time blindness

### Dyslexia-Friendly

- Verdana font family, 22px base size
- 1.5 line height, 0.12em letter spacing
- 45-60 character line length
- Left-aligned text (never justified)
- Off-white background (#FAF9F7)
- Off-black text (#2B2B2A)

### Visual Learner

- Color-coded statuses
- Generous whitespace
- Card-based layouts
- Clear visual hierarchy
- Icons + text labels

### Accessibility

- WCAG 2.1 Level AA minimum
- 4.5:1 contrast ratio minimum
- prefers-reduced-motion support
- Keyboard navigation
- Screen reader compatible

## Project Structure

```
tasker/
├── README.md                    # This file
├── docs/                        # Documentation
│   ├── INITIAL_PLANNING.md     # Original planning brainstorm
│   ├── UI_UX_RESEARCH.md       # Research plan
│   ├── UI_RESEARCH_FINDINGS.md # Research results
│   ├── DESIGN_SYSTEM.md        # Complete design system
│   ├── LINEAR_STRUCTURE.md     # Linear workspace structure
│   └── VERSION_ROADMAP.md      # Version definitions & goals
├── frontend/                    # Angular app (TBD)
├── backend/                     # Node.js API (TBD)
├── database/                    # SQLite schema & migrations (TBD)
└── mcp-server/                  # MCP server for Claude (TBD)
```

## Development Setup

**Prerequisites:**

- Node.js 20+ (LTS)
- npm or pnpm
- Git
- Docker and Docker Compose (optional, for containerized development)

**Setup (TBD - will be documented after scaffolding):**

```bash
# Clone repo
git clone [repo-url]
cd tasker

# Install dependencies
npm install

# Set up database
npm run db:setup

# Run development servers
npm run dev
```

### Docker Development (Recommended)

```bash
# Start PostgreSQL only (recommended for local development)
docker-compose up -d postgres

# Or start all services in containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

See [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md) for detailed Docker commands.

## Security: Database Access Control

Toggle PostgreSQL external access for security during AI development:

```bash
# Enable for development (GUI tools, host backend)
./scripts/toggle-db-access.sh on

# Disable for AI auto-approve sessions
./scripts/toggle-db-access.sh off

# Check status
./scripts/toggle-db-access.sh status
```

See [Database Setup Guide](./docs/database-setup.md#security-postgresql-access-control) for details.

## Version Roadmap

### v0.1 Alpha (Week 1)

**Goal:** Solve backlog visibility - see everything in one place

**Features:**

- Basic backlog sidebar (organized by workspace/channel)
- Simple kanban board (Today, In Progress, Done)
- Create/edit/delete tasks manually
- Drag tasks from backlog → kanban
- SQLite persistence

**Timeline:** 1 week
**Success:** Using it daily instead of Sunsama for basic task tracking

### v0.2 (3-4 days)

**Goal:** Add motivation and routine support

**Features:**

- Confetti + sound on task completion
- Streak tracking
- Routine tasks auto-populate Today
- Yesterday incomplete section in backlog
- End-of-day reflection flow

### v0.3 (3-4 days)

**Goal:** Handle complex tasks

**Features:**

- Subtasks with nested kanban
- Weekly planning view
- Due date filtering
- Task search

### v0.4 (3-4 days)

**Goal:** Polish and usability

**Features:**

- Keyboard shortcuts
- Dark mode toggle
- Settings panel
- Onboarding flow

### v0.5 Beta (2 weeks)

**Goal:** Integrations and AI

**Features:**

- Jira integration
- Calendar integration
- Email forward import
- AI standup generation
- Time tracking (focus + pomodoro)
- Pushover notifications

### v1.0 Production (1 week)

**Goal:** Production-ready

**Features:**

- Performance optimization
- Error handling
- User documentation
- Export/backup
- Multiple view modes

### v2.0+ Future

**Goal:** Intelligence and insights

**Features:**

- ML-powered time estimates
- Productivity analytics
- Pattern recognition
- Multi-user support

## Design System Highlights

### Colors

- **Primary:** Muted purple (#8B7BB8)
- **Secondary:** Soft blue (#6B9AC4)
- **Accent:** Dusty pink (#C89FA7)
- **Destructive:** Warm red (#C97064)
- **Success:** Sage green (#7A9B76)

### Typography

- **Font:** Verdana, Open Sans, Helvetica, Arial
- **Base Size:** 22px (optimized for myopia/astigmatism)
- **Line Height:** 1.5
- **Letter Spacing:** 0.12em

### Spacing

- **Base Unit:** 8px
- **Scale:** 8, 16, 24, 32, 48, 64, 96

See `docs/DESIGN_SYSTEM.md` for complete specifications.

## Deployment

### Production Deployment with Docker

```bash
# Copy and configure environment
cp .env.production.example .env.production
nano .env.production

# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide including:

- Docker multi-stage builds
- Production configuration
- Server setup
- CI/CD pipelines
- Monitoring and maintenance
- Security hardening
- Troubleshooting

### CI/CD Pipelines

**Continuous Integration:**

- Automatic linting, type checking, and testing on every push
- Coverage reporting
- Production build verification

**Continuous Deployment:**

- Manual or tag-triggered deployment
- Multi-platform Docker image builds (amd64, arm64)
- Push to GitHub Container Registry
- SSH deployment to production/staging servers

See [.github/SECRETS_SETUP.md](./.github/SECRETS_SETUP.md) for CI/CD configuration.

## Contributing

This is a personal project for now. If you have ADHD/dyslexia and want to contribute ideas or feedback, open an issue!

## License

TBD

## Acknowledgments

- Research informed by British Dyslexia Association guidelines
- ADHD design principles from accessibility experts
- Inspired by: Sunsama, Amazing Marvin, TickTick, Trello
- UI inspiration: Arc Browser, Prusa Printables, Bitbucket, GitLab

---

**Built with Claude Code** 🤖
