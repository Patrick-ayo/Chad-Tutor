/**
 * Task Service
 */

import { taskRepo } from '../repositories';
import { prisma } from '../repositories/base.repo';
import { submitQuizAttempt } from './quiz.service';
import { assertRowsAffected, ServiceNotFoundError, ServiceValidationError } from './serviceErrors';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getTasksForDate(userId: string, date: Date) {
  // Cascading Rescheduler: physically move missed tasks to the requested date (usually today)
  const missedTasks = await taskRepo.findMissedBeforeDate(userId, startOfDay(date));
  if (missedTasks.length > 0) {
    const missedIds = missedTasks.map(t => t.id);
    await prisma.studyTask.updateMany({
      where: { id: { in: missedIds } },
      data: {
        scheduledDate: startOfDay(date),
        status: 'RESCHEDULED' // Optional: track that they were rolled forward
      }
    });
  }

  // Fetch all tasks <= requested date that are pending, keeping sequential order
  return taskRepo.findPendingTasksUpTo(userId, endOfDay(date));
}

export async function getTasksForRange(userId: string, startDate: Date, endDate: Date) {
  return taskRepo.findByUserAndDateRange(userId, startOfDay(startDate), endOfDay(endDate));
}

export async function updateTaskProgress(
  userId: string,
  taskId: string,
  watchedMinutes: number,
  percentComplete: number,
) {
  const existingTask = await taskRepo.findById(taskId, userId);
  assertRowsAffected(existingTask ? 1 : 0, 'Task not found');

  const completedDurationMinutes = Math.max(0, Math.floor(watchedMinutes));
  const updatedCount = await taskRepo.updateStatus(taskId, userId, 'IN_PROGRESS', {
    completedDurationMinutes,
  });
  assertRowsAffected(updatedCount, 'Task not found');

  const updatedTask = await taskRepo.findById(taskId, userId);
  if (!updatedTask) {
    throw new ServiceNotFoundError('Task not found');
  }

  return {
    task: updatedTask,
    percentComplete: Math.max(0, Math.min(100, percentComplete)),
    bufferCreditMinutes: Math.max(0, completedDurationMinutes - updatedTask.estimatedMinutes),
  };
}

export async function completeTask(
  userId: string,
  taskId: string,
  input?: {
    completedDurationMinutes?: number;
    proof?: { watchedSeconds?: number; score?: number };
    quiz?: {
      questionsCount: number;
      correctCount: number;
      timeSpentSeconds?: number;
      metadata?: unknown;
    };
  }
) {
  const task = await taskRepo.findById(taskId, userId);
  if (!task) {
    throw new ServiceNotFoundError('Task not found');
  }

  // Enforce Proof of Work
  const isVideo = !!(task.videoId || task.videoUrl);
  if (isVideo) {
    const requiredSeconds = (task.duration || task.estimatedMinutes * 60) * 0.90;
    if (input?.proof?.watchedSeconds === undefined || input.proof.watchedSeconds < requiredSeconds) {
      throw new ServiceValidationError('Proof of work failed: insufficient watchedSeconds');
    }
  } else {
    // Treat as quiz/practice
    if (input?.proof?.score === undefined) {
      throw new ServiceValidationError('Proof of work failed: missing score');
    }
  }

  const updatedCount = await taskRepo.updateStatus(taskId, userId, 'COMPLETED', {
    completedAt: new Date(),
    completedDurationMinutes: input?.completedDurationMinutes,
  });
  assertRowsAffected(updatedCount, 'Task not found');

  const updatedTask = await taskRepo.findById(taskId, userId);
  if (!updatedTask) {
    throw new ServiceNotFoundError('Task not found');
  }

  // Next task auto-activation: Find the next pending task for this goal/user
  const nextPendingTasks = await prisma.studyTask.findMany({
    where: {
      userId,
      ...(updatedTask.goalId && { goalId: updatedTask.goalId }),
      status: 'SCHEDULED',
    },
    orderBy: [
      { scheduledDate: 'asc' },
      { sequenceNumber: 'asc' },
      { id: 'asc' },
    ],
    take: 1,
  });

  if (nextPendingTasks.length > 0) {
    await taskRepo.updateStatus(nextPendingTasks[0].id, userId, 'IN_PROGRESS');
  }

  let quizAttempt = null;
  if (input?.quiz) {
    quizAttempt = await submitQuizAttempt(userId, {
      taskId,
      skillId: updatedTask.skillId ?? undefined,
      questionsCount: input.quiz.questionsCount,
      correctCount: input.quiz.correctCount,
      timeSpentSeconds: input.quiz.timeSpentSeconds,
      metadata: input.quiz.metadata,
    });
  }

  return { task: updatedTask, quizAttempt };
}

export async function markTaskMissed(userId: string, taskId: string, reason?: string) {
  const updatedCount = await taskRepo.updateStatus(taskId, userId, 'MISSED', {
    rescheduledReason: reason ?? 'Marked missed by user',
  });
  assertRowsAffected(updatedCount, 'Task not found');

  const updatedTask = await taskRepo.findById(taskId, userId);
  if (!updatedTask) {
    throw new ServiceNotFoundError('Task not found');
  }

  return updatedTask;
}
