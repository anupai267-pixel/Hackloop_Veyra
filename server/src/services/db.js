// Database Service Layer
// Manages Prisma ORM client with graceful error resilience when local PostgreSQL is not active.

import { PrismaClient } from '@prisma/client';

let prisma;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });
} catch (err) {
  console.warn('[DB] PrismaClient initialization note:', err.message);
  prisma = null;
}

export { prisma };

// Health check utility for PostgreSQL connection
export async function checkDatabaseHealth() {
  if (!prisma) {
    return { status: 'uninitialized', error: 'Prisma Client not initialized' };
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'connected', provider: 'PostgreSQL' };
  } catch (err) {
    return {
      status: 'disconnected',
      message: 'PostgreSQL connection failed. Please ensure PostgreSQL server is running and DATABASE_URL in server/.env is valid.',
      details: err.message
    };
  }
}
