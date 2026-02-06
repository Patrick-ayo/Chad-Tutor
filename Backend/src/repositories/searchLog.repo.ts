/**
 * Search Log Repository
 * 
 * Data access layer for SearchLog model (analytics).
 */

import { prisma, TransactionClient, getSkip, paginate, PaginatedResult } from './base.repo';
import type { Prisma } from '@prisma/client';

export type SearchLog = Prisma.SearchLogGetPayload<{}>;

export interface CreateSearchLogData {
  userId?: string;
  rawQuery: string;
  normalizedQuery: string;
  entityType: string;
  cacheHit: boolean;
  resultCount: number;
  latencyMs: number;
}

/**
 * Create search log entry
 */
export async function create(
  data: CreateSearchLogData,
  tx?: TransactionClient
): Promise<SearchLog> {
  const client = tx || prisma;
  return client.searchLog.create({
    data,
  });
}

/**
 * Find logs by user
 */
export async function findByUserId(
  userId: string,
  page: number = 1,
  limit: number = 50,
  tx?: TransactionClient
): Promise<PaginatedResult<SearchLog>> {
  const client = tx || prisma;

  const [data, total] = await Promise.all([
    client.searchLog.findMany({
      where: { userId },
      skip: getSkip(page, limit),
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    client.searchLog.count({ where: { userId } }),
  ]);

  return paginate(data, total, page, limit);
}

/**
 * Get popular searches
 */
export async function getPopularSearches(
  entityType: string,
  days: number = 7,
  limit: number = 20,
  tx?: TransactionClient
): Promise<{ normalizedQuery: string; count: number }[]> {
  const client = tx || prisma;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const results = await client.searchLog.groupBy({
    by: ['normalizedQuery'],
    where: {
      entityType,
      createdAt: { gte: since },
    },
    _count: true,
    orderBy: {
      _count: {
        normalizedQuery: 'desc',
      },
    },
    take: limit,
  });

  return results.map((r) => ({
    normalizedQuery: r.normalizedQuery,
    count: r._count,
  }));
}

/**
 * Get search analytics
 */
export async function getAnalytics(
  days: number = 30,
  tx?: TransactionClient
): Promise<{
  totalSearches: number;
  cacheHitRate: number;
  avgLatencyMs: number;
  byEntityType: { entityType: string; count: number }[];
}> {
  const client = tx || prisma;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [total, cacheHits, latencyData, byType] = await Promise.all([
    client.searchLog.count({
      where: { createdAt: { gte: since } },
    }),
    client.searchLog.count({
      where: { createdAt: { gte: since }, cacheHit: true },
    }),
    client.searchLog.aggregate({
      where: { createdAt: { gte: since } },
      _avg: { latencyMs: true },
    }),
    client.searchLog.groupBy({
      by: ['entityType'],
      where: { createdAt: { gte: since } },
      _count: true,
    }),
  ]);

  return {
    totalSearches: total,
    cacheHitRate: total > 0 ? cacheHits / total : 0,
    avgLatencyMs: latencyData._avg.latencyMs || 0,
    byEntityType: byType.map((t) => ({
      entityType: t.entityType,
      count: t._count,
    })),
  };
}
