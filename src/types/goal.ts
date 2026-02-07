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

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  module: string;      // Which module/chapter this topic belongs to
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours: number; // How long this topic typically takes to study
  subtopics?: Subtopic[]; // Optional array of subtopics
}

export interface Subtopic {
  id: string;
  name: string;
  estimatedHours?: number;
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

// Video preferences for YouTube content fetching
export interface VideoPreferences {
  sourceType: "single-playlist" | "mixed";
  sortBy: "relevance" | "views" | "rating" | "date";
  includeOneShot: boolean;
  preferredLanguage?: string;
}

// Fetched video data
export interface VideoResult {
  id: string;
  title: string;
  channelName: string;
  channelId: string;
  thumbnail: string;
  duration: string; // ISO 8601 duration or formatted string
  durationSeconds: number;
  viewCount: number;
  likeCount?: number;
  publishedAt?: string;
  topicId: string;
  topicName: string;
  subtopicId?: string;
  subtopicName?: string;
  module?: string;
  playlistId?: string;
  playlistTitle?: string;
  isOneShot?: boolean;
}

// Playlist grouping (for single-playlist mode)
export interface Playlist {
  id: string;
  title: string;
  channelName: string;
  channelId: string;
  topicId: string;
  topicName: string;
  subtopicId?: string;
  subtopicName?: string;
  videoCount: number;
  totalDuration: number;
  totalDurationFormatted: string;
  videos: VideoResult[];
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
  topics?: Topic[]; // Selected topics from the chosen subjects
  videoPreferences?: VideoPreferences; // User's video preferences
  videos?: VideoResult[]; // Fetched videos for the selected topics
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
  // Additional metadata (videos, resources, etc.)
  metadata?: Record<string, any>;
}

// Roadmap Topic structure (different from GoalDefinition Topic)
export interface RoadmapTopic {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
  estimatedMinutes: number; // Sum of tasks
}

// TopicNode is used in roadmap generation (extends RoadmapTopic)
export interface TopicNode extends RoadmapTopic {
  // Inherits from RoadmapTopic
}

export interface Phase {
  id: string;
  name: string;
  description?: string;
  order: number;
  topics: RoadmapTopic[];
  estimatedMinutes: number; // Sum of topics
  startDate?: string;
  endDate?: string;
}

export interface Roadmap {
  id: string;
  goalId: string;
  name?: string;
  description?: string;
  phases: Phase[];
  totalEstimatedMinutes: number;
  bufferDays: number;
  revisionSlots: number;
  generatedAt?: string;
  lastRecalculatedAt?: string;
  metadata?: Record<string, any>;
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
