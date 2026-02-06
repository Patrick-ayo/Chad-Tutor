/**
 * Exam Routes
 * 
 * API endpoints for academic content (universities, courses, semesters, subjects).
 * Uses the exam service for cache-first data retrieval with normalization.
 */

import { Router, Request, Response } from 'express';
import { examService } from '../services';
import { optionalAuth } from '../middleware';

const router = Router();

/**
 * GET /api/exam/universities?search=NAME
 * Search universities by name
 */
router.get('/universities', optionalAuth, async (req: Request, res: Response) => {
  const { search } = req.query;

  if (!search || typeof search !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Search query is required',
    });
  }

  try {
    const userId = req.auth?.userId;
    const result = await examService.searchUniversities(search, userId);

    return res.json({
      universities: result.universities,
      meta: {
        cacheHit: result.cacheHit,
        latencyMs: result.latencyMs,
      },
    });
  } catch (error) {
    console.error('University search error:', error);
    return res.status(500).json({
      error: 'Search Failed',
      message: 'Failed to search universities',
    });
  }
});

/**
 * GET /api/exam/courses?university=ID
 * Get courses for a university
 */
router.get('/courses', optionalAuth, async (req: Request, res: Response) => {
  const { university } = req.query;

  if (!university || typeof university !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'University ID is required',
    });
  }

  try {
    const userId = req.auth?.userId;
    const result = await examService.getCourses(university, userId);

    return res.json({
      courses: result.courses,
      meta: {
        cacheHit: result.cacheHit,
        latencyMs: result.latencyMs,
      },
    });
  } catch (error) {
    console.error('Courses fetch error:', error);
    return res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch courses',
    });
  }
});

/**
 * GET /api/exam/semesters?university=ID&course=ID
 * Get semesters for a course
 */
router.get('/semesters', optionalAuth, async (req: Request, res: Response) => {
  const { university, course } = req.query;

  if (!university || typeof university !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'University ID is required',
    });
  }

  if (!course || typeof course !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Course ID is required',
    });
  }

  try {
    const userId = req.auth?.userId;
    const result = await examService.getSemesters(university, course, userId);

    return res.json({
      semesters: result.semesters,
      meta: {
        cacheHit: result.cacheHit,
        latencyMs: result.latencyMs,
      },
    });
  } catch (error) {
    console.error('Semesters fetch error:', error);
    return res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch semesters',
    });
  }
});

/**
 * GET /api/exam/subjects?university=ID&course=ID&semester=ID
 * Get subjects for a semester
 */
router.get('/subjects', optionalAuth, async (req: Request, res: Response) => {
  const { university, course, semester } = req.query;

  if (!university || typeof university !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'University ID is required',
    });
  }

  if (!course || typeof course !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Course ID is required',
    });
  }

  if (!semester || typeof semester !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Semester ID is required',
    });
  }

  try {
    const userId = req.auth?.userId;
    const result = await examService.getSubjects(university, course, semester, userId);

    return res.json({
      subjects: result.subjects,
      meta: {
        cacheHit: result.cacheHit,
        latencyMs: result.latencyMs,
      },
    });
  } catch (error) {
    console.error('Subjects fetch error:', error);
    return res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch subjects',
    });
  }
});

export default router;
