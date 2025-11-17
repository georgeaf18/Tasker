import { TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { SubtaskStateService } from './subtask-state.service';
import { SubtaskApiService } from './subtask-api.service';
import { NotificationService } from './notification.service';
import { Subtask, CreateSubtaskDto, UpdateSubtaskDto, ReorderSubtaskDto, SubtaskStatus } from '../models/subtask.model';

describe('SubtaskStateService', () => {
    let service: SubtaskStateService;
    let mockSubtaskApiService: jest.Mocked<SubtaskApiService>;
    let mockNotificationService: jest.Mocked<NotificationService>;

    // Mock subtask data factory
    const createMockSubtask = (overrides: Partial<Subtask> = {}): Subtask => ({
        id: 1,
        title: 'Test Subtask',
        description: 'Test Description',
        taskId: 1,
        status: SubtaskStatus.TODO,
        position: 0,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        ...overrides
    });

    beforeEach(() => {
        // Create mock for SubtaskApiService
        mockSubtaskApiService = {
            getSubtasks: jest.fn(),
            createSubtask: jest.fn(),
            updateSubtask: jest.fn(),
            deleteSubtask: jest.fn(),
            reorderSubtask: jest.fn()
        } as any;

        // Create mock for NotificationService
        mockNotificationService = {
            show: jest.fn(),
            clear: jest.fn(),
            notification: jest.fn()
        } as any;

        TestBed.configureTestingModule({
            providers: [
                SubtaskStateService,
                { provide: SubtaskApiService, useValue: mockSubtaskApiService },
                { provide: NotificationService, useValue: mockNotificationService }
            ]
        });

        service = TestBed.inject(SubtaskStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Initial State', () => {
        it('should initialize with loading false', () => {
            expect(service.loading()).toBe(false);
        });

        it('should initialize with error null', () => {
            expect(service.error()).toBeNull();
        });

        it('should initialize with empty subtasks for any task', () => {
            const subtasksSignal = service.getSubtasksForTask(1);
            expect(subtasksSignal()).toEqual([]);
        });
    });

    describe('loadSubtasks()', () => {
        it('should load subtasks successfully for a task', (done) => {
            const taskId = 1;
            const mockSubtasks = [
                createMockSubtask({ id: 1, taskId, position: 0 }),
                createMockSubtask({ id: 2, taskId, position: 1 })
            ];
            mockSubtaskApiService.getSubtasks.mockReturnValue(of(mockSubtasks));

            service.loadSubtasks(taskId);

            expect(mockSubtaskApiService.getSubtasks).toHaveBeenCalledWith(taskId);

            setTimeout(() => {
                const subtasks = service.getSubtasksForTask(taskId)();
                expect(subtasks).toEqual(mockSubtasks);
                expect(service.loading()).toBe(false);
                expect(service.error()).toBeNull();
                done();
            }, 0);
        });

        it('should load subtasks for multiple tasks independently', (done) => {
            const task1Subtasks = [createMockSubtask({ id: 1, taskId: 1 })];
            const task2Subtasks = [createMockSubtask({ id: 2, taskId: 2 })];

            mockSubtaskApiService.getSubtasks.mockReturnValueOnce(of(task1Subtasks));
            service.loadSubtasks(1);

            setTimeout(() => {
                mockSubtaskApiService.getSubtasks.mockReturnValueOnce(of(task2Subtasks));
                service.loadSubtasks(2);

                setTimeout(() => {
                    expect(service.getSubtasksForTask(1)()).toEqual(task1Subtasks);
                    expect(service.getSubtasksForTask(2)()).toEqual(task2Subtasks);
                    done();
                }, 0);
            }, 0);
        });

        it('should handle error when loading subtasks fails', (done) => {
            const taskId = 1;
            const errorMessage = 'Failed to load subtasks';
            mockSubtaskApiService.getSubtasks.mockReturnValue(
                throwError(() => new Error(errorMessage))
            );

            service.loadSubtasks(taskId);

            setTimeout(() => {
                expect(service.loading()).toBe(false);
                expect(service.error()).toBe(errorMessage);
                expect(service.getSubtasksForTask(taskId)()).toEqual([]);
                done();
            }, 0);
        });

        it('should handle error with no message', (done) => {
            const taskId = 1;
            mockSubtaskApiService.getSubtasks.mockReturnValue(
                throwError(() => ({}))
            );

            service.loadSubtasks(taskId);

            setTimeout(() => {
                expect(service.error()).toBe('Failed to load subtasks');
                expect(service.loading()).toBe(false);
                done();
            }, 0);
        });

        it('should clear previous error when loading subtasks', (done) => {
            const taskId = 1;
            // First load with error
            mockSubtaskApiService.getSubtasks.mockReturnValue(
                throwError(() => new Error('First error'))
            );
            service.loadSubtasks(taskId);

            setTimeout(() => {
                expect(service.error()).toBe('First error');

                // Second load successfully
                mockSubtaskApiService.getSubtasks.mockReturnValue(of([createMockSubtask()]));
                service.loadSubtasks(taskId);

                setTimeout(() => {
                    expect(service.error()).toBeNull();
                    expect(service.getSubtasksForTask(taskId)()).toHaveLength(1);
                    done();
                }, 0);
            }, 0);
        });
    });

    describe('addSubtask()', () => {
        it('should add subtask successfully', (done) => {
            const taskId = 1;
            const dto: CreateSubtaskDto = {
                title: 'New Subtask',
                status: SubtaskStatus.TODO
            };
            const createdSubtask = createMockSubtask({ id: 5, taskId, title: 'New Subtask' });
            mockSubtaskApiService.createSubtask.mockReturnValue(of(createdSubtask));

            // Set initial subtasks
            service.setSubtasks(taskId, [
                createMockSubtask({ id: 1, taskId }),
                createMockSubtask({ id: 2, taskId })
            ]);

            service.addSubtask(taskId, dto);

            expect(mockSubtaskApiService.createSubtask).toHaveBeenCalledWith(taskId, dto);

            setTimeout(() => {
                const subtasks = service.getSubtasksForTask(taskId)();
                expect(subtasks).toHaveLength(3);
                expect(subtasks[2]).toEqual(createdSubtask);
                expect(service.loading()).toBe(false);
                expect(service.error()).toBeNull();
                done();
            }, 0);
        });

        it('should show success notification when subtask is added', (done) => {
            const taskId = 1;
            const dto: CreateSubtaskDto = { title: 'New Subtask' };
            const createdSubtask = createMockSubtask({ taskId });
            mockSubtaskApiService.createSubtask.mockReturnValue(of(createdSubtask));

            service.addSubtask(taskId, dto);

            setTimeout(() => {
                expect(mockNotificationService.show).toHaveBeenCalledWith('Subtask created', 'success');
                done();
            }, 0);
        });

        it('should handle error when adding subtask fails', (done) => {
            const taskId = 1;
            const dto: CreateSubtaskDto = { title: 'New Subtask' };
            const errorMessage = 'Failed to create subtask';
            mockSubtaskApiService.createSubtask.mockReturnValue(
                throwError(() => new Error(errorMessage))
            );

            service.setSubtasks(taskId, [createMockSubtask({ id: 1, taskId })]);
            service.addSubtask(taskId, dto);

            setTimeout(() => {
                expect(service.loading()).toBe(false);
                expect(service.error()).toBe(errorMessage);
                expect(service.getSubtasksForTask(taskId)()).toHaveLength(1); // Original subtask still there
                done();
            }, 0);
        });

        it('should show error notification when adding subtask fails', (done) => {
            const taskId = 1;
            const dto: CreateSubtaskDto = { title: 'New Subtask' };
            mockSubtaskApiService.createSubtask.mockReturnValue(
                throwError(() => new Error('Failed'))
            );

            service.addSubtask(taskId, dto);

            setTimeout(() => {
                expect(mockNotificationService.show).toHaveBeenCalledWith('Failed to create subtask', 'error');
                done();
            }, 0);
        });
    });

    describe('updateSubtask()', () => {
        it('should update subtask successfully', (done) => {
            const taskId = 1;
            const subtaskId = 1;
            const originalSubtask = createMockSubtask({ id: subtaskId, taskId, title: 'Original' });
            const updatedSubtask = createMockSubtask({ id: subtaskId, taskId, title: 'Updated' });
            const dto: UpdateSubtaskDto = { title: 'Updated' };

            service.setSubtasks(taskId, [originalSubtask, createMockSubtask({ id: 2, taskId })]);
            mockSubtaskApiService.updateSubtask.mockReturnValue(of(updatedSubtask));

            service.updateSubtask(taskId, subtaskId, dto);

            expect(mockSubtaskApiService.updateSubtask).toHaveBeenCalledWith(subtaskId, dto);

            setTimeout(() => {
                const subtasks = service.getSubtasksForTask(taskId)();
                expect(subtasks).toHaveLength(2);
                expect(subtasks[0].title).toBe('Updated');
                expect(subtasks[1].id).toBe(2);
                expect(service.loading()).toBe(false);
                expect(service.error()).toBeNull();
                done();
            }, 0);
        });

        it('should show success notification when subtask is updated', (done) => {
            const taskId = 1;
            const subtaskId = 1;
            const originalSubtask = createMockSubtask({ id: subtaskId, taskId });
            const updatedSubtask = createMockSubtask({ id: subtaskId, taskId, title: 'Updated' });

            service.setSubtasks(taskId, [originalSubtask]);
            mockSubtaskApiService.updateSubtask.mockReturnValue(of(updatedSubtask));

            service.updateSubtask(taskId, subtaskId, { title: 'Updated' });

            setTimeout(() => {
                expect(mockNotificationService.show).toHaveBeenCalledWith('Subtask updated', 'success');
                done();
            }, 0);
        });

        it('should update subtask status', (done) => {
            const taskId = 1;
            const subtaskId = 1;
            const originalSubtask = createMockSubtask({ id: subtaskId, taskId, status: SubtaskStatus.TODO });
            const updatedSubtask = createMockSubtask({ id: subtaskId, taskId, status: SubtaskStatus.DOING });

            service.setSubtasks(taskId, [originalSubtask]);
            mockSubtaskApiService.updateSubtask.mockReturnValue(of(updatedSubtask));

            service.updateSubtask(taskId, subtaskId, { status: SubtaskStatus.DOING });

            setTimeout(() => {
                expect(service.getSubtasksForTask(taskId)()[0].status).toBe(SubtaskStatus.DOING);
                done();
            }, 0);
        });

        it('should handle error when updating subtask fails', (done) => {
            const taskId = 1;
            const subtaskId = 1;
            const originalSubtask = createMockSubtask({ id: subtaskId, taskId, title: 'Original' });
            service.setSubtasks(taskId, [originalSubtask]);

            const errorMessage = 'Failed to update subtask';
            mockSubtaskApiService.updateSubtask.mockReturnValue(
                throwError(() => new Error(errorMessage))
            );

            service.updateSubtask(taskId, subtaskId, { title: 'Updated' });

            setTimeout(() => {
                expect(service.loading()).toBe(false);
                expect(service.error()).toBe(errorMessage);
                expect(service.getSubtasksForTask(taskId)()[0].title).toBe('Original'); // Not updated
                done();
            }, 0);
        });
    });

    describe('updateSubtaskStatus()', () => {
        it('should delegate to updateSubtask with status', (done) => {
            const taskId = 1;
            const subtaskId = 1;
            const subtask = createMockSubtask({ id: subtaskId, taskId, status: SubtaskStatus.TODO });
            const updatedSubtask = createMockSubtask({ id: subtaskId, taskId, status: SubtaskStatus.DONE });

            service.setSubtasks(taskId, [subtask]);
            mockSubtaskApiService.updateSubtask.mockReturnValue(of(updatedSubtask));

            service.updateSubtaskStatus(taskId, subtaskId, SubtaskStatus.DONE);

            expect(mockSubtaskApiService.updateSubtask).toHaveBeenCalledWith(subtaskId, { status: SubtaskStatus.DONE });

            setTimeout(() => {
                expect(service.getSubtasksForTask(taskId)()[0].status).toBe(SubtaskStatus.DONE);
                done();
            }, 0);
        });
    });

    describe('removeSubtask()', () => {
        it('should remove subtask successfully', (done) => {
            const taskId = 1;
            const subtasks = [
                createMockSubtask({ id: 1, taskId }),
                createMockSubtask({ id: 2, taskId }),
                createMockSubtask({ id: 3, taskId })
            ];
            service.setSubtasks(taskId, subtasks);
            mockSubtaskApiService.deleteSubtask.mockReturnValue(of(void 0));

            service.removeSubtask(taskId, 2);

            expect(mockSubtaskApiService.deleteSubtask).toHaveBeenCalledWith(2);

            setTimeout(() => {
                const remainingSubtasks = service.getSubtasksForTask(taskId)();
                expect(remainingSubtasks).toHaveLength(2);
                expect(remainingSubtasks.find(s => s.id === 2)).toBeUndefined();
                expect(remainingSubtasks.find(s => s.id === 1)).toBeDefined();
                expect(remainingSubtasks.find(s => s.id === 3)).toBeDefined();
                expect(service.loading()).toBe(false);
                expect(service.error()).toBeNull();
                done();
            }, 0);
        });

        it('should show success notification when subtask is removed', (done) => {
            const taskId = 1;
            service.setSubtasks(taskId, [
                createMockSubtask({ id: 1, taskId }),
                createMockSubtask({ id: 2, taskId })
            ]);
            mockSubtaskApiService.deleteSubtask.mockReturnValue(of(void 0));

            service.removeSubtask(taskId, 1);

            setTimeout(() => {
                expect(mockNotificationService.show).toHaveBeenCalledWith('Subtask deleted', 'success');
                done();
            }, 0);
        });

        it('should handle error when removing subtask fails', (done) => {
            const taskId = 1;
            service.setSubtasks(taskId, [
                createMockSubtask({ id: 1, taskId }),
                createMockSubtask({ id: 2, taskId })
            ]);

            const errorMessage = 'Failed to delete subtask';
            mockSubtaskApiService.deleteSubtask.mockReturnValue(
                throwError(() => new Error(errorMessage))
            );

            service.removeSubtask(taskId, 1);

            setTimeout(() => {
                expect(service.loading()).toBe(false);
                expect(service.error()).toBe(errorMessage);
                expect(service.getSubtasksForTask(taskId)()).toHaveLength(2); // Not removed
                done();
            }, 0);
        });
    });

    describe('reorderSubtasks()', () => {
        it('should reorder subtask successfully', (done) => {
            const taskId = 1;
            const subtaskId = 1;
            const originalSubtask = createMockSubtask({ id: subtaskId, taskId, position: 0 });
            const reorderedSubtask = createMockSubtask({ id: subtaskId, taskId, position: 3 });
            const dto: ReorderSubtaskDto = { position: 3 };

            service.setSubtasks(taskId, [originalSubtask]);
            mockSubtaskApiService.reorderSubtask.mockReturnValue(of(reorderedSubtask));

            service.reorderSubtasks(taskId, subtaskId, dto);

            expect(mockSubtaskApiService.reorderSubtask).toHaveBeenCalledWith(subtaskId, dto);

            setTimeout(() => {
                const subtasks = service.getSubtasksForTask(taskId)();
                expect(subtasks[0].position).toBe(3);
                expect(service.loading()).toBe(false);
                expect(service.error()).toBeNull();
                done();
            }, 0);
        });

        it('should show success notification when subtask is reordered', (done) => {
            const taskId = 1;
            const subtaskId = 1;
            const reorderedSubtask = createMockSubtask({ id: subtaskId, taskId, position: 2 });

            service.setSubtasks(taskId, [createMockSubtask({ id: subtaskId, taskId })]);
            mockSubtaskApiService.reorderSubtask.mockReturnValue(of(reorderedSubtask));

            service.reorderSubtasks(taskId, subtaskId, { position: 2 });

            setTimeout(() => {
                expect(mockNotificationService.show).toHaveBeenCalledWith('Subtask reordered', 'success');
                done();
            }, 0);
        });

        it('should handle error when reordering fails', (done) => {
            const taskId = 1;
            const subtaskId = 1;
            const errorMessage = 'Failed to reorder subtask';
            mockSubtaskApiService.reorderSubtask.mockReturnValue(
                throwError(() => new Error(errorMessage))
            );

            service.setSubtasks(taskId, [createMockSubtask({ id: subtaskId, taskId, position: 0 })]);
            service.reorderSubtasks(taskId, subtaskId, { position: 3 });

            setTimeout(() => {
                expect(service.loading()).toBe(false);
                expect(service.error()).toBe(errorMessage);
                expect(service.getSubtasksForTask(taskId)()[0].position).toBe(0); // Not reordered
                done();
            }, 0);
        });
    });

    describe('setSubtasks()', () => {
        it('should set subtasks for a task', () => {
            const taskId = 1;
            const subtasks = [
                createMockSubtask({ id: 1, taskId }),
                createMockSubtask({ id: 2, taskId })
            ];

            service.setSubtasks(taskId, subtasks);

            expect(service.getSubtasksForTask(taskId)()).toEqual(subtasks);
        });

        it('should replace existing subtasks', () => {
            const taskId = 1;
            const initialSubtasks = [createMockSubtask({ id: 1, taskId })];
            service.setSubtasks(taskId, initialSubtasks);
            expect(service.getSubtasksForTask(taskId)()).toEqual(initialSubtasks);

            const newSubtasks = [
                createMockSubtask({ id: 2, taskId }),
                createMockSubtask({ id: 3, taskId })
            ];
            service.setSubtasks(taskId, newSubtasks);
            expect(service.getSubtasksForTask(taskId)()).toEqual(newSubtasks);
            expect(service.getSubtasksForTask(taskId)()).toHaveLength(2);
        });

        it('should not affect subtasks of other tasks', () => {
            const task1Subtasks = [createMockSubtask({ id: 1, taskId: 1 })];
            const task2Subtasks = [createMockSubtask({ id: 2, taskId: 2 })];

            service.setSubtasks(1, task1Subtasks);
            service.setSubtasks(2, task2Subtasks);

            expect(service.getSubtasksForTask(1)()).toEqual(task1Subtasks);
            expect(service.getSubtasksForTask(2)()).toEqual(task2Subtasks);
        });
    });

    describe('clearSubtasksForTask()', () => {
        it('should clear subtasks for a specific task', () => {
            const taskId = 1;
            service.setSubtasks(taskId, [
                createMockSubtask({ id: 1, taskId }),
                createMockSubtask({ id: 2, taskId })
            ]);
            expect(service.getSubtasksForTask(taskId)()).toHaveLength(2);

            service.clearSubtasksForTask(taskId);
            expect(service.getSubtasksForTask(taskId)()).toEqual([]);
        });

        it('should not affect other tasks', () => {
            const task1Subtasks = [createMockSubtask({ id: 1, taskId: 1 })];
            const task2Subtasks = [createMockSubtask({ id: 2, taskId: 2 })];

            service.setSubtasks(1, task1Subtasks);
            service.setSubtasks(2, task2Subtasks);

            service.clearSubtasksForTask(1);

            expect(service.getSubtasksForTask(1)()).toEqual([]);
            expect(service.getSubtasksForTask(2)()).toEqual(task2Subtasks);
        });
    });

    describe('clearError()', () => {
        it('should clear error', (done) => {
            const taskId = 1;
            mockSubtaskApiService.getSubtasks.mockReturnValue(
                throwError(() => new Error('Test error'))
            );
            service.loadSubtasks(taskId);

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

    describe('Computed Signal: getSubtasksForTask', () => {
        it('should return subtasks ordered by position', () => {
            const taskId = 1;
            const subtasks = [
                createMockSubtask({ id: 1, taskId, position: 2 }),
                createMockSubtask({ id: 2, taskId, position: 0 }),
                createMockSubtask({ id: 3, taskId, position: 1 })
            ];
            service.setSubtasks(taskId, subtasks);

            const orderedSubtasks = service.getSubtasksForTask(taskId)();
            expect(orderedSubtasks).toHaveLength(3);
            expect(orderedSubtasks[0].position).toBe(0);
            expect(orderedSubtasks[1].position).toBe(1);
            expect(orderedSubtasks[2].position).toBe(2);
        });

        it('should return empty array for task with no subtasks', () => {
            const subtasks = service.getSubtasksForTask(999)();
            expect(subtasks).toEqual([]);
        });

        it('should reactively update when subtasks change', () => {
            const taskId = 1;
            service.setSubtasks(taskId, [createMockSubtask({ id: 1, taskId })]);
            expect(service.getSubtasksForTask(taskId)()).toHaveLength(1);

            service.setSubtasks(taskId, [
                createMockSubtask({ id: 1, taskId }),
                createMockSubtask({ id: 2, taskId })
            ]);
            expect(service.getSubtasksForTask(taskId)()).toHaveLength(2);
        });
    });

    describe('Computed Signal: getSubtasksByStatus', () => {
        it('should return only subtasks with specified status', () => {
            const taskId = 1;
            const subtasks = [
                createMockSubtask({ id: 1, taskId, status: SubtaskStatus.TODO, position: 0 }),
                createMockSubtask({ id: 2, taskId, status: SubtaskStatus.DOING, position: 1 }),
                createMockSubtask({ id: 3, taskId, status: SubtaskStatus.TODO, position: 2 }),
                createMockSubtask({ id: 4, taskId, status: SubtaskStatus.DONE, position: 3 })
            ];
            service.setSubtasks(taskId, subtasks);

            const todoSubtasks = service.getSubtasksByStatus(taskId, SubtaskStatus.TODO)();
            expect(todoSubtasks).toHaveLength(2);
            expect(todoSubtasks[0].id).toBe(1);
            expect(todoSubtasks[1].id).toBe(3);

            const doingSubtasks = service.getSubtasksByStatus(taskId, SubtaskStatus.DOING)();
            expect(doingSubtasks).toHaveLength(1);
            expect(doingSubtasks[0].id).toBe(2);

            const doneSubtasks = service.getSubtasksByStatus(taskId, SubtaskStatus.DONE)();
            expect(doneSubtasks).toHaveLength(1);
            expect(doneSubtasks[0].id).toBe(4);
        });

        it('should return empty array when no subtasks match status', () => {
            const taskId = 1;
            service.setSubtasks(taskId, [
                createMockSubtask({ id: 1, taskId, status: SubtaskStatus.TODO })
            ]);

            const doneSubtasks = service.getSubtasksByStatus(taskId, SubtaskStatus.DONE)();
            expect(doneSubtasks).toEqual([]);
        });

        it('should return subtasks ordered by position', () => {
            const taskId = 1;
            const subtasks = [
                createMockSubtask({ id: 1, taskId, status: SubtaskStatus.TODO, position: 2 }),
                createMockSubtask({ id: 2, taskId, status: SubtaskStatus.TODO, position: 0 }),
                createMockSubtask({ id: 3, taskId, status: SubtaskStatus.DOING, position: 1 })
            ];
            service.setSubtasks(taskId, subtasks);

            const todoSubtasks = service.getSubtasksByStatus(taskId, SubtaskStatus.TODO)();
            expect(todoSubtasks[0].position).toBe(0);
            expect(todoSubtasks[1].position).toBe(2);
        });

        it('should reactively update when status changes', () => {
            const taskId = 1;
            service.setSubtasks(taskId, [
                createMockSubtask({ id: 1, taskId, status: SubtaskStatus.TODO })
            ]);

            expect(service.getSubtasksByStatus(taskId, SubtaskStatus.TODO)()).toHaveLength(1);
            expect(service.getSubtasksByStatus(taskId, SubtaskStatus.DONE)()).toHaveLength(0);

            service.setSubtasks(taskId, [
                createMockSubtask({ id: 1, taskId, status: SubtaskStatus.DONE })
            ]);

            expect(service.getSubtasksByStatus(taskId, SubtaskStatus.TODO)()).toHaveLength(0);
            expect(service.getSubtasksByStatus(taskId, SubtaskStatus.DONE)()).toHaveLength(1);
        });
    });

    describe('Loading State', () => {
        it('should manage loading state for loadSubtasks', () => {
            const subject = new Subject<Subtask[]>();
            mockSubtaskApiService.getSubtasks.mockReturnValue(subject.asObservable());

            expect(service.loading()).toBe(false);
            service.loadSubtasks(1);
            expect(service.loading()).toBe(true);

            subject.next([createMockSubtask()]);
            subject.complete();
            expect(service.loading()).toBe(false);
        });

        it('should manage loading state for addSubtask', () => {
            const subject = new Subject<Subtask>();
            mockSubtaskApiService.createSubtask.mockReturnValue(subject.asObservable());

            expect(service.loading()).toBe(false);
            service.addSubtask(1, { title: 'Test' });
            expect(service.loading()).toBe(true);

            subject.next(createMockSubtask());
            subject.complete();
            expect(service.loading()).toBe(false);
        });

        it('should set loading to false on error', () => {
            const subject = new Subject<Subtask[]>();
            mockSubtaskApiService.getSubtasks.mockReturnValue(subject.asObservable());

            service.loadSubtasks(1);
            expect(service.loading()).toBe(true);

            subject.error(new Error('Error'));
            expect(service.loading()).toBe(false);
        });
    });

    describe('Error State', () => {
        it('should clear error before starting new operation', (done) => {
            const taskId = 1;
            // First operation fails
            mockSubtaskApiService.getSubtasks.mockReturnValue(
                throwError(() => new Error('First error'))
            );
            service.loadSubtasks(taskId);

            setTimeout(() => {
                expect(service.error()).toBe('First error');

                // Second operation succeeds
                mockSubtaskApiService.createSubtask.mockReturnValue(of(createMockSubtask()));
                service.addSubtask(taskId, { title: 'Test' });

                // Error should be cleared immediately when operation starts
                expect(service.error()).toBeNull();

                setTimeout(() => {
                    expect(service.error()).toBeNull();
                    done();
                }, 0);
            }, 0);
        });

        it('should preserve error message from API', (done) => {
            const taskId = 1;
            const customError = 'Custom error message from API';
            mockSubtaskApiService.getSubtasks.mockReturnValue(
                throwError(() => new Error(customError))
            );

            service.loadSubtasks(taskId);

            setTimeout(() => {
                expect(service.error()).toBe(customError);
                done();
            }, 0);
        });
    });

    describe('Signal Reactivity', () => {
        it('should trigger computed signal updates when subtasks change', () => {
            const taskId = 1;
            // Initial state
            service.setSubtasks(taskId, [createMockSubtask({ id: 1, taskId })]);
            let count = service.getSubtasksForTask(taskId)().length;
            expect(count).toBe(1);

            // Update subtasks
            service.setSubtasks(taskId, [
                createMockSubtask({ id: 1, taskId }),
                createMockSubtask({ id: 2, taskId })
            ]);

            count = service.getSubtasksForTask(taskId)().length;
            expect(count).toBe(2);
        });

        it('should maintain separate computed signal results per task', () => {
            service.setSubtasks(1, [
                createMockSubtask({ id: 1, taskId: 1, status: SubtaskStatus.TODO })
            ]);
            service.setSubtasks(2, [
                createMockSubtask({ id: 2, taskId: 2, status: SubtaskStatus.DONE })
            ]);

            expect(service.getSubtasksForTask(1)()).toHaveLength(1);
            expect(service.getSubtasksForTask(2)()).toHaveLength(1);
            expect(service.getSubtasksByStatus(1, SubtaskStatus.TODO)()).toHaveLength(1);
            expect(service.getSubtasksByStatus(2, SubtaskStatus.DONE)()).toHaveLength(1);
        });
    });
});
