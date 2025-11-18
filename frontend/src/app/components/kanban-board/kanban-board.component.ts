import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PanelModule } from 'primeng/panel';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { TaskStateService } from '../../services/task-state.service';
import { BoardPreferencesService } from '../../services/board-preferences.service';
import { TaskUtilsService } from '../../shared/services/task-utils.service';
import { Task, TaskStatus, Workspace, CreateTaskDto, UpdateTaskDto } from '../../models';
import { BoardLayout } from '../../models/board-layout.enum';
import { TaskFormDialogComponent } from '../../shared/components/task-form-dialog/task-form-dialog.component';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { SubtaskListComponent } from '../subtasks/subtask-list/subtask-list.component';

/**
 * KanbanBoardComponent
 *
 * Three-column kanban board (Today, In Progress, Done) with PrimeNG components.
 * Displays tasks organized by status with drag & drop support (to be added later).
 * Features progress tracking and task detail dialogs.
 */
@Component({
  selector: 'app-kanban-board',
  imports: [
    CommonModule,
    DragDropModule,
    PanelModule,
    BadgeModule,
    ProgressBarModule,
    DataViewModule,
    ButtonModule,
    MessageModule,
    DialogModule,
    TagModule,
    ChipModule,
    TaskFormDialogComponent,
    TaskCardComponent,
    SubtaskListComponent,
  ],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
})
export class KanbanBoardComponent implements OnInit {
  TaskStatus = TaskStatus;
  Workspace = Workspace;
  BoardLayout = BoardLayout;

  private readonly taskState = inject(TaskStateService);
  private readonly boardPreferences = inject(BoardPreferencesService);
  private readonly taskUtils = inject(TaskUtilsService);

  selectedTask = signal<Task | null>(null);
  showTaskDialog = signal<boolean>(false);
  createTaskDialogVisible = signal<boolean>(false);

  // Sort mode: 'time' | 'priority' | 'manual' | 'alphabetical'
  currentSortMode = signal<'time' | 'priority' | 'manual' | 'alphabetical'>('manual');

  // Use workspace-filtered computed signals from TaskStateService
  todayTasks = computed(() => this.taskState.currentWorkspaceTodayTasks());
  inProgressTasks = computed(() => this.taskState.currentWorkspaceInProgressTasks());
  doneTasks = computed(() => this.taskState.currentWorkspaceDoneTasks());

  // Board layout preferences
  readonly currentLayout = this.boardPreferences.layout;

  dailyProgress = computed(() => {
    const today = this.todayTasks().length;
    const inProgress = this.inProgressTasks().length;
    const done = this.doneTasks().length;
    const total = today + inProgress + done;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  });

  // Progress for Up Next column (TODAY tasks)
  upNextProgress = computed(() => {
    const tasks = this.todayTasks();
    const total = tasks.length;
    if (total === 0) return 0;

    // In the context of "Up Next", we consider tasks that have been moved to IN_PROGRESS or DONE
    // But since these are todayTasks, they're all in TODAY status
    // So we'll calculate based on completed tasks in the entire workspace for now
    // A better approach might be to track completion within the day
    return 0; // For now, since all tasks in todayTasks are by definition not complete
  });

  ngOnInit(): void {
    this.taskState.loadTasks();
  }

  showAddTaskDialog(): void {
    this.createTaskDialogVisible.set(true);
  }

  hideCreateTaskDialog(): void {
    this.createTaskDialogVisible.set(false);
  }

  handleTaskSubmitted(dto: CreateTaskDto | UpdateTaskDto): void {
    // Only CreateTaskDto is used when creating new tasks (no 'id' field on create)
    this.taskState.addTask(dto as CreateTaskDto);
  }

  toggleSort(): void {
    const modes: Array<'time' | 'priority' | 'manual' | 'alphabetical'> = ['manual', 'time', 'priority', 'alphabetical'];
    const currentIndex = modes.indexOf(this.currentSortMode());
    const nextIndex = (currentIndex + 1) % modes.length;
    this.currentSortMode.set(modes[nextIndex]);
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
  }

  getSortLabel(): string {
    const mode = this.currentSortMode();
    switch (mode) {
      case 'time':
        return this.getCurrentTime();
      case 'priority':
        return 'Priority';
      case 'alphabetical':
        return 'A-Z';
      case 'manual':
      default:
        return 'Manual';
    }
  }

  openTaskDetails(task: Task): void {
    this.selectedTask.set(task);
    this.showTaskDialog.set(true);
  }

  closeTaskDialog(): void {
    this.showTaskDialog.set(false);
    this.selectedTask.set(null);
  }

  moveToStatus(taskId: number, newStatus: TaskStatus): void {
    this.taskState.updateTask(taskId, { status: newStatus });
    this.closeTaskDialog();
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskState.removeTask(taskId);
      this.closeTaskDialog();
    }
  }

  /**
   * Toggle between Traditional and Focus board layouts.
   */
  toggleBoardLayout(): void {
    this.boardPreferences.toggleLayout();
  }

  /**
   * Handles drag and drop events between kanban columns.
   * Updates task status based on which column the task was dropped into.
   * In Focus mode, enforces WIP=1 by auto-swapping tasks in IN_PROGRESS.
   */
  onDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
    const task = event.item.data as Task;

    console.log('Drop event:', {
      task: task.title,
      fromStatus: task.status,
      toStatus: newStatus,
      containerId: event.container.id,
      previousContainerId: event.previousContainer.id
    });

    // Only update if actually moving to a different container
    if (event.previousContainer !== event.container) {
      // Focus mode: Enforce WIP=1 for IN_PROGRESS
      if (newStatus === TaskStatus.IN_PROGRESS && this.currentLayout() === BoardLayout.FOCUS) {
        // Find existing in-progress task in same workspace
        const currentInProgress = this.inProgressTasks().find(t => t.id !== task.id);

        // Auto-swap: move current task back to TODAY
        if (currentInProgress) {
          console.log('Focus mode WIP=1: Moving existing task back to TODAY:', currentInProgress.title);
          this.taskState.updateTask(currentInProgress.id, { status: TaskStatus.TODAY });
        }
      }

      // Move new task to target status
      this.taskState.updateTask(task.id, { status: newStatus });
    }
  }

  /**
   * Utility methods delegating to TaskUtilsService
   */
  getWorkspaceSeverity(workspace: Workspace): 'success' | 'info' {
    return this.taskUtils.getWorkspaceSeverity(workspace);
  }

  formatDate(dateStr: string | Date | null | undefined): string {
    return this.taskUtils.formatDate(dateStr);
  }
}
