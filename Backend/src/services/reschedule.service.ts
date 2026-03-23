/**
 * Reschedule Service
 *
 * Handles missed-task remanagement while respecting active days and daily budget.
 */

import { settingsRepo, taskRepo } from "../repositories";

type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const PRIORITY_WEIGHT: Record<PriorityLevel, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const DAILY_BUFFER_MINUTES = 60;
const DEFAULT_DAILY_LIMIT = 120;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isActiveDay(date: Date, activeDays: string[]): boolean {
  const weekday = date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  return activeDays.includes(weekday);
}

function getDailyMinutesBudget(
  dailyMinutes: unknown,
  dayName: string,
  fallback: number,
): number {
  let base = fallback;

  if (dailyMinutes && typeof dailyMinutes === "object") {
    const record = dailyMinutes as Record<string, unknown>;
    const value = record[dayName];

    if (typeof value === "number" && value > 0) {
      base = value;
    }
  }

  // 🔥 ALWAYS reserve buffer
  const effective = base - DAILY_BUFFER_MINUTES;

  // safety: never go below zero
  return Math.max(effective, 0);
}

/**
 * 🔥 NEW HELPER: Fetch tasks scheduled for a given day
 */
async function getNextDayTasks(userId: string, date: Date) {
  const start = startOfDay(date);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  // make sure your repo supports this
  return taskRepo.findByUserAndDateRange(userId, start, end);
}

async function findNextSlot(
  userId: string,
  fromDate: Date,
  activeDays: string[],
  dailyMinutes: unknown,
  estimatedMinutes: number,
  maxActiveDayLookahead: number,
): Promise<Date | null> {
  let cursor = startOfDay(fromDate);
  let activeDayCount = 0;

  for (let i = 0; i < 30; i++) {
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    const dayName = cursor
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

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

async function findBufferSlot(
  userId: string,
  fromDate: Date,
  estimatedMinutes: number,
): Promise<Date | null> {
  let cursor = new Date(fromDate);

  for (let i = 0; i < 7; i++) {
    cursor.setDate(cursor.getDate() + 1);

    const scheduled = await taskRepo.getDailyScheduledMinutes(userId, cursor);

    // only allow into buffer zone
    if (scheduled + estimatedMinutes <= DEFAULT_DAILY_LIMIT) {
      return new Date(cursor);
    }
  }

  return null;
}

export async function rescheduleMissedTasks(
  userId: string,
  asOfDate: Date = new Date(),
): Promise<{ rescheduledCount: number; skippedCount: number }> {
  const settings = await settingsRepo.findByUserId(userId);
  const activeDays = settings?.activeDays ?? [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];
  const dailyMinutes = settings?.dailyMinutes ?? {};

  const missed = await taskRepo.findMissedBeforeDate(userId, asOfDate);

  // Highest-priority skipped tasks are processed first.
  const sorted = [...missed].sort((a, b) => {
    const priorityDelta =
      PRIORITY_WEIGHT[b.priority as PriorityLevel] -
      PRIORITY_WEIGHT[a.priority as PriorityLevel];

    if (priorityDelta !== 0) return priorityDelta;

    return a.scheduledDate.getTime() - b.scheduledDate.getTime();
  });

  let rescheduledCount = 0;
  let skippedCount = 0;

  for (const task of sorted) {
    /**
     * 🔥 NEW LOGIC STARTS HERE
     * Compare with next day tasks before deciding slot
     */
    const nextDayTasks = await getNextDayTasks(userId, asOfDate);

    const higherPriorityExists = nextDayTasks.some(
      (t) => PRIORITY_WEIGHT[t.priority] > PRIORITY_WEIGHT[task.priority],
    );

    let fallback: Date | null = null;

    if (higherPriorityExists) {
      // lower priority → delay (buffer style)
      fallback = await findNextSlot(
        userId,
        asOfDate,
        activeDays,
        dailyMinutes,
        task.estimatedMinutes,
        3,
      );
    } else {
      // higher priority → try earlier insertion
      fallback = await findNextSlot(
        userId,
        asOfDate,
        activeDays,
        dailyMinutes,
        task.estimatedMinutes,
        1,
      );
    }

    /**
     * 🔥 EXISTING LOGIC (UNCHANGED)
     */
    if (!fallback) {
      // 🔥 try buffer slot
      const bufferSlot = await findBufferSlot(
        userId,
        asOfDate,
        task.estimatedMinutes,
      );

      if (bufferSlot) {
        await taskRepo.updateStatus(task.id, "RESCHEDULED", {
          originalScheduledDate:
            task.originalScheduledDate ?? task.scheduledDate,
          scheduledDate: bufferSlot,
          rescheduledReason: "Moved to buffer slot",
          rescheduleCountIncrement: 1,
        });

        rescheduledCount++;
        continue;
      }

      // still no space → skip
      await taskRepo.updateStatus(task.id, "SKIPPED", {
        rescheduledReason: "No available slots including buffer",
      });

      skippedCount++;
      continue;
    }

    await taskRepo.updateStatus(task.id, "RESCHEDULED", {
      originalScheduledDate: task.originalScheduledDate ?? task.scheduledDate,
      scheduledDate: fallback,
      rescheduledReason: "Auto-rescheduled after missed day",
      rescheduleCountIncrement: 1,
    });

    rescheduledCount += 1;
  }

  return { rescheduledCount, skippedCount };
}
