import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { App } from './app';
import { Workspace } from './models/workspace.enum';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        ConfirmationService,
        MessageService
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Tasker');
  });

  it('should initialize with WORK workspace', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app['currentWorkspace']()).toBe(Workspace.WORK);
  });

  it('should toggle workspace from WORK to PERSONAL', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app['currentWorkspace'].set(Workspace.WORK);
    app['toggleWorkspace']();

    expect(app['currentWorkspace']()).toBe(Workspace.PERSONAL);
  });

  it('should toggle workspace from PERSONAL to WORK', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app['currentWorkspace'].set(Workspace.PERSONAL);
    app['toggleWorkspace']();

    expect(app['currentWorkspace']()).toBe(Workspace.WORK);
  });

  it('should expose Workspace enum to template', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app['Workspace']).toBe(Workspace);
  });
});
