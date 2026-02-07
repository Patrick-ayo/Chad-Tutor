/**
 * User Service (Simplified)
 * 
 * Business logic for user management.
 */

import { userRepo, settingsRepo, enforcementRepo } from '../repositories';

// ============================================================================
// USER OPERATIONS
// ============================================================================

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  timezone: string;
  createdAt: Date;
}

/**
 * Get or create user from Clerk authentication
 */
export async function getOrCreateUser(
  clerkId: string,
  email: string,
  name: string,
  timezone?: string
): Promise<UserProfile> {
  let user = await userRepo.findByClerkId(clerkId);

  if (!user) {
    user = await userRepo.create({
      clerkId,
      email,
      name,
      timezone,
    });
  }

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    timezone: user.timezone,
    createdAt: user.createdAt,
  };
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: { name?: string; timezone?: string }
): Promise<UserProfile> {
  const user = await userRepo.update(userId, updates);

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    timezone: user.timezone,
    createdAt: user.createdAt,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  const user = await userRepo.findById(userId);
  if (!user) return null;

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    timezone: user.timezone,
    createdAt: user.createdAt,
  };
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<UserProfile | null> {
  const user = await userRepo.findByClerkId(clerkId);
  if (!user) return null;

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    timezone: user.timezone,
    createdAt: user.createdAt,
  };
}

// ============================================================================
// SETTINGS OPERATIONS
// ============================================================================

export interface UserSettingsData {
  enforcementLevel: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyReminder: boolean;
  sessionDuration: number;
  breakFrequency: number;
}

const DEFAULT_SETTINGS: UserSettingsData = {
  enforcementLevel: 'normal',
  emailNotifications: true,
  pushNotifications: true,
  dailyReminder: true,
  sessionDuration: 25,
  breakFrequency: 3,
};

/**
 * Get user settings
 */
export async function getUserSettings(userId: string): Promise<UserSettingsData> {
  const user = await userRepo.findById(userId);
  if (!user) {
    return DEFAULT_SETTINGS;
  }

  const settings = await settingsRepo.findByUserId(userId);
  if (!settings) {
    return DEFAULT_SETTINGS;
  }

  return {
    enforcementLevel: settings.enforcementLevel,
    emailNotifications: settings.emailNotifications,
    pushNotifications: settings.pushNotifications,
    dailyReminder: settings.dailyReminder,
    sessionDuration: settings.sessionDuration,
    breakFrequency: settings.breakFrequency,
  };
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  updates: Partial<UserSettingsData>,
  _changedBy: string,
  _reason?: string
): Promise<UserSettingsData> {
  const settings = await settingsRepo.findByUserId(userId);
  
  if (!settings) {
    return { ...DEFAULT_SETTINGS, ...updates };
  }

  // Return merged settings (actual update would be implemented with settingsRepo.update)
  return {
    enforcementLevel: updates.enforcementLevel ?? settings.enforcementLevel,
    emailNotifications: updates.emailNotifications ?? settings.emailNotifications,
    pushNotifications: updates.pushNotifications ?? settings.pushNotifications,
    dailyReminder: updates.dailyReminder ?? settings.dailyReminder,
    sessionDuration: updates.sessionDuration ?? settings.sessionDuration,
    breakFrequency: updates.breakFrequency ?? settings.breakFrequency,
  };
}

/**
 * Get settings change history
 */
export async function getSettingsChangeHistory(
  _userId: string,
  _limit = 50
): Promise<Array<{
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  reason?: string | null;
  createdAt: Date;
}>> {
  // Stub - would use settingsChangeLogRepo when methods are implemented
  return [];
}

// ============================================================================
// ENFORCEMENT OPERATIONS
// ============================================================================

export interface EnforcementData {
  violationCount: number;
  isOnProbation: boolean;
  lastViolation?: Date | null;
}

/**
 * Get enforcement state for a user
 */
export async function getEnforcementState(userId: string): Promise<EnforcementData> {
  const enforcement = await enforcementRepo.findByUserId(userId);

  if (!enforcement) {
    return {
      violationCount: 0,
      isOnProbation: false,
      lastViolation: null,
    };
  }

  return {
    violationCount: enforcement.violationCount,
    isOnProbation: enforcement.isOnProbation,
    lastViolation: enforcement.lastViolation,
  };
}

/**
 * Start a study session (stub)
 */
export async function startStudySession(_userId: string): Promise<EnforcementData> {
  return {
    violationCount: 0,
    isOnProbation: false,
    lastViolation: null,
  };
}

/**
 * Start a break (stub)
 */
export async function startBreak(_userId: string): Promise<EnforcementData> {
  return {
    violationCount: 0,
    isOnProbation: false,
    lastViolation: null,
  };
}

/**
 * End break (stub)
 */
export async function endBreak(_userId: string): Promise<EnforcementData> {
  return {
    violationCount: 0,
    isOnProbation: false,
    lastViolation: null,
  };
}

/**
 * Reset daily counters (for daily job)
 */
export async function resetDailyCounters(_userId: string): Promise<void> {
  // Stub - would reset session counters
}

/**
 * Get all user IDs (for admin/jobs)
 */
export async function getAllUserIds(limit = 1000): Promise<string[]> {
  const users = await userRepo.findMany(limit);
  return users.map((u) => u.id);
}
