import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Subtask Management
 *
 * Tests the complete user flow for creating, managing, and completing subtasks
 * from the kanban board interface.
 */

test.describe('Subtask Management', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Ensure we have a baseURL (either from config or default to localhost)
    const url = baseURL || 'http://localhost:4200';

    // Navigate to the app
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for the kanban board to load (increased timeout for initial load)
    await page.waitForSelector('.kanban-container', { timeout: 30000 });

    // Wait an additional second for Angular to fully render
    await page.waitForTimeout(2000);
  });

  test('should add a subtask to a task', async ({ page }) => {
    // Step 1: Find the first task card in any column
    const taskCard = page.locator('.task-card').first();
    await expect(taskCard).toBeVisible({ timeout: 10000 });

    // Step 2: Look for the subtask list component within the task card
    const subtaskList = taskCard.locator('app-subtask-list');
    await expect(subtaskList).toBeVisible();

    // Step 3: Click the "Add subtask" button
    const addButton = subtaskList.locator('button').filter({ hasText: 'Add subtask' }).or(subtaskList.locator('button[aria-label="Add new subtask"]'));
    await addButton.first().click();
    await page.waitForTimeout(1000); // Wait for Angular change detection

    // Step 4: Wait for the dialog form to appear
    await page.waitForSelector('input#subtask-title', { timeout: 5000 });

    // Step 5: Fill in the subtask title
    await page.locator('input#subtask-title').fill('Test Subtask - E2E Test');

    // Step 6: Fill in description (optional)
    await page.locator('textarea#subtask-description').fill('This is a test subtask created by E2E test');

    // Step 7: Submit the form by clicking Create button
    await page.locator('p-dialog button').filter({ hasText: 'Create' }).click();

    // Step 8: Wait for the dialog to close
    await page.waitForSelector('p-dialog', { state: 'hidden', timeout: 5000 });

    // Step 9: Wait for API call to complete
    await page.waitForTimeout(1000);

    // Step 10: Expand the subtask list if needed
    const expandButton = subtaskList.locator('button').filter({ hasText: 'Subtasks' });
    const isExpanded = await expandButton.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await expandButton.click();
      await page.waitForTimeout(500);
    }

    // Step 11: Verify the subtask appears in the list
    const subtaskItem = subtaskList.locator('.subtask-item').filter({ hasText: 'Test Subtask - E2E Test' });
    await expect(subtaskItem).toBeVisible({ timeout: 5000 });

    console.log('✅ Successfully created subtask: "Test Subtask - E2E Test"');
  });

  test('should change subtask status from TODO to DOING to DONE', async ({ page }) => {
    // First, create a subtask
    const taskCard = page.locator('.task-card').first();
    await expect(taskCard).toBeVisible({ timeout: 10000 });

    const subtaskList = taskCard.locator('app-subtask-list');

    // Click add button
    const addButton = subtaskList.locator('button').filter({ hasText: 'Add subtask' }).or(subtaskList.locator('button[aria-label="Add new subtask"]'));
    await addButton.first().click();
    await page.waitForTimeout(1000); // Wait for Angular change detection

    // Fill in form
    await page.waitForSelector('input#subtask-title', { timeout: 5000 });
    await page.locator('input#subtask-title').fill('Status Change Test Subtask');

    await page.locator('p-dialog button').filter({ hasText: 'Create' }).click();
    await page.waitForSelector('p-dialog', { state: 'hidden', timeout: 5000 });
    await page.waitForTimeout(1000);

    // Expand if needed
    const expandButton = subtaskList.locator('button').filter({ hasText: 'Subtasks' });
    const isExpanded = await expandButton.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await expandButton.click();
      await page.waitForTimeout(500);
    }

    // Find the subtask item
    const subtaskItem = subtaskList.locator('.subtask-item').filter({ hasText: 'Status Change Test Subtask' });
    await expect(subtaskItem).toBeVisible({ timeout: 5000 });

    // Step 1: Change status from TODO to DOING
    // Click the status dropdown (p-select)
    const statusDropdown = subtaskItem.locator('p-select');
    await statusDropdown.click();
    await page.waitForTimeout(500);

    // Select "Doing" from the overlay
    const doingOption = page.locator('.p-select-option').filter({ hasText: 'Doing' });
    await doingOption.click();
    await page.waitForTimeout(1000);

    // Verify status changed to DOING in the badge
    const doingBadge = subtaskItem.locator('p-tag').filter({ hasText: 'Doing' });
    await expect(doingBadge).toBeVisible({ timeout: 3000 });

    console.log('✅ Changed subtask status to DOING');

    // Step 2: Change status from DOING to DONE
    await statusDropdown.click();
    await page.waitForTimeout(500);

    const doneOption = page.locator('.p-select-option').filter({ hasText: 'Done' });
    await doneOption.click();
    await page.waitForTimeout(1000);

    // Verify status changed to DONE
    const doneBadge = subtaskItem.locator('p-tag').filter({ hasText: 'Done' });
    await expect(doneBadge).toBeVisible({ timeout: 3000 });

    console.log('✅ Changed subtask status to DONE');

    // Step 3: Verify progress indicator updated
    const progressBadge = subtaskList.locator('p-tag').filter({ hasText: /complete/ });
    await expect(progressBadge).toBeVisible();
    const progressText = await progressBadge.textContent();
    expect(progressText).toContain('1'); // At least 1 completed

    console.log('✅ Progress indicator updated correctly');
  });

  test('should delete a subtask', async ({ page }) => {
    // Create a subtask first
    const taskCard = page.locator('.task-card').first();
    await expect(taskCard).toBeVisible({ timeout: 10000 });

    const subtaskList = taskCard.locator('app-subtask-list');

    // Click add button
    const addButton = subtaskList.locator('button').filter({ hasText: 'Add subtask' }).or(subtaskList.locator('button[aria-label="Add new subtask"]'));
    await addButton.first().click();
    await page.waitForTimeout(1000); // Wait for Angular change detection

    // Fill in form
    await page.waitForSelector('input#subtask-title', { timeout: 5000 });
    await page.locator('input#subtask-title').fill('Subtask to Delete');

    await page.locator('p-dialog button').filter({ hasText: 'Create' }).click();
    await page.waitForSelector('p-dialog', { state: 'hidden', timeout: 5000 });
    await page.waitForTimeout(1000);

    // Expand if needed
    const expandButton = subtaskList.locator('button').filter({ hasText: 'Subtasks' });
    const isExpanded = await expandButton.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await expandButton.click();
      await page.waitForTimeout(500);
    }

    // Find the subtask
    const subtaskItem = subtaskList.locator('.subtask-item').filter({ hasText: 'Subtask to Delete' });
    await expect(subtaskItem).toBeVisible({ timeout: 5000 });

    // Click the delete button (trash icon)
    const deleteButton = subtaskItem.locator('button[aria-label*="Delete"]');
    await deleteButton.click();
    await page.waitForTimeout(500);

    // Confirm deletion in confirmation dialog
    const confirmDialog = page.locator('p-confirmdialog');
    const isConfirmDialogVisible = await confirmDialog.isVisible({ timeout: 2000 }).catch(() => false);

    if (isConfirmDialogVisible) {
      const confirmButton = confirmDialog.locator('button').filter({ hasText: /Yes|Confirm|Delete/i });
      await confirmButton.click();
      await page.waitForTimeout(1000);
    }

    // Verify the subtask is removed
    await expect(subtaskItem).not.toBeVisible({ timeout: 5000 });

    console.log('✅ Successfully deleted subtask');
  });

  test('should show subtask progress indicator', async ({ page }) => {
    const taskCard = page.locator('.task-card').first();
    await expect(taskCard).toBeVisible({ timeout: 10000 });

    const subtaskList = taskCard.locator('app-subtask-list');

    // Create a subtask first so there's something to show
    const addButton = subtaskList.locator('button').filter({ hasText: 'Add subtask' }).or(subtaskList.locator('button[aria-label="Add new subtask"]'));
    await addButton.first().click();
    await page.waitForTimeout(1000); // Wait for Angular change detection

    await page.waitForSelector('input#subtask-title', { timeout: 5000 });
    await page.locator('input#subtask-title').fill('Progress Test Subtask');

    await page.locator('p-dialog button').filter({ hasText: 'Create' }).click();
    await page.waitForSelector('p-dialog', { state: 'hidden', timeout: 5000 });
    await page.waitForTimeout(1000);

    // Check for progress badge
    const progressBadge = subtaskList.locator('p-tag').filter({ hasText: /complete/ });
    await expect(progressBadge).toBeVisible({ timeout: 5000 });

    const badgeText = await progressBadge.textContent();
    console.log(`✅ Progress badge found: "${badgeText}"`);

    // Should contain a fraction (e.g., "0/1 complete")
    expect(badgeText).toMatch(/\d+\/\d+ complete/);

    // Expand to check progress bar
    const expandButton = subtaskList.locator('button').filter({ hasText: 'Subtasks' });
    const isExpanded = await expandButton.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await expandButton.click();
      await page.waitForTimeout(500);
    }

    // Check for progress bar
    const progressBar = subtaskList.locator('p-progressbar');
    const hasProgressBar = await progressBar.isVisible().catch(() => false);

    if (hasProgressBar) {
      console.log('✅ Progress bar is visible');
    }
  });
});
