// User roles - start simple, expand later
export type UserRole = 'learner' | 'admin';

// User profile stored in our DB (not Clerk)
export interface UserProfile {
  clerkId: string;
  email: string;
  name: string;
  timezone: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

// Settings stored in our DB
export interface UserSettings {
  userId: string;
  availability: {
    activeDays: string[];
    minutesPerDay: Record<string, number>;
    preferredSessionLength: number;
    maxSessionsPerDay: number;
  };
  behavior: {
    intensity: 'light' | 'normal' | 'aggressive';
    reschedulePolicy: 'auto' | 'manual' | 'ask';
    autoSkipCompleted: boolean;
    showEstimatesInMinutes: boolean;
  };
  notifications: {
    dailyReminder: boolean;
    dailyReminderTime: string;
    missedTaskAlert: boolean;
    weeklyProgressReport: boolean;
    burnoutWarnings: boolean;
  };
  ai: {
    aiExplanationsEnabled: boolean;
    aiHintsEnabled: boolean;
    aiDifficultyAdjustment: boolean;
    shareDataForImprovement: boolean;
  };
  privacy: {
    lastExportDate?: Date;
    dataRetentionDays: number;
  };
  version: number;
  updatedAt: Date;
}

// Enforcement tracking
export interface EnforcementState {
  userId: string;
  quizResetCount: number;
  lastResetDate?: Date;
  violations: {
    type: string;
    date: Date;
    details: string;
  }[];
  focusModeEligible: boolean;
}

// Bootstrap response - first contact with system after login
export interface BootstrapResponse {
  isNewUser: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    roles: UserRole[];
  } | null;
  activeGoal: {
    id: string;
    name: string;
    progress: number;
  } | null;
  enforcement: {
    focusModeEligible: boolean;
    resetCountToday: number;
    maxResetsPerDay: number;
  };
  onboardingRequired: boolean;
  redirectTo: 'dashboard' | 'goal-builder' | 'onboarding';
}

// Session tracking for enforcement
export interface SessionInfo {
  sessionId: string;
  userId: string;
  deviceFingerprint?: string;
  startedAt: Date;
  lastActivityAt: Date;
}
