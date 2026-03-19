/**
 * Reschedule Service
 *
 * Handles missed-task remanagement while respecting active days and daily budget.
 */

import { settingsRepo, taskRepo } from '../repositories';

type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const PRIORITY_WEIGHT: Record<PriorityLevel, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isActiveDay(date: Date, activeDays: string[]): boolean {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return activeDays.includes(weekday);
}

function getDailyMinutesBudget(
  dailyMinutes: unknown,
  dayName: string,
  fallback: number
): number {
  if (!dailyMinutes || typeof dailyMinutes !== 'object') {
    return fallback;
  }

  const record = dailyMinutes as Record<string, unknown>;
  const value = record[dayName];
  if (typeof value === 'number' && value > 0) {
    return value;
  }

  return fallback;
}

async function findNextSlot(
  userId: string,
  fromDate: Date,
  activeDays: string[],
  dailyMinutes: unknown,
  estimatedMinutes: number,
  maxActiveDayLookahead: number
): Promise<Date | null> {
  let cursor = startOfDay(fromDate);
  let activeDayCount = 0;

  for (let i = 0; i < 30; i++) {
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    const dayName = cursor.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    if (!isActiveDay(cursor, activeDays)) {
      continue;
    }

    activeDayCount += 1;
    if (activeDayCount > maxActiveDayLookahead) {
      break;
    }

    const budget = getDailyMinutesBudget(dailyMinutes, dayName, 60);
    const scheduled = await taskRepo.getDailyScheduledMinutes(userId, cursor);

    if (scheduled + estimatedMinutes <= budget) {
      return cursor;
    }
  }

  return null;
}

export async function rescheduleMissedTasks(
  userId: string,
  asOfDate: Date = new Date()
): Promise<{ rescheduledCount: number; skippedCount: number }> {
  const settings = await settingsRepo.findByUserId(userId);
  const activeDays = settings?.activeDays ?? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dailyMinutes = settings?.dailyMinutes ?? {};

  const missed = await taskRepo.findMissedBeforeDate(userId, asOfDate);

  // Highest-priority skipped tasks are processed first.
  const sorted = [...missed].sort((a, b) => {
    const priorityDelta =
      PRIORITY_WEIGHT[b.priority as PriorityLevel] -
      PRIORITY_WEIGHT[a.priority as PriorityLevel];
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return a.scheduledDate.getTime() - b.scheduledDate.getTime();
  });

  let rescheduledCount = 0;
  let skippedCount = 0;

  for (const task of sorted) {
    const preferred = await findNextSlot(
      userId,
      asOfDate,
      activeDays,
      dailyMinutes,
      task.estimatedMinutes,
      1
    );

    const fallback = preferred
      ? preferred
      : await findNextSlot(
          userId,
          asOfDate,
          activeDays,
          dailyMinutes,
          task.estimatedMinutes,
          3
        );

    if (!fallback) {
      await taskRepo.updateStatus(task.id, 'SKIPPED', {
        rescheduledReason: 'No available budget within next active windows',
      });
      skippedCount += 1;
      continue;
    }

    await taskRepo.updateStatus(task.id, 'RESCHEDULED', {
      originalScheduledDate: task.originalScheduledDate ?? task.scheduledDate,
      scheduledDate: fallback,
      rescheduledReason: 'Auto-rescheduled after missed day',
      rescheduleCountIncrement: 1,
    });

    rescheduledCount += 1;
  }

  return { rescheduledCount, skippedCount };
}
