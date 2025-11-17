import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal, computed } from '@angular/core';

import { SubtaskListComponent } from './subtask-list.component';
import { SubtaskStateService } from '../../../services/subtask-state.service';
import type { Subtask } from '../../../models/subtask.model';
import { SubtaskStatus } from '../../../models/subtask.model';

describe('SubtaskListComponent', () => {
    let component: SubtaskListComponent;
    let fixture: ComponentFixture<SubtaskListComponent>;
    let mockSubtaskStateService: jest.Mocked<Partial<SubtaskStateService>>;

    // Mock data
    const mockSubtasks: Subtask[] = [
        {
            id: 1,
            title: 'Subtask 1',
            description: 'Description 1',
            taskId: 100,
            status: SubtaskStatus.TODO,
            position: 0,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01')
        },
        {
            id: 2,
            title: 'Subtask 2',
            description: null,
            taskId: 100,
            status: SubtaskStatus.DOING,
            position: 1,
            createdAt: new Date('2025-01-02'),
            updatedAt: new Date('2025-01-02')
        },
        {
            id: 3,
            title: 'Subtask 3',
            description: 'Description 3',
            taskId: 100,
            status: SubtaskStatus.DONE,
            position: 2,
            createdAt: new Date('2025-01-03'),
            updatedAt: new Date('2025-01-03')
        }
    ];

    beforeEach(async () => {
        // Create mock service with signals
        const subtasksSignal = signal<Subtask[]>(mockSubtasks);
        const loadingSignal = signal<boolean>(false);
        const errorSignal = signal<string | null>(null);

        mockSubtaskStateService = {
            getSubtasksForTask: jest.fn((taskId: number) => {
                return computed(() => subtasksSignal().filter(s => s.taskId === taskId));
            }),
            loadSubtasks: jest.fn(),
            addSubtask: jest.fn(),
            updateSubtask: jest.fn(),
            removeSubtask: jest.fn(),
            loading: loadingSignal.asReadonly(),
            error: errorSignal.asReadonly()
        };

        await TestBed.configureTestingModule({
            imports: [SubtaskListComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: SubtaskStateService, useValue: mockSubtaskStateService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SubtaskListComponent);
        component = fixture.componentInstance;
        component.taskId = 100; // Set required input
    });

    describe('Component Creation and Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should require taskId input', () => {
            expect(component.taskId).toBe(100);
        });

        it('should call loadSubtasks on ngOnInit', () => {
            fixture.detectChanges(); // Triggers ngOnInit

            expect(mockSubtaskStateService.loadSubtasks).toHaveBeenCalledWith(100);
        });

        it('should initialize isExpanded to false', () => {
            expect(component.isExpanded()).toBe(false);
        });

        it('should initialize dialogVisible to false', () => {
            expect(component.dialogVisible()).toBe(false);
        });

        it('should initialize editingSubtask to null', () => {
            expect(component.editingSubtask()).toBeNull();
        });
    });

    describe('Computed Signals', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should compute subtasks from service', () => {
            const subtasks = component.subtasks();

            expect(subtasks.length).toBe(3);
            expect(subtasks).toEqual(mockSubtasks);
        });

        it('should compute completedCount correctly', () => {
            const completedCount = component.completedCount();

            expect(completedCount).toBe(1); // Only subtask 3 is DONE
        });

        it('should compute totalCount correctly', () => {
            const totalCount = component.totalCount();

            expect(totalCount).toBe(3);
        });

        it('should compute progressPercentage correctly', () => {
            const progress = component.progressPercentage();

            expect(progress).toBe(33); // 1/3 = 33% (rounded)
        });

        it('should return 0 progress when no subtasks exist', () => {
            // Mock empty subtasks
            const emptySignal = signal<Subtask[]>([]);
            mockSubtaskStateService.getSubtasksForTask = jest.fn(() => {
                return computed(() => emptySignal());
            });

            fixture = TestBed.createComponent(SubtaskListComponent);
            component = fixture.componentInstance;
            component.taskId = 100;
            fixture.detectChanges();

            expect(component.progressPercentage()).toBe(0);
        });

        it('should return 100 progress when all subtasks are done', () => {
            const allDoneSubtasks: Subtask[] = mockSubtasks.map(s => ({
                ...s,
                status: SubtaskStatus.DONE
            }));

            const allDoneSignal = signal<Subtask[]>(allDoneSubtasks);
            mockSubtaskStateService.getSubtasksForTask = jest.fn(() => {
                return computed(() => allDoneSignal());
            });

            fixture = TestBed.createComponent(SubtaskListComponent);
            component = fixture.componentInstance;
            component.taskId = 100;
            fixture.detectChanges();

            expect(component.progressPercentage()).toBe(100);
        });
    });

    describe('Toggle Functionality', () => {
        it('should toggle isExpanded from false to true', () => {
            expect(component.isExpanded()).toBe(false);

            component.toggleExpanded();

            expect(component.isExpanded()).toBe(true);
        });

        it('should toggle isExpanded from true to false', () => {
            component.isExpanded.set(true);

            component.toggleExpanded();

            expect(component.isExpanded()).toBe(false);
        });

        it('should toggle multiple times correctly', () => {
            expect(component.isExpanded()).toBe(false);

            component.toggleExpanded();
            expect(component.isExpanded()).toBe(true);

            component.toggleExpanded();
            expect(component.isExpanded()).toBe(false);

            component.toggleExpanded();
            expect(component.isExpanded()).toBe(true);
        });
    });

    describe('Dialog Management', () => {
        it('should show add dialog with null editingSubtask', () => {
            component.showAddDialog();

            expect(component.dialogVisible()).toBe(true);
            expect(component.editingSubtask()).toBeNull();
        });

        it('should show edit dialog with selected subtask', () => {
            const subtask = mockSubtasks[0];

            component.showEditDialog(subtask);

            expect(component.dialogVisible()).toBe(true);
            expect(component.editingSubtask()).toEqual(subtask);
        });

        it('should hide dialog and clear editingSubtask', () => {
            component.dialogVisible.set(true);
            component.editingSubtask.set(mockSubtasks[0]);

            component.hideDialog();

            expect(component.dialogVisible()).toBe(false);
            expect(component.editingSubtask()).toBeNull();
        });

        it('should switch between add and edit modes', () => {
            // Start with add mode
            component.showAddDialog();
            expect(component.editingSubtask()).toBeNull();

            // Switch to edit mode
            component.showEditDialog(mockSubtasks[1]);
            expect(component.editingSubtask()).toEqual(mockSubtasks[1]);

            // Back to add mode
            component.showAddDialog();
            expect(component.editingSubtask()).toBeNull();
        });
    });

    describe('Progress Severity', () => {
        it('should return "success" when progress is 100%', () => {
            component.isExpanded.set(true);
            fixture.detectChanges();

            // Mock 100% progress
            const allDoneSubtasks: Subtask[] = mockSubtasks.map(s => ({
                ...s,
                status: SubtaskStatus.DONE
            }));

            const allDoneSignal = signal<Subtask[]>(allDoneSubtasks);
            mockSubtaskStateService.getSubtasksForTask = jest.fn(() => {
                return computed(() => allDoneSignal());
            });

            fixture = TestBed.createComponent(SubtaskListComponent);
            component = fixture.componentInstance;
            component.taskId = 100;
            fixture.detectChanges();

            expect(component.getProgressSeverity()).toBe('success');
        });

        it('should return "warn" when progress is >= 50%', () => {
            // Create 3 subtasks with 2 done (67% progress)
            const partialDone: Subtask[] = [
                { ...mockSubtasks[0], status: SubtaskStatus.DONE },
                { ...mockSubtasks[1], status: SubtaskStatus.DONE },
                { ...mockSubtasks[2], status: SubtaskStatus.TODO }
            ];

            const partialSignal = signal<Subtask[]>(partialDone);
            const newMockService = {
                ...mockSubtaskStateService,
                getSubtasksForTask: jest.fn(() => computed(() => partialSignal()))
            };

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [SubtaskListComponent],
                providers: [
                    provideHttpClient(),
                    provideHttpClientTesting(),
                    provideNoopAnimations(),
                    { provide: SubtaskStateService, useValue: newMockService }
                ]
            });

            const newFixture = TestBed.createComponent(SubtaskListComponent);
            const newComponent = newFixture.componentInstance;
            newComponent.taskId = 100;
            newFixture.detectChanges();

            expect(newComponent.getProgressSeverity()).toBe('warn');
        });

        it('should return "danger" when progress is < 50%', () => {
            // Create 3 subtasks with 1 done (33% progress)
            const lowProgress: Subtask[] = [
                { ...mockSubtasks[0], status: SubtaskStatus.TODO },
                { ...mockSubtasks[1], status: SubtaskStatus.TODO },
                { ...mockSubtasks[2], status: SubtaskStatus.DONE }
            ];

            const lowSignal = signal<Subtask[]>(lowProgress);
            const newMockService = {
                ...mockSubtaskStateService,
                getSubtasksForTask: jest.fn(() => computed(() => lowSignal()))
            };

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [SubtaskListComponent],
                providers: [
                    provideHttpClient(),
                    provideHttpClientTesting(),
                    provideNoopAnimations(),
                    { provide: SubtaskStateService, useValue: newMockService }
                ]
            });

            const newFixture = TestBed.createComponent(SubtaskListComponent);
            const newComponent = newFixture.componentInstance;
            newComponent.taskId = 100;
            newFixture.detectChanges();

            expect(newComponent.getProgressSeverity()).toBe('danger');
        });
    });

    describe('TrackBy Function', () => {
        it('should return subtask id for trackBy', () => {
            const subtask = mockSubtasks[0];
            const result = component.trackBySubtaskId(0, subtask);

            expect(result).toBe(subtask.id);
        });

        it('should return different ids for different subtasks', () => {
            const id1 = component.trackBySubtaskId(0, mockSubtasks[0]);
            const id2 = component.trackBySubtaskId(1, mockSubtasks[1]);

            expect(id1).toBe(1);
            expect(id2).toBe(2);
            expect(id1).not.toBe(id2);
        });
    });

    describe('Loading and Error States', () => {
        it('should expose loading state from service', () => {
            fixture.detectChanges();

            expect(component.loading()).toBe(false);
        });

        it('should expose error state from service', () => {
            fixture.detectChanges();

            expect(component.error()).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty subtask list', () => {
            const emptySignal = signal<Subtask[]>([]);
            mockSubtaskStateService.getSubtasksForTask = jest.fn(() => {
                return computed(() => emptySignal());
            });

            fixture = TestBed.createComponent(SubtaskListComponent);
            component = fixture.componentInstance;
            component.taskId = 100;
            fixture.detectChanges();

            expect(component.subtasks()).toEqual([]);
            expect(component.totalCount()).toBe(0);
            expect(component.completedCount()).toBe(0);
            expect(component.progressPercentage()).toBe(0);
        });

        it('should handle subtasks with all TODO status', () => {
            const allTodo = mockSubtasks.map(s => ({
                ...s,
                status: SubtaskStatus.TODO
            }));

            const todoSignal = signal<Subtask[]>(allTodo);
            mockSubtaskStateService.getSubtasksForTask = jest.fn(() => {
                return computed(() => todoSignal());
            });

            fixture = TestBed.createComponent(SubtaskListComponent);
            component = fixture.componentInstance;
            component.taskId = 100;
            fixture.detectChanges();

            expect(component.completedCount()).toBe(0);
            expect(component.progressPercentage()).toBe(0);
        });

        it('should handle rapid dialog open/close', () => {
            component.showAddDialog();
            component.hideDialog();
            component.showEditDialog(mockSubtasks[0]);
            component.hideDialog();
            component.showAddDialog();

            expect(component.dialogVisible()).toBe(true);
            expect(component.editingSubtask()).toBeNull();
        });
    });

    describe('Integration with SubtaskStateService', () => {
        it('should load subtasks for correct taskId', () => {
            component.taskId = 999;
            fixture.detectChanges();

            expect(mockSubtaskStateService.loadSubtasks).toHaveBeenCalledWith(999);
        });

        it('should call getSubtasksForTask with correct taskId', () => {
            fixture.detectChanges();

            expect(mockSubtaskStateService.getSubtasksForTask).toHaveBeenCalledWith(100);
        });
    });
});
