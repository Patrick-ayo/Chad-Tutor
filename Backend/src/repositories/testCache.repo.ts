/**
 * Test Result Cache Repository
 *
 * Data access layer for cached test summaries.
 */

import { prisma, TransactionClient } from './base.repo';

export async function findValidByUserAndSkill(
  userId: string,
  skillId: string,
  tx?: TransactionClient
) {
  const client = tx || prisma;
  return client.testResultCache.findUnique({
    where: {
      userId_skillId: {
        userId,
        skillId,
      },
    },
  });
}

export async function upsertSkillCache(
  userId: string,
  skillId: string,
  data: {
    latestScore: number;
    latestAttemptAt: Date | null;
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    expiresAt: Date;
  },
  tx?: TransactionClient
) {
  const client = tx || prisma;

  return client.testResultCache.upsert({
    where: {
      userId_skillId: {
        userId,
        skillId,
      },
    },
    create: {
      userId,
      skillId,
      latestScore: data.latestScore,
      latestAttemptAt: data.latestAttemptAt ?? undefined,
      totalAttempts: data.totalAttempts,
      averageScore: data.averageScore,
      bestScore: data.bestScore,
      expiresAt: data.expiresAt,
    },
    update: {
      latestScore: data.latestScore,
      latestAttemptAt: data.latestAttemptAt ?? undefined,
      totalAttempts: data.totalAttempts,
      averageScore: data.averageScore,
      bestScore: data.bestScore,
      lastCachedAt: new Date(),
      expiresAt: data.expiresAt,
    },
  });
}

export async function deleteExpired(
  userId: string,
  tx?: TransactionClient,
): Promise<number> {
  const client = tx || prisma;
  const result = await client.testResultCache.deleteMany({
    where: {
      userId,
      expiresAt: { lt: new Date() },
    },
  });

  return result.count;
}
