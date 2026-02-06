/**
 * Repository Layer Index
 * 
 * Exports all repositories for use by services.
 * This layer contains ONLY database queries - no business logic.
 */

// Base utilities
export * from './base.repo';

// User-related repositories
export * as userRepo from './user.repo';
export * as settingsRepo from './settings.repo';
export * as enforcementRepo from './enforcement.repo';
export * as goalRepo from './goal.repo';
export * as settingsChangeLogRepo from './settingsChangeLog.repo';

// Academic content repositories
export * as externalSourceRepo from './externalSource.repo';
export * as universityRepo from './university.repo';
export * as courseRepo from './course.repo';
export * as semesterRepo from './semester.repo';
export * as subjectRepo from './subject.repo';

// Caching and analytics repositories
export * as cacheRepo from './cache.repo';
export * as searchLogRepo from './searchLog.repo';
export * as contentRefreshRepo from './contentRefresh.repo';
export * as contentUsageRepo from './contentUsage.repo';
