import { Component, signal, ViewChild, effect, inject, computed } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Workspace } from './models';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { BacklogSidebarComponent } from './components/backlog-sidebar/backlog-sidebar.component';
import { ImportSidebarComponent } from './components/import-sidebar/import-sidebar.component';
import { TaskStateService } from './services/task-state.service';
import { NotificationService } from './services/notification.service';
import { ThemeService } from './services/theme.service';

@Component({
  imports: [CommonModule, RouterModule, KanbanBoardComponent, BacklogSidebarComponent, ImportSidebarComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  @ViewChild(BacklogSidebarComponent) backlogSidebar!: BacklogSidebarComponent;

  private readonly taskState = inject(TaskStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  protected readonly title = 'Tasker';
  protected readonly currentWorkspace = signal<Workspace>(Workspace.WORK);
  protected readonly sidebarVisible = signal<boolean>(true);
  protected readonly importSidebarVisible = signal<boolean>(false);
  protected readonly Workspace = Workspace;
  protected readonly notification = computed(() => this.notificationService.notification());

  constructor() {
    // Sync currentWorkspace changes to TaskStateService
    effect(() => {
      this.taskState.setSelectedWorkspace(this.currentWorkspace());
    });

    // Apply theme changes to document root
    effect(() => {
      const theme = this.themeService.effectiveTheme();
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  protected isMainView(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  protected toggleWorkspace(): void {
    this.currentWorkspace.update(current =>
      current === Workspace.WORK ? Workspace.PERSONAL : Workspace.WORK
    );
  }

  protected toggleSidebar(): void {
    this.sidebarVisible.update(visible => !visible);
  }

  protected toggleImportSidebar(): void {
    this.importSidebarVisible.update(visible => !visible);
  }

  /**
   * Opens the create task dialog in the backlog sidebar.
   * Delegates to BacklogSidebarComponent to keep task creation logic centralized.
   */
  protected openCreateTaskDialog(): void {
    this.backlogSidebar?.showCreateTaskDialog();
  }
}
