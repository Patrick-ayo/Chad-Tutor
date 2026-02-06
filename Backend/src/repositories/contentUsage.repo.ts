/**
 * Content Usage Repository
 * 
 * Data access layer for ContentUsage model (analytics).
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma } from '@prisma/client';

export type ContentUsage = Prisma.ContentUsageGetPayload<{}>;

/**
 * Record or update content usage
 */
export async function recordUsage(
  userId: string,
  subjectId: string,
  viewTimeMs: number = 0,
  sessionId?: string,
  tx?: TransactionClient
): Promise<ContentUsage> {
  const client = tx || prisma;
  
  return client.contentUsage.upsert({
    where: {
      userId_subjectId: { userId, subjectId },
    },
    create: {
      userId,
      subjectId,
      viewCount: 1,
      totalViewMs: viewTimeMs,
      sessionId,
    },
    update: {
      viewCount: { increment: 1 },
      totalViewMs: { increment: viewTimeMs },
      lastViewedAt: new Date(),
      sessionId,
    },
  });
}

/**
 * Get user's content usage history
 */
export async function findByUserId(
  userId: string,
  limit: number = 50,
  tx?: TransactionClient
): Promise<ContentUsage[]> {
  const client = tx || prisma;
  return client.contentUsage.findMany({
    where: { userId },
    orderBy: { lastViewedAt: 'desc' },
    take: limit,
    include: {
      subject: true,
    },
  });
}

/**
 * Get most viewed subjects by a user
 */
export async function getMostViewed(
  userId: string,
  limit: number = 10,
  tx?: TransactionClient
): Promise<ContentUsage[]> {
  const client = tx || prisma;
  return client.contentUsage.findMany({
    where: { userId },
    orderBy: { viewCount: 'desc' },
    take: limit,
    include: {
      subject: true,
    },
  });
}

/**
 * Get popular subjects across all users
 */
export async function getPopularSubjects(
  days: number = 30,
  limit: number = 20,
  tx?: TransactionClient
): Promise<{ subjectId: string; totalViews: number }[]> {
  const client = tx || prisma;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const results = await client.contentUsage.groupBy({
    by: ['subjectId'],
    where: {
      lastViewedAt: { gte: since },
    },
    _sum: {
      viewCount: true,
    },
    orderBy: {
      _sum: {
        viewCount: 'desc',
      },
    },
    take: limit,
  });

  return results.map((r) => ({
    subjectId: r.subjectId,
    totalViews: r._sum.viewCount || 0,
  }));
}

/**
 * Get total study time for a user
 */
export async function getTotalStudyTime(
  userId: string,
  tx?: TransactionClient
): Promise<number> {
  const client = tx || prisma;
  const result = await client.contentUsage.aggregate({
    where: { userId },
    _sum: { totalViewMs: true },
  });
  return result._sum.totalViewMs || 0;
}
