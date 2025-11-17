import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SubtaskStateService } from '../../../services/subtask-state.service';
import type { Subtask, CreateSubtaskDto, UpdateSubtaskDto } from '../../../models/subtask.model';
import { SubtaskStatus } from '../../../models/subtask.model';

/**
 * Status option for dropdown
 */
interface StatusOption {
    label: string;
    value: SubtaskStatus;
}

/**
 * SubtaskFormDialogComponent
 *
 * Modal dialog for creating or editing subtasks.
 * Features:
 * - Create mode: when subtask is null
 * - Edit mode: when subtask is provided
 * - Form fields: title (required), description (optional), status
 * - Validation with user-friendly error messages
 * - PrimeNG p-dialog for modal presentation
 * - Accessibility with proper labels and ARIA attributes
 *
 * @example
 * ```html
 * <app-subtask-form-dialog
 *   [visible]="dialogVisible"
 *   [taskId]="taskId"
 *   [subtask]="editingSubtask"
 *   (visibleChange)="onDialogClose()" />
 * ```
 */
@Component({
    selector: 'app-subtask-form-dialog',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        Select
    ],
    templateUrl: './subtask-form-dialog.component.html',
    styleUrl: './subtask-form-dialog.component.css'
})
export class SubtaskFormDialogComponent implements OnChanges {
    private readonly subtaskState = inject(SubtaskStateService);
    private readonly fb = inject(FormBuilder);

    /**
     * Required: Parent task ID
     */
    @Input({ required: true }) taskId!: number;

    /**
     * Dialog visibility state
     */
    @Input() visible: boolean = false;

    /**
     * Subtask to edit (null for create mode)
     */
    @Input() subtask: Subtask | null = null;

    /**
     * Event emitted when dialog should close
     */
    @Output() visibleChange = new EventEmitter<boolean>();

    /**
     * Reactive form for subtask data
     */
    subtaskForm: FormGroup;

    /**
     * Status options for dropdown
     */
    readonly statusOptions: StatusOption[] = [
        { label: 'To Do', value: SubtaskStatus.TODO },
        { label: 'Doing', value: SubtaskStatus.DOING },
        { label: 'Done', value: SubtaskStatus.DONE }
    ];

    constructor() {
        // Initialize form with validators
        this.subtaskForm = this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(255)]],
            description: ['', Validators.maxLength(1000)],
            status: [SubtaskStatus.TODO, Validators.required]
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        // When dialog opens or subtask changes, populate form
        if (changes['visible'] && this.visible) {
            this.populateForm();
        }
    }

    /**
     * Populate form with subtask data (edit mode) or reset (create mode)
     */
    private populateForm(): void {
        if (this.subtask) {
            // Edit mode: populate with existing data
            this.subtaskForm.patchValue({
                title: this.subtask.title,
                description: this.subtask.description || '',
                status: this.subtask.status
            });
        } else {
            // Create mode: reset to defaults
            this.subtaskForm.reset({
                title: '',
                description: '',
                status: SubtaskStatus.TODO
            });
        }
    }

    /**
     * Get dialog header text (Create vs Edit)
     */
    getDialogHeader(): string {
        return this.subtask ? 'Edit Subtask' : 'Create Subtask';
    }

    /**
     * Get submit button label (Update vs Create)
     */
    getSubmitLabel(): string {
        return this.subtask ? 'Update' : 'Create';
    }

    /**
     * Check if form field has error and is touched/dirty
     */
    hasError(fieldName: string, errorType: string): boolean {
        const field = this.subtaskForm.get(fieldName);
        return !!(field?.hasError(errorType) && (field.touched || field.dirty));
    }

    /**
     * Submit form (create or update)
     */
    onSubmit(): void {
        if (this.subtaskForm.invalid) {
            // Mark all fields as touched to show validation errors
            Object.keys(this.subtaskForm.controls).forEach(key => {
                this.subtaskForm.get(key)?.markAsTouched();
            });
            return;
        }

        const formValue = this.subtaskForm.value;

        if (this.subtask) {
            // Edit mode: update existing subtask
            const updateDto: UpdateSubtaskDto = {
                title: formValue.title,
                description: formValue.description || null,
                status: formValue.status
            };
            this.subtaskState.updateSubtask(this.taskId, this.subtask.id, updateDto);
        } else {
            // Create mode: add new subtask (title only for now)
            // Backend sets default: description=null, status=TODO
            const createDto: CreateSubtaskDto = {
                title: formValue.title
            };
            this.subtaskState.addSubtask(this.taskId, createDto);
        }

        // Close dialog
        this.closeDialog();
    }

    /**
     * Close dialog without saving
     */
    onCancel(): void {
        this.closeDialog();
    }

    /**
     * Emit visibleChange event to close dialog
     */
    private closeDialog(): void {
        this.subtaskForm.reset();
        this.visibleChange.emit(false);
    }
}
