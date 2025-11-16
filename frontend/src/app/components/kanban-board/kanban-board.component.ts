import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Popover } from 'primeng/popover';
import { TaskStateService } from '../../services/task-state.service';
import { BoardPreferencesService } from '../../services/board-preferences.service';
import { ChannelApiService } from '../../services/channel-api.service';
import { Task, TaskStatus, Workspace, CreateTaskDto, Channel } from '../../models';
import { BoardLayout } from '../../models/board-layout.enum';

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
    ReactiveFormsModule,
    DragDropModule,
    PanelModule,
    CardModule,
    BadgeModule,
    ChipModule,
    TagModule,
    ProgressBarModule,
    DataViewModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    MessageModule,
    InputTextModule,
    SelectModule,
    Popover,
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
  private readonly channelApiService = inject(ChannelApiService);
  private readonly fb = inject(FormBuilder);

  private channelsSignal = signal<Channel[]>([]);
  readonly channels = this.channelsSignal.asReadonly();

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

  // Task creation form
  createTaskForm: FormGroup;

  readonly filteredChannels = computed(() => {
    const workspace = this.createTaskForm?.get('workspace')?.value;
    if (!workspace) return [];
    return this.channelsSignal().filter(c => c.workspace === workspace);
  });

  statusOptions = [
    { label: 'Backlog', value: TaskStatus.BACKLOG },
    { label: 'Today', value: TaskStatus.TODAY }
  ];

  workspaceOptions = [
    { label: 'Work', value: Workspace.WORK },
    { label: 'Personal', value: Workspace.PERSONAL }
  ];

  constructor() {
    this.createTaskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: [TaskStatus.TODAY, Validators.required],
      workspace: [Workspace.PERSONAL, Validators.required],
      channelId: [null],
      dueDate: [null],
      isRoutine: [false]
    });
  }

  ngOnInit(): void {
    this.taskState.loadTasks();
    this.loadChannels();
  }

  loadChannels(): void {
    this.channelApiService.getChannels().subscribe({
      next: (channels) => this.channelsSignal.set(channels),
      error: (error) => console.error('Error loading channels:', error)
    });
  }

  showAddTaskDialog(): void {
    this.createTaskForm.reset({
      status: TaskStatus.TODAY,
      workspace: this.taskState.selectedWorkspace(),
      isRoutine: false
    });
    this.createTaskDialogVisible.set(true);
  }

  hideCreateTaskDialog(): void {
    this.createTaskDialogVisible.set(false);
  }

  submitCreateTask(): void {
    if (this.createTaskForm.valid) {
      const dto: CreateTaskDto = {
        ...this.createTaskForm.value
      };
      this.taskState.addTask(dto);
      this.hideCreateTaskDialog();
    } else {
      this.hideCreateTaskDialog();
    }
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

  getChannelName(channelId: number | null | undefined): string | null {
    if (!channelId) return null;
    const channel = this.channelsSignal().find(c => c.id === channelId);
    return channel?.name || null;
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

  getWorkspaceColor(workspace: Workspace): string {
    return workspace === Workspace.WORK ? '#F97316' : '#14B8A6';
  }

  getWorkspaceSeverity(workspace: Workspace): 'success' | 'info' {
    return workspace === Workspace.WORK ? 'success' : 'info';
  }

  formatDate(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
}
