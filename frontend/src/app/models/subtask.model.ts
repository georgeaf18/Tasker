/**
 * Subtask Status Enum
 * Represents the workflow stages for a subtask.
 */
export enum SubtaskStatus {
    TODO = 'TODO',
    DOING = 'DOING',
    DONE = 'DONE'
}

/**
 * Subtask represents a smaller work item within a Task.
 * Subtasks help break down complex tasks into manageable pieces.
 */
export interface Subtask {
    id: number;
    title: string;
    description: string | null;
    taskId: number;
    status: SubtaskStatus;
    position: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * DTO for creating a new subtask
 * Note: description and status must be set via UPDATE after creation
 */
export interface CreateSubtaskDto {
    title: string;
    position?: number;
}

/**
 * DTO for updating an existing subtask (all fields optional)
 */
export interface UpdateSubtaskDto {
    title?: string;
    description?: string;
    status?: SubtaskStatus;
    position?: number;
}

/**
 * DTO for reordering a subtask
 */
export interface ReorderSubtaskDto {
    position: number;
}
