import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Check if Redis is properly configured
const isRedisConfigured = process.env.UPSTASH_REDIS_REST_URL &&
                         process.env.UPSTASH_REDIS_REST_TOKEN &&
                         !process.env.UPSTASH_REDIS_REST_URL.includes('your-redis-url') &&
                         process.env.UPSTASH_REDIS_REST_URL !== 'https://mock.upstash.io';

// Create Redis client only if properly configured
let redis = null;
let rateLimiters = {};

if (isRedisConfigured) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });

    // Create rate limiter instances for different tiers
    rateLimiters = {
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
  } catch (error) {
    console.warn('Failed to initialize Redis for rate limiting:', error.message);
  }
}

export async function rateLimit(request, tier = 'api') {
  // Skip rate limiting in development or if Redis is not configured
  if (process.env.NODE_ENV === 'development' || !isRedisConfigured) {
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