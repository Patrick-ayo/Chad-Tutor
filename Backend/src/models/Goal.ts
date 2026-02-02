import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  clerkId: string;
  name: string;
  description?: string;
  deadline: Date;
  totalTasks: number;
  completedTasks: number;
  status: 'active' | 'completed' | 'abandoned';
  roadmap: {
    topics: {
      id: string;
      name: string;
      order: number;
      status: 'not-started' | 'in-progress' | 'completed';
      estimatedMinutes: number;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
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
    name: {
      type: String,
      required: true,
    },
    description: String,
    deadline: {
      type: Date,
      required: true,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    roadmap: {
      topics: [
        {
          id: String,
          name: String,
          order: Number,
          status: {
            type: String,
            enum: ['not-started', 'in-progress', 'completed'],
            default: 'not-started',
          },
          estimatedMinutes: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding active goals quickly
GoalSchema.index({ clerkId: 1, status: 1 });

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
