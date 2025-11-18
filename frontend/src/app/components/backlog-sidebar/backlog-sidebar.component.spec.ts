import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { BacklogSidebarComponent } from './backlog-sidebar.component';
import { TaskStateService } from '../../services/task-state.service';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../models';
import { Workspace } from '../../models/workspace.enum';
import { TaskStatus } from '../../models/task-status.enum';

describe('BacklogSidebarComponent', () => {
    let component: BacklogSidebarComponent;
    let fixture: ComponentFixture<BacklogSidebarComponent>;
    let mockTaskStateService: jest.Mocked<Partial<TaskStateService>>;

    const mockTasks: Task[] = [
        {
            id: 1,
            title: 'Work Task 1',
            description: 'Description 1',
            workspace: Workspace.WORK,
            channelId: 1,
            status: TaskStatus.BACKLOG,
            dueDate: new Date('2025-02-01'),
            isRoutine: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        },
        {
            id: 2,
            title: 'Personal Task 1',
            description: 'Personal description',
            workspace: Workspace.PERSONAL,
            channelId: 3,
            status: TaskStatus.BACKLOG,
            dueDate: new Date('2025-02-15'),
            isRoutine: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        }
    ];

    beforeEach(async () => {
        mockTaskStateService = {
            backlogTasks: signal(mockTasks),
            selectedWorkspace: signal(Workspace.WORK),
            loadTasks: jest.fn(),
            addTask: jest.fn(),
            updateTask: jest.fn(),
            removeTask: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [BacklogSidebarComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: TaskStateService, useValue: mockTaskStateService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BacklogSidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should call loadTasks on init', () => {
            expect(mockTaskStateService.loadTasks).toHaveBeenCalled();
        });

        it('should initialize expandedPanels signal', () => {
            expect(component.expandedPanels()).toBeDefined();
        });

        it('should expand Work section when workspace is WORK', () => {
            (mockTaskStateService.selectedWorkspace as any).set(Workspace.WORK);
            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.expandedPanels()).toEqual([0]);
        });

        it('should expand Personal section when workspace is PERSONAL', () => {
            (mockTaskStateService.selectedWorkspace as any).set(Workspace.PERSONAL);
            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.expandedPanels()).toEqual([1]);
        });
    });

    describe('Task Filtering', () => {
        it('should filter work tasks correctly', () => {
            const workTasks = component.workTasks();
            expect(workTasks.length).toBe(1);
            expect(workTasks[0].workspace).toBe(Workspace.WORK);
        });

        it('should filter personal tasks correctly', () => {
            const personalTasks = component.personalTasks();
            expect(personalTasks.length).toBe(1);
            expect(personalTasks[0].workspace).toBe(Workspace.PERSONAL);
        });

        it('should calculate work task count correctly', () => {
            expect(component.workTaskCount()).toBe(1);
        });

        it('should calculate personal task count correctly', () => {
            expect(component.personalTaskCount()).toBe(1);
        });
    });

    describe('Dialog Management', () => {
        it('should show create task dialog', () => {
            expect(component.createTaskDialogVisible()).toBe(false);
            component.showCreateTaskDialog();
            expect(component.createTaskDialogVisible()).toBe(true);
        });

        it('should show task details dialog', () => {
            const task = mockTasks[0];
            expect(component.taskDetailsDialogVisible()).toBe(false);
            component.showTaskDetails(task);
            expect(component.taskDetailsDialogVisible()).toBe(true);
            expect(component.selectedTask()).toBe(task);
        });

        it('should hide task details dialog', () => {
            component.showTaskDetails(mockTasks[0]);
            component.hideTaskDetailsDialog();
            expect(component.taskDetailsDialogVisible()).toBe(false);
            expect(component.selectedTask()).toBeNull();
        });
    });

    describe('Task Operations', () => {
        it('should handle task submission', () => {
            const createDto: CreateTaskDto = {
                title: 'New Task',
                workspace: Workspace.WORK,
                status: TaskStatus.BACKLOG,
                description: null,
                channelId: null,
                dueDate: null,
                isRoutine: false
            };

            component.handleTaskSubmitted(createDto);
            expect(mockTaskStateService.addTask).toHaveBeenCalledWith(createDto);
        });

        it('should handle task update', () => {
            const task = mockTasks[0];
            const updateDto: UpdateTaskDto = {
                title: 'Updated Task'
            };

            component.selectedTask.set(task);
            component.handleTaskUpdated(updateDto);

            expect(mockTaskStateService.updateTask).toHaveBeenCalledWith(task.id, updateDto);
            expect(component.taskDetailsDialogVisible()).toBe(false);
        });

        it('should not update task if no task is selected', () => {
            const updateDto: UpdateTaskDto = {
                title: 'Updated Task'
            };

            component.selectedTask.set(null);
            component.handleTaskUpdated(updateDto);

            expect(mockTaskStateService.updateTask).not.toHaveBeenCalled();
        });

        it('should delete task after confirmation', () => {
            global.confirm = jest.fn(() => true);
            const task = mockTasks[0];
            component.selectedTask.set(task);

            component.confirmDeleteTask();

            expect(mockTaskStateService.removeTask).toHaveBeenCalledWith(task.id);
            expect(component.taskDetailsDialogVisible()).toBe(false);
            expect(component.selectedTask()).toBeNull();
        });

        it('should not delete task if not confirmed', () => {
            global.confirm = jest.fn(() => false);
            const task = mockTasks[0];
            component.selectedTask.set(task);

            component.confirmDeleteTask();

            expect(mockTaskStateService.removeTask).not.toHaveBeenCalled();
        });

        it('should not try to delete if no task is selected', () => {
            global.confirm = jest.fn(() => true);
            component.selectedTask.set(null);
            component.confirmDeleteTask();

            expect(global.confirm).not.toHaveBeenCalled();
            expect(mockTaskStateService.removeTask).not.toHaveBeenCalled();
        });
    });

    describe('Drag and Drop', () => {
        it('should update task status to BACKLOG on drop', () => {
            const task = { ...mockTasks[0], status: TaskStatus.TODAY };
            const event: any = {
                item: { data: task },
                previousContainer: { id: 'today-list' },
                container: { id: 'work-backlog-list' }
            };

            component.onDrop(event);

            expect(mockTaskStateService.updateTask).toHaveBeenCalledWith(
                task.id,
                { status: TaskStatus.BACKLOG }
            );
        });

        it('should not update status if already BACKLOG', () => {
            const task = mockTasks[0]; // Already BACKLOG
            const event: any = {
                item: { data: task }
            };

            component.onDrop(event);

            expect(mockTaskStateService.updateTask).not.toHaveBeenCalled();
        });
    });

    describe('Keyboard Shortcuts', () => {
        it('should open create task dialog on Ctrl+K', () => {
            const event = new KeyboardEvent('keydown', {
                key: 'k',
                ctrlKey: true
            });

            component.handleKeyboardShortcut(event);

            expect(component.createTaskDialogVisible()).toBe(true);
        });

        it('should open create task dialog on Cmd+K (Mac)', () => {
            const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true
            });

            component.handleKeyboardShortcut(event);

            expect(component.createTaskDialogVisible()).toBe(true);
        });

        it('should not open dialog for other keys', () => {
            const event = new KeyboardEvent('keydown', {
                key: 'a',
                ctrlKey: true
            });

            component.handleKeyboardShortcut(event);

            expect(component.createTaskDialogVisible()).toBe(false);
        });
    });
});
