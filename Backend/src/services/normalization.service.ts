/**
 * Normalization Service
 * 
 * Business logic for normalizing and deduplicating academic content.
 * Handles canonical record creation and duplicate mapping.
 */

import {
  normalizeUniversityName,
  normalizeCourseName,
  normalizeSubjectName,
  normalizeSearchQuery,
  areSimilar,
} from '../utils/normalization';
import {
  universityRepo,
  courseRepo,
  semesterRepo,
  subjectRepo,
  externalSourceRepo,
  withTransaction,
} from '../repositories';
import type { TransactionClient } from '../repositories/base.repo';

// ============================================================================
// UNIVERSITY NORMALIZATION
// ============================================================================

export interface NormalizedUniversity {
  id: string;
  externalId: string;
  sourceId: string;
  name: string;
  normalizedName: string;
  country?: string;
  type?: string;
  isCanonical: boolean;
  canonicalId?: string;
}

/**
 * Normalize and store a university
 * - Checks for existing canonical record
 * - If found, maps as duplicate
 * - If not, creates as new canonical
 */
export async function normalizeAndStoreUniversity(
  externalId: string,
  sourceName: string,
  name: string,
  country?: string,
  type?: string,
  tx?: TransactionClient
): Promise<NormalizedUniversity> {
  const normalizedName = normalizeUniversityName(name);

  // Get or create source
  const source = await externalSourceRepo.findOrCreate(sourceName, undefined, tx);

  // Check if already exists for this source
  const existing = await universityRepo.findByExternalId(source.id, externalId, tx);
  if (existing) {
    return existing as NormalizedUniversity;
  }

  // Check for canonical by normalized name
  const canonical = await universityRepo.findCanonicalByNormalizedName(normalizedName, tx);

  if (canonical) {
    // Create as duplicate mapped to canonical
    const university = await universityRepo.create({
      externalId,
      sourceId: source.id,
      name,
      normalizedName,
      country,
      type,
      isCanonical: false,
      canonicalId: canonical.id,
    }, tx);
    return university as NormalizedUniversity;
  }

  // Create as new canonical
  const university = await universityRepo.create({
    externalId,
    sourceId: source.id,
    name,
    normalizedName,
    country,
    type,
    isCanonical: true,
  }, tx);
  return university as NormalizedUniversity;
}

// ============================================================================
// COURSE NORMALIZATION
// ============================================================================

export interface NormalizedCourse {
  id: string;
  externalId: string;
  sourceId: string;
  universityId: string;
  name: string;
  normalizedName: string;
  description?: string;
  duration?: string;
  totalSemesters: number;
  isCanonical: boolean;
  canonicalId?: string;
}

/**
 * Normalize and store a course
 */
export async function normalizeAndStoreCourse(
  externalId: string,
  sourceName: string,
  universityId: string,
  name: string,
  description?: string,
  duration?: string,
  totalSemesters?: number,
  tx?: TransactionClient
): Promise<NormalizedCourse> {
  const normalizedName = normalizeCourseName(name);
  const source = await externalSourceRepo.findOrCreate(sourceName, undefined, tx);

  // Check if already exists
  const existing = await courseRepo.findByExternalId(source.id, externalId, tx);
  if (existing) {
    return existing as NormalizedCourse;
  }

  // For courses, we create as canonical (within a university, duplicates are less common)
  const course = await courseRepo.create({
    externalId,
    sourceId: source.id,
    universityId,
    name,
    normalizedName,
    description,
    duration,
    totalSemesters: totalSemesters || 8,
    isCanonical: true,
  }, tx);
  return course as NormalizedCourse;
}

// ============================================================================
// SEMESTER NORMALIZATION
// ============================================================================

/**
 * Normalize and store a semester
 */
export async function normalizeAndStoreSemester(
  externalId: string,
  sourceName: string,
  courseId: string,
  name: string,
  number: number,
  tx?: TransactionClient
): Promise<{ id: string; externalId: string; sourceId: string; courseId: string; name: string; number: number }> {
  const source = await externalSourceRepo.findOrCreate(sourceName, undefined, tx);

  const semester = await semesterRepo.upsert({
    externalId,
    sourceId: source.id,
    courseId,
    name,
    number,
    position: number - 1,
  }, tx);

  return semester;
}

// ============================================================================
// SUBJECT NORMALIZATION
// ============================================================================

export interface NormalizedSubject {
  id: string;
  externalId: string;
  sourceId: string;
  semesterId: string;
  name: string;
  normalizedName: string;
  code?: string;
  credits: number;
  marks: number;
  isCanonical: boolean;
}

/**
 * Normalize and store a subject
 */
export async function normalizeAndStoreSubject(
  externalId: string,
  sourceName: string,
  semesterId: string,
  name: string,
  code?: string,
  credits?: number,
  marks?: number,
  metadata?: object,
  tx?: TransactionClient
): Promise<NormalizedSubject> {
  const normalizedName = normalizeSubjectName(name);
  const source = await externalSourceRepo.findOrCreate(sourceName, undefined, tx);

  const subject = await subjectRepo.upsert({
    externalId,
    sourceId: source.id,
    semesterId,
    name,
    normalizedName,
    code,
    credits: credits || 0,
    marks: marks || 100,
    metadata,
    isCanonical: true,
  }, tx);

  return subject as NormalizedSubject;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk normalize and store academic hierarchy
 * Uses transaction to ensure integrity
 */
export async function normalizeAndStoreHierarchy(
  sourceName: string,
  university: {
    externalId: string;
    name: string;
    country?: string;
    type?: string;
  },
  courses: Array<{
    externalId: string;
    name: string;
    duration?: string;
    totalSemesters?: number;
    semesters: Array<{
      externalId: string;
      name: string;
      number: number;
      subjects: Array<{
        externalId: string;
        name: string;
        code?: string;
        credits?: number;
        marks?: number;
      }>;
    }>;
  }>
): Promise<{ universityId: string; coursesCreated: number; subjectsCreated: number }> {
  return withTransaction(async (tx) => {
    // Create university
    const normalizedUniversity = await normalizeAndStoreUniversity(
      university.externalId,
      sourceName,
      university.name,
      university.country,
      university.type,
      tx
    );

    let coursesCreated = 0;
    let subjectsCreated = 0;

    // Create courses, semesters, subjects
    for (const course of courses) {
      const normalizedCourse = await normalizeAndStoreCourse(
        course.externalId,
        sourceName,
        normalizedUniversity.id,
        course.name,
        undefined,
        course.duration,
        course.totalSemesters,
        tx
      );
      coursesCreated++;

      for (const semester of course.semesters) {
        const normalizedSemester = await normalizeAndStoreSemester(
          semester.externalId,
          sourceName,
          normalizedCourse.id,
          semester.name,
          semester.number,
          tx
        );

        for (const subject of semester.subjects) {
          await normalizeAndStoreSubject(
            subject.externalId,
            sourceName,
            normalizedSemester.id,
            subject.name,
            subject.code,
            subject.credits,
            subject.marks,
            undefined,
            tx
          );
          subjectsCreated++;
        }
      }
    }

    return {
      universityId: normalizedUniversity.id,
      coursesCreated,
      subjectsCreated,
    };
  });
}

/**
 * Normalize a search query
 */
export { normalizeSearchQuery };
