import mongoose, { Schema, Document } from 'mongoose';

export interface IEnforcement extends Document {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  quizResetCount: number;
  lastResetDate?: Date;
  violations: {
    type: string;
    date: Date;
    details: string;
  }[];
  focusModeEligible: boolean;
  dailyResetCount: number;
  dailyResetDate: Date;
}

const EnforcementSchema = new Schema<IEnforcement>(
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
    quizResetCount: {
      type: Number,
      default: 0,
    },
    lastResetDate: Date,
    violations: [
      {
        type: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        details: String,
      },
    ],
    focusModeEligible: {
      type: Boolean,
      default: true,
    },
    dailyResetCount: {
      type: Number,
      default: 0,
    },
    dailyResetDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Reset daily counter if it's a new day
EnforcementSchema.methods.checkDailyReset = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastReset = new Date(this.dailyResetDate);
  lastReset.setHours(0, 0, 0, 0);
  
  if (today > lastReset) {
    this.dailyResetCount = 0;
    this.dailyResetDate = today;
  }
  
  return this;
};

export const Enforcement = mongoose.model<IEnforcement>('Enforcement', EnforcementSchema);
