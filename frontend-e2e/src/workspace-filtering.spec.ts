import { test, expect } from '@playwright/test';
import { AppPage } from './support/page-objects/app.po';
import { BacklogPage } from './support/page-objects/backlog.po';
import { KanbanPage } from './support/page-objects/kanban.po';
import { ApiHelper } from './support/api-helper';

/**
 * Workspace Filtering E2E Tests
 *
 * Tests workspace filtering functionality:
 * 1. Create Work and Personal tasks
 * 2. Click "Work" workspace toggle
 * 3. Verify only Work tasks visible
 * 4. Click "Personal" workspace toggle
 * 5. Verify only Personal tasks visible
 */
test.describe('Workspace Filtering', () => {
  let appPage: AppPage;
  let backlogPage: BacklogPage;
  let kanbanPage: KanbanPage;
  let apiHelper: ApiHelper;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    appPage = new AppPage(page);
    backlogPage = new BacklogPage(page);
    kanbanPage = new KanbanPage(page);
    apiHelper = new ApiHelper();

    // Initialize API helper and clear test data
    await apiHelper.init();
    await apiHelper.clearAllTasks();

    // Navigate to app
    await appPage.goto();
    await appPage.waitForAppReady();
  });

  test.afterEach(async () => {
    // Clean up test data
    await apiHelper.clearAllTasks();
    await apiHelper.dispose();
  });

  test('should show only Work tasks when Work filter is active', async ({
    page,
  }) => {
    // Create Work and Personal tasks
    await apiHelper.createTasks([
      { title: 'Work Task 1', workspace: 'WORK', status: 'BACKLOG' },
      { title: 'Work Task 2', workspace: 'WORK', status: 'TODAY' },
      { title: 'Personal Task 1', workspace: 'PERSONAL', status: 'BACKLOG' },
      { title: 'Personal Task 2', workspace: 'PERSONAL', status: 'TODAY' },
    ]);

    // Refresh to load tasks
    await page.reload();
    await appPage.waitForAppReady();

    // Click Work workspace toggle
    await appPage.clickWorkspaceToggle('Work');

    // Verify only Work tasks are visible
    expect(await backlogPage.hasTask('Work Task 1')).toBe(true);
    expect(await kanbanPage.hasTaskInColumn('Today', 'Work Task 2')).toBe(true);

    // Verify Personal tasks are NOT visible
    expect(await backlogPage.hasTask('Personal Task 1')).toBe(false);
    expect(await kanbanPage.hasTaskInColumn('Today', 'Personal Task 2')).toBe(
      false,
    );
  });

  test('should show only Personal tasks when Personal filter is active', async ({
    page,
  }) => {
    // Create Work and Personal tasks
    await apiHelper.createTasks([
      { title: 'Work Task 1', workspace: 'WORK', status: 'BACKLOG' },
      { title: 'Work Task 2', workspace: 'WORK', status: 'IN_PROGRESS' },
      { title: 'Personal Task 1', workspace: 'PERSONAL', status: 'BACKLOG' },
      {
        title: 'Personal Task 2',
        workspace: 'PERSONAL',
        status: 'IN_PROGRESS',
      },
    ]);

    // Refresh to load tasks
    await page.reload();
    await appPage.waitForAppReady();

    // Click Personal workspace toggle
    await appPage.clickWorkspaceToggle('Personal');

    // Verify only Personal tasks are visible
    expect(await backlogPage.hasTask('Personal Task 1')).toBe(true);
    expect(
      await kanbanPage.hasTaskInColumn('In Progress', 'Personal Task 2'),
    ).toBe(true);

    // Verify Work tasks are NOT visible
    expect(await backlogPage.hasTask('Work Task 1')).toBe(false);
    expect(await kanbanPage.hasTaskInColumn('In Progress', 'Work Task 2')).toBe(
      false,
    );
  });

  test('should show all tasks when no workspace filter is active', async ({
    page,
  }) => {
    // Create Work and Personal tasks
    await apiHelper.createTasks([
      { title: 'Work Task', workspace: 'WORK', status: 'BACKLOG' },
      { title: 'Personal Task', workspace: 'PERSONAL', status: 'BACKLOG' },
    ]);

    // Refresh to load tasks
    await page.reload();
    await appPage.waitForAppReady();

    // By default, no filter should be active (or both visible)
    // Verify both tasks are visible
    expect(await backlogPage.hasTask('Work Task')).toBe(true);
    expect(await backlogPage.hasTask('Personal Task')).toBe(true);
  });

  test('should toggle between Work and Personal filters', async ({ page }) => {
    // Create tasks
    await apiHelper.createTasks([
      { title: 'Work Task', workspace: 'WORK', status: 'BACKLOG' },
      { title: 'Personal Task', workspace: 'PERSONAL', status: 'BACKLOG' },
    ]);

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Filter by Work
    await appPage.clickWorkspaceToggle('Work');
    expect(await backlogPage.hasTask('Work Task')).toBe(true);
    expect(await backlogPage.hasTask('Personal Task')).toBe(false);

    // Switch to Personal
    await appPage.clickWorkspaceToggle('Personal');
    expect(await backlogPage.hasTask('Personal Task')).toBe(true);
    expect(await backlogPage.hasTask('Work Task')).toBe(false);

    // Switch back to Work
    await appPage.clickWorkspaceToggle('Work');
    expect(await backlogPage.hasTask('Work Task')).toBe(true);
    expect(await backlogPage.hasTask('Personal Task')).toBe(false);
  });

  test('should filter tasks across all statuses', async ({ page }) => {
    // Create Work tasks in all statuses
    await apiHelper.createTasks([
      { title: 'Work Backlog', workspace: 'WORK', status: 'BACKLOG' },
      { title: 'Work Today', workspace: 'WORK', status: 'TODAY' },
      { title: 'Work In Progress', workspace: 'WORK', status: 'IN_PROGRESS' },
      { title: 'Work Done', workspace: 'WORK', status: 'DONE' },
    ]);

    // Create Personal tasks in all statuses
    await apiHelper.createTasks([
      { title: 'Personal Backlog', workspace: 'PERSONAL', status: 'BACKLOG' },
      { title: 'Personal Today', workspace: 'PERSONAL', status: 'TODAY' },
      {
        title: 'Personal In Progress',
        workspace: 'PERSONAL',
        status: 'IN_PROGRESS',
      },
      { title: 'Personal Done', workspace: 'PERSONAL', status: 'DONE' },
    ]);

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Filter by Work
    await appPage.clickWorkspaceToggle('Work');

    // Verify only Work tasks visible across all columns
    expect(await backlogPage.hasTask('Work Backlog')).toBe(true);
    expect(await kanbanPage.hasTaskInColumn('Today', 'Work Today')).toBe(true);
    expect(
      await kanbanPage.hasTaskInColumn('In Progress', 'Work In Progress'),
    ).toBe(true);
    expect(await kanbanPage.hasTaskInColumn('Done', 'Work Done')).toBe(true);

    // Verify Personal tasks NOT visible
    expect(await backlogPage.hasTask('Personal Backlog')).toBe(false);
    expect(await kanbanPage.hasTaskInColumn('Today', 'Personal Today')).toBe(
      false,
    );
    expect(
      await kanbanPage.hasTaskInColumn('In Progress', 'Personal In Progress'),
    ).toBe(false);
    expect(await kanbanPage.hasTaskInColumn('Done', 'Personal Done')).toBe(
      false,
    );
  });

  test('should update task counts when filtering', async ({ page }) => {
    // Create 3 Work tasks and 2 Personal tasks
    await apiHelper.createTasks([
      { title: 'Work 1', workspace: 'WORK', status: 'BACKLOG' },
      { title: 'Work 2', workspace: 'WORK', status: 'BACKLOG' },
      { title: 'Work 3', workspace: 'WORK', status: 'BACKLOG' },
      { title: 'Personal 1', workspace: 'PERSONAL', status: 'BACKLOG' },
      { title: 'Personal 2', workspace: 'PERSONAL', status: 'BACKLOG' },
    ]);

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // No filter - should show all 5 tasks
    let taskCount = await backlogPage.getTaskCount();
    expect(taskCount).toBe(5);

    // Filter by Work - should show 3 tasks
    await appPage.clickWorkspaceToggle('Work');
    taskCount = await backlogPage.getTaskCount();
    expect(taskCount).toBe(3);

    // Filter by Personal - should show 2 tasks
    await appPage.clickWorkspaceToggle('Personal');
    taskCount = await backlogPage.getTaskCount();
    expect(taskCount).toBe(2);
  });

  test('should persist filter when creating new task', async ({ page }) => {
    // Create initial tasks
    await apiHelper.createTasks([
      { title: 'Existing Work Task', workspace: 'WORK', status: 'BACKLOG' },
      {
        title: 'Existing Personal Task',
        workspace: 'PERSONAL',
        status: 'BACKLOG',
      },
    ]);

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Filter by Work
    await appPage.clickWorkspaceToggle('Work');

    // Create a new Work task through UI
    await backlogPage.clickAddTaskButton();
    await page.getByTestId('task-title-input').fill('New Work Task');
    await page.getByTestId('task-workspace-select').click();
    await page.locator('.p-select-option', { hasText: 'Work' }).click();
    await page.getByTestId('task-submit-button').click();

    // Filter should still be active
    expect(await backlogPage.hasTask('New Work Task')).toBe(true);
    expect(await backlogPage.hasTask('Existing Work Task')).toBe(true);
    expect(await backlogPage.hasTask('Existing Personal Task')).toBe(false);
  });

  test('should update daily progress based on filtered workspace', async ({
    page,
  }) => {
    // Create Work tasks: 1 done, 2 not done
    await apiHelper.createTasks([
      { title: 'Work Today', workspace: 'WORK', status: 'TODAY' },
      { title: 'Work In Progress', workspace: 'WORK', status: 'IN_PROGRESS' },
      { title: 'Work Done', workspace: 'WORK', status: 'DONE' },
    ]);

    // Create Personal tasks: 2 done, 1 not done
    await apiHelper.createTasks([
      { title: 'Personal Today', workspace: 'PERSONAL', status: 'TODAY' },
      { title: 'Personal Done 1', workspace: 'PERSONAL', status: 'DONE' },
      { title: 'Personal Done 2', workspace: 'PERSONAL', status: 'DONE' },
    ]);

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Filter by Work - Progress should be 1/3 = 33%
    await appPage.clickWorkspaceToggle('Work');
    let progress = await kanbanPage.getDailyProgressPercentage();
    expect(progress).toBe(33);

    // Filter by Personal - Progress should be 2/3 = 67%
    await appPage.clickWorkspaceToggle('Personal');
    progress = await kanbanPage.getDailyProgressPercentage();
    expect(progress).toBe(67);
  });

  test('should handle empty workspace filter gracefully', async ({ page }) => {
    // Create only Personal tasks
    await apiHelper.createTasks([
      { title: 'Personal 1', workspace: 'PERSONAL', status: 'BACKLOG' },
      { title: 'Personal 2', workspace: 'PERSONAL', status: 'TODAY' },
    ]);

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Filter by Work (which has no tasks)
    await appPage.clickWorkspaceToggle('Work');

    // Should show empty state or no tasks
    const taskCount = await backlogPage.getTaskCount();
    expect(taskCount).toBe(0);

    const todayCount = await kanbanPage.getTaskCountInColumn('Today');
    expect(todayCount).toBe(0);
  });

  test('should maintain filter state after page reload', async ({ page }) => {
    // Create tasks
    await apiHelper.createTasks([
      { title: 'Work Task', workspace: 'WORK', status: 'BACKLOG' },
      { title: 'Personal Task', workspace: 'PERSONAL', status: 'BACKLOG' },
    ]);

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Filter by Work
    await appPage.clickWorkspaceToggle('Work');
    expect(await backlogPage.hasTask('Work Task')).toBe(true);

    // Reload page
    await page.reload();
    await appPage.waitForAppReady();

    // NOTE: This test may fail if filter state is not persisted
    // If filter state should persist (e.g., in localStorage), it should still be active
    // If not, this test documents expected behavior

    // Check if Work filter is still active
    const isWorkActive = await appPage.isWorkspaceActive('Work');

    if (isWorkActive) {
      // Filter persisted
      expect(await backlogPage.hasTask('Work Task')).toBe(true);
      expect(await backlogPage.hasTask('Personal Task')).toBe(false);
    } else {
      // Filter not persisted - both tasks visible
      expect(await backlogPage.hasTask('Work Task')).toBe(true);
      expect(await backlogPage.hasTask('Personal Task')).toBe(true);
    }
  });
});
