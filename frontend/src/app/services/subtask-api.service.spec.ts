import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SubtaskApiService } from './subtask-api.service';
import { Subtask, CreateSubtaskDto, UpdateSubtaskDto, ReorderSubtaskDto, SubtaskStatus } from '../models/subtask.model';
import { environment } from '../../environments/environment';

describe('SubtaskApiService', () => {
    let service: SubtaskApiService;
    let httpMock: HttpTestingController;
    const baseUrl = environment.apiUrl;

    // Mock subtask factory
    const createMockSubtask = (overrides: Partial<Subtask> = {}): Subtask => ({
        id: 1,
        title: 'Test Subtask',
        description: 'Test Description',
        taskId: 1,
        status: SubtaskStatus.TODO,
        position: 0,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
        ...overrides
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SubtaskApiService]
        });

        service = TestBed.inject(SubtaskApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getSubtasks()', () => {
        it('should fetch subtasks for a task', (done) => {
            const taskId = 1;
            const mockSubtasks = [
                createMockSubtask({ id: 1, position: 0 }),
                createMockSubtask({ id: 2, position: 1 })
            ];

            service.getSubtasks(taskId).subscribe({
                next: (subtasks) => {
                    expect(subtasks).toHaveLength(2);
                    expect(subtasks[0].id).toBe(1);
                    expect(subtasks[1].id).toBe(2);
                    expect(subtasks[0].createdAt).toBeInstanceOf(Date);
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/tasks/${taskId}/subtasks`);
            expect(req.request.method).toBe('GET');
            req.flush(mockSubtasks);
        });

        it('should deserialize date fields from ISO strings', (done) => {
            const taskId = 1;
            const mockResponse = [{
                id: 1,
                title: 'Test',
                description: null,
                taskId: 1,
                status: SubtaskStatus.TODO,
                position: 0,
                createdAt: '2025-01-15T10:00:00Z',
                updatedAt: '2025-01-15T11:00:00Z'
            }];

            service.getSubtasks(taskId).subscribe({
                next: (subtasks) => {
                    expect(subtasks[0].createdAt).toBeInstanceOf(Date);
                    expect(subtasks[0].updatedAt).toBeInstanceOf(Date);
                    expect(subtasks[0].createdAt.toISOString()).toBe('2025-01-15T10:00:00.000Z');
                    expect(subtasks[0].updatedAt.toISOString()).toBe('2025-01-15T11:00:00.000Z');
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/tasks/${taskId}/subtasks`);
            req.flush(mockResponse);
        });

        it('should handle 404 error when task not found', (done) => {
            const taskId = 999;

            service.getSubtasks(taskId).subscribe({
                next: () => fail('Should have errored'),
                error: (error) => {
                    expect(error.message).toBe('Subtask not found');
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/tasks/${taskId}/subtasks`);
            req.flush({ message: 'Task not found' }, { status: 404, statusText: 'Not Found' });
        });

        it('should handle network error', (done) => {
            const taskId = 1;

            service.getSubtasks(taskId).subscribe({
                next: () => fail('Should have errored'),
                error: (error) => {
                    expect(error.message).toContain('Error fetching subtasks');
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/tasks/${taskId}/subtasks`);
            req.error(new ProgressEvent('Network error'));
        });
    });

    describe('createSubtask()', () => {
        it('should create a new subtask', (done) => {
            const taskId = 1;
            const dto: CreateSubtaskDto = {
                title: 'New Subtask',
                description: 'New Description',
                status: SubtaskStatus.TODO
            };
            const mockResponse = createMockSubtask({ title: 'New Subtask', description: 'New Description' });

            service.createSubtask(taskId, dto).subscribe({
                next: (subtask) => {
                    expect(subtask.title).toBe('New Subtask');
                    expect(subtask.description).toBe('New Description');
                    expect(subtask.createdAt).toBeInstanceOf(Date);
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/tasks/${taskId}/subtasks`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(dto);
            req.flush(mockResponse);
        });

        it('should create subtask with minimal data', (done) => {
            const taskId = 1;
            const dto: CreateSubtaskDto = { title: 'Minimal Subtask' };
            const mockResponse = createMockSubtask({ title: 'Minimal Subtask', description: null });

            service.createSubtask(taskId, dto).subscribe({
                next: (subtask) => {
                    expect(subtask.title).toBe('Minimal Subtask');
                    expect(subtask.description).toBeNull();
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/tasks/${taskId}/subtasks`);
            expect(req.request.body).toEqual(dto);
            req.flush(mockResponse);
        });

        it('should handle 400 validation error', (done) => {
            const taskId = 1;
            const dto: CreateSubtaskDto = { title: '' }; // Invalid: empty title

            service.createSubtask(taskId, dto).subscribe({
                next: () => fail('Should have errored'),
                error: (error) => {
                    expect(error.message).toContain('Invalid request');
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/tasks/${taskId}/subtasks`);
            req.flush({ message: 'Title is required' }, { status: 400, statusText: 'Bad Request' });
        });
    });

    describe('updateSubtask()', () => {
        it('should update a subtask', (done) => {
            const subtaskId = 1;
            const dto: UpdateSubtaskDto = { title: 'Updated Title', status: SubtaskStatus.DOING };
            const mockResponse = createMockSubtask({ id: 1, title: 'Updated Title', status: SubtaskStatus.DOING });

            service.updateSubtask(subtaskId, dto).subscribe({
                next: (subtask) => {
                    expect(subtask.title).toBe('Updated Title');
                    expect(subtask.status).toBe(SubtaskStatus.DOING);
                    expect(subtask.updatedAt).toBeInstanceOf(Date);
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/subtasks/${subtaskId}`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual(dto);
            req.flush(mockResponse);
        });

        it('should update only specified fields', (done) => {
            const subtaskId = 1;
            const dto: UpdateSubtaskDto = { status: SubtaskStatus.DONE };
            const mockResponse = createMockSubtask({ id: 1, status: SubtaskStatus.DONE });

            service.updateSubtask(subtaskId, dto).subscribe({
                next: (subtask) => {
                    expect(subtask.status).toBe(SubtaskStatus.DONE);
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/subtasks/${subtaskId}`);
            expect(req.request.body).toEqual({ status: SubtaskStatus.DONE });
            req.flush(mockResponse);
        });

        it('should handle 404 when subtask not found', (done) => {
            const subtaskId = 999;
            const dto: UpdateSubtaskDto = { title: 'Updated' };

            service.updateSubtask(subtaskId, dto).subscribe({
                next: () => fail('Should have errored'),
                error: (error) => {
                    expect(error.message).toBe('Subtask not found');
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/subtasks/${subtaskId}`);
            req.flush({ message: 'Subtask not found' }, { status: 404, statusText: 'Not Found' });
        });
    });

    describe('deleteSubtask()', () => {
        it('should delete a subtask', (done) => {
            const subtaskId = 1;

            service.deleteSubtask(subtaskId).subscribe({
                next: () => {
                    expect(true).toBe(true); // Success
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/subtasks/${subtaskId}`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });

        it('should handle 404 when subtask not found', (done) => {
            const subtaskId = 999;

            service.deleteSubtask(subtaskId).subscribe({
                next: () => fail('Should have errored'),
                error: (error) => {
                    expect(error.message).toBe('Subtask not found');
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/subtasks/${subtaskId}`);
            req.flush({ message: 'Subtask not found' }, { status: 404, statusText: 'Not Found' });
        });

        it('should handle server error', (done) => {
            const subtaskId = 1;

            service.deleteSubtask(subtaskId).subscribe({
                next: () => fail('Should have errored'),
                error: (error) => {
                    expect(error.message).toContain('Server error');
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/subtasks/${subtaskId}`);
            req.flush({ message: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
        });
    });

    describe('reorderSubtask()', () => {
        it('should reorder a subtask', (done) => {
            const subtaskId = 1;
            const dto: ReorderSubtaskDto = { position: 3 };
            const mockResponse = createMockSubtask({ id: 1, position: 3 });

            service.reorderSubtask(subtaskId, dto).subscribe({
                next: (subtask) => {
                    expect(subtask.position).toBe(3);
                    expect(subtask.updatedAt).toBeInstanceOf(Date);
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/subtasks/${subtaskId}/reorder`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual(dto);
            req.flush(mockResponse);
        });

        it('should handle invalid position error', (done) => {
            const subtaskId = 1;
            const dto: ReorderSubtaskDto = { position: -1 }; // Invalid position

            service.reorderSubtask(subtaskId, dto).subscribe({
                next: () => fail('Should have errored'),
                error: (error) => {
                    expect(error.message).toContain('Invalid request');
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/subtasks/${subtaskId}/reorder`);
            req.flush({ message: 'Position must be non-negative' }, { status: 400, statusText: 'Bad Request' });
        });

        it('should handle 404 when subtask not found', (done) => {
            const subtaskId = 999;
            const dto: ReorderSubtaskDto = { position: 0 };

            service.reorderSubtask(subtaskId, dto).subscribe({
                next: () => fail('Should have errored'),
                error: (error) => {
                    expect(error.message).toBe('Subtask not found');
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/subtasks/${subtaskId}/reorder`);
            req.flush({ message: 'Subtask not found' }, { status: 404, statusText: 'Not Found' });
        });
    });

    describe('Error Handling', () => {
        it('should handle errors without messages gracefully', (done) => {
            const taskId = 1;

            service.getSubtasks(taskId).subscribe({
                next: () => fail('Should have errored'),
                error: (error) => {
                    expect(error.message).toContain('Server error');
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/tasks/${taskId}/subtasks`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });

        it('should log errors to console', (done) => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const taskId = 1;

            service.getSubtasks(taskId).subscribe({
                next: () => fail('Should have errored'),
                error: () => {
                    expect(consoleErrorSpy).toHaveBeenCalledWith(
                        expect.stringContaining('[SubtaskApiService]'),
                        expect.any(Object)
                    );
                    consoleErrorSpy.mockRestore();
                    done();
                }
            });

            const req = httpMock.expectOne(`${baseUrl}/tasks/${taskId}/subtasks`);
            req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        });
    });
});
