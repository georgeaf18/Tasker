import { Injectable } from '@angular/core';
import { Channel, Workspace } from '../../models';

/**
 * TaskUtilsService
 *
 * Shared utility methods for task-related operations.
 * Consolidates duplicate logic from kanban-board and backlog-sidebar components.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskUtilsService {
  /**
   * Format a date string into a human-readable format
   * Returns "Today", "Tomorrow", or a formatted date (e.g., "Dec 31")
   */
  formatDate(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }

  /**
   * Get channel name from channel ID
   * Returns null if channel ID is not found
   */
  getChannelName(
    channelId: number | null | undefined,
    channels: Channel[],
  ): string | null {
    if (!channelId) return null;
    const channel = channels.find((c) => c.id === channelId);
    return channel?.name || null;
  }

  /**
   * Get PrimeNG severity level for workspace tag
   */
  getWorkspaceSeverity(workspace: Workspace): 'success' | 'info' {
    return workspace === Workspace.WORK ? 'success' : 'info';
  }

  /**
   * Get workspace color
   */
  getWorkspaceColor(workspace: Workspace): string {
    return workspace === Workspace.WORK ? '#F97316' : '#14B8A6';
  }
}
