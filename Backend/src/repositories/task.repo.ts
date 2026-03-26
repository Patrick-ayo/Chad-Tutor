/**
 * Study Task Repository
 *
 * Data access layer for StudyTask model.
 */

import { prisma, TransactionClient } from "./base.repo";
import type { Prisma, TaskPriority, TaskStatus } from "@prisma/client";

export type StudyTask = Prisma.StudyTaskGetPayload<{
  include: {
    skill: true;
    goal: true;
    playlistItem: true;
  };
}>;

export interface CreateStudyTaskData {
  userId: string;
  skillId?: string;
  goalId?: string;
  playlistId?: string;
  playlistItemId?: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  scheduledTime?: string;
  estimatedMinutes?: number;
  priority?: TaskPriority;
  keyPoints?: Prisma.InputJsonValue;
  learningOutcomes?: Prisma.InputJsonValue;
}

export async function create(
  data: CreateStudyTaskData,
  tx?: TransactionClient,
): Promise<StudyTask> {
  const client = tx || prisma;
  return client.studyTask.create({
    data: {
      userId: data.userId,
      skillId: data.skillId,
      goalId: data.goalId,
      playlistId: data.playlistId,
      playlistItemId: data.playlistItemId,
      title: data.title,
      description: data.description,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      estimatedMinutes: data.estimatedMinutes ?? 25,
      priority: data.priority ?? "MEDIUM",
      ...(data.keyPoints !== undefined && { keyPoints: data.keyPoints }),
      ...(data.learningOutcomes !== undefined && {
        learningOutcomes: data.learningOutcomes,
      }),
    },
    include: {
      skill: true,
      goal: true,
      playlistItem: true,
    },
  });
}

export async function createMany(
  data: CreateStudyTaskData[],
  tx?: TransactionClient,
): Promise<number> {
  if (data.length === 0) {
    return 0;
  }

  const client = tx || prisma;
  const result = await client.studyTask.createMany({
    data: data.map((task) => ({
      userId: task.userId,
      skillId: task.skillId,
      goalId: task.goalId,
      playlistId: task.playlistId,
      playlistItemId: task.playlistItemId,
      title: task.title,
      description: task.description,
      scheduledDate: task.scheduledDate,
      scheduledTime: task.scheduledTime,
      estimatedMinutes: task.estimatedMinutes ?? 25,
      priority: task.priority ?? "MEDIUM",
      ...(task.keyPoints !== undefined && { keyPoints: task.keyPoints }),
      ...(task.learningOutcomes !== undefined && {
        learningOutcomes: task.learningOutcomes,
      }),
    })),
  });

  return result.count;
}

export async function findById(
  id: string,
  userId: string,
  tx?: TransactionClient,
): Promise<StudyTask | null> {
  const client = tx || prisma;
  return client.studyTask.findUnique({
    where: {
      id,
      userId,
    },
    include: {
      skill: true,
      goal: true,
      playlistItem: true,
    },
  });
}

export async function findByUserAndDateRange(
  userId: string,
  startDate: Date,
  endDate: Date,
  tx?: TransactionClient,
): Promise<StudyTask[]> {
  const client = tx || prisma;
  return client.studyTask.findMany({
    where: {
      userId,
      scheduledDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      skill: true,
      goal: true,
      playlistItem: true,
    },
    orderBy: [
      { scheduledDate: "asc" },
      { priority: "desc" },
      { createdAt: "asc" },
    ],
  });
}

export async function findMissedBeforeDate(
  userId: string,
  asOfDate: Date,
  tx?: TransactionClient,
): Promise<StudyTask[]> {
  const client = tx || prisma;
  return client.studyTask.findMany({
    where: {
      userId,
      scheduledDate: { lt: asOfDate },
      status: {
        in: ["SCHEDULED", "IN_PROGRESS"],
      },
    },
    include: {
      skill: true,
      goal: true,
      playlistItem: true,
    },
    orderBy: [{ priority: "desc" }, { scheduledDate: "asc" }],
  });
}

export async function updateStatus(
  id: string,
  userId: string,
  status: TaskStatus,
  extras?: {
    completedAt?: Date;
    completedDurationMinutes?: number;
    rescheduledReason?: string;
    originalScheduledDate?: Date;
    scheduledDate?: Date;
    rescheduleCountIncrement?: number;
  },
  tx?: TransactionClient,
): Promise<number> {
  const client = tx || prisma;
  const result = await client.studyTask.updateMany({
    where: { id, userId },
    data: {
      status,
      ...(extras?.completedAt && { completedAt: extras.completedAt }),
      ...(extras?.completedDurationMinutes !== undefined && {
        completedDurationMinutes: extras.completedDurationMinutes,
      }),
      ...(extras?.rescheduledReason && {
        rescheduledReason: extras.rescheduledReason,
      }),
      ...(extras?.originalScheduledDate && {
        originalScheduledDate: extras.originalScheduledDate,
      }),
      ...(extras?.scheduledDate && { scheduledDate: extras.scheduledDate }),
      ...(extras?.rescheduleCountIncrement && {
        rescheduleCount: { increment: extras.rescheduleCountIncrement },
      }),
    },
  });

  return result.count;
}

export async function getDailyScheduledMinutes(
  userId: string,
  date: Date,
  tx?: TransactionClient,
): Promise<number> {
  const client = tx || prisma;

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const tasks = await client.studyTask.findMany({
    where: {
      userId,
      scheduledDate: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        in: ["SCHEDULED", "IN_PROGRESS", "RESCHEDULED"],
      },
    },
    select: {
      estimatedMinutes: true,
    },
  });

  return tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
}

export async function updatePriority(
  id: string,
  userId: string,
  priority: TaskPriority,
  tx?: TransactionClient,
): Promise<number> {
  const client = tx || prisma;
  const result = await client.studyTask.updateMany({
    where: { id, userId },
    data: { priority },
  });

  return result.count;
}

export async function findByPlaylistOrdered(
  userId: string,
  playlistId: string,
  tx?: TransactionClient,
): Promise<StudyTask[]> {
  const client = tx || prisma;

  return client.studyTask.findMany({
    where: {
      userId,
      playlistId,
    },
    include: {
      skill: true,
      goal: true,
      playlistItem: true,
    },
    orderBy: [{ scheduledDate: "asc" }, { createdAt: "asc" }],
  });
}
