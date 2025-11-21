import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * HTTP Interceptor that adds the API key to all backend requests
 *
 * This interceptor automatically adds the 'x-api-key' header to all
 * requests going to the backend API. Only requests to the configured
 * API URL will have the key added.
 *
 * @example
 * // Configuration in app.config.ts:
 * provideHttpClient(
 *   withInterceptors([apiKeyInterceptor])
 * )
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add API key to requests going to our backend
  if (req.url.startsWith(environment.apiUrl)) {
    const clonedReq = req.clone({
      headers: req.headers.set('x-api-key', environment.apiKey)
    });
    return next(clonedReq);
  }

  // Pass through other requests unchanged
  return next(req);
};
