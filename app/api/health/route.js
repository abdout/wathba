import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { env, envValidation, services } from '@/lib/env';
import logger from '@/lib/logger';

/**
 * Health check endpoint for monitoring
 * GET /api/health - Basic health check
 * GET /api/health?detailed=true - Detailed health check with service status
 */

async function checkDatabase() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      message: 'Database connection successful'
    };
  } catch (error) {
    logger.error('Database health check failed', error);
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      error: error.message
    };
  }
}

async function checkRedis() {
  if (!services.hasRedis()) {
    return {
      status: 'not_configured',
      message: 'Redis not configured'
    };
  }

  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN
    });

    const start = Date.now();
    await redis.ping();
    const responseTime = Date.now() - start;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      message: 'Redis connection successful'
    };
  } catch (error) {
    logger.error('Redis health check failed', error);
    return {
      status: 'unhealthy',
      message: 'Redis connection failed',
      error: error.message
    };
  }
}

function checkEnvironment() {
  if (envValidation.success) {
    return {
      status: 'healthy',
      message: 'All required environment variables are set'
    };
  }

  const missing = envValidation.error?.missing || [];
  const invalid = envValidation.error?.invalid || [];

  return {
    status: missing.length > 0 ? 'unhealthy' : 'degraded',
    message: 'Environment configuration issues detected',
    missing: missing.length > 0 ? missing : undefined,
    invalid: invalid.length > 0 ? invalid : undefined
  };
}

function getMemoryUsage() {
  const used = process.memoryUsage();
  const formatMB = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;

  return {
    rss: `${formatMB(used.rss)} MB`,
    heapTotal: `${formatMB(used.heapTotal)} MB`,
    heapUsed: `${formatMB(used.heapUsed)} MB`,
    external: `${formatMB(used.external)} MB`
  };
}

function getUptime() {
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
      uptime: getUptime()
    };

    // Return basic health for simple monitoring
    if (!detailed) {
      return NextResponse.json(health);
    }

    // Detailed health check
    const [database, redis] = await Promise.all([
      checkDatabase(),
      checkRedis()
    ]);

    const environment = checkEnvironment();
    const memory = getMemoryUsage();

    // Determine overall health status
    const services = [database, redis, environment];
    const hasUnhealthy = services.some(s => s.status === 'unhealthy');
    const hasDegraded = services.some(s => s.status === 'degraded');

    health.status = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

    // Add detailed information
    health.details = {
      database,
      redis,
      environment,
      memory,
      services: {
        stripe: services.hasStripe() ? 'configured' : 'not_configured',
        imagekit: services.hasImageKit() ? 'configured' : 'not_configured',
        email: services.hasResend() ? 'configured' : 'not_configured',
        monitoring: services.hasSentry() ? 'configured' : 'not_configured',
        analytics: services.hasAnalytics() ? 'configured' : 'not_configured'
      },
      features: {
        reviews: env.ENABLE_REVIEWS,
        wishlist: env.ENABLE_WISHLIST,
        chat: env.ENABLE_CHAT
      }
    };

    // Log health check if in debug mode
    if (env.DEBUG) {
      logger.debug('Health check performed', health);
    }

    // Return appropriate status code based on health
    const statusCode = health.status === 'unhealthy' ? 503 : 200;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    logger.error('Health check error', error);

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    }, { status: 500 });
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}