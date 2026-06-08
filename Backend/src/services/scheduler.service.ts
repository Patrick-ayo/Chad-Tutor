import { taskRepo } from "../repositories";
import type { StudyTask } from "@prisma/client";
import { assertRowsAffected } from "./serviceErrors";

async function findNextSlotForTask(
  userId: string,
  fromDate: Date,
  estimatedMinutes: number,
): Promise<Date | null> {
  for (let i = 0; i < 7; i++) {
    const candidate = new Date(fromDate);
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

export async function reassignSlots(userId: string, tasks: StudyTask[]) {
  let cursor = new Date();

  for (const task of tasks) {
    const nextSlot = await findNextSlotForTask(
      userId,
      cursor,
      task.estimatedMinutes,
    );

    if (nextSlot) {
      const updatedCount = await taskRepo.updateStatus(task.id, userId, "RESCHEDULED", {
        scheduledDate: nextSlot,
        rescheduledReason: "Reassigned in scheduler",
        rescheduleCountIncrement: 1,
      });
      assertRowsAffected(updatedCount, "Task not found");

      cursor = nextSlot;
    }
  }
}

// --- Multi-topic scheduler & rescheduler (pure logic, DB updates are caller's responsibility)

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface Availability {
  activeDays: Weekday[];
  minutesPerDay: Record<Weekday, number>;
}

export interface ScheduledUnit {
  id: string;
  taskId?: string;
  title: string;
  type: "learn" | "practice" | "quiz" | "revision";
  topicId?: string;
  subtopicClusterId?: string;
  scheduledDate?: Date;
  deadlineDate?: Date;
  estimatedMinutes: number;
  actualMinutes?: number;
  status?: string;
  rescheduleCount?: number;
  originalEstimatedMinutes?: number;
}

export type ScheduledTask = ScheduledUnit;

export interface TopicQueue {
  topicId: string;
  deadlineDate: Date;
  tasks: ScheduledUnit[]; // ordered
  totalMinutes: number;
  remainingMinutes: number;
  burnRate?: number;
}

export interface BufferPoolEntry {
  date: Date;
  minutes: number;
}

export interface BufferPool {
  topicId: string;
  accumulatedMinutes: number;
  entries: BufferPoolEntry[];
}

export interface SuggestedAction {
  type: "increase-budget" | "extend-deadline" | "drop-low-priority";
  label: string;
  details: string;
}

export interface ScheduleWarning {
  topicId?: string;
  severity: "low" | "medium" | "high";
  code: "AT_RISK" | "BUFFER_EXHAUSTED" | "DEADLINE_BREACH" | "GLOBAL_REBALANCE_REQUIRED";
  message: string;
  suggestedActions: SuggestedAction[];
}

export interface RescheduleResult {
  updatedTasks: ScheduledUnit[];
  warnings: ScheduleWarning[];
  appliedStrategy: "absorb" | "push_forward" | "global_rebalance";
  suggestedActions?: SuggestedAction[];
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dayName(date: Date): Weekday {
  return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as Weekday;
}

function toYmd(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

function countActiveDaysBefore(availability: Availability, deadline: Date, fromDate?: Date): number {
  const start = startOfDay(fromDate ?? new Date());
  const end = startOfDay(deadline);
  if (end.getTime() < start.getTime()) return 0;
  let cursor = addDays(start, 1);
  let count = 0;
  while (cursor.getTime() <= end.getTime()) {
    if (availability.activeDays.includes(dayName(cursor))) count += 1;
    cursor = addDays(cursor, 1);
    if (count > 3650) break;
  }
  return Math.max(1, count);
}

export function buildBufferPoolsFromHistory(tasks: ScheduledUnit[]): BufferPool[] {
  const pools = new Map<string, BufferPool>();
  const now = new Date();
  for (const t of tasks) {
    if (!t.topicId) continue;
    if (!t.scheduledDate || typeof t.actualMinutes !== 'number') continue;
    const excess = (t.actualMinutes ?? 0) - (t.estimatedMinutes ?? 0);
    if (excess <= 0) continue;
    const key = t.topicId;
    const existing = pools.get(key) ?? { topicId: key, accumulatedMinutes: 0, entries: [] };
    existing.entries.push({ date: startOfDay(t.scheduledDate), minutes: excess });
    existing.accumulatedMinutes += excess;
    pools.set(key, existing);
  }

  for (const p of pools.values()) {
    p.entries = p.entries.filter((e) => (now.getTime() - e.date.getTime()) / (1000 * 60 * 60 * 24) <= 7);
    p.accumulatedMinutes = p.entries.reduce((s, e) => s + e.minutes, 0);
  }

  return Array.from(pools.values());
}

export function decayBufferPoolEntries(pool: BufferPool, now: Date = new Date()): BufferPool {
  const entries = pool.entries.filter((entry) => {
    const ageDays = (now.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24);
    return ageDays <= 7;
  });

  return {
    ...pool,
    entries,
    accumulatedMinutes: entries.reduce((sum, entry) => sum + entry.minutes, 0),
  };
}

export function addCompletionToBuffer(
  pools: BufferPool[],
  task: Pick<ScheduledUnit, "topicId" | "estimatedMinutes" | "actualMinutes" | "scheduledDate">,
  completedAt: Date = new Date(),
): BufferPool[] {
  if (!task.topicId || typeof task.actualMinutes !== "number") {
    return pools;
  }

  const excess = task.actualMinutes - (task.estimatedMinutes ?? 0);
  if (excess <= 0) {
    return pools;
  }

  const nextPools = [...pools];
  const index = nextPools.findIndex((pool) => pool.topicId === task.topicId);
  const entry = { date: startOfDay(completedAt), minutes: excess };

  if (index === -1) {
    nextPools.push({
      topicId: task.topicId,
      accumulatedMinutes: excess,
      entries: [entry],
    });
    return nextPools;
  }

  const existing = nextPools[index];
  nextPools[index] = {
    ...existing,
    accumulatedMinutes: existing.accumulatedMinutes + excess,
    entries: [...existing.entries, entry],
  };

  return nextPools;
}

function findBufferPoolForTopic(pools: BufferPool[], topicId?: string): BufferPool | undefined {
  if (!topicId) return undefined;
  return pools.find((p) => p.topicId === topicId);
}

export function scheduleMultiTopicTasks(
  topics: TopicQueue[],
  availability: Availability,
  startDate: Date,
): ScheduledUnit[] {
  const start = startOfDay(startDate ?? new Date());
  const activeDays = availability.activeDays;
  const dailyMinutes = availability.minutesPerDay;

  // initialize burnRates
  for (const t of topics) {
    const days = countActiveDaysBefore(availability, t.deadlineDate, start);
    t.burnRate = t.remainingMinutes / Math.max(1, days);
  }

  const scheduled: ScheduledUnit[] = [];
  let cursor = new Date(start);
  let daysProcessed = 0;
  const safetyDays = 365;

  while (topics.some((t) => t.remainingMinutes > 0) && daysProcessed < safetyDays) {
    // move to next active day
    while (!activeDays.includes(dayName(cursor))) cursor = addDays(cursor, 1);
    const weekday = dayName(cursor);
    const minutesPerDay = dailyMinutes[weekday] ?? 60;
    let remainingDayBudget = minutesPerDay;

    const openTopics = topics.filter((t) => t.remainingMinutes > 0).sort((a, b) => (b.burnRate ?? 0) - (a.burnRate ?? 0));
    const totalBurn = openTopics.reduce((s, t) => s + (t.burnRate ?? 0), 0) || 1;

    for (const topic of openTopics) {
      if (remainingDayBudget <= 0) break;
      const proportionalShare = Math.floor(((topic.burnRate ?? 0) / totalBurn) * minutesPerDay);
      const share = Math.max(0, Math.min(remainingDayBudget, proportionalShare || Math.min(remainingDayBudget, topic.remainingMinutes)));

      let allocated = 0;
      const pending = topic.tasks;
      let idx = pending.findIndex((p) => !scheduled.some((s) => s.taskId === p.taskId));
      if (idx === -1) idx = 0;

      while (idx < pending.length && allocated < share && remainingDayBudget > 0) {
        const clusterId = pending[idx].subtopicClusterId ?? `${topic.topicId}::${pending[idx].taskId ?? pending[idx].id}`;
        const clusterTasks: ScheduledUnit[] = [];
        let ci = idx;
        while (ci < pending.length && (pending[ci].subtopicClusterId ?? `${topic.topicId}::${pending[ci].taskId ?? pending[ci].id}`) === clusterId) {
          clusterTasks.push(pending[ci]);
          ci += 1;
        }

        const clusterTotal = clusterTasks.reduce((s, c) => s + (c.estimatedMinutes ?? 0), 0);

        if (clusterTotal <= Math.max(remainingDayBudget, 0) && clusterTotal <= share - allocated) {
          for (const ct of clusterTasks) {
            scheduled.push({ ...ct, scheduledDate: startOfDay(cursor) });
          }
          allocated += clusterTotal;
          remainingDayBudget -= clusterTotal;
          topic.remainingMinutes = Math.max(0, topic.remainingMinutes - clusterTotal);
          idx = ci;
          continue;
        }

        if (clusterTotal > minutesPerDay) {
          const watchTask = clusterTasks.find((c) => c.type === 'learn');
          if (watchTask && remainingDayBudget >= (watchTask.estimatedMinutes ?? 0)) {
            scheduled.push({ ...watchTask, scheduledDate: startOfDay(cursor) });
            topic.remainingMinutes = Math.max(0, topic.remainingMinutes - (watchTask.estimatedMinutes ?? 0));
            remainingDayBudget -= (watchTask.estimatedMinutes ?? 0);
          }
        }
        break;
      }
    }

    // deadline safety check
    for (const t of topics) {
      if (t.remainingMinutes <= 0) continue;
      const daysLeft = countActiveDaysBefore(availability, t.deadlineDate, cursor);
      const perDayNeeded = t.remainingMinutes / Math.max(1, daysLeft);
      const maxPerDay = Math.max(...Object.values(dailyMinutes));
      if (perDayNeeded > maxPerDay) {
        t.burnRate = t.burnRate ?? 0;
      }
    }

    cursor = addDays(cursor, 1);
    daysProcessed += 1;

    for (const t of topics) {
      if (t.remainingMinutes <= 0) { t.burnRate = 0; continue; }
      t.burnRate = t.remainingMinutes / Math.max(1, countActiveDaysBefore(availability, t.deadlineDate, cursor));
    }
  }

  return scheduled;
}

export function resolveMissedTasksMultiTopic(
  allTasks: ScheduledUnit[],
  missedTaskIds: string[],
  today: Date,
  availability: Availability,
): RescheduleResult {
  const warnings: ScheduleWarning[] = [];
  const updated = allTasks.map((t) => ({ ...t }));
  const pools = buildBufferPoolsFromHistory(updated);
  const missTasks = updated.filter((t) => missedTaskIds.includes(t.id));

  const dayMap = new Map<string, ScheduledUnit[]>();
  for (const t of updated) {
    const key = toYmd(t.scheduledDate ?? new Date());
    const list = dayMap.get(key) ?? [];
    list.push(t);
    dayMap.set(key, list);
  }

  const missedDays = new Set<string>(missTasks.map((t) => toYmd(t.scheduledDate ?? new Date())));
  const classifications = new Map<string, 'isolated' | 'day_miss' | 'streak' | 'burnout'>();

  for (const t of missTasks) {
    const key = toYmd(t.scheduledDate ?? new Date());
    const dayTasks = dayMap.get(key) ?? [];
    if (dayTasks.every((d) => missedTaskIds.includes(d.id))) { classifications.set(t.id, 'day_miss'); continue; }
    const prev = toYmd(addDays(new Date(t.scheduledDate ?? new Date()), -1));
    if (missedDays.has(prev)) { classifications.set(t.id, 'streak'); continue; }
    classifications.set(t.id, 'isolated');
  }

  // burnout detection
  const missDates = [...missTasks.map((t) => new Date(t.scheduledDate ?? new Date()).getTime())].sort();
  for (let i = 0; i < missDates.length; i++) {
    let count = 1; const start = missDates[i];
    for (let j = i + 1; j < missDates.length; j++) {
      if ((missDates[j] - start) / (1000 * 60 * 60 * 24) <= 7) count += 1;
    }
    if (count >= 4) { for (const t of missTasks) classifications.set(t.id, 'burnout'); break; }
  }

  const byTopic = new Map<string, ScheduledUnit[]>();
  for (const m of missTasks) {
    const list = byTopic.get(m.topicId ?? 'unknown') ?? [];
    list.push(m);
    byTopic.set(m.topicId ?? 'unknown', list);
  }

  let applied: RescheduleResult['appliedStrategy'] = 'absorb';
  const suggestions: SuggestedAction[] = [];
  const forceGlobalRebalance = missedDays.size >= 3;

  if (forceGlobalRebalance) {
    applied = 'global_rebalance';
  }

  for (const [topicId, tasks] of byTopic.entries()) {
    if (forceGlobalRebalance) {
      break;
    }

    const remaining = updated
      .filter((x) => x.topicId === topicId && x.status !== 'completed')
      .reduce((s, x) => s + (x.estimatedMinutes ?? 0), 0);
    const deadline = tasks[0]?.deadlineDate ?? addDays(today, 7);
    const daysLeft = countActiveDaysBefore(availability, deadline, today);
    const burn = remaining / Math.max(1, daysLeft);

    if (burn > Math.max(...Object.values(availability.minutesPerDay))) {
      warnings.push({
        topicId,
        severity: "high",
        code: "AT_RISK",
        message: "Topic needs more time than the current daily budget allows.",
        suggestedActions: [
          {
            type: "increase-budget",
            label: "Increase daily budget",
            details: "Increase minutes per day to reduce rescheduling pressure.",
          },
          {
            type: "extend-deadline",
            label: "Extend deadline",
            details: "Move the deadline out to create more active days.",
          },
        ],
      });
    }

    for (const missed of tasks) {
      const cls = classifications.get(missed.id) ?? 'isolated';
      const pool = findBufferPoolForTopic(pools, topicId);

      if (cls === 'isolated' && pool && pool.accumulatedMinutes >= (missed.estimatedMinutes ?? 0)) {
        pool.accumulatedMinutes -= (missed.estimatedMinutes ?? 0);
        missed.scheduledDate = addDays(today, 1);
        missed.rescheduleCount = (missed.rescheduleCount ?? 0) + 1;
        missed.status = 'pending';
        applied = 'absorb';
        continue;
      }

      const avgPerDay = Math.floor(Object.values(availability.minutesPerDay).reduce((s, v) => s + v, 0) / Math.max(1, availability.activeDays.length));
      if (cls === 'isolated' && daysLeft * avgPerDay >= remaining) {
        missed.scheduledDate = addDays(today, 1);
        missed.rescheduleCount = (missed.rescheduleCount ?? 0) + 1;
        missed.status = 'pending';
        applied = 'absorb';
        continue;
      }

      // Push forward
      missed.scheduledDate = addDays(today, 1);
      missed.rescheduleCount = (missed.rescheduleCount ?? 0) + 1;
      missed.status = 'pending';
      applied = 'push_forward';

      // chain shift within topic by 1 day
      const later = updated.filter((x) => x.topicId === topicId && (x.scheduledDate ?? new Date()) > (missed.scheduledDate ?? new Date()))
        .sort((a, b) => (a.scheduledDate ?? new Date()).getTime() - (b.scheduledDate ?? new Date()).getTime());
      for (const lt of later) { lt.scheduledDate = addDays(lt.scheduledDate ?? today, 1); lt.rescheduleCount = (lt.rescheduleCount ?? 0) + 1; }

      const last = later[later.length - 1];
      if (last && (last.scheduledDate ?? new Date()).getTime() > (deadline).getTime()) { applied = 'global_rebalance'; break; }
    }
    if (applied === 'global_rebalance') break;
  }

  for (const task of updated) {
    if ((task.rescheduleCount ?? 0) >= 3 && task.type !== 'revision') {
      const revisionTask = task as ScheduledUnit & { notes?: string };
      revisionTask.type = 'revision';
      revisionTask.originalEstimatedMinutes = revisionTask.originalEstimatedMinutes ?? revisionTask.estimatedMinutes;
      revisionTask.estimatedMinutes = Math.max(1, Math.round((revisionTask.originalEstimatedMinutes ?? revisionTask.estimatedMinutes) * 0.4));
      revisionTask.notes = `${revisionTask.notes ? `${revisionTask.notes} ` : ''}Converted to revision after 3 missed attempts.`;
    }
  }

  const missedDayCount = new Set(missTasks.map((task) => toYmd(task.scheduledDate ?? new Date()))).size;
  if (missedDayCount >= 3 && applied !== 'global_rebalance') {
    applied = 'global_rebalance';
  }

  if (applied === 'global_rebalance') {
    // collect incomplete tasks and re-run scheduling logic
    const grouped = new Map<string, TopicQueue>();
    const incomplete = updated.filter((t) => t.status !== 'completed');
    const topicsArr: TopicQueue[] = [];
    const map = new Map<string, ScheduledUnit[]>();
    for (const t of incomplete) { const l = map.get(t.topicId ?? 'unknown') ?? []; l.push(t); map.set(t.topicId ?? 'unknown', l); }
    for (const [tid, list] of map.entries()) {
      const total = list.reduce((s, x) => s + (x.estimatedMinutes ?? 0), 0);
      const deadline = list.find((x) => x.deadlineDate)?.deadlineDate ?? addDays(today, 7);
      topicsArr.push({ topicId: tid, deadlineDate: deadline, tasks: list, totalMinutes: total, remainingMinutes: total });
    }
    const rescheduled = scheduleMultiTopicTasks(topicsArr, availability, today);

    // capacity check
    const activeLeft = countActiveDaysBefore(availability, addDays(today, 30), today);
    const capacity = activeLeft * Math.max(...Object.values(availability.minutesPerDay));
    const totalRem = topicsArr.reduce((s, t) => s + t.remainingMinutes, 0);
    if (totalRem > capacity) {
      suggestions.push({ type: 'increase-budget', label: 'Increase daily budget', details: 'Increase minutes per day to meet deadlines.' });
      const deficit = totalRem - capacity; const minExtraDays = Math.ceil(deficit / Math.max(...Object.values(availability.minutesPerDay)));
      suggestions.push({ type: 'extend-deadline', label: 'Extend deadlines', details: `Extend by at least ${minExtraDays} days.` });
      // drop low priority: quizzes/practices first
      const dropCandidates = incomplete.filter((t) => t.type === 'quiz' || t.type === 'practice');
      let dropped = 0;
      for (const d of dropCandidates) { d.status = 'skipped'; dropped += d.estimatedMinutes; if (totalRem - dropped <= capacity) break; }
    }

    return { updatedTasks: updated, warnings, appliedStrategy: 'global_rebalance', suggestedActions: suggestions };
  }

  return { updatedTasks: updated, warnings, appliedStrategy: applied, suggestedActions: suggestions };
}
