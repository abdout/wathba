import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://mock.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'mock_token'
});

// Create rate limiter instances for different tiers
const rateLimiters = {
  // General API rate limit: 100 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'api'
  }),

  // Strict rate limit for auth endpoints: 10 requests per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'auth'
  }),

  // Write operations: 30 requests per minute
  write: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'write'
  })
};

export async function rateLimit(request, tier = 'api') {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return { success: true };
  }

  try {
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'anonymous';

    const limiter = rateLimiters[tier] || rateLimiters.api;
    const { success, limit, reset, remaining } = await limiter.limit(ip);

    return {
      success,
      limit,
      reset,
      remaining,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString()
      }
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open - allow request if rate limiting fails
    return { success: true };
  }
}

export function createRateLimitResponse(headers) {
  return NextResponse.json(
    {
      success: false,
      error: 'Too many requests',
      message: 'Please slow down and try again later'
    },
    {
      status: 429,
      headers
    }
  );
}