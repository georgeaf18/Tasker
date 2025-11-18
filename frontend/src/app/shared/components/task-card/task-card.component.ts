import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Task, Workspace } from '../../../models';
import { SubtaskListComponent } from '../../../components/subtasks/subtask-list/subtask-list.component';
import { TaskUtilsService } from '../../services/task-utils.service';

export type TaskCardVariant = 'full' | 'compact';

/**
 * TaskCardComponent
 *
 * Reusable task card component with different display variants.
 * Consolidates duplicate task rendering logic from kanban-board and backlog-sidebar.
 *
 * Variants:
 * - full: Complete card with channel, tags, workspace, due date, and subtasks (for kanban board)
 * - compact: Simplified card with title, due date, and routine badge (for backlog sidebar)
 */
@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChipModule,
    TagModule,
    TooltipModule,
    SubtaskListComponent,
  ],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Input() variant: TaskCardVariant = 'full';
  @Input() draggable = false;

  @Output() taskClick = new EventEmitter<Task>();

  private taskUtils = inject(TaskUtilsService);

  getWorkspaceSeverity(workspace: Workspace): 'success' | 'info' {
    return this.taskUtils.getWorkspaceSeverity(workspace);
  }

  formatDate(dateStr: string | Date | null | undefined): string {
    return this.taskUtils.formatDate(dateStr);
  }

  onCardClick(): void {
    this.taskClick.emit(this.task);
  }
}
