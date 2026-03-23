/**
 * Planner Service
 *
 * Generates schedule data for planner page and creates schedules from playlists.
 */

import {
  playlistRepo,
  settingsRepo,
  taskRepo,
  withTransaction,
} from "../repositories";
import { rescheduleMissedTasks } from "./reschedule.service";
import type { Prisma } from "@prisma/client";
import type { TaskPriority } from "@prisma/client";

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

async function shiftLectureChain(
  userId: string,
  playlistId: string,
  missedTaskId: string,
) {
  const tasks = await taskRepo.findByPlaylistOrdered(userId, playlistId);

  const index = tasks.findIndex((t) => t.id === missedTaskId);

  if (index === -1) return;

  // shift forward
  for (let i = index; i < tasks.length - 1; i++) {
    const next = tasks[i + 1];

    await taskRepo.updateStatus(tasks[i].id, "RESCHEDULED", {
      scheduledDate: next.scheduledDate,
      rescheduledReason: "Lecture chain shift",
      rescheduleCountIncrement: 1,
    });
  }

  // last task → move forward
  const lastTask = tasks[tasks.length - 1];

  const newSlot = await findNextAvailableSlotForChain(
    userId,
    lastTask.estimatedMinutes,
  );

  if (newSlot) {
    await taskRepo.updateStatus(lastTask.id, "RESCHEDULED", {
      scheduledDate: newSlot,
      rescheduledReason: "Lecture chain tail shift",
      rescheduleCountIncrement: 1,
    });
  }
}

async function findNextAvailableSlotForChain(
  userId: string,
  estimatedMinutes: number,
): Promise<Date | null> {
  const today = new Date();

  for (let i = 1; i <= 7; i++) {
    const candidate = new Date(today);
    candidate.setDate(candidate.getDate() + i);

    const scheduled = await taskRepo.getDailyScheduledMinutes(
      userId,
      candidate,
    );

    if (scheduled + estimatedMinutes <= 120) {
      return candidate;
    }
  }

  return null;
}

// type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface DailyMinutesConfig {
  [key: string]: number;
}

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

function dayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

function toTaskStatusForUi(
  status: string,
): "pending" | "in-progress" | "completed" | "overdue" | "blocked" {
  if (status === "IN_PROGRESS") {
    return "in-progress";
  }

  if (status === "COMPLETED") {
    return "completed";
  }

  if (status === "MISSED") {
    return "overdue";
  }

  if (status === "SKIPPED") {
    return "blocked";
  }

  return "pending";
}

function toPriorityForUi(priority: TaskPriority): "high" | "medium" | "low" {
  if (priority === "HIGH" || priority === "URGENT") {
    return "high";
  }

  if (priority === "MEDIUM") {
    return "medium";
  }

  return "low";
}

function toTypeFromTitle(title: string): "learn" | "practice" | "revision" {
  const normalized = title.toLowerCase();
  if (normalized.includes("quiz") || normalized.includes("practice")) {
    return "practice";
  }
  if (normalized.includes("revision") || normalized.includes("review")) {
    return "revision";
  }
  return "learn";
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function getDailyBudget(config: unknown, weekday: string): number {
  if (!config || typeof config !== "object") {
    return 60;
  }

  const record = config as DailyMinutesConfig;
  return typeof record[weekday] === "number" ? record[weekday] : 60;
}

function computeRiskLevel(
  tasksDone: number,
  missedTasks: number,
): "low" | "medium" | "high" {
  if (missedTasks >= 3) {
    return "high";
  }
  if (missedTasks >= 1 || tasksDone <= 1) {
    return "medium";
  }
  return "low";
}

export async function getPlannerSnapshot(userId: string) {
  const today = new Date();
  const start = startOfDay(addDays(today, -2));
  const end = endOfDay(addDays(today, 10));

  const [tasks, settings] = await Promise.all([
    taskRepo.findByUserAndDateRange(userId, start, end),
    settingsRepo.findByUserId(userId),
  ]);

  const days = Array.from({ length: 13 }, (_, idx) => addDays(start, idx));

  const scheduleDays = days.map((date) => {
    const dateStart = startOfDay(date).getTime();
    const dateEnd = endOfDay(date).getTime();
    const dayTasks = tasks.filter((task) => {
      const taskTs = task.scheduledDate.getTime();
      return taskTs >= dateStart && taskTs <= dateEnd;
    });

    const totalMinutes = dayTasks.reduce(
      (sum, task) => sum + task.estimatedMinutes,
      0,
    );
    const completedMinutes = dayTasks
      .filter((task) => task.status === "COMPLETED")
      .reduce(
        (sum, task) =>
          sum + (task.completedDurationMinutes ?? task.estimatedMinutes),
        0,
      );

    const weekday = dayName(date);
    const active = (settings?.activeDays ?? []).includes(weekday);

    return {
      date: date.toISOString(),
      isBuffer: !active,
      tasks: dayTasks.map((task) => ({
        id: task.id,
        title: task.title,
        type: toTypeFromTitle(task.title),
        scheduledDate: task.scheduledDate.toISOString(),
        estimatedMinutes: task.estimatedMinutes,
        actualMinutes: task.completedDurationMinutes ?? undefined,
        keyPoints: toStringArray(task.keyPoints),
        learningOutcomes: toStringArray(task.learningOutcomes),
        status: toTaskStatusForUi(task.status),
        priority: toPriorityForUi(task.priority),
        dependencies: [],
        goalId: task.goalId ?? "general",
        partialProgress: task.status === "IN_PROGRESS" ? 45 : undefined,
      })),
      totalMinutes,
      completedMinutes,
    };
  });

  const missedTasks = tasks
    .filter((task) => task.status === "MISSED" || task.status === "SKIPPED")
    .map((task) => ({
      id: task.id,
      title: task.title,
      originalDate: (
        task.originalScheduledDate ?? task.scheduledDate
      ).toISOString(),
      type: toTypeFromTitle(task.title),
      estimatedMinutes: task.estimatedMinutes,
      priority: toPriorityForUi(task.priority),
      missedReason:
        task.rescheduledReason ??
        "Task was not completed within the planned day",
      dependentTasks: [],
      goalId: task.goalId ?? "general",
    }));

  const totalScheduled = tasks.reduce(
    (sum, task) => sum + task.estimatedMinutes,
    0,
  );
  const totalCompleted = tasks
    .filter((task) => task.status === "COMPLETED")
    .reduce(
      (sum, task) =>
        sum + (task.completedDurationMinutes ?? task.estimatedMinutes),
      0,
    );

  const riskLevel = computeRiskLevel(
    totalCompleted > 0 ? 1 : 0,
    missedTasks.length,
  );

  return {
    scheduleDays,
    missedTasks,
    workloadIntensity: "normal",
    workloadStats: {
      tasksPerDay: { light: 2, normal: 3, aggressive: 5 },
      revisionDensity: {
        light: "Every 5 days",
        normal: "Every 3 days",
        aggressive: "Daily",
      },
      bufferUsage: {
        light: "2 per week",
        normal: "1 per week",
        aggressive: "None",
      },
    },
    currentLoad: {
      daily: Math.round(totalScheduled / Math.max(1, days.length)),
      weekly: Math.round((totalScheduled / Math.max(1, days.length)) * 7),
      maxRecommended: 90,
    },
    burnoutSignals: {
      riskLevel,
      indicators: [
        {
          type: "missed-tasks",
          name: "Missed Task Trend",
          description: `${missedTasks.length} tasks require remanagement in the current window`,
          severity: riskLevel,
          value: `${missedTasks.length}`,
        },
      ],
      recommendations: [
        {
          text: "Reduce daily load by one focused block",
          action: "reduce-load",
        },
      ],
      detectedPatterns: [
        "Planner synced with backend tasks",
        "Daily load constrained by active-day budget",
      ],
    },
    pendingChanges: [],
    lastReschedule: new Date().toISOString(),
    keyMetrics: {
      totalScheduledMinutes: totalScheduled,
      totalCompletedMinutes: totalCompleted,
    },
  };
}

export async function generateScheduleFromPlaylists(
  userId: string,
  input: {
    playlistIds: string[];
    startDate?: string;
  },
) {
  const settings = await settingsRepo.findByUserId(userId);
  const activeDays = settings?.activeDays ?? [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];
  const dailyMinutes = settings?.dailyMinutes;
  const start = startOfDay(
    input.startDate ? new Date(input.startDate) : new Date(),
  );

  type PlaylistWithItems = NonNullable<
    Awaited<ReturnType<typeof playlistRepo.findById>>
  >;

  const playlists: Array<PlaylistWithItems | null> = await Promise.all(
    input.playlistIds.map((id) => playlistRepo.findById(id)),
  );
  const validPlaylists = playlists.reduce<PlaylistWithItems[]>(
    (acc: PlaylistWithItems[], playlist: PlaylistWithItems | null) => {
      if (playlist) {
        acc.push(playlist);
      }

      return acc;
    },
    [],
  );

  if (validPlaylists.length === 0) {
    return { createdCount: 0 };
  }

  const tasksToCreate: Array<{
    userId: string;
    playlistId: string;
    playlistItemId: string;
    title: string;
    description?: string;
    scheduledDate: Date;
    estimatedMinutes: number;
    priority: TaskPriority;
    keyPoints?: Prisma.InputJsonValue;
    learningOutcomes?: Prisma.InputJsonValue;
  }> = [];

  let cursor = new Date(start);
  let consumedToday = 0;

  for (const playlist of validPlaylists) {
    for (const item of playlist.items) {
      let weekday = dayName(cursor);
      while (!activeDays.includes(weekday)) {
        cursor = addDays(cursor, 1);
        consumedToday = 0;
        weekday = dayName(cursor);
      }

      const budget = getDailyBudget(dailyMinutes, weekday);
      const duration = item.estimatedMinutes ?? 25;

      if (consumedToday + duration > budget) {
        cursor = addDays(cursor, 1);
        consumedToday = 0;

        let nextDay = dayName(cursor);
        while (!activeDays.includes(nextDay)) {
          cursor = addDays(cursor, 1);
          nextDay = dayName(cursor);
        }
      }

      const sequencePriority: TaskPriority =
        item.sequence <= 2 ? "HIGH" : "MEDIUM";
      tasksToCreate.push({
        userId,
        playlistId: playlist.id,
        playlistItemId: item.id,
        title: item.title,
        description: item.description ?? undefined,
        scheduledDate: new Date(cursor),
        estimatedMinutes: duration,
        priority: sequencePriority,
        keyPoints: (item.keyPoints ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
        learningOutcomes: (item.learningOutcomes ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
      });

      consumedToday += duration;
    }
  }

  const createdCount = await withTransaction(async (tx) => {
    return taskRepo.createMany(tasksToCreate, tx);
  });

  return { createdCount };
}

export async function handleScheduleUpdate(userId: string) {
  // 🔥 central control point
  await rescheduleMissedTasks(userId);

  // future:
  // await rebalanceSchedule(userId);
}

export async function resolveMissedTask(
  userId: string,
  taskId: string,
  resolutionType: "push-forward" | "compress" | "convert-revision" | "drop",
) {
  const task = await taskRepo.findById(taskId);
  if (!task || task.userId !== userId) {
    return null;
  }

  if (resolutionType === "drop") {
    const updated = await taskRepo.updateStatus(taskId, "SKIPPED", {
      rescheduledReason: "Dropped by user",
    });

    return {
      type: "task-removed",
      task: updated,
    };
  }

  await taskRepo.updateStatus(taskId, "MISSED", {
    rescheduledReason: `Resolution requested: ${resolutionType}`,
  });

  // 🔥 STAGE 4 LOGIC
  if (resolutionType === "push-forward" && task.playlistId) {
    await shiftLectureChain(userId, task.playlistId, task.id);
  }

  // 🔥 use orchestrator instead
  await handleScheduleUpdate(userId);

  const result = { success: true };

  return {
    type: "task-moved",
    taskId,
    result,
  };
}

async function rebalanceSchedule(userId: string) {
  // get all upcoming tasks (next 30 days)
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);

  const tasks = await taskRepo.findByUserAndDateRange(userId, start, end);

  // sort by priority + date
  const sorted = tasks.sort((a, b) => {
    const priorityScore =
      PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];

    if (priorityScore !== 0) return priorityScore;

    return a.scheduledDate.getTime() - b.scheduledDate.getTime();
  });

  // 🔥 reassign sequentially (simple version)
  let cursor = new Date();

  for (const task of sorted) {
    const nextSlot = await findNextAvailableSlotForChain(
      userId,
      task.estimatedMinutes,
    );

    if (!nextSlot) continue;

    await taskRepo.updateStatus(task.id, "RESCHEDULED", {
      scheduledDate: nextSlot,
      rescheduledReason: "Rebalanced schedule",
      rescheduleCountIncrement: 1,
    });

    cursor = nextSlot;
  }
}
