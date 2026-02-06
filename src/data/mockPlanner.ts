import { addDays, subDays } from "date-fns";
import type {
  PlannerData,
  ScheduleDay,
  ScheduledTask,
  MissedTask,
  BurnoutSignals,
} from "@/types/planner";

const today = new Date();

// Generate scheduled tasks for a day
function generateTasksForDay(
  dayOffset: number,
  count: number
): ScheduledTask[] {
  const tasks: ScheduledTask[] = [];
  const topics = [
    "Binary Search Trees",
    "Graph Traversal",
    "Dynamic Programming",
    "Hash Tables",
    "Recursion Basics",
    "Sorting Algorithms",
    "Tree Balancing",
    "BFS vs DFS",
    "Memoization",
    "Greedy Algorithms",
  ];
  const types: ScheduledTask["type"][] = ["learn", "practice", "revision"];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const isOverdue = dayOffset < 0;
    const isCompleted = dayOffset < -1 || (dayOffset === -1 && Math.random() > 0.5);

    tasks.push({
      id: `task-${dayOffset}-${i}`,
      title: topics[(dayOffset + i + 10) % topics.length],
      type,
      scheduledDate: addDays(today, dayOffset).toISOString(),
      estimatedMinutes: type === "learn" ? 45 : type === "practice" ? 30 : 20,
      priority: i === 0 ? "high" : i === 1 ? "medium" : "low",
      status: isCompleted
        ? "completed"
        : isOverdue
        ? "overdue"
        : dayOffset === 0
        ? "in-progress"
        : "pending",
      dependencies: i > 0 ? [`task-${dayOffset}-${i - 1}`] : [],
      goalId: "goal-1",
    });
  }

  return tasks;
}

// Generate schedule days
function generateScheduleDays(): ScheduleDay[] {
  const days: ScheduleDay[] = [];

  for (let offset = -2; offset <= 10; offset++) {
    const date = addDays(today, offset);
    const isBuffer = offset === 5 || offset === 9; // Buffer days
    const tasks = isBuffer ? [] : generateTasksForDay(offset, offset === 0 ? 3 : 2);

    days.push({
      date: date.toISOString(),
      tasks,
      isBuffer,
      totalMinutes: tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0),
      completedMinutes:
        offset < 0
          ? tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)
          : offset === 0
          ? 25
          : 0,
    });
  }

  return days;
}

// Generate missed tasks
function generateMissedTasks(): MissedTask[] {
  return [
    {
      id: "missed-1",
      title: "AVL Tree Rotations",
      originalDate: subDays(today, 2).toISOString(),
      type: "learn",
      estimatedMinutes: 45,
      priority: "high",
      missedReason: "Life happened—no learning logged that day",
      dependentTasks: ["task-0-1", "task-1-0"],
      goalId: "goal-1",
    },
    {
      id: "missed-2",
      title: "Binary Heap Practice",
      originalDate: subDays(today, 1).toISOString(),
      type: "practice",
      estimatedMinutes: 30,
      priority: "medium",
      missedReason: "Started but didn't complete (logged 8 min)",
      dependentTasks: [],
      goalId: "goal-1",
    },
  ];
}

// Generate burnout signals
function generateBurnoutSignals(): BurnoutSignals {
  return {
    riskLevel: "medium",
    indicators: [
      {
        type: "accuracy",
        name: "Accuracy Decay",
        description:
          "Your practice accuracy dropped from 78% to 62% over the past 5 days",
        severity: "medium",
        value: "62%",
      },
      {
        type: "pause-frequency",
        name: "Frequent Pauses",
        description:
          "You've been pausing sessions more often (avg 4.2 pauses vs usual 1.8)",
        severity: "low",
        value: "4.2 avg",
      },
      {
        type: "completion-time",
        name: "Slower Completion",
        description:
          "Tasks are taking 35% longer than your historical average",
        severity: "medium",
        value: "+35%",
      },
    ],
    recommendations: [
      {
        text: "Reduce daily load by 1 task",
        action: "reduce-load",
      },
      {
        text: "Add a rest day this week",
        action: "add-break",
      },
    ],
    detectedPatterns: [
      "Learning sessions getting shorter over the week",
      "More skipped practice problems",
      "Revision sessions often incomplete",
    ],
  };
}

export const mockPlannerData: PlannerData = {
  scheduleDays: generateScheduleDays(),
  missedTasks: generateMissedTasks(),
  workloadIntensity: "normal",
  workloadStats: {
    tasksPerDay: { light: 2, normal: 3, aggressive: 5 },
    revisionDensity: { light: "Every 5 days", normal: "Every 3 days", aggressive: "Daily" },
    bufferUsage: { light: "2 per week", normal: "1 per week", aggressive: "None" },
  },
  currentLoad: {
    daily: 95,
    weekly: 420,
    maxRecommended: 90,
  },
  burnoutSignals: generateBurnoutSignals(),
  lastReschedule: subDays(today, 3).toISOString(),
  pendingChanges: [],
};
