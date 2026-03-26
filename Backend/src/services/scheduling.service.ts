export type SchedulePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SchedulableTask {
  id: string;
  title: string;
  subject?: string;
  durationMinutes: number;
  priority: SchedulePriority;
  decayRate?: 'low' | 'medium' | 'high';
  deadline?: Date | string;
  difficulty?: number; // 1-5
  progress?: number; // 0-100
  accuracy?: number; // 0-100
  attempts?: number;
  status?: 'PENDING' | 'SKIPPED' | 'COMPLETED';
  isRevision?: boolean;
  revisionOfTaskId?: string;
  revisionIntervalDays?: number;
  revisionStrengthLevel?: 'STRONG' | 'MEDIUM' | 'WEAK';
}

export interface UserSchedulingConstraints {
  dailyAvailableMinutes: number;
  loadFactor: number; // 0-1
  bufferRatio?: number; // 0-1, fallback from loadFactor
  horizonDays?: number;
  weeklyPerformance?: WeeklyPerformanceRecord[];
  revisionWeightFactor?: number; // 0.4-1.1, default 0.9
  maxRevisionDailyRatio?: number; // 0.1-0.8, default 0.4
}

export interface WeeklyPerformanceRecord {
  weekStartDate: string; // ISO yyyy-mm-dd (week bucket)
  plannedMinutes: number;
  actualMinutes: number;
}

export interface AdaptiveCapacitySnapshot {
  evaluatedWeeks: number;
  adjustedLoadFactor: number;
  adjustedEffectiveCapacityMinutes: number;
  trend: 'exceeding' | 'underperforming' | 'stable' | 'insufficient-data';
}

export interface ScoredTask extends SchedulableTask {
  urgency: number;
  weakness: number;
  score: number;
}

export interface ScheduledTask {
  taskId: string;
  title: string;
  subject?: string;
  allocatedMinutes: number;
  score: number;
  urgency: number;
  weakness: number;
  locked?: boolean;
}

export interface DailySchedule {
  date: string;
  capacityMinutes: number;
  effectiveCapacityMinutes: number;
  bufferMinutes: number;
  scheduledMinutes: number;
  tasks: ScheduledTask[];
  completed?: boolean;
}

export interface StructuredSchedule {
  days: DailySchedule[];
  unscheduledTasks: ScoredTask[];
  adaptiveCapacity: AdaptiveCapacitySnapshot;
  overload: {
    isOverloaded: boolean;
    requiredMinutes: number;
    availableMinutes: number;
    deficitMinutes: number;
    suggestions: {
      increaseDailyTimeByMinutes: number;
      reduceTasksByMinutes: number;
      extendDeadlineByDays: number;
    };
  };
  meta: {
    totalTasks: number;
    scheduledTasks: number;
    unscheduledTasks: number;
    totalScheduledMinutes: number;
  };
}

export interface SkipHandlingResult {
  action: 'buffered' | 'rebalanced' | 'ignored';
  skippedTaskId: string;
  schedule: StructuredSchedule;
  reason?: string;
}

const PRIORITY_WEIGHT: Record<SchedulePriority, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
};

const PRIORITY_ORDER: SchedulePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const DEFAULT_ACCURACY = 70;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function parseDeadline(deadline?: Date | string): Date | null {
  if (!deadline) return null;
  const parsed = deadline instanceof Date ? deadline : new Date(deadline);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysUntil(deadline: Date, now: Date): number {
  const diffMs = deadline.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  return Math.max(1, days);
}

function normalizeProgress(progress?: number): number {
  if (progress === undefined || progress === null) return 0;
  return clamp(progress, 0, 100);
}

function normalizeDifficulty(difficulty?: number): number {
  if (difficulty === undefined || difficulty === null) return 3;
  return clamp(difficulty, 1, 5);
}

export function calculateUrgency(task: SchedulableTask, now = new Date()): number {
  const priorityBoost = PRIORITY_WEIGHT[task.priority] * 10;
  const deadline = parseDeadline(task.deadline);

  if (!deadline) {
    return clamp(30 + priorityBoost, 0, 100);
  }

  const dueInDays = daysUntil(deadline, now);
  const timePressure = 100 / dueInDays;
  return clamp(timePressure + priorityBoost, 0, 100);
}

export function calculateWeakness(task: SchedulableTask): number {
  const progress = normalizeProgress(task.progress);
  const difficulty = normalizeDifficulty(task.difficulty);

  const knowledgeGap = 100 - progress;
  const difficultyFactor = 0.6 + difficulty / 10;

  return clamp(knowledgeGap * difficultyFactor, 0, 100);
}

export function calculateScore(task: SchedulableTask, now = new Date()): number {
  const urgency = calculateUrgency(task, now);
  const weakness = calculateWeakness(task);
  const priorityScore = PRIORITY_WEIGHT[task.priority] * 25;

  // Weighted composite score: urgency + weakness + baseline priority
  return Number((urgency * 0.5 + weakness * 0.35 + priorityScore * 0.15).toFixed(2));
}

function calculateSubjectUrgencyIndex(tasks: ScoredTask[]): Map<string, number> {
  const accumulator = new Map<string, { totalUrgency: number; count: number }>();

  for (const task of tasks) {
    const key = getSubjectKey(task);
    const entry = accumulator.get(key) ?? { totalUrgency: 0, count: 0 };
    entry.totalUrgency += task.urgency;
    entry.count += 1;
    accumulator.set(key, entry);
  }

  const result = new Map<string, number>();
  for (const [subject, entry] of accumulator.entries()) {
    result.set(subject, entry.totalUrgency / Math.max(1, entry.count));
  }

  return result;
}

export function scoreAndSortTasks(
  tasks: SchedulableTask[],
  now = new Date(),
  revisionWeightFactor = 0.9,
): ScoredTask[] {
  const baseScored = tasks
    .map((task) => {
      const urgency = calculateUrgency(task, now);
      const weakness = calculateWeakness(task);
      const score = calculateScore(task, now);

      return {
        ...task,
        urgency,
        weakness,
        score,
      };
    });

  const subjectUrgencyIndex = calculateSubjectUrgencyIndex(baseScored);
  const averageSubjectUrgency =
    [...subjectUrgencyIndex.values()].reduce((sum, value) => sum + value, 0) /
    Math.max(1, subjectUrgencyIndex.size);

  const highUrgencyNonRevisionScores = baseScored
    .filter((task) => !task.isRevision && task.urgency >= 85)
    .map((task) => task.score);

  const minHighUrgencyScore =
    highUrgencyNonRevisionScores.length > 0
      ? Math.min(...highUrgencyNonRevisionScores)
      : null;

  const normalizedRevisionWeight = clamp(revisionWeightFactor, 0.4, 1.1);

  return baseScored
    .map((task) => {
      if (!task.isRevision) {
        return task;
      }

      const subjectUrgency = subjectUrgencyIndex.get(getSubjectKey(task)) ?? averageSubjectUrgency;
      const lowUrgencySubjectPenalty = subjectUrgency < averageSubjectUrgency ? 0.8 : 1;

      let adjustedScore = task.score * normalizedRevisionWeight * lowUrgencySubjectPenalty;

      // Revisions should never outrank truly high-urgency non-revision tasks.
      if (minHighUrgencyScore !== null) {
        adjustedScore = Math.min(adjustedScore, minHighUrgencyScore - 0.01);
      }

      return {
        ...task,
        score: Number(clamp(adjustedScore, 0, 100).toFixed(2)),
      };
    })
    .sort((a, b) => b.score - a.score);
}

function toIsoDate(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function createRevisionTaskId(taskId: string, intervalDays: number): string {
  return `${taskId}::revision::d${intervalDays}`;
}

function normalizeAccuracy(accuracy?: number, progress?: number): number {
  if (typeof accuracy === 'number') {
    return clamp(accuracy, 0, 100);
  }

  if (typeof progress === 'number') {
    return clamp(progress, 0, 100);
  }

  return DEFAULT_ACCURACY;
}

function normalizeDecayRate(decayRate?: 'low' | 'medium' | 'high'): 'low' | 'medium' | 'high' {
  if (decayRate === 'low' || decayRate === 'high') {
    return decayRate;
  }

  return 'medium';
}

function inferRevisionStrengthLevel(
  accuracy: number,
  attempts?: number,
): 'STRONG' | 'MEDIUM' | 'WEAK' {
  const attemptCount = Math.max(0, attempts ?? 0);

  if (accuracy >= 85 && attemptCount <= 2) {
    return 'STRONG';
  }

  if (accuracy < 60 || attemptCount >= 5) {
    return 'WEAK';
  }

  return 'MEDIUM';
}

function selectRevisionIntervals(
  accuracy: number,
  attempts?: number,
): number[] {
  const attemptCount = Math.max(0, attempts ?? 0);

  if (accuracy >= 85) {
    return attemptCount >= 4 ? [1, 3, 7] : [3, 7];
  }

  if (accuracy >= 60) {
    return [1, 3, 7];
  }

  return [1, 2, 3, 5, 7];
}

function calculatePerformanceWeakness(task: SchedulableTask): number {
  const modelWeakness = calculateWeakness(task);
  const accuracy = normalizeAccuracy(task.accuracy, task.progress);
  const accuracyGap = 100 - accuracy;
  const attemptCount = Math.max(0, task.attempts ?? 0);
  const attemptPenalty = attemptCount >= 5 ? 10 : attemptCount >= 3 ? 5 : 0;

  // Revision cadence should primarily follow performance signals.
  return clamp(modelWeakness * 0.6 + accuracyGap * 0.4 + attemptPenalty, 0, 100);
}

function adjustIntervalsForWeakness(
  intervals: number[],
  weaknessScore: number,
): number[] {
  const normalizedWeakness = clamp(weaknessScore, 0, 100);

  if (normalizedWeakness >= 70) {
    // High weakness: increase frequency by pulling intervals closer.
    const boosted = intervals.map((interval) => Math.max(1, interval - 1));
    return [...new Set([1, ...boosted])].sort((a, b) => a - b);
  }

  if (normalizedWeakness <= 35) {
    // Low weakness: reduce frequency by pushing intervals out.
    const relaxed = intervals.map((interval) => interval + 1);
    return [...new Set(relaxed)].sort((a, b) => a - b);
  }

  return [...new Set(intervals)].sort((a, b) => a - b);
}

function adjustIntervalsForDecayRate(
  intervals: number[],
  decayRate?: 'low' | 'medium' | 'high',
): number[] {
  const normalizedDecay = normalizeDecayRate(decayRate);

  if (normalizedDecay === 'medium') {
    return [...new Set(intervals)].sort((a, b) => a - b);
  }

  const adjusted = intervals.map((interval) => {
    if (normalizedDecay === 'high') {
      // Faster memory decay: schedule earlier revisions.
      return Math.max(1, interval - 2);
    }

    // Slower memory decay: push revisions later.
    return interval + 2;
  });

  return [...new Set(adjusted)].sort((a, b) => a - b);
}

function lowerPriorityOneStep(priority: SchedulePriority): SchedulePriority {
  const index = PRIORITY_ORDER.indexOf(priority);
  if (index <= 0) {
    return 'LOW';
  }

  return PRIORITY_ORDER[index - 1];
}

function derivePostRevisionPerformance(
  baseTask: SchedulableTask,
  completedRevisionTask: SchedulableTask,
): Pick<SchedulableTask, 'progress' | 'accuracy' | 'attempts'> {
  const revisionAccuracy = normalizeAccuracy(
    completedRevisionTask.accuracy,
    completedRevisionTask.progress,
  );
  const baseAccuracy = normalizeAccuracy(baseTask.accuracy, baseTask.progress);
  const baseProgress = normalizeProgress(baseTask.progress);
  const revisionProgress = normalizeProgress(completedRevisionTask.progress);
  const baseAttempts = Math.max(0, baseTask.attempts ?? 0);
  const revisionAttempts = Math.max(0, completedRevisionTask.attempts ?? 0);

  const mergedAccuracy = clamp(baseAccuracy * 0.4 + revisionAccuracy * 0.6, 0, 100);
  const mergedProgress = clamp(baseProgress * 0.5 + revisionProgress * 0.5, 0, 100);

  return {
    progress: Number(mergedProgress.toFixed(2)),
    accuracy: Number(mergedAccuracy.toFixed(2)),
    attempts: baseAttempts + revisionAttempts,
  };
}

function buildFutureRevisionIntervals(
  parentTask: SchedulableTask,
  afterInterval: number,
): number[] {
  const accuracy = normalizeAccuracy(parentTask.accuracy, parentTask.progress);
  const performanceWeakness = calculatePerformanceWeakness(parentTask);

  const candidate = adjustIntervalsForDecayRate(
    adjustIntervalsForWeakness(
      selectRevisionIntervals(accuracy, parentTask.attempts),
      performanceWeakness,
    ),
    parentTask.decayRate,
  );

  const filtered = candidate.filter((interval) => interval > afterInterval);
  if (filtered.length > 0) {
    return filtered;
  }

  return [afterInterval + 2, afterInterval + 4, afterInterval + 7];
}

function retuneFutureRevisionTasks(
  tasks: SchedulableTask[],
  revisionOfTaskId: string,
  completedIntervalDays: number,
  now: Date,
  improvedPerformance: boolean,
): SchedulableTask[] {
  const parentTask = tasks.find((task) => task.id === revisionOfTaskId);
  if (!parentTask) {
    return tasks;
  }

  const normalizedDecayRate = normalizeDecayRate(parentTask.decayRate);
  const updatedStrength = inferRevisionStrengthLevel(
    normalizeAccuracy(parentTask.accuracy, parentTask.progress),
    parentTask.attempts,
  );
  const futureIntervals = buildFutureRevisionIntervals(parentTask, completedIntervalDays);

  const futureRevisions = tasks
    .filter(
      (task) =>
        task.isRevision &&
        task.revisionOfTaskId === revisionOfTaskId &&
        task.status !== 'COMPLETED',
    )
    .sort(
      (a, b) =>
        (a.revisionIntervalDays ?? Number.MAX_SAFE_INTEGER) -
        (b.revisionIntervalDays ?? Number.MAX_SAFE_INTEGER),
    );

  const intervalByTaskId = new Map<string, number>();
  for (let i = 0; i < futureRevisions.length; i++) {
    const fallback = futureIntervals[futureIntervals.length - 1] + Math.max(1, i - futureIntervals.length + 1) * 2;
    intervalByTaskId.set(futureRevisions[i].id, futureIntervals[i] ?? fallback);
  }

  return tasks.map((task) => {
    if (!task.isRevision || task.revisionOfTaskId !== revisionOfTaskId || task.status === 'COMPLETED') {
      return task;
    }

    const intervalDays = intervalByTaskId.get(task.id) ?? task.revisionIntervalDays ?? completedIntervalDays + 2;
    const nextPriority = improvedPerformance
      ? lowerPriorityOneStep(task.priority)
      : task.priority;

    return {
      ...task,
      priority: nextPriority,
      decayRate: normalizedDecayRate,
      revisionIntervalDays: intervalDays,
      revisionStrengthLevel: updatedStrength,
      deadline: addDays(now, intervalDays),
      title: `${parentTask.title} (Revision +${intervalDays}d)`,
    };
  });
}

function createRevisionTasksFromCompletion(
  task: SchedulableTask,
  now: Date,
  existingIds: Set<string>,
): SchedulableTask[] {
  if (task.isRevision) {
    return [];
  }

  const revisionDuration = Math.max(15, Math.floor(task.durationMinutes * 0.5));
  const revisionPriority = task.priority;
  const accuracy = normalizeAccuracy(task.accuracy, task.progress);
  const performanceWeakness = calculatePerformanceWeakness(task);
  const intervals = adjustIntervalsForDecayRate(
    adjustIntervalsForWeakness(
      selectRevisionIntervals(accuracy, task.attempts),
      performanceWeakness,
    ),
    task.decayRate,
  );
  const revisionStrengthLevel = inferRevisionStrengthLevel(accuracy, task.attempts);
  const normalizedDecayRate = normalizeDecayRate(task.decayRate);

  const revisions: SchedulableTask[] = [];
  for (const intervalDays of intervals) {
    const revisionId = createRevisionTaskId(task.id, intervalDays);
    if (existingIds.has(revisionId)) {
      continue;
    }

    revisions.push({
      id: revisionId,
      title: `${task.title} (Revision +${intervalDays}d)`,
      subject: task.subject,
      durationMinutes: revisionDuration,
      priority: revisionPriority,
      decayRate: normalizedDecayRate,
      deadline: addDays(now, intervalDays),
      difficulty: task.difficulty,
      progress: 0,
      accuracy: 0,
      attempts: 0,
      status: 'PENDING',
      isRevision: true,
      revisionOfTaskId: task.id,
      revisionIntervalDays: intervalDays,
      revisionStrengthLevel,
    });
  }

  return revisions;
}

function uniqueSortedDates(dates: string[]): string[] {
  return [...new Set(dates)].sort((a, b) => a.localeCompare(b));
}

function isFutureDate(date: string, todayIso: string): boolean {
  return date > todayIso;
}

function startOfIsoWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const isoDay = day === 0 ? 7 : day;
  d.setDate(d.getDate() - (isoDay - 1));
  return d;
}

function computeAdaptiveCapacity(
  user: UserSchedulingConstraints,
  baseEffectiveCapacity: number,
  now: Date,
): AdaptiveCapacitySnapshot {
  const records = (user.weeklyPerformance ?? [])
    .filter((record) => record.plannedMinutes > 0)
    .filter((record) => {
      const weekDate = new Date(record.weekStartDate);
      if (Number.isNaN(weekDate.getTime())) return false;
      // Update weekly using completed weeks only.
      return weekDate.getTime() < startOfIsoWeek(now).getTime();
    })
    .sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate))
    .slice(-4);

  if (records.length < 2) {
    return {
      evaluatedWeeks: records.length,
      adjustedLoadFactor: clamp(user.loadFactor, 0.1, 1),
      adjustedEffectiveCapacityMinutes: baseEffectiveCapacity,
      trend: 'insufficient-data',
    };
  }

  const recentRatios = records.map((record) => record.actualMinutes / Math.max(1, record.plannedMinutes));
  const consecutiveExceeding = recentRatios.slice(-2).every((ratio) => ratio >= 1.1);
  const consecutiveUnderperforming = recentRatios.slice(-2).every((ratio) => ratio <= 0.85);

  let adjustedLoadFactor = clamp(user.loadFactor, 0.1, 1);
  let trend: AdaptiveCapacitySnapshot['trend'] = 'stable';

  if (consecutiveExceeding) {
    adjustedLoadFactor = clamp(adjustedLoadFactor + 0.05, 0.1, 1);
    trend = 'exceeding';
  } else if (consecutiveUnderperforming) {
    adjustedLoadFactor = clamp(adjustedLoadFactor - 0.07, 0.1, 1);
    trend = 'underperforming';
  }

  const adjustedEffectiveCapacityMinutes = Math.max(
    1,
    Math.floor(user.dailyAvailableMinutes * adjustedLoadFactor),
  );

  return {
    evaluatedWeeks: records.length,
    adjustedLoadFactor,
    adjustedEffectiveCapacityMinutes,
    trend,
  };
}

function getSubjectKey(task: { subject?: string }): string {
  const normalized = task.subject?.trim();
  return normalized && normalized.length > 0 ? normalized : 'General';
}

function buildSubjectQueues(tasks: ScoredTask[]): Map<string, ScoredTask[]> {
  const queues = new Map<string, ScoredTask[]>();

  for (const task of tasks) {
    const key = getSubjectKey(task);
    const list = queues.get(key) ?? [];
    list.push(task);
    queues.set(key, list);
  }

  for (const [key, list] of queues.entries()) {
    queues.set(
      key,
      [...list].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.urgency - a.urgency;
      }),
    );
  }

  return queues;
}

function calculateSubjectUrgencyMap(subjectQueues: Map<string, ScoredTask[]>): Map<string, number> {
  const urgencyMap = new Map<string, number>();

  for (const [subject, tasks] of subjectQueues.entries()) {
    // Duration-weighted urgency prioritizes subjects with many urgent minutes due.
    const weightedUrgency = tasks.reduce((sum, task) => sum + task.urgency * task.durationMinutes, 0);
    urgencyMap.set(subject, Math.max(1, weightedUrgency));
  }

  return urgencyMap;
}

function allocateDailyMinutesBySubject(
  subjectUrgency: Map<string, number>,
  remainingMinutes: number,
): Map<string, number> {
  const budgets = new Map<string, number>();
  const subjects = [...subjectUrgency.keys()];

  if (subjects.length === 0 || remainingMinutes <= 0) {
    return budgets;
  }

  const totalUrgency = subjects.reduce((sum, subject) => sum + (subjectUrgency.get(subject) ?? 0), 0);
  let allocated = 0;

  const ordered = [...subjects].sort(
    (a, b) => (subjectUrgency.get(b) ?? 0) - (subjectUrgency.get(a) ?? 0),
  );

  for (const subject of ordered) {
    const ratio = (subjectUrgency.get(subject) ?? 0) / Math.max(1, totalUrgency);
    const minutes = Math.floor(remainingMinutes * ratio);
    budgets.set(subject, minutes);
    allocated += minutes;
  }

  // Give remainder minutes to highest-urgency subjects first.
  let leftover = remainingMinutes - allocated;
  let idx = 0;
  while (leftover > 0 && ordered.length > 0) {
    const subject = ordered[idx % ordered.length];
    budgets.set(subject, (budgets.get(subject) ?? 0) + 1);
    leftover -= 1;
    idx += 1;
  }

  return budgets;
}

function isRevisionTask(
  task: { isRevision?: boolean; id?: string; taskId?: string; title?: string },
): boolean {
  if (task.isRevision === true) {
    return true;
  }

  const identifier = task.id ?? task.taskId ?? '';
  if (identifier.includes('::revision::')) {
    return true;
  }

  return (task.title ?? '').toLowerCase().includes('(revision');
}

function isUrgentDeadlineTask(task: ScoredTask, now: Date): boolean {
  if (isRevisionTask(task)) {
    return false;
  }

  const deadline = parseDeadline(task.deadline);
  if (!deadline) {
    return task.urgency >= 95;
  }

  return daysUntil(deadline, now) <= 2 || task.urgency >= 90;
}

function pushScheduledTask(dayTasks: ScheduledTask[], task: ScoredTask): void {
  dayTasks.push({
    taskId: task.id,
    title: task.title,
    subject: task.subject,
    allocatedMinutes: task.durationMinutes,
    score: task.score,
    urgency: task.urgency,
    weakness: task.weakness,
    locked: false,
  });
}

function removeScheduledFromPending(pending: ScoredTask[], scheduledIds: Set<string>): void {
  if (scheduledIds.size === 0) {
    return;
  }

  for (let i = pending.length - 1; i >= 0; i--) {
    if (scheduledIds.has(pending[i].id)) {
      pending.splice(i, 1);
    }
  }
}

function scheduleUrgentDeadlinesFirst(
  dayTasks: ScheduledTask[],
  pending: ScoredTask[],
  remaining: number,
  now: Date,
): number {
  if (remaining <= 0 || pending.length === 0) {
    return remaining;
  }

  const urgentCandidates = pending
    .filter((task) => isUrgentDeadlineTask(task, now))
    .sort((a, b) => {
      if (b.urgency !== a.urgency) return b.urgency - a.urgency;

      const aDeadline = parseDeadline(a.deadline);
      const bDeadline = parseDeadline(b.deadline);
      const aTime = aDeadline?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = bDeadline?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  const scheduledIds = new Set<string>();
  for (const task of urgentCandidates) {
    if (task.durationMinutes <= remaining) {
      pushScheduledTask(dayTasks, task);
      remaining -= task.durationMinutes;
      scheduledIds.add(task.id);
    }

    if (remaining <= 0) {
      break;
    }
  }

  removeScheduledFromPending(pending, scheduledIds);
  return remaining;
}

function fillDayWithSubjectBalancing(
  dayTasks: ScheduledTask[],
  pending: ScoredTask[],
  remaining: number,
  taskFilter: (task: ScoredTask) => boolean,
  allocationCapMinutes = Number.MAX_SAFE_INTEGER,
): { remaining: number; allocatedMinutes: number } {
  if (remaining <= 0 || pending.length === 0) {
    return { remaining, allocatedMinutes: 0 };
  }

  const allocationLimit = Math.max(0, Math.min(remaining, allocationCapMinutes));
  if (allocationLimit <= 0) {
    return { remaining, allocatedMinutes: 0 };
  }

  const candidates = pending.filter(taskFilter);
  if (candidates.length === 0) {
    return { remaining, allocatedMinutes: 0 };
  }

  const subjectQueues = buildSubjectQueues(candidates);
  const subjectUrgency = calculateSubjectUrgencyMap(subjectQueues);
  const subjectBudgets = allocateDailyMinutesBySubject(subjectUrgency, allocationLimit);
  const orderedSubjects = [...subjectUrgency.keys()].sort(
    (a, b) => (subjectUrgency.get(b) ?? 0) - (subjectUrgency.get(a) ?? 0),
  );

  const scheduledIds = new Set<string>();
  let allocatedMinutes = 0;

  // Pass 1: honor proportional subject budgets.
  for (const subject of orderedSubjects) {
    let subjectRemaining = subjectBudgets.get(subject) ?? 0;
    const queue = subjectQueues.get(subject) ?? [];

    for (const task of queue) {
      if (scheduledIds.has(task.id)) {
        continue;
      }

      const fitsGlobalLimit = allocatedMinutes + task.durationMinutes <= allocationLimit;

      if (
        task.durationMinutes <= subjectRemaining &&
        task.durationMinutes <= remaining &&
        fitsGlobalLimit
      ) {
        pushScheduledTask(dayTasks, task);

        remaining -= task.durationMinutes;
        subjectRemaining -= task.durationMinutes;
        allocatedMinutes += task.durationMinutes;
        scheduledIds.add(task.id);
      }

      if (remaining <= 0 || subjectRemaining <= 0 || allocatedMinutes >= allocationLimit) {
        break;
      }
    }

    if (remaining <= 0 || allocatedMinutes >= allocationLimit) {
      break;
    }
  }

  // Pass 2: use any remainder with urgency-prioritized subject scan to avoid wasted time.
  while (remaining > 0 && allocatedMinutes < allocationLimit) {
    let picked: ScoredTask | null = null;

    for (const subject of orderedSubjects) {
      const queue = subjectQueues.get(subject) ?? [];
      const candidate = queue.find(
        (task) =>
          !scheduledIds.has(task.id) &&
          task.durationMinutes <= remaining &&
          allocatedMinutes + task.durationMinutes <= allocationLimit,
      );
      if (candidate) {
        picked = candidate;
        break;
      }
    }

    if (!picked) {
      break;
    }

    pushScheduledTask(dayTasks, picked);
    remaining -= picked.durationMinutes;
    allocatedMinutes += picked.durationMinutes;
    scheduledIds.add(picked.id);
  }

  removeScheduledFromPending(pending, scheduledIds);

  return { remaining, allocatedMinutes };
}

export function generateSchedule(
  tasks: SchedulableTask[],
  user: UserSchedulingConstraints,
  existingSchedule?: StructuredSchedule,
): StructuredSchedule {
  const now = new Date();
  const todayIso = toIsoDate(now);
  const horizonDays = Math.max(1, user.horizonDays ?? 14);
  const capacityMinutes = Math.max(1, user.dailyAvailableMinutes);
  const baseEffectiveCapacity = Math.max(1, Math.floor(capacityMinutes * clamp(user.loadFactor, 0.1, 1)));
  const adaptiveCapacity = computeAdaptiveCapacity(user, baseEffectiveCapacity, now);
  const effectiveCapacity = adaptiveCapacity.adjustedEffectiveCapacityMinutes;
  const bufferMinutes = Math.max(
    0,
    Math.floor(
      capacityMinutes * (user.bufferRatio ?? clamp(1 - user.loadFactor, 0.05, 0.5)),
    ),
  );

  const normalizedTasks = tasks.filter((task) => task.status !== 'COMPLETED');
  const sorted = scoreAndSortTasks(
    normalizedTasks,
    now,
    user.revisionWeightFactor ?? 0.9,
  );

  const preservedDays = (existingSchedule?.days ?? []).filter(
    (day) => day.completed === true || !isFutureDate(day.date, todayIso),
  );

  const lockedTasksByDate = new Map<string, ScheduledTask[]>();
  for (const day of existingSchedule?.days ?? []) {
    if (!isFutureDate(day.date, todayIso) || day.completed === true) {
      continue;
    }

    const lockedTasks = day.tasks.filter((task) => task.locked === true);
    if (lockedTasks.length > 0) {
      lockedTasksByDate.set(day.date, lockedTasks);
    }
  }

  const immutableTaskIds = new Set<string>();
  for (const day of preservedDays) {
    for (const task of day.tasks) {
      immutableTaskIds.add(task.taskId);
    }
  }
  for (const lockedTasks of lockedTasksByDate.values()) {
    for (const task of lockedTasks) {
      immutableTaskIds.add(task.taskId);
    }
  }

  const pending = sorted.filter((task) => !immutableTaskIds.has(task.id));
  const generatedFutureDays: DailySchedule[] = [];

  const futureDatesFromExisting = uniqueSortedDates(
    (existingSchedule?.days ?? [])
      .filter((day) => isFutureDate(day.date, todayIso) && day.completed !== true)
      .map((day) => day.date),
  );

  const defaultFutureDates = Array.from({ length: horizonDays }, (_, idx) =>
    toIsoDate(addDays(now, idx + 1)),
  );

  const futureDates = uniqueSortedDates(
    futureDatesFromExisting.length > 0 ? futureDatesFromExisting : defaultFutureDates,
  );

  // Feasibility check before allocation: compare pending workload vs. free future capacity.
  const availableFutureMinutes = futureDates.reduce((sum, date) => {
    const lockedMinutes = (lockedTasksByDate.get(date) ?? []).reduce(
      (taskSum, task) => taskSum + task.allocatedMinutes,
      0,
    );
    return sum + Math.max(0, effectiveCapacity - lockedMinutes);
  }, 0);

  const requiredFutureMinutes = pending.reduce((sum, task) => sum + task.durationMinutes, 0);
  const deficitMinutes = Math.max(0, requiredFutureMinutes - availableFutureMinutes);
  const isOverloaded = deficitMinutes > 0;

  const schedulableDays = Math.max(1, futureDates.length);
  const loadFactor = clamp(user.loadFactor, 0.1, 1);
  const additionalEffectivePerDay = isOverloaded
    ? Math.ceil(deficitMinutes / schedulableDays)
    : 0;
  const increaseDailyTimeByMinutes = isOverloaded
    ? Math.ceil(additionalEffectivePerDay / loadFactor)
    : 0;
  const extendDeadlineByDays = isOverloaded
    ? Math.ceil(deficitMinutes / Math.max(1, effectiveCapacity))
    : 0;

  for (const date of futureDates) {
    const dayTasks: ScheduledTask[] = [...(lockedTasksByDate.get(date) ?? [])];
    const lockedMinutes = dayTasks.reduce((sum, task) => sum + task.allocatedMinutes, 0);
    const lockedRevisionMinutes = dayTasks
      .filter((task) => isRevisionTask(task))
      .reduce((sum, task) => sum + task.allocatedMinutes, 0);
    let remaining = Math.max(0, effectiveCapacity - lockedMinutes);

    // Always place urgent deadline-driven tasks before any revision work.
    remaining = scheduleUrgentDeadlinesFirst(dayTasks, pending, remaining, now);

    const nonRevisionResult = fillDayWithSubjectBalancing(
      dayTasks,
      pending,
      remaining,
      (task) => !isRevisionTask(task),
    );
    remaining = nonRevisionResult.remaining;

    // Revision load control: cap revision share per day and push lower-score revisions forward.
    const maxRevisionDailyRatio = clamp(user.maxRevisionDailyRatio ?? 0.4, 0.1, 0.8);
    const revisionDailyCapMinutes = Math.floor(effectiveCapacity * maxRevisionDailyRatio);
    const revisionAllowanceLeft = Math.max(0, revisionDailyCapMinutes - lockedRevisionMinutes);

    const revisionResult = fillDayWithSubjectBalancing(
      dayTasks,
      pending,
      remaining,
      (task) => isRevisionTask(task),
      revisionAllowanceLeft,
    );
    remaining = revisionResult.remaining;

    const scheduledMinutes = dayTasks.reduce((sum, task) => sum + task.allocatedMinutes, 0);

    generatedFutureDays.push({
      date,
      capacityMinutes,
      effectiveCapacityMinutes: effectiveCapacity,
      bufferMinutes,
      scheduledMinutes,
      tasks: dayTasks,
    });

    if (pending.length === 0) {
      break;
    }
  }

  const days = [...preservedDays, ...generatedFutureDays].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const totalScheduledTasks = days.reduce((sum, day) => sum + day.tasks.length, 0);
  const totalScheduledMinutes = days.reduce((sum, day) => sum + day.scheduledMinutes, 0);

  return {
    days,
    unscheduledTasks: pending,
    adaptiveCapacity,
    overload: {
      isOverloaded,
      requiredMinutes: requiredFutureMinutes,
      availableMinutes: availableFutureMinutes,
      deficitMinutes,
      suggestions: {
        increaseDailyTimeByMinutes,
        reduceTasksByMinutes: deficitMinutes,
        extendDeadlineByDays,
      },
    },
    meta: {
      totalTasks: tasks.length,
      scheduledTasks: totalScheduledTasks,
      unscheduledTasks: pending.length,
      totalScheduledMinutes,
    },
  };
}

export function reinsertSkippedTasks(
  existingTasks: SchedulableTask[],
  skippedTaskIds: string[],
): SchedulableTask[] {
  const skippedSet = new Set(skippedTaskIds);

  return existingTasks.map((task) => {
    if (!skippedSet.has(task.id)) {
      return task;
    }

    // Skipped tasks get resubmitted with slight urgency bump by priority/status.
    return {
      ...task,
      status: 'SKIPPED',
      progress: Math.max(0, normalizeProgress(task.progress) - 5),
    };
  });
}

function cloneSchedule(schedule: StructuredSchedule): StructuredSchedule {
  return {
    days: schedule.days.map((day) => ({
      ...day,
      tasks: day.tasks.map((task) => ({ ...task })),
    })),
    unscheduledTasks: schedule.unscheduledTasks.map((task) => ({ ...task })),
    adaptiveCapacity: { ...schedule.adaptiveCapacity },
    overload: {
      ...schedule.overload,
      suggestions: { ...schedule.overload.suggestions },
    },
    meta: { ...schedule.meta },
  };
}

function recalculateMeta(schedule: StructuredSchedule): void {
  const totalScheduledTasks = schedule.days.reduce((sum, day) => sum + day.tasks.length, 0);
  const totalScheduledMinutes = schedule.days.reduce((sum, day) => {
    return sum + day.tasks.reduce((taskSum, task) => taskSum + task.allocatedMinutes, 0);
  }, 0);

  schedule.meta.scheduledTasks = totalScheduledTasks;
  schedule.meta.totalScheduledMinutes = totalScheduledMinutes;
  schedule.meta.unscheduledTasks = schedule.unscheduledTasks.length;

  for (const day of schedule.days) {
    day.scheduledMinutes = day.tasks.reduce((sum, task) => sum + task.allocatedMinutes, 0);
  }
}

function removeTaskFromActiveDays(
  schedule: StructuredSchedule,
  taskId: string,
  todayIso: string,
): void {
  for (const day of schedule.days) {
    if (day.completed === true || day.date < todayIso) {
      continue;
    }

    day.tasks = day.tasks.filter((task) => task.taskId !== taskId);
    day.scheduledMinutes = day.tasks.reduce((sum, task) => sum + task.allocatedMinutes, 0);
  }

  schedule.unscheduledTasks = schedule.unscheduledTasks.filter((task) => task.id !== taskId);
}

function tryFitIntoBuffer(
  schedule: StructuredSchedule,
  skippedTask: ScoredTask,
  todayIso: string,
): boolean {
  const candidateDays = [...schedule.days]
    .filter((day) => day.completed !== true && day.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const day of candidateDays) {
    const usedMinutes = day.tasks.reduce((sum, task) => sum + task.allocatedMinutes, 0);
    const maxWithBuffer = day.effectiveCapacityMinutes + day.bufferMinutes;
    const bufferAvailable = Math.max(0, maxWithBuffer - usedMinutes);

    if (skippedTask.durationMinutes <= bufferAvailable) {
      day.tasks.push({
        taskId: skippedTask.id,
        title: skippedTask.title,
        allocatedMinutes: skippedTask.durationMinutes,
        score: skippedTask.score,
        urgency: skippedTask.urgency,
        weakness: skippedTask.weakness,
        locked: false,
      });
      day.scheduledMinutes = usedMinutes + skippedTask.durationMinutes;
      return true;
    }
  }

  return false;
}

export function handleSkippedTask(
  existingTasks: SchedulableTask[],
  user: UserSchedulingConstraints,
  existingSchedule: StructuredSchedule,
  skippedTaskId: string,
  now = new Date(),
): SkipHandlingResult {
  const updatedTasks = reinsertSkippedTasks(existingTasks, [skippedTaskId]);
  const skippedTask = updatedTasks.find((task) => task.id === skippedTaskId);

  if (!skippedTask || skippedTask.status === 'COMPLETED') {
    return {
      action: 'ignored',
      skippedTaskId,
      schedule: existingSchedule,
      reason: 'Skipped task not found or already completed',
    };
  }

  // Recalculate urgency/score at skip time so reinsertion reflects current pressure.
  const rescoredSkippedTask: ScoredTask = {
    ...skippedTask,
    urgency: calculateUrgency(skippedTask, now),
    weakness: calculateWeakness(skippedTask),
    score: calculateScore(skippedTask, now),
  };

  const workingSchedule = cloneSchedule(existingSchedule);
  const todayIso = toIsoDate(now);

  // Remove stale placement first; this prevents blanket shifting and duplicate scheduling.
  removeTaskFromActiveDays(workingSchedule, skippedTaskId, todayIso);

  const buffered = tryFitIntoBuffer(workingSchedule, rescoredSkippedTask, todayIso);
  if (buffered) {
    recalculateMeta(workingSchedule);
    return {
      action: 'buffered',
      skippedTaskId,
      schedule: workingSchedule,
    };
  }

  // If buffer is insufficient, regenerate only future unlocked days via generateSchedule.
  const rebalanced = generateSchedule(updatedTasks, user, workingSchedule);
  return {
    action: 'rebalanced',
    skippedTaskId,
    schedule: rebalanced,
  };
}

export function applyCompletedTasks(
  existingTasks: SchedulableTask[],
  completedTaskIds: string[],
): SchedulableTask[] {
  const completedSet = new Set(completedTaskIds);
  const now = new Date();
  const existingIds = new Set(existingTasks.map((task) => task.id));
  const revisionTasks: SchedulableTask[] = [];

  let updatedTasks = existingTasks.map((task) => {
    if (!completedSet.has(task.id)) {
      return task;
    }

    const completedTask: SchedulableTask = {
      ...task,
      status: 'COMPLETED',
      progress: 100,
    };

    const generated = createRevisionTasksFromCompletion(completedTask, now, existingIds);
    for (const revision of generated) {
      existingIds.add(revision.id);
      revisionTasks.push(revision);
    }

    return completedTask;
  });

  // Revision completion feedback: update parent mastery, recompute future revision cadence,
  // and lower future revision priority when performance improves.
  for (const completedTaskId of completedTaskIds) {
    const completedRevision = updatedTasks.find(
      (task) => task.id === completedTaskId && task.isRevision === true,
    );
    if (!completedRevision || !completedRevision.revisionOfTaskId) {
      continue;
    }

    const parentTask = updatedTasks.find((task) => task.id === completedRevision.revisionOfTaskId);
    if (!parentTask) {
      continue;
    }

    const mergedPerformance = derivePostRevisionPerformance(parentTask, completedRevision);
    const performancePreviewTask: SchedulableTask = {
      ...parentTask,
      ...mergedPerformance,
    };
    const updatedWeakness = calculatePerformanceWeakness(performancePreviewTask);
    const improvedPerformance = updatedWeakness <= 40;

    updatedTasks = updatedTasks.map((task) => {
      if (task.id !== parentTask.id) {
        return task;
      }

      return {
        ...task,
        ...mergedPerformance,
      };
    });

    updatedTasks = retuneFutureRevisionTasks(
      updatedTasks,
      completedRevision.revisionOfTaskId,
      completedRevision.revisionIntervalDays ?? 0,
      now,
      improvedPerformance,
    );
  }

  return [...updatedTasks, ...revisionTasks];
}
