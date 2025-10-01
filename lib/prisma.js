import { PrismaClient } from '@prisma/client';
import logger from './logger';
import performanceMonitor from './performance';

let prisma;

// Reduce logging in production
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

if (isDevelopment) {
  logger.info('Initializing Prisma Client', {
    environment: process.env.NODE_ENV,
    databaseConfigured: !!process.env.DATABASE_URL
  });
}

// Check if database is configured
const isDatabaseConfigured = !!process.env.DATABASE_URL;

if (!isDatabaseConfigured && isDevelopment) {
  logger.warn('No DATABASE_URL configured, operations will use fallback behavior');
}

// Enhanced Prisma Client configuration with connection pooling
const prismaConfig = {
  log: isProduction ? ['error'] : ['error', 'warn'],
  errorFormat: isProduction ? 'minimal' : 'pretty',

  // Connection pool configuration (for PostgreSQL with Neon)
  datasources: process.env.DATABASE_URL ? {
    db: {
      url: process.env.DATABASE_URL,
    }
  } : undefined,
};

try {
  if (isProduction) {
    // Production: Create new instance
    prisma = new PrismaClient(prismaConfig);
  } else {
    // Development: Reuse global instance to prevent hot reload issues
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        ...prismaConfig,
        log: ['error', 'warn'], // Reduced logging for better performance
      });
    }
    prisma = global.prisma;
  }

  // Add comprehensive query monitoring
  if (prisma) {
    prisma.$use(async (params, next) => {
      const before = Date.now();

      try {
        const result = await next(params);
        const after = Date.now();
        const duration = after - before;

        // Track performance metrics
        performanceMonitor.track(`db_${params.model}_${params.action}`, duration);

        // Log slow queries (>100ms in dev, >500ms in prod)
        const threshold = isDevelopment ? 100 : 500;
        if (duration > threshold) {
          logger.warn('Slow database query detected', {
            model: params.model,
            action: params.action,
            duration: `${duration}ms`,
            threshold: `${threshold}ms`
          });
        }

        return result;
      } catch (error) {
        logger.error('Database query failed', {
          model: params.model,
          action: params.action,
          error: error.message
        });
        throw error;
      }
    });
  }
} catch (error) {
  logger.error('Failed to create Prisma Client', error);
  if (isDevelopment) {
    logger.warn('Database operations will fail, using fallback behavior');
  }
}

// Connection management with retry logic
if (prisma && isDatabaseConfigured) {
  const connectWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await prisma.$connect();
        logger.info('Successfully connected to database', { attempt: i + 1 });
        return;
      } catch (error) {
        logger.error(`Failed to connect to database (attempt ${i + 1}/${retries})`, error);

        if (i < retries - 1) {
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, i), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          logger.warn('Application will continue with limited functionality');
        }
      }
    }
  };

  connectWithRetry();
}

// Graceful shutdown
if (typeof window === 'undefined' && !isProduction) {
  const gracefulShutdown = async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  };

  process.on('beforeExit', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

export default prisma;