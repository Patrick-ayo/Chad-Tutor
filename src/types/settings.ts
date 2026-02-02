// Settings Types - Boring, predictable, never surprising

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type SessionLength = 15 | 25 | 45 | 60 | 90;

export type WorkloadIntensity = "light" | "normal" | "aggressive";

export type ReschedulePolicy = "auto" | "manual" | "ask";

export type Theme = "light" | "dark" | "system";

export type TextSize = "small" | "default" | "large";

// Profile (read-only display)
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  timezone: string;
}

// Availability settings
export interface AvailabilitySettings {
  activeDays: DayOfWeek[];
  minutesPerDay: Record<DayOfWeek, number>;
  preferredSessionLength: SessionLength;
  maxSessionsPerDay: number;
}

// Behavior settings
export interface BehaviorSettings {
  intensity: WorkloadIntensity;
  reschedulePolicy: ReschedulePolicy;
  autoSkipCompleted: boolean;
  showEstimatesInMinutes: boolean;
}

// Notification settings
export interface NotificationSettings {
  dailyReminder: boolean;
  dailyReminderTime: string; // "HH:MM" format
  missedTaskAlert: boolean;
  weeklyProgressReport: boolean;
  burnoutWarnings: boolean;
}

// AI settings
export interface AISettings {
  aiExplanationsEnabled: boolean;
  aiHintsEnabled: boolean;
  aiDifficultyAdjustment: boolean;
  shareDataForImprovement: boolean;
}

// Accessibility settings
export interface AccessibilitySettings {
  theme: Theme;
  textSize: TextSize;
  reduceMotion: boolean;
  focusModeAids: {
    extraWarningTime: boolean;
    largerTimerText: boolean;
    clearerViolationFeedback: boolean;
  };
}

// Privacy settings (actions, not stored state)
export interface PrivacyActions {
  lastExportDate?: string;
  dataRetentionDays: number;
}

// Combined settings
export interface UserSettings {
  profile: UserProfile;
  availability: AvailabilitySettings;
  behavior: BehaviorSettings;
  notifications: NotificationSettings;
  ai: AISettings;
  accessibility: AccessibilitySettings;
  privacy: PrivacyActions;
  version: number;
  lastModified: string;
}

// Settings change impact types
export type SettingImpact = "roadmap" | "schedule" | "analytics" | "none";

export interface SettingChangeRequest {
  section: keyof Omit<UserSettings, "profile" | "version" | "lastModified">;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  impact: SettingImpact[];
}

// Settings change log (for versioning)
export interface SettingsChangeLog {
  id: string;
  timestamp: string;
  changes: SettingChangeRequest[];
  previousVersion: number;
  newVersion: number;
}
