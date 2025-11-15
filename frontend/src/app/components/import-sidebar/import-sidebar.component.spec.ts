import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportSidebarComponent } from './import-sidebar.component';

describe('ImportSidebarComponent', () => {
  let component: ImportSidebarComponent;
  let fixture: ComponentFixture<ImportSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportSidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render sidebar header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('.sidebar-header h2');
    expect(header?.textContent).toContain('Import Tasks');
  });

  it('should initialize with empty expanded panels', () => {
    expect(component['expandedPanels']()).toEqual([]);
  });
});
