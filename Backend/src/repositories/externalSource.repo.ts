/**
 * External Source Repository
 * 
 * Data access layer for ExternalSource model.
 * Tracks API sources for content deduplication.
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma } from '@prisma/client';

export type ExternalSource = Prisma.ExternalSourceGetPayload<{}>;

/**
 * Find source by name
 */
export async function findByName(
  name: string,
  tx?: TransactionClient
): Promise<ExternalSource | null> {
  const client = tx || prisma;
  return client.externalSource.findUnique({
    where: { name },
  });
}

/**
 * Find or create source
 */
export async function findOrCreate(
  name: string,
  apiEndpoint?: string,
  tx?: TransactionClient
): Promise<ExternalSource> {
  const client = tx || prisma;
  return client.externalSource.upsert({
    where: { name },
    create: {
      name,
      apiEndpoint,
    },
    update: {},
  });
}

/**
 * Update last sync time
 */
export async function updateLastSync(
  name: string,
  tx?: TransactionClient
): Promise<ExternalSource> {
  const client = tx || prisma;
  return client.externalSource.update({
    where: { name },
    data: {
      lastSync: new Date(),
    },
  });
}

/**
 * Get all active sources
 */
export async function findAllActive(
  tx?: TransactionClient
): Promise<ExternalSource[]> {
  const client = tx || prisma;
  return client.externalSource.findMany({
    where: { isActive: true },
  });
}

/**
 * Get source by ID
 */
export async function findById(
  id: string,
  tx?: TransactionClient
): Promise<ExternalSource | null> {
  const client = tx || prisma;
  return client.externalSource.findUnique({
    where: { id },
  });
}
