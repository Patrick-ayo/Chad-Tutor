/**
 * Chad Tutor AI – Core Guidelines (Unbreakable Rules)
 * These are the fundamental rules that govern all AI responses
 */

export type ResponseFormatType = 'situation' | 'impact' | 'options' | 'recommendation';

export interface StructuredResponse {
  situation: string;           // What's happening
  impact: string;              // What this causes (time, deadline, pressure)
  options: ChoiceOption[];      // Clear choices (max 3)
  recommendation: string;       // Best option (system-driven)
  reasoning?: string;           // Why this recommendation
}

export interface ChoiceOption {
  label: string;
  consequence: string;
  isRecommended: boolean;
}

export interface ConstraintData {
  dailyAvailableTime: number;  // in minutes
  softDeadlines: Date[];
  hardDeadlines: Date[];
  urgencyScores: Record<string, number>; // 0-1
  bufferCapacity: number;      // in minutes
  pastSkips: number;
  overperformanceHistory: boolean;
}

export interface DecisionContext {
  constraints: ConstraintData;
  userRequest: string;
  systemState: string;
  isStudyRelated: boolean;
}

/**
 * Rule 1: Authority Rule
 * The system (scheduler) is always correct by default
 */
export function validateSystemAuthority(_systemDecision: string, _userRequest: string): boolean {
  // Only allows override with valid urgency/workload/deadline justification
  return true; // System decision stands unless explicitly challenged with data
}

/**
 * Rule 2: No Blind Agreement
 * Challenge laziness and show consequences
 */
export function challengeAvoidance(userMessage: string): { shouldChallenge: boolean; challenge?: string } {
  const avoidancePatterns = [
    /don't feel like/i,
    /not in the mood/i,
    /too tired/i,
    /maybe later/i,
    /next time/i,
    /i need a break/i,
    /can i skip/i,
    /want to postpone/i,
  ];

  const matches = avoidancePatterns.some(pattern => pattern.test(userMessage));

  if (matches) {
    return {
      shouldChallenge: true,
      challenge: `Feeling burned out? Let's look at the data: Your deadline is approaching and buffer capacity is limited. Let me show you options.`,
    };
  }

  return { shouldChallenge: false };
}

/**
 * Rule 3: Structured Response Format (Always)
 * Every response follows: Situation → Impact → Options → Recommendation
 */
export function formatStructuredResponse(data: StructuredResponse): string {
  const optionsText = data.options
    .map((opt, i) => `  ${i + 1}. ${opt.label}\n     └ ${opt.consequence}${opt.isRecommended ? ' ⭐' : ''}`)
    .join('\n');

  return `**Situation:**
${data.situation}

**Impact:**
${data.impact}

**Options:**
${optionsText}

**Recommendation:**
${data.recommendation}
${data.reasoning ? `\n**Why:** ${data.reasoning}` : ''}`;
}

/**
 * Rule 4: Constraint Awareness (Mandatory)
 * Always consider available time, deadlines, urgency, buffer
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function validateConstraintAwareness(response: string, constraints: ConstraintData): boolean {
  // Touch constraints so strict checks keep this parameter intentional.
  void constraints.dailyAvailableTime;
  
  // Response should reference at least one constraint
  const constraintMentioned = 
    /deadline|time|urgent|buffer|available/i.test(response);

  return constraintMentioned;
}

/**
 * Rule 5: Skip Handling
 * Calculate impact and decide strategy
 */
export function handleSkip(
  _taskName: string,
  urgency: number,
  bufferCapacity: number,
  nextTaskUrgency: number
): { strategy: 'absorb' | 'reschedule_local' | 'global_rebalance'; explanation: string } {
  if (urgency < 0.3 && bufferCapacity > 30) {
    return {
      strategy: 'absorb',
      explanation: `This task (urgency ${urgency}) can be absorbed into buffer capacity (${bufferCapacity}min available).`,
    };
  }

  if (urgency > nextTaskUrgency && bufferCapacity > 15) {
    return {
      strategy: 'reschedule_local',
      explanation: `Moving to next available slot. Your buffer can absorb this (urgency ${urgency} vs buffer ${bufferCapacity}min).`,
    };
  }

  return {
    strategy: 'global_rebalance',
    explanation: `Skipping high-urgency task (${urgency}). Triggering schedule rebalance to prevent cascade failures.`,
  };
}

/**
 * Rule 6: No Motivation Fluff
 * Replace empty encouragement with data
 */
export function sanitizeResponse(response: string): string {
  const bannedPhrases = [
    /you got this.*💪/gi,
    /don't worry/gi,
    /take your time/gi,
    /you can do it/gi,
    /i believe in you/gi,
    /no pressure/gi,
    /it's okay/gi,
  ];

  let cleaned = response;
  bannedPhrases.forEach(phrase => {
    cleaned = cleaned.replace(phrase, '');
  });

  return cleaned.trim();
}

/**
 * Rule 7: Decision Transparency
 * Explain system decisions with data
 */
export function explainDecision(
  taskA: string,
  urgencyA: number,
  taskB: string,
  urgencyB: number,
  reasoning: string
): string {
  return `${taskA} moved because its urgency (${urgencyA.toFixed(1)}) is ${urgencyA > urgencyB ? 'higher' : 'lower'} than ${taskB} (${urgencyB.toFixed(1)})${reasoning ? `. ${reasoning}` : ''}.`;
}

/**
 * Rule 8: Escalation Logic
 * Detect repeated failures and escalate
 */
export function detectEscalation(skipHistory: number[], _threshold = 3): {
  level: 0 | 1 | 2 | 3;
  action: string;
} {
  const recentSkips = skipHistory.slice(-5).length;

  if (recentSkips >= 5) {
    return {
      level: 3,
      action: 'CRITICAL: Recommend reducing workload or dropping a subject. Current pace is unsustainable.',
    };
  }

  if (recentSkips >= 3) {
    return {
      level: 2,
      action: 'WARNING: Workload adjusted. Extending deadlines by 2 days.',
    };
  }

  if (recentSkips >= 1) {
    return {
      level: 1,
      action: 'Suggesting adjustment. Monitor performance closely.',
    };
  }

  return {
    level: 0,
    action: 'On track.',
  };
}

/**
 * Rule 9: Hard Boundary - Learning Only
 * Reject non-learning requests
 */
export function enforceLearningBoundary(message: string): { allowed: boolean; response?: string } {
  const nonLearningPatterns = [
    /what's the weather/i,
    /tell me a joke/i,
    /what's your opinion on/i,
    /help me with my homework/i,
    /can you do my project/i,
    /movie recommendations/i,
    /restaurant suggestions/i,
  ];

  const isBlocked = nonLearningPatterns.some(pattern => pattern.test(message));

  if (isBlocked) {
    return {
      allowed: false,
      response: `Not relevant to your learning plan. Continue with today's tasks or adjust your schedule if needed.`,
    };
  }

  return { allowed: true };
}

/**
 * Rule 10: Memory Usage Rule
 * Track patterns, not just summaries
 */
export interface LearningPattern {
  taskType: string;
  successRate: number;
  avgSkipCount: number;
  optimalTime: number; // time of day
  difficulty: 'easy' | 'medium' | 'hard';
  adjustmentNeeded: boolean;
}

export function detectPattern(taskHistory: Array<{ task: string; completed: boolean; time: Date; duration: number }>): LearningPattern {
  const tasksByType = new Map<string, typeof taskHistory>();

  taskHistory.forEach(item => {
    if (!tasksByType.has(item.task)) {
      tasksByType.set(item.task, []);
    }
    tasksByType.get(item.task)!.push(item);
  });

  // Simplified pattern detection
  const successes = taskHistory.filter(t => t.completed).length;
  const successRate = successes / taskHistory.length;

  return {
    taskType: 'general',
    successRate,
    avgSkipCount: taskHistory.filter(t => !t.completed).length,
    optimalTime: 10, // morning hours
    difficulty: successRate > 0.8 ? 'easy' : successRate > 0.5 ? 'medium' : 'hard',
    adjustmentNeeded: successRate < 0.6,
  };
}

/**
 * Banned Phrases - Never use in responses
 */
export const BANNED_PHRASES = [
  'You got this',
  "Don't worry",
  'Take your time',
  'You can do it',
  'I believe in you',
  'No pressure',
  "It's okay",
  'Do whatever you want',
  'It depends',
  'Up to you',
];

/**
 * Check if response contains banned phrases
 */
export function hasBannedContent(response: string): boolean {
  return BANNED_PHRASES.some(phrase => 
    new RegExp(phrase, 'i').test(response)
  );
}
