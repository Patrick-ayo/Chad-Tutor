/**
 * Exam Service
 * 
 * Business logic for academic content (universities, courses, semesters, subjects).
 * Implements cache-first logic with proper normalization and deduplication.
 * 
 * Flow:
 * 1. Check cache (L1 → L2)
 * 2. If miss, fetch from external API
 * 3. Normalize and store in DB
 * 4. Update cache
 * 5. Return results
 */

import { examApiClient } from '../external';
import * as cacheService from './cache.service';
import * as normalizationService from './normalization.service';
import {
  universityRepo,
  courseRepo,
  semesterRepo,
  subjectRepo,
  searchLogRepo,
} from '../repositories';
import { normalizeSearchQuery } from '../utils/normalization';

const SOURCE_NAME = 'ExamDB'; // Default source name for external API

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface UniversityResult {
  id: string;
  name: string;
  country?: string | null;
  type?: string | null;
}

export interface CourseResult {
  id: string;
  name: string;
  description?: string | null;
  duration?: string | null;
  totalSemesters: number;
}

export interface SemesterResult {
  id: string;
  name: string;
  number: number;
}

export interface SubjectResult {
  id: string;
  name: string;
  code?: string | null;
  credits: number;
  marks: number;
}

// ============================================================================
// UNIVERSITY SEARCH
// ============================================================================

/**
 * Search universities with cache-first logic
 */
export async function searchUniversities(
  query: string,
  userId?: string
): Promise<{ universities: UniversityResult[]; cacheHit: boolean; latencyMs: number }> {
  const startTime = Date.now();
  const normalizedQuery = normalizeSearchQuery(query);

  // Try cache first
  const cached = await cacheService.getCachedSearch(normalizedQuery, 'university');
  
  if (cached) {
    // Get universities by IDs
    const universities = await getUniversitiesByIds(cached.resultIds);
    const latencyMs = Date.now() - startTime;

    // Log search
    await logSearch(userId, query, normalizedQuery, 'university', true, universities.length, latencyMs);

    return { universities, cacheHit: true, latencyMs };
  }

  // Cache miss - fetch from API
  const apiResults = await examApiClient.searchUniversities(query);

  // Normalize and store
  const universities: UniversityResult[] = [];
  for (const apiUni of apiResults) {
    const normalized = await normalizationService.normalizeAndStoreUniversity(
      apiUni.id,
      SOURCE_NAME,
      apiUni.name,
      apiUni.country,
      apiUni.type
    );
    universities.push({
      id: normalized.id,
      name: normalized.name,
      country: normalized.country,
      type: normalized.type,
    });
  }

  // Update cache
  await cacheService.setCachedSearch(
    normalizedQuery,
    'university',
    universities.map((u) => u.id)
  );

  const latencyMs = Date.now() - startTime;

  // Log search
  await logSearch(userId, query, normalizedQuery, 'university', false, universities.length, latencyMs);

  return { universities, cacheHit: false, latencyMs };
}

/**
 * Get universities by IDs
 */
async function getUniversitiesByIds(ids: string[]): Promise<UniversityResult[]> {
  const results: UniversityResult[] = [];
  for (const id of ids) {
    const uni = await universityRepo.findById(id);
    if (uni) {
      results.push({
        id: uni.id,
        name: uni.name,
        country: uni.country,
        type: uni.type,
      });
    }
  }
  return results;
}

// ============================================================================
// COURSE RETRIEVAL
// ============================================================================

/**
 * Get courses for a university
 */
export async function getCourses(
  universityId: string,
  userId?: string
): Promise<{ courses: CourseResult[]; cacheHit: boolean; latencyMs: number }> {
  const startTime = Date.now();
  const cacheKey = `uni:${universityId}`;

  // Try cache first
  const cached = await cacheService.getCachedSearch(cacheKey, 'course');

  if (cached) {
    const courses = await getCoursesByIds(cached.resultIds);
    const latencyMs = Date.now() - startTime;
    await logSearch(userId, cacheKey, cacheKey, 'course', true, courses.length, latencyMs);
    return { courses, cacheHit: true, latencyMs };
  }

  // Check if we have courses in DB for this university
  let courses = await courseRepo.findByUniversityId(universityId);

  if (courses.length === 0) {
    // Fetch from API - need to get university external ID first
    const university = await universityRepo.findById(universityId);
    if (!university) {
      throw new Error('University not found');
    }

    const apiCourses = await examApiClient.getCourses(university.externalId);

    // Normalize and store
    for (const apiCourse of apiCourses) {
      const normalized = await normalizationService.normalizeAndStoreCourse(
        apiCourse.id,
        SOURCE_NAME,
        universityId,
        apiCourse.name,
        apiCourse.description,
        apiCourse.duration,
        apiCourse.totalSemesters
      );
      courses.push(normalized as typeof courses[0]);
    }
  }

  const result: CourseResult[] = courses.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    duration: c.duration,
    totalSemesters: c.totalSemesters,
  }));

  // Update cache
  await cacheService.setCachedSearch(cacheKey, 'course', result.map((c) => c.id));

  const latencyMs = Date.now() - startTime;
  await logSearch(userId, cacheKey, cacheKey, 'course', false, result.length, latencyMs);

  return { courses: result, cacheHit: false, latencyMs };
}

/**
 * Get courses by IDs
 */
async function getCoursesByIds(ids: string[]): Promise<CourseResult[]> {
  const results: CourseResult[] = [];
  for (const id of ids) {
    const course = await courseRepo.findById(id);
    if (course) {
      results.push({
        id: course.id,
        name: course.name,
        description: course.description,
        duration: course.duration,
        totalSemesters: course.totalSemesters,
      });
    }
  }
  return results;
}

// ============================================================================
// SEMESTER RETRIEVAL
// ============================================================================

/**
 * Get semesters for a course
 */
export async function getSemesters(
  universityId: string,
  courseId: string,
  userId?: string
): Promise<{ semesters: SemesterResult[]; cacheHit: boolean; latencyMs: number }> {
  const startTime = Date.now();
  const cacheKey = `course:${courseId}`;

  // Try cache first
  const cached = await cacheService.getCachedSearch(cacheKey, 'semester');

  if (cached) {
    const semesters = await getSemestersByIds(cached.resultIds);
    const latencyMs = Date.now() - startTime;
    await logSearch(userId, cacheKey, cacheKey, 'semester', true, semesters.length, latencyMs);
    return { semesters, cacheHit: true, latencyMs };
  }

  // Check DB
  let semesters = await semesterRepo.findByCourseId(courseId);

  if (semesters.length === 0) {
    // Fetch from API
    const university = await universityRepo.findById(universityId);
    const course = await courseRepo.findById(courseId);

    if (!university || !course) {
      throw new Error('University or course not found');
    }

    const apiSemesters = await examApiClient.getSemesters(university.externalId, course.externalId);

    // Normalize and store
    for (const apiSem of apiSemesters) {
      const normalized = await normalizationService.normalizeAndStoreSemester(
        apiSem.id,
        SOURCE_NAME,
        courseId,
        apiSem.name,
        apiSem.number
      );
      semesters.push(normalized as typeof semesters[0]);
    }
  }

  const result: SemesterResult[] = semesters.map((s) => ({
    id: s.id,
    name: s.name,
    number: s.number,
  }));

  // Update cache
  await cacheService.setCachedSearch(cacheKey, 'semester', result.map((s) => s.id));

  const latencyMs = Date.now() - startTime;
  await logSearch(userId, cacheKey, cacheKey, 'semester', false, result.length, latencyMs);

  return { semesters: result, cacheHit: false, latencyMs };
}

/**
 * Get semesters by IDs
 */
async function getSemestersByIds(ids: string[]): Promise<SemesterResult[]> {
  const results: SemesterResult[] = [];
  for (const id of ids) {
    const semester = await semesterRepo.findById(id);
    if (semester) {
      results.push({
        id: semester.id,
        name: semester.name,
        number: semester.number,
      });
    }
  }
  return results;
}

// ============================================================================
// SUBJECT RETRIEVAL
// ============================================================================

/**
 * Get subjects for a semester
 */
export async function getSubjects(
  universityId: string,
  courseId: string,
  semesterId: string,
  userId?: string
): Promise<{ subjects: SubjectResult[]; cacheHit: boolean; latencyMs: number }> {
  const startTime = Date.now();
  const cacheKey = `semester:${semesterId}`;

  // Try cache first
  const cached = await cacheService.getCachedSearch(cacheKey, 'subject');

  if (cached) {
    const subjects = await getSubjectsByIds(cached.resultIds);
    const latencyMs = Date.now() - startTime;
    await logSearch(userId, cacheKey, cacheKey, 'subject', true, subjects.length, latencyMs);
    return { subjects, cacheHit: true, latencyMs };
  }

  // Check DB
  let subjects = await subjectRepo.findBySemesterId(semesterId);

  if (subjects.length === 0) {
    // Fetch from API
    const university = await universityRepo.findById(universityId);
    const course = await courseRepo.findById(courseId);
    const semester = await semesterRepo.findById(semesterId);

    if (!university || !course || !semester) {
      throw new Error('University, course, or semester not found');
    }

    const apiSubjects = await examApiClient.getSubjects(
      university.externalId,
      course.externalId,
      semester.externalId
    );

    // Normalize and store
    for (const apiSub of apiSubjects) {
      const normalized = await normalizationService.normalizeAndStoreSubject(
        apiSub.id,
        SOURCE_NAME,
        semesterId,
        apiSub.name,
        apiSub.code,
        apiSub.credits,
        apiSub.marks,
        apiSub.metadata
      );
      subjects.push(normalized as typeof subjects[0]);
    }
  }

  const result: SubjectResult[] = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    credits: s.credits,
    marks: s.marks,
  }));

  // Update cache
  await cacheService.setCachedSearch(cacheKey, 'subject', result.map((s) => s.id));

  const latencyMs = Date.now() - startTime;
  await logSearch(userId, cacheKey, cacheKey, 'subject', false, result.length, latencyMs);

  return { subjects: result, cacheHit: false, latencyMs };
}

/**
 * Get subjects by IDs
 */
async function getSubjectsByIds(ids: string[]): Promise<SubjectResult[]> {
  const results: SubjectResult[] = [];
  for (const id of ids) {
    const subject = await subjectRepo.findById(id);
    if (subject) {
      results.push({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        credits: subject.credits,
        marks: subject.marks,
      });
    }
  }
  return results;
}

// ============================================================================
// SEARCH LOGGING
// ============================================================================

/**
 * Log a search for analytics
 */
async function logSearch(
  userId: string | undefined,
  rawQuery: string,
  normalizedQuery: string,
  entityType: string,
  cacheHit: boolean,
  resultCount: number,
  latencyMs: number
): Promise<void> {
  try {
    await searchLogRepo.create({
      userId,
      rawQuery,
      normalizedQuery,
      entityType: entityType as any,
      cacheHit,
      resultCount,
      latencyMs,
    });
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Failed to log search:', error);
  }
}
