import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  availability: {
    activeDays: string[];
    minutesPerDay: Map<string, number>;
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

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    availability: {
      activeDays: {
        type: [String],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      },
      minutesPerDay: {
        type: Map,
        of: Number,
        default: {
          monday: 60,
          tuesday: 60,
          wednesday: 60,
          thursday: 60,
          friday: 60,
          saturday: 0,
          sunday: 0,
        },
      },
      preferredSessionLength: {
        type: Number,
        default: 25,
      },
      maxSessionsPerDay: {
        type: Number,
        default: 3,
      },
    },
    behavior: {
      intensity: {
        type: String,
        enum: ['light', 'normal', 'aggressive'],
        default: 'normal',
      },
      reschedulePolicy: {
        type: String,
        enum: ['auto', 'manual', 'ask'],
        default: 'ask',
      },
      autoSkipCompleted: {
        type: Boolean,
        default: true,
      },
      showEstimatesInMinutes: {
        type: Boolean,
        default: true,
      },
    },
    notifications: {
      dailyReminder: {
        type: Boolean,
        default: true,
      },
      dailyReminderTime: {
        type: String,
        default: '09:00',
      },
      missedTaskAlert: {
        type: Boolean,
        default: true,
      },
      weeklyProgressReport: {
        type: Boolean,
        default: true,
      },
      burnoutWarnings: {
        type: Boolean,
        default: true,
      },
    },
    ai: {
      aiExplanationsEnabled: {
        type: Boolean,
        default: true,
      },
      aiHintsEnabled: {
        type: Boolean,
        default: true,
      },
      aiDifficultyAdjustment: {
        type: Boolean,
        default: true,
      },
      shareDataForImprovement: {
        type: Boolean,
        default: false,
      },
    },
    privacy: {
      lastExportDate: Date,
      dataRetentionDays: {
        type: Number,
        default: 90,
      },
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const UserSettings = mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);
