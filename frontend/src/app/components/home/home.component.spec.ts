import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        ConfirmationService,
        MessageService,
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  describe('openCreateTaskDialog()', () => {
    it('should call showCreateTaskDialog on BacklogSidebarComponent', () => {
      const fixture = TestBed.createComponent(HomeComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      // Get the BacklogSidebarComponent instance through ViewChild
      const backlogSidebar = component['backlogSidebar'];
      const showCreateTaskDialogSpy = jest.spyOn(
        backlogSidebar,
        'showCreateTaskDialog',
      );

      component['openCreateTaskDialog']();

      expect(showCreateTaskDialogSpy).toHaveBeenCalled();
    });

    it('should handle when BacklogSidebarComponent is not yet available', () => {
      const fixture = TestBed.createComponent(HomeComponent);
      const component = fixture.componentInstance;

      // Don't call detectChanges, so ViewChild is not initialized
      // This should not throw an error due to optional chaining
      expect(() => component['openCreateTaskDialog']()).not.toThrow();
    });
  });
});
