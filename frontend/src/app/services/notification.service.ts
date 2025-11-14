import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error';

export interface Notification {
  message: string;
  type: NotificationType;
}

/**
 * NotificationService
 *
 * Manages subtle status notifications using signals.
 * Displays small inline notifications in the app header instead of toast popups.
 * Auto-hides after 2 seconds or when a new notification arrives.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notificationSignal = signal<Notification | null>(null);
  private timeoutId: number | null = null;

  readonly notification = this.notificationSignal.asReadonly();

  /**
   * Show a notification message.
   * Automatically hides after 2 seconds.
   *
   * @param message - The notification message to display
   * @param type - 'success' or 'error'
   */
  show(message: string, type: NotificationType): void {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Show new notification
    this.notificationSignal.set({ message, type });

    // Auto-hide after 2 seconds
    this.timeoutId = setTimeout(() => {
      this.notificationSignal.set(null);
      this.timeoutId = null;
    }, 2000) as unknown as number;
  }

  /**
   * Manually clear the current notification.
   */
  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.notificationSignal.set(null);
  }
}
