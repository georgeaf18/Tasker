import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmationService } from 'primeng/api';

import { SubtaskItemComponent } from './subtask-item.component';
import { SubtaskStateService } from '../../../services/subtask-state.service';
import type { Subtask } from '../../../models/subtask.model';
import { SubtaskStatus } from '../../../models/subtask.model';

describe('SubtaskItemComponent', () => {
    let component: SubtaskItemComponent;
    let fixture: ComponentFixture<SubtaskItemComponent>;
    let mockSubtaskStateService: jest.Mocked<Partial<SubtaskStateService>>;
    let mockConfirmationService: jest.Mocked<Partial<ConfirmationService>>;

    const mockSubtask: Subtask = {
        id: 1,
        title: 'Test Subtask',
        description: 'Test Description',
        taskId: 100,
        status: SubtaskStatus.TODO,
        position: 0,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
    };

    beforeEach(async () => {
        mockSubtaskStateService = {
            updateSubtaskStatus: jest.fn(),
            removeSubtask: jest.fn()
        };

        mockConfirmationService = {
            confirm: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [SubtaskItemComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: SubtaskStateService, useValue: mockSubtaskStateService },
                { provide: ConfirmationService, useValue: mockConfirmationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SubtaskItemComponent);
        component = fixture.componentInstance;
        component.subtask = mockSubtask;
        component.taskId = 100;
    });

    describe('Component Creation and Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should require subtask input', () => {
            expect(component.subtask).toBe(mockSubtask);
        });

        it('should require taskId input', () => {
            expect(component.taskId).toBe(100);
        });

        it('should have statusOptions defined', () => {
            expect(component.statusOptions).toBeDefined();
            expect(component.statusOptions.length).toBe(3);
        });

        it('should have correct status options', () => {
            expect(component.statusOptions).toEqual([
                { label: 'To Do', value: SubtaskStatus.TODO, icon: 'pi pi-circle' },
                { label: 'Doing', value: SubtaskStatus.DOING, icon: 'pi pi-spinner' },
                { label: 'Done', value: SubtaskStatus.DONE, icon: 'pi pi-check-circle' }
            ]);
        });

        it('should initialize showActions to false', () => {
            expect(component.showActions()).toBe(false);
        });
    });

    describe('Status Badge Severity', () => {
        it('should return "secondary" for TODO status', () => {
            const severity = component.getStatusSeverity(SubtaskStatus.TODO);

            expect(severity).toBe('secondary');
        });

        it('should return "warn" for DOING status', () => {
            const severity = component.getStatusSeverity(SubtaskStatus.DOING);

            expect(severity).toBe('warn');
        });

        it('should return "success" for DONE status', () => {
            const severity = component.getStatusSeverity(SubtaskStatus.DONE);

            expect(severity).toBe('success');
        });
    });

    describe('Status Label', () => {
        it('should return "To Do" for TODO status', () => {
            const label = component.getStatusLabel(SubtaskStatus.TODO);

            expect(label).toBe('To Do');
        });

        it('should return "Doing" for DOING status', () => {
            const label = component.getStatusLabel(SubtaskStatus.DOING);

            expect(label).toBe('Doing');
        });

        it('should return "Done" for DONE status', () => {
            const label = component.getStatusLabel(SubtaskStatus.DONE);

            expect(label).toBe('Done');
        });
    });

    describe('Status Change', () => {
        it('should call updateSubtaskStatus when status changes', () => {
            component.onStatusChange(SubtaskStatus.DOING);

            expect(mockSubtaskStateService.updateSubtaskStatus).toHaveBeenCalledWith(
                100,
                1,
                SubtaskStatus.DOING
            );
        });

        it('should not call updateSubtaskStatus when status is the same', () => {
            component.subtask.status = SubtaskStatus.TODO;

            component.onStatusChange(SubtaskStatus.TODO);

            expect(mockSubtaskStateService.updateSubtaskStatus).not.toHaveBeenCalled();
        });

        it('should handle status change from TODO to DONE', () => {
            component.subtask.status = SubtaskStatus.TODO;

            component.onStatusChange(SubtaskStatus.DONE);

            expect(mockSubtaskStateService.updateSubtaskStatus).toHaveBeenCalledWith(
                100,
                1,
                SubtaskStatus.DONE
            );
        });

        it('should handle status change from DONE to TODO', () => {
            component.subtask.status = SubtaskStatus.DONE;

            component.onStatusChange(SubtaskStatus.TODO);

            expect(mockSubtaskStateService.updateSubtaskStatus).toHaveBeenCalledWith(
                100,
                1,
                SubtaskStatus.TODO
            );
        });
    });

    describe('Edit Functionality', () => {
        it('should emit edit event when onEdit is called', () => {
            const editSpy = jest.fn();
            component.edit.subscribe(editSpy);

            component.onEdit();

            expect(editSpy).toHaveBeenCalledWith(mockSubtask);
        });

        it('should emit the correct subtask on edit', () => {
            const differentSubtask: Subtask = {
                ...mockSubtask,
                id: 2,
                title: 'Different Subtask'
            };

            component.subtask = differentSubtask;

            const editSpy = jest.fn();
            component.edit.subscribe(editSpy);

            component.onEdit();

            expect(editSpy).toHaveBeenCalledWith(differentSubtask);
        });
    });

    describe('Delete Functionality', () => {
        let confirmationServiceInstance: ConfirmationService;

        beforeEach(() => {
            confirmationServiceInstance = fixture.debugElement.injector.get(ConfirmationService);
            jest.spyOn(confirmationServiceInstance, 'confirm');
        });

        it('should show confirmation dialog when confirmDelete is called', () => {
            component.confirmDelete();

            expect(confirmationServiceInstance.confirm).toHaveBeenCalled();
        });

        it('should include subtask title in confirmation message', () => {
            component.confirmDelete();

            const confirmCall = (confirmationServiceInstance.confirm as jest.Mock).mock.calls[0][0];
            expect(confirmCall.message).toContain(mockSubtask.title);
        });

        it('should set confirmation dialog header and icon', () => {
            component.confirmDelete();

            const confirmCall = (confirmationServiceInstance.confirm as jest.Mock).mock.calls[0][0];
            expect(confirmCall.header).toBe('Confirm Delete');
            expect(confirmCall.icon).toBe('pi pi-exclamation-triangle');
        });

        it('should have danger button style', () => {
            component.confirmDelete();

            const confirmCall = (confirmationServiceInstance.confirm as jest.Mock).mock.calls[0][0];
            expect(confirmCall.acceptButtonStyleClass).toBe('p-button-danger');
        });

        it('should delete subtask when user confirms', () => {
            component.confirmDelete();

            const confirmCall = (confirmationServiceInstance.confirm as jest.Mock).mock.calls[0][0];
            confirmCall.accept!();

            expect(mockSubtaskStateService.removeSubtask).toHaveBeenCalledWith(100, 1);
        });

        it('should not delete subtask when user cancels', () => {
            component.confirmDelete();

            const confirmCall = (confirmationServiceInstance.confirm as jest.Mock).mock.calls[0][0];
            // Don't call accept(), simulating cancel

            expect(mockSubtaskStateService.removeSubtask).not.toHaveBeenCalled();
        });
    });

    describe('Actions Visibility Toggle', () => {
        it('should toggle showActions from false to true', () => {
            expect(component.showActions()).toBe(false);

            component.toggleActions();

            expect(component.showActions()).toBe(true);
        });

        it('should toggle showActions from true to false', () => {
            component.showActions.set(true);

            component.toggleActions();

            expect(component.showActions()).toBe(false);
        });

        it('should toggle multiple times correctly', () => {
            expect(component.showActions()).toBe(false);

            component.toggleActions();
            expect(component.showActions()).toBe(true);

            component.toggleActions();
            expect(component.showActions()).toBe(false);

            component.toggleActions();
            expect(component.showActions()).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle subtask with null description', () => {
            const subtaskWithoutDescription: Subtask = {
                ...mockSubtask,
                description: null
            };

            component.subtask = subtaskWithoutDescription;
            fixture.detectChanges();

            expect(component.subtask.description).toBeNull();
        });

        it('should handle very long subtask titles', () => {
            const longTitleSubtask: Subtask = {
                ...mockSubtask,
                title: 'A'.repeat(255)
            };

            component.subtask = longTitleSubtask;
            fixture.detectChanges();

            expect(component.subtask.title.length).toBe(255);
        });

        it('should handle rapid status changes', () => {
            // Set different initial status for each call to ensure they're all different
            component.subtask.status = SubtaskStatus.TODO;
            component.onStatusChange(SubtaskStatus.DOING);

            component.subtask.status = SubtaskStatus.DOING;
            component.onStatusChange(SubtaskStatus.DONE);

            component.subtask.status = SubtaskStatus.DONE;
            component.onStatusChange(SubtaskStatus.TODO);

            expect(mockSubtaskStateService.updateSubtaskStatus).toHaveBeenCalledTimes(3);
        });

        it('should handle multiple delete confirmation calls', () => {
            const confirmationServiceInstance = fixture.debugElement.injector.get(ConfirmationService);
            jest.spyOn(confirmationServiceInstance, 'confirm');

            component.confirmDelete();
            component.confirmDelete();

            expect(confirmationServiceInstance.confirm).toHaveBeenCalledTimes(2);
        });
    });

    describe('Integration Tests', () => {
        it('should complete edit flow', () => {
            const editSpy = jest.fn();
            component.edit.subscribe(editSpy);

            // User clicks edit
            component.onEdit();

            expect(editSpy).toHaveBeenCalledWith(mockSubtask);
        });

        it('should complete delete flow with confirmation', () => {
            const confirmationServiceInstance = fixture.debugElement.injector.get(ConfirmationService);
            jest.spyOn(confirmationServiceInstance, 'confirm');

            // User clicks delete
            component.confirmDelete();
            expect(confirmationServiceInstance.confirm).toHaveBeenCalled();

            // User confirms
            const confirmCall = (confirmationServiceInstance.confirm as jest.Mock).mock.calls[0][0];
            confirmCall.accept!();

            expect(mockSubtaskStateService.removeSubtask).toHaveBeenCalledWith(100, 1);
        });

        it('should complete status change flow', () => {
            // User changes status from TODO to DONE
            component.subtask.status = SubtaskStatus.TODO;
            component.onStatusChange(SubtaskStatus.DONE);

            expect(mockSubtaskStateService.updateSubtaskStatus).toHaveBeenCalledWith(
                100,
                1,
                SubtaskStatus.DONE
            );
        });
    });
});
