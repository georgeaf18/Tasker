# ADR-001: Use Angular Signals for State Management

**Status:** Accepted
**Date:** 2025-11-12
**Decision Makers:** George
**Tags:** frontend, angular, state-management

## Context

For v0.1 of Tasker, we need a state management solution that:

- Works efficiently with Angular 20's zoneless change detection
- Has minimal boilerplate and learning curve
- Provides reactive updates for task lists and kanban board
- Supports computed/derived state (e.g., filtering tasks by status)
- Is maintainable for a solo developer

## Decision

We will use **Angular Signals** as the primary state management solution, avoiding NgRx, Akita, or custom RxJS BehaviorSubject stores.

## Rationale

### Why Signals?

1. **Native to Angular 20**
   - Built into the framework, no external dependencies
   - First-class support and future-proof
   - Optimized for Angular's rendering pipeline

2. **Perfect for Zoneless Mode**
   - Signals automatically trigger change detection without Zone.js
   - No need for manual `ChangeDetectorRef.markForCheck()`
   - Better performance than Zone.js-based change detection

3. **Simple Mental Model**
   - `signal()` for writable state
   - `computed()` for derived state
   - `effect()` for side effects
   - Automatic dependency tracking

4. **Less Boilerplate**
   - No actions, reducers, or selectors
   - Direct state updates with `.set()` and `.update()`
   - Cleaner than RxJS for simple state

5. **ADHD-Friendly Development**
   - Easier to understand and maintain
   - Less cognitive overhead
   - Faster to implement features

### Comparison with Alternatives

| Feature          | Signals      | NgRx      | RxJS Stores | Akita   |
| ---------------- | ------------ | --------- | ----------- | ------- |
| Learning Curve   | Low          | High      | Medium      | Medium  |
| Boilerplate      | Minimal      | Heavy     | Medium      | Medium  |
| Zoneless Support | Excellent    | Good      | Good        | Good    |
| Built-in         | Yes          | No        | Partial     | No      |
| Derived State    | `computed()` | Selectors | `map()`     | Queries |
| Bundle Size      | 0 KB         | ~50 KB    | 0 KB        | ~30 KB  |

## Implementation Pattern

### Service-Based State

```typescript
@Injectable({ providedIn: 'root' })
export class TaskStateService {
  // Private writable signals
  private tasksSignal = signal<Task[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly tasks = this.tasksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signals (derived state)
  readonly backlogTasks = computed(() =>
    this.tasksSignal().filter((t) => t.status === 'backlog'),
  );

  readonly todayTasks = computed(() =>
    this.tasksSignal().filter((t) => t.status === 'today'),
  );

  readonly inProgressTasks = computed(() =>
    this.tasksSignal().filter((t) => t.status === 'in_progress'),
  );

  readonly doneTasks = computed(() =>
    this.tasksSignal().filter((t) => t.status === 'done'),
  );

  readonly taskCount = computed(() => this.tasksSignal().length);

  // Methods to update state
  setTasks(tasks: Task[]) {
    this.tasksSignal.set(tasks);
  }

  addTask(task: Task) {
    this.tasksSignal.update((tasks) => [...tasks, task]);
  }

  updateTask(id: number, updates: Partial<Task>) {
    this.tasksSignal.update((tasks) =>
      tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }

  deleteTask(id: number) {
    this.tasksSignal.update((tasks) => tasks.filter((t) => t.id !== id));
  }

  setLoading(loading: boolean) {
    this.loadingSignal.set(loading);
  }

  setError(error: string | null) {
    this.errorSignal.set(error);
  }
}
```

### Component Usage

```typescript
@Component({
  selector: 'app-kanban-board',
  standalone: true,
  template: `
    <div class="kanban-board">
      @if (taskState.loading()) {
        <app-loader />
      }

      @if (taskState.error()) {
        <app-error [message]="taskState.error()" />
      }

      <div class="kanban-columns">
        <app-kanban-column
          title="Today"
          [tasks]="taskState.todayTasks()"
          (taskMoved)="onTaskMoved($event)"
        />

        <app-kanban-column
          title="In Progress"
          [tasks]="taskState.inProgressTasks()"
          (taskMoved)="onTaskMoved($event)"
        />

        <app-kanban-column
          title="Done"
          [tasks]="taskState.doneTasks()"
          (taskMoved)="onTaskMoved($event)"
        />
      </div>

      <div class="task-count">Total tasks: {{ taskState.taskCount() }}</div>
    </div>
  `,
})
export class KanbanBoardComponent {
  protected taskState = inject(TaskStateService);

  onTaskMoved(event: TaskMovedEvent) {
    this.taskState.updateTask(event.taskId, { status: event.newStatus });
  }
}
```

## When to Use RxJS

Signals replace most RxJS usage, but we'll still use RxJS for:

1. **HTTP Requests** - Angular HttpClient returns Observables

   ```typescript
   loadTasks() {
     this.setLoading(true);
     this.http.get<Task[]>('/api/tasks')
       .pipe(
         finalize(() => this.setLoading(false))
       )
       .subscribe({
         next: tasks => this.setTasks(tasks),
         error: err => this.setError(err.message)
       });
   }
   ```

2. **Event Streams** - User input, WebSocket messages

   ```typescript
   searchTerm$ = new Subject<string>();

   constructor() {
     this.searchTerm$.pipe(
       debounceTime(300),
       distinctUntilChanged()
     ).subscribe(term => {
       // Perform search and update signal
       this.filterTasks(term);
     });
   }
   ```

3. **Time-Based Operations** - Timers, intervals
   ```typescript
   timer(0, 60000).subscribe(() => {
     this.refreshData();
   });
   ```

## Consequences

### Positive

- ✅ Minimal learning curve for new developers
- ✅ Less boilerplate code
- ✅ Better performance with zoneless mode
- ✅ Native Angular integration
- ✅ Easier to test (no complex store setup)
- ✅ Smaller bundle size

### Negative

- ⚠️ Less suited for complex state management (fine for v0.1-v1.0)
- ⚠️ No built-in dev tools (unlike NgRx DevTools)
- ⚠️ Still experimental (may have breaking changes)
- ⚠️ Less guidance/patterns compared to mature libraries

### Migration Path

If complexity grows in v2.0+:

- Can introduce NgRx for specific features (e.g., offline sync)
- Signals can coexist with NgRx
- Migration is gradual, not all-or-nothing

## Alternatives Considered

### NgRx

**Pros:** Battle-tested, dev tools, time-travel debugging, predictable
**Cons:** Heavy boilerplate, steep learning curve, overkill for v0.1
**Verdict:** Too complex for initial versions

### Akita

**Pros:** Simpler than NgRx, good dev tools, active queries
**Cons:** Third-party dependency, learning curve, not zoneless-optimized
**Verdict:** Not necessary when Signals exist

### RxJS BehaviorSubject Stores

**Pros:** Familiar, flexible, reactive
**Cons:** Manual change detection, more boilerplate than Signals
**Verdict:** Signals are better for this use case

### No State Management

**Pros:** Simplest possible
**Cons:** Component state gets messy, prop drilling, hard to maintain
**Verdict:** Need at least minimal state management

## References

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Zoneless Change Detection](https://angular.dev/guide/experimental/zoneless)
- [Signals vs NgRx Discussion](https://github.com/ngrx/platform/discussions/3796)

## Review Schedule

- **v0.3:** Re-evaluate if complexity requires more structure
- **v1.0:** Assess if dev tools are needed
- **v2.0:** Consider NgRx if multi-user/sync features require it

---

**Decision Owner:** George
**Reviewed By:** N/A (solo project)
**Next Review:** v0.3 (after subtasks feature)
