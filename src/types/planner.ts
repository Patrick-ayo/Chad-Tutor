// Planner/Rescheduler Types - Absorbing disruption without destroying the plan

export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue" | "blocked";
export type WorkloadIntensity = "light" | "normal" | "aggressive";
export type RescheduleReason = 
  | "missed-task"
  | "time-deviation"
  | "accuracy-drop"
  | "burnout-detected"
  | "manual-request"
  | "intensity-change";

export type MissedTaskResolutionType = 
  | "push-forward"
  | "compress"
  | "convert-revision"
  | "drop";

export interface MissedTaskResolution {
  type: MissedTaskResolutionType;
  targetDate?: string;
}

// Automatic trigger conditions
export interface RescheduleTrigger {
  type: RescheduleReason;
  triggered: boolean;
  details: string;
  severity: "low" | "medium" | "high";
}

// Scheduled task in timeline
export interface ScheduledTask {
  id: string;
  title: string;
  type: "learn" | "practice" | "revision";
  scheduledDate: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  status: TaskStatus;
  priority: "high" | "medium" | "low";
  dependencies: string[];
  goalId: string;
  partialProgress?: number; // 0-100 for partial tasks
  blockedReason?: string;
}

// Day in timeline
export interface ScheduleDay {
  date: string;
  isBuffer: boolean;
  tasks: ScheduledTask[];
  totalMinutes: number;
  completedMinutes: number;
}

// Missed task with resolution options
export interface MissedTask {
  id: string;
  title: string;
  originalDate: string;
  type: "learn" | "practice" | "revision";
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
  missedReason: string;
  dependentTasks: string[];
  goalId: string;
}

// Burnout indicator
export interface BurnoutIndicator {
  type: string;
  name: string;
  description: string;
  severity: "low" | "medium" | "high";
  value?: string;
}

// Burnout recommendation
export interface BurnoutRecommendation {
  text: string;
  action: string;
}

// Burnout signals
export interface BurnoutSignals {
  riskLevel: "low" | "medium" | "high";
  indicators: BurnoutIndicator[];
  recommendations: BurnoutRecommendation[];
  detectedPatterns: string[];
}

// Schedule change type
export type ScheduleChangeType = 
  | "task-moved"
  | "task-added"
  | "task-removed"
  | "buffer-used"
  | "deadline-adjusted";

// Schedule change for change log
export interface ScheduleChange {
  id: string;
  type: ScheduleChangeType;
  taskId: string;
  taskTitle: string;
  previousDate?: string;
  newDate?: string;
  reason: string;
  impact?: string;
}

// Reschedule preview
export interface ReschedulePreview {
  originalDeadline: string;
  newDeadline: string;
  deadlineImpact: number;
  changes: ScheduleChange[];
  workloadComparison: {
    before: number;
    after: number;
  };
  riskAssessment: string;
}

// Workload stats
export interface WorkloadStats {
  tasksPerDay: { light: number; normal: number; aggressive: number };
  revisionDensity: { light: string; normal: string; aggressive: string };
  bufferUsage: { light: string; normal: string; aggressive: string };
}

// Current load info
export interface CurrentLoad {
  daily: number;
  weekly: number;
  maxRecommended: number;
}

// Planner state
export interface PlannerData {
  // Timeline
  scheduleDays: ScheduleDay[];
  
  // Missed tasks needing resolution
  missedTasks: MissedTask[];
  
  // Current settings
  workloadIntensity: WorkloadIntensity;
  workloadStats: WorkloadStats;
  currentLoad: CurrentLoad;
  
  // Burnout
  burnoutSignals: BurnoutSignals;
  
  // Pending changes (preview before apply)
  pendingChanges: ScheduleChange[];
  
  // Last reschedule
  lastReschedule: string;
}
