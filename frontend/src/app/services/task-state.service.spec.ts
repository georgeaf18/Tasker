import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, delay, Subject } from 'rxjs';
import { TaskStateService } from './task-state.service';
import { TaskApiService } from './task-api.service';
import { Task, CreateTaskDto, UpdateTaskDto, TaskFilters } from '../models';
import { TaskStatus } from '../models/task-status.enum';
import { Workspace } from '../models/workspace.enum';

describe('TaskStateService', () => {
    let service: TaskStateService;
    let mockTaskApiService: jest.Mocked<TaskApiService>;

    // Mock task data factory
    const createMockTask = (overrides: Partial<Task> = {}): Task => ({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        workspace: Workspace.PERSONAL,
        channelId: null,
        status: TaskStatus.BACKLOG,
        dueDate: null,
        isRoutine: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        ...overrides
    });

    beforeEach(() => {
        // Create mock for TaskApiService
        mockTaskApiService = {
            getTasks: jest.fn(),
            createTask: jest.fn(),
            updateTask: jest.fn(),
            deleteTask: jest.fn(),
            getTask: jest.fn()
        } as any;

        TestBed.configureTestingModule({
            providers: [
                TaskStateService,
                { provide: TaskApiService, useValue: mockTaskApiService }
            ]
        });

        service = TestBed.inject(TaskStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Initial State', () => {
        it('should initialize with empty tasks array', () => {
            expect(service.tasks()).toEqual([]);
        });

        it('should initialize with loading false', () => {
            expect(service.loading()).toBe(false);
        });

        it('should initialize with error null', () => {
            expect(service.error()).toBeNull();
        });

        it('should initialize with PERSONAL workspace selected', () => {
            expect(service.selectedWorkspace()).toBe(Workspace.PERSONAL);
        });
    });

    describe('loadTasks()', () => {
        it('should load tasks successfully', (done) => {
            const mockTasks = [
                createMockTask({ id: 1, title: 'Task 1' }),
                createMockTask({ id: 2, title: 'Task 2' })
            ];
            mockTaskApiService.getTasks.mockReturnValue(of(mockTasks));

            service.loadTasks();

            expect(mockTaskApiService.getTasks).toHaveBeenCalledWith(undefined);

            // Wait for async operation to complete
            setTimeout(() => {
                expect(service.tasks()).toEqual(mockTasks);
                expect(service.loading()).toBe(false);
                expect(service.error()).toBeNull();
                done();
            }, 0);
        });

        it('should load tasks with filters', (done) => {
            const filters: TaskFilters = {
                workspace: Workspace.WORK,
                status: TaskStatus.TODAY
            };
            const mockTasks = [createMockTask({ workspace: Workspace.WORK, status: TaskStatus.TODAY })];
            mockTaskApiService.getTasks.mockReturnValue(of(mockTasks));

            service.loadTasks(filters);

            expect(mockTaskApiService.getTasks).toHaveBeenCalledWith(filters);

            setTimeout(() => {
                expect(service.tasks()).toEqual(mockTasks);
                expect(service.loading()).toBe(false);
                done();
            }, 0);
        });

        it('should handle error when loading tasks fails', (done) => {
            const errorMessage = 'Failed to load tasks';
            mockTaskApiService.getTasks.mockReturnValue(
                throwError(() => new Error(errorMessage))
            );

            service.loadTasks();

            setTimeout(() => {
                expect(service.loading()).toBe(false);
                expect(service.error()).toBe(errorMessage);
                expect(service.tasks()).toEqual([]);
                done();
            }, 0);
        });

        it('should handle error with no message', (done) => {
            mockTaskApiService.getTasks.mockReturnValue(
                throwError(() => ({}))
            );

            service.loadTasks();

            setTimeout(() => {
                expect(service.error()).toBe('Failed to load tasks');
                expect(service.loading()).toBe(false);
                done();
            }, 0);
        });

        it('should clear previous error when loading tasks', (done) => {
            // First load with error
            mockTaskApiService.getTasks.mockReturnValue(
                throwError(() => new Error('First error'))
            );
            service.loadTasks();

            setTimeout(() => {
                expect(service.error()).toBe('First error');

                // Second load successfully
                mockTaskApiService.getTasks.mockReturnValue(of([createMockTask()]));
                service.loadTasks();

                setTimeout(() => {
                    expect(service.error()).toBeNull();
                    expect(service.tasks()).toHaveLength(1);
                    done();
                }, 0);
            }, 0);
        });
    });

    describe('addTask()', () => {
        it('should add task successfully', (done) => {
            const dto: CreateTaskDto = {
                title: 'New Task',
                workspace: Workspace.PERSONAL,
                status: TaskStatus.BACKLOG
            };
            const createdTask = createMockTask({ id: 5, title: 'New Task' });
            mockTaskApiService.createTask.mockReturnValue(of(createdTask));

            // Set initial tasks
            service.setTasks([createMockTask({ id: 1 }), createMockTask({ id: 2 })]);

            service.addTask(dto);

            expect(mockTaskApiService.createTask).toHaveBeenCalledWith(dto);

            setTimeout(() => {
                expect(service.tasks()).toHaveLength(3);
                expect(service.tasks()[2]).toEqual(createdTask);
                expect(service.loading()).toBe(false);
                expect(service.error()).toBeNull();
                done();
            }, 0);
        });

        it('should handle error when adding task fails', (done) => {
            const dto: CreateTaskDto = { title: 'New Task', workspace: Workspace.PERSONAL };
            const errorMessage = 'Failed to create task';
            mockTaskApiService.createTask.mockReturnValue(
                throwError(() => new Error(errorMessage))
            );

            service.setTasks([createMockTask({ id: 1 })]);
            service.addTask(dto);

            setTimeout(() => {
                expect(service.loading()).toBe(false);
                expect(service.error()).toBe(errorMessage);
                expect(service.tasks()).toHaveLength(1); // Original task still there
                done();
            }, 0);
        });

        it('should clear previous error when adding task', (done) => {
            service.clearError();
            service.setTasks([]);

            // Manually set error
            const dto: CreateTaskDto = { title: 'Test', workspace: Workspace.PERSONAL };
            mockTaskApiService.createTask.mockReturnValue(
                throwError(() => new Error('Error'))
            );
            service.addTask(dto);

            setTimeout(() => {
                expect(service.error()).toBe('Error');

                // Now add successfully
                mockTaskApiService.createTask.mockReturnValue(of(createMockTask()));
                service.addTask(dto);

                setTimeout(() => {
                    expect(service.error()).toBeNull();
                    done();
                }, 0);
            }, 0);
        });
    });

    describe('updateTask()', () => {
        it('should update task successfully', (done) => {
            const originalTask = createMockTask({ id: 1, title: 'Original Title' });
            const updatedTask = createMockTask({ id: 1, title: 'Updated Title' });
            const dto: UpdateTaskDto = { title: 'Updated Title' };

            service.setTasks([originalTask, createMockTask({ id: 2 })]);
            mockTaskApiService.updateTask.mockReturnValue(of(updatedTask));

            service.updateTask(1, dto);

            expect(mockTaskApiService.updateTask).toHaveBeenCalledWith(1, dto);

            setTimeout(() => {
                const tasks = service.tasks();
                expect(tasks).toHaveLength(2);
                expect(tasks[0].title).toBe('Updated Title');
                expect(tasks[1].id).toBe(2);
                expect(service.loading()).toBe(false);
                expect(service.error()).toBeNull();
                done();
            }, 0);
        });

        it('should update task status', (done) => {
            const originalTask = createMockTask({ id: 1, status: TaskStatus.BACKLOG });
            const updatedTask = createMockTask({ id: 1, status: TaskStatus.TODAY });

            service.setTasks([originalTask]);
            mockTaskApiService.updateTask.mockReturnValue(of(updatedTask));

            service.updateTask(1, { status: TaskStatus.TODAY });

            setTimeout(() => {
                expect(service.tasks()[0].status).toBe(TaskStatus.TODAY);
                done();
            }, 0);
        });

        it('should handle error when updating task fails', (done) => {
            const originalTask = createMockTask({ id: 1, title: 'Original' });
            service.setTasks([originalTask]);

            const errorMessage = 'Failed to update task';
            mockTaskApiService.updateTask.mockReturnValue(
                throwError(() => new Error(errorMessage))
            );

            service.updateTask(1, { title: 'Updated' });

            setTimeout(() => {
                expect(service.loading()).toBe(false);
                expect(service.error()).toBe(errorMessage);
                expect(service.tasks()[0].title).toBe('Original'); // Not updated
                done();
            }, 0);
        });

        it('should not update non-existent task', (done) => {
            const task = createMockTask({ id: 1 });
            service.setTasks([task]);

            const updatedTask = createMockTask({ id: 999, title: 'Updated' });
            mockTaskApiService.updateTask.mockReturnValue(of(updatedTask));

            service.updateTask(999, { title: 'Updated' });

            setTimeout(() => {
                // Original task unchanged
                expect(service.tasks()[0].id).toBe(1);
                expect(service.tasks()).toHaveLength(1);
                done();
            }, 0);
        });
    });

    describe('updateTaskStatus()', () => {
        it('should delegate to updateTask with status', (done) => {
            const task = createMockTask({ id: 1, status: TaskStatus.BACKLOG });
            const updatedTask = createMockTask({ id: 1, status: TaskStatus.IN_PROGRESS });

            service.setTasks([task]);
            mockTaskApiService.updateTask.mockReturnValue(of(updatedTask));

            service.updateTaskStatus(1, TaskStatus.IN_PROGRESS);

            expect(mockTaskApiService.updateTask).toHaveBeenCalledWith(1, { status: TaskStatus.IN_PROGRESS });

            setTimeout(() => {
                expect(service.tasks()[0].status).toBe(TaskStatus.IN_PROGRESS);
                done();
            }, 0);
        });
    });

    describe('removeTask()', () => {
        it('should remove task successfully', (done) => {
            const tasks = [
                createMockTask({ id: 1 }),
                createMockTask({ id: 2 }),
                createMockTask({ id: 3 })
            ];
            service.setTasks(tasks);
            mockTaskApiService.deleteTask.mockReturnValue(of(void 0));

            service.removeTask(2);

            expect(mockTaskApiService.deleteTask).toHaveBeenCalledWith(2);

            setTimeout(() => {
                const remainingTasks = service.tasks();
                expect(remainingTasks).toHaveLength(2);
                expect(remainingTasks.find(t => t.id === 2)).toBeUndefined();
                expect(remainingTasks.find(t => t.id === 1)).toBeDefined();
                expect(remainingTasks.find(t => t.id === 3)).toBeDefined();
                expect(service.loading()).toBe(false);
                expect(service.error()).toBeNull();
                done();
            }, 0);
        });

        it('should handle error when removing task fails', (done) => {
            const tasks = [createMockTask({ id: 1 }), createMockTask({ id: 2 })];
            service.setTasks(tasks);

            const errorMessage = 'Failed to delete task';
            mockTaskApiService.deleteTask.mockReturnValue(
                throwError(() => new Error(errorMessage))
            );

            service.removeTask(1);

            setTimeout(() => {
                expect(service.loading()).toBe(false);
                expect(service.error()).toBe(errorMessage);
                expect(service.tasks()).toHaveLength(2); // Not removed
                done();
            }, 0);
        });

        it('should handle removing non-existent task', (done) => {
            service.setTasks([createMockTask({ id: 1 })]);
            mockTaskApiService.deleteTask.mockReturnValue(of(void 0));

            service.removeTask(999);

            setTimeout(() => {
                expect(service.tasks()).toHaveLength(1);
                expect(service.loading()).toBe(false);
                done();
            }, 0);
        });
    });

    describe('setSelectedWorkspace()', () => {
        it('should set workspace to WORK', () => {
            service.setSelectedWorkspace(Workspace.WORK);
            expect(service.selectedWorkspace()).toBe(Workspace.WORK);
        });

        it('should set workspace to PERSONAL', () => {
            service.setSelectedWorkspace(Workspace.PERSONAL);
            expect(service.selectedWorkspace()).toBe(Workspace.PERSONAL);
        });

        it('should switch between workspaces', () => {
            service.setSelectedWorkspace(Workspace.WORK);
            expect(service.selectedWorkspace()).toBe(Workspace.WORK);

            service.setSelectedWorkspace(Workspace.PERSONAL);
            expect(service.selectedWorkspace()).toBe(Workspace.PERSONAL);
        });
    });

    describe('setTasks()', () => {
        it('should replace all tasks', () => {
            const initialTasks = [createMockTask({ id: 1 })];
            service.setTasks(initialTasks);
            expect(service.tasks()).toEqual(initialTasks);

            const newTasks = [createMockTask({ id: 2 }), createMockTask({ id: 3 })];
            service.setTasks(newTasks);
            expect(service.tasks()).toEqual(newTasks);
            expect(service.tasks()).toHaveLength(2);
        });

        it('should set empty array', () => {
            service.setTasks([createMockTask({ id: 1 })]);
            expect(service.tasks()).toHaveLength(1);

            service.setTasks([]);
            expect(service.tasks()).toEqual([]);
        });
    });

    describe('clearError()', () => {
        it('should clear error', (done) => {
            mockTaskApiService.getTasks.mockReturnValue(
                throwError(() => new Error('Test error'))
            );
            service.loadTasks();

            setTimeout(() => {
                expect(service.error()).toBe('Test error');

                service.clearError();
                expect(service.error()).toBeNull();
                done();
            }, 0);
        });

        it('should do nothing when error is already null', () => {
            expect(service.error()).toBeNull();
            service.clearError();
            expect(service.error()).toBeNull();
        });
    });

    describe('Computed Signal: backlogTasks', () => {
        it('should return only BACKLOG tasks', () => {
            const tasks = [
                createMockTask({ id: 1, status: TaskStatus.BACKLOG }),
                createMockTask({ id: 2, status: TaskStatus.TODAY }),
                createMockTask({ id: 3, status: TaskStatus.BACKLOG }),
                createMockTask({ id: 4, status: TaskStatus.IN_PROGRESS })
            ];
            service.setTasks(tasks);

            const backlogTasks = service.backlogTasks();
            expect(backlogTasks).toHaveLength(2);
            expect(backlogTasks[0].id).toBe(1);
            expect(backlogTasks[1].id).toBe(3);
        });

        it('should return empty array when no backlog tasks', () => {
            service.setTasks([
                createMockTask({ status: TaskStatus.TODAY }),
                createMockTask({ status: TaskStatus.DONE })
            ]);

            expect(service.backlogTasks()).toEqual([]);
        });

        it('should reactively update when tasks change', () => {
            service.setTasks([createMockTask({ id: 1, status: TaskStatus.TODAY })]);
            expect(service.backlogTasks()).toHaveLength(0);

            service.setTasks([createMockTask({ id: 2, status: TaskStatus.BACKLOG })]);
            expect(service.backlogTasks()).toHaveLength(1);
        });
    });

    describe('Computed Signal: todayTasks', () => {
        it('should return only TODAY tasks', () => {
            const tasks = [
                createMockTask({ id: 1, status: TaskStatus.TODAY }),
                createMockTask({ id: 2, status: TaskStatus.BACKLOG }),
                createMockTask({ id: 3, status: TaskStatus.TODAY }),
                createMockTask({ id: 4, status: TaskStatus.DONE })
            ];
            service.setTasks(tasks);

            const todayTasks = service.todayTasks();
            expect(todayTasks).toHaveLength(2);
            expect(todayTasks[0].id).toBe(1);
            expect(todayTasks[1].id).toBe(3);
        });

        it('should return empty array when no today tasks', () => {
            service.setTasks([
                createMockTask({ status: TaskStatus.BACKLOG }),
                createMockTask({ status: TaskStatus.DONE })
            ]);

            expect(service.todayTasks()).toEqual([]);
        });

        it('should reactively update when tasks change', () => {
            service.setTasks([]);
            expect(service.todayTasks()).toHaveLength(0);

            service.setTasks([
                createMockTask({ id: 1, status: TaskStatus.TODAY }),
                createMockTask({ id: 2, status: TaskStatus.TODAY })
            ]);
            expect(service.todayTasks()).toHaveLength(2);
        });
    });

    describe('Computed Signal: inProgressTasks', () => {
        it('should return only IN_PROGRESS tasks', () => {
            const tasks = [
                createMockTask({ id: 1, status: TaskStatus.IN_PROGRESS }),
                createMockTask({ id: 2, status: TaskStatus.TODAY }),
                createMockTask({ id: 3, status: TaskStatus.IN_PROGRESS }),
                createMockTask({ id: 4, status: TaskStatus.DONE })
            ];
            service.setTasks(tasks);

            const inProgressTasks = service.inProgressTasks();
            expect(inProgressTasks).toHaveLength(2);
            expect(inProgressTasks[0].id).toBe(1);
            expect(inProgressTasks[1].id).toBe(3);
        });

        it('should return empty array when no in-progress tasks', () => {
            service.setTasks([
                createMockTask({ status: TaskStatus.BACKLOG }),
                createMockTask({ status: TaskStatus.DONE })
            ]);

            expect(service.inProgressTasks()).toEqual([]);
        });

        it('should reactively update when task status changes', () => {
            service.setTasks([createMockTask({ id: 1, status: TaskStatus.TODAY })]);
            expect(service.inProgressTasks()).toHaveLength(0);

            service.setTasks([createMockTask({ id: 1, status: TaskStatus.IN_PROGRESS })]);
            expect(service.inProgressTasks()).toHaveLength(1);
        });
    });

    describe('Computed Signal: doneTasks', () => {
        it('should return only DONE tasks', () => {
            const tasks = [
                createMockTask({ id: 1, status: TaskStatus.DONE }),
                createMockTask({ id: 2, status: TaskStatus.TODAY }),
                createMockTask({ id: 3, status: TaskStatus.DONE }),
                createMockTask({ id: 4, status: TaskStatus.BACKLOG })
            ];
            service.setTasks(tasks);

            const doneTasks = service.doneTasks();
            expect(doneTasks).toHaveLength(2);
            expect(doneTasks[0].id).toBe(1);
            expect(doneTasks[1].id).toBe(3);
        });

        it('should return empty array when no done tasks', () => {
            service.setTasks([
                createMockTask({ status: TaskStatus.BACKLOG }),
                createMockTask({ status: TaskStatus.TODAY })
            ]);

            expect(service.doneTasks()).toEqual([]);
        });

        it('should reactively update when tasks are marked done', () => {
            service.setTasks([createMockTask({ id: 1, status: TaskStatus.IN_PROGRESS })]);
            expect(service.doneTasks()).toHaveLength(0);

            service.setTasks([
                createMockTask({ id: 1, status: TaskStatus.IN_PROGRESS }),
                createMockTask({ id: 2, status: TaskStatus.DONE })
            ]);
            expect(service.doneTasks()).toHaveLength(1);
        });
    });

    describe('Computed Signal: workTasks', () => {
        it('should return only WORK workspace tasks', () => {
            const tasks = [
                createMockTask({ id: 1, workspace: Workspace.WORK }),
                createMockTask({ id: 2, workspace: Workspace.PERSONAL }),
                createMockTask({ id: 3, workspace: Workspace.WORK }),
                createMockTask({ id: 4, workspace: Workspace.PERSONAL })
            ];
            service.setTasks(tasks);

            const workTasks = service.workTasks();
            expect(workTasks).toHaveLength(2);
            expect(workTasks[0].id).toBe(1);
            expect(workTasks[1].id).toBe(3);
        });

        it('should return empty array when no work tasks', () => {
            service.setTasks([
                createMockTask({ workspace: Workspace.PERSONAL }),
                createMockTask({ workspace: Workspace.PERSONAL })
            ]);

            expect(service.workTasks()).toEqual([]);
        });

        it('should reactively update when tasks change', () => {
            service.setTasks([createMockTask({ workspace: Workspace.PERSONAL })]);
            expect(service.workTasks()).toHaveLength(0);

            service.setTasks([
                createMockTask({ id: 1, workspace: Workspace.WORK }),
                createMockTask({ id: 2, workspace: Workspace.PERSONAL })
            ]);
            expect(service.workTasks()).toHaveLength(1);
        });
    });

    describe('Computed Signal: personalTasks', () => {
        it('should return only PERSONAL workspace tasks', () => {
            const tasks = [
                createMockTask({ id: 1, workspace: Workspace.PERSONAL }),
                createMockTask({ id: 2, workspace: Workspace.WORK }),
                createMockTask({ id: 3, workspace: Workspace.PERSONAL }),
                createMockTask({ id: 4, workspace: Workspace.WORK })
            ];
            service.setTasks(tasks);

            const personalTasks = service.personalTasks();
            expect(personalTasks).toHaveLength(2);
            expect(personalTasks[0].id).toBe(1);
            expect(personalTasks[1].id).toBe(3);
        });

        it('should return empty array when no personal tasks', () => {
            service.setTasks([
                createMockTask({ workspace: Workspace.WORK }),
                createMockTask({ workspace: Workspace.WORK })
            ]);

            expect(service.personalTasks()).toEqual([]);
        });

        it('should reactively update when tasks change', () => {
            service.setTasks([createMockTask({ workspace: Workspace.WORK })]);
            expect(service.personalTasks()).toHaveLength(0);

            service.setTasks([
                createMockTask({ id: 1, workspace: Workspace.PERSONAL }),
                createMockTask({ id: 2, workspace: Workspace.WORK })
            ]);
            expect(service.personalTasks()).toHaveLength(1);
        });
    });

    describe('Computed Signal: currentWorkspaceTasks', () => {
        it('should return tasks for selected workspace', () => {
            const tasks = [
                createMockTask({ id: 1, workspace: Workspace.PERSONAL }),
                createMockTask({ id: 2, workspace: Workspace.WORK }),
                createMockTask({ id: 3, workspace: Workspace.PERSONAL })
            ];
            service.setTasks(tasks);
            service.setSelectedWorkspace(Workspace.PERSONAL);

            const currentTasks = service.currentWorkspaceTasks();
            expect(currentTasks).toHaveLength(2);
            expect(currentTasks[0].id).toBe(1);
            expect(currentTasks[1].id).toBe(3);
        });

        it('should reactively update when workspace changes', () => {
            const tasks = [
                createMockTask({ id: 1, workspace: Workspace.PERSONAL }),
                createMockTask({ id: 2, workspace: Workspace.WORK })
            ];
            service.setTasks(tasks);

            service.setSelectedWorkspace(Workspace.PERSONAL);
            expect(service.currentWorkspaceTasks()).toHaveLength(1);
            expect(service.currentWorkspaceTasks()[0].id).toBe(1);

            service.setSelectedWorkspace(Workspace.WORK);
            expect(service.currentWorkspaceTasks()).toHaveLength(1);
            expect(service.currentWorkspaceTasks()[0].id).toBe(2);
        });

        it('should reactively update when tasks change', () => {
            service.setSelectedWorkspace(Workspace.WORK);
            service.setTasks([]);
            expect(service.currentWorkspaceTasks()).toHaveLength(0);

            service.setTasks([
                createMockTask({ id: 1, workspace: Workspace.WORK }),
                createMockTask({ id: 2, workspace: Workspace.PERSONAL })
            ]);
            expect(service.currentWorkspaceTasks()).toHaveLength(1);
            expect(service.currentWorkspaceTasks()[0].id).toBe(1);
        });

        it('should return empty array when no tasks match workspace', () => {
            service.setTasks([createMockTask({ workspace: Workspace.PERSONAL })]);
            service.setSelectedWorkspace(Workspace.WORK);

            expect(service.currentWorkspaceTasks()).toEqual([]);
        });
    });

    describe('Loading State', () => {
        it('should manage loading state for loadTasks', () => {
            const subject = new Subject<Task[]>();
            mockTaskApiService.getTasks.mockReturnValue(subject.asObservable());

            expect(service.loading()).toBe(false);
            service.loadTasks();
            expect(service.loading()).toBe(true);

            subject.next([createMockTask()]);
            subject.complete();
            expect(service.loading()).toBe(false);
        });

        it('should manage loading state for addTask', () => {
            const subject = new Subject<Task>();
            mockTaskApiService.createTask.mockReturnValue(subject.asObservable());

            expect(service.loading()).toBe(false);
            service.addTask({ title: 'Test', workspace: Workspace.PERSONAL });
            expect(service.loading()).toBe(true);

            subject.next(createMockTask());
            subject.complete();
            expect(service.loading()).toBe(false);
        });

        it('should manage loading state for updateTask', () => {
            const subject = new Subject<Task>();
            mockTaskApiService.updateTask.mockReturnValue(subject.asObservable());

            expect(service.loading()).toBe(false);
            service.updateTask(1, { title: 'Updated' });
            expect(service.loading()).toBe(true);

            subject.next(createMockTask());
            subject.complete();
            expect(service.loading()).toBe(false);
        });

        it('should manage loading state for removeTask', () => {
            const subject = new Subject<void>();
            mockTaskApiService.deleteTask.mockReturnValue(subject.asObservable());

            expect(service.loading()).toBe(false);
            service.removeTask(1);
            expect(service.loading()).toBe(true);

            subject.next();
            subject.complete();
            expect(service.loading()).toBe(false);
        });

        it('should set loading to false on error', () => {
            const subject = new Subject<Task[]>();
            mockTaskApiService.getTasks.mockReturnValue(subject.asObservable());

            service.loadTasks();
            expect(service.loading()).toBe(true);

            subject.error(new Error('Error'));
            expect(service.loading()).toBe(false);
        });
    });

    describe('Error State', () => {
        it('should clear error before starting new operation', (done) => {
            // First operation fails
            mockTaskApiService.getTasks.mockReturnValue(
                throwError(() => new Error('First error'))
            );
            service.loadTasks();

            setTimeout(() => {
                expect(service.error()).toBe('First error');

                // Second operation succeeds
                mockTaskApiService.createTask.mockReturnValue(of(createMockTask()));
                service.addTask({ title: 'Test', workspace: Workspace.PERSONAL });

                // Error should be cleared immediately when operation starts
                expect(service.error()).toBeNull();

                setTimeout(() => {
                    expect(service.error()).toBeNull();
                    done();
                }, 0);
            }, 0);
        });

        it('should preserve error message from API', (done) => {
            const customError = 'Custom error message from API';
            mockTaskApiService.getTasks.mockReturnValue(
                throwError(() => new Error(customError))
            );

            service.loadTasks();

            setTimeout(() => {
                expect(service.error()).toBe(customError);
                done();
            }, 0);
        });
    });

    describe('Complex Scenarios', () => {
        it('should handle multiple status filters correctly', () => {
            const tasks = [
                createMockTask({ id: 1, status: TaskStatus.BACKLOG, workspace: Workspace.WORK }),
                createMockTask({ id: 2, status: TaskStatus.TODAY, workspace: Workspace.WORK }),
                createMockTask({ id: 3, status: TaskStatus.IN_PROGRESS, workspace: Workspace.PERSONAL }),
                createMockTask({ id: 4, status: TaskStatus.DONE, workspace: Workspace.PERSONAL })
            ];
            service.setTasks(tasks);

            expect(service.backlogTasks()).toHaveLength(1);
            expect(service.todayTasks()).toHaveLength(1);
            expect(service.inProgressTasks()).toHaveLength(1);
            expect(service.doneTasks()).toHaveLength(1);
        });

        it('should handle filtering by both workspace and status', () => {
            const tasks = [
                createMockTask({ id: 1, status: TaskStatus.TODAY, workspace: Workspace.WORK }),
                createMockTask({ id: 2, status: TaskStatus.TODAY, workspace: Workspace.PERSONAL }),
                createMockTask({ id: 3, status: TaskStatus.DONE, workspace: Workspace.WORK })
            ];
            service.setTasks(tasks);
            service.setSelectedWorkspace(Workspace.WORK);

            const currentWorkspaceTasks = service.currentWorkspaceTasks();
            expect(currentWorkspaceTasks).toHaveLength(2);

            const todayTasks = service.todayTasks();
            expect(todayTasks).toHaveLength(2);

            // Intersection: TODAY tasks in WORK workspace
            const workTodayTasks = todayTasks.filter(t => t.workspace === Workspace.WORK);
            expect(workTodayTasks).toHaveLength(1);
            expect(workTodayTasks[0].id).toBe(1);
        });

        it('should handle task moving through workflow', (done) => {
            const task = createMockTask({ id: 1, status: TaskStatus.BACKLOG });
            service.setTasks([task]);
            mockTaskApiService.updateTask.mockReturnValue(
                of(createMockTask({ id: 1, status: TaskStatus.TODAY }))
            );

            expect(service.backlogTasks()).toHaveLength(1);
            expect(service.todayTasks()).toHaveLength(0);

            service.updateTaskStatus(1, TaskStatus.TODAY);

            setTimeout(() => {
                expect(service.backlogTasks()).toHaveLength(0);
                expect(service.todayTasks()).toHaveLength(1);
                done();
            }, 0);
        });

        it('should handle concurrent operations with loading state', () => {
            const getTasksSubject = new Subject<Task[]>();
            const createTaskSubject = new Subject<Task>();

            mockTaskApiService.getTasks.mockReturnValue(getTasksSubject.asObservable());
            mockTaskApiService.createTask.mockReturnValue(createTaskSubject.asObservable());

            service.loadTasks();
            expect(service.loading()).toBe(true);

            // This would overwrite loading state in real scenario
            service.addTask({ title: 'Test', workspace: Workspace.PERSONAL });
            expect(service.loading()).toBe(true);

            getTasksSubject.next([createMockTask()]);
            getTasksSubject.complete();
            createTaskSubject.next(createMockTask());
            createTaskSubject.complete();
        });

        it('should handle empty task list operations', (done) => {
            service.setTasks([]);
            mockTaskApiService.deleteTask.mockReturnValue(of(void 0));

            service.removeTask(1);

            setTimeout(() => {
                expect(service.tasks()).toEqual([]);
                expect(service.loading()).toBe(false);
                done();
            }, 0);
        });

        it('should handle all computed signals with empty tasks', () => {
            service.setTasks([]);

            expect(service.backlogTasks()).toEqual([]);
            expect(service.todayTasks()).toEqual([]);
            expect(service.inProgressTasks()).toEqual([]);
            expect(service.doneTasks()).toEqual([]);
            expect(service.workTasks()).toEqual([]);
            expect(service.personalTasks()).toEqual([]);
            expect(service.currentWorkspaceTasks()).toEqual([]);
        });
    });

    describe('Signal Reactivity', () => {
        it('should trigger computed signal updates when base signal changes', () => {
            // Initial state
            service.setTasks([createMockTask({ id: 1, status: TaskStatus.BACKLOG })]);
            let backlogCount = service.backlogTasks().length;
            expect(backlogCount).toBe(1);

            // Update tasks
            service.setTasks([
                createMockTask({ id: 1, status: TaskStatus.BACKLOG }),
                createMockTask({ id: 2, status: TaskStatus.BACKLOG })
            ]);

            backlogCount = service.backlogTasks().length;
            expect(backlogCount).toBe(2);
        });

        it('should trigger currentWorkspaceTasks update when workspace changes', () => {
            service.setTasks([
                createMockTask({ id: 1, workspace: Workspace.WORK }),
                createMockTask({ id: 2, workspace: Workspace.PERSONAL })
            ]);

            service.setSelectedWorkspace(Workspace.WORK);
            expect(service.currentWorkspaceTasks()).toHaveLength(1);
            expect(service.currentWorkspaceTasks()[0].workspace).toBe(Workspace.WORK);

            service.setSelectedWorkspace(Workspace.PERSONAL);
            expect(service.currentWorkspaceTasks()).toHaveLength(1);
            expect(service.currentWorkspaceTasks()[0].workspace).toBe(Workspace.PERSONAL);
        });

        it('should maintain separate computed signal results', () => {
            const tasks = [
                createMockTask({ id: 1, status: TaskStatus.BACKLOG, workspace: Workspace.WORK }),
                createMockTask({ id: 2, status: TaskStatus.TODAY, workspace: Workspace.PERSONAL }),
                createMockTask({ id: 3, status: TaskStatus.DONE, workspace: Workspace.WORK })
            ];
            service.setTasks(tasks);

            // Each computed should return independent results
            expect(service.backlogTasks()).toHaveLength(1);
            expect(service.todayTasks()).toHaveLength(1);
            expect(service.doneTasks()).toHaveLength(1);
            expect(service.workTasks()).toHaveLength(2);
            expect(service.personalTasks()).toHaveLength(1);
        });
    });
});
