/**
 * Enforcement Repository
 * 
 * Data access layer for Enforcement model.
 * Contains ONLY database queries - no business logic.
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma } from '@prisma/client';

export type Enforcement = Prisma.EnforcementGetPayload<{}>;

/**
 * Find enforcement by Clerk ID
 */
export async function findByClerkId(
  clerkId: string,
  tx?: TransactionClient
): Promise<Enforcement | null> {
  const client = tx || prisma;
  return client.enforcement.findUnique({
    where: { clerkId },
  });
}

/**
 * Find enforcement by user ID
 */
export async function findByUserId(
  userId: string,
  tx?: TransactionClient
): Promise<Enforcement | null> {
  const client = tx || prisma;
  return client.enforcement.findUnique({
    where: { userId },
  });
}

/**
 * Update enforcement by ID
 */
export async function update(
  id: string,
  data: Prisma.EnforcementUpdateInput,
  tx?: TransactionClient
): Promise<Enforcement> {
  const client = tx || prisma;
  return client.enforcement.update({
    where: { id },
    data,
  });
}

/**
 * Create enforcement record for user
 */
export async function create(
  data: {
    userId: string;
    clerkId: string;
  },
  tx?: TransactionClient
): Promise<Enforcement> {
  const client = tx || prisma;
  return client.enforcement.create({
    data: {
      userId: data.userId,
      clerkId: data.clerkId,
    },
  });
}

/**
 * Update enforcement by Clerk ID
 */
export async function updateByClerkId(
  clerkId: string,
  data: Prisma.EnforcementUpdateInput,
  tx?: TransactionClient
): Promise<Enforcement> {
  const client = tx || prisma;
  return client.enforcement.update({
    where: { clerkId },
    data,
  });
}

/**
 * Increment violation count
 */
export async function incrementViolation(
  clerkId: string,
  violationData: { type: string; timestamp: Date; details?: string },
  tx?: TransactionClient
): Promise<Enforcement> {
  const client = tx || prisma;
  
  const current = await client.enforcement.findUnique({
    where: { clerkId },
  });

  if (!current) {
    throw new Error('Enforcement record not found');
  }

  const history = current.violationHistory as object[];
  
  return client.enforcement.update({
    where: { clerkId },
    data: {
      violationCount: { increment: 1 },
      lastViolation: new Date(),
      violationHistory: [...history, violationData],
    },
  });
}

/**
 * Set probation status
 */
export async function setProbation(
  clerkId: string,
  isOnProbation: boolean,
  tx?: TransactionClient
): Promise<Enforcement> {
  const client = tx || prisma;
  return client.enforcement.update({
    where: { clerkId },
    data: {
      isOnProbation,
      probationStart: isOnProbation ? new Date() : null,
      probationCount: isOnProbation ? { increment: 1 } : undefined,
    },
  });
}
