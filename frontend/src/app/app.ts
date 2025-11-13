import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Workspace } from './models';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';

@Component({
  imports: [CommonModule, RouterModule, KanbanBoardComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = 'Tasker';
  protected readonly currentWorkspace = signal<Workspace>(Workspace.WORK);
  protected readonly Workspace = Workspace;

  protected toggleWorkspace(): void {
    this.currentWorkspace.update(current =>
      current === Workspace.WORK ? Workspace.PERSONAL : Workspace.WORK
    );
  }
}
