import type { Page, Locator } from '@playwright/test';

/**
 * TaskDialogPage - Task creation and edit dialog page object
 * Handles task form interactions and dialog actions
 */
export class TaskDialogPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Get the dialog container
     */
    getDialog(): Locator {
        return this.page.locator('[role="dialog"]').first();
    }

    /**
     * Wait for dialog to be visible
     */
    async waitForDialog(): Promise<void> {
        await this.getDialog().waitFor({ state: 'visible' });
    }

    /**
     * Get the title input field
     * NOTE: Component needs data-testid="task-title-input"
     */
    getTitleInput(): Locator {
        return this.page.getByTestId('task-title-input');
    }

    /**
     * Get the description textarea
     * NOTE: Component needs data-testid="task-description-input"
     */
    getDescriptionInput(): Locator {
        return this.page.getByTestId('task-description-input');
    }

    /**
     * Get the workspace dropdown
     * NOTE: Component needs data-testid="task-workspace-select"
     */
    getWorkspaceSelect(): Locator {
        return this.page.getByTestId('task-workspace-select');
    }

    /**
     * Get the channel dropdown
     * NOTE: Component needs data-testid="task-channel-select"
     */
    getChannelSelect(): Locator {
        return this.page.getByTestId('task-channel-select');
    }

    /**
     * Get the submit button
     * NOTE: Component needs data-testid="task-submit-button"
     */
    getSubmitButton(): Locator {
        return this.page.getByTestId('task-submit-button');
    }

    /**
     * Get the cancel button
     * NOTE: Component needs data-testid="task-cancel-button"
     */
    getCancelButton(): Locator {
        return this.page.getByTestId('task-cancel-button');
    }

    /**
     * Get the delete button (only in edit mode)
     * NOTE: Component needs data-testid="task-delete-button"
     */
    getDeleteButton(): Locator {
        return this.page.getByTestId('task-delete-button');
    }

    /**
     * Fill in the task title
     * @param title - Task title
     */
    async fillTitle(title: string): Promise<void> {
        await this.getTitleInput().fill(title);
    }

    /**
     * Fill in the task description
     * @param description - Task description
     */
    async fillDescription(description: string): Promise<void> {
        await this.getDescriptionInput().fill(description);
    }

    /**
     * Select a workspace from dropdown
     * @param workspace - 'WORK' or 'PERSONAL'
     */
    async selectWorkspace(workspace: 'WORK' | 'PERSONAL'): Promise<void> {
        const select = this.getWorkspaceSelect();
        await select.click();

        // PrimeNG dropdown - wait for overlay
        await this.page.waitForSelector('.p-select-overlay', { state: 'visible' });

        // Click the option
        const label = workspace === 'WORK' ? 'Work' : 'Personal';
        await this.page.locator('.p-select-option', { hasText: label }).click();
    }

    /**
     * Select a channel from dropdown
     * @param channelName - Channel name
     */
    async selectChannel(channelName: string): Promise<void> {
        const select = this.getChannelSelect();
        await select.click();

        // PrimeNG dropdown - wait for overlay
        await this.page.waitForSelector('.p-select-overlay', { state: 'visible' });

        // Click the option
        await this.page.locator('.p-select-option', { hasText: channelName }).click();
    }

    /**
     * Fill out complete task form
     * @param taskData - Task form data
     */
    async fillTaskForm(taskData: {
        title: string;
        description?: string;
        workspace?: 'WORK' | 'PERSONAL';
        channel?: string;
    }): Promise<void> {
        await this.fillTitle(taskData.title);

        if (taskData.description) {
            await this.fillDescription(taskData.description);
        }

        if (taskData.workspace) {
            await this.selectWorkspace(taskData.workspace);
        }

        if (taskData.channel) {
            await this.selectChannel(taskData.channel);
        }
    }

    /**
     * Submit the task form
     */
    async submitForm(): Promise<void> {
        await this.getSubmitButton().click();
        // Wait for dialog to close
        await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    }

    /**
     * Cancel the task form
     */
    async cancel(): Promise<void> {
        await this.getCancelButton().click();
        // Wait for dialog to close
        await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    }

    /**
     * Click the delete button
     */
    async clickDelete(): Promise<void> {
        await this.getDeleteButton().click();
        // Wait for confirmation dialog to appear
        await this.page.waitForTimeout(300);
    }

    /**
     * Confirm deletion in confirmation dialog
     * NOTE: Component needs data-testid="confirm-delete-button"
     */
    async confirmDelete(): Promise<void> {
        const confirmButton = this.page.getByTestId('confirm-delete-button');
        await confirmButton.click();
        // Wait for confirmation dialog and main dialog to close
        await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    }

    /**
     * Cancel deletion in confirmation dialog
     * NOTE: Component needs data-testid="cancel-delete-button"
     */
    async cancelDelete(): Promise<void> {
        const cancelButton = this.page.getByTestId('cancel-delete-button');
        await cancelButton.click();
    }

    /**
     * Complete delete flow (click delete + confirm)
     */
    async deleteTask(): Promise<void> {
        await this.clickDelete();
        await this.confirmDelete();
    }

    /**
     * Check if dialog is currently visible
     */
    async isVisible(): Promise<boolean> {
        return await this.getDialog().isVisible();
    }

    /**
     * Get current title value
     */
    async getTitleValue(): Promise<string> {
        return await this.getTitleInput().inputValue();
    }

    /**
     * Get current description value
     */
    async getDescriptionValue(): Promise<string> {
        return await this.getDescriptionInput().inputValue();
    }

    /**
     * Move task to different status (for edit dialog)
     * NOTE: Component needs data-testid="move-to-{status}-button"
     * @param status - Target status
     */
    async moveToStatus(status: 'TODAY' | 'IN_PROGRESS' | 'DONE'): Promise<void> {
        const testIdMap = {
            'TODAY': 'move-to-today-button',
            'IN_PROGRESS': 'move-to-in-progress-button',
            'DONE': 'move-to-done-button',
        };

        const button = this.page.getByTestId(testIdMap[status]);
        await button.click();
        // Wait for dialog to close and UI to update
        await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    }
}
