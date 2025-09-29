import { PrismaClient } from '@prisma/client';

let prisma;

console.log('[Prisma] Initializing Prisma Client');
console.log('[Prisma] NODE_ENV:', process.env.NODE_ENV);
console.log('[Prisma] DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('[Prisma] DIRECT_URL exists:', !!process.env.DIRECT_URL);

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

// Test connection
prisma.$connect()
  .then(() => {
    console.log('[Prisma] Successfully connected to database');
  })
  .catch((error) => {
    console.error('[Prisma] Failed to connect to database:', error);
    console.error('[Prisma] Error message:', error.message);
    console.error('[Prisma] Error stack:', error.stack);
  });

export default prisma;