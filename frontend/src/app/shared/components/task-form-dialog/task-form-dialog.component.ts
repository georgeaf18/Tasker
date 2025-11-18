import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  computed,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Popover } from 'primeng/popover';
import { ChannelApiService } from '../../../services/channel-api.service';
import { TaskUtilsService } from '../../services/task-utils.service';
import {
  STATUS_OPTIONS,
  WORKSPACE_OPTIONS,
} from '../../constants/task.constants';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  Channel,
  TaskStatus,
  Workspace,
} from '../../../models';

/**
 * TaskFormDialogComponent
 *
 * Reusable dialog component for creating and editing tasks.
 * Consolidates duplicate dialog logic from kanban-board and backlog-sidebar.
 */
@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    Popover,
  ],
  templateUrl: './task-form-dialog.component.html',
  styleUrl: './task-form-dialog.component.css',
})
export class TaskFormDialogComponent implements OnInit {
  @Input() visible = false;
  @Input() task?: Task; // If provided, edit mode; otherwise create mode
  @Input() defaultStatus: TaskStatus = TaskStatus.TODAY;
  @Input() defaultWorkspace: Workspace = Workspace.PERSONAL;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() taskSubmitted = new EventEmitter<CreateTaskDto | UpdateTaskDto>();

  TaskStatus = TaskStatus;
  Workspace = Workspace;

  private channelsSignal = signal<Channel[]>([]);
  readonly channels = this.channelsSignal.asReadonly();

  taskForm: FormGroup;

  readonly filteredChannels = computed(() => {
    const workspace = this.taskForm?.get('workspace')?.value;
    if (!workspace) return [];
    return this.channelsSignal().filter((c) => c.workspace === workspace);
  });

  statusOptions = STATUS_OPTIONS.filter(
    (opt) => opt.value === TaskStatus.BACKLOG || opt.value === TaskStatus.TODAY,
  );
  workspaceOptions = WORKSPACE_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private channelApiService: ChannelApiService,
    private taskUtils: TaskUtilsService,
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: [this.defaultStatus, Validators.required],
      workspace: [this.defaultWorkspace, Validators.required],
      channelId: [null],
      dueDate: [null],
      isRoutine: [false],
    });

    // Reset form when dialog visibility changes
    effect(() => {
      if (this.visible) {
        this.initializeForm();
      }
    });
  }

  ngOnInit(): void {
    this.loadChannels();
  }

  loadChannels(): void {
    this.channelApiService.getChannels().subscribe({
      next: (channels) => this.channelsSignal.set(channels),
      error: (error) => console.error('Error loading channels:', error),
    });
  }

  initializeForm(): void {
    if (this.task) {
      // Edit mode - populate with existing task data
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        status: this.task.status,
        workspace: this.task.workspace,
        channelId: this.task.channelId,
        dueDate: this.task.dueDate ? new Date(this.task.dueDate) : null,
        isRoutine: this.task.isRoutine,
      });
    } else {
      // Create mode - reset with defaults
      this.taskForm.reset({
        status: this.defaultStatus,
        workspace: this.defaultWorkspace,
        isRoutine: false,
      });
    }
  }

  hideDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  submitForm(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      this.taskSubmitted.emit(formValue);
      this.hideDialog();
    } else {
      // If form is invalid (empty title), just close the dialog
      this.hideDialog();
    }
  }

  getChannelName(channelId: number | null | undefined): string | null {
    return this.taskUtils.getChannelName(channelId, this.channelsSignal());
  }
}
