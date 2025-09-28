import { NextResponse } from 'next/server';

/**
 * Security headers middleware for API routes
 * Adds essential security headers to protect against common vulnerabilities
 */
export function addSecurityHeaders(response) {
  // Content Security Policy - helps prevent XSS attacks
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.stripe.com https://accounts.google.com https://clerk.alwathbacoop.ae https://api.imagekit.io; " +
    "frame-src 'self' https://js.stripe.com https://accounts.google.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );

  // Strict Transport Security (only for HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Cross-Origin Embedder Policy
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');

  // Cross-Origin Opener Policy
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Cross-Origin Resource Policy
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  return response;
}

/**
 * Wrapper for API route handlers that automatically adds security headers
 */
export function withSecurityHeaders(handler) {
  return async (request, context) => {
    const response = await handler(request, context);
    return addSecurityHeaders(response);
  };
}

/**
 * Create a secure NextResponse with all security headers
 */
export function createSecureResponse(data, options = {}) {
  const response = NextResponse.json(data, options);
  return addSecurityHeaders(response);
}

/**
 * CORS headers for API routes that need cross-origin access
 */
export function addCorsHeaders(response, allowedOrigins = ['https://alwathbacoop.ae']) {
  const origin = response.headers.get('origin');

  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );

  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );

  response.headers.set('Access-Control-Max-Age', '3600');

  return response;
}