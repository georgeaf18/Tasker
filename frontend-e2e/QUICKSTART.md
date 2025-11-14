# E2E Tests Quick Start Guide

Get the E2E test suite running in 5 minutes.

## Prerequisites

- Node.js installed
- Docker installed and running
- Tasker monorepo cloned

## Step 1: Install Dependencies

```bash
# From project root
npm install
```

## Step 2: Add Data TestIDs to Components

The tests require `data-testid` attributes on components. See [DATA_TESTID_REQUIREMENTS.md](./DATA_TESTID_REQUIREMENTS.md) for complete list.

### Quick Implementation Checklist

**Backlog Sidebar Component** (`frontend/src/app/components/backlog-sidebar/backlog-sidebar.component.html`):

```html
<!-- Add button -->
<button data-testid="add-task-button" (click)="showCreateTaskDialog()">
  <i class="pi pi-plus"></i>
</button>

<!-- Task cards -->
<div *ngFor="let task of tasks" [attr.data-testid]="'task-card-' + task.id">
  <h3 data-testid="task-card-title">{{ task.title }}</h3>
</div>
```

**Kanban Board Component** (`frontend/src/app/components/kanban-board/kanban-board.component.html`):

```html
<!-- Columns -->
<div class="kanban-column" data-testid="kanban-column-today">
  <!-- Today tasks -->
</div>

<div class="kanban-column" data-testid="kanban-column-in-progress">
  <!-- In Progress tasks -->
</div>

<div class="kanban-column" data-testid="kanban-column-done">
  <!-- Done tasks -->
</div>

<!-- Progress bar -->
<p-progressBar
  [value]="dailyProgress()"
  data-testid="daily-progress-bar"
  [attr.aria-valuenow]="dailyProgress()"
>
</p-progressBar>
```

**Task Dialog** (Create/Edit forms):

```html
<input pInputText formControlName="title" data-testid="task-title-input" />
<textarea
  pTextarea
  formControlName="description"
  data-testid="task-description-input"
></textarea>
<p-select
  formControlName="workspace"
  data-testid="task-workspace-select"
></p-select>
<p-select
  formControlName="channelId"
  data-testid="task-channel-select"
></p-select>
<button type="submit" data-testid="task-submit-button">Save</button>
<button type="button" data-testid="task-cancel-button">Cancel</button>
<button type="button" data-testid="task-delete-button">Delete</button>
```

**Confirmation Dialog**:

```html
<button
  data-testid="confirm-delete-button"
  (click)="confirmationService.accept()"
>
  Yes
</button>
<button
  data-testid="cancel-delete-button"
  (click)="confirmationService.close()"
>
  No
</button>
```

**Workspace Filters**:

```html
<button
  data-testid="workspace-toggle-work"
  [attr.aria-pressed]="isWorkFilterActive()"
  (click)="toggleWorkspaceFilter('WORK')"
>
  Work
</button>

<button
  data-testid="workspace-toggle-personal"
  [attr.aria-pressed]="isPersonalFilterActive()"
  (click)="toggleWorkspaceFilter('PERSONAL')"
>
  Personal
</button>
```

## Step 3: Start Services

```bash
# Terminal 1: PostgreSQL
docker-compose up -d postgres

# Terminal 2: Backend API
npm run dev:backend

# Terminal 3: Frontend
npm run dev:frontend
```

Verify services are running:

- Backend: http://localhost:3000/api/health
- Frontend: http://localhost:4200

## Step 4: Install Playwright Browsers

```bash
# First time only
npx playwright install
```

## Step 5: Run Tests

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test Suite

```bash
# Task creation
npx playwright test task-creation

# Kanban workflow
npx playwright test kanban-workflow

# Workspace filtering
npx playwright test workspace-filtering

# Task deletion
npx playwright test task-deletion

# Task editing
npx playwright test task-editing
```

### Debug Mode (with browser UI)

```bash
npx playwright test --debug
```

### Headed Mode (see browser)

```bash
npx playwright test --headed
```

## Expected Output

```
Running 50 tests using 4 workers

  ✓  task-creation.spec.ts:10:5 › should open task creation dialog (1.2s)
  ✓  task-creation.spec.ts:23:5 › should create a task with required fields (1.5s)
  ✓  task-creation.spec.ts:38:5 › should create a task with all fields (2.1s)
  ...

  50 passed (1.2m)

To open last HTML report run:
  npx playwright show-report
```

## Troubleshooting

### Tests Fail to Start

**Error:** `page.goto: net::ERR_CONNECTION_REFUSED`

**Solution:** Ensure frontend is running on http://localhost:4200

```bash
# Check frontend
curl http://localhost:4200

# Restart if needed
npm run dev:frontend
```

### API Errors in Tests

**Error:** `Failed to create task: 500 Internal Server Error`

**Solution:** Ensure backend and database are running

```bash
# Check backend
curl http://localhost:3000/api/health

# Check database
docker ps | grep postgres

# Restart if needed
docker-compose up -d postgres
npm run dev:backend
```

### Selector Not Found

**Error:** `locator.click: Target page, context or browser has been closed`

**Solution:** Add missing `data-testid` attributes to components

```bash
# Use Playwright Inspector to verify selectors
npx playwright test --debug

# In the inspector, try your selector
await page.getByTestId('add-task-button').click()
```

### Tests Pass Locally but Fail in CI

**Solution:** Check CI environment variables and service startup

```yaml
# Ensure services start before tests
- name: Start database
  run: docker-compose up -d postgres

- name: Wait for database
  run: sleep 5

- name: Start backend
  run: npm run dev:backend &

- name: Wait for backend
  run: npx wait-on http://localhost:3000/api/health

- name: Start frontend
  run: npm run dev:frontend &

- name: Wait for frontend
  run: npx wait-on http://localhost:4200

- name: Run tests
  run: npx playwright test
```

## Next Steps

1. **Review test results:** `npx playwright show-report`
2. **Add more tests:** See [README.md](./README.md) for patterns
3. **Integrate with CI:** See [README.md#ci-integration](./README.md#ci-integration)
4. **Configure for your needs:** Edit [playwright.config.ts](./playwright.config.ts)

## Useful Commands

```bash
# Run tests in watch mode
npx playwright test --watch

# Run only failed tests
npx playwright test --last-failed

# Generate test code (record interactions)
npx playwright codegen http://localhost:4200

# Show trace of last run
npx playwright show-trace test-results/<test-name>/trace.zip

# Update snapshots (if using visual regression)
npx playwright test --update-snapshots

# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests with specific tag
npx playwright test --grep @critical

# Run tests in parallel
npx playwright test --workers=8

# Run tests with custom timeout
npx playwright test --timeout=60000
```

## Resources

- [Full Documentation](./README.md)
- [Component Requirements](./DATA_TESTID_REQUIREMENTS.md)
- [Playwright Docs](https://playwright.dev/)
- [Tasker Architecture](../docs/TECHNICAL_ARCHITECTURE.md)

## Support

Issues? Check:

1. [Troubleshooting](#troubleshooting) section
2. [README.md](./README.md) for detailed docs
3. Playwright Inspector: `npx playwright test --debug`
4. Test traces: `npx playwright show-report`
