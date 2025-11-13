# Tasker E2E Test Suite

Comprehensive end-to-end tests for the Tasker application using Playwright.

## Overview

This E2E test suite covers all critical user paths in the Tasker application, ensuring that the complete stack (Angular frontend + NestJS backend + PostgreSQL) works correctly together.

## Test Coverage

### 1. Task Creation Flow (`task-creation.spec.ts`)
- Opening task creation dialog
- Creating tasks with required fields only
- Creating tasks with all fields
- Workspace selection (Work/Personal)
- Form validation
- Canceling task creation
- Multiple sequential task creation
- Special character handling

### 2. Kanban Workflow (`kanban-workflow.spec.ts`)
- Moving tasks from Backlog → Today
- Moving tasks from Today → In Progress
- Moving tasks from In Progress → Done
- Complete workflow (Backlog → Done)
- Daily progress bar updates
- Multiple tasks in each column
- Data preservation during moves
- Backward movement (Done → In Progress)

### 3. Workspace Filtering (`workspace-filtering.spec.ts`)
- Filtering by Work workspace
- Filtering by Personal workspace
- Showing all tasks (no filter)
- Toggling between workspace filters
- Filtering across all statuses
- Task count updates
- Progress bar filtering
- Empty workspace handling

### 4. Task Deletion (`task-deletion.spec.ts`)
- Deleting from Backlog
- Deleting from Today column
- Deleting from In Progress column
- Deleting from Done column
- Canceling deletion
- Confirmation dialog
- Task count updates
- Progress bar updates
- Multiple sequential deletions

### 5. Task Editing (`task-editing.spec.ts`)
- Editing task title
- Editing task description
- Editing both title and description
- Changing workspace
- Canceling edits
- Form validation
- Editing from kanban columns
- Status preservation
- Special character handling
- Multiple sequential edits

## Project Structure

```
frontend-e2e/
├── src/
│   ├── support/
│   │   ├── api-helper.ts                    # Backend API utilities
│   │   └── page-objects/
│   │       ├── app.po.ts                    # Main app page object
│   │       ├── backlog.po.ts                # Backlog sidebar page object
│   │       ├── kanban.po.ts                 # Kanban board page object
│   │       └── task-dialog.po.ts            # Task dialog page object
│   ├── task-creation.spec.ts                # Task creation tests
│   ├── kanban-workflow.spec.ts              # Kanban workflow tests
│   ├── workspace-filtering.spec.ts          # Workspace filtering tests
│   ├── task-deletion.spec.ts                # Task deletion tests
│   └── task-editing.spec.ts                 # Task editing tests
├── playwright.config.ts                     # Playwright configuration
├── DATA_TESTID_REQUIREMENTS.md              # Component test ID requirements
└── README.md                                # This file
```

## Architecture

### Page Object Model

Tests use the Page Object Model (POM) pattern for maintainability:

```typescript
// Page objects encapsulate UI interactions
const backlogPage = new BacklogPage(page);
await backlogPage.clickAddTaskButton();
await backlogPage.openTaskDetails('My Task');

// Tests focus on business logic
expect(await backlogPage.hasTask('My Task')).toBe(true);
```

**Benefits:**
- **Maintainability:** UI changes only require updating page objects
- **Reusability:** Page objects used across multiple tests
- **Readability:** Tests read like user stories
- **Type Safety:** Full TypeScript support

### API Helper

The `ApiHelper` class provides direct backend access for test setup/cleanup:

```typescript
const apiHelper = new ApiHelper();
await apiHelper.init();

// Setup: Create test data
await apiHelper.createTask({ title: 'Test Task', status: 'BACKLOG' });

// Cleanup: Remove test data
await apiHelper.clearAllTasks();

await apiHelper.dispose();
```

**Benefits:**
- **Fast Setup:** Create test data directly via API
- **Reliable Cleanup:** Ensure clean state between tests
- **Backend Verification:** Verify data persistence
- **Test Isolation:** Each test starts with clean state

## Running Tests

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Ensure backend and database are running:**
   ```bash
   # Terminal 1: Start PostgreSQL
   docker-compose up -d postgres

   # Terminal 2: Start backend
   npm run dev:backend

   # Terminal 3: Start frontend
   npm run dev:frontend
   ```

### Run All Tests

```bash
# Run all E2E tests
npx playwright test

# Run with UI (headed mode)
npx playwright test --headed

# Run with Playwright Inspector (debug mode)
npx playwright test --debug
```

### Run Specific Test Suite

```bash
# Task creation tests only
npx playwright test task-creation

# Kanban workflow tests only
npx playwright test kanban-workflow

# Workspace filtering tests only
npx playwright test workspace-filtering

# Task deletion tests only
npx playwright test task-deletion

# Task editing tests only
npx playwright test task-editing
```

### Run Single Test

```bash
# Run specific test by name
npx playwright test -g "should create a task with all fields filled"

# Run tests in a specific file
npx playwright test src/task-creation.spec.ts
```

### Watch Mode

```bash
# Run tests in watch mode (re-run on file changes)
npx playwright test --watch
```

### Generate Report

```bash
# Run tests and generate HTML report
npx playwright test

# Open the HTML report
npx playwright show-report
```

## Configuration

### Timeouts

- **Test timeout:** 30 seconds
- **Expect timeout:** 5 seconds
- **Action timeout:** 10 seconds
- **Navigation timeout:** 15 seconds

### Retries

- **Local:** 0 retries (fail fast for debugging)
- **CI:** 2 retries (handle flakiness)

### Screenshots & Videos

- **Screenshots:** Captured on test failure
- **Videos:** Captured on first retry
- **Traces:** Captured on first retry

### Browsers

By default, tests run on **Chromium** only. Uncomment additional browsers in `playwright.config.ts` for cross-browser testing:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
],
```

## Test Patterns

### Test Structure

```typescript
test.describe('Feature Name', () => {
    let appPage: AppPage;
    let backlogPage: BacklogPage;
    let apiHelper: ApiHelper;

    test.beforeEach(async ({ page }) => {
        // Initialize page objects
        appPage = new AppPage(page);
        backlogPage = new BacklogPage(page);
        apiHelper = new ApiHelper();

        // Setup: Clean state
        await apiHelper.init();
        await apiHelper.clearAllTasks();

        // Navigate to app
        await appPage.goto();
        await appPage.waitForAppReady();
    });

    test.afterEach(async () => {
        // Cleanup
        await apiHelper.clearAllTasks();
        await apiHelper.dispose();
    });

    test('should do something', async () => {
        // Arrange: Setup test data
        // Act: Perform user actions
        // Assert: Verify expected outcomes
    });
});
```

### Waiting Strategies

```typescript
// ✅ Good: Wait for specific element
await page.waitForSelector('[data-testid="task-card-123"]', { state: 'visible' });

// ✅ Good: Wait for API response
await page.waitForResponse(response =>
  response.url().includes('/api/tasks') && response.ok()
);

// ✅ Good: Use built-in waits
await expect(backlogPage.getTaskByTitle('My Task')).toBeVisible();

// ❌ Bad: Arbitrary timeout
await page.waitForTimeout(5000);
```

### Assertions

```typescript
// ✅ Good: Specific, meaningful assertions
expect(await backlogPage.hasTask('My Task')).toBe(true);
expect(await kanbanPage.getTaskCountInColumn('Today')).toBe(3);

// ✅ Good: Verify both UI and backend
expect(await backlogPage.hasTask('My Task')).toBe(true);
const tasks = await apiHelper.getTasks();
expect(tasks.find(t => t.title === 'My Task')).toBeDefined();

// ❌ Bad: Vague assertions
expect(await page.locator('div').count()).toBeGreaterThan(0);
```

## Debugging Tests

### Using Playwright Inspector

```bash
# Run with inspector
npx playwright test --debug

# Run specific test with inspector
npx playwright test -g "should create a task" --debug
```

The inspector allows you to:
- Step through test execution
- Inspect page state at each step
- Try selectors in the browser console
- Record new actions

### Using Console Logs

```typescript
// Add console.log in tests
test('my test', async ({ page }) => {
    console.log('Current URL:', page.url());
    console.log('Task count:', await backlogPage.getTaskCount());
});
```

### Screenshots on Failure

Failed tests automatically capture screenshots. Find them in:
```
test-results/
└── <test-name>/
    └── test-failed-1.png
```

### Trace Viewer

View detailed traces of failed tests:

```bash
# Generate trace on failure
npx playwright test

# Open trace viewer
npx playwright show-trace test-results/<test-name>/trace.zip
```

## CI Integration

Tests are configured to run in CI environments (GitHub Actions, etc.):

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Start services
        run: docker-compose up -d

      - name: Run E2E tests
        run: npx playwright test
        env:
          CI: true

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Component Requirements

Tests expect certain `data-testid` attributes on components. See **[DATA_TESTID_REQUIREMENTS.md](./DATA_TESTID_REQUIREMENTS.md)** for the complete list.

### Critical TestIDs

- `add-task-button` - Backlog add button
- `task-card-${id}` - Task cards
- `kanban-column-today` - Today column
- `kanban-column-in-progress` - In Progress column
- `kanban-column-done` - Done column
- `task-title-input` - Task title input
- `task-submit-button` - Form submit button
- `task-delete-button` - Delete button
- `confirm-delete-button` - Confirm deletion
- `workspace-toggle-work` - Work filter toggle
- `workspace-toggle-personal` - Personal filter toggle

## Best Practices

### Test Isolation

Each test should be independent and not rely on other tests:

```typescript
// ✅ Good: Each test creates its own data
test('should edit task', async () => {
    await apiHelper.createTask({ title: 'Task to Edit' });
    // Test logic
});

// ❌ Bad: Test depends on previous test
test('should create task', async () => { /* ... */ });
test('should edit task', async () => {
    // Assumes task from previous test exists
});
```

### Fast Feedback

- **Use API for setup:** Create test data via API, not UI
- **Clean up efficiently:** Delete all test data in bulk
- **Run in parallel:** Independent tests run simultaneously
- **Focus on critical paths:** Test the most important user flows

### Maintainability

- **Use Page Objects:** Centralize UI interactions
- **Descriptive test names:** `should create task with all fields filled`
- **Clear assertions:** Use meaningful error messages
- **Avoid magic numbers:** Use constants for counts/timeouts

## Troubleshooting

### Tests Failing Locally

1. **Ensure services are running:**
   ```bash
   # Check backend
   curl http://localhost:3000/api/health

   # Check frontend
   curl http://localhost:4200
   ```

2. **Clear test data:**
   ```bash
   # Reset database
   npm run db:clean
   npm run db:up
   ```

3. **Update Playwright:**
   ```bash
   npm install -D @playwright/test@latest
   npx playwright install
   ```

### Flaky Tests

If tests fail intermittently:

1. **Add explicit waits:**
   ```typescript
   await page.waitForSelector('[data-testid="task-card-123"]');
   ```

2. **Wait for API calls:**
   ```typescript
   await page.waitForResponse(res => res.url().includes('/api/tasks'));
   ```

3. **Increase timeouts:**
   ```typescript
   test('slow test', async ({ page }) => {
       test.setTimeout(60000); // 60 seconds
       // Test logic
   });
   ```

### Selector Issues

If selectors don't work:

1. **Verify TestIDs are implemented:**
   - Check component HTML for `data-testid` attributes
   - Use Playwright Inspector to verify selectors

2. **Use Playwright Inspector:**
   ```bash
   npx playwright test --debug
   ```

3. **Check selector syntax:**
   ```typescript
   // ✅ Good
   page.getByTestId('add-task-button')

   // ❌ Bad (old syntax)
   page.locator('[data-testid="add-task-button"]')
   ```

## Contributing

### Adding New Tests

1. **Create test file:** `src/my-feature.spec.ts`
2. **Use existing page objects:** Reuse when possible
3. **Follow naming conventions:** `should [action] [expected outcome]`
4. **Add to this README:** Document new test coverage

### Updating Page Objects

1. **Add new methods:** Keep methods focused and single-purpose
2. **Use descriptive names:** `getTaskByTitle()` not `getTask()`
3. **Return Locators:** Allow chaining and flexibility
4. **Document parameters:** Add JSDoc comments

### Code Review Checklist

- [ ] Tests are isolated and independent
- [ ] Uses Page Object Model pattern
- [ ] Uses API helper for setup/cleanup
- [ ] Clear test names and assertions
- [ ] No arbitrary waits (`waitForTimeout`)
- [ ] Proper error handling
- [ ] Documentation updated

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Angular Testing Guide](https://angular.dev/guide/testing)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [DATA_TESTID_REQUIREMENTS.md](./DATA_TESTID_REQUIREMENTS.md)
3. Run tests with `--debug` flag
4. Check Playwright [documentation](https://playwright.dev/)
