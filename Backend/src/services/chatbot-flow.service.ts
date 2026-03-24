export type ChatFlowState =
  | 'context_collection'
  | 'confirmation'
  | 'execution_choice'
  | 'timeline_collection'
  | 'active_plan';

export interface ChatProfileContext {
  languages: string[];
  jobCourses: string[];
  positions: string[];
  skills: string[];
  goals: string[];
}

export interface ChatFlowContext {
  profile: ChatProfileContext;
  executionChoices: string[];
  awaitingTier: boolean;
  tier?: 'free' | 'paid';
  deadlineTarget?: string;
  deadlineDays?: number;
  skipValidationWarningShown?: boolean;
}

export interface ChatFlowRequest {
  state: ChatFlowState;
  input?: string;
  selectedOptions?: string[];
  context?: ChatFlowContext;
}

export interface ChatFlowResponse {
  state: ChatFlowState;
  message: string;
  options?: string[];
  multiSelect?: boolean;
  context: ChatFlowContext;
}

const LANGUAGE_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'swift', 'kotlin',
  'html', 'css', 'sql',
];

const JOB_COURSE_KEYWORDS = [
  'frontend', 'backend', 'fullstack', 'devops', 'data science', 'ai', 'ml', 'blockchain', 'android', 'ios',
  'qa', 'cyber security', 'cloud',
];

const POSITION_KEYWORDS = [
  'developer', 'engineer', 'analyst', 'manager', 'architect', 'intern', 'lead',
];

const SKILL_KEYWORDS = [
  'react', 'node', 'express', 'mongodb', 'postgresql', 'docker', 'kubernetes', 'git', 'testing',
  'algorithms', 'system design', 'dsa',
];

const GOAL_KEYWORDS = [
  'job', 'interview', 'promotion', 'switch', 'placement', 'career', 'roadmap', 'plan',
];

function emptyContext(): ChatFlowContext {
  return {
    profile: {
      languages: [],
      jobCourses: [],
      positions: [],
      skills: [],
      goals: [],
    },
    executionChoices: [],
    awaitingTier: false,
  };
}

function uniquePush(target: string[], value: string) {
  if (!target.includes(value)) {
    target.push(value);
  }
}

function isLearningRelated(text: string): boolean {
  const lower = text.toLowerCase();
  const learningSignals = [
    ...LANGUAGE_KEYWORDS,
    ...JOB_COURSE_KEYWORDS,
    ...POSITION_KEYWORDS,
    ...SKILL_KEYWORDS,
    ...GOAL_KEYWORDS,
    'learn', 'study', 'course', 'topic', 'skill', 'schedule', 'quiz', 'recap', 'roadmap',
  ];
  return learningSignals.some((k) => lower.includes(k));
}

function extractProfileContext(input: string, base: ChatFlowContext): ChatFlowContext {
  const lower = input.toLowerCase();
  const next = {
    ...base,
    profile: {
      languages: [...base.profile.languages],
      jobCourses: [...base.profile.jobCourses],
      positions: [...base.profile.positions],
      skills: [...base.profile.skills],
      goals: [...base.profile.goals],
    },
  };

  LANGUAGE_KEYWORDS.forEach((k) => {
    if (lower.includes(k)) uniquePush(next.profile.languages, k);
  });

  JOB_COURSE_KEYWORDS.forEach((k) => {
    if (lower.includes(k)) uniquePush(next.profile.jobCourses, k);
  });

  POSITION_KEYWORDS.forEach((k) => {
    if (lower.includes(k)) uniquePush(next.profile.positions, k);
  });

  SKILL_KEYWORDS.forEach((k) => {
    if (lower.includes(k)) uniquePush(next.profile.skills, k);
  });

  GOAL_KEYWORDS.forEach((k) => {
    if (lower.includes(k)) uniquePush(next.profile.goals, k);
  });

  return next;
}

function hasProfileData(context: ChatFlowContext): boolean {
  const p = context.profile;
  return p.languages.length > 0 || p.jobCourses.length > 0 || p.positions.length > 0 || p.skills.length > 0 || p.goals.length > 0;
}

function formatProfileSummary(context: ChatFlowContext): string {
  const p = context.profile;
  const lines: string[] = [];

  if (p.languages.length > 0) lines.push(`• **Languages**: ${p.languages.join(', ')}`);
  if (p.jobCourses.length > 0) lines.push(`• **Job/Courses**: ${p.jobCourses.join(', ')}`);
  if (p.positions.length > 0) lines.push(`• **Positions**: ${p.positions.join(', ')}`);
  if (p.skills.length > 0) lines.push(`• **Skills**: ${p.skills.join(', ')}`);
  if (p.goals.length > 0) lines.push(`• **Goals**: ${p.goals.join(', ')}`);

  return lines.join('\n');
}

function buildPlanBrief(context: ChatFlowContext): string {
  const tier = context.tier === 'paid' ? 'Paid Tier' : 'Free Tier';
  const choices = context.executionChoices.length > 0 ? context.executionChoices.join(', ') : 'Generate Plan';
  const focus = context.profile.jobCourses[0] || context.profile.skills[0] || context.profile.languages[0] || 'Core learning goal';
  const timeline = context.deadlineTarget || 'No strict deadline provided';

  const resourceLine =
    context.tier === 'paid'
      ? 'Resources: Premium course track + mentor-grade assignments + certification prep'
      : 'Resources: Free docs + free videos + open practice sets';

  return `Execution mode: ${choices}\nTier: ${tier}\nFocus: ${focus}\nTimeline: ${timeline}\n\nHow to do it:\n1. Daily 60-90 min focused block\n2. End each day with 15 min recap\n3. Weekly checkpoint on Day 7\n\nSuggested schedule:\n• Day 1-2: Foundations\n• Day 3-4: Guided practice\n• Day 5-6: Build + revise\n• Day 7: Review + skill validation\n\n${resourceLine}`;
}

function parseTimelineInput(input: string): { deadlineTarget: string; deadlineDays?: number } | null {
  const lower = input.toLowerCase();

  const exactDate = input.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (exactDate?.[1]) {
    return {
      deadlineTarget: exactDate[1],
    };
  }

  const weekMatch = lower.match(/(\d+)\s*(week|weeks)/);
  if (weekMatch?.[1]) {
    const weeks = Number(weekMatch[1]);
    if (!Number.isNaN(weeks) && weeks > 0) {
      return {
        deadlineTarget: `${weeks} week${weeks > 1 ? 's' : ''}`,
        deadlineDays: weeks * 7,
      };
    }
  }

  const monthMatch = lower.match(/(\d+)\s*(month|months)/);
  if (monthMatch?.[1]) {
    const months = Number(monthMatch[1]);
    if (!Number.isNaN(months) && months > 0) {
      return {
        deadlineTarget: `${months} month${months > 1 ? 's' : ''}`,
        deadlineDays: months * 30,
      };
    }
  }

  return null;
}

export function getChatFlowResponse(payload: ChatFlowRequest): ChatFlowResponse {
  const currentState = payload.state || 'context_collection';
  const selectedOptions = payload.selectedOptions || [];
  const input = (payload.input || '').trim();
  const context = payload.context || emptyContext();

  if (currentState === 'context_collection') {
    if (selectedOptions.includes('Yes, clarify')) {
      return {
        state: 'context_collection',
        message: 'Great. Clarify how it connects to your learning goal (skills, role, topic, or exam target).',
        context,
      };
    }

    if (selectedOptions.includes('No, return to plan')) {
      return {
        state: 'context_collection',
        message: 'Back to your learning plan. Share your context so I can build your path.',
        context,
      };
    }

    if (!input) {
      return {
        state: 'context_collection',
        message: 'Share your current context: what you know, target role, and what you want to achieve.',
        context,
      };
    }

    if (!isLearningRelated(input)) {
      return {
        state: 'context_collection',
        message: 'Is this related to your learning goal?',
        options: ['Yes, clarify', 'No, return to plan'],
        context,
      };
    }

    const extracted = extractProfileContext(input, context);
    if (!hasProfileData(extracted)) {
      return {
        state: 'context_collection',
        message: 'I still need concrete learning context. Add languages, current skills, and your target role.',
        context: extracted,
      };
    }

    return {
      state: 'confirmation',
      message: `Is this your complete context?\n\n${formatProfileSummary(extracted)}`,
      options: ['Add More Context', 'Confirm & Continue'],
      context: extracted,
    };
  }

  if (currentState === 'confirmation') {
    if (selectedOptions.includes('Add More Context')) {
      return {
        state: 'context_collection',
        message: 'Add the missing context now (skills, goals, role, constraints).',
        context,
      };
    }

    if (selectedOptions.includes('Confirm & Continue')) {
      return {
        state: 'execution_choice',
        message: 'Choose how to proceed',
        options: ['Validate Skills', 'Review Concepts', 'Generate Plan'],
        multiSelect: true,
        context,
      };
    }

    if (input) {
      const extracted = extractProfileContext(input, context);
      return {
        state: 'confirmation',
        message: `Updated context captured. Confirm now?\n\n${formatProfileSummary(extracted)}`,
        options: ['Add More Context', 'Confirm & Continue'],
        context: extracted,
      };
    }

    return {
      state: 'confirmation',
      message: 'Confirm the profile to continue.',
      options: ['Add More Context', 'Confirm & Continue'],
      context,
    };
  }

  if (currentState === 'execution_choice') {
    if (selectedOptions.length === 0) {
      return {
        state: 'execution_choice',
        message: 'Select at least one execution option to continue.',
        options: ['Validate Skills', 'Review Concepts', 'Generate Plan'],
        multiSelect: true,
        context,
      };
    }

    const hasValidation = selectedOptions.includes('Validate Skills');

    if (!hasValidation && !context.skipValidationWarningShown) {
      return {
        state: 'execution_choice',
        message: 'You skipped an important step: skill validation. Continue anyway?',
        options: ['Proceed Without Validation', 'Go Back & Validate Skills'],
        context: {
          ...context,
          skipValidationWarningShown: true,
        },
      };
    }

    if (selectedOptions.includes('Go Back & Validate Skills')) {
      return {
        state: 'execution_choice',
        message: 'Good call. Choose execution options again.',
        options: ['Validate Skills', 'Review Concepts', 'Generate Plan'],
        multiSelect: true,
        context: {
          ...context,
          skipValidationWarningShown: false,
        },
      };
    }

    return {
      state: 'timeline_collection',
      message: 'Before execution, define your timeline so I can optimize pacing. What is your target deadline?',
      options: ['2 Weeks', '4 Weeks', '8 Weeks', '12 Weeks', 'Custom Date (YYYY-MM-DD)'],
      context: {
        ...context,
        executionChoices: selectedOptions,
        awaitingTier: false,
      },
    };
  }

  if (currentState === 'timeline_collection') {
    const option = selectedOptions[0];
    const timelineFromOption = option
      ? parseTimelineInput(option === 'Custom Date (YYYY-MM-DD)' ? '' : option)
      : null;
    const timelineFromInput = input ? parseTimelineInput(input) : null;
    const timeline = timelineFromInput || timelineFromOption;

    if (!timeline) {
      return {
        state: 'timeline_collection',
        message:
          'Please provide a valid timeline (e.g., 4 weeks, 2 months, or YYYY-MM-DD).',
        options: ['2 Weeks', '4 Weeks', '8 Weeks', '12 Weeks', 'Custom Date (YYYY-MM-DD)'],
        context,
      };
    }

    return {
      state: 'active_plan',
      message: `Timeline captured: ${timeline.deadlineTarget}. Choose your plan tier.`,
      options: ['Free Tier', 'Paid Tier'],
      context: {
        ...context,
        deadlineTarget: timeline.deadlineTarget,
        deadlineDays: timeline.deadlineDays,
        awaitingTier: true,
      },
    };
  }

  if (context.awaitingTier) {
    if (selectedOptions.includes('Free Tier') || selectedOptions.includes('Paid Tier')) {
      const tier = selectedOptions.includes('Paid Tier') ? 'paid' : 'free';
      const nextContext: ChatFlowContext = {
        ...context,
        tier,
        awaitingTier: false,
      };

      return {
        state: 'active_plan',
        message: buildPlanBrief(nextContext),
        options: ['Adjust Plan', 'Regenerate Plan', 'Start Execution'],
        context: nextContext,
      };
    }

    return {
      state: 'active_plan',
      message: 'Select a tier to generate your plan.',
      options: ['Free Tier', 'Paid Tier'],
      context,
    };
  }

  if (selectedOptions.includes('Regenerate Plan')) {
    return {
      state: 'active_plan',
      message: buildPlanBrief(context),
      options: ['Adjust Plan', 'Regenerate Plan', 'Start Execution'],
      context,
    };
  }

  if (selectedOptions.includes('Adjust Plan')) {
    return {
      state: 'execution_choice',
      message: 'Choose revised execution options.',
      options: ['Validate Skills', 'Review Concepts', 'Generate Plan'],
      multiSelect: true,
      context,
    };
  }

  return {
    state: 'active_plan',
    message: 'Plan is active. Continue execution or adjust if needed.',
    options: ['Adjust Plan', 'Regenerate Plan', 'Start Execution'],
    context,
  };
}
