import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TaskContextBar } from "./TaskContextBar";
import { SessionSidebar } from "./SessionSidebar";
import { AIHelpDrawer } from "./AIHelpDrawer";
import { SessionFooter } from "./SessionFooter";
import { EndSessionDialog } from "./EndSessionDialog";
import { 
  VideoMode, 
  NotesMode, 
  AISummaryMode, 
  ExamplesMode, 
  PracticeMode, 
  MiniTestMode, 
  MyNotesMode 
} from "./modes";
import {
  mockSessionTasks,
  getAIResponse,
} from "@/data/mockSession";
import {
  mockVideoData,
  mockConceptTags,
  mockNotesContent,
  mockExampleProblems,
  mockPracticeQuestions,
  mockTestQuestions,
  mockAISummary,
  mockUserNotes
} from "@/data/mockSessionData";
import type {
  SessionTask,
  SessionState,
  AnswerSubmission,
  AIHelpRequest,
  SessionEvent,
  EndSessionData,
  SessionMode
} from "@/types/session";

export function LearningSessionPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  // Task data
  const [task, setTask] = useState<SessionTask | null>(null);

  // Session state
  const [sessionState, setSessionState] = useState<SessionState>({
    taskId: taskId || "",
    status: "active",
    startTime: new Date().toISOString(),
    totalPausedSeconds: 0,
    activeSeconds: 0,
    contentProgress: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    aiHelpCount: 0,
  });

  // Progress tracking
  const [answers] = useState<AnswerSubmission[]>([]);
  const [aiHelpRequests, setAIHelpRequests] = useState<AIHelpRequest[]>([]);
  const [events, setEvents] = useState<SessionEvent[]>([]);

  // UI state
  const [activeMode, setActiveMode] = useState<SessionMode>('video');
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [aiHelpContext] = useState("");
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Load task data
  useEffect(() => {
    if (!taskId) {
      navigate("/");
      return;
    }

    const taskData = mockSessionTasks[taskId];
    if (!taskData) {
      // Task not found - redirect to dashboard
      navigate("/");
      return;
    }

    setTask(taskData);

    // Log session start
    logEvent("session_start", { taskId });
  }, [taskId, navigate]);

  // Timer effect
  useEffect(() => {
    if (sessionState.status !== "active") return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState.status]);

  // Event logging
  const logEvent = useCallback(
    (type: SessionEvent["type"], data?: Record<string, unknown>) => {
      const event: SessionEvent = {
        id: `event-${Date.now()}`,
        type,
        timestamp: new Date().toISOString(),
        data,
      };
      setEvents((prev) => [...prev, event]);
    },
    []
  );

  // AI Help handlers
  const handleAIHelpRequest = useCallback(
    async (type: AIHelpRequest["type"], context: string) => {
      const response = await getAIResponse(type, context);

      const request: AIHelpRequest = {
        type,
        context,
        response,
        requestedAt: new Date().toISOString(),
      };

      setAIHelpRequests((prev) => [...prev, request]);
      setSessionState((state) => ({
        ...state,
        aiHelpCount: state.aiHelpCount + 1,
      }));

      logEvent("ai_help_requested", { type });
    },
    [logEvent]
  );

  // Pause/Resume handlers
  const handlePause = useCallback(() => {
    setSessionState((state) => ({
      ...state,
      status: "paused",
      pausedTime: new Date().toISOString(),
    }));
    setPauseStartTime(Date.now());
    setPauseCount((prev) => prev + 1);
    logEvent("session_pause");
  }, [logEvent]);

  const handleResume = useCallback(() => {
    if (pauseStartTime) {
      const pausedDuration = Math.floor((Date.now() - pauseStartTime) / 1000);
      setSessionState((state) => ({
        ...state,
        status: "active",
        pausedTime: undefined,
        totalPausedSeconds: state.totalPausedSeconds + pausedDuration,
      }));
    } else {
      setSessionState((state) => ({
        ...state,
        status: "active",
        pausedTime: undefined,
      }));
    }
    setPauseStartTime(null);
    logEvent("session_resume");
  }, [pauseStartTime, logEvent]);

  // End session handler
  const handleEndSession = useCallback(() => {
    setShowEndDialog(true);
  }, []);

  const handleConfirmEnd = useCallback(
    (data: EndSessionData) => {
      setSessionState((state) => ({
        ...state,
        status: "ended",
      }));

      logEvent("session_end", {
        completionStatus: data.completionStatus,
        confidenceRating: data.confidenceRating,
        totalSeconds: elapsedSeconds,
        accuracy:
          answers.length > 0
            ? Math.round(
                (answers.filter((a) => a.isCorrect).length / answers.length) * 100
              )
            : 0,
      });

      // In real app, save session data to backend
      console.log("Session completed:", {
        task,
        answers,
        aiHelpRequests,
        events,
        endData: data,
        metrics: {
          totalSeconds: elapsedSeconds,
          pauseCount,
          aiHelpCount: sessionState.aiHelpCount,
          accuracy:
            answers.length > 0
              ? Math.round(
                  (answers.filter((a) => a.isCorrect).length / answers.length) * 100
                )
              : 0,
        },
      });

      // Navigate back to dashboard
      navigate("/");
    },
    [
      task,
      answers,
      aiHelpRequests,
      events,
      elapsedSeconds,
      pauseCount,
      sessionState.aiHelpCount,
      logEvent,
      navigate,
    ]
  );

  // Loading/Error state
  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Task Not Found</AlertTitle>
          <AlertDescription>
            The learning task you're looking for doesn't exist or has been completed.
          </AlertDescription>
          <Button className="mt-4" onClick={() => navigate("/")}>
            Return to Dashboard
          </Button>
        </Alert>
      </div>
    );
  }

  // Render main content based on active mode
  const renderMainContent = () => {
    switch (activeMode) {
      case 'video':
        return <VideoMode videoData={mockVideoData} />;
      case 'notes':
        return <NotesMode conceptTags={mockConceptTags} structuredNotes={mockNotesContent} />;
      case 'ai-summary':
        return (
          <AISummaryMode
            topic={mockAISummary.topic}
            summary={mockAISummary.summary}
            keyInsights={mockAISummary.keyInsights}
            analogies={mockAISummary.analogies}
            onSummaryRead={() => setActiveMode('examples')}
          />
        );
      case 'examples':
        return <ExamplesMode examples={mockExampleProblems} />;
      case 'practice':
        return (
          <PracticeMode 
            topic={mockConceptTags.topic}
            questions={mockPracticeQuestions}
            onComplete={(score: number) => {
              console.log(`Practice completed: ${score}%`);
              setActiveMode('mini-test');
            }}
          />
        );
      case 'mini-test':
        return (
          <MiniTestMode
            topic={mockConceptTags.topic}
            questions={mockTestQuestions}
            timeLimit={900}
            passingScore={70}
            onComplete={(score: number, passed: boolean) => {
              console.log(`Test ${passed ? 'passed' : 'failed'}: ${score}%`);
            }}
          />
        );
      case 'my-notes':
        return <MyNotesMode notes={mockUserNotes} />;
      default:
        return <VideoMode videoData={mockVideoData} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Task Context Bar - Compact top bar */}
      <TaskContextBar task={task} sessionState={sessionState} />

      {/* Two-Panel Layout */}
      <div className="flex h-[calc(100vh-90px)]">
        {/* Left Sidebar Navigation */}
        <SessionSidebar 
          activeMode={activeMode}
          onModeChange={setActiveMode}
          completedModes={new Set<SessionMode>()}
          noteCount={mockUserNotes.length}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-card">
          <div className="p-6 max-w-4xl mx-auto">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* AI Help Drawer */}
      <AIHelpDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        context={aiHelpContext}
        aiHelpRequests={aiHelpRequests}
        onRequestHelp={handleAIHelpRequest}
        maxHelpCount={5}
      />

      {/* Session Footer - Always visible at bottom */}
      <SessionFooter
        isRunning={sessionState.status === "active"}
        elapsedSeconds={elapsedSeconds}
        pauseCount={pauseCount}
        aiHelpCount={sessionState.aiHelpCount}
        onPause={handlePause}
        onResume={handleResume}
        onEndSession={handleEndSession}
        onOpenAIHelp={() => setIsAIDrawerOpen(true)}
      />

      {/* End Session Dialog */}
      <EndSessionDialog
        isOpen={showEndDialog}
        onClose={() => setShowEndDialog(false)}
        onConfirm={handleConfirmEnd}
        taskName={task.name}
        questionsCorrect={answers.filter((a) => a.isCorrect).length}
        questionsTotal={answers.length}
        timeSpentMinutes={Math.round(elapsedSeconds / 60)}
      />
    </div>
  );
}
