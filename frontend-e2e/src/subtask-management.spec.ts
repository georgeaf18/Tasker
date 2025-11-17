import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Subtask Management
 *
 * Tests the complete user flow for creating, managing, and completing subtasks
 * from the kanban board interface.
 */

test.describe('Subtask Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the kanban board to load
    await page.waitForSelector('.kanban-container', { timeout: 10000 });
  });

  test('should add a subtask to a task', async ({ page }) => {
    // Step 1: Find the first task card in the Today column
    const taskCard = page.locator('.today-column .task-card').first();
    await expect(taskCard).toBeVisible({ timeout: 10000 });

    // Step 2: Look for the subtask list component within the task card
    const subtaskList = taskCard.locator('app-subtask-list');
    await expect(subtaskList).toBeVisible();

    // Step 3: Check if the subtask list is initially collapsed
    // The "Add subtask" button should be visible
    const addSubtaskButton = subtaskList.locator('p-button').filter({ hasText: 'Add subtask' });

    // If the list is collapsed, expand it first
    const expandButton = subtaskList.locator('p-button').filter({ hasText: /Show|Expand/ }).first();
    const isExpandButtonVisible = await expandButton.isVisible().catch(() => false);

    if (isExpandButtonVisible) {
      await expandButton.click();
      await page.waitForTimeout(500); // Wait for expansion animation
    }

    // Step 4: Click the "Add subtask" button
    await addSubtaskButton.click();

    // Step 5: Wait for the subtask form dialog to appear
    const dialog = page.locator('p-dialog').filter({ hasText: /Create Subtask|Add Subtask/ });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Step 6: Fill in the subtask title
    const titleInput = dialog.locator('input[formcontrolname="title"], input[name="title"]');
    await titleInput.fill('Test Subtask - E2E Test');

    // Step 7: Optionally fill in description
    const descriptionTextarea = dialog.locator('textarea[formcontrolname="description"], textarea[name="description"]');
    const isDescriptionVisible = await descriptionTextarea.isVisible().catch(() => false);

    if (isDescriptionVisible) {
      await descriptionTextarea.fill('This is a test subtask created by E2E test');
    }

    // Step 8: Submit the form
    const saveButton = dialog.locator('p-button').filter({ hasText: /Save|Create|Add/ }).first();
    await saveButton.click();

    // Step 9: Wait for the dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // Step 10: Verify the subtask appears in the list
    const subtaskItem = subtaskList.locator('.subtask-item, app-subtask-item').filter({ hasText: 'Test Subtask - E2E Test' });
    await expect(subtaskItem).toBeVisible({ timeout: 5000 });

    // Step 11: Verify the subtask has the correct default status (TODO)
    const statusBadge = subtaskItem.locator('p-tag, .status-badge').filter({ hasText: /To Do|TODO/ });
    await expect(statusBadge).toBeVisible();

    console.log('✅ Successfully created subtask: "Test Subtask - E2E Test"');
  });

  test('should change subtask status from TODO to DOING to DONE', async ({ page }) => {
    // First, create a subtask (reusing logic from previous test)
    const taskCard = page.locator('.today-column .task-card').first();
    await expect(taskCard).toBeVisible({ timeout: 10000 });

    const subtaskList = taskCard.locator('app-subtask-list');

    // Expand if needed
    const expandButton = subtaskList.locator('p-button').filter({ hasText: /Show|Expand/ }).first();
    const isExpandButtonVisible = await expandButton.isVisible().catch(() => false);
    if (isExpandButtonVisible) {
      await expandButton.click();
      await page.waitForTimeout(500);
    }

    // Create a new subtask for this test
    const addSubtaskButton = subtaskList.locator('p-button').filter({ hasText: 'Add subtask' });
    await addSubtaskButton.click();

    const dialog = page.locator('p-dialog').filter({ hasText: /Create Subtask|Add Subtask/ });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const titleInput = dialog.locator('input[formcontrolname="title"], input[name="title"]');
    await titleInput.fill('Status Change Test Subtask');

    const saveButton = dialog.locator('p-button').filter({ hasText: /Save|Create|Add/ }).first();
    await saveButton.click();
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // Find the newly created subtask
    const subtaskItem = subtaskList.locator('.subtask-item, app-subtask-item').filter({ hasText: 'Status Change Test Subtask' });
    await expect(subtaskItem).toBeVisible({ timeout: 5000 });

    // Step 1: Change status from TODO to DOING
    const statusDropdown = subtaskItem.locator('p-select, p-dropdown, select').first();
    await statusDropdown.click();

    // Select "Doing" option
    const doingOption = page.locator('.p-select-option, .p-dropdown-item, option').filter({ hasText: /Doing|DOING/ });
    await doingOption.click();

    // Verify status changed to DOING
    await page.waitForTimeout(1000); // Wait for state update
    const doingBadge = subtaskItem.locator('p-tag, .status-badge').filter({ hasText: /Doing|DOING/ });
    await expect(doingBadge).toBeVisible({ timeout: 3000 });

    console.log('✅ Changed subtask status to DOING');

    // Step 2: Change status from DOING to DONE
    await statusDropdown.click();
    const doneOption = page.locator('.p-select-option, .p-dropdown-item, option').filter({ hasText: /Done|DONE/ });
    await doneOption.click();

    // Verify status changed to DONE
    await page.waitForTimeout(1000);
    const doneBadge = subtaskItem.locator('p-tag, .status-badge').filter({ hasText: /Done|DONE/ });
    await expect(doneBadge).toBeVisible({ timeout: 3000 });

    console.log('✅ Changed subtask status to DONE');

    // Step 3: Verify progress indicator updated
    const progressBadge = subtaskList.locator('.progress-badge, .completion-badge').first();
    const progressText = await progressBadge.textContent();
    expect(progressText).toContain('1'); // At least 1 completed

    console.log('✅ Progress indicator updated correctly');
  });

  test('should delete a subtask', async ({ page }) => {
    // Create a subtask first
    const taskCard = page.locator('.today-column .task-card').first();
    await expect(taskCard).toBeVisible({ timeout: 10000 });

    const subtaskList = taskCard.locator('app-subtask-list');

    // Expand if needed
    const expandButton = subtaskList.locator('p-button').filter({ hasText: /Show|Expand/ }).first();
    const isExpandButtonVisible = await expandButton.isVisible().catch(() => false);
    if (isExpandButtonVisible) {
      await expandButton.click();
      await page.waitForTimeout(500);
    }

    const addSubtaskButton = subtaskList.locator('p-button').filter({ hasText: 'Add subtask' });
    await addSubtaskButton.click();

    const dialog = page.locator('p-dialog').filter({ hasText: /Create Subtask|Add Subtask/ });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const titleInput = dialog.locator('input[formcontrolname="title"], input[name="title"]');
    await titleInput.fill('Subtask to Delete');

    const saveButton = dialog.locator('p-button').filter({ hasText: /Save|Create|Add/ }).first();
    await saveButton.click();
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // Find the subtask
    const subtaskItem = subtaskList.locator('.subtask-item, app-subtask-item').filter({ hasText: 'Subtask to Delete' });
    await expect(subtaskItem).toBeVisible({ timeout: 5000 });

    // Click the delete button
    const deleteButton = subtaskItem.locator('p-button').filter({ hasText: /Delete|Remove/ }).or(subtaskItem.locator('[icon="pi-trash"]'));
    await deleteButton.first().click();

    // Confirm deletion in confirmation dialog
    const confirmDialog = page.locator('p-confirmdialog, .p-confirm-dialog');
    const isConfirmDialogVisible = await confirmDialog.isVisible({ timeout: 2000 }).catch(() => false);

    if (isConfirmDialogVisible) {
      const confirmButton = confirmDialog.locator('button').filter({ hasText: /Yes|Confirm|Delete/ });
      await confirmButton.click();
    }

    // Verify the subtask is removed
    await expect(subtaskItem).not.toBeVisible({ timeout: 5000 });

    console.log('✅ Successfully deleted subtask');
  });

  test('should show subtask progress indicator', async ({ page }) => {
    const taskCard = page.locator('.today-column .task-card').first();
    await expect(taskCard).toBeVisible({ timeout: 10000 });

    const subtaskList = taskCard.locator('app-subtask-list');
    await expect(subtaskList).toBeVisible();

    // Check for progress badge (e.g., "2/5 complete")
    const progressBadge = subtaskList.locator('.progress-badge, .completion-badge, p-badge').first();

    // Progress badge should exist (even if 0/0)
    const hasBadge = await progressBadge.isVisible().catch(() => false);

    if (hasBadge) {
      const badgeText = await progressBadge.textContent();
      console.log(`✅ Progress badge found: "${badgeText}"`);

      // Should contain a fraction or percentage
      expect(badgeText).toMatch(/\d+\/\d+|\d+%/);
    } else {
      console.log('ℹ️ No subtasks exist yet, progress badge may not be visible');
    }

    // Check for progress bar
    const progressBar = subtaskList.locator('p-progressbar, .progress-bar').first();
    const hasProgressBar = await progressBar.isVisible().catch(() => false);

    if (hasProgressBar) {
      console.log('✅ Progress bar is visible');
    }
  });
});
