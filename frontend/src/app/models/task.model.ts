import { Workspace } from './workspace.enum';
import { TaskStatus } from './task-status.enum';
import { Channel } from './channel.model';

/**
 * Task represents a single work item in the system.
 * Tasks move through different statuses from BACKLOG to DONE.
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  workspace: Workspace;
  channelId: number | null;
  channel?: Channel;
  status: TaskStatus;
  dueDate: Date | null;
  isRoutine: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  workspace: Workspace;
  channelId?: number;
  status?: TaskStatus;
  dueDate?: Date;
  isRoutine?: boolean;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  workspace?: Workspace;
  channelId?: number;
  status?: TaskStatus;
  dueDate?: Date;
  isRoutine?: boolean;
}

export interface TaskFilters {
  workspace?: Workspace;
  status?: TaskStatus;
  channelId?: number;
}

// Re-export enums for convenience
export { Workspace } from './workspace.enum';
export { TaskStatus } from './task-status.enum';
