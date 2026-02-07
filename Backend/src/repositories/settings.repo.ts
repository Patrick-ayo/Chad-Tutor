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
 * Create settings for user
 */
export async function create(
  data: {
    userId: string;
  },
  tx?: TransactionClient
): Promise<UserSettings> {
  const client = tx || prisma;
  return client.userSettings.create({
    data: {
      userId: data.userId,
    },
  });
}

/**
 * Update settings by user ID
 */
export async function updateByUserId(
  userId: string,
  data: Prisma.UserSettingsUpdateInput,
  tx?: TransactionClient
): Promise<UserSettings> {
  const client = tx || prisma;
  return client.userSettings.update({
    where: { userId },
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
  data: Omit<Prisma.UserSettingsUpdateInput, 'userId'>,
  tx?: TransactionClient
): Promise<UserSettings> {
  const client = tx || prisma;
  return client.userSettings.upsert({
    where: { userId },
    create: {
      ...data,
      userId,
    } as Prisma.UserSettingsUncheckedCreateInput,
    update: data,
  });
}
