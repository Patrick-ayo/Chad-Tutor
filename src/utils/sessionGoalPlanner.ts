import type { Roadmap } from "@/types/goal";
import type {
  BufferPool,
  PlannerData,
  RescheduleResult,
  ScheduleDay,
  ScheduleWarning,
  ScheduledTask,
  SuggestedAction,
  TopicQueue,
} from "@/types/planner";

type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type DailyMinutes = Record<Weekday, number>;

interface AvailabilityConfig {
  activeDays: Weekday[];
  minutesPerDay: DailyMinutes;
}

export type SessionScheduleSource = "goal-builder" | "mr-chad";

interface GoalTaskInput {
  id: string;
  title: string;
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
  videoId?: string;
  videoUrl?: string;
  videoTitle?: string;
  keyPoints?: string[];
  learningOutcomes?: string[];
}

interface TaskVideoMeta {
  id?: string;
  title?: string;
  url?: string;
}

function getTaskVideos(task: { metadata?: Record<string, unknown> }): TaskVideoMeta[] {
  const videos = task.metadata?.videos;
  if (Array.isArray(videos)) {
    return videos.filter((video): video is TaskVideoMeta => {
      if (!video || typeof video !== "object") return false;
      const casted = video as Record<string, unknown>;
      return (
        typeof casted.id === "string" ||
        typeof casted.title === "string" ||
        typeof casted.url === "string"
      );
    });
  }

  const singleVideoId = task.metadata?.videoId;
  const singleVideoUrl = task.metadata?.videoUrl;
  if (typeof singleVideoId === "string" || typeof singleVideoUrl === "string") {
    return [
      {
        id: typeof singleVideoId === "string" ? singleVideoId : undefined,
        url: typeof singleVideoUrl === "string" ? singleVideoUrl : undefined,
      },
    ];
  }

  return [];
}

function extractYouTubeVideoIdFromUrl(url?: string): string | undefined {
  if (!url) return undefined;

  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watchMatch?.[1]) return watchMatch[1];

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch?.[1]) return shortMatch[1];

  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embedMatch?.[1]) return embedMatch[1];

  return undefined;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function dayName(date: Date): Weekday {
  return date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as Weekday;
}

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fromDifficultyToPriority(
  difficulty: "easy" | "medium" | "hard",
): "high" | "medium" | "low" {
  if (difficulty === "hard") {
    return "high";
  }

  if (difficulty === "medium") {
    return "medium";
  }

  return "low";
}

export function flattenRoadmapTasks(roadmap: Roadmap): GoalTaskInput[] {
  const tasks: GoalTaskInput[] = [];
  let roadmapFallbackVideoId: string | undefined;
  let roadmapFallbackVideoUrl: string | undefined;

  for (const phase of roadmap.phases) {
    for (const topic of phase.topics) {
      let topicFallbackVideoId: string | undefined;
      let topicFallbackVideoUrl: string | undefined;

      for (const candidateTask of topic.tasks) {
        const candidateVideos = getTaskVideos(candidateTask);
        const firstCandidate = candidateVideos[0];
        const candidateId = firstCandidate?.id?.trim() || extractYouTubeVideoIdFromUrl(firstCandidate?.url);
        const candidateUrl = firstCandidate?.url?.trim() || (candidateId ? `https://www.youtube.com/watch?v=${candidateId}` : undefined);

        if (candidateId) {
          topicFallbackVideoId = candidateId;
          topicFallbackVideoUrl = candidateUrl;
          if (!roadmapFallbackVideoId) {
            roadmapFallbackVideoId = candidateId;
            roadmapFallbackVideoUrl = candidateUrl;
          }
          break;
        }
      }

      for (const task of topic.tasks) {
        const taskVideos = getTaskVideos(task);
        const taskPrimary = taskVideos[0];
        const explicitVideoId = taskPrimary?.id?.trim() || extractYouTubeVideoIdFromUrl(taskPrimary?.url);
        const explicitVideoUrl = taskPrimary?.url?.trim() || (explicitVideoId ? `https://www.youtube.com/watch?v=${explicitVideoId}` : undefined);
        const primaryVideoId =
          explicitVideoId ||
          topicFallbackVideoId ||
          roadmapFallbackVideoId;
        const primaryVideoUrl =
          explicitVideoUrl ||
          topicFallbackVideoUrl ||
          roadmapFallbackVideoUrl ||
          (primaryVideoId ? `https://www.youtube.com/watch?v=${primaryVideoId}` : undefined);
        const primaryVideoTitle = taskPrimary?.title || undefined;
        const keyPoints = taskVideos
          .map((video) => (video.title || "").trim())
          .filter(Boolean)
          .slice(0, 4);

        tasks.push({
          id: task.id,
          title: task.name,
          estimatedMinutes: task.estimatedMinutes ?? 25,
          priority: fromDifficultyToPriority(task.difficulty),
          videoId: primaryVideoId || undefined,
          videoUrl: primaryVideoUrl,
          videoTitle: primaryVideoTitle,
          keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
          learningOutcomes: task.scheduleReason ? [task.scheduleReason] : undefined,
        });
      }
    }
  }

  return tasks;
}

// Helper: count active days between start (exclusive) and deadline (inclusive)
function countActiveDaysBefore(availability: AvailabilityConfig, deadline: Date, fromDate?: Date): number {
  const start = startOfDay(fromDate ?? new Date());
  const end = startOfDay(deadline);
  if (end.getTime() < start.getTime()) return 0;

  let cursor = new Date(start);
  let count = 0;
  // move to next day first
  cursor = addDays(cursor, 1);
  while (cursor.getTime() <= end.getTime()) {
    const dn = dayName(cursor);
    if (availability.activeDays.includes(dn)) count += 1;
    cursor = addDays(cursor, 1);
    // safety guard
    if (count > 3650) break;
  }

  return Math.max(1, count);
}

function buildBufferPoolsFromHistory(tasks: ScheduledTask[]): BufferPool[] {
  const pools = new Map<string, BufferPool>();

  for (const t of tasks) {
    if (!t.topicId) continue;
    if (!t.completedDate || typeof t.actualMinutes !== 'number') continue;

    const excess = t.actualMinutes - (t.estimatedMinutes ?? 0);
    if (excess <= 0) continue;

    const key = t.topicId;
    const existing = pools.get(key) ?? { topicId: key, accumulatedMinutes: 0, entries: [] };
    existing.accumulatedMinutes += excess;
    existing.entries.push({ date: new Date(t.completedDate), minutes: excess });
    pools.set(key, existing);
  }

  // prune entries older than 7 days
  const now = new Date();
  for (const p of pools.values()) {
    p.entries = p.entries.filter((e) => (now.getTime() - e.date.getTime()) / (1000 * 60 * 60 * 24) <= 7);
    p.accumulatedMinutes = p.entries.reduce((s, e) => s + e.minutes, 0);
  }

  return Array.from(pools.values());
}

function findBufferPoolForTopic(pools: BufferPool[], topicId?: string): BufferPool | undefined {
  if (!topicId) return undefined;
  return pools.find((p) => p.topicId === topicId);
}

function scheduleMultiTopicTasks(
  topics: TopicQueue[],
  availability: AvailabilityConfig,
  startDate: string | Date,
): ScheduledTask[] {
  const start = startOfDay(typeof startDate === 'string' ? new Date(startDate) : startDate ?? new Date());
  const activeDays = availability.activeDays;
  const dailyMinutes = availability.minutesPerDay;

  // initialize burnRates
  for (const t of topics) {
    const deadline = new Date(t.deadlineDate);
    const days = countActiveDaysBefore(availability, deadline, start);
    t.burnRate = t.remainingMinutes / Math.max(1, days);
  }

  const scheduled: ScheduledTask[] = [];
  let cursor = new Date(start);
  const workLimitDays = 365; // safety

  let daysProcessed = 0;

  while (topics.some((t) => t.remainingMinutes > 0) && daysProcessed < workLimitDays) {
    // advance to next active day
    while (!activeDays.includes(dayName(cursor))) {
      cursor = addDays(cursor, 1);
    }

    const weekday = dayName(cursor);
    const minutesPerDay = dailyMinutes[weekday] ?? 60;
    let remainingDayBudget = minutesPerDay;

    // sort topics by burnRate desc
    const openTopics = topics.filter((t) => t.remainingMinutes > 0).sort((a, b) => (b.burnRate ?? 0) - (a.burnRate ?? 0));

    const totalBurn = openTopics.reduce((s, t) => s + (t.burnRate ?? 0), 0) || 1;

    for (const topic of openTopics) {
      if (remainingDayBudget <= 0) break;

      const proportionalShare = Math.floor(((topic.burnRate ?? 0) / totalBurn) * minutesPerDay);
      // ensure at least some share if minutes remain
      const share = Math.max(0, Math.min(remainingDayBudget, proportionalShare || Math.min(remainingDayBudget, topic.remainingMinutes)));

      // pull clusters in roadmap order
      let allocated = 0;
      const pendingTasks = topic.tasks;
      // find next unscheduled index
      let idx = pendingTasks.findIndex((pt) => !scheduled.some((s) => s.taskId === pt.taskId));
      if (idx === -1) idx = 0;

      while (idx < pendingTasks.length && allocated < share && remainingDayBudget > 0) {
        // collect cluster starting at idx
        const clusterId = pendingTasks[idx].subtopicClusterId ?? `${topic.topicId}::${pendingTasks[idx].taskId ?? pendingTasks[idx].id}`;
        const clusterTasks: ScheduledTask[] = [];
        let ci = idx;
        while (ci < pendingTasks.length && (pendingTasks[ci].subtopicClusterId ?? `${topic.topicId}::${pendingTasks[ci].taskId ?? pendingTasks[ci].id}`) === clusterId) {
          clusterTasks.push(pendingTasks[ci]);
          ci += 1;
        }

        const clusterTotal = clusterTasks.reduce((s, c) => s + (c.estimatedMinutes ?? 0), 0);

        // atomic cluster rule
        if (clusterTotal <= Math.max(remainingDayBudget, 0) && clusterTotal <= share - allocated) {
          // schedule whole cluster today
          for (const ct of clusterTasks) {
            const copy: ScheduledTask = {
              ...ct,
              scheduledDate: new Date(cursor).toISOString(),
              status: ct.status ?? 'pending',
            };
            scheduled.push(copy);
          }

          allocated += clusterTotal;
          remainingDayBudget -= clusterTotal;
          topic.remainingMinutes = Math.max(0, topic.remainingMinutes - clusterTotal);
          idx = ci;
          continue;
        }

        // cluster doesn't fit today.
        // if cluster larger than full day budget, allow split at watch->practice boundary
        if (clusterTotal > minutesPerDay) {
          // find watch task (type === 'learn') within cluster
          const watchTask = clusterTasks.find((c) => c.type === 'learn');
          if (watchTask && remainingDayBudget >= (watchTask.estimatedMinutes ?? 0)) {
            // schedule watch now, remainder next day
            scheduled.push({ ...watchTask, scheduledDate: new Date(cursor).toISOString(), status: watchTask.status ?? 'pending' });
            topic.remainingMinutes = Math.max(0, topic.remainingMinutes - (watchTask.estimatedMinutes ?? 0));
            remainingDayBudget -= (watchTask.estimatedMinutes ?? 0);
          }
          // leave rest for next day
        }

        // otherwise carry entire cluster to next day
        break;
      }

      // if topic finished early, its remaining share will be redistributed next loop
    }

    // deadline safety check
    for (const t of topics) {
      if (t.remainingMinutes <= 0) continue;
      const daysLeft = countActiveDaysBefore(availability, new Date(t.deadlineDate), cursor);
      const perDayNeeded = t.remainingMinutes / Math.max(1, daysLeft);
      const maxPerDay = Math.max(...Object.values(dailyMinutes));
      if (perDayNeeded > maxPerDay) {
        t.status = 'at-risk';
      }
    }

    // advance to next day
    cursor = addDays(cursor, 1);
    daysProcessed += 1;

    // recompute burnRates for next loop
    for (const t of topics) {
      if (t.remainingMinutes <= 0) {
        t.burnRate = 0;
        continue;
      }
      t.burnRate = t.remainingMinutes / Math.max(1, countActiveDaysBefore(availability, new Date(t.deadlineDate), cursor));
    }
  }

  return scheduled;
}

export function resolveMissedTasksMultiTopic(
  allTasks: ScheduledTask[],
  missedTaskIds: string[],
  today: Date,
  availability: AvailabilityConfig,
): RescheduleResult {
  const warnings: ScheduleWarning[] = [];
  const updatedTasks = [...allTasks];
  const pools = buildBufferPoolsFromHistory(allTasks);

  // Classify misses
  const missTasks = updatedTasks.filter((t) => missedTaskIds.includes(t.id));

  // build map day->tasks
  const dayMap = new Map<string, ScheduledTask[]>();
  for (const t of updatedTasks) {
    const key = toYmd(new Date(t.scheduledDate));
    const list = dayMap.get(key) ?? [];
    list.push(t);
    dayMap.set(key, list);
  }

  // detect classification per task
  const classifications = new Map<string, 'isolated' | 'day_miss' | 'streak' | 'burnout'>();

  // quick day miss detection
  const missedDays = new Set<string>();
  for (const t of missTasks) missedDays.add(toYmd(new Date(t.scheduledDate)));

  for (const t of missTasks) {
    const dayKey = toYmd(new Date(t.scheduledDate));
    const dayTasks = dayMap.get(dayKey) ?? [];
    const allMissed = dayTasks.every((d) => missedTaskIds.includes(d.id));
    if (allMissed) {
      classifications.set(t.id, 'day_miss');
      continue;
    }

    // streak: check previous day also missed
    const prev = toYmd(addDays(new Date(t.scheduledDate), -1));
    if (missedDays.has(prev)) {
      classifications.set(t.id, 'streak');
      continue;
    }

    classifications.set(t.id, 'isolated');
  }

  // burnout detection across 7-day window
  const missedDates = [...missTasks.map((t) => toYmd(new Date(t.scheduledDate)))].sort();
  for (let i = 0; i < missedDates.length; i++) {
    let count = 1;
    const start = new Date(missedDates[i]);
    for (let j = i + 1; j < missedDates.length; j++) {
      const d = new Date(missedDates[j]);
      if ((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) <= 7) count += 1;
    }
    if (count >= 4) {
      // mark all in window as burnout
      for (const t of missTasks) classifications.set(t.id, 'burnout');
      break;
    }
  }

  // Apply strategies per topic grouping
  const byTopic = new Map<string, ScheduledTask[]>();
  for (const t of missTasks) {
    const list = byTopic.get(t.topicId ?? 'unknown') ?? [];
    list.push(t);
    byTopic.set(t.topicId ?? 'unknown', list);
  }

  let appliedStrategy: RescheduleResult['appliedStrategy'] = 'absorb';
  const suggestions: SuggestedAction[] = [];

  for (const [topicId, tasks] of byTopic.entries()) {
    // recompute burnRate for topic
    const topicTasks = updatedTasks.filter((x) => x.topicId === topicId && (!x.completedDate));
    const remainingMinutes = topicTasks.reduce((s, x) => s + (x.estimatedMinutes ?? 0), 0);
    const deadline = topicTasks.find((x) => x.deadlineDate)?.deadlineDate ?? addDays(today, 7);
    const daysLeft = countActiveDaysBefore(availability, new Date(deadline), today);

    // process each missed task for topic
    for (const missed of tasks) {
      const cls = classifications.get(missed.id) ?? 'isolated';
      const pool = findBufferPoolForTopic(pools, topicId);

      // Strategy A: absorb (isolated)
      if (cls === 'isolated' && pool && pool.accumulatedMinutes >= (missed.estimatedMinutes ?? 0)) {
        // draw from buffer
        pool.accumulatedMinutes -= (missed.estimatedMinutes ?? 0);
        missed.resolutionType = 'push-forward';
        missed.rescheduledDate = addDays(today, 1);
        missed.missedOn = today;
        missed.status = 'pending';
        missed.rescheduleCount = (missed.rescheduleCount ?? 0) + 1;
        appliedStrategy = 'absorb';
        continue;
      }

      // Strategy A attempt without buffer: check feasibility
      const avgPerDay = Math.floor(Object.values(availability.minutesPerDay).reduce((s, v) => s + v, 0) / availability.activeDays.length);
      if (cls === 'isolated' && daysLeft * avgPerDay >= remainingMinutes) {
        // safe to insert at start of next active day for topic
        missed.rescheduledDate = addDays(today, 1);
        missed.missedOn = today;
        missed.resolutionType = 'push-forward';
        missed.status = 'pending';
        missed.rescheduleCount = (missed.rescheduleCount ?? 0) + 1;
        appliedStrategy = 'absorb';
        continue;
      }

      // Strategy B — push forward for day_miss or when absorb overflows
      if (cls === 'day_miss' || cls === 'streak' || cls === 'isolated') {
        // find next available day and chain-shift within topic
        let slot = addDays(today, 1);
        // find next active day
        while (!availability.activeDays.includes(dayName(slot))) slot = addDays(slot, 1);

        missed.rescheduledDate = slot;
        missed.resolutionType = 'push-forward';
        missed.missedOn = today;
        missed.status = 'pending';
        missed.rescheduleCount = (missed.rescheduleCount ?? 0) + 1;
        appliedStrategy = 'push_forward';

        // chain-shift subsequent tasks in same topic by 1 active day
        const laterTasks = updatedTasks
          .filter((x) => x.topicId === topicId && new Date(x.scheduledDate) > new Date(missed.scheduledDate ?? '1970-01-01'))
          .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

        for (const lt of laterTasks) {
          const nextDay = addDays(new Date(lt.scheduledDate), 1);
          lt.rescheduledDate = nextDay;
          lt.rescheduleCount = (lt.rescheduleCount ?? 0) + 1;
        }

        // verify last task's scheduledDate <= deadline
        const last = laterTasks[laterTasks.length - 1];
        if (last && new Date(last.rescheduledDate ?? last.scheduledDate).getTime() > new Date(deadline).getTime()) {
          // escalate to Strategy C
          appliedStrategy = 'global_rebalance';
        }
        if (appliedStrategy === 'global_rebalance') break;
        continue;
      }
    }
    if (appliedStrategy === 'global_rebalance') break;
  }

  // If any topic flagged for global rebalance or we detected burnout
  if (appliedStrategy === 'global_rebalance') {
    // collect all incomplete tasks and re-run scheduleMultiTopicTasks from today
    const topicsList: TopicQueue[] = [];
    const incomplete = updatedTasks.filter((t) => !t.completedDate && t.status !== 'completed');

    const grouped = new Map<string, ScheduledTask[]>();
    for (const t of incomplete) {
      const list = grouped.get(t.topicId ?? 'unknown') ?? [];
      list.push(t);
      grouped.set(t.topicId ?? 'unknown', list);
    }

    for (const [topicId, list] of grouped.entries()) {
      const total = list.reduce((s, x) => s + (x.estimatedMinutes ?? 0), 0);
      const deadline = list.find((x) => x.deadlineDate)?.deadlineDate ?? addDays(today, 7);
      topicsList.push({ topicId, deadlineDate: new Date(deadline), tasks: list, totalMinutes: total, remainingMinutes: total });
    }

    scheduleMultiTopicTasks(topicsList, availability, today);

    // compute total remaining capacity across all topics
    const activeDaysLeft = countActiveDaysBefore(availability, addDays(today, 30), today);
    const capacity = activeDaysLeft * Math.max(...Object.values(availability.minutesPerDay));
    const totalRemaining = topicsList.reduce((s, t) => s + t.remainingMinutes, 0);

    if (totalRemaining > capacity) {
      // Suggest levers 1 & 2
      suggestions.push({ type: 'increase-budget', label: 'Increase daily budget', details: 'Increase minutes per day to meet deadlines.' });
      // compute minimal extension days
      const deficit = totalRemaining - capacity;
      const minExtraDays = Math.ceil(deficit / Math.max(...Object.values(availability.minutesPerDay)));
      suggestions.push({ type: 'extend-deadline', label: 'Extend deadlines', details: `Consider extending deadlines by at least ${minExtraDays} days.` });

      // Lever 3: auto-drop lowest priority tasks (quiz, then practice)
      const dropCandidates = incomplete.filter((t) => t.type === 'quiz' || t.type === 'practice');
      // sort by priority low->high
      dropCandidates.sort((a, b) => {
        const aRank = a.priority === 'low' ? 0 : a.priority === 'medium' ? 1 : 2;
        const bRank = b.priority === 'low' ? 0 : b.priority === 'medium' ? 1 : 2;
        return aRank - bRank;
      });
      let droppedMinutes = 0;
      for (const d of dropCandidates) {
        // drop until capacity ok
        d.status = 'skipped';
        droppedMinutes += d.estimatedMinutes ?? 0;
        if (totalRemaining - droppedMinutes <= capacity) break;
      }
    }

    return {
      updatedTasks,
      warnings,
      appliedStrategy: 'global_rebalance',
      suggestedActions: suggestions,
    };
  }

  return { updatedTasks, warnings, appliedStrategy, suggestedActions: suggestions };
}

function recomputeDayTotals(day: ScheduleDay): ScheduleDay {
  const totalMinutes = day.tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
  const completedMinutes = day.tasks
    .filter((task) => task.status === "completed")
    .reduce((sum, task) => sum + (task.actualMinutes ?? task.estimatedMinutes), 0);

  return {
    ...day,
    totalMinutes,
    completedMinutes,
  };
}

export function applyGoalRoadmapToSessionPlanner(
  plannerData: PlannerData,
  roadmap: Roadmap,
  availability: AvailabilityConfig,
  startDate?: string,
  source: SessionScheduleSource = "goal-builder",
): PlannerData {
  const roadmapKey = roadmap.id || roadmap.goalId || `goal-${Date.now()}`;
  const goalId = `${source}:${roadmapKey}`;
  // Build TopicQueues from roadmap
  const topicQueues: TopicQueue[] = [];

  for (const phase of roadmap.phases) {
    for (const topic of phase.topics) {
      const tasksForTopic: ScheduledTask[] = [];
      for (const task of topic.tasks) {
        // derive cluster id from task id pattern: task-{topicId}-{subtopicId}-watch/practice/quiz
        let subtopicClusterId: string | undefined;
        const parts = task.id.split('-');
        if (parts.length >= 3) {
          subtopicClusterId = `${topic.id}:${parts[2]}`;
        } else {
          subtopicClusterId = topic.id;
        }

        const st: ScheduledTask = {
          id: `session-${goalId}-${task.id}`,
          taskId: task.id,
          title: task.name,
          type: task.status === 'scheduled' ? 'learn' : (task.status as any) ?? 'learn',
          taskType: (task.name || '').toLowerCase().includes('quiz') ? 'quiz' : ((task.name || '').toLowerCase().includes('practice') ? 'practice' : 'learn'),
          topicId: topic.id,
          subtopicId: undefined,
          subtopicClusterId,
          scheduledDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          deadlineDate: undefined,
          estimatedMinutes: task.estimatedMinutes ?? 25,
          originalEstimatedMinutes: task.estimatedMinutes ?? 25,
          actualMinutes: undefined,
          completedDate: undefined,
          status: 'pending',
          priority: task.difficulty === 'hard' ? 'high' : task.difficulty === 'medium' ? 'medium' : 'low',
          dependencies: task.dependencies ?? [],
          dependsOn: task.dependencies ?? [],
          rescheduleCount: 0,
          goalId,
        };

        tasksForTopic.push(st);
      }

      const total = tasksForTopic.reduce((s, t) => s + (t.estimatedMinutes ?? 0), 0);
      topicQueues.push({ topicId: topic.id, deadlineDate: new Date(), tasks: tasksForTopic, totalMinutes: total, remainingMinutes: total });
    }
  }

  const scheduled = scheduleMultiTopicTasks(topicQueues, availability, startDate ?? new Date());

  const dayMap = new Map<string, ScheduleDay>();

  for (const day of plannerData.scheduleDays) {
    const ymd = toYmd(new Date(day.date));
    const filtered = day.tasks.filter((task) => task.goalId !== goalId);

    dayMap.set(
      ymd,
      recomputeDayTotals({
        ...day,
        tasks: filtered,
      }),
    );
  }

  for (const task of scheduled) {
    const ymd = toYmd(new Date(task.scheduledDate));
    const existing = dayMap.get(ymd);

    if (existing) {
      dayMap.set(
        ymd,
        recomputeDayTotals({
          ...existing,
          tasks: [...existing.tasks, task],
        }),
      );
      continue;
    }

    dayMap.set(
      ymd,
      recomputeDayTotals({
        date: new Date(task.scheduledDate).toISOString(),
        isBuffer: false,
        tasks: [task],
        totalMinutes: task.estimatedMinutes,
        completedMinutes: 0,
      }),
    );
  }

  const mergedDays = Array.from(dayMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return {
    ...plannerData,
    scheduleDays: mergedDays,
  };
}
