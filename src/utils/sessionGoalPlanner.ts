import type { Roadmap } from "@/types/goal";
import type { PlannerData, ScheduledTask, ScheduleDay } from "@/types/planner";

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

function flattenRoadmapTasks(roadmap: Roadmap): GoalTaskInput[] {
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
          keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
          learningOutcomes: task.scheduleReason ? [task.scheduleReason] : undefined,
        });
      }
    }
  }

  return tasks;
}

function scheduleTasksLikeBackend(
  tasks: GoalTaskInput[],
  goalId: string,
  availability: AvailabilityConfig,
  startDate?: string,
): ScheduledTask[] {
  const activeDays = availability.activeDays;
  const dailyMinutes = availability.minutesPerDay;

  const start = startOfDay(startDate ? new Date(startDate) : new Date());
  const scheduled: ScheduledTask[] = [];

  let cursor = new Date(start);
  let consumedToday = 0;

  for (const task of tasks) {
    const isFirstTask = scheduled.length === 0;

    if (isFirstTask) {
      const duration = task.estimatedMinutes || 25;
      scheduled.push({
        id: `session-${goalId}-${task.id}`,
        title: task.title,
        type: "learn",
        scheduledDate: new Date(start).toISOString(),
        videoId: task.videoId,
        videoUrl: task.videoUrl,
        estimatedMinutes: duration,
        keyPoints: task.keyPoints,
        learningOutcomes: task.learningOutcomes,
        status: "pending",
        priority: task.priority,
        dependencies: [],
        goalId,
      });

      cursor = new Date(start);
      consumedToday = duration;
      continue;
    }

    let weekday = dayName(cursor);
    while (!activeDays.includes(weekday)) {
      cursor = addDays(cursor, 1);
      consumedToday = 0;
      weekday = dayName(cursor);
    }

    const budget = dailyMinutes[weekday] ?? 60;
    const duration = task.estimatedMinutes || 25;

    if (consumedToday + duration > budget) {
      cursor = addDays(cursor, 1);
      consumedToday = 0;

      let nextDay = dayName(cursor);
      while (!activeDays.includes(nextDay)) {
        cursor = addDays(cursor, 1);
        nextDay = dayName(cursor);
      }
    }

    scheduled.push({
      id: `session-${goalId}-${task.id}`,
      title: task.title,
      type: "learn",
      scheduledDate: new Date(cursor).toISOString(),
      videoId: task.videoId,
      videoUrl: task.videoUrl,
      estimatedMinutes: duration,
      keyPoints: task.keyPoints,
      learningOutcomes: task.learningOutcomes,
      status: "pending",
      priority: task.priority,
      dependencies: [],
      goalId,
    });

    consumedToday += duration;
  }

  return scheduled;
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
  const tasks = flattenRoadmapTasks(roadmap);
  const scheduled = scheduleTasksLikeBackend(tasks, goalId, availability, startDate);

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
