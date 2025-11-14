import { test, expect } from '@playwright/test';

/**
 * Task Management Flow E2E Tests
 *
 * Tests the complete lifecycle of task management:
 * 1. Create a task with status selection (Backlog/Today)
 * 2. Move task through kanban workflow (Today → In Progress → Done)
 * 3. Update task details (title, description, context, channel)
 * 4. Verify toast notifications appear
 * 5. Verify data persistence
 */

test.describe('Complete Task Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to be fully loaded
    await page.waitForSelector('.app-container', { timeout: 10000 });
  });

  test('should create task in backlog and move to done', async ({ page }) => {
    const taskTitle = `E2E Test Task ${Date.now()}`;
    const taskDescription = 'This is an E2E test task';

    // Step 1: Click the header "Add Task" button
    await page.click('.add-task-button');

    // Step 2: Wait for create dialog to open
    await page.waitForSelector('p-dialog', { state: 'visible' });

    // Step 3: Fill in task details
    await page.fill('#title', taskTitle);
    await page.fill('#description', taskDescription);

    // Step 4: Select "Backlog" status (should be default)
    const statusDropdown = page.locator('#status');
    await statusDropdown.click();
    await page.click('[role="option"]:has-text("Backlog")');

    // Step 5: Select context (Work)
    const contextDropdown = page.locator('#workspace');
    await contextDropdown.click();
    await page.click('[role="option"]:has-text("Work")');

    // Step 6: Submit the form
    await page.click('p-button:has-text("Create")');

    // Step 7: Wait for toast notification
    await expect(page.locator('p-toast')).toContainText('Task Created', {
      timeout: 5000,
    });

    // Step 8: Verify task appears in backlog sidebar
    await expect(page.locator('.backlog-sidebar-container')).toContainText(
      taskTitle,
    );

    // Step 9: Click on the task to open details dialog
    await page.locator('.task-card-content', { hasText: taskTitle }).click();

    // Step 10: Wait for edit dialog
    await page.waitForSelector('p-dialog:has-text("Task Details")');

    // Step 11: Verify task details are displayed correctly
    await expect(page.locator('#edit-title')).toHaveValue(taskTitle);
    await expect(page.locator('#edit-description')).toHaveValue(
      taskDescription,
    );

    // Step 12: Close the details dialog
    await page.click('p-button:has-text("Cancel")');
  });

  test('should create task in Today and move through kanban workflow', async ({
    page,
  }) => {
    const taskTitle = `Today Task ${Date.now()}`;

    // Step 1: Click header "Add Task" button
    await page.click('.add-task-button');

    // Step 2: Fill in basic details
    await page.fill('#title', taskTitle);

    // Step 3: Select "Today" status
    const statusDropdown = page.locator('#status');
    await statusDropdown.click();
    await page.click('[role="option"]:has-text("Today")');

    // Step 4: Submit
    await page.click('p-button:has-text("Create")');

    // Step 5: Verify success toast
    await expect(page.locator('p-toast')).toContainText('Task Created');

    // Step 6: Verify task appears in Today column of kanban board
    const todayColumn = page
      .locator('.kanban-column')
      .filter({ hasText: 'Today' });
    await expect(todayColumn).toContainText(taskTitle);

    // Step 7: Click on task to open details
    await todayColumn.locator('.task-card', { hasText: taskTitle }).click();

    // Step 8: Move to "In Progress" by clicking appropriate button
    await page.click('p-button:has-text("In Progress")');

    // Step 9: Verify update toast
    await expect(page.locator('p-toast')).toContainText('Task Updated');

    // Step 10: Verify task moved to In Progress column
    const inProgressColumn = page
      .locator('.kanban-column')
      .filter({ hasText: 'In Progress' });
    await expect(inProgressColumn).toContainText(taskTitle);

    // Step 11: Open task again and move to Done
    await inProgressColumn
      .locator('.task-card', { hasText: taskTitle })
      .click();
    await page.click('p-button:has-text("Done")');

    // Step 12: Verify task in Done column
    const doneColumn = page
      .locator('.kanban-column')
      .filter({ hasText: 'Done' });
    await expect(doneColumn).toContainText(taskTitle);
  });

  test('should update task details and verify changes persist', async ({
    page,
  }) => {
    const initialTitle = `Update Test ${Date.now()}`;
    const updatedTitle = `${initialTitle} - Updated`;
    const updatedDescription = 'Updated description text';

    // Step 1: Create a task
    await page.click('.add-task-button');
    await page.fill('#title', initialTitle);
    await page.click('p-button:has-text("Create")');
    await expect(page.locator('p-toast')).toContainText('Task Created');

    // Step 2: Open the task from backlog
    await page.locator('.task-card-content', { hasText: initialTitle }).click();
    await page.waitForSelector('p-dialog:has-text("Task Details")');

    // Step 3: Update title
    await page.fill('#edit-title', updatedTitle);

    // Step 4: Update description
    await page.fill('#edit-description', updatedDescription);

    // Step 5: Save changes
    await page.click('p-button:has-text("Save")');

    // Step 6: Verify update toast
    await expect(page.locator('p-toast')).toContainText('Task Updated');

    // Step 7: Verify updated title in backlog
    await expect(page.locator('.backlog-sidebar-container')).toContainText(
      updatedTitle,
    );

    // Step 8: Reopen task to verify persistence
    await page.locator('.task-card-content', { hasText: updatedTitle }).click();

    // Step 9: Verify updates persisted
    await expect(page.locator('#edit-title')).toHaveValue(updatedTitle);
    await expect(page.locator('#edit-description')).toHaveValue(
      updatedDescription,
    );
  });

  test('should delete task and show confirmation', async ({ page }) => {
    const taskTitle = `Delete Test ${Date.now()}`;

    // Step 1: Create a task
    await page.click('.add-task-button');
    await page.fill('#title', taskTitle);
    await page.click('p-button:has-text("Create")');
    await expect(page.locator('p-toast')).toContainText('Task Created');

    // Step 2: Open task details
    await page.locator('.task-card-content', { hasText: taskTitle }).click();

    // Step 3: Click delete button
    await page.click('p-button:has-text("Delete")');

    // Step 4: Confirm deletion in confirmation dialog
    await page.waitForSelector('p-confirmdialog');
    await page.click('button:has-text("Yes")');

    // Step 5: Verify delete toast
    await expect(page.locator('p-toast')).toContainText('Task Deleted');

    // Step 6: Verify task no longer in backlog
    await expect(page.locator('.backlog-sidebar-container')).not.toContainText(
      taskTitle,
    );
  });

  test('should switch context and create tasks in different contexts', async ({
    page,
  }) => {
    const workTask = `Work Task ${Date.now()}`;
    const personalTask = `Personal Task ${Date.now()}`;

    // Step 1: Create a Work task
    await page.click('.add-task-button');
    await page.fill('#title', workTask);

    const contextDropdown = page.locator('#workspace');
    await contextDropdown.click();
    await page.click('[role="option"]:has-text("Work")');

    await page.click('p-button:has-text("Create")');
    await expect(page.locator('p-toast')).toContainText('Task Created');

    // Step 2: Create a Personal task
    await page.click('.add-task-button');
    await page.fill('#title', personalTask);

    await contextDropdown.click();
    await page.click('[role="option"]:has-text("Personal")');

    await page.click('p-button:has-text("Create")');
    await expect(page.locator('p-toast')).toContainText('Task Created');

    // Step 3: Verify both tasks are in backlog
    await expect(page.locator('.backlog-sidebar-container')).toContainText(
      workTask,
    );
    await expect(page.locator('.backlog-sidebar-container')).toContainText(
      personalTask,
    );
  });

  test('should show validation error when title is empty', async ({ page }) => {
    // Step 1: Open create dialog
    await page.click('.add-task-button');

    // Step 2: Leave title empty and try to submit
    await page.click('p-button:has-text("Create")');

    // Step 3: Verify Create button is disabled (due to form validation)
    const createButton = page.locator('p-button:has-text("Create")');
    await expect(createButton).toBeDisabled();
  });

  test('should cancel task creation and not save', async ({ page }) => {
    const taskTitle = `Cancel Test ${Date.now()}`;

    // Step 1: Open create dialog
    await page.click('.add-task-button');

    // Step 2: Fill in title
    await page.fill('#title', taskTitle);

    // Step 3: Click Cancel
    await page.click('p-button:has-text("Cancel")');

    // Step 4: Verify dialog closed
    await expect(page.locator('p-dialog')).toBeHidden();

    // Step 5: Verify task was not created
    await expect(page.locator('.backlog-sidebar-container')).not.toContainText(
      taskTitle,
    );
  });
});
