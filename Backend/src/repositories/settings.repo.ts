/**
 * Settings Repository
 * 
 * Data access layer for UserSettings model.
 * Contains ONLY database queries - no business logic.
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma } from '@prisma/client';

export type UserSettings = Prisma.UserSettingsGetPayload<{}>;
export type UserSettingsCreateInput = Prisma.UserSettingsCreateInput;
export type UserSettingsUpdateInput = Prisma.UserSettingsUpdateInput;

/**
 * Find settings by user ID
 */
export async function findByUserId(
  userId: string,
  tx?: TransactionClient
): Promise<UserSettings | null> {
  const client = tx || prisma;
  return client.userSettings.findUnique({
    where: { userId },
  });
}

/**
 * Find settings by Clerk ID
 */
export async function findByClerkId(
  clerkId: string,
  tx?: TransactionClient
): Promise<UserSettings | null> {
  const client = tx || prisma;
  return client.userSettings.findUnique({
    where: { clerkId },
  });
}

/**
 * Create settings for user
 */
export async function create(
  data: {
    userId: string;
    clerkId: string;
  },
  tx?: TransactionClient
): Promise<UserSettings> {
  const client = tx || prisma;
  return client.userSettings.create({
    data: {
      userId: data.userId,
      clerkId: data.clerkId,
    },
  });
}

/**
 * Update settings by Clerk ID
 */
export async function updateByClerkId(
  clerkId: string,
  data: Prisma.UserSettingsUpdateInput,
  tx?: TransactionClient
): Promise<UserSettings> {
  const client = tx || prisma;
  return client.userSettings.update({
    where: { clerkId },
    data,
  });
}

/**
 * Update settings by ID
 */
export async function update(
  id: string,
  data: Prisma.UserSettingsUpdateInput,
  tx?: TransactionClient
): Promise<UserSettings> {
  const client = tx || prisma;
  return client.userSettings.update({
    where: { id },
    data,
  });
}

/**
 * Upsert settings (create if not exists, update if exists)
 */
export async function upsert(
  userId: string,
  clerkId: string,
  data: Omit<Prisma.UserSettingsUpdateInput, 'userId' | 'clerkId'>,
  tx?: TransactionClient
): Promise<UserSettings> {
  const client = tx || prisma;
  return client.userSettings.upsert({
    where: { clerkId },
    create: {
      ...data,
      userId,
      clerkId,
    } as Prisma.UserSettingsUncheckedCreateInput,
    update: data,
  });
}
