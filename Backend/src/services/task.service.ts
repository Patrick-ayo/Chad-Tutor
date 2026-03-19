/**
 * Task Service
 */

import { taskRepo } from '../repositories';
import { submitQuizAttempt } from './quiz.service';

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
  return taskRepo.findByUserAndDateRange(userId, startOfDay(date), endOfDay(date));
}

export async function getTasksForRange(userId: string, startDate: Date, endDate: Date) {
  return taskRepo.findByUserAndDateRange(userId, startOfDay(startDate), endOfDay(endDate));
}

export async function completeTask(
  userId: string,
  taskId: string,
  input?: {
    completedDurationMinutes?: number;
    quiz?: {
      questionsCount: number;
      correctCount: number;
      timeSpentSeconds?: number;
      metadata?: unknown;
    };
  }
) {
  const task = await taskRepo.findById(taskId);
  if (!task || task.userId !== userId) {
    return null;
  }

  const updatedTask = await taskRepo.updateStatus(taskId, 'COMPLETED', {
    completedAt: new Date(),
    completedDurationMinutes: input?.completedDurationMinutes,
  });

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
  const task = await taskRepo.findById(taskId);
  if (!task || task.userId !== userId) {
    return null;
  }

  return taskRepo.updateStatus(taskId, 'MISSED', {
    rescheduledReason: reason ?? 'Marked missed by user',
  });
}
