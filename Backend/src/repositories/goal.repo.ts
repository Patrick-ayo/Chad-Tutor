/**
 * Goal Repository
 * 
 * Data access layer for Goal model.
 * Contains ONLY database queries - no business logic.
 */

import { prisma, TransactionClient, getSkip, paginate, PaginatedResult } from './base.repo';
import type { Prisma } from '@prisma/client';

export type Goal = Prisma.GoalGetPayload<{}>;

export interface CreateGoalData {
  userId: string;
  clerkId: string;
  name: string;
  description?: string;
  deadline: Date;
  totalHours?: number;
}

export interface UpdateGoalData {
  name?: string;
  description?: string;
  deadline?: Date;
  totalHours?: number;
  completedHours?: number;
  status?: 'active' | 'completed' | 'abandoned';
  milestones?: object[];
}

/**
 * Find goal by ID
 */
export async function findById(
  id: string,
  tx?: TransactionClient
): Promise<Goal | null> {
  const client = tx || prisma;
  return client.goal.findUnique({
    where: { id },
  });
}

/**
 * Find all goals for a user
 */
export async function findByUserId(
  userId: string,
  status?: string,
  tx?: TransactionClient
): Promise<Goal[]> {
  const client = tx || prisma;
  return client.goal.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Find active goal for user
 */
export async function findActiveByClerkId(
  clerkId: string,
  tx?: TransactionClient
): Promise<Goal | null> {
  const client = tx || prisma;
  return client.goal.findFirst({
    where: {
      clerkId,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Find goals with pagination
 */
export async function findPaginated(
  userId: string,
  page: number = 1,
  limit: number = 20,
  status?: string,
  tx?: TransactionClient
): Promise<PaginatedResult<Goal>> {
  const client = tx || prisma;
  
  const where = {
    userId,
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    client.goal.findMany({
      where,
      skip: getSkip(page, limit),
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    client.goal.count({ where }),
  ]);

  return paginate(data, total, page, limit);
}

/**
 * Create new goal
 */
export async function create(
  data: CreateGoalData,
  tx?: TransactionClient
): Promise<Goal> {
  const client = tx || prisma;
  return client.goal.create({
    data: {
      userId: data.userId,
      clerkId: data.clerkId,
      name: data.name,
      description: data.description,
      deadline: data.deadline,
      totalHours: data.totalHours || 0,
    },
  });
}

/**
 * Update goal
 */
export async function update(
  id: string,
  data: UpdateGoalData,
  tx?: TransactionClient
): Promise<Goal> {
  const client = tx || prisma;
  return client.goal.update({
    where: { id },
    data,
  });
}

/**
 * Delete goal
 */
export async function remove(
  id: string,
  tx?: TransactionClient
): Promise<Goal> {
  const client = tx || prisma;
  return client.goal.delete({
    where: { id },
  });
}

/**
 * Update completed hours
 */
export async function addCompletedHours(
  id: string,
  hours: number,
  tx?: TransactionClient
): Promise<Goal> {
  const client = tx || prisma;
  return client.goal.update({
    where: { id },
    data: {
      completedHours: { increment: hours },
    },
  });
}
