import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type { Subtask, CreateSubtaskDto, UpdateSubtaskDto, ReorderSubtaskDto } from '../models/subtask.model';
import { environment } from '../../environments/environment';

/**
 * SubtaskApiService
 *
 * Handles all HTTP communication with the backend Subtasks API.
 * Provides type-safe CRUD operations with proper error handling.
 *
 * Endpoints:
 * - GET    /api/tasks/:taskId/subtasks       - List subtasks for a task
 * - POST   /api/tasks/:taskId/subtasks       - Create new subtask
 * - PATCH  /api/subtasks/:id                 - Update subtask (partial)
 * - DELETE /api/subtasks/:id                 - Delete subtask
 * - PATCH  /api/subtasks/:id/reorder         - Reorder subtask position
 */
@Injectable({
    providedIn: 'root'
})
export class SubtaskApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    /**
     * Get all subtasks for a specific task.
     *
     * @param taskId - Parent task ID
     * @returns Observable of Subtask array ordered by position
     */
    getSubtasks(taskId: number): Observable<Subtask[]> {
        return this.http.get<Subtask[]>(`${this.baseUrl}/tasks/${taskId}/subtasks`).pipe(
            map(subtasks => this.deserializeSubtasks(subtasks)),
            catchError(error => this.handleError(error, 'fetching subtasks'))
        );
    }

    /**
     * Create a new subtask for a task.
     *
     * @param taskId - Parent task ID
     * @param dto - Subtask data (title is required)
     * @returns Observable of created Subtask
     */
    createSubtask(taskId: number, dto: CreateSubtaskDto): Observable<Subtask> {
        return this.http.post<Subtask>(`${this.baseUrl}/tasks/${taskId}/subtasks`, dto).pipe(
            map(subtask => this.deserializeSubtask(subtask)),
            catchError(error => this.handleError(error, 'creating subtask'))
        );
    }

    /**
     * Update an existing subtask (partial update).
     *
     * @param id - Subtask ID
     * @param dto - Fields to update (all optional)
     * @returns Observable of updated Subtask
     * @throws 404 if subtask not found
     */
    updateSubtask(id: number, dto: UpdateSubtaskDto): Observable<Subtask> {
        return this.http.patch<Subtask>(`${this.baseUrl}/subtasks/${id}`, dto).pipe(
            map(subtask => this.deserializeSubtask(subtask)),
            catchError(error => this.handleError(error, 'updating subtask'))
        );
    }

    /**
     * Delete a subtask.
     *
     * @param id - Subtask ID
     * @returns Observable that completes when deletion succeeds
     * @throws 404 if subtask not found
     */
    deleteSubtask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/subtasks/${id}`).pipe(
            catchError(error => this.handleError(error, 'deleting subtask'))
        );
    }

    /**
     * Reorder a subtask to a new position.
     *
     * @param id - Subtask ID
     * @param dto - New position data
     * @returns Observable of updated Subtask
     * @throws 404 if subtask not found
     */
    reorderSubtask(id: number, dto: ReorderSubtaskDto): Observable<Subtask> {
        return this.http.patch<Subtask>(`${this.baseUrl}/subtasks/${id}/reorder`, dto).pipe(
            map(subtask => this.deserializeSubtask(subtask)),
            catchError(error => this.handleError(error, 'reordering subtask'))
        );
    }

    /**
     * Convert date strings from API to Date objects.
     * Backend returns ISO strings, frontend uses Date objects.
     */
    private deserializeSubtask(subtask: any): Subtask {
        return {
            ...subtask,
            createdAt: new Date(subtask.createdAt),
            updatedAt: new Date(subtask.updatedAt)
        };
    }

    /**
     * Deserialize array of subtasks.
     */
    private deserializeSubtasks(subtasks: any[]): Subtask[] {
        return subtasks.map(subtask => this.deserializeSubtask(subtask));
    }

    /**
     * Centralized error handling with user-friendly messages.
     */
    private handleError(error: HttpErrorResponse, operation: string): Observable<never> {
        let errorMessage = `Error ${operation}`;

        if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            errorMessage = `Network error: ${error.error.message}`;
        } else {
            // Backend error
            switch (error.status) {
                case 400:
                    errorMessage = `Invalid request: ${error.error.message || 'Please check your input'}`;
                    break;
                case 404:
                    errorMessage = 'Subtask not found';
                    break;
                case 500:
                    errorMessage = 'Server error: Please try again later';
                    break;
                default:
                    errorMessage = `Error ${operation}: ${error.message}`;
            }
        }

        console.error(`[SubtaskApiService] ${errorMessage}`, error);
        return throwError(() => new Error(errorMessage));
    }
}
