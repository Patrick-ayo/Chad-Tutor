import type { DashboardData } from "@/types/dashboard";
import {
  subDays,
  format,
  startOfDay,
} from "date-fns";

// Generate activity history for last 90 days
function generateActivityHistory() {
  const today = startOfDay(new Date());
  const history = [];
  
  for (let i = 89; i >= 0; i--) {
    const date = subDays(today, i);
    // Simulate realistic activity patterns (70% active days with some gaps)
    const isActive = Math.random() > 0.3;
    const minutesStudied = isActive ? Math.floor(Math.random() * 120) + 30 : 0;
    
    history.push({
      date: format(date, "yyyy-MM-dd"),
      active: isActive,
      minutesStudied,
    });
  }
  
  return history;
}

// Generate accuracy trend data
function generateAccuracyTrend() {
  const data = [];
  const today = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const date = subDays(today, i);
    // Simulate accuracy that fluctuates between 60-90%
    const baseAccuracy = 72;
    const variance = Math.random() * 20 - 10;
    
    data.push({
      sessionDate: format(date, "yyyy-MM-dd"),
      accuracy: Math.min(95, Math.max(55, baseAccuracy + variance)),
      timeSpentMinutes: Math.floor(Math.random() * 60) + 30,
    });
  }
  
  return data;
}

// Generate time comparison data
function generateTimeComparison() {
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const planned = Math.floor(Math.random() * 60) + 60; // 60-120 mins planned
    // Actual is usually less than planned (realistic)
    const actual = Math.floor(planned * (0.6 + Math.random() * 0.5));
    
    data.push({
      date: format(date, "yyyy-MM-dd"),
      plannedMinutes: planned,
      actualMinutes: actual,
    });
  }
  
  return data;
}

export const mockDashboardData: DashboardData = {
  // Today's prioritized tasks
  todayTasks: [
    {
      id: "task-1",
      name: "Implement Binary Search Tree Deletion",
      topic: "Data Structures - Trees",
      estimatedMinutes: 45,
      difficulty: "hard",
      priority: "primary",
      deadlinePressure: 85,
      dependencyBlocking: true,
      forgettingCurveRisk: 72,
    },
    {
      id: "task-2",
      name: "Practice Graph BFS Problems",
      topic: "Algorithms - Graph Traversal",
      estimatedMinutes: 30,
      difficulty: "medium",
      priority: "secondary",
      deadlinePressure: 60,
      dependencyBlocking: false,
      forgettingCurveRisk: 45,
    },
    {
      id: "task-3",
      name: "Review Dynamic Programming Patterns",
      topic: "Algorithms - DP",
      estimatedMinutes: 25,
      difficulty: "medium",
      priority: "secondary",
      deadlinePressure: 40,
      dependencyBlocking: false,
      forgettingCurveRisk: 68,
    },
  ],
  
  // Active goal
  activeGoal: {
    id: "goal-1",
    name: "Master Data Structures & Algorithms",
    deadline: format(subDays(new Date(), -21), "yyyy-MM-dd"), // 21 days from now
    readinessPercent: 64,
    timeLeftDays: 21,
    timeRequiredDays: 28, // Need more time than available
  },
  
  // Alerts (max 2, actionable only)
  alerts: [
    {
      id: "alert-1",
      type: "warning",
      message: "You're 2 days behind schedule",
      action: "Add 30 min today to catch up",
      actionLink: "/schedule/adjust",
    },
    {
      id: "alert-2",
      type: "danger",
      message: "Accuracy dropped in Graph Algorithms",
      action: "Review graph traversal basics",
      actionLink: "/topics/graph-algorithms",
    },
  ],
  
  // Progress data
  activityHistory: generateActivityHistory(),
  accuracyTrend: generateAccuracyTrend(),
  timeComparison: generateTimeComparison(),
  
  // Weak areas (sorted by impact)
  weakTopics: [
    {
      id: "weak-1",
      name: "Graph Algorithms",
      accuracy: 52,
      retryCount: 8,
      avgSolveTimeSeconds: 420,
      impact: 92,
    },
    {
      id: "weak-2",
      name: "Dynamic Programming",
      accuracy: 58,
      retryCount: 6,
      avgSolveTimeSeconds: 380,
      impact: 85,
    },
    {
      id: "weak-3",
      name: "Tree Traversals",
      accuracy: 65,
      retryCount: 4,
      avgSolveTimeSeconds: 290,
      impact: 70,
    },
    {
      id: "weak-4",
      name: "Heap Operations",
      accuracy: 68,
      retryCount: 3,
      avgSolveTimeSeconds: 240,
      impact: 58,
    },
  ],
  
  // Revision due items
  revisionsDue: [
    {
      id: "rev-1",
      topicName: "Memory Management",
      lastAttemptDate: format(subDays(new Date(), 12), "yyyy-MM-dd"),
      accuracy: 71,
      forgettingRisk: 88,
      dueDate: format(subDays(new Date(), -1), "yyyy-MM-dd"), // Due tomorrow
    },
    {
      id: "rev-2",
      topicName: "Hash Table Collisions",
      lastAttemptDate: format(subDays(new Date(), 8), "yyyy-MM-dd"),
      accuracy: 76,
      forgettingRisk: 72,
      dueDate: format(subDays(new Date(), -3), "yyyy-MM-dd"),
    },
    {
      id: "rev-3",
      topicName: "Recursion Patterns",
      lastAttemptDate: format(subDays(new Date(), 6), "yyyy-MM-dd"),
      accuracy: 82,
      forgettingRisk: 55,
      dueDate: format(subDays(new Date(), -5), "yyyy-MM-dd"),
    },
  ],
};
