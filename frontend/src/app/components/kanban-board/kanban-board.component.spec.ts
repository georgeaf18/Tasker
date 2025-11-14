import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { KanbanBoardComponent } from './kanban-board.component';
import { TaskStateService } from '../../services/task-state.service';
import { Task, TaskStatus, Workspace } from '../../models/task.model';

describe('KanbanBoardComponent', () => {
  let component: KanbanBoardComponent;
  let fixture: ComponentFixture<KanbanBoardComponent>;
  let mockTaskStateService: Partial<TaskStateService>;
  let tasksSignal: ReturnType<typeof signal<Task[]>>;

  // Mock tasks for testing
  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Today Task 1',
      description: 'Description 1',
      workspace: Workspace.WORK,
      channelId: 1,
      status: TaskStatus.TODAY,
      dueDate: new Date('2025-11-13'),
      isRoutine: false,
      createdAt: new Date('2025-11-10'),
      updatedAt: new Date('2025-11-10'),
    },
    {
      id: 2,
      title: 'In Progress Task',
      description: 'Description 2',
      workspace: Workspace.PERSONAL,
      channelId: 2,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date('2025-11-14'),
      isRoutine: true,
      createdAt: new Date('2025-11-09'),
      updatedAt: new Date('2025-11-12'),
    },
    {
      id: 3,
      title: 'Done Task',
      description: null,
      workspace: Workspace.WORK,
      channelId: null,
      status: TaskStatus.DONE,
      dueDate: null,
      isRoutine: false,
      createdAt: new Date('2025-11-08'),
      updatedAt: new Date('2025-11-13'),
    },
    {
      id: 4,
      title: 'Today Task 2',
      description: 'Another today task',
      workspace: Workspace.PERSONAL,
      channelId: 1,
      status: TaskStatus.TODAY,
      dueDate: new Date('2025-11-13'),
      isRoutine: false,
      createdAt: new Date('2025-11-11'),
      updatedAt: new Date('2025-11-11'),
    },
  ];

  beforeEach(async () => {
    // Create mock signals for TaskStateService
    tasksSignal = signal<Task[]>([]);
    const currentWorkspaceTodayTasksSignal = computed(() =>
      tasksSignal().filter((t) => t.status === TaskStatus.TODAY),
    );
    const currentWorkspaceInProgressTasksSignal = computed(() =>
      tasksSignal().filter((t) => t.status === TaskStatus.IN_PROGRESS),
    );
    const currentWorkspaceDoneTasksSignal = computed(() =>
      tasksSignal().filter((t) => t.status === TaskStatus.DONE),
    );

    // Create mock service with workspace-filtered signals
    mockTaskStateService = {
      loadTasks: jest.fn(),
      updateTask: jest.fn(),
      removeTask: jest.fn(),
      currentWorkspaceTodayTasks: currentWorkspaceTodayTasksSignal,
      currentWorkspaceInProgressTasks: currentWorkspaceInProgressTasksSignal,
      currentWorkspaceDoneTasks: currentWorkspaceDoneTasksSignal,
    };

    await TestBed.configureTestingModule({
      imports: [KanbanBoardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: TaskStateService, useValue: mockTaskStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanBoardComponent);
    component = fixture.componentInstance;
  });

  // Helper function to update mock tasks
  const setMockTasks = (tasks: Task[]) => {
    tasksSignal.set(tasks);
  };

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.selectedTask()).toBeNull();
      expect(component.showTaskDialog()).toBe(false);
    });

    it('should expose TaskStatus enum', () => {
      expect(component.TaskStatus).toBe(TaskStatus);
    });

    it('should expose Workspace enum', () => {
      expect(component.Workspace).toBe(Workspace);
    });

    it('should call loadTasks on init', () => {
      fixture.detectChanges();
      expect(mockTaskStateService.loadTasks).toHaveBeenCalledTimes(1);
    });
  });

  describe('Computed Signals - Task Filtering', () => {
    beforeEach(() => {
      setMockTasks(mockTasks);
      fixture.detectChanges();
    });

    it('should compute todayTasks correctly', () => {
      const todayTasks = component.todayTasks();
      expect(todayTasks.length).toBe(2);
      expect(todayTasks.every((t) => t.status === TaskStatus.TODAY)).toBe(true);
      expect(todayTasks.map((t) => t.id)).toEqual([1, 4]);
    });

    it('should compute inProgressTasks correctly', () => {
      const inProgressTasks = component.inProgressTasks();
      expect(inProgressTasks.length).toBe(1);
      expect(inProgressTasks[0].status).toBe(TaskStatus.IN_PROGRESS);
      expect(inProgressTasks[0].id).toBe(2);
    });

    it('should compute doneTasks correctly', () => {
      const doneTasks = component.doneTasks();
      expect(doneTasks.length).toBe(1);
      expect(doneTasks[0].status).toBe(TaskStatus.DONE);
      expect(doneTasks[0].id).toBe(3);
    });

    it('should update computed signals when tasks change', () => {
      expect(component.todayTasks().length).toBe(2);

      // Add another TODAY task
      const newTasks = [
        ...mockTasks,
        {
          id: 5,
          title: 'New Today Task',
          description: null,
          workspace: Workspace.WORK,
          channelId: null,
          status: TaskStatus.TODAY,
          dueDate: null,
          isRoutine: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setMockTasks(newTasks);
      fixture.detectChanges();

      expect(component.todayTasks().length).toBe(3);
    });

    it('should handle empty task lists', () => {
      setMockTasks([]);
      fixture.detectChanges();

      expect(component.todayTasks().length).toBe(0);
      expect(component.inProgressTasks().length).toBe(0);
      expect(component.doneTasks().length).toBe(0);
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate dailyProgress correctly with all statuses', () => {
      setMockTasks(mockTasks);
      fixture.detectChanges();

      // 2 today, 1 in progress, 1 done = 4 total, 1 done = 25%
      const progress = component.dailyProgress();
      expect(progress).toBe(25);
    });

    it('should calculate 100% when all tasks are done', () => {
      const allDoneTasks = mockTasks.map((t) => ({
        ...t,
        status: TaskStatus.DONE,
      }));
      setMockTasks(allDoneTasks);
      fixture.detectChanges();

      expect(component.dailyProgress()).toBe(100);
    });

    it('should calculate 0% when no tasks are done', () => {
      const noDoneTasks = mockTasks.map((t) => ({
        ...t,
        status: t.status === TaskStatus.DONE ? TaskStatus.TODAY : t.status,
      }));
      setMockTasks(noDoneTasks);
      fixture.detectChanges();

      expect(component.dailyProgress()).toBe(0);
    });

    it('should return 0 when there are no tasks', () => {
      setMockTasks([]);
      fixture.detectChanges();

      expect(component.dailyProgress()).toBe(0);
    });

    it('should round progress to nearest integer', () => {
      // 2 done, 1 today = 3 total = 66.666...% should round to 67%
      const tasks: Task[] = [
        { ...mockTasks[0], status: TaskStatus.DONE },
        { ...mockTasks[1], status: TaskStatus.DONE },
        { ...mockTasks[2], status: TaskStatus.TODAY },
      ];
      setMockTasks(tasks);
      fixture.detectChanges();

      expect(component.dailyProgress()).toBe(67);
    });
  });

  describe('Task Detail Dialog', () => {
    it('should open task dialog with selected task', () => {
      const task = mockTasks[0];
      component.openTaskDetails(task);

      expect(component.selectedTask()).toBe(task);
      expect(component.showTaskDialog()).toBe(true);
    });

    it('should close task dialog and clear selected task', () => {
      const task = mockTasks[0];
      component.openTaskDetails(task);
      expect(component.selectedTask()).toBe(task);
      expect(component.showTaskDialog()).toBe(true);

      component.closeTaskDialog();

      expect(component.showTaskDialog()).toBe(false);
      expect(component.selectedTask()).toBeNull();
    });

    it('should handle opening dialog multiple times', () => {
      component.openTaskDetails(mockTasks[0]);
      expect(component.selectedTask()?.id).toBe(1);

      component.openTaskDetails(mockTasks[1]);
      expect(component.selectedTask()?.id).toBe(2);
      expect(component.showTaskDialog()).toBe(true);
    });
  });

  describe('Task Status Updates', () => {
    it('should update task status to IN_PROGRESS', () => {
      const taskId = 1;
      const newStatus = TaskStatus.IN_PROGRESS;

      component.moveToStatus(taskId, newStatus);

      expect(mockTaskStateService.updateTask).toHaveBeenCalledWith(taskId, {
        status: newStatus,
      });
    });

    it('should update task status to DONE', () => {
      const taskId = 2;
      const newStatus = TaskStatus.DONE;

      component.moveToStatus(taskId, newStatus);

      expect(mockTaskStateService.updateTask).toHaveBeenCalledWith(taskId, {
        status: newStatus,
      });
    });

    it('should close dialog after moving task', () => {
      component.openTaskDetails(mockTasks[0]);
      expect(component.showTaskDialog()).toBe(true);

      component.moveToStatus(1, TaskStatus.DONE);

      expect(component.showTaskDialog()).toBe(false);
      expect(component.selectedTask()).toBeNull();
    });

    it('should handle moving task to same status', () => {
      const task = mockTasks[0]; // Already TODAY
      component.openTaskDetails(task);

      component.moveToStatus(task.id, TaskStatus.TODAY);

      expect(mockTaskStateService.updateTask).toHaveBeenCalledWith(task.id, {
        status: TaskStatus.TODAY,
      });
    });
  });

  describe('Task Deletion', () => {
    let confirmSpy: jest.SpyInstance;

    beforeEach(() => {
      confirmSpy = jest.spyOn(window, 'confirm');
    });

    afterEach(() => {
      confirmSpy.mockRestore();
    });

    it('should delete task when user confirms', () => {
      confirmSpy.mockReturnValue(true);
      const taskId = 1;

      component.deleteTask(taskId);

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this task?',
      );
      expect(mockTaskStateService.removeTask).toHaveBeenCalledWith(taskId);
    });

    it('should not delete task when user cancels', () => {
      confirmSpy.mockReturnValue(false);
      const taskId = 1;

      component.deleteTask(taskId);

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this task?',
      );
      expect(mockTaskStateService.removeTask).not.toHaveBeenCalled();
    });

    it('should close dialog after deleting task', () => {
      confirmSpy.mockReturnValue(true);
      component.openTaskDetails(mockTasks[0]);

      component.deleteTask(1);

      expect(component.showTaskDialog()).toBe(false);
      expect(component.selectedTask()).toBeNull();
    });

    it('should not close dialog if deletion cancelled', () => {
      confirmSpy.mockReturnValue(false);
      component.openTaskDetails(mockTasks[0]);
      expect(component.showTaskDialog()).toBe(true);

      component.deleteTask(1);

      // Dialog should still be open since user cancelled
      expect(component.showTaskDialog()).toBe(true);
      expect(component.selectedTask()).not.toBeNull();
    });
  });

  describe('Workspace Methods', () => {
    it('should return correct color for WORK workspace', () => {
      const color = component.getWorkspaceColor(Workspace.WORK);
      expect(color).toBe('#F97316');
    });

    it('should return correct color for PERSONAL workspace', () => {
      const color = component.getWorkspaceColor(Workspace.PERSONAL);
      expect(color).toBe('#14B8A6');
    });

    it('should return "success" severity for WORK workspace', () => {
      const severity = component.getWorkspaceSeverity(Workspace.WORK);
      expect(severity).toBe('success');
    });

    it('should return "info" severity for PERSONAL workspace', () => {
      const severity = component.getWorkspaceSeverity(Workspace.PERSONAL);
      expect(severity).toBe('info');
    });
  });

  describe('Date Formatting', () => {
    beforeEach(() => {
      // Mock current date to 2025-11-13 local time for consistent testing
      jest.useFakeTimers();
      // Use local time (not UTC) to match formatDate logic
      const mockDate = new Date(2025, 10, 13, 12, 0, 0); // Month is 0-indexed (10 = November)
      jest.setSystemTime(mockDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should format today date as "Today"', () => {
      const todayDate = new Date(2025, 10, 13); // Same as mocked date
      const formatted = component.formatDate(todayDate);
      expect(formatted).toBe('Today');
    });

    it('should format tomorrow date as "Tomorrow"', () => {
      const tomorrowDate = new Date(2025, 10, 14); // One day after mocked date
      const formatted = component.formatDate(tomorrowDate);
      expect(formatted).toBe('Tomorrow');
    });

    it('should format other dates as "Mon Day" format', () => {
      const futureDate = new Date('2025-11-20');
      const formatted = component.formatDate(futureDate);
      expect(formatted).toMatch(/^[A-Za-z]{3} \d{1,2}$/); // e.g., "Nov 20"
    });

    it('should handle string date input', () => {
      // Use the same date format as mocked date (local time)
      const dateString = new Date(2025, 10, 13).toISOString();
      const formatted = component.formatDate(dateString);
      expect(formatted).toBe('Today');
    });

    it('should handle null date', () => {
      const formatted = component.formatDate(null);
      expect(formatted).toBe('');
    });

    it('should handle undefined date', () => {
      const formatted = component.formatDate(undefined);
      expect(formatted).toBe('');
    });

    it('should format past dates correctly', () => {
      const pastDate = new Date('2025-11-10');
      const formatted = component.formatDate(pastDate);
      expect(formatted).toMatch(/^[A-Za-z]{3} \d{1,2}$/); // e.g., "Nov 10"
    });
  });

  describe('Component DOM Rendering', () => {
    beforeEach(() => {
      setMockTasks(mockTasks);
      fixture.detectChanges();
    });

    it('should render three kanban columns', () => {
      const compiled = fixture.nativeElement;
      const panels = compiled.querySelectorAll('.kanban-panel');
      expect(panels.length).toBeGreaterThanOrEqual(3);
    });

    it('should display correct task counts in badges', () => {
      const compiled = fixture.nativeElement;
      const badges = compiled.querySelectorAll('p-badge');

      // Should have badges for task counts
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should render task cards for each task', () => {
      const compiled = fixture.nativeElement;
      const cards = compiled.querySelectorAll('p-card');

      // Should render cards for tasks (2 today + 1 in progress + 1 done = 4)
      expect(cards.length).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle task with all null optional fields', () => {
      const minimalTask: Task = {
        id: 99,
        title: 'Minimal Task',
        description: null,
        workspace: Workspace.PERSONAL,
        channelId: null,
        status: TaskStatus.TODAY,
        dueDate: null,
        isRoutine: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setMockTasks([minimalTask]);
      fixture.detectChanges();

      expect(component.todayTasks().length).toBe(1);
      expect(component.formatDate(minimalTask.dueDate)).toBe('');
    });

    it('should handle rapid task status changes', () => {
      component.moveToStatus(1, TaskStatus.IN_PROGRESS);
      component.moveToStatus(1, TaskStatus.DONE);
      component.moveToStatus(1, TaskStatus.TODAY);

      expect(mockTaskStateService.updateTask).toHaveBeenCalledTimes(3);
    });

    it('should handle deleting non-existent task', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      component.deleteTask(999);

      expect(mockTaskStateService.removeTask).toHaveBeenCalledWith(999);
      confirmSpy.mockRestore();
    });

    it('should maintain signal reactivity after multiple updates', () => {
      setMockTasks(mockTasks);
      fixture.detectChanges();
      expect(component.todayTasks().length).toBe(2);

      setMockTasks([mockTasks[0]]);
      fixture.detectChanges();
      expect(component.todayTasks().length).toBe(1);

      setMockTasks([]);
      fixture.detectChanges();
      expect(component.todayTasks().length).toBe(0);
    });
  });

  describe('Integration with TaskStateService', () => {
    it('should use TaskStateService workspace-filtered computed signals', () => {
      setMockTasks(mockTasks);
      fixture.detectChanges();

      // Verify component is using service's workspace-filtered computed signals
      expect(component.todayTasks()).toBe(
        mockTaskStateService.currentWorkspaceTodayTasks!(),
      );
      expect(component.inProgressTasks()).toBe(
        mockTaskStateService.currentWorkspaceInProgressTasks!(),
      );
      expect(component.doneTasks()).toBe(
        mockTaskStateService.currentWorkspaceDoneTasks!(),
      );
    });

    it('should call loadTasks with no filters on init', () => {
      fixture.detectChanges();

      expect(mockTaskStateService.loadTasks).toHaveBeenCalledWith();
    });

    it('should properly delegate updateTask calls', () => {
      const taskId = 1;
      const update = { status: TaskStatus.DONE };

      component.moveToStatus(taskId, TaskStatus.DONE);

      expect(mockTaskStateService.updateTask).toHaveBeenCalledWith(
        taskId,
        update,
      );
    });

    it('should properly delegate removeTask calls', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      const taskId = 1;

      component.deleteTask(taskId);

      expect(mockTaskStateService.removeTask).toHaveBeenCalledWith(taskId);
      confirmSpy.mockRestore();
    });
  });

  describe('Signal State Management', () => {
    it('should maintain selectedTask signal state', () => {
      expect(component.selectedTask()).toBeNull();

      const task = mockTasks[0];
      component.openTaskDetails(task);
      expect(component.selectedTask()).toBe(task);

      component.closeTaskDialog();
      expect(component.selectedTask()).toBeNull();
    });

    it('should maintain showTaskDialog signal state', () => {
      expect(component.showTaskDialog()).toBe(false);

      component.openTaskDetails(mockTasks[0]);
      expect(component.showTaskDialog()).toBe(true);

      component.closeTaskDialog();
      expect(component.showTaskDialog()).toBe(false);
    });

    it('should update dailyProgress signal reactively', () => {
      setMockTasks([mockTasks[0], mockTasks[1]]);
      fixture.detectChanges();
      const initialProgress = component.dailyProgress();

      // Move one task to DONE
      const updatedTasks = [
        { ...mockTasks[0], status: TaskStatus.DONE },
        mockTasks[1],
      ];
      setMockTasks(updatedTasks);
      fixture.detectChanges();

      const newProgress = component.dailyProgress();
      expect(newProgress).toBeGreaterThan(initialProgress);
    });
  });
});
