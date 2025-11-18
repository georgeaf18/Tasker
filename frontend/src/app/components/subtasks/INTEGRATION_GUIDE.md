# Subtask Components Integration Guide

## Overview

This directory contains three Angular standalone components for displaying and managing subtasks within task cards:

1. **SubtaskListComponent** - Main container showing collapsible subtask list
2. **SubtaskItemComponent** - Individual subtask display with status and actions
3. **SubtaskFormDialogComponent** - Modal dialog for creating/editing subtasks

All components follow Angular 20 best practices:
- Standalone components (no NgModule required)
- Signal-based state management
- Zoneless-compatible
- PrimeNG UI components
- Tailwind CSS utilities (minimal custom CSS)
- Full accessibility (WCAG AA)
- Comprehensive unit tests (108 tests, 100% passing)

## Component Architecture

```
SubtaskListComponent
├── Shows collapsible list header with toggle
├── Displays progress badge (e.g., "3/5 complete")
├── Shows progress bar when expanded
├── Contains "+ Add subtask" button
└── Renders SubtaskItemComponent for each subtask
    ├── Status dropdown (To Do/Doing/Done)
    ├── Subtask title and description
    ├── Edit button (opens SubtaskFormDialogComponent)
    └── Delete button (shows confirmation)
```

## File Structure

```
frontend/src/app/components/subtasks/
├── subtask-list/
│   ├── subtask-list.component.ts
│   ├── subtask-list.component.html
│   ├── subtask-list.component.css
│   └── subtask-list.component.spec.ts (31 tests)
├── subtask-item/
│   ├── subtask-item.component.ts
│   ├── subtask-item.component.html
│   ├── subtask-item.component.css
│   └── subtask-item.component.spec.ts (41 tests)
├── subtask-form-dialog/
│   ├── subtask-form-dialog.component.ts
│   ├── subtask-form-dialog.component.html
│   ├── subtask-form-dialog.component.css
│   └── subtask-form-dialog.component.spec.ts (36 tests)
└── INTEGRATION_GUIDE.md (this file)
```

## Integration into Task Cards

### Option 1: Integrate into KanbanBoardComponent (Recommended)

Add SubtaskListComponent to the task card template in `kanban-board.component.html`:

```html
<!-- In the task card section, after task description -->
<div class="task-card">
    <!-- Existing task content: title, description, etc. -->

    <!-- Add subtask list here -->
    <app-subtask-list [taskId]="task.id"></app-subtask-list>
</div>
```

Import the component in `kanban-board.component.ts`:

```typescript
import { SubtaskListComponent } from '../subtasks/subtask-list/subtask-list.component';

@Component({
    selector: 'app-kanban-board',
    imports: [
        // ... existing imports
        SubtaskListComponent
    ],
    // ...
})
```

### Option 2: Create a Dedicated TaskCardComponent

If you want more modularity, create a new `TaskCardComponent`:

```typescript
// frontend/src/app/components/task-card/task-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubtaskListComponent } from '../subtasks/subtask-list/subtask-list.component';
import type { Task } from '../../models';

@Component({
    selector: 'app-task-card',
    imports: [CommonModule, SubtaskListComponent],
    template: `
        <div class="task-card">
            <!-- Task header, title, description, etc. -->
            <h3>{{ task.title }}</h3>
            <p>{{ task.description }}</p>

            <!-- Subtasks section -->
            <app-subtask-list [taskId]="task.id"></app-subtask-list>
        </div>
    `,
    styles: [`
        .task-card {
            padding: 1rem;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
    `]
})
export class TaskCardComponent {
    @Input({ required: true }) task!: Task;
}
```

Then use `<app-task-card [task]="task">` in your kanban board.

## Component API Reference

### SubtaskListComponent

**Inputs:**
- `taskId: number` (required) - Parent task ID

**Behavior:**
- Automatically loads subtasks on initialization
- Expands/collapses on toggle button click
- Shows progress badge and bar
- Opens dialog for add/edit operations

**Example:**
```html
<app-subtask-list [taskId]="123"></app-subtask-list>
```

### SubtaskItemComponent

**Inputs:**
- `subtask: Subtask` (required) - Subtask data to display
- `taskId: number` (required) - Parent task ID (for updates)

**Outputs:**
- `edit: EventEmitter<Subtask>` - Emitted when edit button clicked

**Example:**
```html
<app-subtask-item
    [subtask]="subtask"
    [taskId]="100"
    (edit)="onEditSubtask($event)">
</app-subtask-item>
```

### SubtaskFormDialogComponent

**Inputs:**
- `visible: boolean` - Dialog visibility state
- `taskId: number` (required) - Parent task ID
- `subtask: Subtask | null` - Subtask to edit (null for create mode)

**Outputs:**
- `visibleChange: EventEmitter<boolean>` - Emitted when dialog should close

**Example:**
```html
<app-subtask-form-dialog
    [visible]="dialogVisible"
    [taskId]="100"
    [subtask]="editingSubtask"
    (visibleChange)="dialogVisible = $event">
</app-subtask-form-dialog>
```

## State Management

All components integrate with `SubtaskStateService` which provides:

- **Reactive state** using Angular signals
- **Automatic loading** via `loadSubtasks(taskId)`
- **CRUD operations** (add, update, delete)
- **Status updates** with `updateSubtaskStatus(taskId, subtaskId, status)`
- **Error handling** with user-friendly notifications

Example service usage:
```typescript
import { SubtaskStateService } from '../../services/subtask-state.service';

export class MyComponent {
    private subtaskState = inject(SubtaskStateService);

    // Get reactive subtasks for a task
    subtasks = this.subtaskState.getSubtasksForTask(100);

    // Load subtasks
    ngOnInit() {
        this.subtaskState.loadSubtasks(100);
    }
}
```

## Styling & Theming

Components use Tailwind CSS utilities and support dark mode:

```css
/* Light mode */
bg-white text-gray-900

/* Dark mode */
dark:bg-gray-800 dark:text-gray-100
```

PrimeNG components automatically inherit theme from your app configuration.

## Accessibility Features

All components follow WCAG AA guidelines:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management in dialogs
- Screen reader announcements
- Color contrast compliance
- Semantic HTML structure

Example ARIA usage:
```html
<button
    [attr.aria-expanded]="isExpanded()"
    [attr.aria-label]="isExpanded() ? 'Collapse subtasks' : 'Expand subtasks'">
    Subtasks
</button>
```

## Testing

Run component tests:
```bash
# All subtask component tests
npx nx test frontend --testFile="subtask.*component.spec.ts"

# Individual component
npx nx test frontend --testFile="subtask-list.component.spec.ts"
npx nx test frontend --testFile="subtask-item.component.spec.ts"
npx nx test frontend --testFile="subtask-form-dialog.component.spec.ts"
```

Test coverage:
- **SubtaskListComponent**: 31 tests (initialization, signals, toggle, dialogs, progress)
- **SubtaskItemComponent**: 41 tests (status, edit, delete, confirmations, edge cases)
- **SubtaskFormDialogComponent**: 36 tests (create/edit modes, validation, submission)

## Common Integration Patterns

### Pattern 1: Embed in Existing Card

```html
<!-- In your existing task card template -->
<div class="p-card">
    <div class="task-header">
        <h3>{{ task.title }}</h3>
    </div>

    <div class="task-body">
        <p>{{ task.description }}</p>
    </div>

    <!-- Add subtasks here -->
    <div class="task-subtasks mt-4">
        <app-subtask-list [taskId]="task.id"></app-subtask-list>
    </div>
</div>
```

### Pattern 2: Conditional Display (Only Show if Subtasks Exist)

```html
<app-subtask-list
    [taskId]="task.id"
    *ngIf="hasSubtasks(task.id)">
</app-subtask-list>
```

```typescript
hasSubtasks(taskId: number): boolean {
    const subtasks = this.subtaskState.getSubtasksForTask(taskId)();
    return subtasks.length > 0;
}
```

### Pattern 3: Start Expanded for Tasks with Subtasks

You can modify `SubtaskListComponent.ngOnInit()`:

```typescript
ngOnInit(): void {
    this.subtaskState.loadSubtasks(this.taskId);

    // Auto-expand if subtasks exist
    effect(() => {
        if (this.subtasks().length > 0) {
            this.isExpanded.set(true);
        }
    });
}
```

## Troubleshooting

### Subtasks not loading
- Ensure `SubtaskStateService.loadSubtasks(taskId)` is called
- Check network tab for API errors
- Verify taskId is valid

### Dialog not closing
- Ensure you're binding to `(visibleChange)` output
- Check that `hideDialog()` is called in parent component

### Styling issues
- Verify PrimeNG theme is loaded in `angular.json`
- Check Tailwind is configured correctly
- Ensure dark mode classes are present

### TypeScript errors
- Run `npm install` to ensure all dependencies are present
- Verify `@angular/core`, `primeng`, and types are up to date

## Next Steps

After integration, consider:

1. **Drag & Drop**: Add reordering capability using `@angular/cdk/drag-drop`
2. **Bulk Operations**: Add "Complete all" or "Delete all" actions
3. **Filtering**: Show/hide completed subtasks
4. **Due Dates**: Add optional due dates to subtasks
5. **Assignees**: Add user assignment to subtasks
6. **Analytics**: Track subtask completion rates

## Support

For questions or issues:
- Check existing tests for usage examples
- Review `SubtaskStateService` and `SubtaskApiService` for backend integration
- Refer to PrimeNG documentation for component customization
- See CLAUDE.md for project-specific conventions

---

**Generated for TASK-58: Display subtasks as simple list in task cards**
