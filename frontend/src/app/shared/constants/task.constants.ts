import { TaskStatus, Workspace } from '../../models';

/**
 * Shared constants for task-related components
 * Consolidates duplicate option arrays from kanban-board and backlog-sidebar
 */

export const STATUS_OPTIONS = [
  { label: 'Backlog', value: TaskStatus.BACKLOG },
  { label: 'Today', value: TaskStatus.TODAY },
  { label: 'In Progress', value: TaskStatus.IN_PROGRESS },
  { label: 'Done', value: TaskStatus.DONE },
] as const;

export const WORKSPACE_OPTIONS = [
  { label: 'Work', value: Workspace.WORK },
  { label: 'Personal', value: Workspace.PERSONAL },
] as const;
