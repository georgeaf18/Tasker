import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Select } from 'primeng/select';
import { ConfirmationService } from 'primeng/api';
import { SubtaskStateService } from '../../../services/subtask-state.service';
import type { Subtask } from '../../../models/subtask.model';
import { SubtaskStatus } from '../../../models/subtask.model';

/**
 * Status option for dropdown
 */
interface StatusOption {
    label: string;
    value: SubtaskStatus;
    icon: string;
}

/**
 * SubtaskItemComponent
 *
 * Displays a single subtask item with:
 * - Subtask title
 * - Status badge with color coding (To Do/Doing/Done)
 * - Status change dropdown
 * - Edit/delete action buttons
 * - Accessibility support with proper ARIA labels
 *
 * @example
 * ```html
 * <app-subtask-item
 *   [subtask]="subtask"
 *   [taskId]="taskId"
 *   (edit)="onEdit($event)" />
 * ```
 */
@Component({
    selector: 'app-subtask-item',
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TagModule,
        Select
    ],
    providers: [ConfirmationService],
    templateUrl: './subtask-item.component.html',
    styleUrl: './subtask-item.component.css'
})
export class SubtaskItemComponent {
    private readonly subtaskState = inject(SubtaskStateService);
    private readonly confirmationService = inject(ConfirmationService);

    /**
     * Required: Subtask data to display
     */
    @Input({ required: true }) subtask!: Subtask;

    /**
     * Required: Parent task ID
     */
    @Input({ required: true }) taskId!: number;

    /**
     * Event emitted when edit button is clicked
     */
    @Output() edit = new EventEmitter<Subtask>();

    /**
     * Status options for dropdown
     */
    readonly statusOptions: StatusOption[] = [
        {
            label: 'To Do',
            value: SubtaskStatus.TODO,
            icon: 'pi pi-circle'
        },
        {
            label: 'Doing',
            value: SubtaskStatus.DOING,
            icon: 'pi pi-spinner'
        },
        {
            label: 'Done',
            value: SubtaskStatus.DONE,
            icon: 'pi pi-check-circle'
        }
    ];

    /**
     * Whether actions menu is visible
     */
    readonly showActions = signal<boolean>(false);

    /**
     * Get status badge severity based on status
     */
    getStatusSeverity(status: SubtaskStatus): 'secondary' | 'warn' | 'success' {
        switch (status) {
            case SubtaskStatus.TODO:
                return 'secondary';
            case SubtaskStatus.DOING:
                return 'warn';
            case SubtaskStatus.DONE:
                return 'success';
            default:
                return 'secondary';
        }
    }

    /**
     * Get status label for display
     */
    getStatusLabel(status: SubtaskStatus): string {
        const option = this.statusOptions.find(opt => opt.value === status);
        return option?.label || status;
    }

    /**
     * Handle status change from dropdown
     */
    onStatusChange(newStatus: SubtaskStatus): void {
        if (newStatus !== this.subtask.status) {
            this.subtaskState.updateSubtaskStatus(this.taskId, this.subtask.id, newStatus);
        }
    }

    /**
     * Handle edit button click
     */
    onEdit(): void {
        this.edit.emit(this.subtask);
    }

    /**
     * Confirm and delete subtask
     */
    confirmDelete(): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${this.subtask.title}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.subtaskState.removeSubtask(this.taskId, this.subtask.id);
            }
        });
    }

    /**
     * Toggle actions visibility
     */
    toggleActions(): void {
        this.showActions.update(visible => !visible);
    }
}
