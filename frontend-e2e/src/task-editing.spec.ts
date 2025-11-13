import { test, expect } from '@playwright/test';
import { AppPage } from './support/page-objects/app.po';
import { BacklogPage } from './support/page-objects/backlog.po';
import { KanbanPage } from './support/page-objects/kanban.po';
import { TaskDialogPage } from './support/page-objects/task-dialog.po';
import { ApiHelper } from './support/api-helper';

/**
 * Task Editing E2E Tests
 *
 * Tests task editing functionality:
 * 1. Create a task
 * 2. Open task details
 * 3. Edit title and description
 * 4. Save changes
 * 5. Verify changes appear in UI
 * 6. Verify changes persisted to backend
 */
test.describe('Task Editing', () => {
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

    test('should edit task title', async ({ page }) => {
        const originalTitle = 'Original Task Title';
        const newTitle = 'Updated Task Title';

        // Create task
        const createdTask = await apiHelper.createTask({
            title: originalTitle,
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Open task
        await backlogPage.openTaskDetails(originalTitle);

        // Edit title
        await taskDialogPage.fillTitle(newTitle);

        // Save changes
        await taskDialogPage.submitForm();

        // Verify new title appears in UI
        expect(await backlogPage.hasTask(newTitle)).toBe(true);
        expect(await backlogPage.hasTask(originalTitle)).toBe(false);

        // Verify backend
        const task = await apiHelper.getTask(createdTask.id);
        expect(task.title).toBe(newTitle);
    });

    test('should edit task description', async ({ page }) => {
        const taskTitle = 'Task with Description';
        const originalDescription = 'Original description';
        const newDescription = 'Updated description with more details';

        // Create task
        const createdTask = await apiHelper.createTask({
            title: taskTitle,
            description: originalDescription,
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Open task
        await backlogPage.openTaskDetails(taskTitle);

        // Verify original description is shown
        const currentDescription = await taskDialogPage.getDescriptionValue();
        expect(currentDescription).toBe(originalDescription);

        // Edit description
        await taskDialogPage.fillDescription(newDescription);

        // Save
        await taskDialogPage.submitForm();

        // Verify backend
        const task = await apiHelper.getTask(createdTask.id);
        expect(task.description).toBe(newDescription);
    });

    test('should edit both title and description', async ({ page }) => {
        const taskData = {
            title: 'Original Title',
            description: 'Original description',
        };

        const updatedData = {
            title: 'New Title',
            description: 'New description',
        };

        // Create task
        const createdTask = await apiHelper.createTask({
            ...taskData,
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Open and edit
        await backlogPage.openTaskDetails(taskData.title);
        await taskDialogPage.fillTitle(updatedData.title);
        await taskDialogPage.fillDescription(updatedData.description);
        await taskDialogPage.submitForm();

        // Verify UI
        expect(await backlogPage.hasTask(updatedData.title)).toBe(true);

        // Verify backend
        const task = await apiHelper.getTask(createdTask.id);
        expect(task.title).toBe(updatedData.title);
        expect(task.description).toBe(updatedData.description);
    });

    test('should edit task workspace', async ({ page }) => {
        const taskTitle = 'Workspace Change Task';

        // Create Personal task
        const createdTask = await apiHelper.createTask({
            title: taskTitle,
            workspace: 'PERSONAL',
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Open task
        await backlogPage.openTaskDetails(taskTitle);

        // Change workspace to Work
        await taskDialogPage.selectWorkspace('WORK');

        // Save
        await taskDialogPage.submitForm();

        // Verify backend
        const task = await apiHelper.getTask(createdTask.id);
        expect(task.workspace).toBe('WORK');
    });

    test('should cancel edit without saving changes', async ({ page }) => {
        const originalTitle = 'Original Title';
        const attemptedNewTitle = 'This Should Not Save';

        // Create task
        const createdTask = await apiHelper.createTask({
            title: originalTitle,
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Open task
        await backlogPage.openTaskDetails(originalTitle);

        // Make changes
        await taskDialogPage.fillTitle(attemptedNewTitle);

        // Cancel instead of save
        await taskDialogPage.cancel();

        // Verify original title still in UI
        expect(await backlogPage.hasTask(originalTitle)).toBe(true);
        expect(await backlogPage.hasTask(attemptedNewTitle)).toBe(false);

        // Verify backend unchanged
        const task = await apiHelper.getTask(createdTask.id);
        expect(task.title).toBe(originalTitle);
    });

    test('should validate required fields when editing', async ({ page }) => {
        const taskTitle = 'Task to Edit';

        // Create task
        await apiHelper.createTask({
            title: taskTitle,
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Open task
        await backlogPage.openTaskDetails(taskTitle);

        // Clear required title field
        await taskDialogPage.getTitleInput().clear();

        // Try to submit
        await taskDialogPage.getSubmitButton().click();

        // Dialog should still be visible (validation failed)
        expect(await taskDialogPage.isVisible()).toBe(true);

        // Title should be marked invalid
        const titleInput = taskDialogPage.getTitleInput();
        const isInvalid = await titleInput.evaluate((el: HTMLElement) => {
            return el.classList.contains('ng-invalid') ||
                   el.getAttribute('aria-invalid') === 'true' ||
                   el.classList.contains('p-invalid');
        });

        expect(isInvalid).toBe(true);
    });

    test('should edit task from kanban column', async ({ page }) => {
        const originalTitle = 'Task in Today';
        const newTitle = 'Updated Task in Today';

        // Create task in Today column
        const createdTask = await apiHelper.createTask({
            title: originalTitle,
            status: 'TODAY',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Open from kanban
        await kanbanPage.openTaskDetails('Today', originalTitle);

        // Edit
        await taskDialogPage.fillTitle(newTitle);
        await taskDialogPage.submitForm();

        // Verify in kanban column
        expect(await kanbanPage.hasTaskInColumn('Today', newTitle)).toBe(true);

        // Verify backend
        const task = await apiHelper.getTask(createdTask.id);
        expect(task.title).toBe(newTitle);
        expect(task.status).toBe('TODAY'); // Status unchanged
    });

    test('should preserve status when editing other fields', async ({ page }) => {
        const taskTitle = 'Status Preservation Test';

        // Create task in In Progress
        const createdTask = await apiHelper.createTask({
            title: taskTitle,
            status: 'IN_PROGRESS',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Edit task
        await kanbanPage.openTaskDetails('In Progress', taskTitle);
        await taskDialogPage.fillDescription('New description');
        await taskDialogPage.submitForm();

        // Verify still in In Progress
        expect(await kanbanPage.hasTaskInColumn('In Progress', taskTitle)).toBe(true);

        // Verify backend
        const task = await apiHelper.getTask(createdTask.id);
        expect(task.status).toBe('IN_PROGRESS');
    });

    test('should handle editing with special characters', async ({ page }) => {
        const originalTitle = 'Simple Title';
        const newTitle = 'Title with "quotes" & <tags> and emojis 🚀';
        const newDescription = 'Multi\nLine\nDescription\nWith special chars: @#$%^&*()';

        // Create task
        const createdTask = await apiHelper.createTask({
            title: originalTitle,
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Edit with special characters
        await backlogPage.openTaskDetails(originalTitle);
        await taskDialogPage.fillTitle(newTitle);
        await taskDialogPage.fillDescription(newDescription);
        await taskDialogPage.submitForm();

        // Verify backend
        const task = await apiHelper.getTask(createdTask.id);
        expect(task.title).toBe(newTitle);
        expect(task.description).toBe(newDescription);
    });

    test('should edit task multiple times', async ({ page }) => {
        const taskTitle = 'Multiple Edits Task';

        // Create task
        const createdTask = await apiHelper.createTask({
            title: taskTitle,
            description: 'Version 1',
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // First edit
        await backlogPage.openTaskDetails(taskTitle);
        await taskDialogPage.fillDescription('Version 2');
        await taskDialogPage.submitForm();

        // Second edit
        await backlogPage.openTaskDetails(taskTitle);
        await taskDialogPage.fillDescription('Version 3');
        await taskDialogPage.submitForm();

        // Third edit
        await backlogPage.openTaskDetails(taskTitle);
        await taskDialogPage.fillDescription('Final Version');
        await taskDialogPage.submitForm();

        // Verify final state
        const task = await apiHelper.getTask(createdTask.id);
        expect(task.description).toBe('Final Version');
    });

    test('should reflect edits immediately in UI', async ({ page }) => {
        const taskTitle = 'Immediate Update Test';
        const newTitle = 'Updated Immediately';

        // Create task
        await apiHelper.createTask({
            title: taskTitle,
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Edit
        await backlogPage.openTaskDetails(taskTitle);
        await taskDialogPage.fillTitle(newTitle);
        await taskDialogPage.submitForm();

        // New title should appear within 2 seconds
        await expect(backlogPage.getTaskByTitle(newTitle)).toBeVisible({ timeout: 2000 });
    });

    test('should handle concurrent edits gracefully', async ({ page }) => {
        // This test simulates editing the same task through UI
        // while backend data might be changing
        const taskTitle = 'Concurrent Edit Test';

        // Create task
        const createdTask = await apiHelper.createTask({
            title: taskTitle,
            description: 'Original',
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Open task in UI
        await backlogPage.openTaskDetails(taskTitle);

        // Update via API while dialog is open
        await apiHelper.updateTask(createdTask.id, {
            description: 'Changed via API',
        });

        // Make edit in UI
        await taskDialogPage.fillDescription('Changed via UI');
        await taskDialogPage.submitForm();

        // UI edit should win (last write wins)
        const task = await apiHelper.getTask(createdTask.id);
        expect(task.description).toBe('Changed via UI');
    });

    test('should clear description when editing to empty', async ({ page }) => {
        const taskTitle = 'Task with Description to Clear';

        // Create task with description
        const createdTask = await apiHelper.createTask({
            title: taskTitle,
            description: 'This will be cleared',
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Edit and clear description
        await backlogPage.openTaskDetails(taskTitle);
        await taskDialogPage.getDescriptionInput().clear();
        await taskDialogPage.submitForm();

        // Verify description cleared
        const task = await apiHelper.getTask(createdTask.id);
        expect(task.description).toBe('');
    });
});
