/**
 * Search Cache Repository
 * 
 * Data access layer for SearchCache model (L2 persistent cache).
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma, EntityType } from '@prisma/client';

export type SearchCache = Prisma.SearchCacheGetPayload<{}>;

const DEFAULT_CACHE_HOURS = 24;

/**
 * Find cache entry by normalized query
 */
export async function findByQuery(
  normalizedQuery: string,
  entityType: EntityType,
  tx?: TransactionClient
): Promise<SearchCache | null> {
  const client = tx || prisma;
  return client.searchCache.findFirst({
    where: {
      normalizedQuery,
      entityType,
      expiresAt: { gt: new Date() }, // Not expired
    },
  });
}

/**
 * Create or update cache entry
 */
export async function upsert(
  normalizedQuery: string,
  entityType: EntityType,
  resultIds: string[],
  cacheHours: number = DEFAULT_CACHE_HOURS,
  tx?: TransactionClient
): Promise<SearchCache> {
  const client = tx || prisma;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + cacheHours);

  return client.searchCache.upsert({
    where: { normalizedQuery },
    create: {
      normalizedQuery,
      entityType,
      resultIds,
      resultCount: resultIds.length,
      expiresAt,
    },
    update: {
      resultIds,
      resultCount: resultIds.length,
      expiresAt,
      hitCount: { increment: 1 },
    },
  });
}

/**
 * Increment hit count (for analytics)
 */
export async function incrementHit(
  id: string,
  tx?: TransactionClient
): Promise<void> {
  const client = tx || prisma;
  await client.searchCache.update({
    where: { id },
    data: { hitCount: { increment: 1 } },
  });
}

/**
 * Delete expired cache entries
 */
export async function deleteExpired(
  tx?: TransactionClient
): Promise<number> {
  const client = tx || prisma;
  const result = await client.searchCache.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return result.count;
}

/**
 * Clear all cache for a specific entity type
 */
export async function clearByEntityType(
  entityType: EntityType,
  tx?: TransactionClient
): Promise<number> {
  const client = tx || prisma;
  const result = await client.searchCache.deleteMany({
    where: { entityType },
  });
  return result.count;
}

/**
 * Get cache statistics
 */
export async function getStats(
  tx?: TransactionClient
): Promise<{
  total: number;
  expired: number;
  byEntityType: { entityType: string; count: number }[];
}> {
  const client = tx || prisma;
  
  const [total, expired, byType] = await Promise.all([
    client.searchCache.count(),
    client.searchCache.count({
      where: { expiresAt: { lt: new Date() } },
    }),
    client.searchCache.groupBy({
      by: ['entityType'],
      _count: true,
    }),
  ]);

  return {
    total,
    expired,
    byEntityType: byType.map((t) => ({
      entityType: t.entityType,
      count: t._count,
    })),
  };
}
