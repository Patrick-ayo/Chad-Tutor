/**
 * Semester Repository
 * 
 * Data access layer for Semester model.
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma } from '@prisma/client';

export type Semester = Prisma.SemesterGetPayload<{}>;

export interface CreateSemesterData {
  externalId: string;
  sourceId: string;
  courseId: string;
  name: string;
  number: number;
  position?: number;
  isCanonical?: boolean;
  canonicalId?: string;
}

/**
 * Find semester by ID
 */
export async function findById(
  id: string,
  tx?: TransactionClient
): Promise<Semester | null> {
  const client = tx || prisma;
  return client.semester.findUnique({
    where: { id },
  });
}

/**
 * Find by course, source and external ID
 */
export async function findByExternalId(
  courseId: string,
  sourceId: string,
  externalId: string,
  tx?: TransactionClient
): Promise<Semester | null> {
  const client = tx || prisma;
  return client.semester.findUnique({
    where: {
      courseId_sourceId_externalId: { courseId, sourceId, externalId },
    },
  });
}

/**
 * Find semesters by course ID
 */
export async function findByCourseId(
  courseId: string,
  tx?: TransactionClient
): Promise<Semester[]> {
  const client = tx || prisma;
  return client.semester.findMany({
    where: {
      courseId,
      isCanonical: true,
    },
    orderBy: { number: 'asc' },
  });
}

/**
 * Create semester
 */
export async function create(
  data: CreateSemesterData,
  tx?: TransactionClient
): Promise<Semester> {
  const client = tx || prisma;
  return client.semester.create({
    data,
  });
}

/**
 * Upsert semester
 */
export async function upsert(
  data: CreateSemesterData,
  tx?: TransactionClient
): Promise<Semester> {
  const client = tx || prisma;
  return client.semester.upsert({
    where: {
      courseId_sourceId_externalId: {
        courseId: data.courseId,
        sourceId: data.sourceId,
        externalId: data.externalId,
      },
    },
    create: data,
    update: {
      name: data.name,
      number: data.number,
      position: data.position,
    },
  });
}

/**
 * Bulk create semesters for a course
 */
export async function createMany(
  courseId: string,
  sourceId: string,
  semesters: Array<{ externalId: string; name: string; number: number }>,
  tx?: TransactionClient
): Promise<number> {
  const client = tx || prisma;
  const result = await client.semester.createMany({
    data: semesters.map((s, index) => ({
      courseId,
      sourceId,
      externalId: s.externalId,
      name: s.name,
      number: s.number,
      position: index,
    })),
    skipDuplicates: true,
  });
  return result.count;
}
