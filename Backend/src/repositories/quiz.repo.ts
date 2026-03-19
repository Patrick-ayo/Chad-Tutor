/**
 * Quiz Repository
 *
 * Data access layer for quiz attempts.
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma } from '@prisma/client';

export type QuizAttempt = Prisma.QuizAttemptGetPayload<{}>;

export interface CreateQuizAttemptData {
  userId: string;
  taskId?: string;
  skillId?: string;
  questionsCount: number;
  correctCount: number;
  score: number;
  timeSpentSeconds?: number;
  metadata?: Prisma.InputJsonValue;
}

export async function createAttempt(
  data: CreateQuizAttemptData,
  tx?: TransactionClient
): Promise<QuizAttempt> {
  const client = tx || prisma;
  return client.quizAttempt.create({
    data,
  });
}

export async function findRecentAttempts(
  userId: string,
  limit: number = 20,
  tx?: TransactionClient
): Promise<QuizAttempt[]> {
  const client = tx || prisma;
  return client.quizAttempt.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    take: limit,
  });
}

export async function findBySkill(
  userId: string,
  skillId: string,
  limit: number = 20,
  tx?: TransactionClient
): Promise<QuizAttempt[]> {
  const client = tx || prisma;
  return client.quizAttempt.findMany({
    where: {
      userId,
      skillId,
    },
    orderBy: { completedAt: 'desc' },
    take: limit,
  });
}

export async function getSkillAggregates(
  userId: string,
  skillId: string,
  tx?: TransactionClient
): Promise<{
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  latestScore: number;
  latestAttemptAt: Date | null;
}> {
  const client = tx || prisma;

  const [aggregate, latest] = await Promise.all([
    client.quizAttempt.aggregate({
      where: {
        userId,
        skillId,
      },
      _count: { _all: true },
      _avg: { score: true },
      _max: { score: true },
    }),
    client.quizAttempt.findFirst({
      where: {
        userId,
        skillId,
      },
      orderBy: { completedAt: 'desc' },
      select: {
        score: true,
        completedAt: true,
      },
    }),
  ]);

  return {
    totalAttempts: aggregate._count._all,
    averageScore: aggregate._avg.score ?? 0,
    bestScore: aggregate._max.score ?? 0,
    latestScore: latest?.score ?? 0,
    latestAttemptAt: latest?.completedAt ?? null,
  };
}
