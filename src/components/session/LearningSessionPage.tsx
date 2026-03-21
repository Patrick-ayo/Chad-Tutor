import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TaskContextBar } from "./TaskContextBar";
import { SessionSidebar } from "./SessionSidebar";
import { SessionMobileNav } from "./SessionMobileNav";
import { AIHelpDrawer } from "./AIHelpDrawer";
import { SessionFooter } from "./SessionFooter";
import { EndSessionDialog } from "./EndSessionDialog";
import { ChadMeUpDialog } from "./ChadMeUpDialog";
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
  mockUserNotes,
  mockSuggestedVideos
} from "@/data/mockSessionData";
import type {
  SessionTask,
  SessionState,
  AnswerSubmission,
  AIHelpRequest,
  SessionEvent,
  EndSessionData,
  SessionMode,
  VideoMetadata,
  SuggestedVideo
} from "@/types/session";
import { completeTask } from "@/lib/plannerApi";

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
  const [showChadMeUpDialog, setShowChadMeUpDialog] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Video management
  const [currentVideoData, setCurrentVideoData] = useState<VideoMetadata>(mockVideoData);

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

    // Load saved primary video from localStorage if available
    const savedSessionData = localStorage.getItem(`session_${taskId}`);
    if (savedSessionData) {
      try {
        const sessionData = JSON.parse(savedSessionData);
        if (sessionData.primaryVideo) {
          setCurrentVideoData(sessionData.primaryVideo);
        }
      } catch (error) {
        console.error("Failed to load saved video data:", error);
      }
    }
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

  // Chad Me Up handler
  const handleChadMeUp = useCallback(() => {
    logEvent("chad_me_up_clicked", {
      activeMode,
      timestamp: new Date().toISOString(),
    });
    setShowChadMeUpDialog(true);
  }, [activeMode, logEvent]);

  // Handle playlist rescheduling from Chad Me Up
  const handleReschedulePlaylist = useCallback((videoIds: string[]) => {
    logEvent("playlist_rescheduled", {
      videoIds,
      subject: task?.topicName,
      timestamp: new Date().toISOString(),
    });
    
    // Update session state to reflect rescheduling action
    setSessionState((state) => ({
      ...state,
      contentProgress: state.contentProgress + 10, // Add some progress for taking action
    }));
    
    // Here you would typically send this to the backend to reschedule tasks
    console.log("Playlist rescheduled with videos:", videoIds);
    console.log("Subject:", task?.topicName);
  }, [task, logEvent]);

  // Handle setting a suggested video as primary
  const handleSetPrimaryVideo = useCallback((suggestedVideo: SuggestedVideo) => {
    // Create VideoMetadata from SuggestedVideo
    const newVideoData: VideoMetadata = {
      videoId: suggestedVideo.videoId,
      title: suggestedVideo.title,
      duration: suggestedVideo.duration,
      keyTakeaways: suggestedVideo.relatedTopics || [],
      transcript: suggestedVideo.description,
    };

    // Update state
    setCurrentVideoData(newVideoData);
    setElapsedSeconds(0); // Reset playback

    // Save to localStorage for persistence
    const savedSessionData = localStorage.getItem(`session_${taskId}`);
    const sessionData = savedSessionData ? JSON.parse(savedSessionData) : {};
    sessionData.primaryVideo = newVideoData;
    localStorage.setItem(`session_${taskId}`, JSON.stringify(sessionData));

    // Log event
    logEvent("primary_video_updated", {
      videoId: suggestedVideo.videoId,
      videoTitle: suggestedVideo.title,
      timestamp: new Date().toISOString(),
    });

    console.log("Primary video updated to:", suggestedVideo.title);
  }, [taskId, logEvent]);

  const handleConfirmEnd = useCallback(
    async (data: EndSessionData) => {
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

      if (taskId) {
        try {
          const quizPayload = answers.length
            ? {
                questionsCount: answers.length,
                correctCount: answers.filter((answer) => answer.isCorrect).length,
                metadata: {
                  confidenceRating: data.confidenceRating,
                  completionStatus: data.completionStatus,
                },
              }
            : undefined;

          await completeTask(taskId, {
            completedDurationMinutes: Math.round(elapsedSeconds / 60),
            quiz: quizPayload,
          });
        } catch (error) {
          console.error("Failed to sync session completion with planner backend:", error);
        }
      }

      // Navigate back to dashboard
      navigate("/");
    },
    [
      task,
      taskId,
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
        return <VideoMode key={currentVideoData.videoId} videoData={currentVideoData} />;
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
        return <VideoMode videoData={currentVideoData} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Task Context Bar - Compact top bar */}
      <TaskContextBar task={task} sessionState={sessionState} />

      {/* Two-Panel Layout */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-90px)]">
        {/* Left Sidebar Navigation - Hidden on mobile */}
        <div className="hidden md:block">
          <SessionSidebar 
            activeMode={activeMode}
            onModeChange={setActiveMode}
            completedModes={new Set<SessionMode>()}
            noteCount={mockUserNotes.length}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-card pb-32 md:pb-0">
          <div className="p-4 md:p-6 max-w-4xl mx-auto">
            {renderMainContent()}
          </div>
        </div>

        {/* Mobile Mode Selector - Visible only on mobile, positioned above footer */}
        <div className="md:hidden fixed bottom-12 left-0 right-0 bg-background border-t z-40">
          <SessionMobileNav
            activeMode={activeMode}
            onModeChange={setActiveMode}
            noteCount={mockUserNotes.length}
          />
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
        onChadMeUp={handleChadMeUp}
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

      {/* Chad Me Up Dialog */}
      {task && (
        <ChadMeUpDialog
          isOpen={showChadMeUpDialog}
          onClose={() => setShowChadMeUpDialog(false)}
          currentTopic={task.topicName}
          currentSubject={task.topicName}
          suggestedVideos={mockSuggestedVideos}
          onReschedulePlaylist={handleReschedulePlaylist}
          onSetPrimaryVideo={handleSetPrimaryVideo}
          onPause={handlePause}
          onResume={handleResume}
        />
      )}
    </div>
  );
}
