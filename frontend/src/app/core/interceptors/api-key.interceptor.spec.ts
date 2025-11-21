import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { apiKeyInterceptor } from './api-key.interceptor';

// Mock environment
jest.mock('../../../environments/environment', () => ({
  environment: {
    apiUrl: 'http://localhost:3000/api',
    apiKey: 'test-api-key-123',
  },
}));

describe('apiKeyInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiKeyInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add X-API-Key header to backend API requests', () => {
    const testUrl = 'http://localhost:3000/api/tasks';

    httpClient.get(testUrl).subscribe();

    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.headers.has('x-api-key')).toBe(true);
    expect(req.request.headers.get('x-api-key')).toBe('test-api-key-123');

    req.flush({});
  });

  it('should not add X-API-Key header to external URLs', () => {
    const externalUrl = 'https://external-api.com/data';

    httpClient.get(externalUrl).subscribe();

    const req = httpTestingController.expectOne(externalUrl);
    expect(req.request.headers.has('x-api-key')).toBe(false);

    req.flush({});
  });

  it('should add X-API-Key header to all backend routes', () => {
    const routes = [
      'http://localhost:3000/api/tasks',
      'http://localhost:3000/api/tags',
      'http://localhost:3000/api/subtasks',
    ];

    routes.forEach((url) => {
      httpClient.get(url).subscribe();

      const req = httpTestingController.expectOne(url);
      expect(req.request.headers.get('x-api-key')).toBe('test-api-key-123');

      req.flush({});
    });
  });

  it('should work with POST requests', () => {
    const testUrl = 'http://localhost:3000/api/tasks';
    const testData = { title: 'Test Task' };

    httpClient.post(testUrl, testData).subscribe();

    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('x-api-key')).toBe('test-api-key-123');
    expect(req.request.body).toEqual(testData);

    req.flush({});
  });
});
