import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingsChangeLog extends Document {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  changes: {
    section: string;
    field: string;
    oldValue: unknown;
    newValue: unknown;
    impact: string[];
  }[];
  previousVersion: number;
  newVersion: number;
  createdAt: Date;
}

const SettingsChangeLogSchema = new Schema<ISettingsChangeLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    changes: [
      {
        section: String,
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        impact: [String],
      },
    ],
    previousVersion: {
      type: Number,
      required: true,
    },
    newVersion: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for retrieving change history
SettingsChangeLogSchema.index({ clerkId: 1, createdAt: -1 });

export const SettingsChangeLog = mongoose.model<ISettingsChangeLog>(
  'SettingsChangeLog',
  SettingsChangeLogSchema
);
