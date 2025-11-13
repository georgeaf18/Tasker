import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ConfirmationService, Confirmation } from 'primeng/api';

import { BacklogSidebarComponent } from './backlog-sidebar.component';
import { TaskStateService } from '../../services/task-state.service';
import { ChannelApiService } from '../../services/channel-api.service';
import { Task, Channel, CreateTaskDto } from '../../models';
import { Workspace } from '../../models/workspace.enum';
import { TaskStatus } from '../../models/task-status.enum';

describe('BacklogSidebarComponent', () => {
    let component: BacklogSidebarComponent;
    let fixture: ComponentFixture<BacklogSidebarComponent>;
    let mockTaskStateService: jest.Mocked<Partial<TaskStateService>>;
    let mockChannelApiService: jest.Mocked<Partial<ChannelApiService>>;
    let mockConfirmationService: jest.Mocked<Partial<ConfirmationService>>;

    // Mock data
    const mockChannels: Channel[] = [
        {
            id: 1,
            name: 'Frontend',
            workspace: Workspace.WORK,
            color: '#6B9AC4',
            createdAt: new Date('2025-01-01')
        },
        {
            id: 2,
            name: 'Backend',
            workspace: Workspace.WORK,
            color: '#7A9B76',
            createdAt: new Date('2025-01-01')
        },
        {
            id: 3,
            name: 'Home',
            workspace: Workspace.PERSONAL,
            color: '#8B7BB8',
            createdAt: new Date('2025-01-01')
        },
        {
            id: 4,
            name: 'Learning',
            workspace: Workspace.PERSONAL,
            color: '#6B9AC4',
            createdAt: new Date('2025-01-01')
        }
    ];

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
            title: 'Work Task 2',
            description: null,
            workspace: Workspace.WORK,
            channelId: 2,
            status: TaskStatus.BACKLOG,
            dueDate: null,
            isRoutine: true,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        },
        {
            id: 3,
            title: 'Personal Task 1',
            description: 'Personal description',
            workspace: Workspace.PERSONAL,
            channelId: 3,
            status: TaskStatus.BACKLOG,
            dueDate: new Date('2025-02-15'),
            isRoutine: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        },
        {
            id: 4,
            title: 'Personal Task 2',
            description: 'Another task',
            workspace: Workspace.PERSONAL,
            channelId: null,
            status: TaskStatus.BACKLOG,
            dueDate: null,
            isRoutine: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        },
        {
            id: 5,
            title: 'Today Task',
            description: 'Should not appear in backlog',
            workspace: Workspace.WORK,
            channelId: 1,
            status: TaskStatus.TODAY,
            dueDate: null,
            isRoutine: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        }
    ];

    beforeEach(async () => {
        // Create mocks with signal support
        const backlogTasksSignal = signal<Task[]>(mockTasks.filter(t => t.status === TaskStatus.BACKLOG));
        const selectedWorkspaceSignal = signal<Workspace>(Workspace.WORK);

        mockTaskStateService = {
            loadTasks: jest.fn(),
            addTask: jest.fn(),
            updateTask: jest.fn(),
            removeTask: jest.fn(),
            backlogTasks: backlogTasksSignal,
            selectedWorkspace: selectedWorkspaceSignal
        };

        mockChannelApiService = {
            getChannels: jest.fn().mockReturnValue(of(mockChannels))
        };

        mockConfirmationService = {
            confirm: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [
                BacklogSidebarComponent,
                ReactiveFormsModule
            ],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: TaskStateService, useValue: mockTaskStateService },
                { provide: ChannelApiService, useValue: mockChannelApiService },
                { provide: ConfirmationService, useValue: mockConfirmationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BacklogSidebarComponent);
        component = fixture.componentInstance;
    });

    describe('Component Creation and Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with default form values', () => {
            expect(component.createTaskForm).toBeDefined();
            expect(component.editTaskForm).toBeDefined();
            expect(component.createTaskForm.get('workspace')?.value).toBe(Workspace.PERSONAL);
            expect(component.createTaskForm.get('status')?.value).toBe(TaskStatus.BACKLOG);
            expect(component.createTaskForm.get('isRoutine')?.value).toBe(false);
        });

        it('should have required validators on title fields', () => {
            const createTitleControl = component.createTaskForm.get('title');
            const editTitleControl = component.editTaskForm.get('title');

            expect(createTitleControl?.hasError('required')).toBe(true);
            expect(editTitleControl?.hasError('required')).toBe(true);

            createTitleControl?.setValue('Test Title');
            editTitleControl?.setValue('Test Title');

            expect(createTitleControl?.hasError('required')).toBe(false);
            expect(editTitleControl?.hasError('required')).toBe(false);
        });

        it('should call loadTasks and loadChannels on ngOnInit', () => {
            fixture.detectChanges(); // Triggers ngOnInit

            expect(mockTaskStateService.loadTasks).toHaveBeenCalled();
            expect(mockChannelApiService.getChannels).toHaveBeenCalled();
        });

        it('should initialize dialog visibility signals to false', () => {
            expect(component.createTaskDialogVisible()).toBe(false);
            expect(component.taskDetailsDialogVisible()).toBe(false);
        });

        it('should initialize selectedTask signal to null', () => {
            expect(component.selectedTask()).toBeNull();
        });

        it('should initialize expandedPanels signal', () => {
            expect(component.expandedPanels).toBeDefined();
        });

        it('should have workspace options configured', () => {
            expect(component.workspaceOptions).toEqual([
                { label: 'Work', value: Workspace.WORK },
                { label: 'Personal', value: Workspace.PERSONAL }
            ]);
        });

        it('should have status options configured', () => {
            expect(component.statusOptions).toEqual([
                { label: 'Backlog', value: TaskStatus.BACKLOG },
                { label: 'Today', value: TaskStatus.TODAY }
            ]);
        });

        it('should have required validator on status field', () => {
            const statusControl = component.createTaskForm.get('status');

            expect(statusControl?.hasError('required')).toBe(false); // Has default value

            statusControl?.setValue(null);
            expect(statusControl?.hasError('required')).toBe(true);

            statusControl?.setValue(TaskStatus.TODAY);
            expect(statusControl?.hasError('required')).toBe(false);
        });
    });

    describe('Computed Signal: backlogTasks()', () => {
        it('should return only tasks with BACKLOG status', () => {
            fixture.detectChanges();

            const backlogTasks = component.backlogTasks();

            expect(backlogTasks.length).toBe(4);
            expect(backlogTasks.every(t => t.status === TaskStatus.BACKLOG)).toBe(true);
            expect(backlogTasks.find(t => t.id === 5)).toBeUndefined(); // TODAY task excluded
        });

        it('should return empty array when no backlog tasks exist', () => {
            const emptyBacklogSignal = signal<Task[]>([]);
            Object.defineProperty(mockTaskStateService, 'backlogTasks', {
                get: () => emptyBacklogSignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.backlogTasks()).toEqual([]);
        });
    });

    describe('Computed Signals: workTaskCount() and personalTaskCount()', () => {
        it('should correctly count work tasks', () => {
            fixture.detectChanges();

            const workCount = component.workTaskCount();
            const expectedWorkTasks = mockTasks.filter(
                t => t.status === TaskStatus.BACKLOG && t.workspace === Workspace.WORK
            );

            expect(workCount).toBe(expectedWorkTasks.length);
            expect(workCount).toBe(2); // Based on mockTasks
        });

        it('should correctly count personal tasks', () => {
            fixture.detectChanges();

            const personalCount = component.personalTaskCount();
            const expectedPersonalTasks = mockTasks.filter(
                t => t.status === TaskStatus.BACKLOG && t.workspace === Workspace.PERSONAL
            );

            expect(personalCount).toBe(expectedPersonalTasks.length);
            expect(personalCount).toBe(2); // Based on mockTasks
        });

        it('should return 0 when no work tasks exist', () => {
            const personalOnlySignal = signal<Task[]>(
                mockTasks.filter(t => t.status === TaskStatus.BACKLOG && t.workspace === Workspace.PERSONAL)
            );
            Object.defineProperty(mockTaskStateService, 'backlogTasks', {
                get: () => personalOnlySignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.workTaskCount()).toBe(0);
            expect(component.personalTaskCount()).toBe(2);
        });

        it('should return 0 when no personal tasks exist', () => {
            const workOnlySignal = signal<Task[]>(
                mockTasks.filter(t => t.status === TaskStatus.BACKLOG && t.workspace === Workspace.WORK)
            );
            Object.defineProperty(mockTaskStateService, 'backlogTasks', {
                get: () => workOnlySignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.workTaskCount()).toBe(2);
            expect(component.personalTaskCount()).toBe(0);
        });
    });

    describe('Computed Signals: workTasks() and personalTasks()', () => {
        it('should return only work tasks', () => {
            fixture.detectChanges();

            const workTasks = component.workTasks();

            expect(workTasks.length).toBe(2);
            expect(workTasks.every(t => t.workspace === Workspace.WORK)).toBe(true);
            expect(workTasks.every(t => t.status === TaskStatus.BACKLOG)).toBe(true);
        });

        it('should return only personal tasks', () => {
            fixture.detectChanges();

            const personalTasks = component.personalTasks();

            expect(personalTasks.length).toBe(2);
            expect(personalTasks.every(t => t.workspace === Workspace.PERSONAL)).toBe(true);
            expect(personalTasks.every(t => t.status === TaskStatus.BACKLOG)).toBe(true);
        });

        it('should return empty array when no work tasks exist', () => {
            const personalOnlySignal = signal<Task[]>(
                mockTasks.filter(t => t.status === TaskStatus.BACKLOG && t.workspace === Workspace.PERSONAL)
            );
            Object.defineProperty(mockTaskStateService, 'backlogTasks', {
                get: () => personalOnlySignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.workTasks()).toEqual([]);
        });

        it('should return empty array when no personal tasks exist', () => {
            const workOnlySignal = signal<Task[]>(
                mockTasks.filter(t => t.status === TaskStatus.BACKLOG && t.workspace === Workspace.WORK)
            );
            Object.defineProperty(mockTaskStateService, 'backlogTasks', {
                get: () => workOnlySignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.personalTasks()).toEqual([]);
        });
    });

    describe('Effect: Auto-expand accordion based on workspace', () => {
        it('should expand Work section when workspace is WORK', () => {
            const selectedWorkspaceSignal = signal<Workspace>(Workspace.WORK);
            Object.defineProperty(mockTaskStateService, 'selectedWorkspace', {
                get: () => selectedWorkspaceSignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.expandedPanels()).toEqual([0]); // Work is index 0
        });

        it('should expand Personal section when workspace is PERSONAL', () => {
            const selectedWorkspaceSignal = signal<Workspace>(Workspace.PERSONAL);
            Object.defineProperty(mockTaskStateService, 'selectedWorkspace', {
                get: () => selectedWorkspaceSignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.expandedPanels()).toEqual([1]); // Personal is index 1
        });

        it('should update expanded panels when workspace changes', () => {
            const selectedWorkspaceSignal = signal<Workspace>(Workspace.WORK);
            Object.defineProperty(mockTaskStateService, 'selectedWorkspace', {
                get: () => selectedWorkspaceSignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.expandedPanels()).toEqual([0]); // Work expanded

            // Change workspace to PERSONAL
            selectedWorkspaceSignal.set(Workspace.PERSONAL);
            fixture.detectChanges();

            expect(component.expandedPanels()).toEqual([1]); // Personal expanded
        });
    });

    describe('Computed Signal: groupedByWorkspace()', () => {
        beforeEach(() => {
            fixture.detectChanges();
            // Manually set channels since ngOnInit loads them
            component['channelsSignal'].set(mockChannels);
        });

        it('should group tasks by workspace', () => {
            const grouped = component.groupedByWorkspace();

            expect(grouped.length).toBe(2);
            expect(grouped[0].workspace).toBe(Workspace.WORK);
            expect(grouped[0].workspaceName).toBe('Work');
            expect(grouped[1].workspace).toBe(Workspace.PERSONAL);
            expect(grouped[1].workspaceName).toBe('Personal');
        });

        it('should group tasks by channel within workspace', () => {
            const grouped = component.groupedByWorkspace();

            const workGroup = grouped.find(g => g.workspace === Workspace.WORK);
            expect(workGroup?.channels.length).toBe(2); // 2 channels with tasks

            const frontendChannel = workGroup?.channels.find(c => c.channelName === 'Frontend');
            expect(frontendChannel?.tasks.length).toBe(1);
            expect(frontendChannel?.tasks[0].id).toBe(1);

            const backendChannel = workGroup?.channels.find(c => c.channelName === 'Backend');
            expect(backendChannel?.tasks.length).toBe(1);
            expect(backendChannel?.tasks[0].id).toBe(2);
        });

        it('should handle tasks without channelId as "Uncategorized"', () => {
            const grouped = component.groupedByWorkspace();

            const personalGroup = grouped.find(g => g.workspace === Workspace.PERSONAL);
            const uncategorizedChannel = personalGroup?.channels.find(c => c.channelName === 'Uncategorized');

            expect(uncategorizedChannel).toBeDefined();
            expect(uncategorizedChannel?.tasks.length).toBe(1);
            expect(uncategorizedChannel?.tasks[0].id).toBe(4);
        });

        it('should include channel data when available', () => {
            const grouped = component.groupedByWorkspace();

            const workGroup = grouped.find(g => g.workspace === Workspace.WORK);
            const frontendChannel = workGroup?.channels.find(c => c.channelName === 'Frontend');

            expect(frontendChannel?.channel).toBeDefined();
            expect(frontendChannel?.channel?.id).toBe(1);
            expect(frontendChannel?.channel?.name).toBe('Frontend');
        });

        it('should handle missing channel data gracefully', () => {
            // Add a task with channelId that doesn't exist in mockChannels
            const backlogSignal = signal<Task[]>([
                ...mockTasks.filter(t => t.status === TaskStatus.BACKLOG),
                {
                    id: 99,
                    title: 'Orphan Task',
                    description: 'Has channelId but channel not found',
                    workspace: Workspace.WORK,
                    channelId: 999, // Non-existent channel
                    status: TaskStatus.BACKLOG,
                    dueDate: null,
                    isRoutine: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ]);

            Object.defineProperty(mockTaskStateService, 'backlogTasks', {
                get: () => backlogSignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            component['channelsSignal'].set(mockChannels);
            fixture.detectChanges();

            const grouped = component.groupedByWorkspace();
            const workGroup = grouped.find(g => g.workspace === Workspace.WORK);

            // Should still create a channel group, but with null channel
            expect(workGroup?.channels.some(c => c.channel === null && c.tasks.some(t => t.id === 99))).toBe(true);
        });

        it('should return empty array when no backlog tasks exist', () => {
            const emptySignal = signal<Task[]>([]);
            Object.defineProperty(mockTaskStateService, 'backlogTasks', {
                get: () => emptySignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.groupedByWorkspace()).toEqual([]);
        });

        it('should only include workspaces that have tasks', () => {
            const workOnlySignal = signal<Task[]>(mockTasks.filter(t =>
                t.status === TaskStatus.BACKLOG && t.workspace === Workspace.WORK
            ));
            Object.defineProperty(mockTaskStateService, 'backlogTasks', {
                get: () => workOnlySignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            component['channelsSignal'].set(mockChannels);
            fixture.detectChanges();

            const grouped = component.groupedByWorkspace();

            expect(grouped.length).toBe(1);
            expect(grouped[0].workspace).toBe(Workspace.WORK);
        });
    });

    describe('Computed Signal: filteredChannels()', () => {
        beforeEach(async () => {
            // Trigger ngOnInit which loads channels
            fixture.detectChanges();
            // Wait for channels to load from async observable
            await new Promise(resolve => setTimeout(resolve, 150));
        });

        it('should filter channels by workspace in create form', () => {
            // Verify channels are loaded
            expect(component.channels().length).toBeGreaterThan(0);

            // The computed signal returns different values based on form value
            // Check default (PERSONAL from constructor)
            let filtered = component.filteredChannels();
            expect(filtered.every(c => c.workspace === Workspace.PERSONAL)).toBe(true);

            // Change the form and trigger a new signal by modifying channels (which the computed tracks)
            component.createTaskForm.patchValue({ workspace: Workspace.WORK });

            // Trigger a channels signal update to force recomputation
            const currentChannels = component.channels();
            component['channelsSignal'].set([...currentChannels]); // Create new array reference

            filtered = component.filteredChannels();
            expect(filtered.length).toBe(2);
            expect(filtered.every(c => c.workspace === Workspace.WORK)).toBe(true);
            expect(filtered.map(c => c.name)).toEqual(['Frontend', 'Backend']);
        });

        it('should return personal channels when personal workspace selected', () => {
            component.createTaskForm.patchValue({ workspace: Workspace.PERSONAL });
            fixture.detectChanges();

            const filtered = component.filteredChannels();

            expect(filtered.length).toBe(2);
            expect(filtered.every(c => c.workspace === Workspace.PERSONAL)).toBe(true);
            expect(filtered.map(c => c.name)).toEqual(['Home', 'Learning']);
        });

        it('should return empty array when no workspace selected', () => {
            // Skip channel verification since this test focuses on null workspace
            // Create a new form with null workspace (not PERSONAL default)
            const form = component.createTaskForm;
            form.reset();

            // Force recompute by updating channels signal
            const currentChannels = component.channels();
            component['channelsSignal'].set([...currentChannels]);

            const filtered = component.filteredChannels();

            expect(filtered).toEqual([]);
        });

        it('should update when workspace changes', () => {
            // Wait for channels to be loaded in beforeEach
            const currentChannels = component.channels();
            expect(currentChannels.length).toBeGreaterThan(0);

            component.createTaskForm.patchValue({ workspace: Workspace.WORK });
            component['channelsSignal'].set([...currentChannels]); // Force recompute
            expect(component.filteredChannels().length).toBe(2);

            component.createTaskForm.patchValue({ workspace: Workspace.PERSONAL });
            component['channelsSignal'].set([...currentChannels]); // Force recompute
            expect(component.filteredChannels().length).toBe(2);
        });
    });

    describe('Task Creation Dialog', () => {
        it('should show create task dialog', () => {
            expect(component.createTaskDialogVisible()).toBe(false);

            component.showCreateTaskDialog();

            expect(component.createTaskDialogVisible()).toBe(true);
        });

        it('should reset create form when showing dialog', () => {
            component.createTaskForm.patchValue({
                title: 'Old Title',
                description: 'Old Description',
                status: TaskStatus.TODAY,
                workspace: Workspace.WORK,
                channelId: 1,
                dueDate: new Date(),
                isRoutine: true
            });

            component.showCreateTaskDialog();

            expect(component.createTaskForm.get('title')?.value).toBe(null);
            expect(component.createTaskForm.get('description')?.value).toBe(null);
            expect(component.createTaskForm.get('status')?.value).toBe(TaskStatus.BACKLOG);
            expect(component.createTaskForm.get('workspace')?.value).toBe(Workspace.PERSONAL);
            expect(component.createTaskForm.get('channelId')?.value).toBe(null);
            expect(component.createTaskForm.get('dueDate')?.value).toBe(null);
            expect(component.createTaskForm.get('isRoutine')?.value).toBe(false);
        });

        it('should hide create task dialog', () => {
            component.createTaskDialogVisible.set(true);

            component.hideCreateTaskDialog();

            expect(component.createTaskDialogVisible()).toBe(false);
        });
    });

    describe('Task Creation Form Submission', () => {
        it('should submit create task when form is valid', () => {
            const taskDto: CreateTaskDto = {
                title: 'New Task',
                description: 'Task description',
                workspace: Workspace.WORK,
                channelId: 1,
                dueDate: new Date('2025-03-01'),
                isRoutine: true
            };

            component.createTaskForm.patchValue(taskDto);
            component.createTaskDialogVisible.set(true);

            component.submitCreateTask();

            expect(mockTaskStateService.addTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...taskDto,
                    status: TaskStatus.BACKLOG
                })
            );
            expect(component.createTaskDialogVisible()).toBe(false);
        });

        it('should not submit create task when form is invalid', () => {
            component.createTaskForm.patchValue({
                title: '', // Invalid: required field
                workspace: Workspace.WORK
            });

            component.submitCreateTask();

            expect(mockTaskStateService.addTask).not.toHaveBeenCalled();
            expect(component.createTaskDialogVisible()).toBe(false); // Still false
        });

        it('should include BACKLOG status in created task by default', () => {
            component.createTaskForm.patchValue({
                title: 'Test Task',
                workspace: Workspace.PERSONAL
            });

            component.submitCreateTask();

            expect(mockTaskStateService.addTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: TaskStatus.BACKLOG
                })
            );
        });

        it('should include selected status (TODAY) in created task', () => {
            component.createTaskForm.patchValue({
                title: 'Today Task',
                workspace: Workspace.WORK,
                status: TaskStatus.TODAY
            });

            component.submitCreateTask();

            expect(mockTaskStateService.addTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Today Task',
                    status: TaskStatus.TODAY
                })
            );
        });

        it('should handle optional fields in create task', () => {
            component.createTaskForm.patchValue({
                title: 'Minimal Task',
                workspace: Workspace.PERSONAL,
                description: null,
                channelId: null,
                dueDate: null,
                isRoutine: false
            });

            component.submitCreateTask();

            expect(mockTaskStateService.addTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Minimal Task',
                    description: null,
                    channelId: null
                })
            );
        });
    });

    describe('Task Details Dialog', () => {
        const testTask: Task = {
            id: 1,
            title: 'Test Task',
            description: 'Test Description',
            workspace: Workspace.WORK,
            channelId: 1,
            status: TaskStatus.BACKLOG,
            dueDate: new Date('2025-02-01'),
            isRoutine: true,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        };

        it('should show task details dialog', () => {
            expect(component.taskDetailsDialogVisible()).toBe(false);

            component.showTaskDetails(testTask);

            expect(component.taskDetailsDialogVisible()).toBe(true);
        });

        it('should set selected task when showing details', () => {
            component.showTaskDetails(testTask);

            expect(component.selectedTask()).toEqual(testTask);
        });

        it('should populate edit form with task data', () => {
            component.showTaskDetails(testTask);

            expect(component.editTaskForm.get('title')?.value).toBe(testTask.title);
            expect(component.editTaskForm.get('description')?.value).toBe(testTask.description);
            expect(component.editTaskForm.get('workspace')?.value).toBe(testTask.workspace);
            expect(component.editTaskForm.get('channelId')?.value).toBe(testTask.channelId);
            expect(component.editTaskForm.get('isRoutine')?.value).toBe(testTask.isRoutine);
        });

        it('should convert dueDate string to Date object in edit form', () => {
            component.showTaskDetails(testTask);

            const dueDate = component.editTaskForm.get('dueDate')?.value;
            expect(dueDate).toBeInstanceOf(Date);
        });

        it('should handle null dueDate in edit form', () => {
            const taskWithoutDueDate = { ...testTask, dueDate: null };

            component.showTaskDetails(taskWithoutDueDate);

            expect(component.editTaskForm.get('dueDate')?.value).toBeNull();
        });

        it('should hide task details dialog', () => {
            component.showTaskDetails(testTask);
            expect(component.taskDetailsDialogVisible()).toBe(true);

            component.hideTaskDetailsDialog();

            expect(component.taskDetailsDialogVisible()).toBe(false);
        });

        it('should clear selected task when hiding dialog', () => {
            component.showTaskDetails(testTask);
            expect(component.selectedTask()).not.toBeNull();

            component.hideTaskDetailsDialog();

            expect(component.selectedTask()).toBeNull();
        });
    });

    describe('Task Edit Form Submission', () => {
        const testTask: Task = {
            id: 1,
            title: 'Original Title',
            description: 'Original Description',
            workspace: Workspace.WORK,
            channelId: 1,
            status: TaskStatus.BACKLOG,
            dueDate: new Date('2025-02-01'),
            isRoutine: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        };

        beforeEach(() => {
            component.showTaskDetails(testTask);
        });

        it('should submit edit task when form is valid', () => {
            component.editTaskForm.patchValue({
                title: 'Updated Title',
                description: 'Updated Description',
                workspace: Workspace.PERSONAL
            });

            component.submitEditTask();

            expect(mockTaskStateService.updateTask).toHaveBeenCalledWith(
                testTask.id,
                component.editTaskForm.value
            );
            expect(component.taskDetailsDialogVisible()).toBe(false);
            expect(component.selectedTask()).toBeNull();
        });

        it('should not submit edit task when form is invalid', () => {
            component.editTaskForm.patchValue({
                title: '' // Invalid: required field
            });

            component.submitEditTask();

            expect(mockTaskStateService.updateTask).not.toHaveBeenCalled();
        });

        it('should not submit edit task when no task is selected', () => {
            component.selectedTask.set(null);

            component.submitEditTask();

            expect(mockTaskStateService.updateTask).not.toHaveBeenCalled();
        });

        it('should handle partial updates', () => {
            const originalValues = component.editTaskForm.value;
            component.editTaskForm.patchValue({
                title: 'Only Title Changed'
            });

            component.submitEditTask();

            expect(mockTaskStateService.updateTask).toHaveBeenCalledWith(
                testTask.id,
                expect.objectContaining({
                    title: 'Only Title Changed'
                })
            );
        });
    });

    describe('Task Deletion', () => {
        const testTask: Task = {
            id: 1,
            title: 'Task to Delete',
            description: 'This will be deleted',
            workspace: Workspace.WORK,
            channelId: 1,
            status: TaskStatus.BACKLOG,
            dueDate: null,
            isRoutine: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        };

        let confirmationServiceInstance: ConfirmationService;

        beforeEach(() => {
            // Get the actual ConfirmationService instance from the component's injector
            confirmationServiceInstance = fixture.debugElement.injector.get(ConfirmationService);
            jest.spyOn(confirmationServiceInstance, 'confirm');
            component.showTaskDetails(testTask);
        });

        it('should show confirmation dialog when deleting task', () => {
            component.confirmDeleteTask();

            expect(confirmationServiceInstance.confirm).toHaveBeenCalled();
        });

        it('should include task title in confirmation message', () => {
            component.confirmDeleteTask();

            expect(confirmationServiceInstance.confirm).toHaveBeenCalled();
            const confirmCall = (confirmationServiceInstance.confirm as jest.Mock).mock.calls[0][0];
            expect(confirmCall.message).toContain(testTask.title);
        });

        it('should set confirmation dialog header and icon', () => {
            component.confirmDeleteTask();

            const confirmCall = (confirmationServiceInstance.confirm as jest.Mock).mock.calls[0][0];
            expect(confirmCall.header).toBe('Confirm Delete');
            expect(confirmCall.icon).toBe('pi pi-exclamation-triangle');
        });

        it('should delete task when user confirms', () => {
            component.confirmDeleteTask();

            const confirmCall = (confirmationServiceInstance.confirm as jest.Mock).mock.calls[0][0];
            confirmCall.accept!(); // Simulate user clicking "confirm"

            expect(mockTaskStateService.removeTask).toHaveBeenCalledWith(testTask.id);
            expect(component.taskDetailsDialogVisible()).toBe(false);
            expect(component.selectedTask()).toBeNull();
        });

        it('should not delete task when no task is selected', () => {
            // Clear the spy and mock from beforeEach
            jest.clearAllMocks();
            jest.spyOn(confirmationServiceInstance, 'confirm');

            component.selectedTask.set(null);

            component.confirmDeleteTask();

            expect(confirmationServiceInstance.confirm).not.toHaveBeenCalled();
            expect(mockTaskStateService.removeTask).not.toHaveBeenCalled();
        });

        it('should not close dialog if user cancels deletion', () => {
            component.confirmDeleteTask();

            // Don't call accept(), simulating user clicking "cancel"
            const confirmCall = (confirmationServiceInstance.confirm as jest.Mock).mock.calls[0][0];

            // Dialog should remain open
            expect(component.taskDetailsDialogVisible()).toBe(true);
            expect(component.selectedTask()).not.toBeNull();
        });
    });

    describe('Channel Loading', () => {
        it('should load channels from service', () => {
            component.loadChannels();

            expect(mockChannelApiService.getChannels).toHaveBeenCalled();
        });

        it('should update channels signal on successful load', (done) => {
            component.loadChannels();

            setTimeout(() => {
                expect(component.channels()).toEqual(mockChannels);
                done();
            }, 150); // Wait for delay(100) in mock
        });

        it('should handle channel loading error', (done) => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            (mockChannelApiService.getChannels as jest.Mock).mockReturnValue(
                throwError(() => new Error('Failed to load channels'))
            );

            component.loadChannels();

            setTimeout(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Error loading channels:',
                    expect.any(Error)
                );
                consoleErrorSpy.mockRestore();
                done();
            }, 10);
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete task creation flow', () => {
            fixture.detectChanges();

            // User clicks "Create Task"
            component.showCreateTaskDialog();
            expect(component.createTaskDialogVisible()).toBe(true);

            // User fills form
            component.createTaskForm.patchValue({
                title: 'Integration Test Task',
                description: 'Testing the full flow',
                workspace: Workspace.WORK,
                channelId: 1,
                dueDate: new Date('2025-03-01'),
                isRoutine: false
            });

            // User submits
            component.submitCreateTask();

            expect(mockTaskStateService.addTask).toHaveBeenCalled();
            expect(component.createTaskDialogVisible()).toBe(false);
        });

        it('should handle complete task edit flow', () => {
            const task = mockTasks[0];
            fixture.detectChanges();

            // User clicks task to view details
            component.showTaskDetails(task);
            expect(component.taskDetailsDialogVisible()).toBe(true);
            expect(component.selectedTask()?.id).toBe(task.id);

            // User edits task
            component.editTaskForm.patchValue({
                title: 'Updated Title',
                description: 'Updated Description'
            });

            // User saves
            component.submitEditTask();

            expect(mockTaskStateService.updateTask).toHaveBeenCalledWith(
                task.id,
                expect.objectContaining({
                    title: 'Updated Title',
                    description: 'Updated Description'
                })
            );
            expect(component.taskDetailsDialogVisible()).toBe(false);
        });

        it('should handle complete task deletion flow', () => {
            const task = mockTasks[0];
            fixture.detectChanges();

            // Get the confirmation service instance
            const confirmationService = fixture.debugElement.injector.get(ConfirmationService);
            jest.spyOn(confirmationService, 'confirm');

            // User opens task details
            component.showTaskDetails(task);

            // User clicks delete
            component.confirmDeleteTask();
            expect(confirmationService.confirm).toHaveBeenCalled();

            // User confirms deletion
            const confirmCall = (confirmationService.confirm as jest.Mock).mock.calls[0][0];
            confirmCall.accept!();

            expect(mockTaskStateService.removeTask).toHaveBeenCalledWith(task.id);
            expect(component.taskDetailsDialogVisible()).toBe(false);
        });

        it('should filter channels based on workspace selection', async () => {
            fixture.detectChanges();
            // Wait for channels to load
            await new Promise(resolve => setTimeout(resolve, 150));

            // Verify channels are loaded
            expect(component.channels().length).toBeGreaterThan(0);
            const currentChannels = component.channels();

            // Initially PERSONAL workspace
            expect(component.createTaskForm.get('workspace')?.value).toBe(Workspace.PERSONAL);
            let filtered = component.filteredChannels();
            expect(filtered.length).toBe(2);
            expect(filtered.every(c => c.workspace === Workspace.PERSONAL)).toBe(true);

            // Switch to WORK workspace
            component.createTaskForm.patchValue({ workspace: Workspace.WORK });
            component['channelsSignal'].set([...currentChannels]); // Force recompute
            filtered = component.filteredChannels();
            expect(filtered.length).toBe(2);
            expect(filtered.every(c => c.workspace === Workspace.WORK)).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty task list', () => {
            const emptySignal = signal<Task[]>([]);
            Object.defineProperty(mockTaskStateService, 'backlogTasks', {
                get: () => emptySignal
            });

            fixture = TestBed.createComponent(BacklogSidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.backlogTasks()).toEqual([]);
            expect(component.groupedByWorkspace()).toEqual([]);
        });

        it('should handle empty channel list', () => {
            fixture.detectChanges();
            component['channelsSignal'].set([]);

            const grouped = component.groupedByWorkspace();

            // Tasks should still be grouped, but without channel data
            expect(grouped.length).toBeGreaterThan(0);
            grouped.forEach(workspace => {
                workspace.channels.forEach(channelGroup => {
                    if (channelGroup.channelName !== 'Uncategorized') {
                        expect(channelGroup.channel).toBeNull();
                    }
                });
            });
        });

        it('should handle form with only required fields', () => {
            component.createTaskForm.patchValue({
                title: 'Minimal Task',
                workspace: Workspace.WORK
            });

            expect(component.createTaskForm.valid).toBe(true);

            component.submitCreateTask();

            expect(mockTaskStateService.addTask).toHaveBeenCalled();
        });

        it('should handle task with all null optional fields', () => {
            const minimalTask: Task = {
                id: 99,
                title: 'Minimal',
                description: null,
                workspace: Workspace.PERSONAL,
                channelId: null,
                status: TaskStatus.BACKLOG,
                dueDate: null,
                isRoutine: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            component.showTaskDetails(minimalTask);

            expect(component.editTaskForm.get('description')?.value).toBeNull();
            expect(component.editTaskForm.get('channelId')?.value).toBeNull();
            expect(component.editTaskForm.get('dueDate')?.value).toBeNull();
        });

        it('should handle rapid dialog open/close', () => {
            component.showCreateTaskDialog();
            component.hideCreateTaskDialog();
            component.showCreateTaskDialog();
            component.hideCreateTaskDialog();

            expect(component.createTaskDialogVisible()).toBe(false);
        });

        it('should handle switching tasks in details dialog', () => {
            const task1 = mockTasks[0];
            const task2 = mockTasks[1];

            component.showTaskDetails(task1);
            expect(component.selectedTask()?.id).toBe(task1.id);

            component.showTaskDetails(task2);
            expect(component.selectedTask()?.id).toBe(task2.id);
        });
    });

    describe('Form Validation', () => {
        it('should mark createTaskForm as invalid when title is empty', () => {
            component.createTaskForm.patchValue({
                title: '',
                workspace: Workspace.WORK
            });

            expect(component.createTaskForm.valid).toBe(false);
            expect(component.createTaskForm.get('title')?.hasError('required')).toBe(true);
        });

        it('should mark editTaskForm as invalid when title is empty', () => {
            component.editTaskForm.patchValue({
                title: '',
                workspace: Workspace.WORK
            });

            expect(component.editTaskForm.valid).toBe(false);
            expect(component.editTaskForm.get('title')?.hasError('required')).toBe(true);
        });

        it('should mark createTaskForm as invalid when workspace is null', () => {
            component.createTaskForm.patchValue({
                title: 'Valid Title',
                workspace: null
            });

            expect(component.createTaskForm.valid).toBe(false);
        });

        it('should allow valid form with only required fields', () => {
            component.createTaskForm.patchValue({
                title: 'Valid Task',
                workspace: Workspace.PERSONAL,
                description: null,
                channelId: null,
                dueDate: null,
                isRoutine: false
            });

            expect(component.createTaskForm.valid).toBe(true);
        });
    });
});
