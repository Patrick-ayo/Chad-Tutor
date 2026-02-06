/**
 * Content Refresh Repository
 * 
 * Data access layer for ContentRefresh model (freshness tracking).
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma } from '@prisma/client';

export type ContentRefresh = Prisma.ContentRefreshGetPayload<{}>;

export interface CreateRefreshData {
  entityType: string;
  entityId: string;
  success: boolean;
  errorMessage?: string;
  previousHash?: string;
  newHash?: string;
  hasChanges?: boolean;
}

/**
 * Log a refresh attempt
 */
export async function create(
  data: CreateRefreshData,
  tx?: TransactionClient
): Promise<ContentRefresh> {
  const client = tx || prisma;
  return client.contentRefresh.create({
    data,
  });
}

/**
 * Get last successful refresh for an entity
 */
export async function getLastRefresh(
  entityType: string,
  entityId: string,
  tx?: TransactionClient
): Promise<ContentRefresh | null> {
  const client = tx || prisma;
  return client.contentRefresh.findFirst({
    where: {
      entityType,
      entityId,
      success: true,
    },
    orderBy: { refreshedAt: 'desc' },
  });
}

/**
 * Check if entity needs refresh
 */
export async function needsRefresh(
  entityType: string,
  entityId: string,
  maxAgeHours: number = 24,
  tx?: TransactionClient
): Promise<boolean> {
  const client = tx || prisma;
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - maxAgeHours);

  const lastRefresh = await client.contentRefresh.findFirst({
    where: {
      entityType,
      entityId,
      success: true,
      refreshedAt: { gt: cutoff },
    },
  });

  return !lastRefresh;
}

/**
 * Get entities that need refresh
 */
export async function getStaleEntities(
  entityType: string,
  maxAgeHours: number = 24,
  limit: number = 100,
  tx?: TransactionClient
): Promise<string[]> {
  const client = tx || prisma;
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - maxAgeHours);

  // Get recently refreshed entities
  const recentRefreshes = await client.contentRefresh.findMany({
    where: {
      entityType,
      success: true,
      refreshedAt: { gt: cutoff },
    },
    select: { entityId: true },
  });

  const freshIds = new Set(recentRefreshes.map((r) => r.entityId));

  // Get all entities of this type (would need entity-specific logic)
  // This is a simplified version - in real implementation, 
  // you'd query the actual entity table
  const allRefreshes = await client.contentRefresh.findMany({
    where: { entityType },
    select: { entityId: true },
    distinct: ['entityId'],
    take: limit * 2,
  });

  return allRefreshes
    .filter((r) => !freshIds.has(r.entityId))
    .map((r) => r.entityId)
    .slice(0, limit);
}

/**
 * Get refresh history for an entity
 */
export async function getHistory(
  entityType: string,
  entityId: string,
  limit: number = 10,
  tx?: TransactionClient
): Promise<ContentRefresh[]> {
  const client = tx || prisma;
  return client.contentRefresh.findMany({
    where: { entityType, entityId },
    orderBy: { refreshedAt: 'desc' },
    take: limit,
  });
}

/**
 * Delete old refresh logs
 */
export async function deleteOld(
  daysToKeep: number = 30,
  tx?: TransactionClient
): Promise<number> {
  const client = tx || prisma;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);

  const result = await client.contentRefresh.deleteMany({
    where: {
      refreshedAt: { lt: cutoff },
    },
  });

  return result.count;
}
