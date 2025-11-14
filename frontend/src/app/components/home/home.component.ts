import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanBoardComponent } from '../kanban-board/kanban-board.component';
import { BacklogSidebarComponent } from '../backlog-sidebar/backlog-sidebar.component';

/**
 * HomeComponent - Main view container for kanban board and backlog sidebar
 *
 * This component is lazy-loaded to reduce initial bundle size.
 * Contains the main task management interface.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, KanbanBoardComponent, BacklogSidebarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  @ViewChild(BacklogSidebarComponent) backlogSidebar!: BacklogSidebarComponent;

  /**
   * Opens the create task dialog in the backlog sidebar.
   * Delegates to BacklogSidebarComponent to keep task creation logic centralized.
   */
  openCreateTaskDialog(): void {
    this.backlogSidebar?.showCreateTaskDialog();
  }
}
