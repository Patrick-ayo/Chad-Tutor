/**
 * University Repository
 * 
 * Data access layer for University model.
 * Supports deduplication via canonical records and normalized names.
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma } from '@prisma/client';

export type University = Prisma.UniversityGetPayload<{}>;

export interface CreateUniversityData {
  externalId: string;
  sourceId: string;
  name: string;
  normalizedName: string;
  country?: string;
  type?: string;
  isCanonical?: boolean;
  canonicalId?: string;
}

/**
 * Find university by ID
 */
export async function findById(
  id: string,
  tx?: TransactionClient
): Promise<University | null> {
  const client = tx || prisma;
  return client.university.findUnique({
    where: { id },
  });
}

/**
 * Find by source and external ID (unique constraint)
 */
export async function findByExternalId(
  sourceId: string,
  externalId: string,
  tx?: TransactionClient
): Promise<University | null> {
  const client = tx || prisma;
  return client.university.findUnique({
    where: {
      sourceId_externalId: { sourceId, externalId },
    },
  });
}

/**
 * Find canonical university by normalized name
 * Used for deduplication across sources
 */
export async function findCanonicalByNormalizedName(
  normalizedName: string,
  tx?: TransactionClient
): Promise<University | null> {
  const client = tx || prisma;
  return client.university.findFirst({
    where: {
      normalizedName,
      isCanonical: true,
    },
  });
}

/**
 * Search universities by name (with normalization)
 */
export async function searchByName(
  query: string,
  limit: number = 20,
  tx?: TransactionClient
): Promise<University[]> {
  const client = tx || prisma;
  const normalizedQuery = query.toLowerCase().trim();
  
  return client.university.findMany({
    where: {
      isCanonical: true,
      normalizedName: {
        contains: normalizedQuery,
      },
    },
    take: limit,
    orderBy: { name: 'asc' },
  });
}

/**
 * Create university
 */
export async function create(
  data: CreateUniversityData,
  tx?: TransactionClient
): Promise<University> {
  const client = tx || prisma;
  return client.university.create({
    data,
  });
}

/**
 * Upsert university - create if not exists, update if exists
 */
export async function upsert(
  data: CreateUniversityData,
  tx?: TransactionClient
): Promise<University> {
  const client = tx || prisma;
  return client.university.upsert({
    where: {
      sourceId_externalId: {
        sourceId: data.sourceId,
        externalId: data.externalId,
      },
    },
    create: data,
    update: {
      name: data.name,
      normalizedName: data.normalizedName,
      country: data.country,
      type: data.type,
    },
  });
}

/**
 * Map duplicate to canonical record
 */
export async function mapToCanonical(
  id: string,
  canonicalId: string,
  tx?: TransactionClient
): Promise<University> {
  const client = tx || prisma;
  return client.university.update({
    where: { id },
    data: {
      isCanonical: false,
      canonicalId,
    },
  });
}

/**
 * Get all canonical universities
 */
export async function findAllCanonical(
  tx?: TransactionClient
): Promise<University[]> {
  const client = tx || prisma;
  return client.university.findMany({
    where: { isCanonical: true },
    orderBy: { name: 'asc' },
  });
}

/**
 * Count total universities
 */
export async function count(
  tx?: TransactionClient
): Promise<number> {
  const client = tx || prisma;
  return client.university.count({
    where: { isCanonical: true },
  });
}
