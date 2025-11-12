# ADR-004: Enable Zoneless Change Detection

**Status:** Accepted
**Date:** 2025-11-12
**Decision Makers:** George
**Tags:** frontend, angular, performance

## Context

Angular traditionally uses Zone.js to automatically detect when to update the view. However, Zone.js:
- Adds ~50KB to the bundle
- Patches all async APIs (Promise, setTimeout, events)
- Can cause performance issues with many async operations
- Is being phased out in favor of signals

Angular 20 introduces experimental zoneless mode, which:
- Removes Zone.js dependency
- Relies on signals for change detection
- Requires explicit change detection triggers
- Better performance

For Tasker, we need:
- Fast, responsive UI
- Minimal bundle size
- Modern Angular patterns
- Future-proof architecture

## Decision

We will **enable experimental zoneless change detection** in Angular 20 and remove Zone.js entirely.

## Rationale

### Why Zoneless?

1. **Better Performance**
   - No Zone.js overhead
   - No patching of async APIs
   - Faster change detection cycles
   - More predictable performance

2. **Smaller Bundle**
   - ~50KB reduction (Zone.js removed)
   - Important for initial load time
   - Better for users with slow connections

3. **Works Perfectly with Signals**
   - Signals automatically trigger change detection
   - No manual `ChangeDetectorRef.markForCheck()`
   - Signals are zoneless-first

4. **Future-Proof**
   - Angular's direction for v21+
   - Zone.js will be fully optional soon
   - Better to adopt early

5. **Forces Best Practices**
   - Encourages signals over RxJS
   - More explicit about updates
   - Cleaner architecture

### How Zoneless Works

**Without Zone.js:**
```typescript
// Zone.js detects this automatically
setTimeout(() => {
  this.count++; // View updates automatically
}, 1000);
```

**With Zoneless + Signals:**
```typescript
// Signal automatically triggers change detection
count = signal(0);

setTimeout(() => {
  this.count.set(this.count() + 1); // View updates automatically
}, 1000);
```

**With Zoneless + RxJS (when needed):**
```typescript
// Use toSignal() to bridge RxJS → Signals
searchResults = toSignal(this.searchTerm$.pipe(
  debounceTime(300),
  switchMap(term => this.api.search(term))
), { initialValue: [] });
```

## Implementation

### Bootstrap Configuration

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideExperimentalZonelessChangeDetection
} from '@angular/core';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(), // Enable zoneless
    provideRouter(routes),
    provideHttpClient(),
    // Other providers...
  ],
}).catch(err => console.error(err));
```

### Remove Zone.js Import

```typescript
// polyfills.ts (DELETE OR COMMENT OUT)
// import 'zone.js'; // ❌ Remove this line
```

### Component Patterns

#### ✅ Good: Using Signals
```typescript
@Component({
  selector: 'app-task-list',
  template: `
    <div>
      @for (task of tasks(); track task.id) {
        <app-task-card [task]="task" />
      }
    </div>
  `,
})
export class TaskListComponent {
  private taskState = inject(TaskStateService);

  tasks = this.taskState.tasks; // Signal, auto-updates
}
```

#### ✅ Good: RxJS with toSignal()
```typescript
@Component({
  selector: 'app-search',
  template: `
    <input (input)="onSearch($event)" />
    @for (result of searchResults(); track result.id) {
      <div>{{ result.title }}</div>
    }
  `,
})
export class SearchComponent {
  private searchTerm$ = new Subject<string>();

  // Convert Observable to Signal for zoneless
  searchResults = toSignal(
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.api.search(term))
    ),
    { initialValue: [] }
  );

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm$.next(term);
  }
}
```

#### ❌ Bad: Raw async without signals
```typescript
@Component({
  template: `<div>{{ count }}</div>`
})
export class CounterComponent {
  count = 0;

  constructor() {
    // ❌ Won't trigger change detection in zoneless!
    setTimeout(() => {
      this.count++; // View won't update
    }, 1000);
  }
}
```

#### ✅ Fixed: Use signals
```typescript
@Component({
  template: `<div>{{ count() }}</div>`
})
export class CounterComponent {
  count = signal(0);

  constructor() {
    // ✅ Will trigger change detection
    setTimeout(() => {
      this.count.update(n => n + 1); // View updates!
    }, 1000);
  }
}
```

### HTTP Requests Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private http = inject(HttpClient);

  // Return Observable (standard Angular pattern)
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>('/api/tasks');
  }
}

@Injectable({ providedIn: 'root' })
export class TaskStateService {
  private tasksSignal = signal<Task[]>([]);
  private loadingSignal = signal(false);

  readonly tasks = this.tasksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  constructor(private api: TaskApiService) {}

  loadTasks() {
    this.loadingSignal.set(true);

    // Subscribe and update signal
    this.api.getTasks().subscribe({
      next: tasks => {
        this.tasksSignal.set(tasks); // Triggers change detection
        this.loadingSignal.set(false);
      },
      error: err => {
        console.error(err);
        this.loadingSignal.set(false);
      }
    });
  }
}
```

### Event Handlers (Still Work!)

```typescript
@Component({
  template: `
    <button (click)="increment()">{{ count() }}</button>
  `,
})
export class CounterComponent {
  count = signal(0);

  // ✅ Event handlers trigger change detection automatically
  increment() {
    this.count.update(n => n + 1);
  }
}
```

## Testing Considerations

### TestBed Configuration

```typescript
// task.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(), // Zoneless in tests
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
  });

  it('should update when signal changes', () => {
    component.count.set(5);
    fixture.detectChanges(); // Still need this in tests

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('5');
  });
});
```

## Consequences

### Positive

- ✅ ~50KB smaller bundle (Zone.js removed)
- ✅ Better performance (no Zone.js patching)
- ✅ Predictable change detection
- ✅ Forces signals (better architecture)
- ✅ Future-proof (Angular's direction)
- ✅ Simpler mental model with signals

### Negative

- ⚠️ Experimental (may have bugs or breaking changes)
- ⚠️ Must use signals or toSignal() for reactivity
- ⚠️ Some third-party libraries may expect Zone.js
- ⚠️ Less Stack Overflow answers (newer pattern)
- ⚠️ Manual change detection needed for edge cases

### Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Breaking changes | Pin Angular version, test before upgrading |
| Third-party library issues | Test libraries, avoid Zone.js-dependent libs |
| Missed change detection | Use signals everywhere, test thoroughly |
| Team unfamiliarity | Solo project, not a concern |

## Escape Hatch (If Needed)

If zoneless causes issues:

1. **Re-enable Zone.js temporarily**
   ```typescript
   // main.ts
   import 'zone.js'; // Add back

   bootstrapApplication(AppComponent, {
     providers: [
       // Remove provideExperimentalZonelessChangeDetection()
       provideRouter(routes),
       // ...
     ],
   });
   ```

2. **Gradual migration**
   - Keep Zone.js
   - Migrate components to signals gradually
   - Remove Zone.js when ready

## Third-Party Library Compatibility

### PrimeNG
- ✅ **Compatible** - Works with zoneless
- Uses standard Angular patterns
- No Zone.js dependency

### Angular CDK (Drag & Drop)
- ✅ **Compatible** - Works with zoneless
- Official Angular library
- Signals-aware in Angular 20

### RxJS
- ✅ **Compatible** - Use `toSignal()` bridge
- Most operators work fine
- Just convert to signals at component boundary

## Performance Benchmarks

Estimated improvements:
- **Bundle size:** -50KB (~5-7% for typical app)
- **Initial load:** -50-100ms (Zone.js parsing)
- **Change detection:** 10-30% faster (no Zone patching)
- **Memory:** Slightly lower (fewer patched objects)

## Future Angular Versions

### Angular 21+ (Expected)
- Zoneless likely becomes default
- Zone.js fully optional
- Even better signal integration

### Angular 22+ (Speculation)
- Zone.js possibly deprecated
- Signals everywhere
- This decision will age well

## Alternatives Considered

### Keep Zone.js with OnPush
**Pros:** Mature, well-understood, safer
**Cons:** Still includes Zone.js, less future-proof
**Verdict:** Not taking advantage of Angular 20 improvements

### Zone.js with ChangeDetectorRef
**Pros:** Maximum control
**Cons:** Manual, error-prone, verbose
**Verdict:** Worse than signals

### Wait for Angular 21 Stable Zoneless
**Pros:** More stable
**Cons:** Delay project, miss learning opportunity
**Verdict:** Experimental is acceptable for side project

## References

- [Angular Zoneless Change Detection](https://angular.dev/guide/experimental/zoneless)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Zone.js GitHub](https://github.com/angular/angular/tree/main/packages/zone.js)
- [toSignal() API](https://angular.dev/api/core/rxjs-interop/toSignal)

## Review Schedule

- **v0.2:** Evaluate stability and performance gains
- **v0.4:** Reassess if any issues have emerged
- **v1.0:** Full performance audit
- **Angular 21 release:** Re-evaluate if still experimental

---

**Decision Owner:** George
**Reviewed By:** N/A (solo project)
**Next Review:** v0.2 (after dopamine hit features)
