import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new ApiKeyGuard(reflector);
  });

  const createMockExecutionContext = (
    headers: Record<string, string>,
    isPublic = false
  ): ExecutionContext => {
    const mockRequest = {
      headers,
    };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(isPublic);

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should allow requests with valid API key', () => {
      process.env.API_KEY = 'test-api-key-123';
      const context = createMockExecutionContext({
        'x-api-key': 'test-api-key-123',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should reject requests without API key', () => {
      process.env.API_KEY = 'test-api-key-123';
      const context = createMockExecutionContext({});

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('API key is missing');
    });

    it('should reject requests with invalid API key', () => {
      process.env.API_KEY = 'correct-key';
      const context = createMockExecutionContext({
        'x-api-key': 'wrong-key',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Invalid API key');
    });

    it('should allow requests to @Public() endpoints without API key', () => {
      process.env.API_KEY = 'test-api-key-123';
      const context = createMockExecutionContext({}, true); // isPublic = true

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw error if API_KEY environment variable is not set', () => {
      delete process.env.API_KEY;
      const context = createMockExecutionContext({
        'x-api-key': 'any-key',
      });

      expect(() => guard.canActivate(context)).toThrow(
        'API_KEY environment variable is not configured'
      );
    });

    it('should check IS_PUBLIC_KEY metadata using reflector', () => {
      process.env.API_KEY = 'test-key';
      const context = createMockExecutionContext({}, true); // isPublic = true

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });
  });
});
