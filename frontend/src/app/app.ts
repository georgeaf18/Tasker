import { Component, signal, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { Workspace } from './models';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { BacklogSidebarComponent } from './components/backlog-sidebar/backlog-sidebar.component';

@Component({
  imports: [CommonModule, RouterModule, ToastModule, KanbanBoardComponent, BacklogSidebarComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  @ViewChild(BacklogSidebarComponent) backlogSidebar!: BacklogSidebarComponent;

  protected readonly title = 'Tasker';
  protected readonly currentWorkspace = signal<Workspace>(Workspace.WORK);
  protected readonly Workspace = Workspace;

  protected toggleWorkspace(): void {
    this.currentWorkspace.update(current =>
      current === Workspace.WORK ? Workspace.PERSONAL : Workspace.WORK
    );
  }

  /**
   * Opens the create task dialog in the backlog sidebar.
   * Delegates to BacklogSidebarComponent to keep task creation logic centralized.
   */
  protected openCreateTaskDialog(): void {
    this.backlogSidebar?.showCreateTaskDialog();
  }
}
