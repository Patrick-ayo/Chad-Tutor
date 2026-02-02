import mongoose, { Schema, Document } from 'mongoose';
import type { UserRole } from '../types/user';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  timezone: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    roles: {
      type: [String],
      default: ['learner'],
      enum: ['learner', 'admin'],
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
