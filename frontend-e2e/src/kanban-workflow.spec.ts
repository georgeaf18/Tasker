import { test, expect } from '@playwright/test';
import { AppPage } from './support/page-objects/app.po';
import { BacklogPage } from './support/page-objects/backlog.po';
import { KanbanPage } from './support/page-objects/kanban.po';
import { TaskDialogPage } from './support/page-objects/task-dialog.po';
import { ApiHelper } from './support/api-helper';

/**
 * Kanban Workflow E2E Tests
 *
 * Tests the complete kanban workflow:
 * 1. Create a task in backlog
 * 2. Move task to "Today" column
 * 3. Move task to "In Progress" column
 * 4. Move task to "Done" column
 * 5. Verify daily progress bar updates
 */
test.describe('Kanban Workflow', () => {
  let appPage: AppPage;
  let backlogPage: BacklogPage;
  let kanbanPage: KanbanPage;
  let taskDialogPage: TaskDialogPage;
  let apiHelper: ApiHelper;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    appPage = new AppPage(page);
    backlogPage = new BacklogPage(page);
    kanbanPage = new KanbanPage(page);
    taskDialogPage = new TaskDialogPage(page);
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

  test('should move task from backlog to Today', async ({ page }) => {
    const taskTitle = 'Move to Today Test';

    // Create a task in backlog via API for speed
    await apiHelper.createTask({
      title: taskTitle,
      status: 'BACKLOG',
    });

    // Refresh to load the task
    await page.reload();
    await appPage.waitForAppReady();

    // Open task from backlog
    await backlogPage.openTaskDetails(taskTitle);

    // Move to Today status
    await taskDialogPage.moveToStatus('TODAY');

    // Verify task appears in Today column
    await kanbanPage.waitForTaskInColumn('Today', taskTitle);
    expect(await kanbanPage.hasTaskInColumn('Today', taskTitle)).toBe(true);

    // Verify task no longer in backlog
    expect(await backlogPage.hasTask(taskTitle)).toBe(false);

    // Verify backend status updated
    const tasks = await apiHelper.getTasks();
    const task = tasks.find((t) => t.title === taskTitle);
    expect(task?.status).toBe('TODAY');
  });

  test('should move task from Today to In Progress', async ({ page }) => {
    const taskTitle = 'Move to In Progress Test';

    // Create task in Today status
    await apiHelper.createTask({
      title: taskTitle,
      status: 'TODAY',
    });

    // Refresh to load the task
    await page.reload();
    await appPage.waitForAppReady();

    // Open task from Today column
    await kanbanPage.openTaskDetails('Today', taskTitle);

    // Move to In Progress
    await taskDialogPage.moveToStatus('IN_PROGRESS');

    // Verify task in In Progress column
    await kanbanPage.waitForTaskInColumn('In Progress', taskTitle);
    expect(await kanbanPage.hasTaskInColumn('In Progress', taskTitle)).toBe(
      true,
    );

    // Verify task no longer in Today
    expect(await kanbanPage.hasTaskInColumn('Today', taskTitle)).toBe(false);

    // Verify backend
    const tasks = await apiHelper.getTasks();
    const task = tasks.find((t) => t.title === taskTitle);
    expect(task?.status).toBe('IN_PROGRESS');
  });

  test('should move task from In Progress to Done', async ({ page }) => {
    const taskTitle = 'Move to Done Test';

    // Create task in In Progress status
    await apiHelper.createTask({
      title: taskTitle,
      status: 'IN_PROGRESS',
    });

    // Refresh to load the task
    await page.reload();
    await appPage.waitForAppReady();

    // Open task from In Progress column
    await kanbanPage.openTaskDetails('In Progress', taskTitle);

    // Move to Done
    await taskDialogPage.moveToStatus('DONE');

    // Verify task in Done column
    await kanbanPage.waitForTaskInColumn('Done', taskTitle);
    expect(await kanbanPage.hasTaskInColumn('Done', taskTitle)).toBe(true);

    // Verify task no longer in In Progress
    expect(await kanbanPage.hasTaskInColumn('In Progress', taskTitle)).toBe(
      false,
    );

    // Verify backend
    const tasks = await apiHelper.getTasks();
    const task = tasks.find((t) => t.title === taskTitle);
    expect(task?.status).toBe('DONE');
  });

  test('should complete full workflow from backlog to done', async ({
    page,
  }) => {
    const taskTitle = 'Complete Workflow Test';

    // Create task in backlog
    await apiHelper.createTask({
      title: taskTitle,
      status: 'BACKLOG',
    });

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Step 1: Backlog → Today
    await backlogPage.openTaskDetails(taskTitle);
    await taskDialogPage.moveToStatus('TODAY');
    await kanbanPage.waitForTaskInColumn('Today', taskTitle);

    // Step 2: Today → In Progress
    await kanbanPage.openTaskDetails('Today', taskTitle);
    await taskDialogPage.moveToStatus('IN_PROGRESS');
    await kanbanPage.waitForTaskInColumn('In Progress', taskTitle);

    // Step 3: In Progress → Done
    await kanbanPage.openTaskDetails('In Progress', taskTitle);
    await taskDialogPage.moveToStatus('DONE');
    await kanbanPage.waitForTaskInColumn('Done', taskTitle);

    // Verify final state
    expect(await kanbanPage.hasTaskInColumn('Done', taskTitle)).toBe(true);

    // Verify backend
    const tasks = await apiHelper.getTasks();
    const task = tasks.find((t) => t.title === taskTitle);
    expect(task?.status).toBe('DONE');
  });

  test('should update daily progress bar when moving tasks', async ({
    page,
  }) => {
    // Create 3 tasks in different statuses
    await apiHelper.createTasks([
      { title: 'Today Task', status: 'TODAY' },
      { title: 'In Progress Task', status: 'IN_PROGRESS' },
      { title: 'Done Task', status: 'DONE' },
    ]);

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Initial progress: 1/3 = 33%
    let progress = await kanbanPage.getDailyProgressPercentage();
    expect(progress).toBe(33);

    // Move Today task to Done
    await kanbanPage.openTaskDetails('Today', 'Today Task');
    await taskDialogPage.moveToStatus('DONE');
    await kanbanPage.waitForTaskInColumn('Done', 'Today Task');

    // Progress should now be 2/3 = 67%
    progress = await kanbanPage.getDailyProgressPercentage();
    expect(progress).toBe(67);

    // Move In Progress task to Done
    await kanbanPage.openTaskDetails('In Progress', 'In Progress Task');
    await taskDialogPage.moveToStatus('DONE');
    await kanbanPage.waitForTaskInColumn('Done', 'In Progress Task');

    // Progress should now be 3/3 = 100%
    progress = await kanbanPage.getDailyProgressPercentage();
    expect(progress).toBe(100);
  });

  test('should show 0% progress when no tasks', async ({ page }) => {
    // No tasks created
    await page.reload();
    await appPage.waitForAppReady();

    // Progress should be 0%
    const progress = await kanbanPage.getDailyProgressPercentage();
    expect(progress).toBe(0);
  });

  test('should handle multiple tasks in each column', async ({ page }) => {
    // Create multiple tasks in each status
    await apiHelper.createTasks([
      { title: 'Today Task 1', status: 'TODAY' },
      { title: 'Today Task 2', status: 'TODAY' },
      { title: 'In Progress Task 1', status: 'IN_PROGRESS' },
      { title: 'In Progress Task 2', status: 'IN_PROGRESS' },
      { title: 'Done Task 1', status: 'DONE' },
      { title: 'Done Task 2', status: 'DONE' },
    ]);

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Verify counts
    expect(await kanbanPage.getTaskCountInColumn('Today')).toBe(2);
    expect(await kanbanPage.getTaskCountInColumn('In Progress')).toBe(2);
    expect(await kanbanPage.getTaskCountInColumn('Done')).toBe(2);

    // Verify progress: 2/6 = 33%
    const progress = await kanbanPage.getDailyProgressPercentage();
    expect(progress).toBe(33);
  });

  test('should preserve task data when moving between statuses', async ({
    page,
  }) => {
    const taskData = {
      title: 'Data Preservation Test',
      description: 'This description should remain unchanged',
      workspace: 'WORK' as const,
    };

    // Create task
    const createdTask = await apiHelper.createTask({
      ...taskData,
      status: 'BACKLOG',
    });

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Move through statuses
    await backlogPage.openTaskDetails(taskData.title);
    await taskDialogPage.moveToStatus('TODAY');
    await kanbanPage.waitForTaskInColumn('Today', taskData.title);

    // Verify data preserved in backend
    const task = await apiHelper.getTask(createdTask.id);
    expect(task.title).toBe(taskData.title);
    expect(task.description).toBe(taskData.description);
    expect(task.workspace).toBe(taskData.workspace);
    expect(task.status).toBe('TODAY');
  });

  test('should handle rapid status changes', async ({ page }) => {
    const taskTitle = 'Rapid Change Test';

    // Create task
    await apiHelper.createTask({
      title: taskTitle,
      status: 'BACKLOG',
    });

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Rapidly move through statuses
    await backlogPage.openTaskDetails(taskTitle);
    await taskDialogPage.moveToStatus('TODAY');
    await kanbanPage.waitForTaskInColumn('Today', taskTitle);

    await kanbanPage.openTaskDetails('Today', taskTitle);
    await taskDialogPage.moveToStatus('IN_PROGRESS');
    await kanbanPage.waitForTaskInColumn('In Progress', taskTitle);

    await kanbanPage.openTaskDetails('In Progress', taskTitle);
    await taskDialogPage.moveToStatus('DONE');
    await kanbanPage.waitForTaskInColumn('Done', taskTitle);

    // Verify final state is correct
    const tasks = await apiHelper.getTasks();
    const task = tasks.find((t) => t.title === taskTitle);
    expect(task?.status).toBe('DONE');
  });

  test('should allow moving task backwards (Done to In Progress)', async ({
    page,
  }) => {
    const taskTitle = 'Move Backwards Test';

    // Create task in Done status
    await apiHelper.createTask({
      title: taskTitle,
      status: 'DONE',
    });

    // Refresh
    await page.reload();
    await appPage.waitForAppReady();

    // Move from Done to In Progress
    await kanbanPage.openTaskDetails('Done', taskTitle);
    await taskDialogPage.moveToStatus('IN_PROGRESS');

    // Verify task moved
    await kanbanPage.waitForTaskInColumn('In Progress', taskTitle);
    expect(await kanbanPage.hasTaskInColumn('In Progress', taskTitle)).toBe(
      true,
    );
    expect(await kanbanPage.hasTaskInColumn('Done', taskTitle)).toBe(false);

    // Verify backend
    const tasks = await apiHelper.getTasks();
    const task = tasks.find((t) => t.title === taskTitle);
    expect(task?.status).toBe('IN_PROGRESS');
  });
});
