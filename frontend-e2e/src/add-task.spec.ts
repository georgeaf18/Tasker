import { test, expect } from '@playwright/test';

test.describe('Add Task Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
    await page.waitForLoadState('networkidle');
  });

  test('should successfully add a new task', async ({ page }) => {
    // Step 1: Open the create task dialog
    console.log('Step 1: Looking for FAB button to open dialog...');
    const fabButton = page.locator('p-button[icon="pi pi-plus"]').first();
    await expect(fabButton).toBeVisible({ timeout: 5000 });
    await fabButton.click();
    console.log('FAB button clicked');

    // Step 2: Wait for dialog to appear
    console.log('Step 2: Waiting for dialog to appear...');
    const dialog = page.locator('.sleek-task-dialog').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    console.log('Dialog is visible');

    // Step 2a: Verify visual elements are displayed
    console.log('Step 2a: Verifying visual elements...');
    const addTaskButton = page.locator('.add-task-btn');
    await expect(addTaskButton).toBeVisible();
    await expect(addTaskButton).toContainText('Add task');

    const taskInput = page.locator('.sleek-task-input');
    await expect(taskInput).toBeVisible();
    await expect(taskInput).toHaveAttribute(
      'placeholder',
      'Task description...',
    );

    // Verify metadata buttons are visible
    const metadataButtons = page.locator('.metadata-btn');
    await expect(metadataButtons.first()).toBeVisible();
    console.log('All visual elements verified');

    // Step 3: Fill in task title
    console.log('Step 3: Filling in task title...');
    await taskInput.fill('Test E2E Task');
    console.log('Task title filled: Test E2E Task');

    // Step 4: Verify the input value
    const inputValue = taskInput;
    console.log('Input value:', inputValue);
    await expect(inputValue).toHaveValue('Test E2E Task');

    // Step 5: Click the "Add task" button
    console.log('Step 5: Clicking Add task button...');
    const addButton = page.locator('.add-task-btn');
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();
    await addButton.click();
    console.log('Add task button clicked');

    // Step 6: Wait for dialog to close
    console.log('Step 6: Waiting for dialog to close...');
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
    console.log('Dialog closed successfully');

    // Step 7: Expand PERSONAL accordion panel (default workspace)
    console.log('Step 7: Expanding PERSONAL accordion panel...');
    const personalHeader = page.locator('.personal-header').first();
    if (await personalHeader.isVisible()) {
      await personalHeader.click();
      console.log('PERSONAL panel expanded');
      await page.waitForTimeout(500); // Wait for accordion animation
    }

    // Step 8: Verify task appears in the backlog
    console.log('Step 8: Verifying task appears in backlog...');
    await page.waitForTimeout(1000); // Give time for task to be added

    // Look for the task in the sidebar
    const taskCard = page
      .locator('.task-title', { hasText: 'Test E2E Task' })
      .first();
    await expect(taskCard).toBeVisible({ timeout: 5000 });
    console.log('Task found in backlog!');

    // Step 8: Verify task details
    const taskCardContainer = taskCard.locator('..');
    console.log('Task successfully added to backlog');
  });
});
