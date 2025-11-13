import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { TaskStateService } from '../../services/task-state.service';
import { ChannelApiService } from '../../services/channel-api.service';
import { Task, CreateTaskDto, Channel } from '../../models';
import { Workspace } from '../../models/workspace.enum';
import { TaskStatus } from '../../models/task-status.enum';

interface GroupedTasks {
    workspace: Workspace;
    workspaceName: string;
    channels: {
        channel: Channel | null;
        channelName: string;
        tasks: Task[];
    }[];
}

@Component({
    selector: 'app-backlog-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PanelModule,
        AccordionModule,
        DataViewModule,
        CardModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        DatePickerModule,
        CheckboxModule,
        MessageModule,
        ConfirmDialogModule,
        TooltipModule
    ],
    providers: [ConfirmationService],
    templateUrl: './backlog-sidebar.component.html',
    styleUrl: './backlog-sidebar.component.css'
})
export class BacklogSidebarComponent implements OnInit {
    private channelsSignal = signal<Channel[]>([]);

    readonly channels = this.channelsSignal.asReadonly();

    constructor(
        private taskStateService: TaskStateService,
        private channelApiService: ChannelApiService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService
    ) {
        this.createTaskForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            workspace: [Workspace.PERSONAL, Validators.required],
            channelId: [null],
            dueDate: [null],
            isRoutine: [false]
        });

        this.editTaskForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            workspace: [Workspace.PERSONAL, Validators.required],
            channelId: [null],
            dueDate: [null],
            isRoutine: [false]
        });
    }

    readonly backlogTasks = computed(() => this.taskStateService.backlogTasks());

    readonly groupedByWorkspace = computed(() => {
        const tasks = this.backlogTasks();
        const channels = this.channelsSignal();
        
        const groups: GroupedTasks[] = [];
        
        [Workspace.WORK, Workspace.PERSONAL].forEach(workspace => {
            const workspaceTasks = tasks.filter(t => t.workspace === workspace);
            const workspaceChannels = channels.filter(c => c.workspace === workspace);
            
            const channelGroups = new Map<number | null, Task[]>();
            
            workspaceTasks.forEach(task => {
                const channelId: number | null = task.channelId ?? null;
                if (!channelGroups.has(channelId)) {
                    channelGroups.set(channelId, []);
                }
                channelGroups.get(channelId)!.push(task);
            });
            
            const channelsWithTasks = Array.from(channelGroups.entries()).map(([channelId, tasks]) => {
                const channel = channelId ? workspaceChannels.find(c => c.id === channelId) || null : null;
                return {
                    channel,
                    channelName: channel ? channel.name : 'Uncategorized',
                    tasks
                };
            });
            
            if (channelsWithTasks.length > 0) {
                groups.push({
                    workspace,
                    workspaceName: workspace === Workspace.WORK ? 'Work' : 'Personal',
                    channels: channelsWithTasks
                });
            }
        });
        
        return groups;
    });
    
    createTaskDialogVisible = signal(false);
    taskDetailsDialogVisible = signal(false);
    selectedTask = signal<Task | null>(null);
    
    createTaskForm: FormGroup;
    editTaskForm: FormGroup;
    
    workspaceOptions = [
        { label: 'Work', value: Workspace.WORK },
        { label: 'Personal', value: Workspace.PERSONAL }
    ];
    
    readonly filteredChannels = computed(() => {
        const workspace = this.createTaskForm?.get('workspace')?.value;
        if (!workspace) return [];
        return this.channelsSignal().filter(c => c.workspace === workspace);
    });
    
    ngOnInit(): void {
        this.taskStateService.loadTasks();
        this.loadChannels();
    }
    
    loadChannels(): void {
        this.channelApiService.getChannels().subscribe({
            next: (channels) => this.channelsSignal.set(channels),
            error: (error) => console.error('Error loading channels:', error)
        });
    }
    
    showCreateTaskDialog(): void {
        this.createTaskForm.reset({
            workspace: Workspace.PERSONAL,
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
                ...this.createTaskForm.value,
                status: TaskStatus.BACKLOG
            };
            
            this.taskStateService.addTask(dto);
            this.hideCreateTaskDialog();
        }
    }
    
    showTaskDetails(task: Task): void {
        this.selectedTask.set(task);
        this.editTaskForm.patchValue({
            title: task.title,
            description: task.description,
            workspace: task.workspace,
            channelId: task.channelId,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            isRoutine: task.isRoutine
        });
        this.taskDetailsDialogVisible.set(true);
    }
    
    hideTaskDetailsDialog(): void {
        this.taskDetailsDialogVisible.set(false);
        this.selectedTask.set(null);
    }
    
    submitEditTask(): void {
        const task = this.selectedTask();
        if (task && this.editTaskForm.valid) {
            this.taskStateService.updateTask(task.id, this.editTaskForm.value);
            this.hideTaskDetailsDialog();
        }
    }
    
    confirmDeleteTask(): void {
        const task = this.selectedTask();
        if (task) {
            this.confirmationService.confirm({
                message: `Are you sure you want to delete "${task.title}"?`,
                header: 'Confirm Delete',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.taskStateService.removeTask(task.id);
                    this.hideTaskDetailsDialog();
                }
            });
        }
    }
}
