import { PrismaClient } from '@prisma/client';

let prisma;

console.log('[Prisma] Initializing Prisma Client');
console.log('[Prisma] NODE_ENV:', process.env.NODE_ENV);
console.log('[Prisma] DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('[Prisma] DIRECT_URL exists:', !!process.env.DIRECT_URL);

// Check if database is configured
const isDatabaseConfigured = !!process.env.DATABASE_URL;

if (!isDatabaseConfigured) {
  console.warn('[Prisma] No DATABASE_URL configured, operations will use fallback behavior');
}

try {
  if (process.env.NODE_ENV === 'production') {
    console.log('[Prisma] Creating production Prisma Client');
    prisma = new PrismaClient({
      log: ['query', 'error', 'warn']
    });
  } else {
    console.log('[Prisma] Creating development Prisma Client');
    if (!global.prisma) {
      console.log('[Prisma] Creating new global Prisma instance');
      global.prisma = new PrismaClient({
        log: ['query', 'error', 'warn']
      });
    } else {
      console.log('[Prisma] Reusing existing global Prisma instance');
    }
    prisma = global.prisma;
  }
} catch (error) {
  console.error('[Prisma] Failed to create Prisma Client:', error);
  console.warn('[Prisma] Database operations will fail, using fallback behavior');
}

// Test connection only if prisma client was created
if (prisma) {
  prisma.$connect()
    .then(() => {
      console.log('[Prisma] Successfully connected to database');
    })
    .catch((error) => {
      console.error('[Prisma] Failed to connect to database:', error.message);
      console.warn('[Prisma] Application will continue with limited functionality');
    });
} else {
  console.warn('[Prisma] Prisma client not initialized, skipping connection test');
}

export default prisma;