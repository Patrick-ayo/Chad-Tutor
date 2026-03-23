import { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { ChatSidebar } from './ChatSidebar';
import { GoalSelection, type GoalOption } from './GoalSelection';
import type { ChatMessage, ChatConversation } from '@/types/chat';

const GOAL_MESSAGES: Record<string, string> = {
  explore: "Great! Let's explore your learning preferences and strengths. Tell me about your current knowledge and what subjects interest you the most.",
  skills: "Perfect! I'll help you plan and sharpen your skills. Tell me which specific skill or subject you'd like to focus on, and I'll create a personalized learning plan with tests.",
  roadmap: "Excellent! I'll help you create a goal-based roadmap. What career goal or field are you aiming for?",
};

const CATCHPHRASES = [
  'Learn smarter, not harder with AI guidance',
  'Turn videos into structured, interactive learning',
  'From watching to mastering, step by step',
];

type ChatFlowState = 'context_collection' | 'confirmation' | 'execution_choice' | 'active_plan';

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
}

const DEFAULT_METADATA: ConversationMetadata = {
  flowState: 'context_collection',
  flowContext: null,
  quickOptions: [],
  multiSelect: false,
  selectedOptionIds: [],
};

export function MrChadPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCatchphraseIndex, setCurrentCatchphraseIndex] = useState(0);
  const [quotePhase, setQuotePhase] = useState<'visible' | 'exit' | 'enter'>('visible');
  
  // Metadata for managing conversation state per conversation
  const [metadata, setMetadata] = useState<Record<string, ConversationMetadata>>({});

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mr-chad-conversations');
    const savedMetadata = localStorage.getItem('mr-chad-metadata');
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
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mr-chad-conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Save metadata to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mr-chad-metadata', JSON.stringify(metadata));
  }, [metadata]);

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
          return {
            ...c,
            messages: [
              assistantMessage,
              {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Share your current context: what you know, your target role, and what outcome you want.',
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
      updateConversationMetadata(activeConversationId, {
        flowState: 'context_collection',
        flowContext: null,
        quickOptions: [],
        multiSelect: false,
        selectedOptionIds: [],
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
