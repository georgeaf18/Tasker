import type { Page, Locator } from '@playwright/test';

/**
 * AppPage - Main application page object
 * Handles navigation and workspace filtering controls
 */
export class AppPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the application root
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    // Wait for the app to be fully loaded
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get workspace toggle button by workspace name
   * NOTE: Component needs data-testid="workspace-toggle-work" and data-testid="workspace-toggle-personal"
   * @param workspace - 'Work' or 'Personal'
   * @returns Locator for the workspace toggle button
   */
  getWorkspaceToggle(workspace: 'Work' | 'Personal'): Locator {
    const testId =
      workspace === 'Work'
        ? 'workspace-toggle-work'
        : 'workspace-toggle-personal';
    return this.page.getByTestId(testId);
  }

  /**
   * Check if workspace filter is currently active
   * NOTE: Assumes active state is indicated by aria-pressed="true" or similar attribute
   * @param workspace - 'Work' or 'Personal'
   * @returns True if workspace is active
   */
  async isWorkspaceActive(workspace: 'Work' | 'Personal'): Promise<boolean> {
    const toggle = this.getWorkspaceToggle(workspace);
    const ariaPressed = await toggle.getAttribute('aria-pressed');
    return ariaPressed === 'true';
  }

  /**
   * Click workspace toggle to filter tasks
   * @param workspace - 'Work' or 'Personal'
   */
  async clickWorkspaceToggle(workspace: 'Work' | 'Personal'): Promise<void> {
    await this.getWorkspaceToggle(workspace).click();
    // Wait for UI to update
    await this.page.waitForTimeout(300);
  }

  /**
   * Get the main content area
   */
  getMainContent(): Locator {
    return this.page.locator('main, [role="main"]').first();
  }

  /**
   * Wait for application to be fully loaded and ready
   */
  async waitForAppReady(): Promise<void> {
    // Wait for Angular to bootstrap and data to load
    await this.page.waitForLoadState('networkidle');
    // Additional wait for any initial API calls
    await this.page.waitForTimeout(500);
  }
}
