import { useState, useEffect, useCallback, useMemo } from "react";
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
  SuggestedVideo,
  ConceptTags,
} from "@/types/session";
import { completeTask, fetchPlannerSnapshot, generateSessionQuiz, type SessionQuizQuestion } from "@/lib/plannerApi";
import type { PlannerData, ScheduledTask } from "@/types/planner";

const STRICT_SCHEDULED_VIDEO_MODE = true;

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

function mapScheduledTaskToSessionTask(scheduledTask: ScheduledTask): SessionTask {
  return {
    id: scheduledTask.id,
    name: scheduledTask.title,
    goalName: scheduledTask.goalId,
    topicName: scheduledTask.title,
    estimatedMinutes: scheduledTask.estimatedMinutes,
    difficulty:
      scheduledTask.priority === "high"
        ? "hard"
        : scheduledTask.priority === "medium"
          ? "medium"
          : "easy",
    scheduleReason: "Designated by planner schedule",
  };
}

function toVideoMetadata(video: SuggestedVideo): VideoMetadata {
  return {
    videoId: video.videoId,
    title: video.title,
    duration: video.duration,
    keyTakeaways: video.relatedTopics || [],
    transcript: video.description,
  };
}

function buildUnavailableVideoMetadata(task: SessionTask | null): VideoMetadata {
  return {
    videoId: "",
    title: task?.name || "No designated video available",
    duration: 0,
    keyTakeaways: ["This task has no designated video in the schedule."],
    transcript: "Assign a video to this scheduled task and re-open the session.",
  };
}

function extractYouTubeVideoIdFromUrl(url?: string): string | null {
  if (!url) return null;

  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watchMatch?.[1]) return watchMatch[1];

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch?.[1]) return shortMatch[1];

  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embedMatch?.[1]) return embedMatch[1];

  return null;
}

function suggestedVideoFromScheduledTask(task: ScheduledTask): SuggestedVideo | null {
  const videoId = task.videoId || extractYouTubeVideoIdFromUrl(task.videoUrl);
  if (!videoId) return null;

  return {
    videoId,
    title: task.title,
    description:
      task.learningOutcomes?.[0] ||
      task.keyPoints?.[0] ||
      "Scheduled from planner for this session.",
    duration: task.estimatedMinutes * 60,
    subject: task.goalId || "Scheduled",
    topic: task.title,
    relatedTopics: task.keyPoints || task.learningOutcomes || [],
  };
}

function findDesignatedVideoForTask(task: SessionTask): SuggestedVideo {
  const topic = normalizeText(task.topicName || task.name);
  const name = normalizeText(task.name);

  const matchedByTopic = mockSuggestedVideos.find((video) => {
    const vTopic = normalizeText(video.topic);
    const vSubject = normalizeText(video.subject);
    return topic.includes(vTopic) || topic.includes(vSubject) || name.includes(vTopic);
  });

  return matchedByTopic || mockSuggestedVideos[0];
}

function findPlannerTaskByVideoId(
  tasks: ScheduledTask[],
  videoId: string,
): ScheduledTask | undefined {
  return tasks.find((task) => {
    const scheduledVideoId = task.videoId || extractYouTubeVideoIdFromUrl(task.videoUrl);
    return scheduledVideoId === videoId;
  });
}

function findBestScheduledTask(
  tasks: ScheduledTask[],
  taskId: string,
  taskData?: SessionTask,
): ScheduledTask | undefined {
  const byId = tasks.find((scheduled) => scheduled.id === taskId);
  if (byId) {
    return byId;
  }

  if (!taskData) {
    return undefined;
  }

  const targetTopic = normalizeText(taskData.topicName || taskData.name);
  const targetGoal = normalizeText(taskData.goalName || "");

  return tasks.find((scheduled) => {
    const scheduledTitle = normalizeText(scheduled.title);
    const scheduledGoal = normalizeText(scheduled.goalId || "");
    const topicMatch =
      scheduledTitle.includes(targetTopic) ||
      targetTopic.includes(scheduledTitle);
    const goalMatch = !targetGoal || scheduledGoal.includes(targetGoal);
    return topicMatch && goalMatch;
  });
}

type PracticeQuestionData = (typeof mockPracticeQuestions)[number];
type TestQuestionData = (typeof mockTestQuestions)[number];
type UserNoteData = (typeof mockUserNotes)[number];

function mapSessionQuizToPracticeQuestion(question: SessionQuizQuestion, index: number): PracticeQuestionData {
  return {
    id: question.id || `practice-ai-${index + 1}`,
    question: question.question,
    options: question.options.slice(0, 4),
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    hint: `Focus on the session context and key concept behind this question (${question.difficulty || 'beginner'}).`,
  };
}

function mapSessionQuizToMiniTestQuestion(question: SessionQuizQuestion, index: number): TestQuestionData {
  return {
    id: question.id || `mini-ai-${index + 1}`,
    question: question.question,
    options: question.options.slice(0, 4),
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();

  return values
    .map((item) => item.trim())
    .filter((item) => {
      if (!item) return false;
      const key = normalizeText(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function buildTaskLearningPoints(
  task: SessionTask | null,
  scheduledTask: ScheduledTask | null,
): string[] {
  const raw = [
    ...(scheduledTask?.keyPoints ?? []),
    ...(scheduledTask?.learningOutcomes ?? []),
    task?.topicName ?? "",
    task?.name ?? "",
  ];

  const points = uniqueNonEmpty(raw);
  if (points.length > 0) {
    return points;
  }

  return ["Understand the session topic", "Apply concepts through guided practice"];
}

function buildTaskConceptTags(
  task: SessionTask | null,
  scheduledTask: ScheduledTask | null,
  points: string[],
): ConceptTags {
  const complexityMap: Record<ScheduledTask["priority"], ConceptTags["complexity"]> = {
    high: "O(n log n)",
    medium: "O(n)",
    low: "O(log n)",
  };

  return {
    topic: task?.topicName || task?.name || scheduledTask?.title || mockConceptTags.topic,
    category:
      scheduledTask?.type === "practice"
        ? "Practice Session"
        : scheduledTask?.type === "revision"
          ? "Revision Session"
          : "Learning Session",
    concepts: points.slice(0, 6),
    complexity: scheduledTask ? complexityMap[scheduledTask.priority] : mockConceptTags.complexity,
    prerequisites:
      scheduledTask?.dependencies.length
        ? scheduledTask.dependencies.map((dependencyId) => `Complete dependent task ${dependencyId}`)
        : mockConceptTags.prerequisites,
  };
}

function buildStructuredNotesHtml(
  task: SessionTask | null,
  scheduledTask: ScheduledTask | null,
  points: string[],
): string {
  if (!scheduledTask && !task) {
    return mockNotesContent;
  }

  const title = escapeHtml(task?.topicName || task?.name || scheduledTask?.title || "Scheduled session");
  const goals = uniqueNonEmpty(scheduledTask?.learningOutcomes ?? []).slice(0, 6);
  const notePoints = points.slice(0, 8);
  const estimated = scheduledTask?.estimatedMinutes ?? task?.estimatedMinutes ?? 30;

  const outcomesMarkup =
    goals.length > 0
      ? goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join("")
      : `<li>Complete the planned learning objective for ${title}.</li>`;

  const keyPointsMarkup = notePoints
    .map((point) => `<li>${escapeHtml(point)}</li>`)
    .join("");

  return `
<div class="concept-notes">
  <h2>${title}</h2>
  <h3>Session Objectives</h3>
  <ul>${outcomesMarkup}</ul>

  <h3>Key Focus Points</h3>
  <ul>${keyPointsMarkup}</ul>

  <h3>Execution Plan</h3>
  <ol>
    <li>Watch the designated video and capture 3 actionable insights.</li>
    <li>Read these notes and connect each point to the session objective.</li>
    <li>Finish practice and mini-test to validate retention.</li>
  </ol>

  <div class="important-note">
    <h4>Time Budget</h4>
    <p>This task is scheduled for approximately ${estimated} minutes. Keep pace and avoid context switching.</p>
  </div>
</div>
`;
}

function buildPracticeQuestions(
  topic: string,
  points: string[],
): PracticeQuestionData[] {
  const questionSeeds = points.length > 0 ? points : [topic];

  return questionSeeds.slice(0, 3).map((seed, index) => ({
    id: `practice-${index + 1}`,
    question: `For this scheduled task on ${topic}, what is the best learning focus?`,
    options: [
      seed,
      `Skip ${topic} fundamentals and jump to random examples`,
      `Only memorize definitions without applying them`,
      `Ignore key outcomes and study an unrelated topic`,
    ],
    correctAnswer: 0,
    explanation: `${seed} is directly aligned with the task outcomes and should be prioritized in this session.`,
    hint: "Choose the option that matches the scheduled focus of this task.",
  }));
}

function buildMiniTestQuestions(
  topic: string,
  points: string[],
): TestQuestionData[] {
  const questionSeeds = points.length > 0 ? points : [topic];

  return Array.from({ length: Math.min(5, Math.max(questionSeeds.length, 3)) }).map((_, index) => {
    const seed = questionSeeds[index % questionSeeds.length];
    const correctAnswer = (index + 1) % 4;
    const options = [
      `Avoid ${seed} until the next session`,
      `Apply ${seed} while completing this scheduled task`,
      `Replace ${seed} with unrelated revision work`,
      `Delay ${seed} and mark the task as done`,
    ];

    const correctOption = options[1];
    const reordered = options.filter((_, optionIndex) => optionIndex !== 1);
    reordered.splice(correctAnswer, 0, correctOption);

    return {
      id: `mini-test-${index + 1}`,
      question: `During this ${topic} session, what demonstrates correct execution of the plan?`,
      options: reordered,
      correctAnswer,
      explanation: `The expected behavior is to actively apply ${seed} as part of the scheduled learning objective.`,
    };
  });
}

function buildTaskAISummary(
  topic: string,
  points: string[],
): typeof mockAISummary {
  const insights = points.slice(0, 4);

  return {
    topic,
    summary:
      `This session is focused on ${topic}. Move from passive watching to active recall by mapping each key point to the task objective, then validate understanding through practice and test sections.`,
    keyInsights:
      insights.length > 0
        ? insights.map((insight) => `Master this in session: ${insight}.`) 
        : mockAISummary.keyInsights,
    analogies: [
      `Treat ${topic} like a gym routine: planned reps (video), form checks (notes), and a final set (test).`,
      `This scheduled task is a mission checklist: each completed point reduces uncertainty before the mini-test.`,
      `Think of this as building a feature: watch the walkthrough, read the specs, then prove it with test cases.`,
    ],
  };
}

function buildTaskExamples(
  topic: string,
  points: string[],
  task: SessionTask | null,
): typeof mockExampleProblems {
  const seeds = points.length > 0 ? points.slice(0, 3) : [topic, `${topic} practice`, `${topic} review`];
  const baseName = task?.name || topic;

  return seeds.map((seed, index) => {
    const difficulty = index === 0 ? "easy" : index === 1 ? "medium" : "hard";
    const safeTopic = topic.replace(/'/g, "");
    const safeSeed = seed.replace(/'/g, "");

    return {
      id: `example-${index + 1}`,
      title: `${baseName}: ${safeSeed}`,
      difficulty,
      description: `Solve this ${difficulty} scenario focused on ${safeTopic}. Use ${safeSeed} as the main decision point.`,
      codeTemplate: `function solve${safeTopic.replace(/[^a-zA-Z0-9]/g, "") || "Session"}(input) {\n  // TODO: apply ${safeSeed}\n  return input;\n}`,
      stepByStepSolution: [
        {
          step: 1,
          title: "Identify the session pattern",
          explanation: `Map the question to the scheduled theme: ${safeTopic}.`,
          code: `// Theme detection\nconst theme = "${safeTopic}";`,
        },
        {
          step: 2,
          title: "Apply the key focus",
          explanation: `Use ${safeSeed} to guide your implementation strategy.`,
          code: `// Focus-driven logic\nif (!input) return null;`,
        },
        {
          step: 3,
          title: "Validate with an example",
          explanation: "Run one positive and one edge case before finalizing.",
          code: `// Quick validation\nreturn input;`,
        },
      ],
      fullSolution: `function solve${safeTopic.replace(/[^a-zA-Z0-9]/g, "") || "Session"}(input) {\n  if (!input) return null;\n  return input;\n}`,
      timeComplexity: index === 0 ? "O(n)" : index === 1 ? "O(n log n)" : "O(n^2)",
      spaceComplexity: "O(1)",
      isBookmarked: false,
      hasNarration: true,
    };
  });
}

function buildTaskUserNotes(
  task: SessionTask | null,
  points: string[],
): UserNoteData[] {
  if (!task) {
    return mockUserNotes;
  }

  const topPoints = points.slice(0, 3).map((point, index) => `${index + 1}. ${point}`).join("\n");
  const now = new Date().toISOString();

  return [
    {
      id: `session-note-${task.id}`,
      content: `Task: ${task.name}\n\nFocus points:\n${topPoints}\n\nConfidence check: Can I explain these without looking at notes?`,
      createdAt: now,
      lastModified: now,
    },
    ...mockUserNotes,
  ];
}

function hasExamplesForSession(
  task: SessionTask | null,
  scheduledTask: ScheduledTask | null,
): boolean {
  const evidence = [
    ...(scheduledTask?.keyPoints ?? []),
    ...(scheduledTask?.learningOutcomes ?? []),
    task?.name ?? "",
    task?.topicName ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const exampleSignals = [
    "example",
    "problem",
    "practice",
    "case",
    "implement",
    "code",
    "algorithm",
    "query",
    "exercise",
  ];

  if (scheduledTask?.type === "practice") {
    return true;
  }

  return exampleSignals.some((signal) => evidence.includes(signal));
}

function hasPracticeForSession(
  task: SessionTask | null,
  scheduledTask: ScheduledTask | null,
): boolean {
  const evidence = [
    ...(scheduledTask?.keyPoints ?? []),
    ...(scheduledTask?.learningOutcomes ?? []),
    task?.name ?? "",
    task?.topicName ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const practiceSignals = [
    "practice",
    "exercise",
    "problem",
    "hands-on",
    "implement",
    "lab",
    "drill",
    "assignment",
    "code",
    "query",
  ];

  if (scheduledTask?.type === "practice") {
    return true;
  }

  if (scheduledTask?.type === "revision") {
    return false;
  }

  return practiceSignals.some((signal) => evidence.includes(signal));
}

function hasMiniTestForSession(
  task: SessionTask | null,
  scheduledTask: ScheduledTask | null,
): boolean {
  const evidence = [
    ...(scheduledTask?.keyPoints ?? []),
    ...(scheduledTask?.learningOutcomes ?? []),
    task?.name ?? "",
    task?.topicName ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const testSignals = [
    "quiz",
    "test",
    "assessment",
    "evaluate",
    "mcq",
    "questions",
    "exam",
    "checkpoint",
  ];

  if (scheduledTask?.type === "practice") {
    return true;
  }

  if (scheduledTask?.type === "revision") {
    return false;
  }

  return testSignals.some((signal) => evidence.includes(signal));
}

interface LearningSessionPageProps {
  plannerData?: PlannerData;
}

export function LearningSessionPage({ plannerData }: LearningSessionPageProps) {
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
  const [designatedVideoId, setDesignatedVideoId] = useState<string | null>(null);
  const [sessionScheduledTask, setSessionScheduledTask] = useState<ScheduledTask | null>(null);
  const [nextScheduledTaskTitle, setNextScheduledTaskTitle] = useState<string | null>(null);
  const [noSessionsPlanned, setNoSessionsPlanned] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [aiPracticeQuestions, setAiPracticeQuestions] = useState<PracticeQuestionData[] | null>(null);
  const [aiMiniTestQuestions, setAiMiniTestQuestions] = useState<TestQuestionData[] | null>(null);

  // Load task data
  useEffect(() => {
    let isCancelled = false;

    const loadTask = async () => {
      let effectiveTaskId = taskId || "";
      let taskData = effectiveTaskId ? mockSessionTasks[effectiveTaskId] : undefined;
      let plannerTasks: ScheduledTask[] = [];
      let todayTasks: ScheduledTask[] = [];
      let currentScheduledTask: ScheduledTask | undefined;
      let plannerLoaded = false;

      const todayText = new Date().toDateString();
      const routeScheduleDays = plannerData?.scheduleDays ?? [];
      const routePlannerTasks = routeScheduleDays
        .flatMap((day) => day.tasks)
        .sort(
          (a, b) =>
            new Date(a.scheduledDate).getTime() -
            new Date(b.scheduledDate).getTime(),
        );

      if (routeScheduleDays.length > 0) {
        plannerLoaded = true;
        plannerTasks = routePlannerTasks;
        todayTasks = routeScheduleDays
          .filter((day) => new Date(day.date).toDateString() === todayText)
          .flatMap((day) => day.tasks)
          .sort(
            (a, b) =>
              new Date(a.scheduledDate).getTime() -
              new Date(b.scheduledDate).getTime(),
          );
      }

      if (plannerTasks.length === 0) {
        try {
          const planner = await fetchPlannerSnapshot();
          plannerLoaded = true;
          plannerTasks = planner.scheduleDays
            .flatMap((day) => day.tasks)
            .sort(
              (a, b) =>
                new Date(a.scheduledDate).getTime() -
                new Date(b.scheduledDate).getTime(),
            );
          todayTasks = planner.scheduleDays
            .filter((day) => new Date(day.date).toDateString() === todayText)
            .flatMap((day) => day.tasks)
            .sort(
              (a, b) =>
                new Date(a.scheduledDate).getTime() -
                new Date(b.scheduledDate).getTime(),
            );
        } catch (error) {
          console.error("Failed to load planner snapshot for session task:", error);
        }
      }

      if (plannerLoaded && plannerTasks.length === 0) {
        if (isCancelled) {
          return;
        }

        setNoSessionsPlanned(true);
        setTask(null);
        setSessionScheduledTask(null);
        setNextScheduledTaskTitle(null);
        return;
      }

      setNoSessionsPlanned(false);

      if (plannerLoaded && todayTasks.length === 0) {
        if (isCancelled) {
          return;
        }

        setNoSessionsPlanned(true);
        setTask(null);
        setSessionScheduledTask(null);
        setNextScheduledTaskTitle(null);
        return;
      }

      if (!effectiveTaskId && todayTasks.length > 0) {
        const selectedTask = todayTasks[0];

        effectiveTaskId = selectedTask.id;
        currentScheduledTask = selectedTask;
        taskData = mockSessionTasks[effectiveTaskId] ?? mapScheduledTaskToSessionTask(selectedTask);

        if (!isCancelled) {
          navigate(`/session/${selectedTask.id}`, { replace: true });
        }
      }

      currentScheduledTask =
        currentScheduledTask || findBestScheduledTask(todayTasks, effectiveTaskId, taskData);

      if (!currentScheduledTask && todayTasks.length > 0) {
        const fallbackTodayTask = todayTasks[0];
        currentScheduledTask = fallbackTodayTask;
        effectiveTaskId = fallbackTodayTask.id;
        taskData = mapScheduledTaskToSessionTask(fallbackTodayTask);

        if (!isCancelled) {
          navigate(`/session/${fallbackTodayTask.id}`, { replace: true });
        }
      }

      if (!taskData) {
        if (currentScheduledTask) {
          taskData = mapScheduledTaskToSessionTask(currentScheduledTask);
        }
      }

      if (!taskData) {
        navigate("/");
        return;
      }

      if (isCancelled) {
        return;
      }

      setTask(taskData);
      setSessionScheduledTask(currentScheduledTask ?? null);
      setEvents((prev) => [
        ...prev,
        {
          id: `event-${Date.now()}`,
          type: "session_start",
          timestamp: new Date().toISOString(),
          data: { taskId: effectiveTaskId },
        },
      ]);

      const designatedStorageKey = `session_designated_video_${effectiveTaskId}`;
      const savedDesignatedVideoId = localStorage.getItem(designatedStorageKey);

      const scheduledDesignated =
        currentScheduledTask && suggestedVideoFromScheduledTask(currentScheduledTask);

      const sameGoalScheduledVideo =
        currentScheduledTask
          ? todayTasks
              .filter((item) => item.goalId === currentScheduledTask?.goalId)
              .map((item) => suggestedVideoFromScheduledTask(item))
              .find((item): item is SuggestedVideo => Boolean(item))
          : null;

      let designated: SuggestedVideo | null =
        scheduledDesignated || sameGoalScheduledVideo || null;

      if (!plannerLoaded && !designated) {
        designated = findDesignatedVideoForTask(taskData);
      }

      if (savedDesignatedVideoId && !(STRICT_SCHEDULED_VIDEO_MODE && scheduledDesignated)) {
        const scheduledSavedTask = findPlannerTaskByVideoId(
          plannerTasks,
          savedDesignatedVideoId,
        );
        const scheduledSavedMatch = scheduledSavedTask
          ? suggestedVideoFromScheduledTask(scheduledSavedTask)
          : null;
        const mockSavedMatch = mockSuggestedVideos.find(
          (video) => video.videoId === savedDesignatedVideoId,
        );

        if (scheduledSavedMatch) {
          designated = scheduledSavedMatch;
        } else if (mockSavedMatch && !plannerLoaded) {
          designated = mockSavedMatch;
        }
      }

      if (designated) {
        setDesignatedVideoId(designated.videoId);
        setCurrentVideoData(toVideoMetadata(designated));
        localStorage.setItem(designatedStorageKey, designated.videoId);
        setSessionNotice(null);
      } else {
        setDesignatedVideoId(null);
        setCurrentVideoData(buildUnavailableVideoMetadata(taskData));
        localStorage.removeItem(designatedStorageKey);
        setSessionNotice(
          "No designated video is attached to this scheduled task. Add or regenerate course videos in your schedule.",
        );
      }

      let nextTaskTitle: string | null = null;

      const currentIndex = todayTasks.findIndex((t) => t.id === taskData.id);
      if (currentIndex >= 0 && currentIndex < todayTasks.length - 1) {
        const nextTask = todayTasks[currentIndex + 1];
        nextTaskTitle = nextTask.title;
      }

      setNextScheduledTaskTitle(nextTaskTitle);
    };

    void loadTask();

    return () => {
      isCancelled = true;
    };
  }, [taskId, navigate, plannerData]);

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
    if (STRICT_SCHEDULED_VIDEO_MODE) {
      setSessionNotice(
        "Strict schedule mode: playlist reordering is disabled. Follow the designated scheduled video only.",
      );
      logEvent("playlist_rescheduled", {
        blocked: true,
        reason: "strict_schedule_mode",
        attemptedVideoIds: videoIds,
      });
      return;
    }

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
    if (STRICT_SCHEDULED_VIDEO_MODE && designatedVideoId && suggestedVideo.videoId !== designatedVideoId) {
      setSessionNotice(
        "Strict schedule mode: this session allows only the designated scheduled video.",
      );
      logEvent("primary_video_updated", {
        blocked: true,
        reason: "strict_schedule_mode",
        attemptedVideoId: suggestedVideo.videoId,
        designatedVideoId,
      });
      return;
    }

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
  }, [taskId, designatedVideoId, logEvent]);

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

  const sessionLearningPoints = useMemo(
    () => buildTaskLearningPoints(task, sessionScheduledTask),
    [task, sessionScheduledTask],
  );

  const sessionConceptTags = useMemo(
    () => buildTaskConceptTags(task, sessionScheduledTask, sessionLearningPoints),
    [task, sessionScheduledTask, sessionLearningPoints],
  );

  const sessionNotesContent = useMemo(
    () => buildStructuredNotesHtml(task, sessionScheduledTask, sessionLearningPoints),
    [task, sessionScheduledTask, sessionLearningPoints],
  );

  const sessionAISummary = useMemo(
    () => buildTaskAISummary(sessionConceptTags.topic, sessionLearningPoints),
    [sessionConceptTags.topic, sessionLearningPoints],
  );

  const hasSessionExamples = useMemo(
    () => hasExamplesForSession(task, sessionScheduledTask),
    [task, sessionScheduledTask],
  );

  const hasSessionPractice = useMemo(
    () => hasPracticeForSession(task, sessionScheduledTask),
    [task, sessionScheduledTask],
  );

  const hasSessionMiniTest = useMemo(
    () => hasMiniTestForSession(task, sessionScheduledTask),
    [task, sessionScheduledTask],
  );

  const sessionExamples = useMemo(
    () =>
      hasSessionExamples
        ? buildTaskExamples(sessionConceptTags.topic, sessionLearningPoints, task)
        : [],
    [sessionConceptTags.topic, sessionLearningPoints, task, hasSessionExamples],
  );

  const sessionPracticeQuestions = useMemo(
    () =>
      hasSessionPractice
        ? (aiPracticeQuestions && aiPracticeQuestions.length > 0
            ? aiPracticeQuestions.slice(0, 10)
            : buildPracticeQuestions(sessionConceptTags.topic, sessionLearningPoints).slice(0, 10))
        : [],
    [sessionConceptTags.topic, sessionLearningPoints, hasSessionPractice, aiPracticeQuestions],
  );

  const sessionTestQuestions = useMemo(
    () =>
      hasSessionMiniTest
        ? (aiMiniTestQuestions && aiMiniTestQuestions.length > 0
            ? aiMiniTestQuestions.slice(0, 10)
            : buildMiniTestQuestions(sessionConceptTags.topic, sessionLearningPoints).slice(0, 10))
        : [],
    [sessionConceptTags.topic, sessionLearningPoints, hasSessionMiniTest, aiMiniTestQuestions],
  );

  const sessionUserNotes = useMemo(
    () => buildTaskUserNotes(task, sessionLearningPoints),
    [task, sessionLearningPoints],
  );

  const sessionSuggestedVideos = useMemo(() => {
    const scheduledVideo = sessionScheduledTask
      ? suggestedVideoFromScheduledTask(sessionScheduledTask)
      : null;

    if (!scheduledVideo) {
      return mockSuggestedVideos;
    }

    if (mockSuggestedVideos.some((video) => video.videoId === scheduledVideo.videoId)) {
      return mockSuggestedVideos;
    }

    return [scheduledVideo, ...mockSuggestedVideos];
  }, [sessionScheduledTask]);

  const allowedSuggestedVideos =
    STRICT_SCHEDULED_VIDEO_MODE && designatedVideoId
      ? sessionSuggestedVideos.filter((video) => video.videoId === designatedVideoId)
      : sessionSuggestedVideos;

  const disabledModes = useMemo(() => {
    const modes = new Set<SessionMode>();

    if (!hasSessionExamples) {
      modes.add("examples");
    }

    if (!hasSessionPractice) {
      modes.add("practice");
    }

    if (!hasSessionMiniTest) {
      modes.add("mini-test");
    }

    modes.add("visualizer");
    return modes;
  }, [hasSessionExamples, hasSessionPractice, hasSessionMiniTest]);

  useEffect(() => {
    if (activeMode === "examples" && !hasSessionExamples) {
      setActiveMode("notes");
    }
  }, [activeMode, hasSessionExamples]);

  useEffect(() => {
    if (activeMode === "practice" && !hasSessionPractice) {
      setActiveMode("notes");
    }
  }, [activeMode, hasSessionPractice]);

  useEffect(() => {
    if (activeMode === "mini-test" && !hasSessionMiniTest) {
      setActiveMode("notes");
    }
  }, [activeMode, hasSessionMiniTest]);

  useEffect(() => {
    let cancelled = false;

    const loadSessionQuestions = async () => {
      const shouldGenerate = hasSessionPractice || hasSessionMiniTest;
      if (!shouldGenerate) {
        setAiPracticeQuestions(null);
        setAiMiniTestQuestions(null);
        return;
      }

      const fallbackPractice = buildPracticeQuestions(sessionConceptTags.topic, sessionLearningPoints).slice(0, 10);
      const fallbackMini = buildMiniTestQuestions(sessionConceptTags.topic, sessionLearningPoints).slice(0, 10);

      try {
        const generated = await generateSessionQuiz({
          topic: sessionConceptTags.topic,
          questionCount: 10,
          videoId: currentVideoData.videoId || undefined,
          videoTitle: currentVideoData.title || undefined,
          videoSummary: currentVideoData.transcript || undefined,
          keyConcepts: sessionLearningPoints.slice(0, 8),
        });

        const valid = generated.filter(
          (item) =>
            item &&
            typeof item.question === "string" &&
            Array.isArray(item.options) &&
            item.options.length >= 4,
        );

        if (cancelled) {
          return;
        }

        if (valid.length > 0) {
          const practiceMapped = valid
            .slice(0, 10)
            .map((item, index) => mapSessionQuizToPracticeQuestion(item, index));
          const miniMapped = valid
            .slice(0, 10)
            .map((item, index) => mapSessionQuizToMiniTestQuestion(item, index));

          setAiPracticeQuestions(practiceMapped);
          setAiMiniTestQuestions(miniMapped);
          return;
        }

        setAiPracticeQuestions(fallbackPractice);
        setAiMiniTestQuestions(fallbackMini);
      } catch (error) {
        console.error("Failed to generate session quiz from AI, using fallback:", error);
        if (!cancelled) {
          setAiPracticeQuestions(fallbackPractice);
          setAiMiniTestQuestions(fallbackMini);
        }
      }
    };

    void loadSessionQuestions();

    return () => {
      cancelled = true;
    };
  }, [
    hasSessionPractice,
    hasSessionMiniTest,
    sessionConceptTags.topic,
    sessionLearningPoints,
    currentVideoData.videoId,
    currentVideoData.title,
    currentVideoData.transcript,
  ]);

  // Loading/Error state
  if (noSessionsPlanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert className="max-w-lg border-border bg-card text-card-foreground shadow-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No session scheduled for today</AlertTitle>
          <AlertDescription>
            There are no learning sessions scheduled for today. Add or move a task to today in Schedule to start a session.
          </AlertDescription>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => navigate("/schedule")}>Open Schedule</Button>
            <Button variant="outline" onClick={() => navigate("/goals")}>Create Goal</Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Loading/Error state
  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert className="max-w-md border-border bg-card text-card-foreground shadow-sm">
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
        return <NotesMode conceptTags={sessionConceptTags} structuredNotes={sessionNotesContent} />;
      case 'ai-summary':
        return (
          <AISummaryMode
            topic={sessionAISummary.topic}
            summary={sessionAISummary.summary}
            keyInsights={sessionAISummary.keyInsights}
            analogies={sessionAISummary.analogies}
            onSummaryRead={() => {
              if (hasSessionExamples) {
                setActiveMode('examples');
                return;
              }

              if (hasSessionPractice) {
                setActiveMode('practice');
                return;
              }

              if (hasSessionMiniTest) {
                setActiveMode('mini-test');
                return;
              }

              setActiveMode('notes');
            }}
          />
        );
      case 'examples':
        return (
          <ExamplesMode
            examples={sessionExamples}
            themeLabel={`${sessionConceptTags.category} · ${sessionConceptTags.topic}`}
          />
        );
      case 'practice':
        return (
          <PracticeMode 
            topic={sessionConceptTags.topic}
            questions={sessionPracticeQuestions}
            onComplete={(score: number) => {
              console.log(`Practice completed: ${score}%`);
              setActiveMode('mini-test');
            }}
          />
        );
      case 'mini-test':
        return (
          <MiniTestMode
            topic={sessionConceptTags.topic}
            questions={sessionTestQuestions}
            timeLimit={900}
            passingScore={70}
            onComplete={(score: number, passed: boolean) => {
              console.log(`Test ${passed ? 'passed' : 'failed'}: ${score}%`);
            }}
          />
        );
      case 'my-notes':
        return <MyNotesMode notes={sessionUserNotes} />;
      default:
        return <VideoMode videoData={currentVideoData} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Task Context Bar - Compact top bar */}
      <TaskContextBar
        task={task}
        sessionState={sessionState}
        nextSessionTitle={nextScheduledTaskTitle ?? undefined}
      />

      {sessionNotice && (
        <div className="px-4 md:px-6 pt-3">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Schedule Guard</AlertTitle>
            <AlertDescription>{sessionNotice}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Two-Panel Layout */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-90px)]">
        {/* Left Sidebar Navigation - Hidden on mobile */}
        <div className="hidden md:block">
          <SessionSidebar 
            activeMode={activeMode}
            onModeChange={setActiveMode}
            completedModes={new Set<SessionMode>()}
            noteCount={sessionUserNotes.length}
            disabledModes={disabledModes}
            disabled={noSessionsPlanned}
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
            noteCount={sessionUserNotes.length}
            disabledModes={disabledModes}
            disabled={noSessionsPlanned}
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
          suggestedVideos={allowedSuggestedVideos}
          onReschedulePlaylist={handleReschedulePlaylist}
          onSetPrimaryVideo={handleSetPrimaryVideo}
          onPause={handlePause}
          onResume={handleResume}
        />
      )}
    </div>
  );
}
