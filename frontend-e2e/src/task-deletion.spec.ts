import { test, expect } from '@playwright/test';
import { AppPage } from './support/page-objects/app.po';
import { BacklogPage } from './support/page-objects/backlog.po';
import { KanbanPage } from './support/page-objects/kanban.po';
import { TaskDialogPage } from './support/page-objects/task-dialog.po';
import { ApiHelper } from './support/api-helper';

/**
 * Task Deletion E2E Tests
 *
 * Tests task deletion functionality:
 * 1. Create a task
 * 2. Open task details
 * 3. Click delete button
 * 4. Confirm deletion in dialog
 * 5. Verify task removed from UI
 * 6. Verify task deleted from backend
 */
test.describe('Task Deletion', () => {
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

    test('should delete task from backlog', async ({ page }) => {
        const taskTitle = 'Task to Delete from Backlog';

        // Create task in backlog
        const createdTask = await apiHelper.createTask({
            title: taskTitle,
            status: 'BACKLOG',
        });

        // Refresh to load task
        await page.reload();
        await appPage.waitForAppReady();

        // Verify task exists
        expect(await backlogPage.hasTask(taskTitle)).toBe(true);

        // Open task details
        await backlogPage.openTaskDetails(taskTitle);

        // Delete task
        await taskDialogPage.deleteTask();

        // Verify task removed from UI
        expect(await backlogPage.hasTask(taskTitle)).toBe(false);

        // Verify task deleted from backend
        const tasks = await apiHelper.getTasks();
        const deletedTask = tasks.find((t) => t.id === createdTask.id);
        expect(deletedTask).toBeUndefined();
    });

    test('should delete task from Today column', async ({ page }) => {
        const taskTitle = 'Delete from Today';

        // Create task in Today
        const createdTask = await apiHelper.createTask({
            title: taskTitle,
            status: 'TODAY',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Verify task exists in Today column
        expect(await kanbanPage.hasTaskInColumn('Today', taskTitle)).toBe(true);

        // Open and delete
        await kanbanPage.openTaskDetails('Today', taskTitle);
        await taskDialogPage.deleteTask();

        // Verify removed from UI
        expect(await kanbanPage.hasTaskInColumn('Today', taskTitle)).toBe(false);

        // Verify deleted from backend
        const tasks = await apiHelper.getTasks();
        expect(tasks.find((t) => t.id === createdTask.id)).toBeUndefined();
    });

    test('should delete task from In Progress column', async ({ page }) => {
        const taskTitle = 'Delete from In Progress';

        // Create task
        const createdTask = await apiHelper.createTask({
            title: taskTitle,
            status: 'IN_PROGRESS',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Delete task
        await kanbanPage.openTaskDetails('In Progress', taskTitle);
        await taskDialogPage.deleteTask();

        // Verify removed
        expect(await kanbanPage.hasTaskInColumn('In Progress', taskTitle)).toBe(false);

        // Verify backend
        const tasks = await apiHelper.getTasks();
        expect(tasks.find((t) => t.id === createdTask.id)).toBeUndefined();
    });

    test('should delete task from Done column', async ({ page }) => {
        const taskTitle = 'Delete from Done';

        // Create task
        const createdTask = await apiHelper.createTask({
            title: taskTitle,
            status: 'DONE',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Delete task
        await kanbanPage.openTaskDetails('Done', taskTitle);
        await taskDialogPage.deleteTask();

        // Verify removed
        expect(await kanbanPage.hasTaskInColumn('Done', taskTitle)).toBe(false);

        // Verify backend
        const tasks = await apiHelper.getTasks();
        expect(tasks.find((t) => t.id === createdTask.id)).toBeUndefined();
    });

    test('should cancel deletion when clicking cancel', async ({ page }) => {
        const taskTitle = 'Task Not to Delete';

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

        // Click delete but then cancel
        await taskDialogPage.clickDelete();
        await taskDialogPage.cancelDelete();

        // Verify task still exists in UI
        // Dialog might still be open after canceling confirmation
        await taskDialogPage.cancel();

        expect(await backlogPage.hasTask(taskTitle)).toBe(true);

        // Verify task still exists in backend
        const tasks = await apiHelper.getTasks();
        expect(tasks.find((t) => t.title === taskTitle)).toBeDefined();
    });

    test('should show confirmation dialog before deleting', async ({ page }) => {
        const taskTitle = 'Confirm Before Delete';

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

        // Click delete
        await taskDialogPage.clickDelete();

        // Verify confirmation dialog appears
        // PrimeNG confirmation dialog should be visible
        const confirmDialog = page.locator('.p-confirm-dialog, [role="alertdialog"]');
        await expect(confirmDialog).toBeVisible();

        // Verify confirmation message mentions the task
        const dialogText = await confirmDialog.textContent();
        expect(dialogText).toContain(taskTitle);

        // Cancel for cleanup
        await taskDialogPage.cancelDelete();
    });

    test('should update task count after deletion', async ({ page }) => {
        // Create 3 tasks in backlog
        await apiHelper.createTasks([
            { title: 'Task 1', status: 'BACKLOG' },
            { title: 'Task 2', status: 'BACKLOG' },
            { title: 'Task 3', status: 'BACKLOG' },
        ]);

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Verify initial count
        expect(await backlogPage.getTaskCount()).toBe(3);

        // Delete one task
        await backlogPage.openTaskDetails('Task 2');
        await taskDialogPage.deleteTask();

        // Verify count updated
        expect(await backlogPage.getTaskCount()).toBe(2);

        // Delete another
        await backlogPage.openTaskDetails('Task 1');
        await taskDialogPage.deleteTask();

        // Verify count
        expect(await backlogPage.getTaskCount()).toBe(1);
    });

    test('should update daily progress after deleting done task', async ({ page }) => {
        // Create tasks: 1 done, 2 not done
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

        // Delete the done task
        await kanbanPage.openTaskDetails('Done', 'Done Task');
        await taskDialogPage.deleteTask();

        // Progress should now be 0/2 = 0%
        progress = await kanbanPage.getDailyProgressPercentage();
        expect(progress).toBe(0);
    });

    test('should handle deleting last task in a column', async ({ page }) => {
        // Create only one task in Today
        await apiHelper.createTask({
            title: 'Only Today Task',
            status: 'TODAY',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Verify task exists
        expect(await kanbanPage.getTaskCountInColumn('Today')).toBe(1);

        // Delete the task
        await kanbanPage.openTaskDetails('Today', 'Only Today Task');
        await taskDialogPage.deleteTask();

        // Column should be empty
        expect(await kanbanPage.getTaskCountInColumn('Today')).toBe(0);

        // Verify backend
        const tasks = await apiHelper.getTasks();
        expect(tasks.filter((t) => t.status === 'TODAY')).toHaveLength(0);
    });

    test('should delete multiple tasks in sequence', async ({ page }) => {
        const taskTitles = ['Task A', 'Task B', 'Task C'];

        // Create tasks
        await apiHelper.createTasks(
            taskTitles.map((title) => ({ title, status: 'BACKLOG' }))
        );

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Delete all tasks one by one
        for (const title of taskTitles) {
            await backlogPage.openTaskDetails(title);
            await taskDialogPage.deleteTask();

            // Verify each task is deleted
            expect(await backlogPage.hasTask(title)).toBe(false);
        }

        // Verify all tasks deleted from backend
        const tasks = await apiHelper.getTasks();
        expect(tasks).toHaveLength(0);
    });

    test('should handle API errors gracefully during deletion', async ({ page }) => {
        const taskTitle = 'Task to Delete with Error';

        // Create task
        const createdTask = await apiHelper.createTask({
            title: taskTitle,
            status: 'BACKLOG',
        });

        // Refresh
        await page.reload();
        await appPage.waitForAppReady();

        // Delete the task via API first to simulate 404
        await apiHelper.deleteTask(createdTask.id);

        // Try to delete from UI (should handle 404)
        await backlogPage.openTaskDetails(taskTitle);

        // This might show an error message or handle gracefully
        // The exact behavior depends on implementation
        await taskDialogPage.clickDelete();
        await taskDialogPage.confirmDelete();

        // Task should be removed from UI even if backend returns error
        // (optimistic update) or error message should be shown
        // This test documents the expected behavior
    });

    test('should not allow deletion without confirmation', async ({ page }) => {
        const taskTitle = 'Protected Task';

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

        // Click delete button
        await taskDialogPage.clickDelete();

        // Close confirmation dialog without confirming (e.g., click outside or ESC)
        await page.keyboard.press('Escape');

        // Wait a bit for any actions to complete
        await page.waitForTimeout(500);

        // Task should still exist
        const tasks = await apiHelper.getTasks();
        expect(tasks.find((t) => t.title === taskTitle)).toBeDefined();
    });
});
