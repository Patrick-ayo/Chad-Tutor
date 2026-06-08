// Planner/Rescheduler Types - Absorbing disruption without destroying the plan

export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue" | "blocked" | "skipped";
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

export type TaskType = "learn" | "practice" | "quiz" | "revision";

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
  type: "learn" | "practice" | "quiz" | "revision";
  taskType?: TaskType;
  taskId?: string;
  topicId?: string;
  subtopicId?: string;
  scheduledDate: string;
  deadlineDate?: Date;
  rescheduledDate?: Date;
  missedOn?: Date;
  resolutionType?: MissedTaskResolutionType;
  completedDate?: Date;
  videoId?: string;
  videoUrl?: string;
  estimatedMinutes: number;
  originalEstimatedMinutes?: number;
  actualMinutes?: number;
  keyPoints?: string[];
  learningOutcomes?: string[];
  status: TaskStatus;
  priority: "high" | "medium" | "low";
  dependencies: string[];
  dependsOn?: string[];
  rescheduleCount?: number;
  burnRate?: number;
  subtopicClusterId?: string;
  topicWeight?: number;
  notes?: string;
  goalId: string;
  partialProgress?: number; // 0-100 for partial tasks
  blockedReason?: string;
}

export interface TopicQueue {
  topicId: string;
  deadlineDate: Date;
  tasks: ScheduledTask[];
  totalMinutes: number;
  remainingMinutes: number;
  burnRate?: number;
  topicWeight?: number;
  status?: "on-track" | "at-risk";
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
  topicId: string;
  severity: "low" | "medium" | "high";
  code: "AT_RISK" | "BUFFER_EXHAUSTED" | "DEADLINE_BREACH" | "GLOBAL_REBALANCE_REQUIRED";
  message: string;
  suggestedActions: SuggestedAction[];
}

export interface RescheduleResult {
  updatedTasks: ScheduledTask[];
  warnings: ScheduleWarning[];
  appliedStrategy: "absorb" | "push_forward" | "global_rebalance";
  suggestedActions?: SuggestedAction[];
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

export type TopicStatusState = 'on_track' | 'at_risk' | 'behind';

export interface TopicStatus {
  topicId: string;
  burnRate: number;
  remainingMinutes: number;
  remainingDays: number;
  status: TopicStatusState;
}

// Current load info
export interface CurrentLoad {
  daily: number;
  weekly: number;
  maxRecommended: number;
}

export interface SessionVideo {
  id: string;
  title: string;
  channelName?: string;
  channelId?: string;
  durationSeconds: number;
  url?: string;
  topicName?: string;
  subtopicName?: string;
  playlistId?: string;
  playlistTitle?: string;
}

export type SessionPhase = "watch" | "practice" | "quiz";

export interface MiniPractice {
  id: string;
  title: string;
  prompt: string;
  estimatedMinutes: number;
  format: "recall" | "worked-example" | "timed-drill";
  checkpoints: string[];
}

export interface SessionPhaseBlock {
  id: string;
  phase: SessionPhase;
  title: string;
  description: string;
  estimatedMinutes: number;
  videoIds?: string[];
  practice?: MiniPractice;
  quizPrompt?: string;
}

export interface RoadmapSession {
  id: string;
  dayNumber: number;
  label: string;
  title: string;
  topicName: string;
  subtopicName?: string;
  clusterId: string;
  videos: SessionVideo[];
  totalMinutes: number;
  phases: SessionPhaseBlock[];
  keyOutcome: string;
  revisitNotes: string[];
}

export interface RoadmapDay {
  dayNumber: number;
  label: string;
  title: string;
  summary: string;
  focus: string;
  sessions: RoadmapSession[];
  totalMinutes: number;
}

export interface DetailedRoadmap {
  id: string;
  goalId?: string;
  title: string;
  overview: string;
  days: RoadmapDay[];
  totalDays: number;
  totalMinutes: number;
  createdAt: string;
  source: "groq" | "gemini" | "hybrid" | "fallback";
  availability: {
    activeDays: Weekday[];
    minutesPerDay: Record<Weekday, number>;
  };
  metadata?: Record<string, unknown>;
}

export interface DetailedRoadmapGenerationRequest {
  goalId?: string;
  goalName: string;
  topicName: string;
  playlistIds?: string[];
  videos?: SessionVideo[];
  startDate?: string;
}

export interface DetailedRoadmapGenerationResult {
  roadmap: DetailedRoadmap;
  planner: {
    created: number;
    scheduled: number;
    source: DetailedRoadmap["source"];
  };
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

export interface GenerateScheduleResult {
  createdCount: number;
  unscheduledCount?: number;
  horizonDays?: number;
  groupSummary?: {
    deadline: number;
    time: number;
    effort: number;
  };
}
