import type { Page, Locator } from '@playwright/test';

/**
 * BacklogPage - Backlog sidebar page object
 * Handles backlog task list and task creation
 */
export class BacklogPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get the add task button in backlog sidebar
   * NOTE: Component needs data-testid="add-task-button"
   * @returns Locator for the add task button
   */
  getAddTaskButton(): Locator {
    return this.page.getByTestId('add-task-button');
  }

  /**
   * Click the add task button to open creation dialog
   */
  async clickAddTaskButton(): Promise<void> {
    await this.getAddTaskButton().click();
    // Wait for dialog to appear
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' });
  }

  /**
   * Get a task card by title in the backlog
   * NOTE: Component needs data-testid="task-card-{id}" on each task card
   * This is a fallback that searches by title text
   * @param title - Task title to find
   * @returns Locator for the task card
   */
  getTaskByTitle(title: string): Locator {
    // Try data-testid first, fallback to text search
    return this.page.locator(`[data-testid^="task-card-"]`, { hasText: title });
  }

  /**
   * Check if a task exists in the backlog by title
   * @param title - Task title to find
   * @returns True if task exists
   */
  async hasTask(title: string): Promise<boolean> {
    return (await this.getTaskByTitle(title).count()) > 0;
  }

  /**
   * Open task details dialog by clicking on a task
   * @param title - Task title to click
   */
  async openTaskDetails(title: string): Promise<void> {
    await this.getTaskByTitle(title).click();
    // Wait for details dialog to appear
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' });
  }

  /**
   * Get all task cards in the backlog
   * NOTE: Component needs data-testid="task-card-{id}" on each task card
   * @returns Locator for all task cards
   */
  getAllTasks(): Locator {
    return this.page.locator('[data-testid^="task-card-"]');
  }

  /**
   * Get count of tasks in backlog
   * @returns Number of tasks
   */
  async getTaskCount(): Promise<number> {
    return await this.getAllTasks().count();
  }

  /**
   * Get task details from card by title
   * @param title - Task title
   * @returns Object with task details visible on card
   */
  async getTaskDetails(title: string): Promise<{
    title: string;
    description?: string;
    workspace?: string;
  }> {
    const taskCard = this.getTaskByTitle(title);
    const titleText = await taskCard
      .locator('[data-testid="task-card-title"]')
      .textContent();

    return {
      title: titleText || '',
      // Additional properties can be extracted as needed
    };
  }

  /**
   * Get the backlog sidebar container
   */
  getBacklogSidebar(): Locator {
    return this.page.locator('app-backlog-sidebar');
  }

  /**
   * Wait for backlog to load with tasks
   * @param timeout - Maximum wait time in ms
   */
  async waitForTasksLoaded(timeout = 5000): Promise<void> {
    await this.page.waitForSelector('[data-testid^="task-card-"]', {
      state: 'attached',
      timeout,
    });
  }

  /**
   * Get workspace section by name
   * @param workspace - 'Work' or 'Personal'
   */
  getWorkspaceSection(workspace: 'Work' | 'Personal'): Locator {
    return this.page.locator('.workspace-section', { hasText: workspace });
  }

  /**
   * Get tasks filtered by workspace in the backlog
   * @param workspace - 'Work' or 'Personal'
   */
  getTasksByWorkspace(workspace: 'Work' | 'Personal'): Locator {
    return this.getWorkspaceSection(workspace).locator(
      '[data-testid^="task-card-"]',
    );
  }
}
