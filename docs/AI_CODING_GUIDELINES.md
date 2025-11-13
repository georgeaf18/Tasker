# AI-Assisted Development Guidelines

## Purpose

This document provides guidelines for using AI assistance (Claude Code, GitHub Copilot, etc.) in this project. It ensures consistent code quality, maintains architectural integrity, and leverages AI effectively while catching common pitfalls.

## Table of Contents

1. [Prompt Templates for Features](#prompt-templates-for-features)
2. [Code Review Checklist](#code-review-checklist-for-ai-generated-code)
3. [Common AI Pitfalls](#common-ai-pitfalls-to-watch-for)
4. [AI Code Tagging](#tagging-ai-generated-code)
5. [Testing AI-Generated Code](#testing-ai-generated-code)

---

## Prompt Templates for Features

When asking AI to implement features, always provide comprehensive context to get better results.

### Template for New Features

```markdown
**Context:** [What problem this solves, reference ADR if applicable]

**Requirements:**

- [List specific functional requirements]
- Must follow existing patterns: [link to example files]
- ADHD-friendly constraints:
  - Maximum 3 levels of nesting
  - Functions under 50 lines
  - Cyclomatic complexity < 10
- Dyslexia-friendly:
  - Clear, descriptive variable names (no abbreviations)
  - Consistent naming conventions

**Architecture:**

- Follow [reference ADR or pattern]
- Use [state management approach - e.g., Angular signals]
- Integration points: [list services/components that interact with this feature]

**Testing Requirements:**

- Unit tests with >75% coverage (>85% for backend business logic)
- Include edge cases:
  - Null/undefined values
  - Empty arrays/objects
  - Error conditions
  - Loading states
- Snapshot tests for UI components
- Integration tests for service interactions

**Accessibility:**

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatible
- Focus indicators visible
- Color contrast ratios meet standards

**Example Prompt:**

Create a task card component following ADR-001 (signals-based state management).

Requirements:

- Display task title, status, due date, and priority indicator
- Support drag-and-drop with accessible keyboard alternative
- Show max 3 nested subtasks
- WCAG AA compliant colors (verify contrast ratios)
- Loading and error states

Architecture:

- Standalone Angular component
- Use computed signals for derived state
- Emit events for user actions (no direct state mutation)
- Follow the pattern in `frontend/src/app/components/example-card`

Testing:

- Unit tests with snapshots for all states (default, loading, error, empty)
- Test keyboard navigation (Tab, Enter, Escape)
- Test drag-and-drop

Context: This is for ADHD users who need visual clarity without cognitive overload.
```

### Template for Bug Fixes

```markdown
**Bug Description:** [What's broken]

**Expected Behavior:** [What should happen]

**Current Behavior:** [What actually happens]

**Steps to Reproduce:**

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Error Messages/Logs:** [If applicable]

**Affected Files:** [List relevant files]

**Root Cause Analysis:** [If known]

**Fix Requirements:**

- Maintain backward compatibility
- Add regression tests
- Update relevant documentation

**Test Plan:**

- [ ] Verify bug is fixed
- [ ] Verify no regressions in related functionality
- [ ] Test edge cases that might have similar issues
```

### Template for Refactoring

```markdown
**Current State:** [What exists now]

**Target State:** [What we want to achieve]

**Motivation:** [Why we're refactoring - performance, maintainability, etc.]

**Constraints:**

- No breaking changes to public APIs
- Maintain existing test coverage
- Incremental changes (can be done in steps)

**Verification:**

- All existing tests still pass
- No performance regressions
- Code complexity metrics improve (use ESLint reports)
```

---

## Code Review Checklist for AI-Generated Code

Before committing AI-generated code, verify:

### Architecture & Patterns

- [ ] Follows project architecture (check relevant ADRs in `docs/ADRs/`)
- [ ] Uses appropriate design patterns for this project
- [ ] No circular dependencies (run `npm run deps:check`)
- [ ] Proper separation of concerns (components, services, utilities)
- [ ] No tight coupling between modules

### TypeScript & Type Safety

- [ ] No `any` types (unless explicitly justified with comment)
- [ ] Proper use of interfaces/types for contracts
- [ ] Type guards for runtime type checking
- [ ] Null safety (`strictNullChecks` compliance)
- [ ] Proper use of `unknown` over `any` for truly unknown types

### Code Quality

- [ ] Functions under 50 lines (ESLint rule enforced)
- [ ] Cyclomatic complexity < 10 (ESLint rule enforced)
- [ ] Maximum nesting depth of 3 (ESLint rule enforced)
- [ ] Clear, descriptive variable names (no abbreviations like `usr`, `btn`, `tmp`)
- [ ] No console.log statements (use proper logging: console.warn/error)
- [ ] No TODO/FIXME comments (create Linear tasks: TASK-xxx)
- [ ] Consistent code style (Prettier auto-formats)

### Error Handling

- [ ] Async functions have proper error handling (try/catch or .catch())
- [ ] User-facing error messages are clear and actionable
- [ ] Errors are logged appropriately (no sensitive data in logs)
- [ ] Error states are handled in UI (loading, error, empty states)

### Testing

- [ ] Unit tests added for all new functions/methods
- [ ] Test coverage meets thresholds (75% global, 85% backend business logic)
- [ ] Edge cases tested (null, undefined, empty, error conditions)
- [ ] Snapshot tests for UI components
- [ ] Tests are readable and maintainable (clear test names, AAA pattern)
- [ ] No disabled or skipped tests without good reason

### Performance

- [ ] No unnecessary re-renders (Angular: use computed signals, OnPush)
- [ ] Proper use of memoization where appropriate
- [ ] No N+1 query problems (backend)
- [ ] Efficient algorithms (avoid O(n²) when O(n log n) is possible)
- [ ] No memory leaks (subscriptions cleaned up, event listeners removed)

### Security

- [ ] No hardcoded secrets or API keys
- [ ] Proper input validation and sanitization
- [ ] No SQL injection vulnerabilities (use parameterized queries)
- [ ] No XSS vulnerabilities (proper escaping in templates)
- [ ] Sensitive data not logged or exposed in error messages

### Accessibility (for UI changes)

- [ ] Keyboard navigation works (Tab, Enter, Escape, Arrow keys)
- [ ] Screen reader compatible (proper ARIA labels)
- [ ] Focus indicators visible and clear
- [ ] Color contrast meets WCAG 2.1 Level AA (4.5:1 for normal text)
- [ ] No reliance on color alone to convey information

### ADHD/Dyslexia Design Principles (for UI changes)

- [ ] Visual hierarchy is clear and uncluttered
- [ ] Maximum 3 levels of nested information visible at once
- [ ] Important actions are visually prominent
- [ ] Labels are clear and descriptive (not abbreviated)
- [ ] Appropriate use of whitespace (not cramped)
- [ ] Consistent patterns throughout UI

### Documentation

- [ ] JSDoc comments for exported functions/classes
- [ ] Complex logic has explanatory comments
- [ ] README updated if public API changed
- [ ] ADR created if new architectural pattern introduced

---

## Common AI Pitfalls to Watch For

### 1. Over-Engineering

**Problem:** AI loves to create abstractions and design patterns even when simple solutions would work.

**Example of Over-Engineering:**

```typescript
// ❌ AI-generated over-engineering
abstract class BaseTaskHandler<T extends Task> {
  abstract process(task: T): Observable<ProcessedTask<T>>;
}

class SimpleTaskHandler extends BaseTaskHandler<SimpleTask> {
  process(task: SimpleTask): Observable<ProcessedTask<SimpleTask>> {
    return of({ ...task, processed: true });
  }
}
```

**Better approach:**

```typescript
// ✅ Keep it simple
function processTask(task: Task): Task {
  return { ...task, processed: true };
}
```

**Guideline:** Follow KISS principle. Only introduce abstractions when you have 3+ concrete use cases.

### 2. Missing Edge Cases

**Problem:** AI often generates "happy path" code without considering error conditions.

**What AI Might Miss:**

- Null/undefined values
- Empty arrays or objects
- Network errors
- Race conditions
- Boundary values (0, -1, MAX_INT)

**Solution:** Always add tests for edge cases after reviewing AI code:

```typescript
describe('calculateTotal', () => {
  it('should calculate total for valid items', () => {
    expect(calculateTotal([{ price: 10 }, { price: 20 }])).toBe(30);
  });

  // Edge cases AI often misses:
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should handle undefined gracefully', () => {
    expect(calculateTotal(undefined)).toBe(0);
  });

  it('should skip items with null prices', () => {
    expect(calculateTotal([{ price: 10 }, { price: null }])).toBe(10);
  });
});
```

### 3. Forgetting Cleanup

**Problem:** AI generates subscriptions, timers, and event listeners but forgets to clean them up.

**Example:**

```typescript
// ❌ Memory leak
export class TaskListComponent {
  ngOnInit() {
    this.taskService.getTasks().subscribe((tasks) => {
      this.tasks = tasks;
    });
    // Subscription never cleaned up!
  }
}
```

**Fix:**

```typescript
// ✅ Proper cleanup
export class TaskListComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.taskService
      .getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe((tasks) => {
        this.tasks = tasks;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 4. Accessibility Oversights

**Problem:** AI often generates functional code that looks good but isn't keyboard-accessible or screen-reader-friendly.

**What AI Forgets:**

- ARIA labels
- Keyboard navigation (Tab, Enter, Escape)
- Focus management
- Screen reader announcements

**Always Add:**

```html
<!-- ❌ AI-generated (missing accessibility) -->
<div class="button" (click)="doSomething()">Click me</div>

<!-- ✅ Accessible version -->
<button
  type="button"
  (click)="doSomething()"
  [attr.aria-label]="'Perform action'"
  [attr.aria-pressed]="isActive"
>
  Click me
</button>
```

### 5. Performance Issues

**Problem:** AI doesn't optimize by default and may generate code with performance issues.

**Common Issues:**

- Unnecessary component re-renders
- N+1 queries
- Inefficient algorithms (O(n²) when O(n) is possible)
- Large data structures in tight loops

**Example:**

```typescript
// ❌ O(n²) - AI might generate this
function findDuplicates(arr: number[]): number[] {
  return arr.filter((item, index) => arr.indexOf(item) !== index);
}

// ✅ O(n) - optimize after review
function findDuplicates(arr: number[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();

  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }

  return Array.from(duplicates);
}
```

### 6. Security Vulnerabilities

**Problem:** AI may expose sensitive data or create injection vulnerabilities.

**Watch For:**

- Secrets in logs or error messages
- SQL injection (use parameterized queries)
- XSS vulnerabilities (sanitize user input)
- Unvalidated user input

---

## Tagging AI-Generated Code

Use JSDoc tags to mark AI-generated code for future reference:

```typescript
/**
 * Calculates task priority based on due date and importance
 *
 * @param task - The task to calculate priority for
 * @returns Priority value between 1-5
 *
 * @ai-generated Claude Code (2025-11-12)
 * @ai-reviewed Verified edge cases, added null checks, tested with various due dates
 */
export function calculatePriority(task: Task): number {
  if (!task || !task.dueDate) {
    return 3; // Default priority
  }

  const daysUntilDue = differenceInDays(task.dueDate, new Date());
  const importance = task.importance ?? 'medium';

  // Priority calculation logic...
  return priority;
}
```

**When to Tag:**

- Functions that required significant AI assistance
- Complex algorithms generated by AI
- Code that needed substantial modifications after AI generation

**Don't Tag:**

- Boilerplate code (constructors, simple getters)
- Trivial functions (< 5 lines)
- Code that's been heavily modified from AI output

---

## Testing AI-Generated Code

### Automated Validation

The pre-commit hook (`scripts/validate-ai-code.sh`) automatically checks for:

- ✅ console.log statements
- ✅ TODO/FIXME comments
- ✅ Usage of `any` types
- ✅ Missing test files

### Manual Verification Steps

1. **Read the code line-by-line** - Don't assume AI code is correct
2. **Test edge cases** - Add tests for null, undefined, empty, error conditions
3. **Check dependencies** - Run `npm run deps:check` to verify no circular dependencies
4. **Run linting** - `npm run lint` should pass with no warnings
5. **Check coverage** - `npm run test:coverage` should meet thresholds
6. **Performance check** - Profile if dealing with large datasets or frequent operations
7. **Security review** - Look for exposed secrets, injection vulnerabilities, unvalidated input
8. **Accessibility check** - Test keyboard navigation and screen reader compatibility (for UI)

### Test Command Checklist

Before committing AI-generated code:

```bash
# Format and lint
npm run format
npm run lint

# Type check
npm run type-check

# Run tests with coverage
npm run test:coverage

# Check dependencies
npm run deps:check

# Run critical e2e tests
npm run e2e:critical

# Full validation
npm run validate
```

---

## Examples of Good AI Prompts

### Example 1: Component Creation

```markdown
Create a TaskCardComponent following these specs:

**Architecture:**

- Standalone Angular component (per ADR-001)
- Use signals for state management
- Follow the pattern in `frontend/src/app/components/status-badge/status-badge.component.ts`

**Props:**

- task: Task (required)
- onEdit: EventEmitter<Task>
- onDelete: EventEmitter<string>
- onStatusChange: EventEmitter<{ id: string; status: TaskStatus }>

**Display:**

- Task title (h3, truncate after 50 chars with ellipsis)
- Status badge using StatusBadgeComponent
- Due date in relative format ("2 days ago", "in 3 hours")
- Priority indicator (colored dot: red=urgent, yellow=high, green=normal, gray=low)
- Max 3 subtasks shown with "...and 5 more" if > 3

**Interactions:**

- Click card to emit onEdit
- Delete button (trash icon) with confirmation
- Status dropdown to change status
- Keyboard: Enter to edit, Delete key for delete (with confirmation)

**Accessibility:**

- ARIA label with full task info
- Proper button roles
- Focus visible
- Status changes announced to screen readers

**Styles:**

- Use Tailwind classes
- Follow spacing system from design tokens
- ADHD-friendly: clear visual hierarchy, not cluttered

**Tests:**

- Snapshot tests for all states (default, overdue, completed)
- Test all event emissions
- Test keyboard interactions
- Test accessibility attributes
```

### Example 2: Service Creation

````markdown
Create a TaskService for backend task management:

**Architecture:**

- NestJS injectable service
- Use repository pattern (inject TaskRepository)
- Follow error handling pattern in `backend/src/common/error-handler.ts`

**Methods:**

```typescript
findAll(userId: string): Promise<Task[]>
findById(id: string, userId: string): Promise<Task>
create(dto: CreateTaskDto, userId: string): Promise<Task>
update(id: string, dto: UpdateTaskDto, userId: string): Promise<Task>
delete(id: string, userId: string): Promise<void>
```
````

**Error Handling:**

- Throw NotFoundException if task not found
- Throw ForbiddenException if user doesn't own task
- Throw BadRequestException for validation errors
- Log all errors with context

**Validation:**

- CreateTaskDto: title required (max 200 chars), dueDate optional but must be future
- UpdateTaskDto: all fields optional, same validation as create
- Verify user ownership on all operations

**Tests:**

- Unit tests with mocked repository
- Test all error conditions
- Test validation rules
- > 85% coverage (backend business logic threshold)

**Performance:**

- Use database transactions for multi-step operations
- Optimize queries (select only needed fields)
- Add appropriate database indexes

```

---

## Additional Resources

- [Project ADRs](./ADRs/) - Architectural decisions
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Angular Best Practices](https://angular.dev/best-practices)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ADHD-Friendly Design Principles](./DESIGN_SYSTEM.md#adhd-considerations)

---

## Questions or Issues?

If you encounter issues with AI-generated code or have questions about these guidelines:

1. Check the [ADRs](./ADRs/) for architectural decisions
2. Review similar implementations in the codebase
3. Create a Linear task (TASK-xxx) to discuss with the team
4. Update this document with learnings from the experience
```
