// Database Service Layer
// Manages Prisma ORM client with graceful error resilience when local PostgreSQL is not active.

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let prisma = null;

if (process.env.DATABASE_URL) {
  try {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    });
  } catch (err) {
    console.warn('[DB] PrismaClient initialization note:', err.message);
    prisma = null;
  }
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
