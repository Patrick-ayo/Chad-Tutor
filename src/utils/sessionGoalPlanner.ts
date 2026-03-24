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

interface GoalTaskInput {
  id: string;
  title: string;
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
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

  for (const phase of roadmap.phases) {
    for (const topic of phase.topics) {
      for (const task of topic.tasks) {
        tasks.push({
          id: task.id,
          title: task.name,
          estimatedMinutes: task.estimatedMinutes ?? 25,
          priority: fromDifficultyToPriority(task.difficulty),
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
      estimatedMinutes: duration,
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
): PlannerData {
  const goalId = roadmap.goalId || `goal-${Date.now()}`;
  const tasks = flattenRoadmapTasks(roadmap);
  const scheduled = scheduleTasksLikeBackend(tasks, goalId, availability);

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
