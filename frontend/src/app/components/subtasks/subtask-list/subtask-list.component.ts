import { Component, Input, signal, computed, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { SubtaskStateService } from '../../../services/subtask-state.service';
import { SubtaskItemComponent } from '../subtask-item/subtask-item.component';
import { SubtaskFormDialogComponent } from '../subtask-form-dialog/subtask-form-dialog.component';
import type { Subtask } from '../../../models/subtask.model';
import { SubtaskStatus } from '../../../models/subtask.model';

/**
 * SubtaskListComponent
 *
 * Displays a collapsible list of subtasks for a given task.
 * Features:
 * - Collapsible list with expand/collapse toggle
 * - Progress badge showing completion ratio (e.g., "3/5 complete")
 * - Visual progress bar
 * - "+ Add subtask" button
 * - Integrates with SubtaskStateService for reactive state
 * - Fully accessible with WCAG AA compliance
 *
 * @example
 * ```html
 * <app-subtask-list [taskId]="task.id" />
 * ```
 */
@Component({
    selector: 'app-subtask-list',
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TagModule,
        ProgressBarModule,
        SubtaskItemComponent,
        SubtaskFormDialogComponent
    ],
    templateUrl: './subtask-list.component.html',
    styleUrl: './subtask-list.component.css'
})
export class SubtaskListComponent implements OnInit, AfterViewChecked {
    private readonly subtaskState = inject(SubtaskStateService);

    /**
     * Required: Parent task ID
     */
    @Input({ required: true }) taskId!: number;

    /**
     * Optional: Enable focus mode (checkbox view instead of dropdown)
     */
    @Input() focusMode: boolean = false;

    /**
     * Whether the subtask list is expanded
     */
    readonly isExpanded = signal<boolean>(false);

    /**
     * Whether the add/edit dialog is visible
     */
    readonly dialogVisible = signal<boolean>(false);

    /**
     * Subtask being edited (null for create mode)
     */
    readonly editingSubtask = signal<Subtask | null>(null);

    /**
     * Inline add mode state
     */
    readonly isAddingSubtask = signal<boolean>(false);

    /**
     * New subtask title for inline adding
     */
    newSubtaskTitle = '';

    /**
     * ViewChild reference to the input element for auto-focus
     */
    @ViewChild('newSubtaskInput') newSubtaskInput?: ElementRef<HTMLInputElement>;

    /**
     * Flag to track if we need to focus the input
     */
    private needsFocus = false;

    /**
     * All subtasks for this task (reactive)
     */
    readonly subtasks = computed(() => {
        return this.subtaskState.getSubtasksForTask(this.taskId)();
    });

    /**
     * Count of completed subtasks (DONE status)
     */
    readonly completedCount = computed(() => {
        return this.subtasks().filter(s => s.status === 'DONE').length;
    });

    /**
     * Total number of subtasks
     */
    readonly totalCount = computed(() => {
        return this.subtasks().length;
    });

    /**
     * Progress percentage (0-100)
     */
    readonly progressPercentage = computed(() => {
        const total = this.totalCount();
        if (total === 0) return 0;
        return Math.round((this.completedCount() / total) * 100);
    });

    /**
     * Loading state from service
     */
    readonly loading = this.subtaskState.loading;

    /**
     * Error state from service
     */
    readonly error = this.subtaskState.error;

    ngOnInit(): void {
        // Load subtasks when component initializes
        this.subtaskState.loadSubtasks(this.taskId);
    }

    /**
     * Toggle expand/collapse state
     */
    toggleExpanded(): void {
        this.isExpanded.update(expanded => !expanded);
    }

    /**
     * Show the add subtask dialog
     */
    showAddDialog(): void {
        this.editingSubtask.set(null);
        this.dialogVisible.set(true);
    }

    /**
     * Show the edit subtask dialog
     */
    showEditDialog(subtask: Subtask): void {
        this.editingSubtask.set(subtask);
        this.dialogVisible.set(true);
    }

    /**
     * Hide the dialog
     */
    hideDialog(): void {
        this.dialogVisible.set(false);
        this.editingSubtask.set(null);
    }

    /**
     * Get severity for progress tag (success/warning/danger)
     */
    getProgressSeverity(): 'success' | 'warn' | 'danger' {
        const percentage = this.progressPercentage();
        if (percentage === 100) return 'success';
        if (percentage >= 50) return 'warn';
        return 'danger';
    }

    /**
     * TrackBy function for subtask list (performance optimization)
     */
    trackBySubtaskId(index: number, subtask: Subtask): number {
        return subtask.id;
    }

    /**
     * Toggle subtask between TODO and DONE (focus mode)
     */
    toggleSubtask(subtask: Subtask): void {
        const newStatus = subtask.status === SubtaskStatus.DONE ? SubtaskStatus.TODO : SubtaskStatus.DONE;
        this.subtaskState.updateSubtaskStatus(this.taskId, subtask.id, newStatus);
    }

    /**
     * Start inline adding mode
     */
    startAddingSubtask(): void {
        this.isAddingSubtask.set(true);
        this.newSubtaskTitle = '';
        this.needsFocus = true;
    }

    /**
     * Cancel inline adding mode
     */
    cancelAddingSubtask(): void {
        this.isAddingSubtask.set(false);
        this.newSubtaskTitle = '';
        this.needsFocus = false;
    }

    /**
     * Save the new subtask
     */
    saveNewSubtask(): void {
        const title = this.newSubtaskTitle.trim();
        if (!title) {
            this.cancelAddingSubtask();
            return;
        }

        this.subtaskState.addSubtask(this.taskId, {
            title
        });

        this.cancelAddingSubtask();
    }

    /**
     * AfterViewChecked lifecycle hook to focus the input when needed
     */
    ngAfterViewChecked(): void {
        if (this.needsFocus && this.newSubtaskInput) {
            this.newSubtaskInput.nativeElement.focus();
            this.needsFocus = false;
        }
    }
}
