/**
 * Subject Repository
 * 
 * Data access layer for Subject model.
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma } from '@prisma/client';

export type Subject = Prisma.SubjectGetPayload<{}>;

export interface CreateSubjectData {
  externalId: string;
  sourceId: string;
  semesterId: string;
  name: string;
  normalizedName: string;
  code?: string;
  credits?: number;
  marks?: number;
  metadata?: object;
  isCanonical?: boolean;
  canonicalId?: string;
}

/**
 * Find subject by ID
 */
export async function findById(
  id: string,
  tx?: TransactionClient
): Promise<Subject | null> {
  const client = tx || prisma;
  return client.subject.findUnique({
    where: { id },
  });
}

/**
 * Find by semester, source and external ID
 */
export async function findByExternalId(
  semesterId: string,
  sourceId: string,
  externalId: string,
  tx?: TransactionClient
): Promise<Subject | null> {
  const client = tx || prisma;
  return client.subject.findUnique({
    where: {
      semesterId_sourceId_externalId: { semesterId, sourceId, externalId },
    },
  });
}

/**
 * Find subjects by semester ID
 */
export async function findBySemesterId(
  semesterId: string,
  tx?: TransactionClient
): Promise<Subject[]> {
  const client = tx || prisma;
  return client.subject.findMany({
    where: {
      semesterId,
      isCanonical: true,
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Search subjects by name within a semester
 */
export async function searchByName(
  semesterId: string,
  query: string,
  limit: number = 20,
  tx?: TransactionClient
): Promise<Subject[]> {
  const client = tx || prisma;
  const normalizedQuery = query.toLowerCase().trim();
  
  return client.subject.findMany({
    where: {
      semesterId,
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
 * Create subject
 */
export async function create(
  data: CreateSubjectData,
  tx?: TransactionClient
): Promise<Subject> {
  const client = tx || prisma;
  return client.subject.create({
    data,
  });
}

/**
 * Upsert subject
 */
export async function upsert(
  data: CreateSubjectData,
  tx?: TransactionClient
): Promise<Subject> {
  const client = tx || prisma;
  return client.subject.upsert({
    where: {
      semesterId_sourceId_externalId: {
        semesterId: data.semesterId,
        sourceId: data.sourceId,
        externalId: data.externalId,
      },
    },
    create: data,
    update: {
      name: data.name,
      normalizedName: data.normalizedName,
      code: data.code,
      credits: data.credits,
      marks: data.marks,
      metadata: data.metadata,
    },
  });
}

/**
 * Bulk create subjects for a semester
 */
export async function createMany(
  semesterId: string,
  sourceId: string,
  subjects: Array<CreateSubjectData>,
  tx?: TransactionClient
): Promise<number> {
  const client = tx || prisma;
  const result = await client.subject.createMany({
    data: subjects.map((s) => ({
      semesterId,
      sourceId,
      externalId: s.externalId,
      name: s.name,
      normalizedName: s.normalizedName,
      code: s.code,
      credits: s.credits,
      marks: s.marks,
      metadata: s.metadata,
    })),
    skipDuplicates: true,
  });
  return result.count;
}

/**
 * Find subjects by IDs
 */
export async function findByIds(
  ids: string[],
  tx?: TransactionClient
): Promise<Subject[]> {
  const client = tx || prisma;
  return client.subject.findMany({
    where: {
      id: { in: ids },
    },
  });
}
