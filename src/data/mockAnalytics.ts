import { subDays, format } from "date-fns";
import type { AnalyticsData } from "@/types/analytics";

// Generate accuracy trend data
function generateAccuracyTrend(): AnalyticsData["accuracyTrend"] {
  const data = [];
  const today = new Date();

  // Simulate a learning pattern with some plateau
  let baseAccuracy = 55;

  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);

    // Add realistic progression with noise
    if (i > 20) {
      baseAccuracy += Math.random() * 2; // Early fast learning
    } else if (i > 10) {
      baseAccuracy += Math.random() * 0.5; // Plateau
    } else {
      baseAccuracy += Math.random() * 1.2; // Recovery
    }

    const noise = (Math.random() - 0.5) * 8;
    const accuracy = Math.min(95, Math.max(40, baseAccuracy + noise));

    data.push({
      date: format(date, "yyyy-MM-dd"),
      accuracy: Math.round(accuracy),
      smoothedAccuracy: Math.round(baseAccuracy),
      questionsAttempted: Math.floor(Math.random() * 20) + 10,
    });
  }

  return data;
}

// Generate planned vs actual time data
function generatePlannedVsActual(): AnalyticsData["plannedVsActual"] {
  const data = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = subDays(today, i);
    const planned = 60 + Math.floor(Math.random() * 30);
    const actualRatio = 0.6 + Math.random() * 0.6; // 60% to 120% of planned
    const actual = Math.round(planned * actualRatio);

    data.push({
      date: format(date, "yyyy-MM-dd"),
      plannedMinutes: planned,
      actualMinutes: actual,
      variance: Math.round((actual / planned - 1) * 100),
    });
  }

  return data;
}

export const mockAnalyticsData: AnalyticsData = {
  timeRange: "month",
  goalId: "goal-1",

  // A. Reality Check
  readiness: {
    overallPercent: 64,
    confidenceInterval: { low: 52, high: 76 },
    trend: "up",
    dataReliability: "reliable",
    lastUpdated: new Date().toISOString(),
  },

  pace: {
    status: "behind",
    daysAhead: -3,
    completionRate: 78,
    missedSessions: 4,
    skippedAssessments: 1,
    timeAccuracy: 0.82,
    warning: "Ahead on easy topics but behind on core concepts",
  },

  effortOutcome: {
    timeSpentHours: 42.5,
    accuracyGainPercent: 18,
    efficiencyRatio: 0.42,
    trend: "down",
    interpretation: "diminishing",
    insight:
      "You're spending more time but gaining less accuracy. Consider focusing on weak areas instead of reviewing mastered topics.",
  },

  // B. Accuracy
  accuracyTrend: generateAccuracyTrend(),

  accuracyInterpretation: {
    pattern: "plateau",
    description:
      "Your accuracy has plateaued around 72% for the past 10 days despite continued effort.",
    recommendation:
      "You may be stuck on conceptual misunderstandings. Review the weak concepts identified below and consider changing your approach.",
  },

  topicMastery: [
    {
      topicId: "t1",
      topicName: "Arrays & Strings",
      accuracy: 85,
      confidence: "high",
      confidenceMismatch: false,
      attemptCount: 45,
      lastAttempted: format(subDays(new Date(), 2), "yyyy-MM-dd"),
      trend: "up",
      status: "mastered",
    },
    {
      topicId: "t2",
      topicName: "Binary Search",
      parentTopic: "Searching",
      accuracy: 78,
      confidence: "high",
      confidenceMismatch: false,
      attemptCount: 32,
      lastAttempted: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      trend: "up",
      status: "learning",
    },
    {
      topicId: "t3",
      topicName: "Dynamic Programming",
      accuracy: 45,
      confidence: "high",
      confidenceMismatch: true,
      attemptCount: 28,
      lastAttempted: format(subDays(new Date(), 3), "yyyy-MM-dd"),
      trend: "flat",
      status: "dangerous",
    },
    {
      topicId: "t4",
      topicName: "Graph Traversal",
      accuracy: 52,
      confidence: "low",
      confidenceMismatch: false,
      attemptCount: 18,
      lastAttempted: format(subDays(new Date(), 5), "yyyy-MM-dd"),
      trend: "down",
      status: "struggling",
    },
    {
      topicId: "t5",
      topicName: "Trees",
      parentTopic: "Data Structures",
      accuracy: 68,
      confidence: "medium",
      confidenceMismatch: false,
      attemptCount: 35,
      lastAttempted: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      trend: "up",
      status: "learning",
    },
    {
      topicId: "t6",
      topicName: "Recursion",
      accuracy: 42,
      confidence: "high",
      confidenceMismatch: true,
      attemptCount: 22,
      lastAttempted: format(subDays(new Date(), 4), "yyyy-MM-dd"),
      trend: "down",
      status: "dangerous",
    },
  ],

  // C. Time Analysis
  plannedVsActual: generatePlannedVsActual(),

  sessionQuality: {
    totalSessions: 28,
    averageDuration: 38,
    activeTimePercent: 72,
    idleTimePercent: 28,
    abandonmentRate: 18,
    frequentPauses: 4,
    averageSessionsPerDay: 1.4,
  },

  fatigue: {
    detected: true,
    severity: "moderate",
    signals: [
      "Accuracy drops 15% in final 20 minutes of sessions",
      "Retry count increases by 40% after 45 minutes",
      "Session abandonment spikes after 6pm",
    ],
    recommendation:
      "Consider shorter sessions (30-40 min) with breaks. Avoid studying after 6pm when possible.",
  },

  // D. Weakness
  weakConcepts: [
    {
      conceptId: "c1",
      conceptName: "Memoization in DP",
      accuracy: 38,
      goalImpact: "critical",
      dependencyWeight: 0.85,
      affectedDownstream: ["LCS problems", "Knapsack", "Matrix Chain"],
      reason: "Struggling to identify overlapping subproblems",
      suggestedAction: "Review recursive to memoized conversion with simpler problems first",
    },
    {
      conceptId: "c2",
      conceptName: "Graph DFS/BFS Choice",
      accuracy: 45,
      goalImpact: "high",
      dependencyWeight: 0.7,
      affectedDownstream: ["Shortest paths", "Cycle detection", "Topological sort"],
      reason: "Confusion about when to use DFS vs BFS",
      suggestedAction: "Create a decision tree for DFS vs BFS based on problem type",
    },
    {
      conceptId: "c3",
      conceptName: "Recursion Base Cases",
      accuracy: 52,
      goalImpact: "high",
      dependencyWeight: 0.75,
      affectedDownstream: ["All recursive algorithms", "Tree traversals", "Backtracking"],
      reason: "Missing or incorrect base cases leading to infinite loops",
      suggestedAction: "Practice identifying base cases before writing recursive logic",
    },
    {
      conceptId: "c4",
      conceptName: "Time Complexity Analysis",
      accuracy: 58,
      goalImpact: "medium",
      dependencyWeight: 0.5,
      affectedDownstream: ["Algorithm optimization", "Interview explanations"],
      reason: "Difficulty with nested loop analysis and amortized complexity",
      suggestedAction: "Work through complexity analysis step-by-step with examples",
    },
  ],

  confidenceMatrix: [
    // Confident + Correct
    { conceptId: "m1", conceptName: "Array Indexing", confidence: 90, competence: 92, quadrant: "confident-correct", priority: 1 },
    { conceptId: "m2", conceptName: "String Manipulation", confidence: 85, competence: 88, quadrant: "confident-correct", priority: 1 },
    { conceptId: "m3", conceptName: "Hash Maps", confidence: 80, competence: 85, quadrant: "confident-correct", priority: 1 },

    // Confident + Wrong (DANGEROUS)
    { conceptId: "m4", conceptName: "Dynamic Programming", confidence: 82, competence: 45, quadrant: "confident-wrong", priority: 10 },
    { conceptId: "m5", conceptName: "Recursion", confidence: 75, competence: 42, quadrant: "confident-wrong", priority: 10 },

    // Unsure + Correct
    { conceptId: "m6", conceptName: "Two Pointers", confidence: 45, competence: 78, quadrant: "unsure-correct", priority: 3 },
    { conceptId: "m7", conceptName: "Sliding Window", confidence: 40, competence: 72, quadrant: "unsure-correct", priority: 3 },

    // Unsure + Wrong
    { conceptId: "m8", conceptName: "Graph Algorithms", confidence: 35, competence: 52, quadrant: "unsure-wrong", priority: 5 },
    { conceptId: "m9", conceptName: "Backtracking", confidence: 30, competence: 48, quadrant: "unsure-wrong", priority: 5 },
    { conceptId: "m10", conceptName: "Bit Manipulation", confidence: 25, competence: 40, quadrant: "unsure-wrong", priority: 5 },
  ],

  // E. Revision
  revisionEffectiveness: [
    {
      conceptId: "r1",
      conceptName: "Binary Search",
      accuracyBefore: 62,
      accuracyAfter: 82,
      improvement: 20,
      retentionDays: 12,
      revisionsCount: 3,
      isEffective: true,
    },
    {
      conceptId: "r2",
      conceptName: "Tree Traversal",
      accuracyBefore: 55,
      accuracyAfter: 71,
      improvement: 16,
      retentionDays: 8,
      revisionsCount: 2,
      isEffective: true,
    },
    {
      conceptId: "r3",
      conceptName: "Dynamic Programming",
      accuracyBefore: 42,
      accuracyAfter: 48,
      improvement: 6,
      retentionDays: 4,
      revisionsCount: 4,
      isEffective: false,
    },
    {
      conceptId: "r4",
      conceptName: "Recursion",
      accuracyBefore: 45,
      accuracyAfter: 44,
      improvement: -1,
      retentionDays: 3,
      revisionsCount: 3,
      isEffective: false,
    },
    {
      conceptId: "r5",
      conceptName: "Graph BFS",
      accuracyBefore: 50,
      accuracyAfter: 62,
      improvement: 12,
      retentionDays: 6,
      revisionsCount: 2,
      isEffective: true,
    },
  ],

  forgettingCurve: [
    {
      conceptId: "f1",
      conceptName: "Dynamic Programming",
      initialAccuracy: 68,
      currentAccuracy: 45,
      daysSinceLearn: 7,
      decayRate: 3.3,
      revisionRecoveryPercent: 12,
      nextRevisionDue: format(subDays(new Date(), 1), "yyyy-MM-dd"), // Overdue
    },
    {
      conceptId: "f2",
      conceptName: "Recursion Patterns",
      initialAccuracy: 72,
      currentAccuracy: 48,
      daysSinceLearn: 10,
      decayRate: 2.4,
      revisionRecoveryPercent: 8,
      nextRevisionDue: format(new Date(), "yyyy-MM-dd"), // Due today
    },
    {
      conceptId: "f3",
      conceptName: "Graph Traversal",
      initialAccuracy: 65,
      currentAccuracy: 52,
      daysSinceLearn: 5,
      decayRate: 2.6,
      revisionRecoveryPercent: 15,
      nextRevisionDue: format(subDays(new Date(), -2), "yyyy-MM-dd"), // Due in 2 days
    },
    {
      conceptId: "f4",
      conceptName: "Binary Trees",
      initialAccuracy: 80,
      currentAccuracy: 72,
      daysSinceLearn: 4,
      decayRate: 2.0,
      revisionRecoveryPercent: 18,
      nextRevisionDue: format(subDays(new Date(), -5), "yyyy-MM-dd"),
    },
    {
      conceptId: "f5",
      conceptName: "Hash Table Collisions",
      initialAccuracy: 75,
      currentAccuracy: 70,
      daysSinceLearn: 3,
      decayRate: 1.7,
      revisionRecoveryPercent: 20,
      nextRevisionDue: format(subDays(new Date(), -7), "yyyy-MM-dd"),
    },
  ],
};
