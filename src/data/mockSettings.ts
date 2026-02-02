import type { UserSettings } from "@/types/settings";

export const mockSettings: UserSettings = {
  profile: {
    id: "user-1",
    name: "Alex Chen",
    email: "alex.chen@example.com",
    createdAt: "2025-09-15T10:00:00Z",
    timezone: "America/New_York",
  },
  availability: {
    activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    minutesPerDay: {
      monday: 60,
      tuesday: 60,
      wednesday: 45,
      thursday: 60,
      friday: 45,
      saturday: 0,
      sunday: 0,
    },
    preferredSessionLength: 25,
    maxSessionsPerDay: 3,
  },
  behavior: {
    intensity: "normal",
    reschedulePolicy: "ask",
    autoSkipCompleted: true,
    showEstimatesInMinutes: true,
  },
  notifications: {
    dailyReminder: true,
    dailyReminderTime: "09:00",
    missedTaskAlert: true,
    weeklyProgressReport: true,
    burnoutWarnings: true,
  },
  ai: {
    aiExplanationsEnabled: true,
    aiHintsEnabled: true,
    aiDifficultyAdjustment: true,
    shareDataForImprovement: false,
  },
  accessibility: {
    theme: "system",
    textSize: "default",
    reduceMotion: false,
    focusModeAids: {
      extraWarningTime: false,
      largerTimerText: false,
      clearerViolationFeedback: true,
    },
  },
  privacy: {
    lastExportDate: "2025-12-01T14:30:00Z",
    dataRetentionDays: 90,
  },
  version: 3,
  lastModified: "2026-01-28T16:45:00Z",
};
