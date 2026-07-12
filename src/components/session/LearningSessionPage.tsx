import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useScheduleStore } from "@/lib/scheduleStore";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Play,
  CheckSquare,
  BookOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LectureSummaryPanel } from "@/components/planner/LectureSummaryPanel";
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
import {
  fetchLectureSummary,
  fetchPlannerSnapshot,
  fetchTasksForDate,
  generateSessionQuiz,
  markTaskMissed,
  resolveMissedTasksMultiTopic,
  startLearningSession,
  type SessionQuizQuestion,
  type LectureQuizQuestion,
} from "@/lib/plannerApi";
import type { LearningSessionData, PlannerData, ScheduledTask } from "@/types/planner";

const FUTURE_TASK_WARNING =
  "⚠️ Starting this now won't affect your schedule. It will still appear on its scheduled day.";

const STRICT_SCHEDULED_VIDEO_MODE = true;

type TodayTask = ScheduledTask;

type TaskMode = "learn" | "practice" | "quiz" | "revision";

type QuizAnswers = Record<number, "A" | "B" | "C" | "D">;

function formatTodayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatMinutes(minutes: number): string {
  return `${Math.max(0, Math.round(minutes))} min`;
}

function getTaskMode(task: ScheduledTask): TaskMode {
  if (task.taskType) {
    return task.taskType;
  }

  return task.type;
}

function getTaskTypeLabel(task: ScheduledTask): string {
  const mode = getTaskMode(task);

  if (mode === "learn") return "📹";
  if (mode === "practice") return "✏️";
  if (mode === "quiz") return "❓";
  return "🔄";
}

function getStatusLabel(task: ScheduledTask): string {
  if (task.status === "completed") return "Done";
  if (task.status === "in-progress") return "In Progress";
  if (task.status === "overdue" || task.status === "blocked" || task.status === "skipped") return "Missed";
  return "Pending";
}

function getStatusIcon(task: ScheduledTask): string {
  if (task.status === "completed") return "●";
  if (task.status === "in-progress") return "◐";
  if (task.status === "overdue" || task.status === "blocked" || task.status === "skipped") return "✕";
  return "○";
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

function getTaskVideoId(task: ScheduledTask): string {
  return task.videoId || extractYouTubeVideoIdFromUrl(task.videoUrl) || "";
}

function getTaskDisplayTopic(task: ScheduledTask): string {
  return task.keyPoints?.[0] || task.learningOutcomes?.[0] || task.notes || task.title;
}

function isFutureScheduledTask(task: ScheduledTask): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDay = new Date(task.scheduledDate);
  taskDay.setHours(0, 0, 0, 0);
  return taskDay.getTime() > today.getTime();
}

function getTaskTopics(task: ScheduledTask): string[] {
  const topics = [
    ...(task.keyPoints ?? []),
    ...(task.learningOutcomes ?? []),
    task.notes ?? "",
  ]
    .map((item) => item.trim())
    .filter(Boolean);

  if (topics.length > 0) {
    return Array.from(new Set(topics)).slice(0, 6);
  }

  return [task.title];
}

function getPracticeInstruction(task: ScheduledTask): string {
  if (task.notes) {
    return task.notes;
  }

  if (task.learningOutcomes && task.learningOutcomes.length > 0) {
    return task.learningOutcomes[0];
  }

  return `Work through ${task.title} using the scheduled practice time.`;
}

function getRevisionNote(task: ScheduledTask): string {
  if (task.notes) {
    return task.notes;
  }

  if (task.learningOutcomes && task.learningOutcomes.length > 0) {
    return task.learningOutcomes.join(" ");
  }

  return `Revise the core ideas from ${task.title}.`;
}

function normalizeQuizQuestions(input: LectureQuizQuestion[]): LectureQuizQuestion[] {
  return Array.isArray(input) ? input : [];
}

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

function readActiveSessionFromStorage(): LearningSessionData | null {
  try {
    const raw = sessionStorage.getItem("activeSession");
    if (!raw) {
      return null;
    }

    sessionStorage.removeItem("activeSession");
    return JSON.parse(raw) as LearningSessionData;
  } catch {
    return null;
  }
}

interface SessionMaterialTabsProps {
  sessionData: LearningSessionData;
  videoData?: VideoMetadata;
  videoProgress: number;
  onQuizComplete: (correctCount: number, questionsCount: number) => Promise<void>;
}

function SessionMaterialTabs({ sessionData, videoData, videoProgress, onQuizComplete }: SessionMaterialTabsProps) {
  const [activeTab, setActiveTab] = useState("notes");
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  const allQuizAnswered = sessionData.quizQuestions.length > 0
    && sessionData.quizQuestions.every((_, index) => Boolean(quizAnswers[index]));

  const handleQuizSubmit = async () => {
    if (!allQuizAnswered || quizSubmitting) {
      return;
    }

    setQuizSubmitting(true);
    const correctCount = sessionData.quizQuestions.reduce((count, question, index) => {
      return quizAnswers[index] === question.correct ? count + 1 : count;
    }, 0);

    try {
      await onQuizComplete(correctCount, sessionData.quizQuestions.length);
    } finally {
      setQuizSubmitting(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList variant="line" className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="key-points">Key Points</TabsTrigger>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="quiz">Quiz</TabsTrigger>
      </TabsList>

      <TabsContent value="notes" className="pt-4 space-y-4">
        {sessionData.sessionGoal && (
          <p className="text-sm leading-6">{sessionData.sessionGoal}</p>
        )}
        
        {videoData?.keyTakeaways && videoData.keyTakeaways.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="font-semibold text-sm">Key Takeaways</h4>
            <div className="space-y-2">
              {videoData.keyTakeaways.map((takeaway, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-muted/50 rounded-lg">
                  <div className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm text-muted-foreground">{takeaway}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sessionData.topicsCovered.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {sessionData.topicsCovered.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        )}
        {sessionData.practiceNote && (
          <p className="text-sm text-muted-foreground">{sessionData.practiceNote}</p>
        )}
      </TabsContent>

      <TabsContent value="key-points" className="pt-4">
        {sessionData.keyPoints.length > 0 ? (
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {sessionData.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">Key points will appear here</p>
        )}
      </TabsContent>

      <TabsContent value="overview" className="pt-4 space-y-4">
        {sessionData.topicOverview || sessionData.expertInsight ? (
          <>
            {sessionData.topicOverview && (
              <p className="whitespace-pre-wrap text-sm leading-6">{sessionData.topicOverview}</p>
            )}
            {sessionData.expertInsight && (
              <p className="whitespace-pre-wrap text-sm leading-6">{sessionData.expertInsight}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Overview not available</p>
        )}
      </TabsContent>

      <TabsContent value="quiz" className="pt-4 space-y-4">
        {videoProgress < 80 ? (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p>🔒 Watch 80% of video to unlock quiz</p>
            <p className="mt-2 text-muted-foreground">Current progress: {videoProgress}%</p>
          </div>
        ) : sessionData.quizQuestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No quiz questions were generated for this lecture yet.</p>
        ) : (
          <div className="space-y-4">
            {sessionData.quizQuestions.map((question, index) => {
              const selected = quizAnswers[index];
              const isCorrect = selected === question.correct;

              return (
                <div key={`${question.question}-${index}`} className="space-y-2 rounded-lg border p-3">
                  <p className="text-sm font-medium">{index + 1}. {question.question}</p>
                  <div className="grid gap-2">
                    {(["A", "B", "C", "D"] as const).map((choice) => (
                      <Button
                        key={choice}
                        variant="outline"
                        className="justify-start text-left h-auto py-2"
                        disabled={Boolean(selected)}
                        onClick={() => setQuizAnswers((current) => ({ ...current, [index]: choice }))}
                      >
                        <span className="mr-2 font-semibold">{choice}.</span>
                        <span>{question.options[choice]}</span>
                      </Button>
                    ))}
                  </div>

                  {selected && (
                    <div className={`rounded-md px-3 py-2 text-sm ${isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                      <p className="font-medium">{isCorrect ? "Correct" : `Incorrect (correct answer: ${question.correct})`}</p>
                      <p className="mt-1">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            <Button onClick={() => void handleQuizSubmit()} disabled={!allQuizAnswered || quizSubmitting}>
              {quizSubmitting ? "Submitting..." : "Complete Quiz"}
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

interface LearningSessionPageProps {
  plannerData?: PlannerData;
}

export function LearningSessionPage({ plannerData }: LearningSessionPageProps) {
  const { userId, getToken } = useAuth();
  const { completeTask: storeCompleteTask, updateTaskProgress: storeUpdateTaskProgress } = useScheduleStore();
  const userStoragePrefix = `user:${userId || "anonymous"}`;
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  // Task data
  const [task, setTask] = useState<SessionTask | null>(null);

  // AI Generated Notes
  const [aiGeneratedNote, setAiGeneratedNote] = useState<UserNoteData | null>(null);
  const [isGeneratingAiNotes, setIsGeneratingAiNotes] = useState(false);

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
  const [completionToast, setCompletionToast] = useState<string | null>(null);
  const [aiPracticeQuestions, setAiPracticeQuestions] = useState<PracticeQuestionData[] | null>(null);
  const [aiMiniTestQuestions, setAiMiniTestQuestions] = useState<TestQuestionData[] | null>(null);
  const [todaysTasks, setTodaysTasks] = useState<TodayTask[]>([]);
  const [todaysTasksLoading, setTodaysTasksLoading] = useState(true);
  const [selectedTodayTask, setSelectedTodayTask] = useState<TodayTask | null>(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [showLectureSummary, setShowLectureSummary] = useState(false);
  const [drawerQuizQuestions, setDrawerQuizQuestions] = useState<LectureQuizQuestion[] | null>(null);
  const [drawerQuizLoading, setDrawerQuizLoading] = useState(false);
  const [drawerQuizAnswers, setDrawerQuizAnswers] = useState<QuizAnswers>({});
  const [drawerFeedback, setDrawerFeedback] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [learningSessionData, setLearningSessionData] = useState<LearningSessionData | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [drawerPreviewMode, setDrawerPreviewMode] = useState(false);

  const todayIsoDate = useMemo(() => new Date().toISOString(), []);

  const refreshTodayTasks = useCallback(async () => {
    setTodaysTasksLoading(true);
    const tasks = await fetchTasksForDate(new Date().toISOString());
    setTodaysTasks(tasks);
    setTodaysTasksLoading(false);
  }, []);

  const updateTodayTaskStatus = useCallback((taskId: string, status: ScheduledTask['status']) => {
    setTodaysTasks((current) =>
      current.map((item) =>
        item.id === taskId
          ? {
              ...item,
              status,
              completedDate: status === 'completed' ? new Date() : item.completedDate,
              missedOn: status === 'skipped' ? new Date() : item.missedOn,
            }
          : item,
      ),
    );
  }, []);
  const closeTaskDrawer = useCallback(() => {
    setIsTaskDrawerOpen(false);
    setSelectedTodayTask(null);
    setDrawerPreviewMode(false);
    setShowLectureSummary(false);
    setDrawerQuizQuestions(null);
    setDrawerQuizLoading(false);
    setDrawerQuizAnswers({});
  }, []);

  const openTaskDrawer = useCallback((nextTask: TodayTask) => {
    if (nextTask.status === 'completed') {
      return;
    }

    setSelectedTodayTask(nextTask);
    setDrawerPreviewMode(false);
    setIsTaskDrawerOpen(true);
    setShowLectureSummary(false);
    setDrawerQuizQuestions(null);
    setDrawerQuizLoading(false);
    setDrawerQuizAnswers({});
    setDrawerFeedback(null);
  }, []);

  const openTaskPreview = useCallback((nextTask: TodayTask) => {
    if (nextTask.status === 'completed') {
      return;
    }

    setSelectedTodayTask(nextTask);
    setDrawerPreviewMode(true);
    setIsTaskDrawerOpen(true);
    setShowLectureSummary(false);
    setDrawerQuizQuestions(null);
    setDrawerQuizLoading(false);
    setDrawerQuizAnswers({});
    setDrawerFeedback(null);
  }, []);

  const handleAfterTaskComplete = useCallback(async (completedTaskId: string) => {
    updateTodayTaskStatus(completedTaskId, 'completed');
    await refreshTodayTasks();
    
    setLearningSessionData(null);
    window.dispatchEvent(
      new CustomEvent('planner:topic-status-refresh', {
        detail: { reason: 'task-complete' },
      }),
    );
  }, [refreshTodayTasks, updateTodayTaskStatus]);

  const handleTaskComplete = useCallback(async (nextTask: TodayTask, completedMinutes: number) => {
    try {
      await storeCompleteTask(nextTask.id, {
        completedDurationMinutes: completedMinutes,
      });
      closeTaskDrawer();
      await handleAfterTaskComplete(nextTask.id);
    } catch (error) {
      console.error('Failed to complete task:', error);
      setDrawerFeedback({ type: 'error', message: 'Could not complete this session.' });
    }
  }, [closeTaskDrawer, handleAfterTaskComplete, storeCompleteTask]);

  const handleTaskMissed = useCallback(async (nextTask: TodayTask) => {
    try {
      await markTaskMissed(nextTask.id, 'Marked from session drawer');
      await resolveMissedTasksMultiTopic([nextTask.id], todayIsoDate);
      updateTodayTaskStatus(nextTask.id, 'skipped');
      setDrawerFeedback({ type: 'warning', message: 'Task marked as missed. Rescheduling...' });
      closeTaskDrawer();
      await refreshTodayTasks();
      window.dispatchEvent(
        new CustomEvent('planner:topic-status-refresh', {
          detail: { reason: 'task-missed' },
        }),
      );
    } catch (error) {
      console.error('Failed to mark task as missed:', error);
      setDrawerFeedback({ type: 'error', message: 'Could not mark the task as missed.' });
    }
  }, [closeTaskDrawer, refreshTodayTasks, todayIsoDate, updateTodayTaskStatus]);

  const handleStartWatchingTask = useCallback(async (nextTask: TodayTask) => {
    const resolvedVideoId = getTaskVideoId(nextTask);
    const topicName = getTaskDisplayTopic(nextTask);

    setIsLoadingSession(true);

    const sessionData = await startLearningSession(
      nextTask.id,
      resolvedVideoId,
      nextTask.title,
      topicName,
    );

    setIsLoadingSession(false);

    sessionStorage.setItem("activeSession", JSON.stringify(sessionData));
    closeTaskDrawer();
    navigate(`/session/${nextTask.id}`);
  }, [closeTaskDrawer, navigate]);

  const handleSessionQuizComplete = useCallback(async (correctCount: number, questionsCount: number) => {
    if (!learningSessionData) {
      return;
    }

    const completedTaskId = learningSessionData.taskId;

    try {
      await storeCompleteTask(completedTaskId, {
        completedDurationMinutes: learningSessionData.estimatedMinutes,
        proof: { score: questionsCount > 0 ? correctCount / questionsCount : 0 },
        quiz: {
          questionsCount,
          correctCount,
          metadata: { source: "session-player" },
        },
      });
      await handleAfterTaskComplete(completedTaskId);
      navigate("/session");
    } catch (error) {
      console.error("Failed to submit session quiz:", error);
    }
  }, [handleAfterTaskComplete, learningSessionData, navigate, storeCompleteTask]);

  const handleBackFromSession = useCallback(async () => {
    if (!learningSessionData) {
      navigate("/session");
      return;
    }

    if (videoProgress > 0 && videoProgress < 95) {
      const shouldLeave = window.confirm("Leave session? Your progress will be saved.");
      if (!shouldLeave) {
        return;
      }

      await storeUpdateTaskProgress(
        learningSessionData.taskId,
        Math.floor((videoProgress / 100) * learningSessionData.estimatedMinutes),
        videoProgress,
      );
    }

    setLearningSessionData(null);
    navigate("/session");
  }, [learningSessionData, navigate, videoProgress, storeUpdateTaskProgress]);

  const loadDrawerQuiz = useCallback(async () => {
    if (!selectedTodayTask) {
      return;
    }

    const videoId = getTaskVideoId(selectedTodayTask);
    if (!videoId) {
      setDrawerFeedback({ type: 'warning', message: 'No video is available for this quiz yet.' });
      return;
    }

    setDrawerQuizLoading(true);
    setDrawerFeedback(null);

    try {
      const response = await fetchLectureSummary(
        videoId,
        'quiz',
        selectedTodayTask.title,
        getTaskDisplayTopic(selectedTodayTask),
        selectedTodayTask.id,
      );
      const questions = 'questions' in response ? response.questions : [];
      setDrawerQuizQuestions(normalizeQuizQuestions(questions));
      setDrawerQuizAnswers({});
    } catch (error) {
      console.error('Failed to load quiz for task drawer:', error);
      setDrawerFeedback({ type: 'error', message: 'Could not load the quiz.' });
    } finally {
      setDrawerQuizLoading(false);
    }
  }, [selectedTodayTask]);

  const submitDrawerQuiz = useCallback(async () => {
    if (!selectedTodayTask || !drawerQuizQuestions || drawerQuizQuestions.length === 0) {
      return;
    }

    const correctCount = drawerQuizQuestions.reduce((count, question, index) => {
      return drawerQuizAnswers[index] === question.correct ? count + 1 : count;
    }, 0);

    try {
      await storeCompleteTask(selectedTodayTask.id, {
        completedDurationMinutes: selectedTodayTask.estimatedMinutes,
        quiz: {
          questionsCount: drawerQuizQuestions.length,
          correctCount,
          metadata: { source: 'session-drawer' },
        },
      });
      closeTaskDrawer();
      await handleAfterTaskComplete(selectedTodayTask.id);
    } catch (error) {
      console.error('Failed to submit quiz completion:', error);
      setDrawerFeedback({ type: 'error', message: 'Quiz completed but could not be saved.' });
    }
  }, [closeTaskDrawer, drawerQuizAnswers, drawerQuizQuestions, handleAfterTaskComplete, selectedTodayTask, storeCompleteTask]);

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

      // Normalize today's date to local YYYY-MM-DD for accurate comparison
      const todayDate = new Date();
      const year = todayDate.getFullYear();
      const month = String(todayDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(todayDate.getDate()).padStart(2, '0');
      const todayText = `${year}-${month}-${dayStr}`;
      
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
          .filter((day) => {
            const dayText = day.date.split('T')[0];
            return dayText === todayText;
          })
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
            .filter((day) => {
              const dayText = day.date.split('T')[0];
              return dayText === todayText;
            })
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

      if (plannerLoaded && todayTasks.length === 0 && !effectiveTaskId) {
        if (isCancelled) {
          return;
        }

        setNoSessionsPlanned(true);
        setTask(null);
        setSessionScheduledTask(null);
        setNextScheduledTaskTitle(null);
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const urlGoalId = searchParams.get("goalId") || searchParams.get("goal_id");

      if (!effectiveTaskId && plannerTasks.length > 0) {
        let candidateTasks = urlGoalId ? plannerTasks.filter(t => t.goalId === urlGoalId) : todayTasks;
        // If no tasks match the specific goal, fallback to today's tasks, or all planner tasks
        if (candidateTasks.length === 0) {
           candidateTasks = todayTasks.length > 0 ? todayTasks : plannerTasks;
        }

        let selectedTask = candidateTasks.find(t => t.status === "in-progress");
        if (!selectedTask) {
          selectedTask = candidateTasks.find(t => ["pending", "skipped", "overdue"].includes(t.status));
        }
        if (!selectedTask) {
          selectedTask = candidateTasks[0];
        }

        effectiveTaskId = selectedTask.id;
        currentScheduledTask = selectedTask;
        taskData = mockSessionTasks[effectiveTaskId] ?? mapScheduledTaskToSessionTask(selectedTask);

        if (!isCancelled) {
          navigate(`/session/${selectedTask.id}`, { replace: true });
        }
      }

      currentScheduledTask =
        currentScheduledTask || findBestScheduledTask(plannerTasks, effectiveTaskId, taskData);

      if (!currentScheduledTask && plannerTasks.length > 0) {
        let candidateTasks = urlGoalId ? plannerTasks.filter(t => t.goalId === urlGoalId) : todayTasks;
        if (candidateTasks.length === 0) {
           candidateTasks = todayTasks.length > 0 ? todayTasks : plannerTasks;
        }
        
        let fallbackTodayTask = candidateTasks.find(t => t.status === "in-progress");
        if (!fallbackTodayTask) fallbackTodayTask = candidateTasks.find(t => ["pending", "skipped", "overdue"].includes(t.status));
        if (!fallbackTodayTask) fallbackTodayTask = candidateTasks[0];
        
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

      const activeSession = readActiveSessionFromStorage();
      if (activeSession && activeSession.taskId === effectiveTaskId) {
        setLearningSessionData(activeSession);
        setVideoProgress(0);
        setCurrentVideoData({
          videoId: activeSession.videoId,
          title: activeSession.videoTitle,
          duration: activeSession.estimatedMinutes * 60,
          keyTakeaways: activeSession.keyPoints,
          transcript: activeSession.transcriptSummary,
        });
        setDesignatedVideoId(activeSession.videoId || null);
        setSessionNotice(null);
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

      if (activeSession && activeSession.taskId === effectiveTaskId) {
        setNextScheduledTaskTitle(null);
        return;
      }

      const designatedStorageKey = `${userStoragePrefix}:session_designated_video_${effectiveTaskId}`;
      const savedDesignatedVideoId = localStorage.getItem(designatedStorageKey);

      const scheduledDesignated =
        currentScheduledTask && suggestedVideoFromScheduledTask(currentScheduledTask);

      const sameGoalScheduledVideo =
        currentScheduledTask
          ? plannerTasks
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

  useEffect(() => {
    let isActive = true;

    const runRefresh = async () => {
      await refreshTodayTasks();
    };

    void runRefresh();

    const handleFocus = () => {
      if (!isActive) {
        return;
      }

      void refreshTodayTasks();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      isActive = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshTodayTasks]);

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

    if (learningSessionData && taskId) {
      void import('@/lib/plannerApi').then(({ fetchLectureSummary }) => {
        return fetchLectureSummary(
          suggestedVideo.videoId,
          'all',
          suggestedVideo.title,
          learningSessionData.topicName,
          taskId
        );
      }).then(lecture => {
        if (lecture && !('type' in lecture)) {
          setLearningSessionData(prev => prev ? {
            ...prev,
            transcriptSummary: lecture.transcriptSummary ?? '',
            topicOverview: lecture.topicOverview ?? '',
            expertInsight: lecture.expertInsight ?? '',
            quizQuestions: lecture.quizQuestions ?? [],
          } : prev);
        }
      }).catch(console.error);
    }

    // Save to localStorage for persistence
    const sessionStorageKey = `${userStoragePrefix}:session_${taskId}`;
    const savedSessionData = localStorage.getItem(sessionStorageKey);
    const sessionData = savedSessionData ? JSON.parse(savedSessionData) : {};
    sessionData.primaryVideo = newVideoData;
    localStorage.setItem(sessionStorageKey, JSON.stringify(sessionData));

    // Log event
    logEvent("primary_video_updated", {
      videoId: suggestedVideo.videoId,
      videoTitle: suggestedVideo.title,
      timestamp: new Date().toISOString(),
    });

    console.log("Primary video updated to:", suggestedVideo.title);
  }, [taskId, designatedVideoId, logEvent, userStoragePrefix]);

  const handleConfirmEnd = useCallback(
    async (data: EndSessionData) => {
      setSessionState((state) => ({
        ...state,
        status: "ended",
      }));

      logEvent("session_end", {
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
        // We no longer manually complete the task here. 
        // Task completion is automatically triggered by watching 90% of a video or submitting a quiz.
        console.log("Session ended early or without auto-completion. Planner task state remains unchanged.");
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
      storeCompleteTask,
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

  useEffect(() => {
    if (!currentVideoData.videoId) return;

    const storageKey = `ai-notes-${currentVideoData.videoId}`;
    const existingNotes = localStorage.getItem(storageKey);
    
    if (existingNotes) {
      try {
        const parsed = JSON.parse(existingNotes);
        setAiGeneratedNote({
          id: `ai-${currentVideoData.videoId}`,
          content: parsed,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to parse existing AI notes", e);
      }
      return;
    }

    const generateNotes = async () => {
      setIsGeneratingAiNotes(true);
      try {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/session/generate-session-notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            videoId: currentVideoData.videoId,
            videoTitle: currentVideoData.title || task?.name,
            topicName: task?.topicName || task?.name
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.notes) {
            localStorage.setItem(storageKey, JSON.stringify(data.notes));
            setAiGeneratedNote({
              id: `ai-${currentVideoData.videoId}`,
              content: data.notes,
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.error("Failed to generate AI notes", err);
      } finally {
        setIsGeneratingAiNotes(false);
      }
    };

    void generateNotes();
  }, [currentVideoData.videoId, currentVideoData.title, task?.name, task?.topicName, getToken]);

  const sessionUserNotes = useMemo(() => {
    const baseNotes = buildTaskUserNotes(task, sessionLearningPoints);
    if (isGeneratingAiNotes) {
      return [{
        id: 'ai-loading',
        content: '*Generating AI elaborative notes from video thumbnail...*',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }, ...baseNotes];
    }
    if (aiGeneratedNote) {
      return [aiGeneratedNote, ...baseNotes];
    }
    return baseNotes;
  }, [task, sessionLearningPoints, aiGeneratedNote, isGeneratingAiNotes]);

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
    if (!completionToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCompletionToast(null);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [completionToast]);

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

  const renderTodayTasksSection = () => {
    const completedCount = todaysTasks.filter((item) => item.status === 'completed').length;
    const totalCount = todaysTasks.length;
    const completedMinutes = todaysTasks
      .filter((item) => item.status === 'completed')
      .reduce((sum, item) => sum + item.estimatedMinutes, 0);
    const totalMinutes = todaysTasks.reduce((sum, item) => sum + item.estimatedMinutes, 0);
    const progressValue = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const nextTask = todaysTasks.find((item) => item.status !== 'completed');

    return (
      <div className="flex h-full flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Your Next Session</h2>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} sessions completed today ({completedMinutes}/{totalMinutes} min)
            </p>
            <Progress value={progressValue} className="h-2 mx-auto w-3/4 mt-2" />
          </div>

          <div className="mt-8">
            {todaysTasksLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground py-10">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Loading your session...</p>
              </div>
            ) : !nextTask ? (
              <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
                <p className="text-lg font-medium">You're all caught up! 🎉</p>
                <p className="mt-2 text-sm text-muted-foreground">No more sessions scheduled for today.</p>
                <Button variant="outline" className="mt-6" onClick={() => navigate('/schedule')}>
                  View Schedule
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/20 bg-card p-6 shadow-md transition-all hover:shadow-lg">
                <div className="flex flex-col gap-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl">{getStatusIcon(nextTask)}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{nextTask.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {getTaskDisplayTopic(nextTask)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {getTaskTypeLabel(nextTask)}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      {formatMinutes(nextTask.estimatedMinutes)}
                    </span>
                  </div>

                  {/* Added Context Sections */}
                  <div className="mt-6 space-y-4 text-left border-t pt-4">
                    {/* Topics / What you'll learn */}
                    {getTaskTopics(nextTask).length > 0 && (
                      <div className="rounded-xl bg-muted/30 p-3">
                        <p className="text-sm font-semibold mb-2">What you'll learn:</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {getTaskTopics(nextTask).map((topic) => (
                            <li key={topic}>• {topic}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Assigned Video Content */}
                    {(nextTask.type === 'learn' || (nextTask.type as any) === 'watch') && (nextTask.videoTitle || nextTask.title) && (
                      <div className="rounded-xl border bg-card p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                              <Play className="h-3.5 w-3.5" />
                              Assigned Video Content
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {nextTask.videoTitle || nextTask.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Learning Outcomes */}
                    {nextTask.learningOutcomes && nextTask.learningOutcomes.length > 0 && (
                      <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                        <p className="text-sm font-semibold mb-2">Learning Outcomes:</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {nextTask.learningOutcomes.map((outcome: string) => (
                            <li key={outcome}>• {outcome}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="mt-6 w-full gap-2 font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartWatchingTask(nextTask);
                    }}
                  >
                    {(nextTask.type === 'learn' || (nextTask.type as any) === 'watch') && <><Play className="h-4 w-4" /> Start Video</>}
                    {nextTask.type === 'practice' && <><BookOpen className="h-4 w-4" /> Start Practice</>}
                    {nextTask.type === 'quiz' && <><CheckSquare className="h-4 w-4" /> Start Quiz</>}
                    {nextTask.type !== 'learn' && (nextTask.type as any) !== 'watch' && nextTask.type !== 'practice' && nextTask.type !== 'quiz' && (
                      "Start Session"
                    )}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate('/schedule')}>
                    View Full Schedule
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTaskDrawer = () => {
    if (!selectedTodayTask) {
      return null;
    }

    const mode = getTaskMode(selectedTodayTask);
    const taskTopics = getTaskTopics(selectedTodayTask);
    const videoId = getTaskVideoId(selectedTodayTask);
    const practiceLabel = (() => {
      const text = `${selectedTodayTask.title} ${selectedTodayTask.notes || ''}`.toLowerCase();
      if (text.includes('flashcard')) return 'Flashcard';
      if (text.includes('code')) return 'Coding';
      if (text.includes('mcq') || text.includes('quiz')) return 'MCQ';
      return 'Written';
    })();

    const allQuizAnswered = drawerQuizQuestions
      ? drawerQuizQuestions.every((_, index) => Boolean(drawerQuizAnswers[index]))
      : false;
    const isPreview = drawerPreviewMode;
    const showFutureWarning = isPreview || isFutureScheduledTask(selectedTodayTask);

    return (
      <Sheet open={isTaskDrawerOpen} onOpenChange={(open) => (open ? setIsTaskDrawerOpen(true) : closeTaskDrawer())}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="space-y-1 pr-8 text-left">
            <SheetTitle className="text-xl">
              {mode === 'practice' ? '✏️' : mode === 'quiz' ? '❓' : mode === 'revision' ? '🔄' : '📹'} {selectedTodayTask.title}
            </SheetTitle>
            <SheetDescription>
              {mode === 'learn' ? `${getTaskDisplayTopic(selectedTodayTask)} · ${selectedTodayTask.estimatedMinutes} min` : `${selectedTodayTask.estimatedMinutes} min`}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5 space-y-4">
            {drawerFeedback && (
              <Alert variant={drawerFeedback.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{drawerFeedback.message}</AlertDescription>
              </Alert>
            )}

            {mode === 'learn' && (
              <>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-sm font-semibold">What you'll learn:</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {taskTopics.map((topic) => (
                      <li key={topic}>• {topic}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border bg-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Video brief</p>
                      <p className="text-xs text-muted-foreground">{selectedTodayTask.title}</p>
                    </div>
                    <Badge variant="secondary">{formatMinutes(selectedTodayTask.estimatedMinutes)}</Badge>
                  </div>
                  {selectedTodayTask.keyPoints && selectedTodayTask.keyPoints.length >= 2 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedTodayTask.keyPoints[0]}. {selectedTodayTask.keyPoints[1]}.
                    </p>
                  )}
                </div>

                {showFutureWarning && (
                  <p className="text-sm text-amber-800">{FUTURE_TASK_WARNING}</p>
                )}

                {isLoadingSession && (
                  <div className="rounded-xl border bg-muted/30 p-4 text-center space-y-2">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    <p className="text-sm font-medium">Preparing your session...</p>
                    <p className="text-xs text-muted-foreground">Loading video, notes and quiz questions</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {isPreview ? (
                    <Button
                      onClick={() => void handleStartAnyway(selectedTodayTask)}
                      disabled={isLoadingSession}
                    >
                      Start Anyway
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => void handleStartWatchingTask(selectedTodayTask)}
                        disabled={isLoadingSession}
                      >
                        ▶ Start Watching
                      </Button>
                      <Button variant="outline" onClick={() => setShowLectureSummary((current) => !current)}>📄 View Summary</Button>
                      <Button variant="outline" onClick={() => void handleTaskMissed(selectedTodayTask)}>Mark as Missed</Button>
                    </>
                  )}
                </div>

                {showLectureSummary && videoId && !isPreview && (
                  <LectureSummaryPanel
                    videoId={videoId}
                    videoTitle={selectedTodayTask.title}
                    topicName={getTaskDisplayTopic(selectedTodayTask)}
                    taskId={selectedTodayTask.id}
                  />
                )}
              </>
            )}

            {mode === 'practice' && (
              <>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-sm font-semibold">✏️ {selectedTodayTask.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedTodayTask.estimatedMinutes} min</p>
                  <p className="mt-2 text-sm">{getPracticeInstruction(selectedTodayTask)}</p>
                  <Badge variant="secondary" className="mt-3">{practiceLabel}</Badge>
                </div>

                {selectedTodayTask.keyPoints && selectedTodayTask.keyPoints.length > 0 && (
                  <details className="rounded-xl border bg-card p-3">
                    <summary className="cursor-pointer text-sm font-medium">Hints</summary>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {selectedTodayTask.keyPoints.map((hint) => (
                        <p key={hint}>• {hint}</p>
                      ))}
                    </div>
                  </details>
                )}

                {showFutureWarning && (
                  <p className="text-sm text-amber-800">{FUTURE_TASK_WARNING}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {isPreview ? (
                    <Button onClick={() => void handleStartAnyway(selectedTodayTask)}>Start Anyway</Button>
                  ) : (
                    <>
                      <Button onClick={() => void handleTaskComplete(selectedTodayTask, selectedTodayTask.estimatedMinutes)}>✅ Mark Complete</Button>
                      <Button variant="outline" onClick={() => void handleTaskMissed(selectedTodayTask)}>Mark as Missed</Button>
                    </>
                  )}
                </div>
              </>
            )}

            {mode === 'quiz' && (
              <>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-sm font-semibold">❓ {selectedTodayTask.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{selectedTodayTask.estimatedMinutes} min</p>
                  <p className="mt-2 text-sm">5 questions covering: {taskTopics.join(', ')}</p>
                </div>

                {showFutureWarning && (
                  <p className="text-sm text-amber-800">{FUTURE_TASK_WARNING}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {isPreview ? (
                    <Button onClick={() => void handleStartAnyway(selectedTodayTask)}>Start Anyway</Button>
                  ) : (
                    <>
                      <Button onClick={() => void loadDrawerQuiz()} disabled={drawerQuizLoading}>
                        {drawerQuizLoading ? 'Loading...' : '❓ Start Quiz'}
                      </Button>
                      <Button variant="outline" onClick={() => void handleTaskMissed(selectedTodayTask)}>Mark as Missed</Button>
                    </>
                  )}
                </div>

                {drawerQuizQuestions && drawerQuizQuestions.length > 0 && !isPreview && (
                  <div className="space-y-3">
                    {drawerQuizQuestions.map((question, index) => {
                      const selected = drawerQuizAnswers[index];
                      return (
                        <div key={`${question.question}-${index}`} className="rounded-xl border bg-card p-3 space-y-2">
                          <p className="text-sm font-medium">{index + 1}. {question.question}</p>
                          <div className="grid gap-2">
                            {(['A', 'B', 'C', 'D'] as const).map((choice) => (
                              <Button
                                key={choice}
                                variant="outline"
                                className="justify-start text-left h-auto py-2"
                                disabled={Boolean(selected)}
                                onClick={() => setDrawerQuizAnswers((current) => ({ ...current, [index]: choice }))}
                              >
                                <span className="mr-2 font-semibold">{choice}.</span>
                                <span>{question.options[choice]}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    <Button onClick={() => void submitDrawerQuiz()} disabled={!allQuizAnswered}>
                      Complete Quiz
                    </Button>
                  </div>
                )}
              </>
            )}

            {mode === 'revision' && (
              <>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-sm font-semibold">🔄 {selectedTodayTask.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{selectedTodayTask.estimatedMinutes} min</p>
                  <p className="mt-2 text-sm">{getRevisionNote(selectedTodayTask)}</p>
                </div>

                <div className="rounded-xl border bg-card p-3">
                  <p className="text-sm font-semibold">Topics being revised</p>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {taskTopics.map((topic) => (
                      <p key={topic}>• {topic}</p>
                    ))}
                  </div>
                </div>

                {showFutureWarning && (
                  <p className="text-sm text-amber-800">{FUTURE_TASK_WARNING}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {isPreview ? (
                    <Button onClick={() => void handleStartAnyway(selectedTodayTask)}>Start Anyway</Button>
                  ) : (
                    <>
                      <Button onClick={() => void handleTaskComplete(selectedTodayTask, selectedTodayTask.estimatedMinutes)}>✅ Mark Complete</Button>
                      <Button variant="outline" onClick={() => void handleTaskMissed(selectedTodayTask)}>Mark as Missed</Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  // Loading/Error state
  if (!todaysTasksLoading && todaysTasks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl space-y-4">
          <Alert className="border-border bg-card text-card-foreground shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You're all caught up! No sessions scheduled for today.</AlertTitle>
            <AlertDescription>
              Check your Schedule or Planner to manage upcoming tasks.
            </AlertDescription>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => navigate("/schedule")}>Open Schedule</Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // Loading/Error state
  if (todaysTasksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!task && taskId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl space-y-4">
          <Alert className="border-border bg-card text-card-foreground shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Task Not Found</AlertTitle>
            <AlertDescription>
              The learning task you're looking for doesn't exist or has been completed.
            </AlertDescription>
            <Button className="mt-4" onClick={() => navigate("/")}>Return to Dashboard</Button>
          </Alert>

          {renderTodayTasksSection()}
          
        </div>
      </div>
    );
  }

  const renderBundledSessionContent = () => {
    if (!learningSessionData) {
      return null;
    }

    return (
      <div className="space-y-6">
        <VideoMode
          key={learningSessionData.videoId}
          videoId={learningSessionData.videoId}
          videoData={currentVideoData}
          taskId={learningSessionData.taskId}
          task={task}
          onProgressUpdate={setVideoProgress}
          onAutoComplete={() => {
            void handleAfterTaskComplete(learningSessionData.taskId);
            navigate("/session");
          }}
        />

        <SessionMaterialTabs
          sessionData={learningSessionData}
          videoData={currentVideoData}
          videoProgress={videoProgress}
          onQuizComplete={handleSessionQuizComplete}
        />
      </div>
    );
  };

  // Render main content based on active mode
  const renderMainContent = () => {
    if (learningSessionData && activeMode === 'video') {
      return renderBundledSessionContent();
    }

    switch (activeMode) {
      case 'video':
        return (
          <div className="space-y-4">
            <VideoMode
              key={currentVideoData.videoId}
              videoData={currentVideoData}
              videoId={currentVideoData.videoId}
              taskId={taskId}
              task={task}
              onProgressUpdate={setVideoProgress}
              onSessionPlay={handleResume}
              onSessionPause={handlePause}
              onAutoComplete={() => {
                if (taskId) {
                  void handleAfterTaskComplete(taskId);
                  navigate("/session");
                }
              }}
            />
            
          </div>
        );
      case 'notes':
        return (
          <NotesMode
            conceptTags={sessionConceptTags}
            structuredNotes={sessionNotesContent}
            videoId={currentVideoData?.videoId}
            videoTitle={currentVideoData?.title || task?.name}
            topicName={task?.topicName || task?.name}
            taskId={taskId || undefined}
          />
        );
      case 'ai-summary':
        return (
          <AISummaryMode
            topic={sessionAISummary.topic}
            summary={sessionAISummary.summary}
            keyInsights={sessionAISummary.keyInsights}
            analogies={sessionAISummary.analogies}
            videoId={currentVideoData?.videoId}
            videoTitle={currentVideoData?.title || task?.name}
            taskId={taskId || undefined}
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
        return (
          <div className="space-y-4">
            <VideoMode
              videoData={currentVideoData}
              videoId={currentVideoData.videoId}
              taskId={taskId}
              task={task}
              onProgressUpdate={setVideoProgress}
              onSessionPlay={handleResume}
              onSessionPause={handlePause}
              onAutoComplete={() => {
                if (taskId) {
                  void handleAfterTaskComplete(taskId);
                  navigate("/session");
                }
              }}
            />
            
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {completionToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-lg">
          {completionToast}
        </div>
      )}

      {!task && !taskId && (
        <>
          {renderTodayTasksSection()}
          
        </>
      )}

      {/* Task Context Bar - Compact top bar */}
      {(learningSessionData || taskId) && (
        <TaskContextBar
          task={task || { id: '', name: 'Session', estimatedMinutes: 0 } as any}
          sessionState={sessionState}
          nextSessionTitle={nextScheduledTaskTitle ?? undefined}
          taskStatus={sessionScheduledTask?.status}
        />
      )}

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
      {(learningSessionData || taskId) && (
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
          <div className="hidden md:block h-full overflow-y-auto shrink-0 border-r border-muted/20">
            <SessionSidebar 
              activeMode={activeMode}
              onModeChange={setActiveMode}
              completedModes={new Set<SessionMode>()}
              noteCount={sessionUserNotes.length}
              disabledModes={disabledModes}
              disabled={noSessionsPlanned}
            />
          </div>

          <div className="flex-1 h-full overflow-y-auto bg-card pb-32 md:pb-0 scroll-smooth">
            <div className="p-4 md:p-6 max-w-4xl mx-auto">
              <div className="mb-6">
                <Button variant="ghost" className="px-0 hover:bg-transparent" onClick={() => void handleBackFromSession()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Today's Sessions
                </Button>
              </div>
              {renderMainContent()}
            </div>
          </div>

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
      )}

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
        taskName={task?.name || "Session"}
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

      {renderTaskDrawer()}
    </div>
  );
}
