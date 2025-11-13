import type { Page, Locator } from '@playwright/test';

type ColumnStatus = 'Today' | 'In Progress' | 'Done';

/**
 * KanbanPage - Kanban board page object
 * Handles kanban columns and task movement
 */
export class KanbanPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Get a kanban column by status
     * NOTE: Component needs:
     * - data-testid="kanban-column-today"
     * - data-testid="kanban-column-in-progress"
     * - data-testid="kanban-column-done"
     * @param status - Column status
     * @returns Locator for the column
     */
    getColumn(status: ColumnStatus): Locator {
        const testIdMap = {
            'Today': 'kanban-column-today',
            'In Progress': 'kanban-column-in-progress',
            'Done': 'kanban-column-done',
        };
        return this.page.getByTestId(testIdMap[status]);
    }

    /**
     * Get all tasks within a specific column
     * @param status - Column status
     * @returns Locator for tasks in the column
     */
    getTasksInColumn(status: ColumnStatus): Locator {
        return this.getColumn(status).locator('[data-testid^="task-card-"]');
    }

    /**
     * Get count of tasks in a column
     * @param status - Column status
     * @returns Number of tasks
     */
    async getTaskCountInColumn(status: ColumnStatus): Promise<number> {
        return await this.getTasksInColumn(status).count();
    }

    /**
     * Get a specific task in a column by title
     * @param status - Column status
     * @param title - Task title
     * @returns Locator for the task
     */
    getTaskInColumn(status: ColumnStatus, title: string): Locator {
        return this.getColumn(status).locator('[data-testid^="task-card-"]', { hasText: title });
    }

    /**
     * Check if a task exists in a specific column
     * @param status - Column status
     * @param title - Task title
     * @returns True if task exists in column
     */
    async hasTaskInColumn(status: ColumnStatus, title: string): Promise<boolean> {
        return await this.getTaskInColumn(status, title).count() > 0;
    }

    /**
     * Open task details by clicking on a task in a column
     * @param status - Column status
     * @param title - Task title
     */
    async openTaskDetails(status: ColumnStatus, title: string): Promise<void> {
        await this.getTaskInColumn(status, title).click();
        // Wait for dialog to appear
        await this.page.waitForSelector('[role="dialog"]', { state: 'visible' });
    }

    /**
     * Get the daily progress percentage
     * NOTE: Component needs data-testid="daily-progress-bar" on progress bar
     * @returns Progress percentage (0-100)
     */
    async getDailyProgressPercentage(): Promise<number> {
        const progressBar = this.page.getByTestId('daily-progress-bar');
        const ariaValueNow = await progressBar.getAttribute('aria-valuenow');

        if (ariaValueNow) {
            return parseInt(ariaValueNow, 10);
        }

        // Fallback: try to parse from text content
        const text = await progressBar.textContent();
        const match = text?.match(/(\d+)%/);
        return match ? parseInt(match[1], 10) : 0;
    }

    /**
     * Get the daily progress bar element
     */
    getDailyProgressBar(): Locator {
        return this.page.getByTestId('daily-progress-bar');
    }

    /**
     * Wait for a task to appear in a specific column
     * Useful after drag-and-drop or status updates
     * @param status - Column status
     * @param title - Task title
     * @param timeout - Maximum wait time in ms
     */
    async waitForTaskInColumn(
        status: ColumnStatus,
        title: string,
        timeout = 5000
    ): Promise<void> {
        await this.getTaskInColumn(status, title).waitFor({
            state: 'visible',
            timeout
        });
    }

    /**
     * Wait for a task to disappear from a specific column
     * @param status - Column status
     * @param title - Task title
     * @param timeout - Maximum wait time in ms
     */
    async waitForTaskNotInColumn(
        status: ColumnStatus,
        title: string,
        timeout = 5000
    ): Promise<void> {
        await this.getTaskInColumn(status, title).waitFor({
            state: 'hidden',
            timeout
        });
    }

    /**
     * Get all column headers
     */
    getColumnHeaders(): Locator {
        return this.page.locator('.kanban-column-header, [data-testid^="kanban-column-"]').locator('h2, h3, .column-title');
    }

    /**
     * Verify kanban board is visible and loaded
     */
    async isVisible(): Promise<boolean> {
        const board = this.page.locator('app-kanban-board');
        return await board.isVisible();
    }

    /**
     * Get the entire kanban board container
     */
    getBoard(): Locator {
        return this.page.locator('app-kanban-board');
    }
}
