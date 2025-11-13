import { test, expect } from '@playwright/test';
import { AppPage } from './support/page-objects/app.po';
import { BacklogPage } from './support/page-objects/backlog.po';
import { TaskDialogPage } from './support/page-objects/task-dialog.po';
import { ApiHelper } from './support/api-helper';

/**
 * Task Creation Flow E2E Tests
 *
 * Tests the complete task creation flow:
 * 1. Navigate to app
 * 2. Click "+" button in backlog sidebar
 * 3. Fill out task creation form
 * 4. Submit form
 * 5. Verify task appears in backlog
 * 6. Verify task data is correct
 */
test.describe('Task Creation Flow', () => {
    let appPage: AppPage;
    let backlogPage: BacklogPage;
    let taskDialogPage: TaskDialogPage;
    let apiHelper: ApiHelper;

    test.beforeEach(async ({ page }) => {
        // Initialize page objects
        appPage = new AppPage(page);
        backlogPage = new BacklogPage(page);
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
        // Clean up test data and API context
        await apiHelper.clearAllTasks();
        await apiHelper.dispose();
    });

    test('should open task creation dialog when clicking add button', async () => {
        // Click the add task button
        await backlogPage.clickAddTaskButton();

        // Verify dialog is visible
        expect(await taskDialogPage.isVisible()).toBe(true);

        // Verify form fields are present
        await expect(taskDialogPage.getTitleInput()).toBeVisible();
        await expect(taskDialogPage.getDescriptionInput()).toBeVisible();
        await expect(taskDialogPage.getWorkspaceSelect()).toBeVisible();
        await expect(taskDialogPage.getSubmitButton()).toBeVisible();
    });

    test('should create a task with required fields only', async () => {
        const taskTitle = 'Test Task - Required Fields Only';

        // Open task creation dialog
        await backlogPage.clickAddTaskButton();

        // Fill only required fields
        await taskDialogPage.fillTitle(taskTitle);

        // Submit form
        await taskDialogPage.submitForm();

        // Verify task appears in backlog
        expect(await backlogPage.hasTask(taskTitle)).toBe(true);

        // Verify task is visible
        await expect(backlogPage.getTaskByTitle(taskTitle)).toBeVisible();
    });

    test('should create a task with all fields filled', async ({ page }) => {
        const taskData = {
            title: 'Complete E2E Test Task',
            description: 'This task tests the full creation flow with all fields',
            workspace: 'WORK' as const,
        };

        // Open task creation dialog
        await backlogPage.clickAddTaskButton();

        // Fill all form fields
        await taskDialogPage.fillTaskForm(taskData);

        // Wait for API response when submitting
        const responsePromise = page.waitForResponse(
            (response) => response.url().includes('/api/tasks') && response.request().method() === 'POST'
        );

        // Submit form
        await taskDialogPage.submitForm();

        // Wait for API response
        const response = await responsePromise;
        expect(response.ok()).toBe(true);

        // Verify task appears in backlog
        expect(await backlogPage.hasTask(taskData.title)).toBe(true);

        // Verify task data in backend
        const tasks = await apiHelper.getTasks();
        const createdTask = tasks.find((t) => t.title === taskData.title);

        expect(createdTask).toBeDefined();
        expect(createdTask?.title).toBe(taskData.title);
        expect(createdTask?.description).toBe(taskData.description);
        expect(createdTask?.workspace).toBe(taskData.workspace);
        expect(createdTask?.status).toBe('BACKLOG');
    });

    test('should create a Personal workspace task', async () => {
        const taskData = {
            title: 'Personal Task Test',
            description: 'Testing personal workspace',
            workspace: 'PERSONAL' as const,
        };

        // Open task creation dialog
        await backlogPage.clickAddTaskButton();

        // Fill form with Personal workspace
        await taskDialogPage.fillTaskForm(taskData);

        // Submit form
        await taskDialogPage.submitForm();

        // Verify task appears in backlog
        expect(await backlogPage.hasTask(taskData.title)).toBe(true);

        // Verify workspace in backend
        const tasks = await apiHelper.getTasks();
        const createdTask = tasks.find((t) => t.title === taskData.title);

        expect(createdTask?.workspace).toBe('PERSONAL');
    });

    test('should validate required fields', async () => {
        // Open task creation dialog
        await backlogPage.clickAddTaskButton();

        // Try to submit without filling required fields
        await taskDialogPage.getSubmitButton().click();

        // Dialog should still be visible (validation failed)
        expect(await taskDialogPage.isVisible()).toBe(true);

        // Title input should show validation error or be marked invalid
        const titleInput = taskDialogPage.getTitleInput();
        const isInvalid = await titleInput.evaluate((el: HTMLElement) => {
            return el.classList.contains('ng-invalid') ||
                   el.getAttribute('aria-invalid') === 'true' ||
                   el.classList.contains('p-invalid');
        });

        expect(isInvalid).toBe(true);
    });

    test('should cancel task creation without saving', async () => {
        const taskTitle = 'Task That Should Not Be Created';

        // Open task creation dialog
        await backlogPage.clickAddTaskButton();

        // Fill in some data
        await taskDialogPage.fillTitle(taskTitle);

        // Cancel the form
        await taskDialogPage.cancel();

        // Verify dialog is closed
        expect(await taskDialogPage.isVisible()).toBe(false);

        // Verify task was NOT created
        expect(await backlogPage.hasTask(taskTitle)).toBe(false);

        // Verify no task in backend
        const tasks = await apiHelper.getTasks();
        expect(tasks).toHaveLength(0);
    });

    test('should create multiple tasks in sequence', async () => {
        const taskTitles = [
            'First Task',
            'Second Task',
            'Third Task',
        ];

        for (const title of taskTitles) {
            // Open dialog
            await backlogPage.clickAddTaskButton();

            // Fill and submit
            await taskDialogPage.fillTitle(title);
            await taskDialogPage.submitForm();

            // Verify task appears
            expect(await backlogPage.hasTask(title)).toBe(true);
        }

        // Verify all tasks exist
        const tasks = await apiHelper.getTasks();
        expect(tasks).toHaveLength(3);

        // Verify backlog shows all tasks
        const backlogTaskCount = await backlogPage.getTaskCount();
        expect(backlogTaskCount).toBe(3);
    });

    test('should preserve form data when switching workspace', async () => {
        const taskTitle = 'Test Workspace Switch';
        const taskDescription = 'Testing that description persists';

        // Open task creation dialog
        await backlogPage.clickAddTaskButton();

        // Fill title and description
        await taskDialogPage.fillTitle(taskTitle);
        await taskDialogPage.fillDescription(taskDescription);

        // Switch workspace from PERSONAL to WORK
        await taskDialogPage.selectWorkspace('WORK');

        // Verify title and description are still there
        expect(await taskDialogPage.getTitleValue()).toBe(taskTitle);
        expect(await taskDialogPage.getDescriptionValue()).toBe(taskDescription);
    });

    test('should handle task creation with special characters', async () => {
        const taskData = {
            title: 'Task with "quotes" & <special> characters!',
            description: 'Description with\nmultiple\nlines and special chars: @#$%',
        };

        // Open task creation dialog
        await backlogPage.clickAddTaskButton();

        // Fill form
        await taskDialogPage.fillTitle(taskData.title);
        await taskDialogPage.fillDescription(taskData.description);

        // Submit
        await taskDialogPage.submitForm();

        // Verify task created with correct data
        const tasks = await apiHelper.getTasks();
        const createdTask = tasks.find((t) => t.title === taskData.title);

        expect(createdTask).toBeDefined();
        expect(createdTask?.title).toBe(taskData.title);
        expect(createdTask?.description).toBe(taskData.description);
    });

    test('should display newly created task immediately in UI', async ({ page }) => {
        const taskTitle = 'Immediate Display Test';

        // Open dialog
        await backlogPage.clickAddTaskButton();

        // Fill form
        await taskDialogPage.fillTitle(taskTitle);

        // Submit and wait for task to appear
        await taskDialogPage.submitForm();

        // Task should be visible within 2 seconds
        await expect(backlogPage.getTaskByTitle(taskTitle)).toBeVisible({ timeout: 2000 });

        // Verify it's in the correct location (backlog)
        const isInBacklog = await backlogPage.hasTask(taskTitle);
        expect(isInBacklog).toBe(true);
    });
});
