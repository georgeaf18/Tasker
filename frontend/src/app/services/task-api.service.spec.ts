import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TaskApiService } from './task-api.service';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
  Workspace,
  TaskStatus,
  Channel,
} from '../models';
import { environment } from '../../environments/environment';

/**
 * Mock API response type for test data factory
 */
interface MockTaskApiResponse {
  id: number;
  title: string;
  description: string | null;
  workspace: Workspace;
  channelId: number | null;
  channel?: {
    id: number;
    name: string;
    workspace: Workspace;
    color: string | null;
    createdAt: string;
  };
  status: TaskStatus;
  dueDate: string | null;
  isRoutine: boolean;
  createdAt: string;
  updatedAt: string;
}

describe('TaskApiService', () => {
  let service: TaskApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/tasks`;

  // Mock data factories
  const createMockTask = (overrides?: Partial<Task>): Task => ({
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    workspace: Workspace.PERSONAL,
    channelId: null,
    status: TaskStatus.BACKLOG,
    dueDate: null,
    isRoutine: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    ...overrides,
  });

  const createMockTaskResponse = (
    overrides?: Partial<MockTaskApiResponse>,
  ): MockTaskApiResponse => ({
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    workspace: Workspace.PERSONAL,
    channelId: null,
    status: TaskStatus.BACKLOG,
    dueDate: null,
    isRoutine: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    ...overrides,
  });

  const createMockChannel = () => ({
    id: 10,
    name: 'Test Channel',
    workspace: Workspace.WORK,
    color: '#FF0000',
    createdAt: '2024-01-01T00:00:00Z',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(TaskApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have correct base URL', () => {
      expect(baseUrl).toBe('http://localhost:3000/api/tasks');
    });
  });

  describe('getTasks', () => {
    describe('without filters', () => {
      it('should fetch all tasks successfully', (done) => {
        const mockResponse = [
          createMockTaskResponse(),
          createMockTaskResponse({ id: 2, title: 'Task 2' }),
        ];

        service.getTasks().subscribe({
          next: (tasks) => {
            expect(tasks.length).toBe(2);
            expect(tasks[0].title).toBe('Test Task');
            expect(tasks[1].title).toBe('Task 2');
            expect(tasks[0].createdAt instanceof Date).toBe(true);
            expect(tasks[0].updatedAt instanceof Date).toBe(true);
            done();
          },
          error: done.fail,
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.keys().length).toBe(0);
        req.flush(mockResponse);
      });

      it('should return empty array when no tasks exist', (done) => {
        service.getTasks().subscribe({
          next: (tasks) => {
            expect(tasks).toEqual([]);
            done();
          },
          error: done.fail,
        });

        const req = httpMock.expectOne(baseUrl);
        req.flush([]);
      });

      it('should deserialize all date fields correctly', (done) => {
        const mockResponse = [
          createMockTaskResponse({
            dueDate: '2024-12-31T23:59:59Z',
          }),
        ];

        service.getTasks().subscribe({
          next: (tasks) => {
            expect(tasks[0].createdAt instanceof Date).toBe(true);
            expect(tasks[0].updatedAt instanceof Date).toBe(true);
            expect(tasks[0].dueDate instanceof Date).toBe(true);
            expect(tasks[0].createdAt.toISOString()).toBe(
              '2024-01-01T00:00:00.000Z',
            );
            expect(tasks[0].dueDate?.toISOString()).toBe(
              '2024-12-31T23:59:59.000Z',
            );
            done();
          },
          error: done.fail,
        });

        const req = httpMock.expectOne(baseUrl);
        req.flush(mockResponse);
      });

      it('should handle null dueDate correctly', (done) => {
        const mockResponse = [createMockTaskResponse({ dueDate: null })];

        service.getTasks().subscribe({
          next: (tasks) => {
            expect(tasks[0].dueDate).toBeNull();
            done();
          },
          error: done.fail,
        });

        const req = httpMock.expectOne(baseUrl);
        req.flush(mockResponse);
      });

      it('should deserialize channel relation with dates', (done) => {
        const mockChannel = createMockChannel();
        const mockResponse = [
          createMockTaskResponse({
            channelId: 10,
            channel: mockChannel,
          }),
        ];

        service.getTasks().subscribe({
          next: (tasks) => {
            expect(tasks[0].channel).toBeDefined();
            expect(tasks[0].channel?.id).toBe(10);
            expect(tasks[0].channel?.name).toBe('Test Channel');
            expect(tasks[0].channel?.createdAt instanceof Date).toBe(true);
            done();
          },
          error: done.fail,
        });

        const req = httpMock.expectOne(baseUrl);
        req.flush(mockResponse);
      });

      it('should handle undefined channel correctly', (done) => {
        const mockResponse = [
          createMockTaskResponse({ channelId: null, channel: undefined }),
        ];

        service.getTasks().subscribe({
          next: (tasks) => {
            expect(tasks[0].channel).toBeUndefined();
            done();
          },
          error: done.fail,
        });

        const req = httpMock.expectOne(baseUrl);
        req.flush(mockResponse);
      });
    });

    describe('with filters', () => {
      it('should filter by workspace', (done) => {
        const filters: TaskFilters = { workspace: Workspace.WORK };

        service.getTasks(filters).subscribe({
          next: () => done(),
          error: done.fail,
        });

        const req = httpMock.expectOne(`${baseUrl}?workspace=WORK`);
        expect(req.request.params.get('workspace')).toBe('WORK');
        req.flush([]);
      });

      it('should filter by status', (done) => {
        const filters: TaskFilters = { status: TaskStatus.TODAY };

        service.getTasks(filters).subscribe({
          next: () => done(),
          error: done.fail,
        });

        const req = httpMock.expectOne(`${baseUrl}?status=TODAY`);
        expect(req.request.params.get('status')).toBe('TODAY');
        req.flush([]);
      });

      it('should filter by channelId', (done) => {
        const filters: TaskFilters = { channelId: 5 };

        service.getTasks(filters).subscribe({
          next: () => done(),
          error: done.fail,
        });

        const req = httpMock.expectOne(`${baseUrl}?channelId=5`);
        expect(req.request.params.get('channelId')).toBe('5');
        req.flush([]);
      });

      it('should handle channelId of 0', (done) => {
        const filters: TaskFilters = { channelId: 0 };

        service.getTasks(filters).subscribe({
          next: () => done(),
          error: done.fail,
        });

        const req = httpMock.expectOne(`${baseUrl}?channelId=0`);
        expect(req.request.params.get('channelId')).toBe('0');
        req.flush([]);
      });

      it('should apply multiple filters simultaneously', (done) => {
        const filters: TaskFilters = {
          workspace: Workspace.PERSONAL,
          status: TaskStatus.IN_PROGRESS,
          channelId: 3,
        };

        service.getTasks(filters).subscribe({
          next: () => done(),
          error: done.fail,
        });

        const req = httpMock.expectOne(
          `${baseUrl}?workspace=PERSONAL&status=IN_PROGRESS&channelId=3`,
        );
        expect(req.request.params.get('workspace')).toBe('PERSONAL');
        expect(req.request.params.get('status')).toBe('IN_PROGRESS');
        expect(req.request.params.get('channelId')).toBe('3');
        req.flush([]);
      });

      it('should ignore undefined filter values', (done) => {
        const filters: TaskFilters = {
          workspace: undefined,
          status: TaskStatus.BACKLOG,
          channelId: undefined,
        };

        service.getTasks(filters).subscribe({
          next: () => done(),
          error: done.fail,
        });

        const req = httpMock.expectOne(`${baseUrl}?status=BACKLOG`);
        expect(req.request.params.has('workspace')).toBe(false);
        expect(req.request.params.has('channelId')).toBe(false);
        req.flush([]);
      });
    });

    describe('error handling', () => {
      it('should handle 400 Bad Request', (done) => {
        service.getTasks().subscribe({
          next: () => done.fail('Should have failed with 400 error'),
          error: (error) => {
            expect(error.message).toContain('Invalid request');
            done();
          },
        });

        const req = httpMock.expectOne(baseUrl);
        req.flush(
          { message: 'Invalid workspace' },
          { status: 400, statusText: 'Bad Request' },
        );
      });

      it('should handle 404 Not Found', (done) => {
        service.getTasks().subscribe({
          next: () => done.fail('Should have failed with 404 error'),
          error: (error) => {
            expect(error.message).toBe('Task not found');
            done();
          },
        });

        const req = httpMock.expectOne(baseUrl);
        req.flush({}, { status: 404, statusText: 'Not Found' });
      });

      it('should handle 500 Server Error', (done) => {
        service.getTasks().subscribe({
          next: () => done.fail('Should have failed with 500 error'),
          error: (error) => {
            expect(error.message).toBe('Server error: Please try again later');
            done();
          },
        });

        const req = httpMock.expectOne(baseUrl);
        req.flush({}, { status: 500, statusText: 'Internal Server Error' });
      });

      it('should handle network errors', (done) => {
        service.getTasks().subscribe({
          next: () => done.fail('Should have failed with network error'),
          error: (error) => {
            expect(error.message).toContain('Network error');
            done();
          },
        });

        const req = httpMock.expectOne(baseUrl);
        req.error(
          new ErrorEvent('error', {
            message: 'Network failure',
          }),
        );
      });

      it('should handle unknown error codes', (done) => {
        service.getTasks().subscribe({
          next: () => done.fail('Should have failed with error'),
          error: (error) => {
            expect(error.message).toContain('Error fetching tasks');
            done();
          },
        });

        const req = httpMock.expectOne(baseUrl);
        req.flush({}, { status: 503, statusText: 'Service Unavailable' });
      });
    });
  });

  describe('getTask', () => {
    it('should fetch single task by id successfully', (done) => {
      const mockResponse = createMockTaskResponse();

      service.getTask(1).subscribe({
        next: (task) => {
          expect(task.id).toBe(1);
          expect(task.title).toBe('Test Task');
          expect(task.createdAt instanceof Date).toBe(true);
          expect(task.updatedAt instanceof Date).toBe(true);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should deserialize task with channel relation', (done) => {
      const mockChannel = createMockChannel();
      const mockResponse = createMockTaskResponse({
        channelId: 10,
        channel: mockChannel,
      });

      service.getTask(1).subscribe({
        next: (task) => {
          expect(task.channel?.id).toBe(10);
          expect(task.channel?.createdAt instanceof Date).toBe(true);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush(mockResponse);
    });

    it('should handle 404 when task not found', (done) => {
      service.getTask(999).subscribe({
        next: () => done.fail('Should have failed with 404 error'),
        error: (error) => {
          expect(error.message).toBe('Task not found');
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server error', (done) => {
      service.getTask(1).subscribe({
        next: () => done.fail('Should have failed with 500 error'),
        error: (error) => {
          expect(error.message).toBe('Server error: Please try again later');
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should fetch task with all optional fields populated', (done) => {
      const mockResponse = createMockTaskResponse({
        description: 'Full description',
        dueDate: '2024-12-31T00:00:00Z',
        channelId: 5,
        isRoutine: true,
      });

      service.getTask(1).subscribe({
        next: (task) => {
          expect(task.description).toBe('Full description');
          expect(task.dueDate instanceof Date).toBe(true);
          expect(task.channelId).toBe(5);
          expect(task.isRoutine).toBe(true);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush(mockResponse);
    });
  });

  describe('createTask', () => {
    it('should create task with minimal required fields', (done) => {
      const dto: CreateTaskDto = {
        title: 'New Task',
        workspace: Workspace.PERSONAL,
      };
      const mockResponse = createMockTaskResponse({
        title: 'New Task',
        workspace: Workspace.PERSONAL,
      });

      service.createTask(dto).subscribe({
        next: (task) => {
          expect(task.title).toBe('New Task');
          expect(task.workspace).toBe(Workspace.PERSONAL);
          expect(task.createdAt instanceof Date).toBe(true);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should create task with all optional fields', (done) => {
      const dto: CreateTaskDto = {
        title: 'Complete Task',
        description: 'Full description',
        workspace: Workspace.WORK,
        channelId: 5,
        status: TaskStatus.TODAY,
        dueDate: new Date('2024-12-31'),
        isRoutine: true,
      };
      const mockResponse = createMockTaskResponse({
        title: 'Complete Task',
        description: 'Full description',
        workspace: Workspace.WORK,
        channelId: 5,
        status: TaskStatus.TODAY,
        dueDate: '2024-12-31T00:00:00Z',
        isRoutine: true,
      });

      service.createTask(dto).subscribe({
        next: (task) => {
          expect(task.title).toBe('Complete Task');
          expect(task.description).toBe('Full description');
          expect(task.workspace).toBe(Workspace.WORK);
          expect(task.channelId).toBe(5);
          expect(task.status).toBe(TaskStatus.TODAY);
          expect(task.dueDate instanceof Date).toBe(true);
          expect(task.isRoutine).toBe(true);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should handle 400 validation error', (done) => {
      const dto: CreateTaskDto = {
        title: '',
        workspace: Workspace.PERSONAL,
      };

      service.createTask(dto).subscribe({
        next: () => done.fail('Should have failed with 400 error'),
        error: (error) => {
          expect(error.message).toContain('Invalid request');
          done();
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(
        { message: 'Title is required' },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('should handle 500 server error', (done) => {
      const dto: CreateTaskDto = {
        title: 'New Task',
        workspace: Workspace.PERSONAL,
      };

      service.createTask(dto).subscribe({
        next: () => done.fail('Should have failed with 500 error'),
        error: (error) => {
          expect(error.message).toBe('Server error: Please try again later');
          done();
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should deserialize created task with channel', (done) => {
      const dto: CreateTaskDto = {
        title: 'New Task',
        workspace: Workspace.WORK,
        channelId: 10,
      };
      const mockChannel = createMockChannel();
      const mockResponse = createMockTaskResponse({
        channelId: 10,
        channel: mockChannel,
      });

      service.createTask(dto).subscribe({
        next: (task) => {
          expect(task.channel?.id).toBe(10);
          expect(task.channel?.createdAt instanceof Date).toBe(true);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(mockResponse);
    });
  });

  describe('updateTask', () => {
    it('should update task with partial fields', (done) => {
      const dto: UpdateTaskDto = {
        title: 'Updated Title',
      };
      const mockResponse = createMockTaskResponse({
        title: 'Updated Title',
      });

      service.updateTask(1, dto).subscribe({
        next: (task) => {
          expect(task.title).toBe('Updated Title');
          expect(task.updatedAt instanceof Date).toBe(true);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should update multiple fields', (done) => {
      const dto: UpdateTaskDto = {
        title: 'New Title',
        description: 'New Description',
        status: TaskStatus.IN_PROGRESS,
        workspace: Workspace.WORK,
      };
      const mockResponse = createMockTaskResponse({
        title: 'New Title',
        description: 'New Description',
        status: TaskStatus.IN_PROGRESS,
        workspace: Workspace.WORK,
      });

      service.updateTask(1, dto).subscribe({
        next: (task) => {
          expect(task.title).toBe('New Title');
          expect(task.description).toBe('New Description');
          expect(task.status).toBe(TaskStatus.IN_PROGRESS);
          expect(task.workspace).toBe(Workspace.WORK);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should update with empty object (no changes)', (done) => {
      const dto: UpdateTaskDto = {};
      const mockResponse = createMockTaskResponse();

      service.updateTask(1, dto).subscribe({
        next: (task) => {
          expect(task.id).toBe(1);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });

    it('should handle 404 when task not found', (done) => {
      const dto: UpdateTaskDto = { title: 'Updated' };

      service.updateTask(999, dto).subscribe({
        next: () => done.fail('Should have failed with 404 error'),
        error: (error) => {
          expect(error.message).toBe('Task not found');
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 400 validation error', (done) => {
      const dto: UpdateTaskDto = { title: '' };

      service.updateTask(1, dto).subscribe({
        next: () => done.fail('Should have failed with 400 error'),
        error: (error) => {
          expect(error.message).toContain('Invalid request');
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush(
        { message: 'Title cannot be empty' },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('should update dueDate to null', (done) => {
      const dto: UpdateTaskDto = { dueDate: undefined };
      const mockResponse = createMockTaskResponse({ dueDate: null });

      service.updateTask(1, dto).subscribe({
        next: (task) => {
          expect(task.dueDate).toBeNull();
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush(mockResponse);
    });

    it('should update channelId', (done) => {
      const dto: UpdateTaskDto = { channelId: 15 };
      const mockChannel = { ...createMockChannel(), id: 15 };
      const mockResponse = createMockTaskResponse({
        channelId: 15,
        channel: mockChannel,
      });

      service.updateTask(1, dto).subscribe({
        next: (task) => {
          expect(task.channelId).toBe(15);
          expect(task.channel?.id).toBe(15);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush(mockResponse);
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', (done) => {
      service.deleteTask(1).subscribe({
        next: () => {
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle 404 when task not found', (done) => {
      service.deleteTask(999).subscribe({
        next: () => done.fail('Should have failed with 404 error'),
        error: (error) => {
          expect(error.message).toBe('Task not found');
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server error', (done) => {
      service.deleteTask(1).subscribe({
        next: () => done.fail('Should have failed with 500 error'),
        error: (error) => {
          expect(error.message).toBe('Server error: Please try again later');
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error during deletion', (done) => {
      service.deleteTask(1).subscribe({
        next: () => done.fail('Should have failed with network error'),
        error: (error) => {
          expect(error.message).toContain('Network error');
          done();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.error(
        new ErrorEvent('error', {
          message: 'Network failure',
        }),
      );
    });

    it('should delete multiple tasks sequentially', (done) => {
      let deletedCount = 0;

      service.deleteTask(1).subscribe({
        next: () => {
          deletedCount++;
          if (deletedCount === 2) {
            done();
          }
        },
        error: done.fail,
      });

      service.deleteTask(2).subscribe({
        next: () => {
          deletedCount++;
          if (deletedCount === 2) {
            done();
          }
        },
        error: done.fail,
      });

      const req1 = httpMock.expectOne(`${baseUrl}/1`);
      const req2 = httpMock.expectOne(`${baseUrl}/2`);
      req1.flush(null);
      req2.flush(null);
    });
  });

  describe('Date Deserialization Edge Cases', () => {
    it('should handle malformed date strings gracefully', (done) => {
      const mockResponse = createMockTaskResponse({
        createdAt: 'invalid-date',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      service.getTask(1).subscribe({
        next: (task) => {
          // Invalid Date object is still created
          expect(task.createdAt instanceof Date).toBe(true);
          expect(isNaN(task.createdAt.getTime())).toBe(true);
          expect(task.updatedAt instanceof Date).toBe(true);
          expect(isNaN(task.updatedAt.getTime())).toBe(false);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      req.flush(mockResponse);
    });

    it('should handle tasks array with mixed date formats', (done) => {
      const mockResponse = [
        createMockTaskResponse({ id: 1, dueDate: '2024-12-31' }),
        createMockTaskResponse({ id: 2, dueDate: null }),
        createMockTaskResponse({ id: 3, dueDate: '2024-01-01T12:30:00Z' }),
      ];

      service.getTasks().subscribe({
        next: (tasks) => {
          expect(tasks[0].dueDate instanceof Date).toBe(true);
          expect(tasks[1].dueDate).toBeNull();
          expect(tasks[2].dueDate instanceof Date).toBe(true);
          done();
        },
        error: done.fail,
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(mockResponse);
    });
  });

  describe('Error Message Customization', () => {
    it('should include backend error message in 400 response', (done) => {
      service.getTasks().subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('Invalid workspace value');
          done();
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(
        { message: 'Invalid workspace value' },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    it('should fallback to generic message when no error message provided', (done) => {
      service
        .createTask({ title: 'Test', workspace: Workspace.PERSONAL })
        .subscribe({
          next: () => done.fail('Should have failed'),
          error: (error) => {
            expect(error.message).toContain('Please check your input');
            done();
          },
        });

      const req = httpMock.expectOne(baseUrl);
      req.flush({}, { status: 400, statusText: 'Bad Request' });
    });

    it('should log errors to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      service.getTasks().subscribe({
        next: () => fail('Should have failed'),
        error: () => {
          expect(consoleSpy).toHaveBeenCalled();
          const firstArg = consoleSpy.mock.calls[0][0];
          expect(firstArg).toContain('[TaskApiService]');
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });

      consoleSpy.mockRestore();
    });
  });

  describe('HTTP Method Verification', () => {
    it('should use GET for getTasks', () => {
      service.getTasks().subscribe();
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should use GET for getTask', () => {
      service.getTask(1).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(createMockTaskResponse());
    });

    it('should use POST for createTask', () => {
      service
        .createTask({ title: 'Test', workspace: Workspace.PERSONAL })
        .subscribe();
      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      req.flush(createMockTaskResponse());
    });

    it('should use PATCH for updateTask', () => {
      service.updateTask(1, { title: 'Updated' }).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(createMockTaskResponse());
    });

    it('should use DELETE for deleteTask', () => {
      service.deleteTask(1).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
