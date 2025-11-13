import { Injectable, signal, computed, inject } from '@angular/core';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskFilters } from '../models';
import { TaskStatus } from '../models/task-status.enum';
import { Workspace } from '../models/workspace.enum';
import { TaskApiService } from './task-api.service';

/**
 * TaskStateService
 *
 * Centralized reactive state management for tasks using Angular signals.
 * Manages the task list, loading/error states, and workspace selection.
 * Integrates with TaskApiService for backend communication.
 *
 * Signal-based architecture:
 * - Base signals: tasks, loading, error, selectedWorkspace
 * - Computed signals: Filtered views (backlogTasks, todayTasks, etc.)
 */
@Injectable({
    providedIn: 'root'
})
export class TaskStateService {
    private readonly taskApiService = inject(TaskApiService);

    // Base signals
    private readonly tasksSignal = signal<Task[]>([]);
    private readonly loadingSignal = signal<boolean>(false);
    private readonly errorSignal = signal<string | null>(null);
    private readonly selectedWorkspaceSignal = signal<Workspace>(Workspace.PERSONAL);

    // Readonly accessors
    readonly tasks = this.tasksSignal.asReadonly();
    readonly loading = this.loadingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();
    readonly selectedWorkspace = this.selectedWorkspaceSignal.asReadonly();

    // Computed signals - Status-based views
    readonly backlogTasks = computed(() =>
        this.tasksSignal().filter(t => t.status === TaskStatus.BACKLOG)
    );

    readonly todayTasks = computed(() =>
        this.tasksSignal().filter(t => t.status === TaskStatus.TODAY)
    );

    readonly inProgressTasks = computed(() =>
        this.tasksSignal().filter(t => t.status === TaskStatus.IN_PROGRESS)
    );

    readonly doneTasks = computed(() =>
        this.tasksSignal().filter(t => t.status === TaskStatus.DONE)
    );

    // Computed signals - Workspace-based views
    readonly workTasks = computed(() =>
        this.tasksSignal().filter(t => t.workspace === Workspace.WORK)
    );

    readonly personalTasks = computed(() =>
        this.tasksSignal().filter(t => t.workspace === Workspace.PERSONAL)
    );

    // Computed signal - Current workspace tasks
    readonly currentWorkspaceTasks = computed(() =>
        this.tasksSignal().filter(t => t.workspace === this.selectedWorkspaceSignal())
    );

    /**
     * Load tasks from the API with optional filters.
     * Updates loading and error states automatically.
     *
     * @param filters - Optional filters for status, workspace, or channelId
     */
    loadTasks(filters?: TaskFilters): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.taskApiService.getTasks(filters).subscribe({
            next: (tasks) => {
                this.tasksSignal.set(tasks);
                this.loadingSignal.set(false);
            },
            error: (error) => {
                console.error('[TaskStateService] Error loading tasks:', error);
                this.errorSignal.set(error.message || 'Failed to load tasks');
                this.loadingSignal.set(false);
            }
        });
    }

    /**
     * Create a new task and add to state.
     * Updates loading and error states automatically.
     *
     * @param dto - Task creation data
     */
    addTask(dto: CreateTaskDto): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.taskApiService.createTask(dto).subscribe({
            next: (task) => {
                this.tasksSignal.update(tasks => [...tasks, task]);
                this.loadingSignal.set(false);
            },
            error: (error) => {
                console.error('[TaskStateService] Error creating task:', error);
                this.errorSignal.set(error.message || 'Failed to create task');
                this.loadingSignal.set(false);
            }
        });
    }

    /**
     * Update an existing task.
     * Updates loading and error states automatically.
     *
     * @param id - Task ID
     * @param dto - Fields to update
     */
    updateTask(id: number, dto: UpdateTaskDto): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.taskApiService.updateTask(id, dto).subscribe({
            next: (updatedTask) => {
                this.tasksSignal.update(tasks =>
                    tasks.map(t => t.id === id ? updatedTask : t)
                );
                this.loadingSignal.set(false);
            },
            error: (error) => {
                console.error('[TaskStateService] Error updating task:', error);
                this.errorSignal.set(error.message || 'Failed to update task');
                this.loadingSignal.set(false);
            }
        });
    }

    /**
     * Update a task's status (common operation for drag-and-drop).
     *
     * @param id - Task ID
     * @param status - New status
     */
    updateTaskStatus(id: number, status: TaskStatus): void {
        this.updateTask(id, { status });
    }

    /**
     * Delete a task and remove from state.
     * Updates loading and error states automatically.
     *
     * @param id - Task ID
     */
    removeTask(id: number): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.taskApiService.deleteTask(id).subscribe({
            next: () => {
                this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
                this.loadingSignal.set(false);
            },
            error: (error) => {
                console.error('[TaskStateService] Error deleting task:', error);
                this.errorSignal.set(error.message || 'Failed to delete task');
                this.loadingSignal.set(false);
            }
        });
    }

    /**
     * Set the selected workspace.
     * Use this to switch between WORK and PERSONAL views.
     *
     * @param workspace - Workspace to select
     */
    setSelectedWorkspace(workspace: Workspace): void {
        this.selectedWorkspaceSignal.set(workspace);
    }

    /**
     * Manually set tasks (useful for testing or optimistic updates).
     *
     * @param tasks - Task array to set
     */
    setTasks(tasks: Task[]): void {
        this.tasksSignal.set(tasks);
    }

    /**
     * Clear error message.
     */
    clearError(): void {
        this.errorSignal.set(null);
    }
}
