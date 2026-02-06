/**
 * Database Layer Index
 * 
 * Exports database client and utilities.
 * This layer contains ONLY raw database access - no business logic.
 */

export { 
  prisma, 
  connectDatabase, 
  disconnectDatabase, 
  checkDatabaseHealth 
} from './client';
