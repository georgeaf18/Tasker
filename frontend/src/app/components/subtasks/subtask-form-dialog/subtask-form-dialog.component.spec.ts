import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SimpleChange } from '@angular/core';

import { SubtaskFormDialogComponent } from './subtask-form-dialog.component';
import { SubtaskStateService } from '../../../services/subtask-state.service';
import type { Subtask, CreateSubtaskDto, UpdateSubtaskDto } from '../../../models/subtask.model';
import { SubtaskStatus } from '../../../models/subtask.model';

describe('SubtaskFormDialogComponent', () => {
    let component: SubtaskFormDialogComponent;
    let fixture: ComponentFixture<SubtaskFormDialogComponent>;
    let mockSubtaskStateService: jest.Mocked<Partial<SubtaskStateService>>;

    const mockSubtask: Subtask = {
        id: 1,
        title: 'Test Subtask',
        description: 'Test Description',
        taskId: 100,
        status: SubtaskStatus.DOING,
        position: 0,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
    };

    beforeEach(async () => {
        mockSubtaskStateService = {
            addSubtask: jest.fn(),
            updateSubtask: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [
                SubtaskFormDialogComponent,
                ReactiveFormsModule
            ],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: SubtaskStateService, useValue: mockSubtaskStateService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SubtaskFormDialogComponent);
        component = fixture.componentInstance;
        component.taskId = 100;
    });

    describe('Component Creation and Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should require taskId input', () => {
            expect(component.taskId).toBe(100);
        });

        it('should initialize form with default values', () => {
            expect(component.subtaskForm).toBeDefined();
            expect(component.subtaskForm.get('title')?.value).toBe('');
            expect(component.subtaskForm.get('description')?.value).toBe('');
            expect(component.subtaskForm.get('status')?.value).toBe(SubtaskStatus.TODO);
        });

        it('should have title field with required validator', () => {
            const titleControl = component.subtaskForm.get('title');

            expect(titleControl?.hasError('required')).toBe(true);

            titleControl?.setValue('Test Title');
            expect(titleControl?.hasError('required')).toBe(false);
        });

        it('should have title field with maxLength validator', () => {
            const titleControl = component.subtaskForm.get('title');
            const longTitle = 'A'.repeat(256);

            titleControl?.setValue(longTitle);

            expect(titleControl?.hasError('maxlength')).toBe(true);
        });

        it('should have description field with maxLength validator', () => {
            const descriptionControl = component.subtaskForm.get('description');
            const longDescription = 'A'.repeat(1001);

            descriptionControl?.setValue(longDescription);

            expect(descriptionControl?.hasError('maxlength')).toBe(true);
        });

        it('should have status field with required validator', () => {
            const statusControl = component.subtaskForm.get('status');

            expect(statusControl?.hasError('required')).toBe(false); // Has default value

            statusControl?.setValue(null);
            expect(statusControl?.hasError('required')).toBe(true);
        });

        it('should have statusOptions defined', () => {
            expect(component.statusOptions).toBeDefined();
            expect(component.statusOptions.length).toBe(3);
        });

        it('should have correct status options', () => {
            expect(component.statusOptions).toEqual([
                { label: 'To Do', value: SubtaskStatus.TODO },
                { label: 'Doing', value: SubtaskStatus.DOING },
                { label: 'Done', value: SubtaskStatus.DONE }
            ]);
        });
    });

    describe('Form Population - ngOnChanges', () => {
        it('should populate form when visible changes to true in create mode', () => {
            component.visible = false;
            component.subtask = null;

            // Simulate visible change
            component.ngOnChanges({
                visible: new SimpleChange(false, true, false)
            });

            expect(component.subtaskForm.get('title')?.value).toBe('');
            expect(component.subtaskForm.get('description')?.value).toBe('');
            expect(component.subtaskForm.get('status')?.value).toBe(SubtaskStatus.TODO);
        });

        it('should populate form with subtask data when visible changes to true in edit mode', () => {
            component.visible = true; // Set visible first
            component.subtask = mockSubtask;

            // Simulate visible change
            component.ngOnChanges({
                visible: new SimpleChange(false, true, false)
            });

            expect(component.subtaskForm.get('title')?.value).toBe(mockSubtask.title);
            expect(component.subtaskForm.get('description')?.value).toBe(mockSubtask.description);
            expect(component.subtaskForm.get('status')?.value).toBe(mockSubtask.status);
        });

        it('should handle subtask with null description', () => {
            const subtaskWithoutDescription: Subtask = {
                ...mockSubtask,
                description: null
            };

            component.subtask = subtaskWithoutDescription;
            component.ngOnChanges({
                visible: new SimpleChange(false, true, false)
            });

            expect(component.subtaskForm.get('description')?.value).toBe('');
        });

        it('should not populate form when visible is false', () => {
            component.subtask = mockSubtask;
            component.visible = false;

            // Manually set form values
            component.subtaskForm.patchValue({
                title: 'Old Title',
                description: 'Old Description'
            });

            // Simulate change but visible remains false
            component.ngOnChanges({
                subtask: new SimpleChange(null, mockSubtask, false)
            });

            // Form should not change
            expect(component.subtaskForm.get('title')?.value).toBe('Old Title');
        });
    });

    describe('Dialog Header and Labels', () => {
        it('should return "Create Subtask" in create mode', () => {
            component.subtask = null;

            expect(component.getDialogHeader()).toBe('Create Subtask');
        });

        it('should return "Edit Subtask" in edit mode', () => {
            component.subtask = mockSubtask;

            expect(component.getDialogHeader()).toBe('Edit Subtask');
        });

        it('should return "Create" button label in create mode', () => {
            component.subtask = null;

            expect(component.getSubmitLabel()).toBe('Create');
        });

        it('should return "Update" button label in edit mode', () => {
            component.subtask = mockSubtask;

            expect(component.getSubmitLabel()).toBe('Update');
        });
    });

    describe('Form Validation - hasError', () => {
        it('should return true when field has error and is touched', () => {
            const titleControl = component.subtaskForm.get('title');
            titleControl?.markAsTouched();

            expect(component.hasError('title', 'required')).toBe(true);
        });

        it('should return true when field has error and is dirty', () => {
            const titleControl = component.subtaskForm.get('title');
            titleControl?.markAsDirty();

            expect(component.hasError('title', 'required')).toBe(true);
        });

        it('should return false when field has no error', () => {
            const titleControl = component.subtaskForm.get('title');
            titleControl?.setValue('Valid Title');
            titleControl?.markAsTouched();

            expect(component.hasError('title', 'required')).toBe(false);
        });

        it('should return false when field has error but is pristine and untouched', () => {
            expect(component.hasError('title', 'required')).toBe(false);
        });
    });

    describe('Form Submission - Create Mode', () => {
        beforeEach(() => {
            component.subtask = null; // Create mode
        });

        it('should call addSubtask when form is valid', () => {
            component.subtaskForm.patchValue({
                title: 'New Subtask',
                description: 'New Description',
                status: SubtaskStatus.TODO
            });

            component.onSubmit();

            const expectedDto: CreateSubtaskDto = {
                title: 'New Subtask',
                description: 'New Description',
                status: SubtaskStatus.TODO
            };

            expect(mockSubtaskStateService.addSubtask).toHaveBeenCalledWith(100, expectedDto);
        });

        it('should convert empty description to undefined in create DTO', () => {
            component.subtaskForm.patchValue({
                title: 'New Subtask',
                description: '',
                status: SubtaskStatus.DOING
            });

            component.onSubmit();

            const expectedDto: CreateSubtaskDto = {
                title: 'New Subtask',
                description: undefined,
                status: SubtaskStatus.DOING
            };

            expect(mockSubtaskStateService.addSubtask).toHaveBeenCalledWith(100, expectedDto);
        });

        it('should not submit when form is invalid', () => {
            component.subtaskForm.patchValue({
                title: '', // Invalid: required
                description: 'Description',
                status: SubtaskStatus.TODO
            });

            component.onSubmit();

            expect(mockSubtaskStateService.addSubtask).not.toHaveBeenCalled();
        });

        it('should mark all fields as touched when invalid form is submitted', () => {
            component.subtaskForm.patchValue({
                title: '', // Invalid
                description: 'Description'
            });

            component.onSubmit();

            expect(component.subtaskForm.get('title')?.touched).toBe(true);
            expect(component.subtaskForm.get('description')?.touched).toBe(true);
            expect(component.subtaskForm.get('status')?.touched).toBe(true);
        });

        it('should emit visibleChange after successful create', () => {
            const visibleChangeSpy = jest.fn();
            component.visibleChange.subscribe(visibleChangeSpy);

            component.subtaskForm.patchValue({
                title: 'New Subtask',
                status: SubtaskStatus.TODO
            });

            component.onSubmit();

            expect(visibleChangeSpy).toHaveBeenCalledWith(false);
        });

        it('should reset form after successful create', () => {
            component.subtaskForm.patchValue({
                title: 'New Subtask',
                description: 'Description',
                status: SubtaskStatus.DOING
            });

            component.onSubmit();

            // Form should be reset
            expect(component.subtaskForm.get('title')?.value).toBeNull();
            expect(component.subtaskForm.get('description')?.value).toBeNull();
            expect(component.subtaskForm.get('status')?.value).toBeNull();
        });
    });

    describe('Form Submission - Edit Mode', () => {
        beforeEach(() => {
            component.subtask = mockSubtask; // Edit mode
        });

        it('should call updateSubtask when form is valid', () => {
            component.subtaskForm.patchValue({
                title: 'Updated Title',
                description: 'Updated Description',
                status: SubtaskStatus.DONE
            });

            component.onSubmit();

            const expectedDto: UpdateSubtaskDto = {
                title: 'Updated Title',
                description: 'Updated Description',
                status: SubtaskStatus.DONE
            };

            expect(mockSubtaskStateService.updateSubtask).toHaveBeenCalledWith(
                100,
                mockSubtask.id,
                expectedDto
            );
        });

        it('should convert empty description to null in update DTO', () => {
            component.subtaskForm.patchValue({
                title: 'Updated Title',
                description: '',
                status: SubtaskStatus.DONE
            });

            component.onSubmit();

            const expectedDto: UpdateSubtaskDto = {
                title: 'Updated Title',
                description: null,
                status: SubtaskStatus.DONE
            };

            expect(mockSubtaskStateService.updateSubtask).toHaveBeenCalledWith(
                100,
                mockSubtask.id,
                expectedDto
            );
        });

        it('should not submit when form is invalid', () => {
            component.subtaskForm.patchValue({
                title: '', // Invalid: required
                description: 'Description'
            });

            component.onSubmit();

            expect(mockSubtaskStateService.updateSubtask).not.toHaveBeenCalled();
        });

        it('should emit visibleChange after successful update', () => {
            const visibleChangeSpy = jest.fn();
            component.visibleChange.subscribe(visibleChangeSpy);

            component.subtaskForm.patchValue({
                title: 'Updated Title',
                status: SubtaskStatus.DONE
            });

            component.onSubmit();

            expect(visibleChangeSpy).toHaveBeenCalledWith(false);
        });

        it('should reset form after successful update', () => {
            component.subtaskForm.patchValue({
                title: 'Updated Title',
                description: 'Updated Description',
                status: SubtaskStatus.DONE
            });

            component.onSubmit();

            // Form should be reset
            expect(component.subtaskForm.get('title')?.value).toBeNull();
        });
    });

    describe('Cancel Functionality', () => {
        it('should emit visibleChange on cancel', () => {
            const visibleChangeSpy = jest.fn();
            component.visibleChange.subscribe(visibleChangeSpy);

            component.onCancel();

            expect(visibleChangeSpy).toHaveBeenCalledWith(false);
        });

        it('should reset form on cancel', () => {
            component.subtaskForm.patchValue({
                title: 'Unsaved Title',
                description: 'Unsaved Description',
                status: SubtaskStatus.DOING
            });

            component.onCancel();

            expect(component.subtaskForm.get('title')?.value).toBeNull();
            expect(component.subtaskForm.get('description')?.value).toBeNull();
            expect(component.subtaskForm.get('status')?.value).toBeNull();
        });

        it('should not call any service methods on cancel', () => {
            component.subtaskForm.patchValue({
                title: 'Title',
                status: SubtaskStatus.TODO
            });

            component.onCancel();

            expect(mockSubtaskStateService.addSubtask).not.toHaveBeenCalled();
            expect(mockSubtaskStateService.updateSubtask).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long title at max length', () => {
            const maxTitle = 'A'.repeat(255);

            component.subtaskForm.patchValue({
                title: maxTitle,
                status: SubtaskStatus.TODO
            });

            expect(component.subtaskForm.get('title')?.valid).toBe(true);

            component.onSubmit();

            expect(mockSubtaskStateService.addSubtask).toHaveBeenCalled();
        });

        it('should handle very long description at max length', () => {
            const maxDescription = 'A'.repeat(1000);

            component.subtaskForm.patchValue({
                title: 'Title',
                description: maxDescription,
                status: SubtaskStatus.TODO
            });

            expect(component.subtaskForm.get('description')?.valid).toBe(true);

            component.onSubmit();

            expect(mockSubtaskStateService.addSubtask).toHaveBeenCalled();
        });

        it('should handle title that exceeds max length', () => {
            const tooLongTitle = 'A'.repeat(256);

            component.subtaskForm.patchValue({
                title: tooLongTitle,
                status: SubtaskStatus.TODO
            });

            expect(component.subtaskForm.get('title')?.hasError('maxlength')).toBe(true);

            component.onSubmit();

            expect(mockSubtaskStateService.addSubtask).not.toHaveBeenCalled();
        });

        it('should handle rapid open/close cycles', () => {
            const visibleChangeSpy = jest.fn();
            component.visibleChange.subscribe(visibleChangeSpy);

            component.onCancel();
            component.onCancel();
            component.onCancel();

            expect(visibleChangeSpy).toHaveBeenCalledTimes(3);
        });

        it('should handle switching between create and edit modes', () => {
            // Start in create mode
            component.visible = true;
            component.subtask = null;
            component.ngOnChanges({
                visible: new SimpleChange(false, true, false)
            });

            expect(component.getDialogHeader()).toBe('Create Subtask');
            expect(component.subtaskForm.get('title')?.value).toBe('');

            // Switch to edit mode
            component.visible = true;
            component.subtask = mockSubtask;
            component.ngOnChanges({
                visible: new SimpleChange(false, true, false)
            });

            expect(component.getDialogHeader()).toBe('Edit Subtask');
            expect(component.subtaskForm.get('title')?.value).toBe(mockSubtask.title);

            // Back to create mode
            component.visible = true;
            component.subtask = null;
            component.ngOnChanges({
                visible: new SimpleChange(false, true, false)
            });

            expect(component.getDialogHeader()).toBe('Create Subtask');
            expect(component.subtaskForm.get('title')?.value).toBe('');
        });
    });

    describe('Integration Tests', () => {
        it('should complete full create flow', () => {
            const visibleChangeSpy = jest.fn();
            component.visibleChange.subscribe(visibleChangeSpy);

            // Dialog opens in create mode
            component.subtask = null;
            component.visible = true;
            component.ngOnChanges({
                visible: new SimpleChange(false, true, false)
            });

            // User fills form
            component.subtaskForm.patchValue({
                title: 'New Subtask',
                description: 'New Description',
                status: SubtaskStatus.DOING
            });

            // User submits
            component.onSubmit();

            expect(mockSubtaskStateService.addSubtask).toHaveBeenCalled();
            expect(visibleChangeSpy).toHaveBeenCalledWith(false);
        });

        it('should complete full edit flow', () => {
            const visibleChangeSpy = jest.fn();
            component.visibleChange.subscribe(visibleChangeSpy);

            // Dialog opens in edit mode
            component.subtask = mockSubtask;
            component.visible = true;
            component.ngOnChanges({
                visible: new SimpleChange(false, true, false)
            });

            // Form is populated
            expect(component.subtaskForm.get('title')?.value).toBe(mockSubtask.title);

            // User modifies form
            component.subtaskForm.patchValue({
                title: 'Updated Title',
                status: SubtaskStatus.DONE
            });

            // User submits
            component.onSubmit();

            expect(mockSubtaskStateService.updateSubtask).toHaveBeenCalledWith(
                100,
                mockSubtask.id,
                expect.objectContaining({
                    title: 'Updated Title',
                    status: SubtaskStatus.DONE
                })
            );
            expect(visibleChangeSpy).toHaveBeenCalledWith(false);
        });

        it('should handle cancel flow without saving', () => {
            const visibleChangeSpy = jest.fn();
            component.visibleChange.subscribe(visibleChangeSpy);

            // User fills form
            component.subtaskForm.patchValue({
                title: 'Unsaved Title',
                description: 'Unsaved Description'
            });

            // User cancels
            component.onCancel();

            expect(mockSubtaskStateService.addSubtask).not.toHaveBeenCalled();
            expect(mockSubtaskStateService.updateSubtask).not.toHaveBeenCalled();
            expect(visibleChangeSpy).toHaveBeenCalledWith(false);
        });
    });
});
