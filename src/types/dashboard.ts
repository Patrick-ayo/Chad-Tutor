// Dashboard Types - Single API endpoint response structure

export type DifficultyLevel = "easy" | "medium" | "hard";
export type TaskPriority = "primary" | "secondary";
export type AlertType = "warning" | "danger" | "info";

export interface Task {
  id: string;
  name: string;
  topic: string;
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  priority: TaskPriority;
  // Ordering factors
  deadlinePressure: number; // 0-100, higher = more urgent
  dependencyBlocking: boolean;
  forgettingCurveRisk: number; // 0-100, higher = more likely to forget
}

export interface Goal {
  id: string;
  name: string;
  deadline: string; // ISO date string
  readinessPercent: number;
  timeLeftDays: number;
  timeRequiredDays: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  action: string; // Actionable instruction
  actionLink?: string;
}

export interface DayActivity {
  date: string; // ISO date string
  active: boolean;
  minutesStudied: number;
}

export interface AccuracyDataPoint {
  sessionDate: string;
  accuracy: number; // 0-100
  timeSpentMinutes: number;
}

export interface TimeComparison {
  date: string;
  plannedMinutes: number;
  actualMinutes: number;
}

export interface WeakTopic {
  id: string;
  name: string;
  accuracy: number; // 0-100
  retryCount: number;
  avgSolveTimeSeconds: number;
  impact: number; // Calculated impact score for sorting
}

export interface RevisionItem {
  id: string;
  topicName: string;
  lastAttemptDate: string;
  accuracy: number;
  forgettingRisk: number; // 0-100, based on forgetting curve
  dueDate: string;
}

// Single dashboard API response
export interface DashboardData {
  // Today's focus
  todayTasks: Task[];
  
  // Goal snapshot
  activeGoal: Goal | null;
  alerts: Alert[]; // Max 2
  
  // Progress & consistency
  activityHistory: DayActivity[]; // Last 90 days for heatmap
  accuracyTrend: AccuracyDataPoint[]; // Last N sessions
  timeComparison: TimeComparison[]; // Last 7-14 days
  
  // Insights
  weakTopics: WeakTopic[];
  revisionsDue: RevisionItem[];
}
