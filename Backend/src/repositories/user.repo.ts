/**
 * User Repository
 * 
 * Data access layer for User model.
 * Contains ONLY database queries - no business logic.
 */

import { prisma, TransactionClient } from './base.repo';

// Use Prisma's inferred types directly from the client
type User = Awaited<ReturnType<typeof prisma.user.findFirst>> extends infer T ? NonNullable<T> : never;

export interface CreateUserData {
  clerkId: string;
  email: string;
  name: string;
  timezone?: string;
}

export interface UpdateUserData {
  name?: string;
  timezone?: string;
}

/**
 * Find user by internal ID
 */
export async function findById(
  id: string,
  tx?: TransactionClient
) {
  const client = tx || prisma;
  return client.user.findUnique({
    where: { id },
  });
}

/**
 * Find user by Clerk ID
 */
export async function findByClerkId(
  clerkId: string,
  tx?: TransactionClient
) {
  const client = tx || prisma;
  return client.user.findUnique({
    where: { clerkId },
  });
}

/**
 * Find user by email
 */
export async function findByEmail(
  email: string,
  tx?: TransactionClient
) {
  const client = tx || prisma;
  return client.user.findUnique({
    where: { email },
  });
}

/**
 * Find user with all relations
 */
export async function findByClerkIdWithRelations(
  clerkId: string,
  tx?: TransactionClient
) {
  const client = tx || prisma;
  return client.user.findUnique({
    where: { clerkId },
    include: {
      settings: true,
      enforcement: true,
      goals: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

/**
 * Create new user
 */
export async function create(
  data: CreateUserData,
  tx?: TransactionClient
): Promise<User> {
  const client = tx || prisma;
  return client.user.create({
    data: {
      clerkId: data.clerkId,
      email: data.email,
      name: data.name,
      timezone: data.timezone || 'UTC',
    },
  });
}

/**
 * Update user
 */
export async function update(
  clerkId: string,
  data: UpdateUserData,
  tx?: TransactionClient
): Promise<User> {
  const client = tx || prisma;
  return client.user.update({
    where: { clerkId },
    data,
  });
}

/**
 * Delete user (cascades to related records)
 */
export async function remove(
  clerkId: string,
  tx?: TransactionClient
): Promise<User> {
  const client = tx || prisma;
  return client.user.delete({
    where: { clerkId },
  });
}

/**
 * Check if user exists by Clerk ID
 */
export async function exists(
  clerkId: string,
  tx?: TransactionClient
): Promise<boolean> {
  const client = tx || prisma;
  const count = await client.user.count({
    where: { clerkId },
  });
  return count > 0;
}

/**
 * Find many users (for admin/jobs)
 */
export async function findMany(
  limit = 1000,
  tx?: TransactionClient
) {
  const client = tx || prisma;
  return client.user.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}
