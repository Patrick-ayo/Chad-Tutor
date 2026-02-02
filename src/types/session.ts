// Learning Session Types - Measuring real learning output

export type QuestionType = "mcq" | "short-answer" | "explain";
export type TaskCompletionStatus = "completed" | "partial" | "blocked";
export type SessionEventType = 
  | "session_start"
  | "session_pause"
  | "session_resume"
  | "answer_submitted"
  | "ai_help_requested"
  | "content_viewed"
  | "session_end";

// Task context for the session
export interface SessionTask {
  id: string;
  name: string;
  goalName: string;
  topicName: string;
  estimatedMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  scheduleReason?: string;
}

// Content types (max 2 per task)
export interface TaskContent {
  id: string;
  type: "text" | "video" | "link";
  title: string;
  content: string; // HTML for text, URL for video/link
  duration?: number; // For video in seconds
  isRequired: boolean;
}

// Question for practice section
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For MCQ
  correctAnswer?: string | number; // Index for MCQ, text for short-answer
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

// Answer submission
export interface AnswerSubmission {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  attempts: number;
  submittedAt: string;
}

// AI Help interaction (controlled)
export interface AIHelpRequest {
  type: "re-explain" | "simpler-analogy" | "guiding-question" | "break-down";
  context: string;
  response?: string;
  requestedAt: string;
}

// Session event for logging (append-only)
export interface SessionEvent {
  id: string;
  type: SessionEventType;
  timestamp: string;
  data?: Record<string, unknown>;
}

// Session state
export interface SessionState {
  taskId: string;
  status: "active" | "paused" | "ended";
  startTime: string;
  pausedTime?: string;
  totalPausedSeconds: number;
  activeSeconds: number;
  contentProgress: number; // 0-100
  questionsAnswered: number;
  correctAnswers: number;
  aiHelpCount: number;
}

// End session data
export interface EndSessionData {
  completionStatus: TaskCompletionStatus;
  confidenceRating: number; // 1-5
  notes?: string;
  blockerReason?: string; // If blocked
}

// Full session record (for storage)
export interface LearningSession {
  id: string;
  userId: string;
  task: SessionTask;
  content: TaskContent[];
  questions: Question[];
  
  // Progress tracking
  answers: AnswerSubmission[];
  aiHelpRequests: AIHelpRequest[];
  events: SessionEvent[];
  
  // Metrics
  startTime: string;
  endTime?: string;
  totalSeconds: number;
  activeSeconds: number;
  idleSeconds: number;
  
  // Results
  accuracy: number;
  totalAttempts: number;
  completionStatus?: TaskCompletionStatus;
  confidenceRating?: number;
}

// Session metrics summary (for dashboard/analytics)
export interface SessionMetrics {
  taskId: string;
  sessionId: string;
  date: string;
  duration: {
    total: number;
    active: number;
    idle: number;
  };
  performance: {
    accuracy: number;
    questionsAttempted: number;
    questionsCorrect: number;
    avgTimePerQuestion: number;
    retryCount: number;
  };
  engagement: {
    aiHelpUsed: number;
    pauseCount: number;
    contentViewedPercent: number;
  };
  outcome: {
    completionStatus: TaskCompletionStatus;
    confidenceRating: number;
  };
}
