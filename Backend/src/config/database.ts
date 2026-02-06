/**
 * Database Configuration
 * 
 * PostgreSQL connection management via Prisma.
 */

import { prisma, connectDatabase as prismaConnect, disconnectDatabase as prismaDisconnect, checkDatabaseHealth } from '../db';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    console.log('Connecting to PostgreSQL via Prisma...');
    
    await prismaConnect();

    isConnected = true;
    console.log('PostgreSQL connected successfully');

  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await prismaDisconnect();
    isConnected = false;
    console.log('PostgreSQL disconnected');
  } catch (error) {
    console.error('Error disconnecting from PostgreSQL:', error);
    throw error;
  }
}

export function getConnectionState(): string {
  return isConnected ? 'connected' : 'disconnected';
}

export { checkDatabaseHealth };
