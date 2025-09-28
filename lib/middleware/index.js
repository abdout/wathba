// Centralized middleware exports
export {
  rateLimit,
  createRateLimitResponse
} from './rateLimit.js';

export {
  handleError,
  withErrorHandler,
  withValidation,
  APIError
} from './errorHandler.js';

export {
  addSecurityHeaders,
  withSecurityHeaders,
  createSecureResponse,
  addCorsHeaders
} from './securityHeaders.js';

// Combined middleware wrapper that applies all security measures
export function withAPIProtection(handler, options = {}) {
  const {
    rateLimit: rateLimitTier = 'api',
    validation = null,
    cors = false,
    corsOrigins = ['https://alwathbacoop.ae']
  } = options;

  return async (request, context) => {
    try {
      // Apply rate limiting
      const { rateLimit, createRateLimitResponse } = await import('./rateLimit.js');
      const rateLimitResult = await rateLimit(request, rateLimitTier);

      if (!rateLimitResult.success) {
        return createRateLimitResponse(rateLimitResult.headers);
      }

      // Apply validation if provided
      if (validation) {
        const body = await request.json();
        const validated = validation.parse(body);
        request.validated = validated;
      }

      // Execute the handler
      const response = await handler(request, context);

      // Add security headers
      const { addSecurityHeaders, addCorsHeaders } = await import('./securityHeaders.js');
      const secureResponse = addSecurityHeaders(response);

      // Add CORS headers if needed
      if (cors) {
        addCorsHeaders(secureResponse, corsOrigins);
      }

      // Add rate limit headers
      if (rateLimitResult.headers) {
        Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
          secureResponse.headers.set(key, value);
        });
      }

      return secureResponse;
    } catch (error) {
      const { handleError } = await import('./errorHandler.js');
      return handleError(error);
    }
  };
}