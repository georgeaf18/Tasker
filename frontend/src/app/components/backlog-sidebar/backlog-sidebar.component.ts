import {
  Component,
  computed,
  signal,
  inject,
  OnInit,
  effect,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { PanelModule } from 'primeng/panel';
import {
  Accordion,
  AccordionPanel,
  AccordionHeader,
  AccordionContent,
} from 'primeng/accordion';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { TaskStateService } from '../../services/task-state.service';
import { TaskFormDialogComponent } from '../../shared/components/task-form-dialog/task-form-dialog.component';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../models';
import { Workspace } from '../../models/workspace.enum';
import { TaskStatus } from '../../models/task-status.enum';

@Component({
  selector: 'app-backlog-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    PanelModule,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    DataViewModule,
    ButtonModule,
    MessageModule,
    BadgeModule,
    ChipModule,
    TaskFormDialogComponent,
    TaskCardComponent,
  ],
  templateUrl: './backlog-sidebar.component.html',
  styleUrl: './backlog-sidebar.component.css',
})
export class BacklogSidebarComponent implements OnInit {
  TaskStatus = TaskStatus;

  readonly taskStateService = inject(TaskStateService);

  // Signal to track which accordion panels are expanded (0 = Work, 1 = Personal)
  readonly expandedPanels = signal<number[]>([]);

  /**
   * Keyboard shortcut to open create task dialog
   * Ctrl+K (Windows/Linux) or Cmd+K (macOS)
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    // Check for Ctrl+K (Windows/Linux) or Cmd+K (macOS)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.showCreateTaskDialog();
    }
  }

  constructor() {
    // Effect to auto-expand accordion based on selected workspace
    effect(() => {
      const currentWorkspace = this.taskStateService.selectedWorkspace();
      if (currentWorkspace === Workspace.WORK) {
        this.expandedPanels.set([0]); // Expand Work section
      } else {
        this.expandedPanels.set([1]); // Expand Personal section
      }
    });
  }

  readonly backlogTasks = computed(() => this.taskStateService.backlogTasks());

  // Computed signals for workspace-specific task counts
  readonly workTaskCount = computed(
    () =>
      this.backlogTasks().filter((t) => t.workspace === Workspace.WORK).length,
  );

  readonly personalTaskCount = computed(
    () =>
      this.backlogTasks().filter((t) => t.workspace === Workspace.PERSONAL)
        .length,
  );

  // Get tasks for a specific workspace
  readonly workTasks = computed(() =>
    this.backlogTasks().filter((t) => t.workspace === Workspace.WORK),
  );

  readonly personalTasks = computed(() =>
    this.backlogTasks().filter((t) => t.workspace === Workspace.PERSONAL),
  );

  createTaskDialogVisible = signal(false);
  taskDetailsDialogVisible = signal(false);
  selectedTask = signal<Task | null>(null);

  ngOnInit(): void {
    this.taskStateService.loadTasks();
  }

  showCreateTaskDialog(): void {
    this.createTaskDialogVisible.set(true);
  }

  handleTaskSubmitted(dto: CreateTaskDto | UpdateTaskDto): void {
    // Only CreateTaskDto is used when creating new tasks (no 'id' field on create)
    this.taskStateService.addTask(dto as CreateTaskDto);
  }

  showTaskDetails(task: Task): void {
    this.selectedTask.set(task);
    this.taskDetailsDialogVisible.set(true);
  }

  hideTaskDetailsDialog(): void {
    this.taskDetailsDialogVisible.set(false);
    this.selectedTask.set(null);
  }

  handleTaskUpdated(dto: UpdateTaskDto): void {
    const task = this.selectedTask();
    if (task) {
      this.taskStateService.updateTask(task.id, dto);
      this.hideTaskDetailsDialog();
    }
  }

  confirmDeleteTask(): void {
    const task = this.selectedTask();
    if (task && confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskStateService.removeTask(task.id);
      this.hideTaskDetailsDialog();
    }
  }

  /**
   * Handles drag and drop events for tasks dropped into the backlog.
   * Updates task status to BACKLOG when dropped.
   */
  onDrop(event: CdkDragDrop<Task[]>): void {
    const task = event.item.data as Task;

    // Only update if the status actually changed
    if (task.status !== TaskStatus.BACKLOG) {
      this.taskStateService.updateTask(task.id, { status: TaskStatus.BACKLOG });
    }
  }
}
