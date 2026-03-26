import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ChatInterface } from './ChatInterface';
import { ChatSidebar } from './ChatSidebar';
import { GoalSelection, type GoalOption } from './GoalSelection';
import type { ChatMessage, ChatConversation, UserContext } from '@/types/chat';
import type { Roadmap } from '@/types/goal';
import {
  extractUserContext,
  formatContextSummary,
  getGroundLevelSkills,
} from '@/utils/chatContextUtils';

const GOAL_MESSAGES: Record<string, string> = {
  explore: "Great! Let's explore your learning preferences and strengths. Tell me about your current knowledge and what subjects interest you the most.",
  skills: "Perfect! I'll help you plan and sharpen your skills. Tell me which specific skill or subject you'd like to focus on, and I'll create a personalized learning plan with tests.",
  roadmap: "Excellent. We will build a passive roadmap from your current skills/courses, detect missing skills, then map it into a schedule.",
};

const CATCHPHRASES = [
  'Learn smarter, not harder with AI guidance',
  'Turn videos into structured, interactive learning',
  'From watching to mastering, step by step',
];

type ChatFlowState = 'context_collection' | 'confirmation' | 'execution_choice' | 'timeline_collection' | 'active_plan';

interface ChatFlowContext {
  profile: {
    languages: string[];
    jobCourses: string[];
    positions: string[];
    skills: string[];
    goals: string[];
  };
  executionChoices: string[];
  awaitingTier: boolean;
  tier?: 'free' | 'paid';
  deadlineTarget?: string;
  deadlineDays?: number;
  skipValidationWarningShown?: boolean;
}

interface ChatFlowResponse {
  state: ChatFlowState;
  message: string;
  options?: string[];
  multiSelect?: boolean;
  context: ChatFlowContext;
}

interface ConversationMetadata {
  flowState: ChatFlowState;
  flowContext: ChatFlowContext | null;
  quickOptions: string[];
  multiSelect: boolean;
  selectedOptionIds: string[];
  mode: 'standard' | 'passive-roadmap';
  passiveContext: UserContext | null;
  pendingRoadmap: Roadmap | null;
  selectedStartDate?: string;
  standardPlanApplied?: boolean;
}

const DEFAULT_METADATA: ConversationMetadata = {
  flowState: 'context_collection',
  flowContext: null,
  quickOptions: [],
  multiSelect: false,
  selectedOptionIds: [],
  mode: 'standard',
  passiveContext: null,
  pendingRoadmap: null,
  selectedStartDate: undefined,
  standardPlanApplied: false,
};

interface MrChadPageProps {
  onApplyRoadmapSchedule?: (roadmap: Roadmap, startDate?: string) => void | Promise<void>;
}

function createEmptyContext(): UserContext {
  return {
    languages: [],
    jobCourses: [],
    positions: [],
    subjects: [],
    skills: [],
    goals: [],
  };
}

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function extractDateFromText(input: string): string | undefined {
  const match = input.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  return match?.[1];
}

function toFlowUserContext(flowContext: ChatFlowContext): UserContext {
  return {
    languages: flowContext.profile.languages || [],
    jobCourses: flowContext.profile.jobCourses || [],
    positions: flowContext.profile.positions || [],
    skills: flowContext.profile.skills || [],
    goals: flowContext.profile.goals || [],
    subjects: [],
  };
}

function resolveStartDateFromFlow(flowContext: ChatFlowContext | null): string | undefined {
  if (!flowContext?.deadlineTarget) {
    return undefined;
  }

  const directDate = extractDateFromText(flowContext.deadlineTarget);
  if (directDate) {
    return directDate;
  }

  return undefined;
}

function buildTimelineOptions(): string[] {
  const base = new Date();
  const options: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(base);
    day.setDate(base.getDate() + i);
    options.push(`Start on ${toYmd(day)}`);
  }
  return options;
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function computeMissingSkills(context: UserContext): { current: string[]; required: string[]; missing: string[] } {
  const currentSet = new Set<string>([
    ...context.skills.map(normalizeToken),
    ...context.languages.map(normalizeToken),
  ]);

  const required = getGroundLevelSkills(context);
  const missing = required.filter((skill) => !currentSet.has(normalizeToken(skill)));

  return {
    current: [...context.skills, ...context.languages],
    required,
    missing,
  };
}

function buildRoadmapFromContext(context: UserContext): Roadmap {
  const { missing } = computeMissingSkills(context);
  const targets = missing.length > 0 ? missing : ['Core Fundamentals', 'Applied Practice'];
  const goalSlug = context.goals[0] || context.jobCourses[0] || 'passive-learning';
  const goalId = `mrchad-${normalizeToken(goalSlug).replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

  const topics = targets.slice(0, 8).map((skill, index) => {
    const topicBase = `topic-${index + 1}`;
    return {
      id: topicBase,
      name: skill,
      description: `Close gap in ${skill}`,
      estimatedMinutes: 95,
      tasks: [
        {
          id: `${topicBase}-learn`,
          name: `Learn ${skill} fundamentals`,
          estimatedMinutes: 40,
          difficulty: 'medium' as const,
          dependencies: [],
          revisionWeight: 0.3,
          status: 'scheduled' as const,
          scheduleReason: `Foundation block for ${skill}`,
        },
        {
          id: `${topicBase}-practice`,
          name: `Practice ${skill} in small exercises`,
          estimatedMinutes: 35,
          difficulty: 'medium' as const,
          dependencies: [`${topicBase}-learn`],
          revisionWeight: 0.4,
          status: 'scheduled' as const,
          scheduleReason: `Applied drill after concept block`,
        },
        {
          id: `${topicBase}-review`,
          name: `Review + self-check on ${skill}`,
          estimatedMinutes: 20,
          difficulty: 'easy' as const,
          dependencies: [`${topicBase}-practice`],
          revisionWeight: 0.5,
          status: 'scheduled' as const,
          scheduleReason: `Quick confidence check and retention`,
        },
      ],
    };
  });

  const totalEstimatedMinutes = topics.reduce((sum, topic) => sum + topic.estimatedMinutes, 0);

  return {
    id: `roadmap-${goalId}`,
    goalId,
    name: 'Mr Chad Passive Flow Roadmap',
    description: 'Generated from current profile, courses, and detected skill gaps.',
    phases: [
      {
        id: 'phase-gap-closure',
        name: 'Gap Closure Sprint',
        description: 'Prioritized missing-skill execution plan',
        order: 1,
        topics,
        estimatedMinutes: totalEstimatedMinutes,
      },
    ],
    totalEstimatedMinutes,
    bufferDays: 1,
    revisionSlots: Math.max(1, Math.round(topics.length / 2)),
    generatedAt: new Date().toISOString(),
  };
}

function roadmapSummaryForChat(context: UserContext, roadmap: Roadmap, selectedStartDate?: string): string {
  const { missing, required } = computeMissingSkills(context);
  const roadmapItems = roadmap.phases[0]?.topics
    .slice(0, 6)
    .map((topic, idx) => `${idx + 1}. ${topic.name}`)
    .join('\n');

  return [
    'Passive flow roadmap prepared.',
    '',
    `**Timeline Start**: ${selectedStartDate || 'Not selected yet'}`,
    `**Missing Skills Detected**: ${missing.length}`,
    `**Required Skills Seen From Your Courses**: ${required.length}`,
    '',
    '**Roadmap Focus**:',
    roadmapItems || '1. Fundamentals\n2. Practice\n3. Review',
    '',
    formatContextSummary(context),
  ].join('\n');
}

export function MrChadPage({ onApplyRoadmapSchedule }: MrChadPageProps) {
  const { userId } = useAuth();
  const userStoragePrefix = `user:${userId || 'anonymous'}`;
  const conversationsStorageKey = `${userStoragePrefix}:mr-chad-conversations`;
  const metadataStorageKey = `${userStoragePrefix}:mr-chad-metadata`;
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCatchphraseIndex, setCurrentCatchphraseIndex] = useState(0);
  const [quotePhase, setQuotePhase] = useState<'visible' | 'exit' | 'enter'>('visible');
  
  // Metadata for managing conversation state per conversation
  const [metadata, setMetadata] = useState<Record<string, ConversationMetadata>>({});

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(conversationsStorageKey);
    const savedMetadata = localStorage.getItem(metadataStorageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as ChatConversation[];
      setConversations(parsed);
      if (parsed.length > 0) {
        setActiveConversationId(parsed[0].id);
      }
    }
    if (savedMetadata) {
      try {
        setMetadata(JSON.parse(savedMetadata));
      } catch {
        setMetadata({});
      }
    }
  }, [conversationsStorageKey, metadataStorageKey]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(conversationsStorageKey, JSON.stringify(conversations));
  }, [conversations, conversationsStorageKey]);

  // Save metadata to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(metadataStorageKey, JSON.stringify(metadata));
  }, [metadata, metadataStorageKey]);

  // Rotate catchphrases with vertical fade animation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuotePhase('exit');

      setTimeout(() => {
        setCurrentCatchphraseIndex((prev) => (prev + 1) % CATCHPHRASES.length);
        setQuotePhase('enter');

        requestAnimationFrame(() => {
          setQuotePhase('visible');
        });
      }, 260);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateTitle = (messages: ChatMessage[]): string => {
    if (messages.length === 0) return 'New conversation';
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.substring(0, 30) + 
             (firstUserMessage.content.length > 30 ? '...' : '');
    }
    return 'Conversation';
  };

  const getConversationMetadata = (conversationId: string): ConversationMetadata => {
    return {
      ...DEFAULT_METADATA,
      ...(metadata[conversationId] || {}),
    };
  };

  const updateConversationMetadata = (conversationId: string, updates: Partial<ConversationMetadata>) => {
    setMetadata((prev) => ({
      ...prev,
      [conversationId]: {
        ...getConversationMetadata(conversationId),
        ...updates,
      },
    }));
  };

  const createNewChat = () => {
    const newConversation: ChatConversation = {
      id: Date.now().toString(),
      title: 'New conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
    setMetadata((prev) => ({
      ...prev,
      [newConversation.id]: DEFAULT_METADATA,
    }));
  };

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const handleGoalSelect = (goal: GoalOption) => {
    if (!activeConversation) return;

    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: GOAL_MESSAGES[goal.id],
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          const isPassiveRoadmap = goal.id === 'roadmap';
          return {
            ...c,
            messages: [
              assistantMessage,
              {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: isPassiveRoadmap
                  ? 'Share your current courses/role and what skills you already have. I will detect gaps, generate roadmap + schedule, then let you add it directly.'
                  : 'Share your current context: what you know, your target role, and what outcome you want.',
                timestamp: new Date(),
              },
            ],
            title: `${goal.title}`,
            updatedAt: new Date(),
          };
        }
        return c;
      })
    );

    if (activeConversationId) {
      const isPassiveRoadmap = goal.id === 'roadmap';
      updateConversationMetadata(activeConversationId, {
        flowState: isPassiveRoadmap ? 'active_plan' : 'context_collection',
        flowContext: null,
        quickOptions: [],
        multiSelect: false,
        selectedOptionIds: [],
        mode: isPassiveRoadmap ? 'passive-roadmap' : 'standard',
        passiveContext: null,
        pendingRoadmap: null,
        selectedStartDate: undefined,
      });
    }
  };

  const hasStarted = !!activeConversation && activeConversation.messages.length > 0;

  const appendMessage = (role: 'user' | 'assistant', content: string) => {
    if (!activeConversationId) return;

    const newMessage: ChatMessage = {
      id: (Date.now() + Math.random()).toString(),
      role,
      content,
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          const nextMessages = [...c.messages, newMessage];
          return {
            ...c,
            messages: nextMessages,
            title: c.messages.length === 0 && role === 'user' ? generateTitle(nextMessages) : c.title,
            updatedAt: new Date(),
          };
        }
        return c;
      })
    );
  };

  const toOptionId = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handlePassiveFlowMessage = async (content: string) => {
    if (!activeConversationId) return;

    appendMessage('user', content);

    const currentMetadata = getConversationMetadata(activeConversationId);
    const nextContext = extractUserContext(content, currentMetadata.passiveContext || createEmptyContext());
    const explicitDate = extractDateFromText(content);
    const startDate = explicitDate || currentMetadata.selectedStartDate;
    const signalCount =
      nextContext.jobCourses.length +
      nextContext.skills.length +
      nextContext.languages.length +
      nextContext.goals.length;

    if (signalCount < 2) {
      appendMessage(
        'assistant',
        'Need a bit more context. Tell me your target role/course and 2-3 skills you already have. Example: "I want backend, I know JavaScript and SQL".',
      );

      updateConversationMetadata(activeConversationId, {
        passiveContext: nextContext,
      });
      return;
    }

    const roadmap = buildRoadmapFromContext(nextContext);

    if (!startDate) {
      appendMessage(
        'assistant',
        `${roadmapSummaryForChat(nextContext, roadmap)}\n\nPick a start date (or type YYYY-MM-DD).`,
      );

      updateConversationMetadata(activeConversationId, {
        passiveContext: nextContext,
        pendingRoadmap: roadmap,
        selectedStartDate: undefined,
        quickOptions: [...buildTimelineOptions(), 'Use today'],
        multiSelect: false,
        selectedOptionIds: [],
      });
      return;
    }

    appendMessage(
      'assistant',
      `${roadmapSummaryForChat(nextContext, roadmap, startDate)}\n\nIf this looks good, add it to schedule.`,
    );

    updateConversationMetadata(activeConversationId, {
      passiveContext: nextContext,
      pendingRoadmap: roadmap,
      selectedStartDate: startDate,
      quickOptions: ['Add this schedule to planner', 'Pick another start date', 'Regenerate roadmap'],
      multiSelect: false,
      selectedOptionIds: [],
    });
  };

  const handleFlowResponse = (flowData: ChatFlowResponse) => {
    appendMessage('assistant', flowData.message);
    if (!activeConversationId) return;

    updateConversationMetadata(activeConversationId, {
      flowState: flowData.state,
      flowContext: flowData.context,
      quickOptions: flowData.options || [],
      multiSelect: !!flowData.multiSelect,
      selectedOptionIds: [],
    });
  };

  const requestFlow = async (params: { input?: string; selectedOptions?: string[] }) => {
    if (!activeConversationId) return;
    const currentMetadata = getConversationMetadata(activeConversationId);

    const response = await fetch('/api/ai/chat-flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: currentMetadata.flowState,
        input: params.input,
        selectedOptions: params.selectedOptions,
        context: currentMetadata.flowContext,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Chat flow request failed');
    }
    handleFlowResponse(data as ChatFlowResponse);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId || !activeConversation) return;

    const currentMetadata = getConversationMetadata(activeConversationId);
    if (currentMetadata.mode === 'passive-roadmap') {
      await handlePassiveFlowMessage(content);
      return;
    }

    appendMessage('user', content);
    setIsLoading(true);
    try {
      await requestFlow({ input: content });
    } catch (error) {
      console.error('Chat flow error:', error);
      appendMessage('assistant', 'I could not process that step. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickOptionSelect = async (optionId: string) => {
    if (!activeConversationId) return;
    const currentMetadata = getConversationMetadata(activeConversationId);
    const selectedLabel = currentMetadata.quickOptions.find((option) => toOptionId(option) === optionId);
    if (!selectedLabel) return;

    if (currentMetadata.mode === 'passive-roadmap') {
      appendMessage('user', selectedLabel);

      if (selectedLabel.startsWith('Start on ')) {
        const startDate = selectedLabel.replace('Start on ', '').trim();
        const nextContext = currentMetadata.passiveContext || createEmptyContext();
        const roadmap = currentMetadata.pendingRoadmap || buildRoadmapFromContext(nextContext);
        appendMessage(
          'assistant',
          `${roadmapSummaryForChat(nextContext, roadmap, startDate)}\n\nReady when you are. Click add to push this into Schedule tab.`,
        );
        updateConversationMetadata(activeConversationId, {
          selectedStartDate: startDate,
          pendingRoadmap: roadmap,
          quickOptions: ['Add this schedule to planner', 'Pick another start date', 'Regenerate roadmap'],
        });
        return;
      }

      if (selectedLabel === 'Use today') {
        const today = toYmd(new Date());
        const nextContext = currentMetadata.passiveContext || createEmptyContext();
        const roadmap = currentMetadata.pendingRoadmap || buildRoadmapFromContext(nextContext);
        appendMessage(
          'assistant',
          `${roadmapSummaryForChat(nextContext, roadmap, today)}\n\nClick add to push this into Schedule tab for this session.`,
        );
        updateConversationMetadata(activeConversationId, {
          selectedStartDate: today,
          pendingRoadmap: roadmap,
          quickOptions: ['Add this schedule to planner', 'Pick another start date', 'Regenerate roadmap'],
        });
        return;
      }

      if (selectedLabel === 'Pick another start date') {
        appendMessage('assistant', 'Choose a new date below or type date as YYYY-MM-DD.');
        updateConversationMetadata(activeConversationId, {
          quickOptions: [...buildTimelineOptions(), 'Use today'],
        });
        return;
      }

      if (selectedLabel === 'Regenerate roadmap') {
        const nextContext = currentMetadata.passiveContext || createEmptyContext();
        const roadmap = buildRoadmapFromContext(nextContext);
        appendMessage(
          'assistant',
          `${roadmapSummaryForChat(nextContext, roadmap, currentMetadata.selectedStartDate)}\n\nUpdated from your current profile signals.`,
        );
        updateConversationMetadata(activeConversationId, {
          pendingRoadmap: roadmap,
          quickOptions: currentMetadata.selectedStartDate
            ? ['Add this schedule to planner', 'Pick another start date', 'Regenerate roadmap']
            : [...buildTimelineOptions(), 'Use today'],
        });
        return;
      }

      if (selectedLabel === 'Add this schedule to planner') {
        if (!currentMetadata.pendingRoadmap || !currentMetadata.selectedStartDate) {
          appendMessage('assistant', 'Select a start date first so I can place tasks on the timeline.');
          updateConversationMetadata(activeConversationId, {
            quickOptions: [...buildTimelineOptions(), 'Use today'],
          });
          return;
        }

        await onApplyRoadmapSchedule?.(
          currentMetadata.pendingRoadmap,
          currentMetadata.selectedStartDate,
        );

        appendMessage(
          'assistant',
          `Added. Your passive-flow schedule is now in Schedule tab from ${currentMetadata.selectedStartDate}. This remains session-only and will reset on restart.`,
        );

        updateConversationMetadata(activeConversationId, {
          quickOptions: ['Regenerate roadmap', 'Pick another start date'],
        });
        return;
      }
    }

    if (currentMetadata.multiSelect) {
      const hasOption = currentMetadata.selectedOptionIds.includes(optionId);
      const nextSelected = hasOption
        ? currentMetadata.selectedOptionIds.filter((id) => id !== optionId)
        : [...currentMetadata.selectedOptionIds, optionId];

      updateConversationMetadata(activeConversationId, {
        selectedOptionIds: nextSelected,
      });
      return;
    }

    appendMessage('user', selectedLabel);
    setIsLoading(true);
    try {
      await requestFlow({ selectedOptions: [selectedLabel] });

      const latestMetadata = getConversationMetadata(activeConversationId);
      if (
        selectedLabel === 'Start Execution' &&
        latestMetadata.mode === 'standard' &&
        latestMetadata.flowContext &&
        !latestMetadata.standardPlanApplied
      ) {
        const contextForRoadmap = toFlowUserContext(latestMetadata.flowContext);
        const roadmap = buildRoadmapFromContext(contextForRoadmap);
        const startDate = resolveStartDateFromFlow(latestMetadata.flowContext);

        await onApplyRoadmapSchedule?.(roadmap, startDate);

        appendMessage(
          'assistant',
          `Your confirmed plan is now added to Schedule tab${startDate ? ` from ${startDate}` : ''}.`,
        );

        updateConversationMetadata(activeConversationId, {
          standardPlanApplied: true,
        });
      }
    } catch (error) {
      console.error('Quick option flow error:', error);
      appendMessage('assistant', 'I could not process that selection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuickOptions = async () => {
    if (!activeConversationId) return;
    const currentMetadata = getConversationMetadata(activeConversationId);
    if (!currentMetadata.multiSelect || currentMetadata.selectedOptionIds.length === 0) return;

    const selectedLabels = currentMetadata.quickOptions.filter((option) =>
      currentMetadata.selectedOptionIds.includes(toOptionId(option))
    );

    appendMessage('user', selectedLabels.join(', '));
    setIsLoading(true);
    try {
      await requestFlow({ selectedOptions: selectedLabels });
    } catch (error) {
      console.error('Multi-select flow error:', error);
      appendMessage('assistant', 'I could not process those selections. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = (id: string) => {
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    const newMetadata = { ...metadata };
    delete newMetadata[id];
    setMetadata(newMetadata);
    if (activeConversationId === id) {
      setActiveConversationId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const currentMetadata = activeConversationId
    ? getConversationMetadata(activeConversationId)
    : DEFAULT_METADATA;

  const quickOptions = currentMetadata.quickOptions.map((label) => ({
    id: toOptionId(label),
    label,
  }));

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar - hidden on mobile, visible on tablet and desktop */}
      <div className="hidden md:block">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onDeleteConversation={handleDeleteConversation}
          onNewChat={createNewChat}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          hasStarted ? (
            <ChatInterface
              messages={activeConversation.messages}
              onSendMessage={handleSendMessage}
              quickOptions={quickOptions}
              onSelectQuickOption={handleQuickOptionSelect}
              quickOptionsMultiSelect={currentMetadata.multiSelect}
              selectedQuickOptionIds={currentMetadata.selectedOptionIds}
              onSubmitQuickOptions={handleSubmitQuickOptions}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <GoalSelection onSelectGoal={handleGoalSelect} isLoading={isLoading} />
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to Mr. Chad</h2>
              <div className="h-12 mb-6 flex items-center justify-center">
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    quotePhase === 'exit'
                      ? 'opacity-0 -translate-y-3'
                      : quotePhase === 'enter'
                      ? 'opacity-0 translate-y-3'
                      : 'opacity-100 translate-y-0'
                  }`}
                >
                  <p className="text-lg font-semibold text-primary whitespace-nowrap">
                    {CATCHPHRASES[currentCatchphraseIndex]}
                  </p>
                </div>
              </div>
              <button
                onClick={createNewChat}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
