import { Component, signal, effect, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Workspace } from './models';
import { TaskStateService } from './services/task-state.service';
import { NotificationService } from './services/notification.service';

/**
 * App - Root shell component
 *
 * Minimal shell that provides header and navigation.
 * Main views are lazy-loaded via router-outlet to reduce initial bundle size.
 */
@Component({
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly taskState = inject(TaskStateService);
  private readonly notificationService = inject(NotificationService);

  protected readonly title = 'Tasker';
  protected readonly currentWorkspace = signal<Workspace>(Workspace.WORK);
  protected readonly Workspace = Workspace;
  protected readonly notification = computed(() =>
    this.notificationService.notification(),
  );

  constructor() {
    // Sync currentWorkspace changes to TaskStateService
    effect(() => {
      this.taskState.setSelectedWorkspace(this.currentWorkspace());
    });
  }

  protected toggleWorkspace(): void {
    this.currentWorkspace.update((current) =>
      current === Workspace.WORK ? Workspace.PERSONAL : Workspace.WORK,
    );
  }
}
