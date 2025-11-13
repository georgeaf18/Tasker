import { request } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

/**
 * Task interface matching backend API response
 */
export interface Task {
    id: number;
    title: string;
    description: string | null;
    workspace: 'WORK' | 'PERSONAL';
    channelId: number | null;
    status: 'BACKLOG' | 'TODAY' | 'IN_PROGRESS' | 'DONE';
    dueDate: string | null;
    isRoutine: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * CreateTaskDto matching backend API expectations
 */
export interface CreateTaskDto {
    title: string;
    description?: string;
    workspace: 'WORK' | 'PERSONAL';
    channelId?: number;
    status?: 'BACKLOG' | 'TODAY' | 'IN_PROGRESS' | 'DONE';
    dueDate?: string;
    isRoutine?: boolean;
}

/**
 * ApiHelper provides utility methods for E2E test data management.
 * Communicates directly with the backend API for setup and cleanup operations.
 */
export class ApiHelper {
    private apiContext: APIRequestContext | null = null;
    private readonly baseURL: string;

    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
    }

    /**
     * Initialize the API request context
     */
    async init(): Promise<void> {
        this.apiContext = await request.newContext({
            baseURL: this.baseURL,
            extraHTTPHeaders: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Clean up the API request context
     */
    async dispose(): Promise<void> {
        if (this.apiContext) {
            await this.apiContext.dispose();
            this.apiContext = null;
        }
    }

    /**
     * Get API context, throws if not initialized
     */
    private getContext(): APIRequestContext {
        if (!this.apiContext) {
            throw new Error('ApiHelper not initialized. Call init() first.');
        }
        return this.apiContext;
    }

    /**
     * Create a new task via API
     * @param task - Partial task data (defaults provided)
     * @returns Created task with full data
     */
    async createTask(task: Partial<CreateTaskDto>): Promise<Task> {
        const taskData: CreateTaskDto = {
            title: task.title || 'Test Task',
            description: task.description || 'Test description',
            workspace: task.workspace || 'PERSONAL',
            status: task.status || 'BACKLOG',
            isRoutine: task.isRoutine || false,
            ...task,
        };

        const response = await this.getContext().post('/tasks', {
            data: taskData,
        });

        if (!response.ok()) {
            throw new Error(
                `Failed to create task: ${response.status()} ${await response.text()}`
            );
        }

        return await response.json();
    }

    /**
     * Update an existing task via API
     * @param id - Task ID
     * @param updates - Partial task updates
     * @returns Updated task
     */
    async updateTask(id: number, updates: Partial<CreateTaskDto>): Promise<Task> {
        const response = await this.getContext().patch(`/tasks/${id}`, {
            data: updates,
        });

        if (!response.ok()) {
            throw new Error(
                `Failed to update task: ${response.status()} ${await response.text()}`
            );
        }

        return await response.json();
    }

    /**
     * Delete a task via API
     * @param id - Task ID to delete
     */
    async deleteTask(id: number): Promise<void> {
        const response = await this.getContext().delete(`/tasks/${id}`);

        if (!response.ok()) {
            throw new Error(
                `Failed to delete task: ${response.status()} ${await response.text()}`
            );
        }
    }

    /**
     * Get all tasks via API
     * @returns Array of all tasks
     */
    async getTasks(): Promise<Task[]> {
        const response = await this.getContext().get('/tasks');

        if (!response.ok()) {
            throw new Error(
                `Failed to get tasks: ${response.status()} ${await response.text()}`
            );
        }

        return await response.json();
    }

    /**
     * Get a single task by ID
     * @param id - Task ID
     * @returns Task data
     */
    async getTask(id: number): Promise<Task> {
        const response = await this.getContext().get(`/tasks/${id}`);

        if (!response.ok()) {
            throw new Error(
                `Failed to get task: ${response.status()} ${await response.text()}`
            );
        }

        return await response.json();
    }

    /**
     * Clear all tasks from the database
     * WARNING: This deletes ALL tasks. Use only in test environments.
     */
    async clearAllTasks(): Promise<void> {
        const tasks = await this.getTasks();

        // Delete tasks in parallel for speed
        await Promise.all(tasks.map((task) => this.deleteTask(task.id)));
    }

    /**
     * Create multiple tasks at once
     * @param tasks - Array of task data
     * @returns Array of created tasks
     */
    async createTasks(tasks: Partial<CreateTaskDto>[]): Promise<Task[]> {
        return await Promise.all(tasks.map((task) => this.createTask(task)));
    }

    /**
     * Wait for task to exist with expected properties
     * Useful for verifying backend persistence after UI actions
     * @param id - Task ID
     * @param expectedProps - Expected properties to verify
     * @param timeout - Maximum wait time in ms
     * @returns Task when conditions met
     */
    async waitForTask(
        id: number,
        expectedProps: Partial<Task>,
        timeout = 5000
    ): Promise<Task> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            try {
                const task = await this.getTask(id);

                // Check if all expected properties match
                const matches = Object.entries(expectedProps).every(
                    ([key, value]) => task[key as keyof Task] === value
                );

                if (matches) {
                    return task;
                }
            } catch (error) {
                // Task might not exist yet, continue waiting
            }

            // Wait 100ms before next attempt
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        throw new Error(
            `Task ${id} did not match expected properties within ${timeout}ms`
        );
    }
}
