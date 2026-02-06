/**
 * Base Repository
 * 
 * Common repository patterns and types used across all repositories.
 * Provides transaction support and common query patterns.
 */

import { prisma } from '../db/client';
import { Prisma, PrismaClient } from '@prisma/client';

// Transaction client type for passing to repository methods
export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Execute operations within a transaction
 * Use this for hierarchical writes (University → Course → Semester → Subject)
 */
export async function withTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn);
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Calculate pagination skip value
 */
export function getSkip(page: number = 1, limit: number = 20): number {
  return (page - 1) * limit;
}

/**
 * Create paginated result
 */
export function paginate<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 20
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export { prisma, Prisma };
