/**
 * Course Repository
 * 
 * Data access layer for Course model.
 * Supports deduplication via canonical records.
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma } from '@prisma/client';

export type Course = Prisma.CourseGetPayload<{}>;

export interface CreateCourseData {
  externalId: string;
  sourceId: string;
  universityId: string;
  name: string;
  normalizedName: string;
  description?: string;
  duration?: string;
  totalSemesters?: number;
  isCanonical?: boolean;
  canonicalId?: string;
}

/**
 * Find course by ID
 */
export async function findById(
  id: string,
  tx?: TransactionClient
): Promise<Course | null> {
  const client = tx || prisma;
  return client.course.findUnique({
    where: { id },
  });
}

/**
 * Find by source and external ID
 */
export async function findByExternalId(
  sourceId: string,
  externalId: string,
  tx?: TransactionClient
): Promise<Course | null> {
  const client = tx || prisma;
  return client.course.findUnique({
    where: {
      sourceId_externalId: { sourceId, externalId },
    },
  });
}

/**
 * Find courses by university ID
 */
export async function findByUniversityId(
  universityId: string,
  tx?: TransactionClient
): Promise<Course[]> {
  const client = tx || prisma;
  return client.course.findMany({
    where: {
      universityId,
      isCanonical: true,
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Search courses by name within a university
 */
export async function searchByName(
  universityId: string,
  query: string,
  limit: number = 20,
  tx?: TransactionClient
): Promise<Course[]> {
  const client = tx || prisma;
  const normalizedQuery = query.toLowerCase().trim();
  
  return client.course.findMany({
    where: {
      universityId,
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
 * Create course
 */
export async function create(
  data: CreateCourseData,
  tx?: TransactionClient
): Promise<Course> {
  const client = tx || prisma;
  return client.course.create({
    data,
  });
}

/**
 * Upsert course
 */
export async function upsert(
  data: CreateCourseData,
  tx?: TransactionClient
): Promise<Course> {
  const client = tx || prisma;
  return client.course.upsert({
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
      description: data.description,
      duration: data.duration,
      totalSemesters: data.totalSemesters,
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
): Promise<Course> {
  const client = tx || prisma;
  return client.course.update({
    where: { id },
    data: {
      isCanonical: false,
      canonicalId,
    },
  });
}
