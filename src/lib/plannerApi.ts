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
} from '@/types/planner';

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
  notes?: string | null;
};

export interface LearningSessionData {
  taskId: string;
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  topicName: string;
  transcriptSummary: string;
  topicOverview: string;
  expertInsight: string;
  quizQuestions: LectureQuizQuestion[];
  keyPoints: string[];
  estimatedMinutes: number;
  topicsCovered: string[];
  practiceNote: string;
  sessionGoal: string;
  warning?: string;
  materialsLoaded: boolean;
}

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

export interface LectureQuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

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

async function getClerkToken(): Promise<string | null> {
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

async function authorizedFetch(input: string, init: RequestInit = {}): Promise<Response> {
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

function extractYouTubeVideoIdFromUrl(url?: string | null): string | null {
  if (!url) return null;

  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watchMatch?.[1]) return watchMatch[1];

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch?.[1]) return shortMatch[1];

  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{6,})/);
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

function getTaskTopics(task: TaskLike): string[] {
  return [
    ...toStringArray(task.keyPoints),
    ...toStringArray(task.learningOutcomes),
    ...(task.notes ? [String(task.notes)] : []),
  ].filter(Boolean);
}

function deriveTaskVideo(task: TaskLike): { videoId: string; videoUrl: string; videoTitle: string } {
  const playlistItem = task.playlistItem ?? undefined;
  const explicitVideoId = task.videoId?.trim() || extractYouTubeVideoIdFromUrl(task.videoUrl ?? undefined);
  const playlistVideoId = playlistItem?.externalId?.trim() || extractYouTubeVideoIdFromUrl(playlistItem?.externalUrl ?? undefined);
  const videoId = explicitVideoId || playlistVideoId || '';
  const videoUrl = task.videoUrl?.trim()
    || playlistItem?.externalUrl?.trim()
    || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
  const videoTitle = playlistItem?.title?.trim() || task.title;

  return { videoId, videoUrl, videoTitle };
}

export async function fetchPlannerSnapshot(): Promise<PlannerData> {
  const response = await authorizedFetch('/api/planner');

  const payload = await parseJson<PlannerResponse>(response);
  return payload.planner;
}

export async function fetchTasksForDate(date: string): Promise<ScheduledTask[]> {
  try {
    const params = new URLSearchParams();
    params.set('date', date);

    const response = await authorizedFetch(`/api/tasks/date?${params.toString()}`);
    const payload = await parseJson<TasksForDateResponse>(response);
    const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];

    return tasks.map((task) => {
      const taskLike = task as TaskLike;
      const video = deriveTaskVideo(taskLike);

      return {
        ...task,
        ...(task.type === 'learn' && !task.videoId && video.videoId ? { videoId: video.videoId } : {}),
        ...(task.type === 'learn' && !task.videoUrl && video.videoUrl ? { videoUrl: video.videoUrl } : {}),
        ...(taskLike.playlistItem?.title && !task.title ? { title: taskLike.playlistItem.title } : {}),
      };
    });
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
  type: LectureSummaryType,
  title: string,
  topic: string,
  taskId?: string,
): Promise<
  | { videoId: string; type: 'transcript-summary' | 'topic-overview' | 'expert-insight'; content: string }
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

  const lecture = lectureResult.status === 'fulfilled' ? lectureResult.value : null;
  const todaysTasks = todaysTasksResult.status === 'fulfilled' ? todaysTasksResult.value : [];

  const task = todaysTasks.find((item) => item.id === taskId) as TaskLike | undefined;
  const taskTopics = task ? getTaskTopics(task) : [];
  const derivedVideo = task ? deriveTaskVideo(task) : { videoId, videoUrl: '', videoTitle };

  const fallbackTopic = topicName || task?.title || videoTitle;

  return {
    taskId,
    videoId: lecture?.videoId || derivedVideo.videoId || videoId,
    videoUrl: derivedVideo.videoUrl || (lecture?.videoId ? `https://www.youtube.com/watch?v=${lecture.videoId}` : ''),
    videoTitle: videoTitle || derivedVideo.videoTitle,
    topicName: fallbackTopic,
    transcriptSummary: lecture?.transcriptSummary || '',
    topicOverview: lecture?.topicOverview || '',
    expertInsight: lecture?.expertInsight || '',
    quizQuestions: lecture?.quizQuestions || [],
    keyPoints: taskTopics.slice(0, 6),
    estimatedMinutes: task?.estimatedMinutes ?? 0,
    topicsCovered: taskTopics.length > 0 ? taskTopics : [fallbackTopic],
    practiceNote: task?.description || task?.notes || `Practice the core ideas from ${fallbackTopic}.`,
    sessionGoal: `By the end of this session, you should be able to explain ${fallbackTopic}.`,
    warning: lectureResult.status === 'rejected' || todaysTasksResult.status === 'rejected'
      ? 'Some session materials failed to load'
      : undefined,
    materialsLoaded: lectureResult.status === 'fulfilled' && todaysTasksResult.status === 'fulfilled',
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
