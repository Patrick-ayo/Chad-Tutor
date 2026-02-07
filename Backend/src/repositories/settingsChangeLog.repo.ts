/**
 * Settings Change Log Repository
 * 
 * Data access layer for SettingsChangeLog model.
 * Contains ONLY database queries - no business logic.
 */

import { prisma, TransactionClient, getSkip, paginate, PaginatedResult } from './base.repo';
import type { Prisma } from '@prisma/client';

export type SettingsChangeLog = Prisma.SettingsChangeLogGetPayload<{}>;

export interface CreateChangeLogData {
  userId: string;
  changes: object[];
  impactScore: number;
  warningLevel: number;
}

/**
 * Create change log entry
 */
export async function create(
  data: CreateChangeLogData,
  tx?: TransactionClient
): Promise<SettingsChangeLog> {
  const client = tx || prisma;
  return client.settingsChangeLog.create({
    data: {
      userId: data.userId,
      changes: data.changes,
      impactScore: data.impactScore,
      warningLevel: data.warningLevel,
    },
  });
}

/**
 * Find change logs by user
 */
export async function findByUserId(
  userId: string,
  page: number = 1,
  limit: number = 20,
  tx?: TransactionClient
): Promise<PaginatedResult<SettingsChangeLog>> {
  const client = tx || prisma;

  const [data, total] = await Promise.all([
    client.settingsChangeLog.findMany({
      where: { userId },
      skip: getSkip(page, limit),
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    client.settingsChangeLog.count({ where: { userId } }),
  ]);

  return paginate(data, total, page, limit);
}

/**
 * Find recent change logs by user ID
 */
export async function findRecentByUserId(
  userId: string,
  days: number = 30,
  tx?: TransactionClient
): Promise<SettingsChangeLog[]> {
  const client = tx || prisma;
  const since = new Date();
  since.setDate(since.getDate() - days);

  return client.settingsChangeLog.findMany({
    where: {
      userId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'desc' },
  });
}
