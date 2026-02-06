// Goal & Roadmap Types - DAG-based execution plan

export type GoalType = "exam" | "skill" | "role";
export type PaceStyle = "aggressive" | "balanced" | "light";
export type FocusStrategy = "weakness-first" | "coverage-first";
export type TaskStatus = "locked" | "scheduled" | "in-progress" | "completed" | "skipped" | "deferred";

// Exam structure
export interface University {
  id: string;
  name: string;
  type: string;
}

export interface Course {
  id: string;
  name: string;
  duration: string;
  totalSemesters: number;
}

export interface Semester {
  id: string;
  name: string;
  number: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  marks: number;
}

// Predefined goal options (no free text garbage)
export interface GoalOption {
  id: string;
  name: string;
  type: GoalType;
  category: string;
  estimatedHours: number;
  skillIds?: string[]; // For role -> skills mapping
}

// Step 1: Goal Definition
export interface GoalDefinition {
  type: GoalType;
  goalId?: string; // From predefined options (for skill/role)
  customName?: string; // Only if absolutely necessary
  // Exam specific fields
  university?: University;
  course?: Course;
  semester?: Semester;
  subjects?: Subject[]; // Multiple subjects can be selected
}

// Step 2: Deadline & Constraints
export interface GoalConstraints {
  targetDate: string; // ISO date
  daysPerWeek: number; // 1-7
  minutesPerDay: number; // Capped at realistic max
  startDate?: string;
}

// Step 3: Assessment
export interface GoalAssessment {
  selfRating: number; // 1-5 confidence
  diagnosticScore?: number; // 0-100 objective
  confidenceMismatch?: boolean; // Flagged if self vs diagnostic differ significantly
}

// Step 4: Preferences
export interface GoalPreferences {
  paceStyle: PaceStyle;
  focusStrategy: FocusStrategy;
}

// Full Goal entity
export interface Goal {
  id: string;
  definition: GoalDefinition;
  constraints: GoalConstraints;
  assessment: GoalAssessment;
  preferences: GoalPreferences;
  createdAt: string;
  status: "active" | "paused" | "completed" | "abandoned";
}

// Roadmap structure: Phase → Topic → Task (DAG)

export interface Task {
  id: string;
  name: string;
  description?: string;
  estimatedMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  dependencies: string[]; // Task IDs
  revisionWeight: number; // 0-1, higher = needs more revision
  assessmentHook?: string; // Quiz/test ID to verify understanding
  status: TaskStatus;
  scheduledDate?: string;
  completedDate?: string;
  // Explanation for scheduling (builds trust)
  scheduleReason?: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
  estimatedMinutes: number; // Sum of tasks
}

export interface Phase {
  id: string;
  name: string;
  description?: string;
  order: number;
  topics: Topic[];
  estimatedMinutes: number; // Sum of topics
  startDate?: string;
  endDate?: string;
}

export interface Roadmap {
  id: string;
  goalId: string;
  phases: Phase[];
  totalEstimatedMinutes: number;
  bufferDays: number;
  revisionSlots: number;
  generatedAt: string;
  lastRecalculatedAt?: string;
}

// Schedule entry (separate from task - tasks are reusable)
export interface ScheduleEntry {
  id: string;
  taskId: string;
  userId: string;
  scheduledDate: string;
  status: TaskStatus;
  actualMinutes?: number;
  notes?: string;
}

// Wizard state
export interface GoalWizardState {
  currentStep: number;
  definition: Partial<GoalDefinition>;
  constraints: Partial<GoalConstraints>;
  assessment: Partial<GoalAssessment>;
  preferences: Partial<GoalPreferences>;
  isComplete: boolean;
}

// API responses
export interface RoadmapGenerationRequest {
  goal: Goal;
}

export interface RoadmapAdjustment {
  taskId: string;
  action: "defer" | "skip" | "lock" | "unlock" | "reorder";
  newDate?: string;
  newPosition?: number;
}
