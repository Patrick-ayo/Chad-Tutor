import type { MissedTaskResolutionType, PlannerData } from '@/types/planner';

interface PlannerResponse {
  planner: PlannerData;
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

export async function fetchPlannerSnapshot(): Promise<PlannerData> {
  const response = await fetch('/api/planner', {
    credentials: 'include',
  });

  const payload = await parseJson<PlannerResponse>(response);
  return payload.planner;
}

export async function resolveMissedTask(
  taskId: string,
  type: MissedTaskResolutionType
): Promise<void> {
  const response = await fetch(`/api/planner/resolve/${taskId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ type }),
  });

  await parseJson<{ result: unknown }>(response);
}

export async function generateScheduleFromPlaylists(
  playlistIds: string[],
  startDate?: string
): Promise<{ createdCount: number }> {
  const response = await fetch('/api/planner/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ playlistIds, startDate }),
  });

  const payload = await parseJson<{ result: { createdCount: number } }>(response);
  return payload.result;
}

export async function ingestPlaylist(input: {
  name: string;
  externalSource: string;
  externalId?: string;
  externalUrl?: string;
  items: PlaylistItemInput[];
}): Promise<{ id: string; name: string }> {
  const response = await fetch('/api/playlists/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  const payload = await parseJson<{ playlist: { id: string; name: string } }>(response);
  return payload.playlist;
}

export async function fetchPlaylists(): Promise<Array<{ id: string; name: string }>> {
  const response = await fetch('/api/playlists', {
    credentials: 'include',
  });

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
  const response = await fetch(`/api/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input ?? {}),
  });

  await parseJson<{ task: unknown }>(response);
}

export async function clearPlannerData(confirmationText: string): Promise<void> {
  const response = await fetch('/api/planner/clear', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ confirmationText }),
  });

  await parseJson<{ result: unknown }>(response);
}

export async function generateSessionQuiz(input: {
  topic: string;
  questionCount?: number;
  videoId?: string;
  videoTitle?: string;
  videoSummary?: string;
  keyConcepts?: string[];
}): Promise<SessionQuizQuestion[]> {
  const response = await fetch('/api/ai/generate-session-quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      ...input,
      questionCount: Math.max(1, Math.min(10, input.questionCount ?? 10)),
    }),
  });

  const payload = await parseJson<{ questions?: SessionQuizQuestion[] }>(response);
  const questions = Array.isArray(payload.questions) ? payload.questions : [];

  return questions.slice(0, 10);
}
