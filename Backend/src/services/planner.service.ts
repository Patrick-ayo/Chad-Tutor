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
import {
  sortTasksByDimension,
  type SchedulableTask,
  type TaskDimensionGroup,
} from "./scheduling.service";
import type { Prisma } from "@prisma/client";
import type { TaskPriority } from "@prisma/client";
import { assertRowsAffected, ServiceNotFoundError } from "./serviceErrors";

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

type PlaylistPerformanceProfile = {
  progress: number;
  accuracy: number;
  difficulty: number;
};

type PlaylistSkillLinkRecord = {
  playlistId: string;
  skill: {
    difficulty: string;
    userProgress: Array<{
      progressPercent: number;
      accuracyRate: number;
    }>;
  };
};

function difficultyToScore(difficulty: string): number {
  if (difficulty === "EXPERT") {
    return 5;
  }

  if (difficulty === "ADVANCED") {
    return 4;
  }

  if (difficulty === "INTERMEDIATE") {
    return 3;
  }

  return 2;
}

function buildPlaylistPerformanceMap(
  links: PlaylistSkillLinkRecord[],
): Map<string, PlaylistPerformanceProfile> {
  const profiles = new Map<string, PlaylistPerformanceProfile>();

  for (const link of links) {
    const progress = link.skill.userProgress[0]?.progressPercent ?? 50;
    const accuracy = link.skill.userProgress[0]?.accuracyRate ?? 70;
    const difficulty = difficultyToScore(link.skill.difficulty);

    const existing = profiles.get(link.playlistId);
    if (!existing) {
      profiles.set(link.playlistId, {
        progress,
        accuracy,
        difficulty,
      });
      continue;
    }

    profiles.set(link.playlistId, {
      progress: Math.min(existing.progress, progress),
      accuracy: Math.min(existing.accuracy, accuracy),
      difficulty: Math.max(existing.difficulty, difficulty),
    });
  }

  return profiles;
}

function getSyntheticDeadlineOffset(
  sequence: number,
  playlistLength: number,
  planningWindowDays: number,
): number {
  const normalizedLength = Math.max(1, playlistLength);
  const ratio = (sequence + 1) / normalizedLength;
  return Math.max(1, Math.ceil(ratio * planningWindowDays));
}

const BASE_GROUP_WEIGHT: Record<TaskDimensionGroup, number> = {
  deadline: 0.45,
  time: 0.25,
  effort: 0.3,
};

function buildDayTargets(
  budget: number,
  queueSizes: Record<TaskDimensionGroup, number>,
): Record<TaskDimensionGroup, number> {
  const activeGroups = (Object.keys(queueSizes) as TaskDimensionGroup[]).filter(
    (group) => queueSizes[group] > 0,
  );

  if (activeGroups.length === 0) {
    return {
      deadline: 0,
      time: 0,
      effort: 0,
    };
  }

  const activeWeight = activeGroups.reduce(
    (sum, group) => sum + BASE_GROUP_WEIGHT[group],
    0,
  );

  const normalizedWeight: Record<TaskDimensionGroup, number> = {
    deadline: 0,
    time: 0,
    effort: 0,
  };

  for (const group of activeGroups) {
    normalizedWeight[group] = BASE_GROUP_WEIGHT[group] / activeWeight;
  }

  const targets: Record<TaskDimensionGroup, number> = {
    deadline: Math.floor(budget * normalizedWeight.deadline),
    time: Math.floor(budget * normalizedWeight.time),
    effort: Math.floor(budget * normalizedWeight.effort),
  };

  const assigned = targets.deadline + targets.time + targets.effort;
  const remainder = Math.max(0, budget - assigned);
  targets.deadline += remainder;

  return targets;
}

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

    const updatedCount = await taskRepo.updateStatus(tasks[i].id, userId, "RESCHEDULED", {
      scheduledDate: next.scheduledDate,
      rescheduledReason: "Lecture chain shift",
      rescheduleCountIncrement: 1,
    });
    assertRowsAffected(updatedCount, "Task not found");
  }

  // last task → move forward
  const lastTask = tasks[tasks.length - 1];

  const newSlot = await findNextAvailableSlotForChain(
    userId,
    lastTask.estimatedMinutes,
  );

  if (newSlot) {
    const updatedCount = await taskRepo.updateStatus(lastTask.id, userId, "RESCHEDULED", {
      scheduledDate: newSlot,
      rescheduledReason: "Lecture chain tail shift",
      rescheduleCountIncrement: 1,
    });
    assertRowsAffected(updatedCount, "Task not found");
  }
}

async function findNextAvailableSlotForChain(
  userId: string,
  estimatedMinutes: number,
): Promise<Date | null> {
  const today = startOfDay(new Date());
  const windowStart = addDays(today, 1);
  const windowEnd = endOfDay(addDays(today, 7));
  const upcomingTasks = await taskRepo.findByUserAndDateRange(
    userId,
    windowStart,
    windowEnd,
  );

  const scheduledMinutesByDay = new Map<string, number>();

  for (const task of upcomingTasks) {
    if (
      task.status !== "SCHEDULED" &&
      task.status !== "IN_PROGRESS" &&
      task.status !== "RESCHEDULED"
    ) {
      continue;
    }

    const key = startOfDay(task.scheduledDate).toISOString();
    const current = scheduledMinutesByDay.get(key) ?? 0;
    scheduledMinutesByDay.set(key, current + task.estimatedMinutes);
  }

  for (let i = 1; i <= 7; i++) {
    const candidate = addDays(today, i);
    const key = startOfDay(candidate).toISOString();
    const scheduled = scheduledMinutesByDay.get(key) ?? 0;

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
    taskRepo.findPlannerTasks(userId, start, end),
    settingsRepo.findByUserId(userId),
  ]);

  const days = Array.from({ length: 13 }, (_, idx) => addDays(start, idx));

  const scheduleDays = days.map((date) => {
    const dateStart = startOfDay(date).getTime();
    const dateEnd = endOfDay(date).getTime();
    const dayTasks = tasks.filter((task) => {
      const taskTs = task.scheduledDate.getTime();
      
      // Cascading Rescheduler: Roll all past incomplete tasks into "Today"
      if (dateStart === startOfDay(today).getTime() && task.status !== "COMPLETED" && taskTs < dateStart) {
        return true;
      }
      
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
        videoId: task.videoId ?? task.playlistItem?.externalId ?? undefined,
        videoUrl: task.videoUrl ?? task.playlistItem?.externalUrl ?? undefined,
        videoTitle: task.videoTitle ?? task.playlistItem?.title ?? undefined,
        status: toTaskStatusForUi(task.status),
        priority: toPriorityForUi(task.priority),
        dependencies: [],
        goalId: task.goalId ?? "general",
        partialProgress:
          task.status === "IN_PROGRESS" && typeof task.completedDurationMinutes === "number"
            ? Math.max(1, Math.min(99, Math.round((task.completedDurationMinutes / Math.max(1, task.estimatedMinutes)) * 100)))
            : undefined,
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
    horizonDays?: number;
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
  const normalizedHorizonDays =
    typeof input.horizonDays === "number" && Number.isFinite(input.horizonDays)
      ? Math.max(1, Math.floor(input.horizonDays))
      : undefined;
  const horizonEnd =
    normalizedHorizonDays !== undefined
      ? endOfDay(addDays(start, normalizedHorizonDays - 1))
      : null;

  type PlaylistWithItems = NonNullable<
    Awaited<ReturnType<typeof playlistRepo.findById>>
  >;

  const playlists: Array<PlaylistWithItems | null> = await Promise.all(
    input.playlistIds.map((id) => playlistRepo.findById(id, userId)),
  );
  const missingPlaylistIds = input.playlistIds.filter(
    (_id, idx) => !playlists[idx],
  );

  if (missingPlaylistIds.length > 0) {
    throw new ServiceNotFoundError("One or more playlists were not found");
  }
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

  const planningWindowDays = normalizedHorizonDays ?? 14;
  const linkedSkillRecords = (await playlistRepo.findSkillLinksByPlaylistIds(
    userId,
    input.playlistIds,
  )) as PlaylistSkillLinkRecord[];
  const playlistPerformanceMap = buildPlaylistPerformanceMap(linkedSkillRecords);

  const toPriorityBySequence = (sequence: number): TaskPriority => {
    if (sequence <= 1) {
      return "HIGH";
    }

    return "MEDIUM";
  };

  const candidateTasks = validPlaylists.flatMap((playlist) =>
    playlist.items.map((item) => {
      const priority = toPriorityBySequence(item.sequence);
      const performance = playlistPerformanceMap.get(playlist.id) ?? {
        progress: 50,
        accuracy: 70,
        difficulty: 3,
      };
      const deadlineOffset = getSyntheticDeadlineOffset(
        item.sequence,
        playlist.items.length,
        planningWindowDays,
      );

      return {
        id: `${playlist.id}:${item.id}`,
        playlistId: playlist.id,
        playlistItemId: item.id,
        title: item.title,
        subject: playlist.name,
        description: item.description ?? undefined,
        estimatedMinutes: item.estimatedMinutes ?? 25,
        priority,
        deadline: addDays(start, deadlineOffset),
        progress: performance.progress,
        accuracy: performance.accuracy,
        difficulty: performance.difficulty,
        keyPoints: (item.keyPoints ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
        learningOutcomes: (item.learningOutcomes ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
      };
    }),
  );

  if (candidateTasks.length === 0) {
    return { createdCount: 0 };
  }

  const schedulableTasks: SchedulableTask[] = candidateTasks.map((task) => ({
    id: task.id,
    title: task.title,
    subject: task.subject,
    durationMinutes: task.estimatedMinutes,
    priority: task.priority,
    deadline: task.deadline,
    progress: task.progress,
    accuracy: task.accuracy,
    difficulty: task.difficulty,
    status: "PENDING",
  }));

  const dimensionSortedTasks = sortTasksByDimension(schedulableTasks, start);
  const candidateById = new Map(candidateTasks.map((task) => [task.id, task]));
  const groupQueues: Record<
    TaskDimensionGroup,
    Array<
      (typeof candidateTasks)[number] & {
        primaryGroup: TaskDimensionGroup;
      }
    >
  > = {
    deadline: [],
    time: [],
    effort: [],
  };
  const groupSummary = {
    deadline: 0,
    time: 0,
    effort: 0,
  } as Record<TaskDimensionGroup, number>;

  for (const task of dimensionSortedTasks) {
    const candidate = candidateById.get(task.id);
    if (candidate) {
      groupQueues[task.primaryGroup].push({
        ...candidate,
        primaryGroup: task.primaryGroup,
      });
      groupSummary[task.primaryGroup] += 1;
    }
  }

  const getQueueSizes = (): Record<TaskDimensionGroup, number> => ({
    deadline: groupQueues.deadline.length,
    time: groupQueues.time.length,
    effort: groupQueues.effort.length,
  });

  const remainingQueueItems = () => {
    const sizes = getQueueSizes();
    return sizes.deadline + sizes.time + sizes.effort;
  };

  const dequeueFirstFitting = (
    group: TaskDimensionGroup,
    remainingMinutes: number,
  ): (typeof groupQueues)[TaskDimensionGroup][number] | null => {
    const queue = groupQueues[group];
    const index = queue.findIndex(
      (task) => task.estimatedMinutes <= remainingMinutes,
    );

    if (index === -1) {
      return null;
    }

    const [item] = queue.splice(index, 1);
    return item ?? null;
  };

  const dequeueFallback = (
    remainingMinutes: number,
  ): (typeof groupQueues)[TaskDimensionGroup][number] | null => {
    const fallbackOrder: TaskDimensionGroup[] = ["deadline", "effort", "time"];

    for (const group of fallbackOrder) {
      const task = dequeueFirstFitting(group, remainingMinutes);
      if (task) {
        return task;
      }
    }

    return null;
  };

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
  let unscheduledCount = 0;

  const isBeyondHorizon = (date: Date): boolean => {
    if (!horizonEnd) {
      return false;
    }

    return startOfDay(date).getTime() > horizonEnd.getTime();
  };

  while (remainingQueueItems() > 0) {
    if (isBeyondHorizon(cursor)) {
      unscheduledCount = remainingQueueItems();
      break;
    }

    let weekday = dayName(cursor);
    while (!activeDays.includes(weekday)) {
      cursor = addDays(cursor, 1);
      consumedToday = 0;

      if (isBeyondHorizon(cursor)) {
        unscheduledCount = remainingQueueItems();
        break;
      }

      weekday = dayName(cursor);
    }

    if (isBeyondHorizon(cursor)) {
      break;
    }

    const budget = getDailyBudget(dailyMinutes, weekday);
    consumedToday = 0;
    const dayUsageByGroup: Record<TaskDimensionGroup, number> = {
      deadline: 0,
      time: 0,
      effort: 0,
    };
    const queueSizes = getQueueSizes();
    const targets = buildDayTargets(budget, queueSizes);
    let scheduledAny = false;

    while (consumedToday < budget) {
      const remainingMinutes = budget - consumedToday;

      const groupOrder = (Object.keys(targets) as TaskDimensionGroup[]).sort(
        (a, b) => {
          const aGap = targets[a] - dayUsageByGroup[a];
          const bGap = targets[b] - dayUsageByGroup[b];
          return bGap - aGap;
        },
      );

      let selectedTask: (typeof groupQueues)[TaskDimensionGroup][number] | null = null;

      for (const group of groupOrder) {
        if (groupQueues[group].length === 0) {
          continue;
        }

        selectedTask = dequeueFirstFitting(group, remainingMinutes);
        if (selectedTask) {
          break;
        }
      }

      if (!selectedTask) {
        selectedTask = dequeueFallback(remainingMinutes);
      }

      if (!selectedTask) {
        break;
      }

      tasksToCreate.push({
        userId,
        playlistId: selectedTask.playlistId,
        playlistItemId: selectedTask.playlistItemId,
        title: selectedTask.title,
        description: selectedTask.description,
        scheduledDate: new Date(cursor),
        estimatedMinutes: selectedTask.estimatedMinutes,
        priority: selectedTask.priority,
        keyPoints: selectedTask.keyPoints,
        learningOutcomes: selectedTask.learningOutcomes,
      });

      consumedToday += selectedTask.estimatedMinutes;
      dayUsageByGroup[selectedTask.primaryGroup] += selectedTask.estimatedMinutes;
      scheduledAny = true;
    }

    if (!scheduledAny) {
      unscheduledCount = remainingQueueItems();
      break;
    }

    cursor = addDays(cursor, 1);
  }

  const createdCount = await withTransaction(async (tx) => {
    return taskRepo.createMany(tasksToCreate, tx);
  });

  return {
    createdCount,
    unscheduledCount,
    horizonDays: normalizedHorizonDays,
    groupSummary,
  };
}

export async function handleScheduleUpdate(userId: string) {
  // 🔥 central control point
  await rescheduleMissedTasks(userId);

  // future:
  // await rebalanceSchedule(userId);
}

export async function recomputeGoalSchedule(userId: string, goalId: string, reason = 'manual') {
  await handleScheduleUpdate(userId);

  return {
    goalId,
    reason,
    recomputeTriggered: true,
  };
}

type MissedResolutionType =
  | "push-forward"
  | "compress"
  | "convert-revision"
  | "drop";

async function applyMissedTaskResolution(
  userId: string,
  taskId: string,
  resolutionType: MissedResolutionType,
) {
  const task = await taskRepo.findById(taskId, userId);
  if (!task) {
    throw new ServiceNotFoundError("Task not found");
  }

  if (resolutionType === "drop") {
    const updatedCount = await taskRepo.updateStatus(taskId, userId, "SKIPPED", {
      rescheduledReason: "Dropped by user",
    });
    assertRowsAffected(updatedCount, "Task not found");

    const updated = await taskRepo.findById(taskId, userId);
    if (!updated) {
      throw new ServiceNotFoundError("Task not found");
    }

    return {
      type: "task-removed" as const,
      task: updated,
    };
  }

  const updatedCount = await taskRepo.updateStatus(taskId, userId, "MISSED", {
    rescheduledReason: `Resolution requested: ${resolutionType}`,
  });
  assertRowsAffected(updatedCount, "Task not found");

  if (resolutionType === "push-forward" && task.playlistId) {
    await shiftLectureChain(userId, task.playlistId, task.id);
  }

  return {
    type: "task-moved" as const,
    taskId,
    result: { success: true },
  };
}

export async function resolveMissedTask(
  userId: string,
  taskId: string,
  resolutionType: MissedResolutionType,
) {
  const resolutionResult = await applyMissedTaskResolution(
    userId,
    taskId,
    resolutionType,
  );

  await handleScheduleUpdate(userId);

  return resolutionResult;
}

export async function resolveMissedTasksBatch(
  userId: string,
  resolutions: Array<{
    taskId: string;
    type: MissedResolutionType;
  }>,
) {
  if (resolutions.length === 0) {
    return {
      processed: 0,
      results: [],
    };
  }

  const results: Array<{
    taskId: string;
    type: "task-removed" | "task-moved";
  }> = [];

  for (const resolution of resolutions) {
    const result = await applyMissedTaskResolution(
      userId,
      resolution.taskId,
      resolution.type,
    );
    results.push({
      taskId: resolution.taskId,
      type: result.type,
    });
  }

  await handleScheduleUpdate(userId);

  return {
    processed: results.length,
    results,
  };
}

export async function clearPlannerData(userId: string) {
  return withTransaction(async (tx) => {
    const [quizAttemptsDeleted, testResultCacheDeleted, tasksDeleted, skillLinksDeleted, playlistsDeleted] =
      await Promise.all([
        tx.quizAttempt.deleteMany({ where: { userId } }),
        tx.testResultCache.deleteMany({ where: { userId } }),
        tx.studyTask.deleteMany({ where: { userId } }),
        tx.skillPlaylistLink.deleteMany({ where: { userId } }),
        tx.learningPlaylist.deleteMany({ where: { userId } }),
      ]);

    return {
      quizAttemptsDeleted: quizAttemptsDeleted.count,
      testResultCacheDeleted: testResultCacheDeleted.count,
      tasksDeleted: tasksDeleted.count,
      skillLinksDeleted: skillLinksDeleted.count,
      playlistsDeleted: playlistsDeleted.count,
    };
  });
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

    const updatedCount = await taskRepo.updateStatus(task.id, userId, "RESCHEDULED", {
      scheduledDate: nextSlot,
      rescheduledReason: "Rebalanced schedule",
      rescheduleCountIncrement: 1,
    });
    assertRowsAffected(updatedCount, "Task not found");

    cursor = nextSlot;
  }
}
