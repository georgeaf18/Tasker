# Next Steps - Getting Started with Tasker

## What We've Created

### Project Structure

```
tasker/
├── README.md                           # Project overview, tech stack, roadmap
├── NEXT_STEPS.md                       # This file - what to do next
└── docs/
    ├── INITIAL_PLANNING.md             # Original brainstorming session
    ├── UI_UX_RESEARCH.md               # Research plan
    ├── UI_RESEARCH_FINDINGS.md         # ADHD/dyslexia UI research results
    ├── DESIGN_SYSTEM.md                # Complete design system
    │                                   # (colors, typography, components, a11y)
    ├── LINEAR_STRUCTURE.md             # Linear workspace structure
    ├── VERSION_ROADMAP.md              # Version goals (v0.1 - v2.0+)
    └── LINEAR_SETUP_GUIDE.md           # Step-by-step Linear setup
```

### Design System Highlights

- **Colors:** Purples (primary), blues (secondary), pinks/reds (accents)
- **Typography:** Verdana 22px base (optimized for myopia/astigmatism)
- **Spacing:** 8px base unit, generous whitespace
- **Dark Mode:** Fully supported with off-white/off-black palettes
- **Accessibility:** WCAG AA compliant, reduced motion support

### Version Roadmap Summary

- **v0.1 (1 week):** Backlog sidebar + basic kanban
- **v0.2 (3-4 days):** Confetti, streaks, routines
- **v0.3 (3-4 days):** Subtasks, weekly planning, search
- **v0.4 (3-4 days):** Polish, dark mode, keyboard shortcuts
- **v0.5 (2 weeks):** Integrations (Jira, Calendar, Email) + AI
- **v1.0 (1 week):** Production-ready
- **v2.0+ (future):** ML-powered insights

## Immediate Next Steps

### 1. Set Up Linear Workspace (15-30 minutes)

Follow `docs/LINEAR_SETUP_GUIDE.md`:

1. Create new Linear project "Tasker" (identifier: TASK)
2. Create 7 milestones (Alpha v0.1 → v2.0+ Future)
3. Create labels (frontend, backend, database, etc.)
4. Create 9 initial setup issues (TASK-1 through TASK-9)
5. Create epic issues (Morning Ritual, Kanban Board, etc.)
6. Configure workflow states (Backlog → Todo → In Progress → In Review → Done)

**Result:** Linear workspace ready with all features documented

### 2. Make Key Technology Decisions (TASK-2)

Before coding, decide:

- **Backend Framework:** NestJS vs Express vs Fastify
  - **Recommendation:** NestJS (Angular-like patterns, good DX)
- **Frontend State Management:** Signals vs NgRx vs Services
  - **Recommendation:** Signals (built-in, modern)
- **Drag & Drop:** ng-dnd vs Angular CDK vs custom
  - **Recommendation:** Angular CDK (official, flexible)
- **CSS Approach:** Modules vs Tailwind vs plain CSS
  - **Recommendation:** Plain CSS with design tokens (full control)
- **Testing:** Jest vs Jasmine vs Vitest
  - **Recommendation:** Jest (backend) + Jasmine (frontend default)

**Document these in:** `docs/ADRs/` (Architecture Decision Records)

### 3. Start TASK-1: Project Scaffolding (1-2 hours)

```bash
cd /Users/george/side-projects/tasker

# Initialize Git
git init
git add .
git commit -m "Initial commit: project documentation"

# Create project structure
mkdir -p frontend backend database mcp-server docs/ADRs

# Initialize package.json for monorepo
npm init -y

# Set up workspaces in package.json
# (edit package.json to add "workspaces": ["frontend", "backend", "mcp-server"])
```

**Create `.gitignore`:**

```
node_modules/
dist/
build/
*.db
*.sqlite
.env
.env.local
.DS_Store
.vscode/
.idea/
*.log
coverage/
```

**Create `EditorConfig` (.editorconfig):**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

### 4. Backend Setup (TASK-3) - 2-3 hours

```bash
cd backend
npm init -y

# Install NestJS (if chosen)
npm install @nestjs/core @nestjs/common @nestjs/platform-express
npm install -D @nestjs/cli typescript @types/node

# Or Express (if chosen)
npm install express
npm install -D @types/express typescript ts-node nodemon

# Set up TypeScript
npx tsc --init

# Install SQLite
npm install better-sqlite3
npm install -D @types/better-sqlite3

# Install dotenv
npm install dotenv
```

**Create initial structure:**

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── tasks/
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   └── tasks.module.ts
│   └── database/
│       ├── database.service.ts
│       └── schema.sql
├── tsconfig.json
└── package.json
```

### 5. Frontend Setup (TASK-4) - 2-3 hours

```bash
cd ../frontend

# Create Angular app
npx @angular/cli@latest new . --standalone --routing --style=css

# Install dependencies
npm install

# Configure proxy for backend API
# Create proxy.conf.json
```

**proxy.conf.json:**

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

**Update angular.json to use proxy:**

```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

### 6. Database Schema (TASK-5) - 1-2 hours

Create `backend/src/database/schema.sql`:

```sql
-- v0.1 Schema
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  workspace TEXT NOT NULL CHECK(workspace IN ('work', 'personal')),
  channel_id INTEGER,
  status TEXT NOT NULL CHECK(status IN ('backlog', 'today', 'in_progress', 'done')),
  due_date TEXT,
  is_routine INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (channel_id) REFERENCES channels(id)
);

CREATE TABLE IF NOT EXISTS channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  workspace TEXT NOT NULL CHECK(workspace IN ('work', 'personal')),
  color TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_workspace ON tasks(workspace);
CREATE INDEX idx_tasks_channel ON tasks(channel_id);
```

### 7. Design System Implementation (TASK-6) - 3-4 hours

Create `frontend/src/styles/tokens.css`:

```css
:root {
  /* Colors - Light Mode */
  --color-bg-primary: #faf9f7;
  --color-bg-secondary: #f0eee9;
  --color-text-primary: #2b2b2a;
  --color-text-secondary: #595959;

  --color-primary: #8b7bb8;
  --color-secondary: #6b9ac4;
  --color-accent: #c89fa7;
  --color-destructive: #c97064;
  --color-success: #7a9b76;

  /* Typography */
  --font-family-base: Verdana, 'Open Sans', Helvetica, Arial, sans-serif;
  --font-size-base: 22px;
  --font-size-lg: 26px;
  --font-size-xl: 33px;
  --line-height: 1.5;
  --letter-spacing: 0.12em;

  /* Spacing */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 32px;
  --space-xl: 48px;
  --space-2xl: 64px;
}

[data-theme='dark'] {
  --color-bg-primary: #1c1b1a;
  --color-bg-secondary: #2b2a28;
  --color-text-primary: #e8e6e1;
  --color-text-secondary: #b8b6b1;
}
```

See `docs/DESIGN_SYSTEM.md` for complete token specifications.

### 8. Start Development (After Setup Complete)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Database (if needed)
cd database
# Run migrations
```

## First Feature to Build (After Setup)

### v0.1 Alpha - Week 1 Focus

**Build in this order:**

1. **Day 1-2:** Setup (TASK-1 through TASK-9)
   - Project scaffolding
   - Backend + frontend running
   - Database schema
   - Design tokens

2. **Day 3:** Basic Task CRUD
   - Create task API endpoint
   - Create task form UI
   - List tasks

3. **Day 4:** Backlog Sidebar
   - Group tasks by workspace
   - Group tasks by channel
   - Collapsible sections

4. **Day 5:** Kanban Board
   - 3 columns (Today, In Progress, Done)
   - Display tasks in columns
   - Update status on column change

5. **Day 6:** Drag & Drop
   - Drag from backlog → kanban
   - Drag between kanban columns
   - Persist status changes

6. **Day 7:** Polish & Test
   - Fix bugs
   - Add loading states
   - Add empty states
   - Test full flow
   - Deploy locally

**Success Criteria:**

- Can create a task
- Can see it in backlog sidebar
- Can drag to "Today"
- Can drag through kanban columns
- Data persists across refreshes
- Using it daily instead of Sunsama

## Recommended Work Sessions

### Morning (2-3 hours)

- Check Linear, move card to "In Progress"
- Focus on one issue
- Commit progress

### Afternoon (2-3 hours)

- Continue or start next issue
- Update Linear status
- Commit + push

### End of Day

- Update Linear (move to "In Review" or "Done")
- Plan tomorrow
- Git push

## Resources

- **Design System:** `docs/DESIGN_SYSTEM.md`
- **Version Goals:** `docs/VERSION_ROADMAP.md`
- **Research Findings:** `docs/UI_RESEARCH_FINDINGS.md`
- **Linear Setup:** `docs/LINEAR_SETUP_GUIDE.md`

## Questions to Answer Before Coding

1. **Where to host eventually?**
   - Localhost only? (simplest)
   - Home server? (requires setup)
   - Cloud? (costs money)

2. **Source control?**
   - GitHub? GitLab? Bitbucket?
   - Public or private repo?

3. **Who's the first user?**
   - Just you? (simplifies a lot)
   - Others eventually? (affects design)

## Tips for Success

- **Ship small:** v0.1 is minimal on purpose
- **Commit often:** Small commits are easier to debug
- **Test as you go:** Don't wait until the end
- **Update Linear daily:** Helps with planning
- **Take breaks:** ADHD-friendly means pacing yourself
- **Celebrate wins:** Even small progress counts

---

**Ready to start?**

1. Open Linear → Set up workspace
2. Create TASK-1 issue
3. Start scaffolding
4. Ship v0.1 in one week

You got this! 🚀
