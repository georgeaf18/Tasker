import { Component, signal, ViewChild, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { Workspace } from './models';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { BacklogSidebarComponent } from './components/backlog-sidebar/backlog-sidebar.component';
import { TaskStateService } from './services/task-state.service';

@Component({
  imports: [CommonModule, RouterModule, ToastModule, KanbanBoardComponent, BacklogSidebarComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  @ViewChild(BacklogSidebarComponent) backlogSidebar!: BacklogSidebarComponent;

  private readonly taskState = inject(TaskStateService);

  protected readonly title = 'Tasker';
  protected readonly currentWorkspace = signal<Workspace>(Workspace.WORK);
  protected readonly sidebarVisible = signal<boolean>(true);
  protected readonly Workspace = Workspace;

  constructor() {
    // Sync currentWorkspace changes to TaskStateService
    effect(() => {
      this.taskState.setSelectedWorkspace(this.currentWorkspace());
    });
  }

  protected toggleWorkspace(): void {
    this.currentWorkspace.update(current =>
      current === Workspace.WORK ? Workspace.PERSONAL : Workspace.WORK
    );
  }

  protected toggleSidebar(): void {
    this.sidebarVisible.update(visible => !visible);
  }

  /**
   * Opens the create task dialog in the backlog sidebar.
   * Delegates to BacklogSidebarComponent to keep task creation logic centralized.
   */
  protected openCreateTaskDialog(): void {
    this.backlogSidebar?.showCreateTaskDialog();
  }
}
