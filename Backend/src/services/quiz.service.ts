/**
 * Quiz Service
 */

import { quizRepo, testCacheRepo } from '../repositories';
import type { Prisma } from '@prisma/client';

const inMemorySkillCache = new Map<string, { expiresAt: number; data: unknown }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

function getMemoryKey(userId: string, skillId: string): string {
  return `${userId}:${skillId}`;
}

export async function submitQuizAttempt(
  userId: string,
  input: {
    taskId?: string;
    skillId?: string;
    questionsCount: number;
    correctCount: number;
    timeSpentSeconds?: number;
    metadata?: unknown;
  }
) {
  const safeQuestions = Math.max(1, input.questionsCount);
  const safeCorrect = Math.max(0, Math.min(input.correctCount, safeQuestions));
  const score = Number(((safeCorrect / safeQuestions) * 100).toFixed(2));

  const attempt = await quizRepo.createAttempt({
    userId,
    taskId: input.taskId,
    skillId: input.skillId,
    questionsCount: safeQuestions,
    correctCount: safeCorrect,
    score,
    timeSpentSeconds: input.timeSpentSeconds,
    metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
  });

  if (input.skillId) {
    await refreshSkillCache(userId, input.skillId);
  }

  return attempt;
}

export async function refreshSkillCache(userId: string, skillId: string) {
  const aggregates = await quizRepo.getSkillAggregates(userId, skillId);
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);

  const cached = await testCacheRepo.upsertSkillCache(userId, skillId, {
    ...aggregates,
    expiresAt,
  });

  inMemorySkillCache.set(getMemoryKey(userId, skillId), {
    expiresAt: expiresAt.getTime(),
    data: cached,
  });

  return cached;
}

export async function getSkillCache(userId: string, skillId: string) {
  const key = getMemoryKey(userId, skillId);
  const memory = inMemorySkillCache.get(key);

  if (memory && memory.expiresAt > Date.now()) {
    return {
      source: 'memory' as const,
      data: memory.data,
    };
  }

  const dbCache = await testCacheRepo.findValidByUserAndSkill(userId, skillId);
  if (dbCache && dbCache.expiresAt.getTime() > Date.now()) {
    inMemorySkillCache.set(key, {
      expiresAt: dbCache.expiresAt.getTime(),
      data: dbCache,
    });

    return {
      source: 'database' as const,
      data: dbCache,
    };
  }

  const refreshed = await refreshSkillCache(userId, skillId);
  return {
    source: 'fresh' as const,
    data: refreshed,
  };
}

export async function getRecentAttempts(userId: string, limit: number = 20) {
  return quizRepo.findRecentAttempts(userId, limit);
}
