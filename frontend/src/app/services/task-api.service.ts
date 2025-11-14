import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
  Channel,
} from '../models';
import { Workspace, TaskStatus } from '../models';
import { environment } from '../../environments/environment';

/**
 * Raw API response from backend (dates as ISO strings)
 */
interface TaskApiResponse {
  id: number;
  title: string;
  description: string | null;
  workspace: string;
  channelId: number | null;
  channel?: {
    id: number;
    name: string;
    workspace: string;
    color: string | null;
    createdAt: string;
  };
  status: string;
  dueDate: string | null;
  isRoutine: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * TaskApiService
 *
 * Handles all HTTP communication with the backend Tasks API.
 * Provides type-safe CRUD operations with proper error handling.
 *
 * Endpoints:
 * - GET    /api/tasks       - List tasks with optional filters
 * - POST   /api/tasks       - Create new task
 * - GET    /api/tasks/:id   - Get single task
 * - PATCH  /api/tasks/:id   - Update task (partial)
 * - DELETE /api/tasks/:id   - Delete task
 */
@Injectable({
  providedIn: 'root',
})
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  /**
   * Get all tasks with optional filters.
   *
   * @param filters - Optional filters for workspace, status, or channelId
   * @returns Observable of Task array with channel relations
   */
  getTasks(filters?: TaskFilters): Observable<Task[]> {
    let params = new HttpParams();

    if (filters?.workspace) {
      params = params.set('workspace', filters.workspace);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.channelId !== undefined) {
      params = params.set('channelId', filters.channelId.toString());
    }

    return this.http.get<TaskApiResponse[]>(this.baseUrl, { params }).pipe(
      map((tasks) => this.deserializeTasks(tasks)),
      catchError((error) => this.handleError(error, 'fetching tasks')),
    );
  }

  /**
   * Get a single task by ID.
   *
   * @param id - Task ID
   * @returns Observable of Task with channel relation
   * @throws 404 if task not found
   */
  getTask(id: number): Observable<Task> {
    return this.http.get<TaskApiResponse>(`${this.baseUrl}/${id}`).pipe(
      map((task) => this.deserializeTask(task)),
      catchError((error) => this.handleError(error, 'fetching task')),
    );
  }

  /**
   * Create a new task.
   *
   * @param dto - Task data (title is required)
   * @returns Observable of created Task with channel relation
   */
  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<TaskApiResponse>(this.baseUrl, dto).pipe(
      map((task) => this.deserializeTask(task)),
      catchError((error) => this.handleError(error, 'creating task')),
    );
  }

  /**
   * Update an existing task (partial update).
   *
   * @param id - Task ID
   * @param dto - Fields to update (all optional)
   * @returns Observable of updated Task with channel relation
   * @throws 404 if task not found
   */
  updateTask(id: number, dto: UpdateTaskDto): Observable<Task> {
    return this.http.patch<TaskApiResponse>(`${this.baseUrl}/${id}`, dto).pipe(
      map((task) => this.deserializeTask(task)),
      catchError((error) => this.handleError(error, 'updating task')),
    );
  }

  /**
   * Delete a task.
   *
   * @param id - Task ID
   * @returns Observable that completes when deletion succeeds
   * @throws 404 if task not found
   */
  deleteTask(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError((error) => this.handleError(error, 'deleting task')));
  }

  /**
   * Convert date strings from API to Date objects.
   * Backend returns ISO strings, frontend uses Date objects.
   *
   * @param task - Raw API response with string dates
   * @returns Task with Date objects
   */
  private deserializeTask(task: TaskApiResponse): Task {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      workspace: task.workspace as Workspace,
      channelId: task.channelId,
      channel: task.channel
        ? {
            id: task.channel.id,
            name: task.channel.name,
            workspace: task.channel.workspace as Workspace,
            color: task.channel.color,
            createdAt: new Date(task.channel.createdAt),
          }
        : undefined,
      status: task.status as TaskStatus,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      isRoutine: task.isRoutine,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    };
  }

  /**
   * Deserialize array of tasks from API responses.
   *
   * @param tasks - Raw API responses
   * @returns Array of Tasks with Date objects
   */
  private deserializeTasks(tasks: TaskApiResponse[]): Task[] {
    return tasks.map((task) => this.deserializeTask(task));
  }

  /**
   * Centralized error handling with user-friendly messages.
   */
  private handleError(
    error: HttpErrorResponse,
    operation: string,
  ): Observable<never> {
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
          errorMessage = 'Task not found';
          break;
        case 500:
          errorMessage = 'Server error: Please try again later';
          break;
        default:
          errorMessage = `Error ${operation}: ${error.message}`;
      }
    }

    console.error(`[TaskApiService] ${errorMessage}`, error);
    return throwError(() => new Error(errorMessage));
  }
}
