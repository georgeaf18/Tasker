# Data TestID Requirements for E2E Tests

This document lists all `data-testid` attributes that need to be added to Angular components to support the E2E test suite.

## Overview

Data test IDs provide stable, semantic selectors for E2E tests that are independent of implementation details like CSS classes or DOM structure. This makes tests more maintainable and less brittle.

## Naming Convention

- Use kebab-case: `data-testid="add-task-button"`
- Be descriptive and specific
- Include component context when needed
- Use dynamic IDs for list items: `data-testid="task-card-${task.id}"`

---

## Backlog Sidebar Component

**File:** `frontend/src/app/components/backlog-sidebar/backlog-sidebar.component.html`

### Required TestIDs

| Element             | TestID                           | Description                                        |
| ------------------- | -------------------------------- | -------------------------------------------------- |
| Add Task Button     | `add-task-button`                | The "+" button to create a new task                |
| Task Card (Backlog) | `task-card-${task.id}`           | Individual task cards in backlog (dynamic ID)      |
| Task Card Title     | `task-card-title`                | Title text within a task card                      |
| Workspace Section   | `workspace-section-${workspace}` | Container for each workspace group (work/personal) |
| Channel Section     | `channel-section-${channelId}`   | Container for each channel group                   |

### Example Implementation

```html
<!-- Add Task Button -->
<button
  (click)="showCreateTaskDialog()"
  data-testid="add-task-button"
  class="p-button"
>
  <i class="pi pi-plus"></i>
</button>

<!-- Task Card -->
<div
  *ngFor="let task of tasks"
  [attr.data-testid]="'task-card-' + task.id"
  (click)="showTaskDetails(task)"
>
  <h3 [attr.data-testid]="'task-card-title'">{{ task.title }}</h3>
</div>

<!-- Workspace Section -->
<div
  *ngFor="let group of groupedByWorkspace()"
  [attr.data-testid]="'workspace-section-' + group.workspace.toLowerCase()"
>
  <!-- Content -->
</div>
```

---

## Kanban Board Component

**File:** `frontend/src/app/components/kanban-board/kanban-board.component.html`

### Required TestIDs

| Element            | TestID                      | Description                             |
| ------------------ | --------------------------- | --------------------------------------- |
| Today Column       | `kanban-column-today`       | The "Today" status column               |
| In Progress Column | `kanban-column-in-progress` | The "In Progress" status column         |
| Done Column        | `kanban-column-done`        | The "Done" status column                |
| Task Card          | `task-card-${task.id}`      | Individual task cards (same as backlog) |
| Daily Progress Bar | `daily-progress-bar`        | Progress bar showing daily completion   |

### Example Implementation

```html
<!-- Kanban Columns -->
<div class="kanban-columns">
  <!-- Today Column -->
  <div class="kanban-column" data-testid="kanban-column-today">
    <h2>Today</h2>
    <div *ngFor="let task of todayTasks()">
      <div
        [attr.data-testid]="'task-card-' + task.id"
        (click)="openTaskDetails(task)"
      >
        {{ task.title }}
      </div>
    </div>
  </div>

  <!-- In Progress Column -->
  <div class="kanban-column" data-testid="kanban-column-in-progress">
    <h2>In Progress</h2>
    <div *ngFor="let task of inProgressTasks()">
      <div [attr.data-testid]="'task-card-' + task.id">{{ task.title }}</div>
    </div>
  </div>

  <!-- Done Column -->
  <div class="kanban-column" data-testid="kanban-column-done">
    <h2>Done</h2>
    <div *ngFor="let task of doneTasks()">
      <div [attr.data-testid]="'task-card-' + task.id">{{ task.title }}</div>
    </div>
  </div>
</div>

<!-- Daily Progress Bar -->
<p-progressBar
  [value]="dailyProgress()"
  data-testid="daily-progress-bar"
  [attr.aria-valuenow]="dailyProgress()"
>
</p-progressBar>
```

---

## Task Dialog Component (Create/Edit)

**File:** `frontend/src/app/components/backlog-sidebar/backlog-sidebar.component.html` (Dialog sections)

### Required TestIDs

| Element           | TestID                   | Description                    |
| ----------------- | ------------------------ | ------------------------------ |
| Dialog Container  | `task-dialog`            | Main dialog element            |
| Title Input       | `task-title-input`       | Task title input field         |
| Description Input | `task-description-input` | Task description textarea      |
| Workspace Select  | `task-workspace-select`  | Workspace dropdown             |
| Channel Select    | `task-channel-select`    | Channel dropdown               |
| Submit Button     | `task-submit-button`     | Save/Create button             |
| Cancel Button     | `task-cancel-button`     | Cancel button                  |
| Delete Button     | `task-delete-button`     | Delete button (edit mode only) |

### Example Implementation

```html
<!-- Task Creation Dialog -->
<p-dialog
  [(visible)]="createTaskDialogVisible()"
  [modal]="true"
  data-testid="task-dialog"
>
  <form [formGroup]="createTaskForm" (ngSubmit)="submitCreateTask()">
    <!-- Title Input -->
    <label for="title">Title *</label>
    <input
      pInputText
      id="title"
      formControlName="title"
      data-testid="task-title-input"
      placeholder="Enter task title"
    />

    <!-- Description Input -->
    <label for="description">Description</label>
    <textarea
      pTextarea
      id="description"
      formControlName="description"
      data-testid="task-description-input"
      rows="4"
    >
    </textarea>

    <!-- Workspace Select -->
    <label for="workspace">Workspace *</label>
    <p-select
      id="workspace"
      formControlName="workspace"
      data-testid="task-workspace-select"
      [options]="workspaceOptions"
    >
    </p-select>

    <!-- Channel Select -->
    <label for="channel">Channel</label>
    <p-select
      id="channel"
      formControlName="channelId"
      data-testid="task-channel-select"
      [options]="filteredChannels()"
    >
    </p-select>

    <!-- Action Buttons -->
    <div class="dialog-footer">
      <button
        type="button"
        pButton
        label="Cancel"
        data-testid="task-cancel-button"
        (click)="hideCreateTaskDialog()"
      ></button>

      <button
        type="submit"
        pButton
        label="Create Task"
        data-testid="task-submit-button"
      ></button>
    </div>
  </form>
</p-dialog>

<!-- Task Edit Dialog (similar structure with delete button) -->
<p-dialog
  [(visible)]="taskDetailsDialogVisible()"
  [modal]="true"
  data-testid="task-dialog"
>
  <form [formGroup]="editTaskForm">
    <!-- Same form fields as above -->

    <div class="dialog-footer">
      <!-- Delete Button (edit mode) -->
      <button
        type="button"
        pButton
        label="Delete"
        severity="danger"
        data-testid="task-delete-button"
        (click)="confirmDeleteTask()"
      ></button>

      <button
        type="button"
        pButton
        label="Cancel"
        data-testid="task-cancel-button"
        (click)="hideTaskDetailsDialog()"
      ></button>

      <button
        type="button"
        pButton
        label="Save Changes"
        data-testid="task-submit-button"
        (click)="submitEditTask()"
      ></button>
    </div>
  </form>
</p-dialog>
```

---

## Task Detail Dialog (Status Change Buttons)

**File:** `frontend/src/app/components/kanban-board/kanban-board.component.html`

### Required TestIDs

| Element                    | TestID                       | Description                            |
| -------------------------- | ---------------------------- | -------------------------------------- |
| Move to Today Button       | `move-to-today-button`       | Button to change status to TODAY       |
| Move to In Progress Button | `move-to-in-progress-button` | Button to change status to IN_PROGRESS |
| Move to Done Button        | `move-to-done-button`        | Button to change status to DONE        |

### Example Implementation

```html
<p-dialog [(visible)]="showTaskDialog()">
  <div *ngIf="selectedTask()">
    <h2>{{ selectedTask()?.title }}</h2>
    <p>{{ selectedTask()?.description }}</p>

    <!-- Status Change Buttons -->
    <div class="status-actions">
      <button
        pButton
        label="Move to Today"
        data-testid="move-to-today-button"
        (click)="moveToStatus(selectedTask()!.id, TaskStatus.TODAY)"
      ></button>

      <button
        pButton
        label="Move to In Progress"
        data-testid="move-to-in-progress-button"
        (click)="moveToStatus(selectedTask()!.id, TaskStatus.IN_PROGRESS)"
      ></button>

      <button
        pButton
        label="Move to Done"
        data-testid="move-to-done-button"
        (click)="moveToStatus(selectedTask()!.id, TaskStatus.DONE)"
      ></button>
    </div>

    <!-- Delete Button -->
    <button
      pButton
      label="Delete"
      severity="danger"
      data-testid="task-delete-button"
      (click)="deleteTask(selectedTask()!.id)"
    ></button>
  </div>
</p-dialog>
```

---

## Confirmation Dialog (Delete Confirmation)

**File:** `frontend/src/app/components/backlog-sidebar/backlog-sidebar.component.html`

### Required TestIDs

| Element               | TestID                  | Description                |
| --------------------- | ----------------------- | -------------------------- |
| Confirm Delete Button | `confirm-delete-button` | Button to confirm deletion |
| Cancel Delete Button  | `cancel-delete-button`  | Button to cancel deletion  |

### Example Implementation

```html
<!-- PrimeNG Confirmation Dialog -->
<p-confirmDialog>
  <ng-template pTemplate="footer">
    <button
      type="button"
      pButton
      label="No"
      data-testid="cancel-delete-button"
      (click)="confirmationService.close()"
    ></button>

    <button
      type="button"
      pButton
      label="Yes"
      severity="danger"
      data-testid="confirm-delete-button"
      (click)="confirmationService.accept()"
    ></button>
  </ng-template>
</p-confirmDialog>
```

---

## Workspace Filter Controls

**File:** `frontend/src/app/app.component.html` (or wherever workspace filters are located)

### Required TestIDs

| Element         | TestID                      | Description                          |
| --------------- | --------------------------- | ------------------------------------ |
| Work Toggle     | `workspace-toggle-work`     | Toggle button for Work workspace     |
| Personal Toggle | `workspace-toggle-personal` | Toggle button for Personal workspace |

### Example Implementation

```html
<div class="workspace-filters">
  <button
    pButton
    label="Work"
    [outlined]="!isWorkFilterActive()"
    data-testid="workspace-toggle-work"
    [attr.aria-pressed]="isWorkFilterActive()"
    (click)="toggleWorkspaceFilter('WORK')"
  ></button>

  <button
    pButton
    label="Personal"
    [outlined]="!isPersonalFilterActive()"
    data-testid="workspace-toggle-personal"
    [attr.aria-pressed]="isPersonalFilterActive()"
    (click)="toggleWorkspaceFilter('PERSONAL')"
  ></button>
</div>
```

---

## Implementation Checklist

### Backlog Sidebar Component

- [ ] Add `data-testid="add-task-button"` to add button
- [ ] Add `[attr.data-testid]="'task-card-' + task.id"` to task cards
- [ ] Add `data-testid="task-card-title"` to task titles
- [ ] Add workspace section test IDs

### Kanban Board Component

- [ ] Add `data-testid="kanban-column-today"` to Today column
- [ ] Add `data-testid="kanban-column-in-progress"` to In Progress column
- [ ] Add `data-testid="kanban-column-done"` to Done column
- [ ] Add `[attr.data-testid]="'task-card-' + task.id"` to task cards
- [ ] Add `data-testid="daily-progress-bar"` to progress bar
- [ ] Add `[attr.aria-valuenow]` to progress bar

### Task Dialog

- [ ] Add `data-testid="task-title-input"` to title input
- [ ] Add `data-testid="task-description-input"` to description textarea
- [ ] Add `data-testid="task-workspace-select"` to workspace dropdown
- [ ] Add `data-testid="task-channel-select"` to channel dropdown
- [ ] Add `data-testid="task-submit-button"` to submit button
- [ ] Add `data-testid="task-cancel-button"` to cancel button
- [ ] Add `data-testid="task-delete-button"` to delete button

### Task Detail Dialog (Kanban)

- [ ] Add `data-testid="move-to-today-button"` to move button
- [ ] Add `data-testid="move-to-in-progress-button"` to move button
- [ ] Add `data-testid="move-to-done-button"` to move button
- [ ] Add `data-testid="task-delete-button"` to delete button

### Confirmation Dialog

- [ ] Add `data-testid="confirm-delete-button"` to confirm button
- [ ] Add `data-testid="cancel-delete-button"` to cancel button

### Workspace Filters

- [ ] Add `data-testid="workspace-toggle-work"` to Work toggle
- [ ] Add `data-testid="workspace-toggle-personal"` to Personal toggle
- [ ] Add `[attr.aria-pressed]` to toggle buttons for state tracking

---

## Accessibility Notes

In addition to `data-testid`, consider adding proper ARIA attributes for accessibility:

- **Buttons:** `aria-label`, `aria-pressed` (for toggles)
- **Form inputs:** `aria-required`, `aria-invalid`, `aria-describedby`
- **Dialogs:** `role="dialog"`, `aria-labelledby`, `aria-modal`
- **Progress bars:** `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **Lists:** `role="list"`, `role="listitem"`

These ARIA attributes can also be used as fallback selectors in E2E tests.

---

## Testing the Implementation

After adding test IDs, verify they work:

1. **Run a single test:**

   ```bash
   npx playwright test task-creation.spec.ts
   ```

2. **Run all tests:**

   ```bash
   npx playwright test
   ```

3. **Debug mode (with browser):**

   ```bash
   npx playwright test --debug
   ```

4. **Check selectors in browser:**
   ```javascript
   // In Playwright Inspector
   await page.getByTestId('add-task-button').click();
   ```

---

## Common Issues

### Dynamic IDs Not Working

```html
<!-- ❌ Wrong: String concatenation in template -->
<div data-testid="task-card-{{ task.id }}">
  <!-- ✅ Correct: Use attribute binding -->
  <div [attr.data-testid]="'task-card-' + task.id"></div>
</div>
```

### PrimeNG Components

```html
<!-- PrimeNG components may need wrapper divs -->
<div data-testid="task-workspace-select">
  <p-select formControlName="workspace" [options]="workspaceOptions">
  </p-select>
</div>

<!-- Or use PrimeNG's styleClass -->
<p-select
  formControlName="workspace"
  [options]="workspaceOptions"
  [attr.data-testid]="'task-workspace-select'"
>
</p-select>
```

### Conditional TestIDs

```html
<!-- For elements that appear conditionally -->
<button *ngIf="isEditMode()" data-testid="task-delete-button">Delete</button>
```

---

## Next Steps

1. **Implement TestIDs:** Add all required `data-testid` attributes to components
2. **Verify Selectors:** Run Playwright Inspector to verify selectors work
3. **Run Tests:** Execute E2E test suite to validate implementation
4. **Fix Failures:** Update selectors or component templates as needed
5. **Document Changes:** Update component documentation with test IDs
