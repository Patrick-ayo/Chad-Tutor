import type {
  GenerateScheduleResult,
  DetailedRoadmap,
  DetailedRoadmapGenerationRequest,
  DetailedRoadmapGenerationResult,
  MissedTaskResolutionType,
  RescheduleResult,
  SuggestedAction,
  PlannerData,
  TopicStatus,
  ScheduledTask,
  TaskStatus,
  TaskType,
  LearningSessionData,
  QuizQuestion,
} from '@/types/planner';

export type { LearningSessionData, QuizQuestion };

interface ClerkLike {
  session?: {
    getToken?: () => Promise<string | null>;
  };
}

interface PlannerResponse {
  planner: PlannerData;
}

interface TasksForDateResponse {
  tasks: ScheduledTask[];
}

type PlaylistItemLike = {
  externalId?: string | null;
  externalUrl?: string | null;
  title?: string | null;
  description?: string | null;
  keyPoints?: unknown;
  learningOutcomes?: unknown;
};

type TaskLike = ScheduledTask & {
  playlistItem?: PlaylistItemLike | null;
  playlistItemId?: string | null;
  description?: string | null;
  notes?: string | null;
  status?: string;
};

interface SuggestedActionsEventDetail {
  source: 'resolve-multitopic' | 'recompute';
  actions: SuggestedAction[];
}

interface ResolveMultiTopicResponse {
  result: RescheduleResult;
}

interface RecomputeResponse {
  result: {
    updated: number;
    suggestedActions?: SuggestedAction[];
  };
}

interface TopicStatusesResponse {
  topics: TopicStatus[];
}

type LectureSummaryType = 'transcript-summary' | 'topic-overview' | 'expert-insight' | 'quiz' | 'all';

export type LectureQuizQuestion = QuizQuestion;

export interface LectureSummaryAllResponse {
  videoId: string;
  transcriptSummary: string;
  topicOverview: string;
  expertInsight: string;
  quizQuestions: LectureQuizQuestion[];
}

interface PlaylistItemInput {
  title: string;
  sequence: number;
  estimatedMinutes?: number;
  keyPoints?: string[];
  learningOutcomes?: string[];
}

export interface SessionQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

let injectedGetToken: (() => Promise<string | null>) | null = null;

export function setTokenResolver(resolver: () => Promise<string | null>) {
  injectedGetToken = resolver;
}

async function getClerkToken(): Promise<string | null> {
  if (injectedGetToken) {
    return await injectedGetToken();
  }

  const clerk = (window as unknown as { Clerk?: ClerkLike }).Clerk;
  if (!clerk?.session?.getToken) {
    return null;
  }

  try {
    return await clerk.session.getToken();
  } catch {
    return null;
  }
}

export async function authorizedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getClerkToken();
  const headers = new Headers(init.headers ?? {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    credentials: 'include',
    headers,
  });
}

function dispatchTopicStatusRefresh(reason: string) {
  window.dispatchEvent(
    new CustomEvent('planner:topic-status-refresh', {
      detail: { reason },
    }),
  );
}

function extractYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const watchId = parsed.searchParams.get('v');
    if (watchId) return watchId;
  } catch {
    // Fall through to regex patterns for non-standard URLs.
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch?.[1]) return shortMatch[1];

  const embedMatch = url.match(/embed\/([^?&]+)/);
  if (embedMatch?.[1]) return embedMatch[1];

  return null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || '').trim())
    .filter((item) => item.length > 0);
}

function inferTaskType(task: TaskLike): TaskType {
  if (task.taskType) {
    return task.taskType;
  }

  if (task.type) {
    return task.type;
  }

  if (task.playlistItemId || task.playlistItem) {
    return 'learn';
  }

  const title = (task.title || '').toLowerCase();
  if (title.includes('quiz')) return 'quiz';
  if (title.includes('practice')) return 'practice';
  if (title.includes('revision') || title.includes('revise')) return 'revision';
  return 'practice';
}

function mapApiTaskStatus(status?: string): TaskStatus {
  switch ((status || '').toUpperCase()) {
    case 'COMPLETED':
      return 'completed';
    case 'IN_PROGRESS':
      return 'in-progress';
    case 'MISSED':
    case 'SKIPPED':
      return 'skipped';
    case 'BLOCKED':
      return 'blocked';
    default:
      return 'pending';
  }
}

function mapApiTaskPriority(priority?: string): ScheduledTask['priority'] {
  switch ((priority || '').toUpperCase()) {
    case 'HIGH':
      return 'high';
    case 'LOW':
      return 'low';
    default:
      return 'medium';
  }
}

function getTaskTopics(task: TaskLike): string[] {
  return [
    ...toStringArray(task.keyPoints),
    ...toStringArray(task.learningOutcomes),
    ...toStringArray(task.playlistItem?.keyPoints),
    ...toStringArray(task.playlistItem?.learningOutcomes),
    ...(task.description ? [String(task.description)] : []),
    ...(task.notes ? [String(task.notes)] : []),
  ].filter(Boolean);
}

function resolveLearnTaskVideo(task: TaskLike): { videoId: string; videoUrl: string } {
  let videoId = task.videoId?.trim() || '';
  let videoUrl = task.videoUrl?.trim() || '';

  if (!videoId) {
    videoId = task.playlistItem?.externalId?.trim()
      || extractYouTubeVideoId(task.playlistItem?.externalUrl)
      || extractYouTubeVideoId(videoUrl)
      || '';
  }

  if (!videoUrl && task.playlistItem?.externalUrl) {
    videoUrl = task.playlistItem.externalUrl.trim();
  }

  if (!videoUrl && videoId) {
    videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  }

  return { videoId, videoUrl };
}

function deriveTaskVideo(task: TaskLike): { videoId: string; videoUrl: string; videoTitle: string } {
  const playlistItem = task.playlistItem ?? undefined;
  const { videoId, videoUrl } = resolveLearnTaskVideo(task);
  const videoTitle = playlistItem?.title?.trim() || task.title;

  return { videoId, videoUrl, videoTitle };
}

function normalizeScheduledTask(task: TaskLike): ScheduledTask {
  const taskType = inferTaskType(task);
  const scheduledDate = task.scheduledDate
    ? (typeof task.scheduledDate === 'string' ? task.scheduledDate : new Date(task.scheduledDate).toISOString())
    : new Date().toISOString();
  const video = taskType === 'learn' ? resolveLearnTaskVideo(task) : { videoId: task.videoId || '', videoUrl: task.videoUrl || '' };

  return {
    ...task,
    id: task.id,
    title: task.title,
    type: taskType,
    taskType,
    scheduledDate,
    estimatedMinutes: task.estimatedMinutes ?? 25,
    keyPoints: toStringArray(task.keyPoints),
    learningOutcomes: toStringArray(task.learningOutcomes),
    status: typeof task.status === 'string' && !['pending', 'in-progress', 'completed', 'overdue', 'blocked', 'skipped'].includes(task.status)
      ? mapApiTaskStatus(task.status)
      : (task.status as TaskStatus) ?? 'pending',
    priority: mapApiTaskPriority(task.priority as string | undefined),
    dependencies: task.dependencies ?? [],
    goalId: task.goalId ?? 'general',
    notes: task.description ?? task.notes ?? undefined,
    videoId: taskType === 'learn' ? (video.videoId || undefined) : task.videoId,
    videoUrl: taskType === 'learn' ? (video.videoUrl || undefined) : task.videoUrl,
    videoTitle: task.videoTitle || (taskType === 'learn' ? task.playlistItem?.title || undefined : undefined),
  };
}

export async function fetchPlannerSnapshot(): Promise<PlannerData> {
  const response = await authorizedFetch('/api/planner');

  const payload = await parseJson<PlannerResponse>(response);
  return payload.planner;
}

export interface NextPendingTaskInfo {
  task: ScheduledTask;
  isToday: boolean;
  daysFromToday: number;
}

function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysFromToday(scheduledDate: string, reference = new Date()): number {
  const today = startOfLocalDay(reference);
  const taskDay = startOfLocalDay(new Date(scheduledDate));
  return Math.round((taskDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

function isPendingScheduledTask(task: ScheduledTask, excludeTaskId?: string): boolean {
  return task.status === 'pending' && task.id !== excludeTaskId;
}

function collectFuturePendingTasks(
  planner: PlannerData,
  excludeTaskId?: string,
  reference = new Date(),
): ScheduledTask[] {
  const today = startOfLocalDay(reference);

  return planner.scheduleDays
    .flatMap((day) => day.tasks)
    .filter((task) => {
      const taskDay = startOfLocalDay(new Date(task.scheduledDate));
      return taskDay.getTime() > today.getTime() && isPendingScheduledTask(task, excludeTaskId);
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
    );
}

export async function findNextPendingTask(
  excludeTaskId?: string,
  plannerSnapshot?: PlannerData,
): Promise<NextPendingTaskInfo | null> {
  const reference = new Date();
  const todayIso = reference.toISOString();
  const todayTasks = await fetchTasksForDate(todayIso);
  const todayPending = todayTasks.find((task) => isPendingScheduledTask(task, excludeTaskId));

  if (todayPending) {
    return {
      task: todayPending,
      isToday: true,
      daysFromToday: 0,
    };
  }

  try {
    const planner = plannerSnapshot ?? await fetchPlannerSnapshot();
    const futurePending = collectFuturePendingTasks(planner, excludeTaskId, reference);
    const nextTask = futurePending[0];

    if (!nextTask) {
      return null;
    }

    return {
      task: nextTask,
      isToday: false,
      daysFromToday: daysFromToday(nextTask.scheduledDate, reference),
    };
  } catch (error) {
    console.error('Failed to find next pending task:', error);
    return null;
  }
}

export async function findUpcomingPendingTasks(
  limit = 3,
  plannerSnapshot?: PlannerData,
): Promise<NextPendingTaskInfo[]> {
  const reference = new Date();

  try {
    const planner = plannerSnapshot ?? await fetchPlannerSnapshot();
    return collectFuturePendingTasks(planner, undefined, reference)
      .slice(0, limit)
      .map((task) => ({
        task,
        isToday: false,
        daysFromToday: daysFromToday(task.scheduledDate, reference),
      }));
  } catch (error) {
    console.error('Failed to find upcoming pending tasks:', error);
    return [];
  }
}

export async function fetchTasksForDate(date: string): Promise<ScheduledTask[]> {
  try {
    const params = new URLSearchParams();
    params.set('date', date);

    const response = await authorizedFetch(`/api/tasks/date?${params.toString()}`);
    const payload = await parseJson<TasksForDateResponse>(response);
    const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];

    return tasks.map((task) => normalizeScheduledTask(task as TaskLike));
  } catch (error) {
    console.error('Failed to fetch tasks for date:', error);
    return [];
  }
}

export async function fetchTopicStatuses(): Promise<TopicStatus[]> {
  try {
    const response = await authorizedFetch('/api/planner/topics/status');
    const payload = await parseJson<TopicStatusesResponse>(response);
    return Array.isArray(payload.topics) ? payload.topics : [];
  } catch (error) {
    console.error('Failed to fetch planner topic statuses:', error);
    return [];
  }
}

export async function fetchLectureSummary(
  videoId: string,
  type: LectureSummaryType | 'structured-notes' | 'ai-summary',
  title: string,
  topic: string,
  taskId?: string,
): Promise<
  | { videoId: string; type: 'transcript-summary' | 'topic-overview' | 'expert-insight' | 'structured-notes'; content: string }
  | { videoId: string; type: 'ai-summary'; content: { summary: string; keyInsights: string[]; analogies: string[] } }
  | { videoId: string; type: 'quiz'; questions: LectureQuizQuestion[] }
  | LectureSummaryAllResponse
> {
  const params = new URLSearchParams();
  params.set('title', title);
  params.set('topic', topic);
  if (taskId) {
    params.set('taskId', taskId);
  }

  const response = await authorizedFetch(`/api/lecture/${encodeURIComponent(videoId)}/${type}?${params.toString()}`);
  return parseJson(response);
}

export async function startLearningSession(
  taskId: string,
  videoId: string,
  videoTitle: string,
  topicName: string,
): Promise<LearningSessionData> {
  const todayIso = new Date().toISOString();

  const [lectureResult, todaysTasksResult] = await Promise.allSettled([
    videoId
      ? fetchLectureSummary(videoId, 'all', videoTitle, topicName, taskId)
      : Promise.resolve(null),
    fetchTasksForDate(todayIso),
  ]);

  const lecture = lectureResult.status === 'fulfilled' && lectureResult.value
    ? lectureResult.value as LectureSummaryAllResponse
    : null;
  const todaysTasks = todaysTasksResult.status === 'fulfilled' ? todaysTasksResult.value : [];

  const task = todaysTasks.find((item) => item.id === taskId);
  const taskTopics = task ? getTaskTopics(task as TaskLike) : [];
  const resolvedVideoId = lecture?.videoId || videoId || (task ? deriveTaskVideo(task as TaskLike).videoId : '');
  const fallbackTopic = topicName || task?.title || videoTitle;
  const topicsCovered = toStringArray(task?.learningOutcomes).length > 0
    ? toStringArray(task?.learningOutcomes)
    : taskTopics.length > 0
      ? taskTopics
      : [fallbackTopic];
  const keyPoints = toStringArray(task?.keyPoints).length > 0
    ? toStringArray(task?.keyPoints)
    : taskTopics.slice(0, 6);

  return {
    taskId,
    videoId: resolvedVideoId,
    videoTitle: videoTitle || task?.title || fallbackTopic,
    videoUrl: resolvedVideoId ? `https://www.youtube.com/watch?v=${resolvedVideoId}` : '',
    topicName: fallbackTopic,
    transcriptSummary: lecture?.transcriptSummary ?? '',
    topicOverview: lecture?.topicOverview ?? '',
    expertInsight: lecture?.expertInsight ?? '',
    quizQuestions: lecture?.quizQuestions ?? [],
    keyPoints,
    estimatedMinutes: task?.estimatedMinutes ?? 0,
    topicsCovered,
    practiceNote: (task as TaskLike | undefined)?.description
      || task?.notes
      || `Practice the core ideas from ${fallbackTopic}.`,
    sessionGoal: task?.learningOutcomes?.[0]
      || `By the end of this session, you should be able to explain ${fallbackTopic}.`,
  };
}

export async function recomputeSchedule(goalId: string, reason: string): Promise<void> {
  try {
    const response = await authorizedFetch('/api/planner/recompute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goalId, reason }),
    });

    const payload = await parseJson<RecomputeResponse>(response);

    if (payload.result.suggestedActions && payload.result.suggestedActions.length > 0) {
      window.dispatchEvent(
        new CustomEvent<SuggestedActionsEventDetail>('planner:suggested-actions', {
          detail: {
            source: 'recompute',
            actions: payload.result.suggestedActions,
          },
        }),
      );
    }

    window.dispatchEvent(
      new CustomEvent('planner:recompute-success', {
        detail: { goalId, reason },
      }),
    );
    dispatchTopicStatusRefresh('recompute');
  } catch {
    window.dispatchEvent(
      new CustomEvent('planner:recompute-warning', {
        detail: 'Schedule recompute failed — your plan may be outdated',
      }),
    );
  }
}

export async function resolveMissedTask(
  taskId: string,
  type: MissedTaskResolutionType
): Promise<void> {
  const response = await authorizedFetch(`/api/planner/resolve/${taskId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type }),
  });

  await parseJson<{ result: unknown }>(response);
  dispatchTopicStatusRefresh('missed-task-resolution');
}

export async function resolveMissedTasksMultiTopic(missedTaskIds: string[], today?: string): Promise<RescheduleResult> {
  const response = await authorizedFetch('/api/planner/resolve-multitopic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ missedTaskIds, today }),
  });

  const payload = await parseJson<ResolveMultiTopicResponse>(response);

  if (payload.result.suggestedActions && payload.result.suggestedActions.length > 0) {
    window.dispatchEvent(
      new CustomEvent<SuggestedActionsEventDetail>('planner:suggested-actions', {
        detail: {
          source: 'resolve-multitopic',
          actions: payload.result.suggestedActions,
        },
      }),
    );
  }

  dispatchTopicStatusRefresh('resolve-multitopic');

  return payload.result;
}

export async function markTaskMissed(taskId: string, reason?: string): Promise<void> {
  const response = await authorizedFetch(`/api/tasks/${taskId}/missed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reason ? { reason } : {}),
  });

  await parseJson<{ task: unknown }>(response);
}

export async function generateScheduleFromPlaylists(
  playlistIds: string[],
  startDate?: string,
  horizonDays?: number,
): Promise<GenerateScheduleResult> {
  const response = await authorizedFetch('/api/planner/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playlistIds, startDate, horizonDays }),
  });

  const payload = await parseJson<{ result: GenerateScheduleResult }>(response);
  return payload.result;
}

export async function generateDetailedRoadmap(
  input: DetailedRoadmapGenerationRequest,
): Promise<DetailedRoadmap> {
  const response = await authorizedFetch('/api/roadmap/generate-detailed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJson<DetailedRoadmapGenerationResult & { roadmap: DetailedRoadmap }>(response);
  return payload.roadmap;
}

export async function createGoal(input: {
  name: string;
  description?: string;
  deadline: string;
  totalHours?: number;
}): Promise<{ id: string }> {
  const response = await authorizedFetch('/api/goals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  const payload = await parseJson<{ goal: { id: string } }>(response);
  return payload.goal;
}

export async function resolveMissedTasksBatch(
  resolutions: Array<{ taskId: string; type: MissedTaskResolutionType }>
): Promise<{ processed: number; results: Array<{ taskId: string; type: 'task-removed' | 'task-moved' }> }> {
  const response = await authorizedFetch('/api/planner/resolve-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resolutions }),
  });

  const payload = await parseJson<{
    result: {
      processed: number;
      results: Array<{ taskId: string; type: 'task-removed' | 'task-moved' }>;
    };
  }>(response);
  dispatchTopicStatusRefresh('resolve-batch');
  return payload.result;
}

export async function ingestPlaylist(input: {
  name: string;
  description?: string;
  externalSource: string;
  externalId?: string;
  externalUrl?: string;
  items: PlaylistItemInput[];
}): Promise<{ id: string; name: string }> {
  const response = await authorizedFetch('/api/playlists/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJson<{ playlist: { id: string; name: string } }>(response);
  return payload.playlist;
}

export async function fetchPlaylists(): Promise<Array<{ id: string; name: string }>> {
  const response = await authorizedFetch('/api/playlists');

  const payload = await parseJson<{ playlists: Array<{ id: string; name: string }> }>(response);
  return payload.playlists;
}

export async function completeTask(
  taskId: string,
  input?: {
    completedDurationMinutes?: number;
    quiz?: {
      questionsCount: number;
      correctCount: number;
      timeSpentSeconds?: number;
      metadata?: unknown;
    };
  }
): Promise<void> {
  const response = await authorizedFetch(`/api/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input ?? {}),
  });

  await parseJson<{ task: unknown }>(response);
  dispatchTopicStatusRefresh('task-complete');
}

export async function updateTaskProgress(
  taskId: string,
  watchedMinutes: number,
  percentComplete: number,
): Promise<void> {
  try {
    const response = await authorizedFetch(`/api/tasks/${taskId}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ watchedMinutes, percentComplete }),
    });

    await parseJson<{ task: unknown }>(response);
  } catch (error) {
    console.error('Failed to update task progress:', error);
  }
}

export async function startUserSession(): Promise<void> {
  try {
    const response = await authorizedFetch('/api/user/session/start', {
      method: 'POST',
    });

    await parseJson<{ success: boolean }>(response);
  } catch (error) {
    console.error('Failed to start user session:', error);
  }
}

export async function startUserBreak(): Promise<void> {
  try {
    const response = await authorizedFetch('/api/user/session/break/start', {
      method: 'POST',
    });

    await parseJson<{ success: boolean }>(response);
  } catch (error) {
    console.error('Failed to start user break:', error);
  }
}

export async function endUserBreak(): Promise<void> {
  try {
    const response = await authorizedFetch('/api/user/session/break/end', {
      method: 'POST',
    });

    await parseJson<{ success: boolean }>(response);
  } catch (error) {
    console.error('Failed to end user break:', error);
  }
}

export async function clearPlannerData(confirmationText: string): Promise<void> {
  const response = await authorizedFetch('/api/planner/clear', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ confirmationText }),
  });

  await parseJson<{ result: unknown }>(response);
  dispatchTopicStatusRefresh('clear');
}

export async function generateSessionQuiz(input: {
  topic: string;
  questionCount?: number;
  videoId?: string;
  videoTitle?: string;
  videoSummary?: string;
  keyConcepts?: string[];
}): Promise<SessionQuizQuestion[]> {
  const response = await authorizedFetch('/api/ai/generate-session-quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...input,
      questionCount: Math.max(1, Math.min(10, input.questionCount ?? 10)),
    }),
  });

  const payload = await parseJson<{ questions?: SessionQuizQuestion[] }>(response);
  const questions = Array.isArray(payload.questions) ? payload.questions : [];

  return questions.slice(0, 10);
}

export async function fetchNextPendingTask(
  completedTaskId?: string,
): Promise<{ task: ScheduledTask | null; isToday: boolean }> {
  try {
    const reference = new Date();
    const todayIso = reference.toISOString();
    const todayTasks = await fetchTasksForDate(todayIso);
    const todayPending = todayTasks.find((task) => task.status === 'pending' && task.id !== completedTaskId);

    if (todayPending) {
      return {
        task: todayPending,
        isToday: true,
      };
    }

    // Fall back to GET /api/planner for future tasks
    const response = await authorizedFetch('/api/planner');
    const payload = await parseJson<PlannerResponse>(response);
    const planner = payload.planner;
    const futurePending = collectFuturePendingTasks(planner, completedTaskId, reference);
    const nextTask = futurePending[0] || null;

    return {
      task: nextTask,
      isToday: false,
    };
  } catch (error) {
    console.error('Failed in fetchNextPendingTask:', error);
    return { task: null, isToday: false };
  }
}

export interface ProgressSummary {
  totalVideos: number;
  watchedVideos: number;
  totalMinutes: number;
  completedMinutes: number;
  overallPercent: number;

  subjects: Array<{
    topicId: string;
    topicName: string;
    totalVideos: number;
    watchedVideos: number;
    totalMinutes: number;
    completedMinutes: number;
    percent: number;
    status: "not_started"|"in_progress"|"completed";
  }>;

  pace: {
    plannedPerDay: number;
    actualPerDay: number;
    ratio: number;
    trend: "ahead"|"on_track"|"behind"|"critical";
  };

  dailyActivity: Array<{
    date: string;
    plannedMinutes: number;
    completedMinutes: number;
    intensity: 0|1|2|3|4;
  }>;

  projectedCompletion: {
    originalDeadline: string;
    projectedDate: string;
    daysAhead: number;
    onTrack: boolean;
  };
}

export async function fetchProgressSummary(): Promise<ProgressSummary | null> {
  try {
    const response = await authorizedFetch('/api/progress/summary');
    const payload = await parseJson<ProgressSummary>(response);
    return payload;
  } catch (error) {
    console.error('Failed to fetch progress summary:', error);
    return null;
  }
}
