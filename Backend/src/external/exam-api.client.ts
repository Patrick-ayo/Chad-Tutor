/**
 * External Exam API Client
 * 
 * Centralized client for external exam/university API.
 * Handles:
 * - API key management
 * - Rate limiting
 * - Retries with exponential backoff
 * - Error handling
 * - Response normalization
 * 
 * NEVER call external APIs directly from routes or services.
 * Always go through this client.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import config from '../config';

// Types for API responses
export interface ExternalUniversity {
  id: string;
  name: string;
  country?: string;
  type?: string;
}

export interface ExternalCourse {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  totalSemesters?: number;
}

export interface ExternalSemester {
  id: string;
  name: string;
  number: number;
}

export interface ExternalSubject {
  id: string;
  name: string;
  code?: string;
  credits?: number;
  marks?: number;
  metadata?: Record<string, unknown>;
}

// Rate limiting state
interface RateLimitState {
  requestsThisHour: number;
  hourStarted: Date;
  maxRequestsPerHour: number;
}

const rateLimitState: RateLimitState = {
  requestsThisHour: 0,
  hourStarted: new Date(),
  maxRequestsPerHour: 100, // Default, can be overridden
};

/**
 * Check and update rate limit
 */
function checkRateLimit(): boolean {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Reset counter if hour has passed
  if (rateLimitState.hourStarted < hourAgo) {
    rateLimitState.requestsThisHour = 0;
    rateLimitState.hourStarted = now;
  }

  if (rateLimitState.requestsThisHour >= rateLimitState.maxRequestsPerHour) {
    return false;
  }

  rateLimitState.requestsThisHour++;
  return true;
}

/**
 * Sleep utility for retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create axios instance with defaults
 */
function createClient(): AxiosInstance {
  const baseURL = config.examApiEndpoint || 'https://api.example.com/v1';
  
  return axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.examApiKey}`,
    },
  });
}

const client = createClient();

/**
 * Make API request with retry logic
 */
async function makeRequest<T>(
  method: 'get' | 'post',
  endpoint: string,
  params?: Record<string, string>,
  maxRetries: number = 3
): Promise<T> {
  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.request<T>({
        method,
        url: endpoint,
        params,
      });
      return response.data;
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof AxiosError) {
        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }
      }

      // Exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(`API request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('API request failed after retries');
}

// ============================================================================
// PUBLIC API METHODS
// ============================================================================

/**
 * Search universities
 */
export async function searchUniversities(
  query: string
): Promise<ExternalUniversity[]> {
  // If no API key configured, return mock data
  if (!config.examApiKey || config.examApiKey === 'your-exam-api-key') {
    return getMockUniversities(query);
  }

  try {
    const data = await makeRequest<{ universities: ExternalUniversity[] }>(
      'get',
      '/universities',
      { search: query }
    );
    return data.universities || [];
  } catch (error) {
    console.error('Failed to fetch universities from API:', error);
    // Fallback to mock data on error
    return getMockUniversities(query);
  }
}

/**
 * Get courses for a university
 */
export async function getCourses(
  universityExternalId: string
): Promise<ExternalCourse[]> {
  if (!config.examApiKey || config.examApiKey === 'your-exam-api-key') {
    return getMockCourses();
  }

  try {
    const data = await makeRequest<{ courses: ExternalCourse[] }>(
      'get',
      '/courses',
      { university: universityExternalId }
    );
    return data.courses || [];
  } catch (error) {
    console.error('Failed to fetch courses from API:', error);
    return getMockCourses();
  }
}

/**
 * Get semesters for a course
 */
export async function getSemesters(
  universityExternalId: string,
  courseExternalId: string
): Promise<ExternalSemester[]> {
  if (!config.examApiKey || config.examApiKey === 'your-exam-api-key') {
    return getMockSemesters();
  }

  try {
    const data = await makeRequest<{ semesters: ExternalSemester[] }>(
      'get',
      '/semesters',
      { university: universityExternalId, course: courseExternalId }
    );
    return data.semesters || [];
  } catch (error) {
    console.error('Failed to fetch semesters from API:', error);
    return getMockSemesters();
  }
}

/**
 * Get subjects for a semester
 */
export async function getSubjects(
  universityExternalId: string,
  courseExternalId: string,
  semesterExternalId: string
): Promise<ExternalSubject[]> {
  if (!config.examApiKey || config.examApiKey === 'your-exam-api-key') {
    return getMockSubjects();
  }

  try {
    const data = await makeRequest<{ subjects: ExternalSubject[] }>(
      'get',
      '/subjects',
      {
        university: universityExternalId,
        course: courseExternalId,
        semester: semesterExternalId,
      }
    );
    return data.subjects || [];
  } catch (error) {
    console.error('Failed to fetch subjects from API:', error);
    return getMockSubjects();
  }
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(): {
  remaining: number;
  total: number;
  resetsAt: Date;
} {
  const resetsAt = new Date(rateLimitState.hourStarted);
  resetsAt.setHours(resetsAt.getHours() + 1);

  return {
    remaining: rateLimitState.maxRequestsPerHour - rateLimitState.requestsThisHour,
    total: rateLimitState.maxRequestsPerHour,
    resetsAt,
  };
}

// ============================================================================
// MOCK DATA (used when API key not configured or on API failure)
// ============================================================================

function getMockUniversities(query: string): ExternalUniversity[] {
  const universities: ExternalUniversity[] = [
    { id: 'uni-1', name: 'University of Delhi', type: 'Central University', country: 'India' },
    { id: 'uni-2', name: 'Mumbai University', type: 'State University', country: 'India' },
    { id: 'uni-3', name: 'Anna University', type: 'State University', country: 'India' },
    { id: 'uni-4', name: 'IIT Bombay', type: 'Institute of National Importance', country: 'India' },
    { id: 'uni-5', name: 'Bangalore University', type: 'State University', country: 'India' },
    { id: 'uni-6', name: 'Jawaharlal Nehru University', type: 'Central University', country: 'India' },
    { id: 'uni-7', name: 'IIT Delhi', type: 'Institute of National Importance', country: 'India' },
    { id: 'uni-8', name: 'BITS Pilani', type: 'Private University', country: 'India' },
  ];

  if (!query) return universities;
  
  const normalized = query.toLowerCase().trim();
  return universities.filter((u) => u.name.toLowerCase().includes(normalized));
}

function getMockCourses(): ExternalCourse[] {
  return [
    { id: 'course-1', name: 'B.Tech Computer Science', duration: '4 years', totalSemesters: 8 },
    { id: 'course-2', name: 'B.Tech Mechanical Engineering', duration: '4 years', totalSemesters: 8 },
    { id: 'course-3', name: 'MBA', duration: '2 years', totalSemesters: 4 },
    { id: 'course-4', name: 'B.Sc Physics', duration: '3 years', totalSemesters: 6 },
    { id: 'course-5', name: 'M.Tech Data Science', duration: '2 years', totalSemesters: 4 },
    { id: 'course-6', name: 'B.Com Honours', duration: '3 years', totalSemesters: 6 },
  ];
}

function getMockSemesters(): ExternalSemester[] {
  return [
    { id: 'sem-1', name: 'Semester 1', number: 1 },
    { id: 'sem-2', name: 'Semester 2', number: 2 },
    { id: 'sem-3', name: 'Semester 3', number: 3 },
    { id: 'sem-4', name: 'Semester 4', number: 4 },
    { id: 'sem-5', name: 'Semester 5', number: 5 },
    { id: 'sem-6', name: 'Semester 6', number: 6 },
    { id: 'sem-7', name: 'Semester 7', number: 7 },
    { id: 'sem-8', name: 'Semester 8', number: 8 },
  ];
}

function getMockSubjects(): ExternalSubject[] {
  return [
    { id: 'sub-1', name: 'Data Structures', code: 'CS201', credits: 4, marks: 100 },
    { id: 'sub-2', name: 'Algorithms', code: 'CS202', credits: 4, marks: 100 },
    { id: 'sub-3', name: 'Database Management', code: 'CS203', credits: 3, marks: 100 },
    { id: 'sub-4', name: 'Operating Systems', code: 'CS204', credits: 4, marks: 100 },
    { id: 'sub-5', name: 'Computer Networks', code: 'CS205', credits: 3, marks: 100 },
    { id: 'sub-6', name: 'Software Engineering', code: 'CS206', credits: 3, marks: 100 },
    { id: 'sub-7', name: 'Machine Learning', code: 'CS301', credits: 4, marks: 100 },
    { id: 'sub-8', name: 'Artificial Intelligence', code: 'CS302', credits: 4, marks: 100 },
  ];
}
