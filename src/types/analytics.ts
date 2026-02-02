// Progress & Analytics Types - Brutally honest metrics

export type TrendDirection = "up" | "down" | "flat";
export type PaceStatus = "ahead" | "on-track" | "behind" | "critical";
export type ConfidenceLevel = "high" | "medium" | "low";

// A. Reality Check Types
export interface ReadinessData {
  overallPercent: number;
  confidenceInterval: { low: number; high: number };
  trend: TrendDirection;
  dataReliability: "reliable" | "uncertain" | "insufficient";
  lastUpdated: string;
}

export interface PaceData {
  status: PaceStatus;
  daysAhead: number; // Negative = behind
  completionRate: number; // Actual vs planned
  missedSessions: number;
  skippedAssessments: number;
  timeAccuracy: number; // Planned vs actual time ratio
  warning?: string; // Flag gaming behavior
}

export interface EffortOutcomeData {
  timeSpentHours: number;
  accuracyGainPercent: number;
  efficiencyRatio: number; // Accuracy gain per hour
  trend: TrendDirection;
  interpretation: "improving" | "diminishing" | "stagnant" | "declining";
  insight: string;
}

// B. Accuracy & Mastery Types
export interface AccuracyDataPoint {
  date: string;
  accuracy: number;
  smoothedAccuracy: number;
  questionsAttempted: number;
}

export interface AccuracyInterpretation {
  pattern: "mastery" | "confusion" | "disengagement" | "learning" | "plateau";
  description: string;
  recommendation: string;
}

export interface TopicMastery {
  topicId: string;
  topicName: string;
  parentTopic?: string;
  accuracy: number;
  confidence: ConfidenceLevel;
  confidenceMismatch: boolean; // High confidence + low accuracy
  attemptCount: number;
  lastAttempted: string;
  trend: TrendDirection;
  status: "mastered" | "learning" | "struggling" | "dangerous";
}

// C. Time Analysis Types
export interface PlannedVsActualData {
  date: string;
  plannedMinutes: number;
  actualMinutes: number;
  variance: number; // Percent difference
}

export interface SessionQuality {
  totalSessions: number;
  averageDuration: number;
  activeTimePercent: number;
  idleTimePercent: number;
  abandonmentRate: number;
  frequentPauses: number;
  averageSessionsPerDay: number;
}

export interface FatigueIndicator {
  detected: boolean;
  severity: "mild" | "moderate" | "severe";
  signals: string[];
  recommendation: string;
}

// D. Weakness Types
export interface WeakConcept {
  conceptId: string;
  conceptName: string;
  accuracy: number;
  goalImpact: "critical" | "high" | "medium" | "low";
  dependencyWeight: number;
  affectedDownstream: string[];
  reason: string;
  suggestedAction: string;
}

export interface ConfidenceMatrixItem {
  conceptId: string;
  conceptName: string;
  confidence: number; // 0-100
  competence: number; // 0-100 (accuracy)
  quadrant: "confident-correct" | "confident-wrong" | "unsure-correct" | "unsure-wrong";
  priority: number; // Higher = needs attention
}

// E. Revision Types
export interface RevisionEffectiveness {
  conceptId: string;
  conceptName: string;
  accuracyBefore: number;
  accuracyAfter: number;
  improvement: number;
  retentionDays: number;
  revisionsCount: number;
  isEffective: boolean;
}

export interface ForgettingCurveData {
  conceptId: string;
  conceptName: string;
  initialAccuracy: number;
  currentAccuracy: number;
  daysSinceLearn: number;
  decayRate: number; // Percent lost per day
  revisionRecoveryPercent: number;
  nextRevisionDue: string;
}

// Full Analytics Data
export interface AnalyticsData {
  // Filters
  timeRange: "week" | "month" | "quarter" | "all";
  goalId?: string;
  topicId?: string;

  // A. Reality Check
  readiness: ReadinessData;
  pace: PaceData;
  effortOutcome: EffortOutcomeData;

  // B. Accuracy
  accuracyTrend: AccuracyDataPoint[];
  accuracyInterpretation: AccuracyInterpretation;
  topicMastery: TopicMastery[];

  // C. Time Analysis
  plannedVsActual: PlannedVsActualData[];
  sessionQuality: SessionQuality;
  fatigue: FatigueIndicator;

  // D. Weakness
  weakConcepts: WeakConcept[];
  confidenceMatrix: ConfidenceMatrixItem[];

  // E. Revision
  revisionEffectiveness: RevisionEffectiveness[];
  forgettingCurve: ForgettingCurveData[];
}
