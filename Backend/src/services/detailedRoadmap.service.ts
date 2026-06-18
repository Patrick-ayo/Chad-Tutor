import axios from 'axios';
import { runGeminiPrompt } from './gemini.service';
import { goalRepo, playlistRepo, settingsRepo, taskRepo, withTransaction } from '../repositories';
import { scheduleMultiTopicTasks, type Availability as SchedulerAvailability, type TopicQueue } from './scheduler.service';
import type { Prisma } from '@prisma/client';

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type SessionPhase = 'watch' | 'practice' | 'quiz';

export interface SessionVideo {
  id: string;
  title: string;
  channelName?: string;
  channelId?: string;
  durationSeconds: number;
  url?: string;
  topicName?: string;
  subtopicName?: string;
  playlistId?: string;
  playlistTitle?: string;
}

export interface MiniPractice {
  id: string;
  title: string;
  prompt: string;
  estimatedMinutes: number;
  format: 'recall' | 'worked-example' | 'timed-drill';
  checkpoints: string[];
}

export interface SessionPhaseBlock {
  id: string;
  phase: SessionPhase;
  title: string;
  description: string;
  estimatedMinutes: number;
  videoIds?: string[];
  practice?: MiniPractice;
  quizPrompt?: string;
}

export interface RoadmapSession {
  id: string;
  dayNumber: number;
  label: string;
  title: string;
  topicName: string;
  subtopicName?: string;
  clusterId: string;
  videos: SessionVideo[];
  totalMinutes: number;
  phases: SessionPhaseBlock[];
  keyOutcome: string;
  revisitNotes: string[];
}

export interface RoadmapDay {
  dayNumber: number;
  label: string;
  title: string;
  summary: string;
  focus: string;
  sessions: RoadmapSession[];
  totalMinutes: number;
}

export interface DetailedRoadmap {
  id: string;
  goalId?: string;
  title: string;
  overview: string;
  days: RoadmapDay[];
  totalDays: number;
  totalMinutes: number;
  createdAt: string;
  source: 'groq' | 'gemini' | 'hybrid' | 'fallback';
  availability: {
    activeDays: Weekday[];
    minutesPerDay: Record<Weekday, number>;
  };
  metadata?: Record<string, unknown>;
}

export interface RoadmapVideoInput {
  id: string;
  title: string;
  channelName?: string;
  channelId?: string;
  durationSeconds?: number;
  duration?: string;
  topicId?: string;
  topicName?: string;
  subtopicId?: string;
  subtopicName?: string;
  playlistId?: string;
  playlistTitle?: string;
  videoUrl?: string;
  url?: string;
}

interface PlannerSeedTask {
  id: string;
  taskId: string;
  title: string;
  type: 'learn' | 'practice' | 'quiz' | 'revision';
  topicId: string;
  subtopicClusterId: string;
  scheduledDate: Date;
  deadlineDate: Date;
  estimatedMinutes: number;
  status: 'pending';
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  goalId: string;
  notes?: string;
  videoId?: string;
  videoUrl?: string;
  videoTitle?: string;
  roadmapId?: string;
  subtopicId?: string;
  sequenceNumber?: number;
  keyPoints?: string[];
  learningOutcomes?: string[];
}

interface ClusterSpec {
  clusterName: string;
  clusterGoal: string;
  topicsCovered: string[];
  videoIndexes: number[];
}

interface EnrichedClusterSpec extends ClusterSpec {
  sessionTitle: string;
  sessionGoal: string;
  practiceTitle: string;
  miniPracticeInstructions: string[];
  quizNote: string;
  revisionNote: string;
  primaryConcept: string;
}

export interface GenerateDetailedRoadmapInput {
  userId: string;
  goalId?: string;
  goalName: string;
  topicName: string;
  playlistIds?: string[];
  videos?: RoadmapVideoInput[];
  startDate?: string;
}

export interface GenerateDetailedRoadmapResult {
  roadmap: DetailedRoadmap;
  plannerTasksCreated: number;
  scheduledTasks: number;
  source: DetailedRoadmap['source'];
}

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-70b-8192';

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toWeekday(date: Date): Weekday {
  return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as Weekday;
}

function normalizeAvailability(settings: {
  activeDays?: string[] | null;
  dailyMinutes?: Prisma.JsonValue | null;
} | null | undefined): DetailedRoadmap['availability'] {
  const defaultDays: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const activeDays = Array.isArray(settings?.activeDays)
    ? settings!.activeDays.filter((value): value is Weekday => typeof value === 'string')
    : defaultDays;

  const minutesPerDay: Record<Weekday, number> = {
    monday: 60,
    tuesday: 60,
    wednesday: 60,
    thursday: 60,
    friday: 60,
    saturday: 0,
    sunday: 0,
  };

  if (settings?.dailyMinutes && typeof settings.dailyMinutes === 'object' && !Array.isArray(settings.dailyMinutes)) {
    for (const weekday of Object.keys(minutesPerDay) as Weekday[]) {
      const value = (settings.dailyMinutes as Record<string, unknown>)[weekday];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
        minutesPerDay[weekday] = Math.floor(value);
      }
    }
  }

  return {
    activeDays,
    minutesPerDay,
  };
}

function parseDurationSeconds(video: RoadmapVideoInput): number {
  if (typeof video.durationSeconds === 'number' && Number.isFinite(video.durationSeconds) && video.durationSeconds > 0) {
    return Math.floor(video.durationSeconds);
  }

  if (typeof video.duration === 'string') {
    const match = video.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
    if (match) {
      const hours = Number(match[1] ?? 0);
      const minutes = Number(match[2] ?? 0);
      const seconds = Number(match[3] ?? 0);
      const total = hours * 3600 + minutes * 60 + seconds;
      if (total > 0) {
        return total;
      }
    }
  }

  return 900;
}

function normalizeVideos(videos: RoadmapVideoInput[]): SessionVideo[] {
  const seen = new Set<string>();

  return videos
    .map((video, index) => {
      const id = video.id?.trim() || `video-${index + 1}`;
      const url = video.url || video.videoUrl;
      return {
        id,
        title: video.title?.trim() || `Video ${index + 1}`,
        channelName: video.channelName,
        channelId: video.channelId,
        durationSeconds: parseDurationSeconds(video),
        url,
        topicName: video.topicName,
        subtopicName: video.subtopicName,
        playlistId: video.playlistId,
        playlistTitle: video.playlistTitle,
      } satisfies SessionVideo;
    })
    .filter((video) => {
      if (seen.has(video.id)) {
        return false;
      }

      seen.add(video.id);
      return true;
    });
}

function getVideoMinutes(video: SessionVideo): number {
  return Math.max(8, Math.ceil(video.durationSeconds / 60));
}

function getSessionMinutes(videos: SessionVideo[]): { watch: number; practice: number; quiz: number; total: number } {
  const watch = videos.reduce((sum, video) => sum + getVideoMinutes(video), 0);
  const practice = Math.max(10, Math.round(watch * 0.35));
  const quiz = Math.max(10, Math.round(watch * 0.2));
  return {
    watch,
    practice,
    quiz,
    total: watch + practice + quiz,
  };
}

function cleanText(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function sentenceFromTopics(topicsCovered: string[]): string {
  if (topicsCovered.length === 0) {
    return 'the main ideas in this cluster';
  }

  if (topicsCovered.length === 1) {
    return topicsCovered[0];
  }

  if (topicsCovered.length === 2) {
    return `${topicsCovered[0]} and ${topicsCovered[1]}`;
  }

  return `${topicsCovered.slice(0, -1).join(', ')}, and ${topicsCovered.at(-1)}`;
}

function toConceptTitle(value: string): string {
  return cleanText(value, 'Core concept')
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (character) => character.toUpperCase());
}

function buildFallbackClusters(videos: SessionVideo[]): ClusterSpec[] {
  if (videos.length === 0) {
    return [];
  }

  const clusters: ClusterSpec[] = [];

  for (let index = 0; index < videos.length; index += 3) {
    const slice = videos.slice(index, index + 3);

    if (slice.length === 1 && clusters.length > 0) {
      const previous = clusters[clusters.length - 1];
      previous.videoIndexes = [...previous.videoIndexes, index];
      previous.topicsCovered = [
        ...previous.topicsCovered,
        cleanText(slice[0]?.subtopicName || slice[0]?.topicName || slice[0]?.title, `Video ${index + 1}`),
      ];
      previous.clusterGoal = `${previous.clusterGoal}; connect it to ${previous.topicsCovered.at(-1)}`;
      continue;
    }

    const titles = slice.map((video, offset) => cleanText(video.subtopicName || video.topicName || video.title, `Video ${index + offset + 1}`));
    clusters.push({
      clusterName: toConceptTitle(titles[0] || `Cluster ${clusters.length + 1}`),
      clusterGoal: `Master ${sentenceFromTopics(titles)}`,
      topicsCovered: titles,
      videoIndexes: slice.map((_, offset) => index + offset),
    });
  }

  if (clusters.length > 1) {
    const last = clusters[clusters.length - 1];
    if (last.videoIndexes.length === 1) {
      const previous = clusters[clusters.length - 2];
      previous.videoIndexes = [...previous.videoIndexes, ...last.videoIndexes];
      previous.topicsCovered = [...previous.topicsCovered, ...last.topicsCovered];
      previous.clusterGoal = `${previous.clusterGoal}; include ${last.clusterName}`;
      clusters.pop();
    }
  }

  return clusters;
}

function parseClusterSpecs(raw: string): ClusterSpec[] | null {
  const json = extractJson(raw);
  if (!json) {
    return null;
  }

  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const clusters = parsed
      .map((entry, index) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          return null;
        }

        const cluster = entry as Record<string, unknown>;
        const clusterName = typeof cluster.clusterName === 'string' ? cluster.clusterName : null;
        const clusterGoal = typeof cluster.clusterGoal === 'string' ? cluster.clusterGoal : null;
        const topicsCovered = Array.isArray(cluster.topicsCovered)
          ? cluster.topicsCovered.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          : [];
        const videoIndexes = Array.isArray(cluster.videoIndexes)
          ? cluster.videoIndexes.filter((value): value is number => typeof value === 'number' && Number.isInteger(value))
          : [];

        if (!clusterName || !clusterGoal || videoIndexes.length === 0) {
          return null;
        }

        return {
          clusterName,
          clusterGoal,
          topicsCovered: topicsCovered.length > 0 ? topicsCovered : [clusterName],
          videoIndexes: Array.from(new Set(videoIndexes)).sort((a, b) => a - b),
        } satisfies ClusterSpec;
      })
      .filter((value): value is ClusterSpec => Boolean(value));

    return clusters.length > 0 ? clusters : null;
  } catch {
    return null;
  }
}

function normalizeClusterSpecs(clusters: ClusterSpec[], totalVideos: number): ClusterSpec[] {
  if (totalVideos === 0) {
    return [];
  }

  const ordered = clusters
    .map((cluster) => ({
      ...cluster,
      videoIndexes: Array.from(new Set(cluster.videoIndexes.filter((index) => index >= 0 && index < totalVideos))).sort((a, b) => a - b),
    }))
    .filter((cluster) => cluster.videoIndexes.length > 0)
    .sort((a, b) => a.videoIndexes[0] - b.videoIndexes[0]);

  const assigned = new Set<number>();
  const nextClusters: ClusterSpec[] = [];

  for (const cluster of ordered) {
    const mergedIndexes = cluster.videoIndexes.filter((index) => !assigned.has(index));
    if (mergedIndexes.length === 0) {
      continue;
    }

    for (const index of mergedIndexes) {
      assigned.add(index);
    }

    nextClusters.push({
      ...cluster,
      videoIndexes: mergedIndexes,
    });
  }

  for (let index = 0; index < totalVideos; index += 1) {
    if (assigned.has(index)) {
      continue;
    }

    const target = nextClusters[nextClusters.length - 1];
    if (target) {
      target.videoIndexes = [...target.videoIndexes, index].sort((a, b) => a - b);
      target.topicsCovered = Array.from(new Set([...target.topicsCovered, cleanText(String(index), `Video ${index + 1}`)]));
      assigned.add(index);
    }
  }

  const balanced: ClusterSpec[] = [];

  for (const cluster of nextClusters) {
    const sortedIndexes = [...cluster.videoIndexes].sort((a, b) => a - b);

    let cursor = 0;
    while (cursor < sortedIndexes.length) {
      const chunk = sortedIndexes.slice(cursor, cursor + 4);
      cursor += 4;

      if (chunk.length === 1 && balanced.length > 0) {
        const previous = balanced[balanced.length - 1];
        previous.videoIndexes = [...previous.videoIndexes, ...chunk].sort((a, b) => a - b);
        previous.topicsCovered = Array.from(new Set([...previous.topicsCovered, ...cluster.topicsCovered]));
        previous.clusterGoal = `${previous.clusterGoal}; extend into ${cluster.clusterName}`;
        continue;
      }

      if (chunk.length === 1) {
        balanced.push({
          ...cluster,
          videoIndexes: chunk,
        });
        continue;
      }

      balanced.push({
        ...cluster,
        videoIndexes: chunk,
      });
    }
  }

  return balanced;
}

async function clusterVideosWithGroq(topicName: string, videos: SessionVideo[]): Promise<ClusterSpec[]> {
  if (videos.length === 0) {
    return [];
  }

  if (!GROQ_API_KEY) {
    return buildFallbackClusters(videos);
  }

  const numberedTitles = videos
    .map((video, index) => `${index + 1}. ${video.title}`)
    .join('\n');

  const prompt = [
    `Given these YouTube video titles from a playlist about '${topicName}':`,
    numberedTitles,
    '',
    'Group them into logical subtopic clusters.',
    'Rules:',
    '- Each cluster MUST have 2-4 videos minimum',
    '- Group by shared concept, not arbitrary count',
    '- Keep original video order within clusters',
    "- Cluster name must be specific (NOT 'Introduction' or 'Basics' — YES 'Express Routing and Middleware')",
    '- Never create a cluster with only 1 video',
    '- Merge lone videos into the nearest related cluster',
    '',
    'Return ONLY JSON, no other text:',
    '[{',
    '  clusterName: string,',
    '  clusterGoal: string,',
    '  topicsCovered: string[],',
    '  videoIndexes: number[]',
    '}]',
  ].join('\n');

  try {
    const response = await axios.post(
      `${GROQ_BASE_URL}/chat/completions`,
      {
        model: GROQ_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'You are a roadmap clustering assistant. Return JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return buildFallbackClusters(videos);
    }

    const parsed = parseClusterSpecs(content);
    if (!parsed) {
      return buildFallbackClusters(videos);
    }

    const normalized = normalizeClusterSpecs(parsed, videos.length);
    return normalized.length > 0 ? normalized : buildFallbackClusters(videos);
  } catch (error) {
    console.warn('[detailedRoadmap] Groq clustering failed:', error instanceof Error ? error.message : error);
    return buildFallbackClusters(videos);
  }
}

function buildEnrichmentFallback(topicName: string, cluster: ClusterSpec): EnrichedClusterSpec {
  const primaryConcept = toConceptTitle(cluster.topicsCovered[0] || cluster.clusterName || topicName);
  const sessionTitle = `${toConceptTitle(cluster.clusterName)} — ${primaryConcept}`;
  const sessionGoal = `By the end of this session, you will be able to ${cluster.clusterGoal.toLowerCase()}`;
  const topicSentence = sentenceFromTopics(cluster.topicsCovered);

  return {
    ...cluster,
    sessionTitle,
    sessionGoal,
    practiceTitle: `Mini practice: ${primaryConcept}`,
    miniPracticeInstructions: cluster.topicsCovered.map((topic, index) => {
      const specificConcept = toConceptTitle(topic);
      const practiceTypes: Array<'flashcard' | 'coding' | 'written' | 'mcq'> = ['flashcard', 'coding', 'written', 'mcq'];
      const practiceType = practiceTypes[index % practiceTypes.length];

      if (practiceType === 'flashcard') {
        return `Write 5 flashcards for ${specificConcept}. Include a definition, one example, and one common mistake.`;
      }

      if (practiceType === 'coding') {
        return `Write a small implementation that demonstrates ${specificConcept}. Example: build a function or component that uses the idea correctly.`;
      }

      if (practiceType === 'written') {
        return `In your own words, explain ${specificConcept} and describe when you would use it. Give 1 real example.`;
      }

      return `Answer these mentally: 1. What does ${specificConcept} do? 2. When would you use it instead of a simpler approach? 3. What breaks if you skip it?`;
    }),
    quizNote: `5 questions covering: ${cluster.topicsCovered.join(', ')}`,
    revisionNote: `In this cluster you covered: ${topicSentence}. Key things to remember: ${cluster.topicsCovered.slice(0, 3).map((item) => toConceptTitle(item)).join(', ')}. Common mistake: treating ${primaryConcept.toLowerCase()} as a generic topic instead of the specific concept it is.`,
    primaryConcept,
  };
}

function parseEnrichmentSpecs(raw: string): EnrichedClusterSpec[] | null {
  const json = extractJson(raw);
  if (!json) {
    return null;
  }

  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const items = parsed
      .map((entry) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          return null;
        }

        const item = entry as Record<string, unknown>;
        const miniPracticeInstructions = Array.isArray(item.miniPracticeInstructions)
          ? item.miniPracticeInstructions.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          : [];

        const clusterName = typeof item.clusterName === 'string' ? item.clusterName : null;
        const clusterGoal = typeof item.clusterGoal === 'string' ? item.clusterGoal : null;
        const topicsCovered = Array.isArray(item.topicsCovered)
          ? item.topicsCovered.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
          : [];
        const videoIndexes = Array.isArray(item.videoIndexes)
          ? item.videoIndexes.filter((value): value is number => typeof value === 'number' && Number.isInteger(value))
          : [];
        const sessionTitle = typeof item.sessionTitle === 'string' ? item.sessionTitle : null;
        const sessionGoal = typeof item.sessionGoal === 'string' ? item.sessionGoal : null;
        const practiceTitle = typeof item.practiceTitle === 'string' ? item.practiceTitle : null;
        const quizNote = typeof item.quizNote === 'string' ? item.quizNote : null;
        const revisionNote = typeof item.revisionNote === 'string' ? item.revisionNote : null;
        const primaryConcept = typeof item.primaryConcept === 'string' ? item.primaryConcept : null;

        if (
          !clusterName ||
          !clusterGoal ||
          !sessionTitle ||
          !sessionGoal ||
          !practiceTitle ||
          !quizNote ||
          !revisionNote ||
          !primaryConcept ||
          videoIndexes.length === 0
        ) {
          return null;
        }

        return {
          clusterName,
          clusterGoal,
          topicsCovered: topicsCovered.length > 0 ? topicsCovered : [primaryConcept],
          videoIndexes: Array.from(new Set(videoIndexes)).sort((a, b) => a - b),
          sessionTitle,
          sessionGoal,
          practiceTitle,
          miniPracticeInstructions: miniPracticeInstructions.length > 0 ? miniPracticeInstructions : [clusterGoal],
          quizNote,
          revisionNote,
          primaryConcept,
        } satisfies EnrichedClusterSpec;
      })
      .filter((value): value is EnrichedClusterSpec => Boolean(value));

    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

async function enrichClustersWithGroq(topicName: string, clusters: ClusterSpec[], videos: SessionVideo[]): Promise<EnrichedClusterSpec[]> {
  if (clusters.length === 0) {
    return [];
  }

  if (!GROQ_API_KEY) {
    return clusters.map((cluster) => buildEnrichmentFallback(topicName, cluster));
  }

  const prompt = [
    `You are refining detailed roadmap clusters for a YouTube playlist about '${topicName}'.`,
    '',
    'For each cluster below, return a richer JSON object that keeps the same clusterName, clusterGoal, topicsCovered, and videoIndexes, but adds:',
    '- sessionTitle: "{ClusterName} — {primary concept}"',
    '- sessionGoal: "By the end of this session, you will be able to {specific skill}: {specific example}"',
    '- practiceTitle: a short label for the mini practice',
    '- miniPracticeInstructions: an array of 2-4 short instructions, each tied to a specific concept from the cluster videos',
    '- quizNote: "5 questions covering: {topicsCovered.join(', ')}"',
    '- revisionNote: a proper recap with the covered topics, 2-3 key reminders, and one specific common mistake',
    '- primaryConcept: the main concept the cluster teaches',
    '',
    'Rules:',
    '- Every miniPractice instruction must mention a specific concept from the cluster, not the whole topic.',
    '- Vary the miniPractice instructions so they are not repetitive.',
    '- Never reuse generic text like "reinforce {topic}".',
    '- Keep each miniPractice instruction to at most 2 sentences.',
    '- Keep the quizNote specific to the cluster topics, not the overall topic.',
    '- Keep the sessionGoal specific and outcome-based.',
    '',
    'Return ONLY JSON, no explanation.',
    JSON.stringify(clusters.map((cluster, index) => ({
      ...cluster,
      videos: cluster.videoIndexes.map((videoIndex) => ({
        index: videoIndex + 1,
        title: videos[videoIndex]?.title,
      })),
      clusterOrder: index + 1,
    })), null, 2),
  ].join('\n');

  try {
    const response = await axios.post(
      `${GROQ_BASE_URL}/chat/completions`,
      {
        model: GROQ_MODEL,
        temperature: 0.35,
        messages: [
          {
            role: 'system',
            content: 'You enrich roadmap clusters. Return JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return clusters.map((cluster) => buildEnrichmentFallback(topicName, cluster));
    }

    const parsed = parseEnrichmentSpecs(content);
    if (!parsed) {
      return clusters.map((cluster) => buildEnrichmentFallback(topicName, cluster));
    }

    const bySignature = new Map(parsed.map((item) => [item.videoIndexes.join(','), item]));
    return clusters.map((cluster) => {
      const enriched = bySignature.get(cluster.videoIndexes.join(','));
      return enriched ?? buildEnrichmentFallback(topicName, cluster);
    });
  } catch (error) {
    console.warn('[detailedRoadmap] Groq enrichment failed:', error instanceof Error ? error.message : error);
    return clusters.map((cluster) => buildEnrichmentFallback(topicName, cluster));
  }
}

function buildTopicLabel(goalName: string, topicName: string, videos: SessionVideo[]): string {
  const candidate = videos[0]?.topicName || videos[0]?.subtopicName || topicName || goalName;
  return candidate.trim().length > 0 ? candidate : goalName;
}

function buildSessionTitle(topicLabel: string, videos: SessionVideo[]): string {
  const firstTitle = videos[0]?.title;
  if (videos.length === 1 && firstTitle) {
    return firstTitle;
  }

  if (videos.length > 1) {
    return `${topicLabel}: ${videos.length} video cluster`;
  }

  return topicLabel;
}

function buildRoadmapFromClusters(input: GenerateDetailedRoadmapInput, availability: DetailedRoadmap['availability'], clusters: EnrichedClusterSpec[], videos: SessionVideo[]): DetailedRoadmap {
  const days: RoadmapDay[] = clusters.map((cluster, index) => {
    const dayNumber = index + 1;
    const clusterVideos = cluster.videoIndexes.map((videoIndex) => videos[videoIndex]).filter((video): video is SessionVideo => Boolean(video));
    const minutes = getSessionMinutes(clusterVideos);
    const topicLabel = buildTopicLabel(input.goalName, input.topicName, clusterVideos);
    const title = cleanText(cluster.sessionTitle, `${toConceptTitle(cluster.clusterName)} — ${topicLabel}`);
    const sessionId = `day-${dayNumber}-session-1`;
    const clusterId = `cluster-${dayNumber}`;
    const practicePrompt = cluster.miniPracticeInstructions.length > 0
      ? cluster.miniPracticeInstructions.join(' ')
      : `Solve focused drills on ${cluster.primaryConcept}.`;
    const quizPrompt = cluster.quizNote;
    const revisionNote = cluster.revisionNote;
    const phases: SessionPhaseBlock[] = [
      {
        id: `${sessionId}-watch`,
        phase: 'watch',
        title: `Watch ${cluster.clusterName}`,
        description: `Watch ${clusterVideos.length} video${clusterVideos.length === 1 ? '' : 's'} covering ${sentenceFromTopics(cluster.topicsCovered)}.`,
        estimatedMinutes: minutes.watch,
        videoIds: clusterVideos.map((video) => video.id),
      },
      {
        id: `${sessionId}-practice`,
        phase: 'practice',
        title: cluster.practiceTitle,
        description: practicePrompt,
        estimatedMinutes: minutes.practice,
        videoIds: clusterVideos.map((video) => video.id),
        practice: {
          id: `${sessionId}-practice-mini`,
          title: cluster.practiceTitle,
          prompt: practicePrompt,
          estimatedMinutes: minutes.practice,
          format: cluster.miniPracticeInstructions.length > 1 ? 'worked-example' : 'timed-drill',
          checkpoints: [
            ...cluster.topicsCovered.slice(0, 3).map((topic) => toConceptTitle(topic)),
          ],
        },
      },
      {
        id: `${sessionId}-quiz`,
        phase: 'quiz',
        title: `Full quiz: ${cluster.clusterName}`,
        description: quizPrompt,
        estimatedMinutes: minutes.quiz,
        videoIds: clusterVideos.map((video) => video.id),
        quizPrompt,
      },
    ];

    return {
      dayNumber,
      label: `Day ${dayNumber}`,
      title,
      summary: cleanText(cluster.sessionGoal, `Build confidence in ${topicLabel} with a single back-to-back session.`),
      focus: cluster.primaryConcept,
      totalMinutes: minutes.total,
      sessions: [
        {
          id: sessionId,
          dayNumber,
          label: `Day ${dayNumber}`,
          title,
          topicName: topicLabel,
          subtopicName: clusterVideos[0]?.subtopicName,
          clusterId,
          videos: clusterVideos,
          totalMinutes: minutes.total,
          phases,
          keyOutcome: cleanText(cluster.sessionGoal, `By the end of this session, you will be able to apply ${cluster.clusterName.toLowerCase()}.`),
          revisitNotes: [revisionNote],
        },
      ],
    };
  });

  const totalMinutes = days.reduce((sum, day) => sum + day.totalMinutes, 0);

  return {
    id: `detailed-${input.goalId ?? Date.now()}`,
    goalId: input.goalId,
    title: `${input.goalName} - Detailed Roadmap`,
    overview: `A day-by-day learning path for ${input.goalName} built around watch, practice, and quiz sessions with cluster-specific practice and revision.`,
    days,
    totalDays: days.length,
    totalMinutes,
    createdAt: new Date().toISOString(),
    source: 'fallback',
    availability,
    metadata: {
      goalName: input.goalName,
      topicName: input.topicName,
      videoCount: videos.length,
      clusterCount: clusters.length,
    },
  };
}

function extractJson(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return null;
}

async function refineWithGroq(roadmap: DetailedRoadmap): Promise<Partial<DetailedRoadmap> | null> {
  if (!GROQ_API_KEY) {
    return null;
  }

  try {
    const response = await axios.post(
      `${GROQ_BASE_URL}/chat/completions`,
      {
        model: GROQ_MODEL,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You refine roadmap copy. Return JSON only. Keep the exact day count, day numbers, session count, and watch->practice->quiz order.',
          },
          {
            role: 'user',
            content: `Refine this roadmap into a clearer learning plan without changing its structure. Return JSON with optional title, overview, and per-day title/summary/focus updates only. Roadmap JSON: ${JSON.stringify(roadmap)}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return null;
    }

    const json = extractJson(content);
    if (!json) {
      return null;
    }

    const parsed = JSON.parse(json) as Partial<DetailedRoadmap>;
    return parsed;
  } catch (error) {
    console.warn('[detailedRoadmap] Groq refinement failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

async function refineOverviewWithGemini(roadmap: DetailedRoadmap): Promise<string | null> {
  const prompt = [
    'Write a concise 2-3 sentence overview for this detailed roadmap.',
    'Mention that each day follows watch -> practice -> quiz back to back.',
    'Keep it motivational but practical.',
    `Roadmap JSON: ${JSON.stringify(roadmap)}`,
  ].join('\n');

  const { error, output } = await runGeminiPrompt(prompt);
  if (error || !output.trim()) {
    return null;
  }

  return output.trim();
}

function mergeRefinements(base: DetailedRoadmap, groqRefinement: Partial<DetailedRoadmap> | null, geminiOverview: string | null): DetailedRoadmap {
  const next: DetailedRoadmap = {
    ...base,
    source: groqRefinement ? (geminiOverview ? 'hybrid' : 'groq') : (geminiOverview ? 'gemini' : base.source),
    title: groqRefinement?.title?.trim() || base.title,
    overview: geminiOverview || groqRefinement?.overview?.trim() || base.overview,
    days: base.days.map((day) => {
      const refinedDay = groqRefinement?.days?.find?.((candidate) => candidate?.dayNumber === day.dayNumber) as
        | Partial<RoadmapDay>
        | undefined;

      if (!refinedDay) {
        return day;
      }

      return {
        ...day,
        title: refinedDay.title?.trim() || day.title,
        summary: refinedDay.summary?.trim() || day.summary,
        focus: refinedDay.focus?.trim() || day.focus,
      };
    }),
  };

  return next;
}

function buildPlannerQueues(
  roadmap: DetailedRoadmap,
  goalId: string,
  startDate: Date,
): TopicQueue[] {
  return roadmap.days.map((day) => {
    const session = day.sessions[0];
    const deadlineDate = addDays(startOfDay(startDate), Math.max(0, day.dayNumber - 1));
    const tasks: PlannerSeedTask[] = session.phases.map((phase, index) => ({
      id: `${session.id}-${phase.phase}`,
      taskId: `${session.id}-${phase.phase}`,
      title: phase.title,
      type: phase.phase === 'watch' ? 'learn' : phase.phase,
      topicId: session.clusterId,
      subtopicClusterId: session.clusterId,
      scheduledDate: startOfDay(deadlineDate),
      deadlineDate,
      estimatedMinutes: phase.estimatedMinutes,
      status: 'pending',
      priority: phase.phase === 'watch' ? 'high' : 'medium',
      dependencies: index > 0 ? [`${session.id}-${session.phases[index - 1].phase}`] : [],
      goalId,
      notes: phase.description,
      videoId: session.videos[0]?.id,
      videoUrl: session.videos[0]?.url,
      videoTitle: session.videos[0]?.title,
      roadmapId: roadmap.id,
      subtopicId: phase.phase,
      sequenceNumber: (day.dayNumber - 1) * 3 + index + 1,
      keyPoints: session.videos.map((video) => video.title).slice(0, 4),
      learningOutcomes: [session.keyOutcome],
    }));

    const totalMinutes = tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);

    return {
      topicId: session.clusterId,
      deadlineDate,
      tasks,
      totalMinutes,
      remainingMinutes: totalMinutes,
      burnRate: undefined,
    } satisfies TopicQueue;
  });
}

function toPriority(taskType: SessionPhase | 'learn'): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (taskType === 'watch' || taskType === 'learn') {
    return 'HIGH';
  }

  if (taskType === 'practice') {
    return 'MEDIUM';
  }

  return 'MEDIUM';
}

function mapScheduledTaskToCreateInput(params: {
  userId: string;
  goalId: string;
  task: PlannerSeedTask;
}): Prisma.StudyTaskCreateManyInput {
  const scheduledDate = params.task.scheduledDate ? new Date(params.task.scheduledDate) : new Date();

  return {
    userId: params.userId,
    goalId: params.goalId,
    title: params.task.title,
    description: params.task.notes,
    scheduledDate,
    estimatedMinutes: params.task.estimatedMinutes,
    priority: toPriority(params.task.type as SessionPhase),
    keyPoints: Array.isArray(params.task.keyPoints) ? (params.task.keyPoints as Prisma.InputJsonValue) : undefined,
    learningOutcomes: Array.isArray(params.task.learningOutcomes) ? (params.task.learningOutcomes as Prisma.InputJsonValue) : undefined,
    roadmapId: params.task.roadmapId,
    topicId: params.task.topicId,
    subtopicId: params.task.subtopicId,
    duration: params.task.estimatedMinutes,
    sequenceNumber: params.task.sequenceNumber,
    videoId: params.task.videoId,
    videoUrl: params.task.videoUrl,
    videoTitle: params.task.videoTitle,
  };
}

async function loadPlaylistVideos(userId: string, playlistIds: string[]): Promise<RoadmapVideoInput[]> {
  const playlists = await Promise.all(
    playlistIds.map((playlistId) => playlistRepo.findById(playlistId, userId)),
  );

  const videos: RoadmapVideoInput[] = [];

  for (const playlist of playlists) {
    if (!playlist) {
      continue;
    }

    for (const item of playlist.items) {
      videos.push({
        id: item.externalId || `${playlist.id}:${item.sequence}`,
        title: item.title,
        durationSeconds: Math.max(1, (item.estimatedMinutes ?? 15) * 60),
        topicName: playlist.name,
        playlistId: playlist.id,
        playlistTitle: playlist.name,
        videoUrl: item.externalUrl ?? undefined,
      });
    }
  }

  return videos;
}

function dedupeVideos(videos: RoadmapVideoInput[]): RoadmapVideoInput[] {
  const seen = new Set<string>();
  return videos.filter((video) => {
    const key = video.id || video.title;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function generateDetailedRoadmapForUser(input: GenerateDetailedRoadmapInput): Promise<GenerateDetailedRoadmapResult> {
  const goal = input.goalId ? await goalRepo.findById(input.goalId, input.userId) : null;
  const settings = await settingsRepo.findByUserId(input.userId);
  const availability = normalizeAvailability(settings as { activeDays?: string[] | null; dailyMinutes?: Prisma.JsonValue | null } | null);
  const startDate = input.startDate ? new Date(input.startDate) : new Date();

  const playlistVideos = input.playlistIds && input.playlistIds.length > 0
    ? await loadPlaylistVideos(input.userId, input.playlistIds)
    : [];

  const videoSource = dedupeVideos([...(input.videos ?? []), ...playlistVideos]);
  const goalName = goal?.name?.trim() || input.goalName.trim() || input.topicName.trim() || 'Learning Goal';
  const topicName = input.topicName.trim() || goalName;

  const videos = normalizeVideos(videoSource);

  // Step 1: cluster videos by concept (Groq -> fallback)
  const rawClusters = await clusterVideosWithGroq(topicName, videos);

  // Step 2: enrich clusters with targeted practice/quiz/revision (Groq -> fallback)
  const enrichedClusters = await enrichClustersWithGroq(topicName, rawClusters, videos);

  // Step 3: build roadmap days from enriched clusters
  const roadmap = buildRoadmapFromClusters(
    {
      ...input,
      goalName,
      topicName,
      videos: videoSource,
    },
    availability,
    enrichedClusters,
    videos,
  );

  let plannerTasksCreated = 0;
  let scheduledTasks = 0;

  if (input.goalId) {
    const topicQueues = buildPlannerQueues(roadmap, input.goalId, startDate);
    const scheduled = scheduleMultiTopicTasks(topicQueues, availability as SchedulerAvailability, startDate) as Array<PlannerSeedTask>;
    const createInputs = scheduled.map((task) => mapScheduledTaskToCreateInput({
      userId: input.userId,
      goalId: input.goalId!,
      task,
    }));

    await withTransaction(async (tx) => {
      await tx.goal.updateMany({
        where: { id: input.goalId!, userId: input.userId },
        data: {
          detailedRoadmap: roadmap as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.studyTask.deleteMany({
        where: {
          userId: input.userId,
          goalId: input.goalId!,
          status: {
            not: 'COMPLETED',
          },
        },
      });

      const existingTasks = await tx.studyTask.findMany({
        where: {
          userId: input.userId,
          goalId: input.goalId!,
        },
      });

      const existingKeys = new Set(
        existingTasks.map((t) => {
          const dateStr = t.scheduledDate instanceof Date
            ? t.scheduledDate.toISOString().split('T')[0]
            : new Date(t.scheduledDate).toISOString().split('T')[0];
          return `${t.topicId || ''}-${t.subtopicId || ''}-${dateStr}`;
        }),
      );

      const newInputs = createInputs.filter((item) => {
        const dateStr = item.scheduledDate instanceof Date
          ? item.scheduledDate.toISOString().split('T')[0]
          : new Date(item.scheduledDate).toISOString().split('T')[0];
        const key = `${item.topicId || ''}-${item.subtopicId || ''}-${dateStr}`;
        return !existingKeys.has(key);
      });

      if (newInputs.length > 0) {
        const result = await tx.studyTask.createMany({
          data: newInputs,
        });
        plannerTasksCreated = result.count;
      }
    });

    scheduledTasks = scheduled.length;
  }

  return {
    roadmap,
    plannerTasksCreated,
    scheduledTasks,
    source: roadmap.source,
  };
}
