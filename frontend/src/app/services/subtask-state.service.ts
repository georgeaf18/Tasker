import { Injectable, signal, computed, inject } from '@angular/core';
import type { Subtask, CreateSubtaskDto, UpdateSubtaskDto, ReorderSubtaskDto } from '../models/subtask.model';
import { SubtaskStatus } from '../models/subtask.model';
import { SubtaskApiService } from './subtask-api.service';
import { NotificationService } from './notification.service';

/**
 * SubtaskStateService
 *
 * Centralized reactive state management for subtasks using Angular signals.
 * Manages subtask lists per task, loading/error states, and provides filtered views.
 * Integrates with SubtaskApiService for backend communication.
 *
 * Signal-based architecture:
 * - Base signals: subtasksMap (Map<taskId, Subtask[]>), loading, error
 * - Computed signals: Dynamic getters for filtered views by task and status
 *
 * State structure:
 * - Subtasks are stored in a Map keyed by taskId
 * - Each task's subtasks are ordered by position
 * - Supports multiple tasks with independent subtask lists
 */
@Injectable({
    providedIn: 'root'
})
export class SubtaskStateService {
    private readonly subtaskApiService = inject(SubtaskApiService);
    private readonly notificationService = inject(NotificationService);

    // Base signals - Use Map to store subtasks per task
    private readonly subtasksMapSignal = signal<Map<number, Subtask[]>>(new Map());
    private readonly loadingSignal = signal<boolean>(false);
    private readonly errorSignal = signal<string | null>(null);

    // Readonly accessors
    readonly loading = this.loadingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    /**
     * Get subtasks for a specific task.
     * Returns a computed signal that reactively updates when the subtasks map changes.
     *
     * @param taskId - Task ID to get subtasks for
     * @returns Computed signal containing array of subtasks ordered by position
     */
    getSubtasksForTask(taskId: number) {
        return computed(() => {
            const subtasks = this.subtasksMapSignal().get(taskId) || [];
            return [...subtasks].sort((a, b) => a.position - b.position);
        });
    }

    /**
     * Get subtasks for a specific task filtered by status.
     * Returns a computed signal that reactively updates.
     *
     * @param taskId - Task ID to get subtasks for
     * @param status - Status to filter by
     * @returns Computed signal containing filtered and ordered subtasks
     */
    getSubtasksByStatus(taskId: number, status: SubtaskStatus) {
        return computed(() => {
            const subtasks = this.subtasksMapSignal().get(taskId) || [];
            return subtasks
                .filter(s => s.status === status)
                .sort((a, b) => a.position - b.position);
        });
    }

    /**
     * Load subtasks from the API for a specific task.
     * Updates loading and error states automatically.
     *
     * @param taskId - Task ID to load subtasks for
     */
    loadSubtasks(taskId: number): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.subtaskApiService.getSubtasks(taskId).subscribe({
            next: (subtasks) => {
                this.subtasksMapSignal.update(map => {
                    const newMap = new Map(map);
                    newMap.set(taskId, subtasks);
                    return newMap;
                });
                this.loadingSignal.set(false);
            },
            error: (error) => {
                console.error('[SubtaskStateService] Error loading subtasks:', error);
                this.errorSignal.set(error.message || 'Failed to load subtasks');
                this.loadingSignal.set(false);
            }
        });
    }

    /**
     * Create a new subtask and add to state.
     * Updates loading and error states automatically.
     *
     * @param taskId - Parent task ID
     * @param dto - Subtask creation data
     */
    addSubtask(taskId: number, dto: CreateSubtaskDto): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.subtaskApiService.createSubtask(taskId, dto).subscribe({
            next: (subtask) => {
                this.subtasksMapSignal.update(map => {
                    const newMap = new Map(map);
                    const existingSubtasks = newMap.get(taskId) || [];
                    newMap.set(taskId, [...existingSubtasks, subtask]);
                    return newMap;
                });
                this.loadingSignal.set(false);
                this.notificationService.show('Subtask created', 'success');
            },
            error: (error) => {
                console.error('[SubtaskStateService] Error creating subtask:', error);
                this.errorSignal.set(error.message || 'Failed to create subtask');
                this.loadingSignal.set(false);
                this.notificationService.show('Failed to create subtask', 'error');
            }
        });
    }

    /**
     * Update an existing subtask.
     * Updates loading and error states automatically.
     *
     * @param taskId - Parent task ID (needed to update correct map entry)
     * @param subtaskId - Subtask ID
     * @param dto - Fields to update
     */
    updateSubtask(taskId: number, subtaskId: number, dto: UpdateSubtaskDto): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.subtaskApiService.updateSubtask(subtaskId, dto).subscribe({
            next: (updatedSubtask) => {
                this.subtasksMapSignal.update(map => {
                    const newMap = new Map(map);
                    const subtasks = newMap.get(taskId) || [];
                    const updatedSubtasks = subtasks.map(s =>
                        s.id === subtaskId ? updatedSubtask : s
                    );
                    newMap.set(taskId, updatedSubtasks);
                    return newMap;
                });
                this.loadingSignal.set(false);
                this.notificationService.show('Subtask updated', 'success');
            },
            error: (error) => {
                console.error('[SubtaskStateService] Error updating subtask:', error);
                this.errorSignal.set(error.message || 'Failed to update subtask');
                this.loadingSignal.set(false);
                this.notificationService.show('Failed to update subtask', 'error');
            }
        });
    }

    /**
     * Update a subtask's status (common operation for drag-and-drop).
     *
     * @param taskId - Parent task ID
     * @param subtaskId - Subtask ID
     * @param status - New status
     */
    updateSubtaskStatus(taskId: number, subtaskId: number, status: SubtaskStatus): void {
        this.updateSubtask(taskId, subtaskId, { status });
    }

    /**
     * Delete a subtask and remove from state.
     * Updates loading and error states automatically.
     *
     * @param taskId - Parent task ID (needed to update correct map entry)
     * @param subtaskId - Subtask ID
     */
    removeSubtask(taskId: number, subtaskId: number): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.subtaskApiService.deleteSubtask(subtaskId).subscribe({
            next: () => {
                this.subtasksMapSignal.update(map => {
                    const newMap = new Map(map);
                    const subtasks = newMap.get(taskId) || [];
                    const filteredSubtasks = subtasks.filter(s => s.id !== subtaskId);
                    newMap.set(taskId, filteredSubtasks);
                    return newMap;
                });
                this.loadingSignal.set(false);
                this.notificationService.show('Subtask deleted', 'success');
            },
            error: (error) => {
                console.error('[SubtaskStateService] Error deleting subtask:', error);
                this.errorSignal.set(error.message || 'Failed to delete subtask');
                this.loadingSignal.set(false);
                this.notificationService.show('Failed to delete subtask', 'error');
            }
        });
    }

    /**
     * Reorder a subtask to a new position.
     * Updates loading and error states automatically.
     *
     * @param taskId - Parent task ID
     * @param subtaskId - Subtask ID
     * @param dto - New position data
     */
    reorderSubtasks(taskId: number, subtaskId: number, dto: ReorderSubtaskDto): void {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.subtaskApiService.reorderSubtask(subtaskId, dto).subscribe({
            next: (updatedSubtask) => {
                this.subtasksMapSignal.update(map => {
                    const newMap = new Map(map);
                    const subtasks = newMap.get(taskId) || [];
                    const updatedSubtasks = subtasks.map(s =>
                        s.id === subtaskId ? updatedSubtask : s
                    );
                    newMap.set(taskId, updatedSubtasks);
                    return newMap;
                });
                this.loadingSignal.set(false);
                this.notificationService.show('Subtask reordered', 'success');
            },
            error: (error) => {
                console.error('[SubtaskStateService] Error reordering subtask:', error);
                this.errorSignal.set(error.message || 'Failed to reorder subtask');
                this.loadingSignal.set(false);
                this.notificationService.show('Failed to reorder subtask', 'error');
            }
        });
    }

    /**
     * Manually set subtasks for a task (useful for testing or optimistic updates).
     *
     * @param taskId - Task ID
     * @param subtasks - Subtask array to set
     */
    setSubtasks(taskId: number, subtasks: Subtask[]): void {
        this.subtasksMapSignal.update(map => {
            const newMap = new Map(map);
            newMap.set(taskId, subtasks);
            return newMap;
        });
    }

    /**
     * Clear all subtasks for a specific task.
     *
     * @param taskId - Task ID to clear subtasks for
     */
    clearSubtasksForTask(taskId: number): void {
        this.subtasksMapSignal.update(map => {
            const newMap = new Map(map);
            newMap.delete(taskId);
            return newMap;
        });
    }

    /**
     * Clear error message.
     */
    clearError(): void {
        this.errorSignal.set(null);
    }
}
