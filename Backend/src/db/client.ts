/**
 * Prisma Database Client Singleton
 * 
 * This is the ONLY place where Prisma client is instantiated.
 * All database access goes through this module.
 * 
 * DO NOT put business logic here - this is raw DB access only.
 */

import { PrismaClient } from '@prisma/client';

// Declare global type for development hot-reload
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Create singleton instance
// In development, use global to prevent multiple instances during hot-reload
const prisma = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

/**
 * Connect to database
 * Call this on server startup
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
}

/**
 * Disconnect from database
 * Call this on server shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('📦 PostgreSQL disconnected');
}

/**
 * Health check - verify database is accessible
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Export the client for use in repositories
export { prisma };
export default prisma;
