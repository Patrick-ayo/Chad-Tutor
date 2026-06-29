/**
 * Reschedule Service
 *
 * Handles missed-task remanagement while respecting active days and daily budget.
 */

import { settingsRepo, taskRepo, goalRepo } from "../repositories";
import { assertRowsAffected, ServiceNotFoundError } from "./serviceErrors";
import {
  resolveMissedTasksMultiTopic,
  type Availability as SchedulerAvailability,
  type ScheduledUnit,
  type TopicQueue as SchedulerTopicQueue,
  type RescheduleResult,
} from "./scheduler.service";

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

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDayKey(date: Date): string {
  return startOfDay(date).toISOString();
}

function getPriorityWeight(priority: PriorityLevel): number {
  return PRIORITY_WEIGHT[priority];
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

async function findNextSlot(
  fromDate: Date,
  activeDays: string[],
  dailyMinutes: unknown,
  estimatedMinutes: number,
  maxActiveDayLookahead: number,
  scheduledMinutesByDay: Map<string, number>,
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
    const scheduled = scheduledMinutesByDay.get(toDayKey(cursor)) ?? 0;

    if (scheduled + estimatedMinutes <= budget) {
      return cursor;
    }
  }

  return null;
}

async function findBufferSlot(
  fromDate: Date,
  estimatedMinutes: number,
  scheduledMinutesByDay: Map<string, number>,
): Promise<Date | null> {
  let cursor = startOfDay(fromDate);

  for (let i = 0; i < 7; i++) {
    cursor = addDays(cursor, 1);

    const scheduled = scheduledMinutesByDay.get(toDayKey(cursor)) ?? 0;

    // only allow into buffer zone
    if (scheduled + estimatedMinutes <= DEFAULT_DAILY_LIMIT) {
      return cursor;
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

  const futureWindowStart = startOfDay(addDays(asOfDate, 1));
  const futureWindowEnd = endOfDay(addDays(asOfDate, 30));
  const futureTasks = await taskRepo.findByUserAndDateRange(
    userId,
    futureWindowStart,
    futureWindowEnd,
  );

  const scheduledMinutesByDay = new Map<string, number>();

  for (const task of futureTasks) {
    if (
      task.status !== "SCHEDULED" &&
      task.status !== "IN_PROGRESS" &&
      task.status !== "RESCHEDULED"
    ) {
      continue;
    }

    const key = toDayKey(task.scheduledDate);
    const current = scheduledMinutesByDay.get(key) ?? 0;
    scheduledMinutesByDay.set(key, current + task.estimatedMinutes);
  }

  // New approach: use multi-topic resolver
  // Build availability object
  const availability: SchedulerAvailability = {
    activeDays: activeDays as any,
    minutesPerDay: dailyMinutes as any,
  };

  // Fetch all incomplete tasks for user across a 365-day window
  const windowStart = startOfDay(addDays(asOfDate, -30));
  const windowEnd = endOfDay(addDays(asOfDate, 365));
  const allTasksRaw = await taskRepo.findByUserAndDateRange(
    userId,
    windowStart,
    windowEnd,
  );

  // Map to ScheduledUnit
  const allTasks: ScheduledUnit[] = allTasksRaw.map((t) => ({
    id: t.id,
    taskId: t.playlistItemId ?? undefined,
    title: t.title,
    type: (t.playlistItemId ? "learn" : "practice") as any,
    topicId: t.skillId ?? t.goalId ?? undefined,
    subtopicClusterId: undefined,
    scheduledDate: t.scheduledDate,
    deadlineDate: undefined,
    estimatedMinutes: t.estimatedMinutes,
    actualMinutes: t.completedDurationMinutes ?? undefined,
    status: t.status,
    rescheduleCount: t.rescheduleCount,
    originalEstimatedMinutes: undefined,
  }));

  const missedIds = missed.map((m) => m.id);

  const result: RescheduleResult = await resolveMissedTasksMultiTopic(allTasks, missedIds, asOfDate, availability);

  // Persist updated tasks back to DB
  for (const ut of result.updatedTasks) {
    // find raw task
    const raw = allTasksRaw.find((r) => r.id === ut.id);
    if (!raw) continue;

    const extras: any = {};
    if (ut.scheduledDate) {
      extras.scheduledDate = ut.scheduledDate;
      extras.originalScheduledDate = raw.originalScheduledDate ?? raw.scheduledDate;
    }
    if (ut.rescheduleCount && ut.rescheduleCount > raw.rescheduleCount) {
      extras.rescheduleCountIncrement = ut.rescheduleCount - raw.rescheduleCount;
    }
    if (ut.status) {
      // map status strings
    }
    if (ut.type === 'revision') {
      extras.rescheduledReason = (raw.rescheduledReason ?? '') + ' Converted to revision after repeated misses';
    }

    if (Object.keys(extras).length > 0) {
      const updatedCount = await taskRepo.updateStatus(raw.id, userId, 'RESCHEDULED', extras);
      // ignore not found for safety
      if (updatedCount > 0) {
        // no-op
      }
    }
  }

  // TODO: persist warnings if a warnings table exists; currently return to caller via result

  return { rescheduledCount: result.updatedTasks.length, skippedCount: 0 };
}

// Helper: buildTopicQueuesFromDB
export async function buildTopicQueuesFromDB(userId: string, goalId?: string): Promise<SchedulerTopicQueue[]> {
  const now = new Date();
  const tasks = await taskRepo.findByUserAndDateRange(userId, addDays(now, -365), addDays(now, 365));
  const filtered = tasks.filter((t) => (goalId ? t.goalId === goalId : true) && t.status !== 'COMPLETED');

  const grouped = new Map<string, typeof filtered>();
  for (const t of filtered) {
    const key = t.skillId ?? t.goalId ?? 'unknown';
    const list = grouped.get(key) ?? [];
    list.push(t);
    grouped.set(key, list);
  }

  const queues: SchedulerTopicQueue[] = [];
  for (const [topicId, list] of grouped.entries()) {
    const total = list.reduce((s, x) => s + x.estimatedMinutes, 0);
    const goal = list[0].goalId ? await goalRepo.findById(list[0].goalId!, userId) : null;
    const deadline = goal?.deadline ?? addDays(now, 7);
    const tasksUnits = list.map((t) => ({
      id: t.id,
      taskId: t.playlistItemId ?? undefined,
      title: t.title,
      type: 'learn' as any,
      topicId,
      subtopicClusterId: undefined,
      scheduledDate: t.scheduledDate,
      deadlineDate: deadline,
      estimatedMinutes: t.estimatedMinutes,
      actualMinutes: t.completedDurationMinutes ?? undefined,
      status: t.status,
      rescheduleCount: t.rescheduleCount,
      originalEstimatedMinutes: undefined,
    }));

    queues.push({ topicId, deadlineDate: new Date(deadline), tasks: tasksUnits, totalMinutes: total, remainingMinutes: total });
  }

  return queues;
}
