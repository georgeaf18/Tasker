import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { KanbanBoardComponent } from './kanban-board.component';
import { TaskStateService } from '../../services/task-state.service';
import { BoardPreferencesService } from '../../services/board-preferences.service';
import { TaskUtilsService } from '../../shared/services/task-utils.service';
import { Task, CreateTaskDto } from '../../models';
import { Workspace } from '../../models/workspace.enum';
import { TaskStatus } from '../../models/task-status.enum';
import { BoardLayout } from '../../models/board-layout.enum';

describe('KanbanBoardComponent', () => {
    let component: KanbanBoardComponent;
    let fixture: ComponentFixture<KanbanBoardComponent>;
    let mockTaskState: jest.Mocked<Partial<TaskStateService>>;
    let mockBoardPreferences: jest.Mocked<Partial<BoardPreferencesService>>;
    let mockTaskUtils: jest.Mocked<Partial<TaskUtilsService>>;

    const mockTasks: Task[] = [
        {
            id: 1,
            title: 'Today Task',
            description: 'Description',
            workspace: Workspace.WORK,
            channelId: 1,
            status: TaskStatus.TODAY,
            dueDate: null,
            isRoutine: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        },
        {
            id: 2,
            title: 'In Progress Task',
            description: null,
            workspace: Workspace.WORK,
            channelId: null,
            status: TaskStatus.IN_PROGRESS,
            dueDate: null,
            isRoutine: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        },
        {
            id: 3,
            title: 'Done Task',
            description: 'Completed',
            workspace: Workspace.WORK,
            channelId: null,
            status: TaskStatus.DONE,
            dueDate: null,
            isRoutine: true,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        }
    ];

    beforeEach(async () => {
        mockTaskState = {
            currentWorkspaceTodayTasks: signal([mockTasks[0]]),
            currentWorkspaceInProgressTasks: signal([mockTasks[1]]),
            currentWorkspaceDoneTasks: signal([mockTasks[2]]),
            loadTasks: jest.fn(),
            addTask: jest.fn(),
            updateTask: jest.fn(),
            removeTask: jest.fn()
        };

        mockBoardPreferences = {
            layout: signal(BoardLayout.TRADITIONAL),
            toggleLayout: jest.fn()
        };

        mockTaskUtils = {
            getWorkspaceSeverity: jest.fn().mockReturnValue('success'),
            formatDate: jest.fn().mockReturnValue('Feb 1, 2025'),
            getChannelName: jest.fn().mockReturnValue('Work Channel')
        };

        await TestBed.configureTestingModule({
            imports: [KanbanBoardComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: TaskStateService, useValue: mockTaskState },
                { provide: BoardPreferencesService, useValue: mockBoardPreferences },
                { provide: TaskUtilsService, useValue: mockTaskUtils }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(KanbanBoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should call loadTasks on init', () => {
            expect(mockTaskState.loadTasks).toHaveBeenCalled();
        });

        it('should initialize with correct task lists', () => {
            expect(component.todayTasks().length).toBe(1);
            expect(component.inProgressTasks().length).toBe(1);
            expect(component.doneTasks().length).toBe(1);
        });

        it('should initialize sort mode to manual', () => {
            expect(component.currentSortMode()).toBe('manual');
        });
    });

    describe('Progress Calculation', () => {
        it('should calculate daily progress correctly', () => {
            const progress = component.dailyProgress();
            // 1 done out of 3 total tasks = 33%
            expect(progress).toBe(33);
        });

        it('should return 0 progress when no tasks', () => {
            (mockTaskState.currentWorkspaceTodayTasks as any).set([]);
            (mockTaskState.currentWorkspaceInProgressTasks as any).set([]);
            (mockTaskState.currentWorkspaceDoneTasks as any).set([]);

            fixture = TestBed.createComponent(KanbanBoardComponent);
            component = fixture.componentInstance;

            expect(component.dailyProgress()).toBe(0);
        });
    });

    describe('Dialog Management', () => {
        it('should show add task dialog', () => {
            expect(component.createTaskDialogVisible()).toBe(false);
            component.showAddTaskDialog();
            expect(component.createTaskDialogVisible()).toBe(true);
        });

        it('should hide create task dialog', () => {
            component.showAddTaskDialog();
            component.hideCreateTaskDialog();
            expect(component.createTaskDialogVisible()).toBe(false);
        });

        it('should open task details dialog', () => {
            const task = mockTasks[0];
            component.openTaskDetails(task);

            expect(component.selectedTask()).toBe(task);
            expect(component.showTaskDialog()).toBe(true);
        });

        it('should close task dialog', () => {
            component.openTaskDetails(mockTasks[0]);
            component.closeTaskDialog();

            expect(component.showTaskDialog()).toBe(false);
            expect(component.selectedTask()).toBeNull();
        });
    });

    describe('Task Operations', () => {
        it('should handle task submitted', () => {
            const createDto: CreateTaskDto = {
                title: 'New Task',
                workspace: Workspace.WORK,
                status: TaskStatus.TODAY,
                description: null,
                channelId: null,
                dueDate: null,
                isRoutine: false
            };

            component.handleTaskSubmitted(createDto);
            expect(mockTaskState.addTask).toHaveBeenCalledWith(createDto);
        });

        it('should move task to status', () => {
            const taskId = 1;
            const newStatus = TaskStatus.DONE;

            component.moveToStatus(taskId, newStatus);

            expect(mockTaskState.updateTask).toHaveBeenCalledWith(taskId, { status: newStatus });
            expect(component.showTaskDialog()).toBe(false);
        });

        it('should delete task after confirmation', () => {
            global.confirm = jest.fn(() => true);
            const taskId = 1;

            component.deleteTask(taskId);

            expect(mockTaskState.removeTask).toHaveBeenCalledWith(taskId);
            expect(component.showTaskDialog()).toBe(false);
        });

        it('should not delete task if not confirmed', () => {
            global.confirm = jest.fn(() => false);
            const taskId = 1;

            component.deleteTask(taskId);

            expect(mockTaskState.removeTask).not.toHaveBeenCalled();
        });
    });

    describe('Board Layout', () => {
        it('should toggle board layout', () => {
            component.toggleBoardLayout();
            expect(mockBoardPreferences.toggleLayout).toHaveBeenCalled();
        });

        it('should access current layout', () => {
            expect(component.currentLayout()).toBe(BoardLayout.TRADITIONAL);
        });
    });

    describe('Sort Functionality', () => {
        it('should cycle through sort modes', () => {
            expect(component.currentSortMode()).toBe('manual');

            component.toggleSort();
            expect(component.currentSortMode()).toBe('time');

            component.toggleSort();
            expect(component.currentSortMode()).toBe('priority');

            component.toggleSort();
            expect(component.currentSortMode()).toBe('alphabetical');

            component.toggleSort();
            expect(component.currentSortMode()).toBe('manual');
        });

        it('should return correct sort label for time mode', () => {
            component.currentSortMode.set('time');
            const label = component.getSortLabel();
            expect(label).toMatch(/\d{1,2}:\d{2}/); // Matches time format
        });

        it('should return correct sort label for priority mode', () => {
            component.currentSortMode.set('priority');
            expect(component.getSortLabel()).toBe('Priority');
        });

        it('should return correct sort label for alphabetical mode', () => {
            component.currentSortMode.set('alphabetical');
            expect(component.getSortLabel()).toBe('A-Z');
        });

        it('should return correct sort label for manual mode', () => {
            component.currentSortMode.set('manual');
            expect(component.getSortLabel()).toBe('Manual');
        });
    });

    describe('Drag and Drop', () => {
        it('should update task status on drop to different container', () => {
            const task = mockTasks[0];
            const event: any = {
                item: { data: task },
                previousContainer: { id: 'today-list' },
                container: { id: 'in-progress-list' }
            };

            component.onDrop(event, TaskStatus.IN_PROGRESS);

            expect(mockTaskState.updateTask).toHaveBeenCalledWith(
                task.id,
                { status: TaskStatus.IN_PROGRESS }
            );
        });

        it('should not update status when dropping in same container', () => {
            const task = mockTasks[0];
            const container = { id: 'today-list' };
            const event: any = {
                item: { data: task },
                previousContainer: container,
                container: container
            };

            component.onDrop(event, TaskStatus.TODAY);

            expect(mockTaskState.updateTask).not.toHaveBeenCalled();
        });

        it('should enforce WIP=1 in Focus mode', () => {
            mockBoardPreferences.layout.set(BoardLayout.FOCUS);
            (mockTaskState.currentWorkspaceInProgressTasks as any).set([mockTasks[1]]);

            fixture = TestBed.createComponent(KanbanBoardComponent);
            component = fixture.componentInstance;

            const task = mockTasks[0];
            const event: any = {
                item: { data: task },
                previousContainer: { id: 'today-list' },
                container: { id: 'in-progress-list' }
            };

            component.onDrop(event, TaskStatus.IN_PROGRESS);

            // Should move existing task back to TODAY
            expect(mockTaskState.updateTask).toHaveBeenCalledWith(
                mockTasks[1].id,
                { status: TaskStatus.TODAY }
            );

            // Should move new task to IN_PROGRESS
            expect(mockTaskState.updateTask).toHaveBeenCalledWith(
                task.id,
                { status: TaskStatus.IN_PROGRESS }
            );
        });

        it('should not swap tasks in Traditional mode', () => {
            const task = mockTasks[0];
            const event: any = {
                item: { data: task },
                previousContainer: { id: 'today-list' },
                container: { id: 'in-progress-list' }
            };

            component.onDrop(event, TaskStatus.IN_PROGRESS);

            // Should only update the dropped task
            expect(mockTaskState.updateTask).toHaveBeenCalledTimes(1);
            expect(mockTaskState.updateTask).toHaveBeenCalledWith(
                task.id,
                { status: TaskStatus.IN_PROGRESS }
            );
        });
    });

    describe('Utility Delegation', () => {
        it('should delegate getWorkspaceSeverity to utils service', () => {
            const severity = component.getWorkspaceSeverity(Workspace.WORK);
            expect(mockTaskUtils.getWorkspaceSeverity).toHaveBeenCalledWith(Workspace.WORK);
            expect(severity).toBe('success');
        });

        it('should delegate formatDate to utils service', () => {
            const date = new Date('2025-02-01');
            const formatted = component.formatDate(date);
            expect(mockTaskUtils.formatDate).toHaveBeenCalledWith(date);
            expect(formatted).toBe('Feb 1, 2025');
        });
    });
});
