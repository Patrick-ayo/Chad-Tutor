import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TaskContextBar } from "./TaskContextBar";
import { ContentViewer } from "./ContentViewer";
import { PracticeSection } from "./PracticeSection";
import { AIHelpDrawer } from "./AIHelpDrawer";
import { SessionFooter } from "./SessionFooter";
import { EndSessionDialog } from "./EndSessionDialog";
import {
  mockSessionTasks,
  mockTaskContent,
  mockQuestions,
  getAIResponse,
} from "@/data/mockSession";
import type {
  SessionTask,
  TaskContent,
  Question,
  SessionState,
  AnswerSubmission,
  AIHelpRequest,
  SessionEvent,
  EndSessionData,
} from "@/types/session";

export function LearningSessionPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  // Task data
  const [task, setTask] = useState<SessionTask | null>(null);
  const [content, setContent] = useState<TaskContent[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

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
  const [viewedContentIds, setViewedContentIds] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<AnswerSubmission[]>([]);
  const [aiHelpRequests, setAIHelpRequests] = useState<AIHelpRequest[]>([]);
  const [events, setEvents] = useState<SessionEvent[]>([]);

  // UI state
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [aiHelpContext, setAIHelpContext] = useState("");
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
    setContent(mockTaskContent[taskId] || []);
    setQuestions(mockQuestions[taskId] || []);

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

  // Content viewed handler
  const handleContentViewed = useCallback(
    (contentId: string) => {
      setViewedContentIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(contentId);

        // Update content progress
        const progress = (newSet.size / content.length) * 100;
        setSessionState((state) => ({
          ...state,
          contentProgress: progress,
        }));

        return newSet;
      });
      logEvent("content_viewed", { contentId });
    },
    [content.length, logEvent]
  );

  // Answer submission handler
  const handleAnswerSubmit = useCallback(
    (
      questionId: string,
      answer: string | number,
      isCorrect: boolean,
      timeSpent: number,
      attempts: number
    ) => {
      const submission: AnswerSubmission = {
        questionId,
        answer,
        isCorrect,
        timeSpentSeconds: timeSpent,
        attempts,
        submittedAt: new Date().toISOString(),
      };

      setAnswers((prev) => {
        // Remove previous answer for this question if exists
        const filtered = prev.filter((a) => a.questionId !== questionId);
        return [...filtered, submission];
      });

      // Update session state
      setSessionState((state) => {
        const allAnswers = [...answers.filter((a) => a.questionId !== questionId), submission];
        return {
          ...state,
          questionsAnswered: allAnswers.length,
          correctAnswers: allAnswers.filter((a) => a.isCorrect).length,
        };
      });

      logEvent("answer_submitted", { questionId, isCorrect, attempts });
    },
    [answers, logEvent]
  );

  // AI Help handlers
  const handleRequestHelp = useCallback(
    (_questionId: string, questionText: string) => {
      setAIHelpContext(questionText);
      setIsAIDrawerOpen(true);
    },
    []
  );

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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Task Context Bar - Always visible at top */}
      <TaskContextBar task={task} sessionState={sessionState} />

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Content Viewer */}
          <div className="min-h-[500px]">
            <ContentViewer
              content={content}
              onContentViewed={handleContentViewed}
              viewedContentIds={viewedContentIds}
            />
          </div>

          {/* Right: Practice Section */}
          <div className="min-h-[500px]">
            <PracticeSection
              questions={questions}
              answers={answers}
              onAnswerSubmit={handleAnswerSubmit}
              onRequestHelp={handleRequestHelp}
            />
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
