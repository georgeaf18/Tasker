import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially have no notification', () => {
    expect(service.notification()).toBeNull();
  });

  it('should show a success notification', () => {
    service.show('Task created', 'success');

    const notification = service.notification();
    expect(notification).toBeTruthy();
    expect(notification?.message).toBe('Task created');
    expect(notification?.type).toBe('success');
  });

  it('should show an error notification', () => {
    service.show('Failed to delete', 'error');

    const notification = service.notification();
    expect(notification).toBeTruthy();
    expect(notification?.message).toBe('Failed to delete');
    expect(notification?.type).toBe('error');
  });

  it('should auto-hide after 2 seconds', fakeAsync(() => {
    service.show('Task updated', 'success');
    expect(service.notification()).toBeTruthy();

    tick(2000);

    expect(service.notification()).toBeNull();
  }));

  it('should replace existing notification with new one', fakeAsync(() => {
    service.show('First notification', 'success');
    expect(service.notification()?.message).toBe('First notification');

    tick(500);

    service.show('Second notification', 'error');
    expect(service.notification()?.message).toBe('Second notification');
    expect(service.notification()?.type).toBe('error');

    // First timeout should be cleared, second one should still be active
    tick(1500);
    expect(service.notification()).toBeTruthy();

    tick(500);
    expect(service.notification()).toBeNull();
  }));

  it('should manually clear notification', fakeAsync(() => {
    service.show('Task created', 'success');
    expect(service.notification()).toBeTruthy();

    service.clear();
    expect(service.notification()).toBeNull();

    // Ensure timeout was cleared
    tick(2000);
    expect(service.notification()).toBeNull();
  }));

  it('should handle multiple rapid notifications', fakeAsync(() => {
    service.show('Notification 1', 'success');
    tick(100);
    service.show('Notification 2', 'success');
    tick(100);
    service.show('Notification 3', 'success');

    expect(service.notification()?.message).toBe('Notification 3');

    tick(2000);
    expect(service.notification()).toBeNull();
  }));
});
