import Bytez from '../lib/bytez';
import config from '../config';
import { runGeminiPrompt } from './gemini.service';

export interface VideoSignal {
  score: number;
  reasons: string[];
  viewScore: number;
  engagementScore: number;
  freshnessScore: number;
}

export interface EnrichedVideoFields {
  qualitySignal: VideoSignal;
  contentSummary: string;
  keyConcepts: string[];
  testPrepPoints: string[];
  enrichmentSource: 'youtube-metadata' | 'gemini' | 'bytez-fallback' | 'fallback';
}

export interface VideoSearchRecord {
  id: string;
  title: string;
  channelName?: string;
  thumbnail?: string;
  description?: string;
  topicName?: string;
  subtopicName?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  publishedAt?: string;
}

const BYTEZ_KEY = config.contentIntelligence.bytezApiKey;
const BYTEZ_MODEL = config.contentIntelligence.model;
const bytezSdk = BYTEZ_KEY ? new Bytez(BYTEZ_KEY) : null;

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeCount(value: number | undefined): number {
  if (!value || value <= 0) return 0;
  return Math.log10(value + 1) / 7;
}

function computeFreshnessScore(publishedAt?: string): number {
  if (!publishedAt) return 0.4;

  const published = new Date(publishedAt).getTime();
  if (Number.isNaN(published)) return 0.4;

  const ageMs = Date.now() - published;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays <= 30) return 1;
  if (ageDays <= 180) return 0.85;
  if (ageDays <= 365) return 0.7;
  if (ageDays <= 730) return 0.55;
  return 0.4;
}

export function computeVideoSignal(video: VideoSearchRecord): VideoSignal {
  const views = video.viewCount ?? 0;
  const likes = video.likeCount ?? 0;
  const comments = video.commentCount ?? 0;

  const viewScore = clamp(normalizeCount(views));
  const likeRatio = views > 0 ? likes / views : 0;
  const commentRatio = views > 0 ? comments / views : 0;

  const engagementScore = clamp((normalizeCount(likes) * 0.6) + (normalizeCount(comments) * 0.4) + (likeRatio * 3) + (commentRatio * 10));
  const freshnessScore = computeFreshnessScore(video.publishedAt);

  const score = clamp((viewScore * 0.5) + (engagementScore * 0.35) + (freshnessScore * 0.15));

  const reasons: string[] = [];
  if (views > 50000) reasons.push('High view volume');
  if (likes > 1000 || likeRatio > 0.03) reasons.push('Strong engagement signal');
  if (comments > 100 || commentRatio > 0.003) reasons.push('Healthy discussion/review activity');
  if (freshnessScore >= 0.85) reasons.push('Recent upload');
  if (reasons.length === 0) reasons.push('Balanced baseline quality signal');

  return {
    score,
    reasons,
    viewScore,
    engagementScore,
    freshnessScore,
  };
}

export function rankVideosBySignal<T extends VideoSearchRecord>(videos: T[]): Array<T & { qualitySignal: VideoSignal }> {
  return videos
    .map((video) => ({
      ...video,
      qualitySignal: computeVideoSignal(video),
    }))
    .sort((a, b) => b.qualitySignal.score - a.qualitySignal.score);
}

function cleanModelText(text: string): string {
  return text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
}

function safeParseJson(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(cleanModelText(text)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractList(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function buildDirectSummary(video: VideoSearchRecord): { summary: string; keyConcepts: string[]; testPrepPoints: string[] } | null {
  const description = (video.description || '').trim();
  if (description.length < 60) {
    return null;
  }

  const sentences = description
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const summary = sentences.slice(0, 3).join(' ').trim();
  if (!summary) {
    return null;
  }

  const conceptBase = [video.subtopicName, video.topicName, video.title]
    .map((item) => (item || '').trim())
    .filter(Boolean);

  const keyConcepts = Array.from(new Set(conceptBase)).slice(0, 4);
  const testPrepPoints = [
    `Explain the core idea from "${video.title}" in your own words.`,
    `List 3 practical use-cases for ${video.subtopicName || video.topicName || 'this topic'}.`,
    'Write 5 rapid-fire revision questions from this lesson.',
  ];

  return { summary, keyConcepts, testPrepPoints };
}

function buildModelPrompt(video: VideoSearchRecord): string {
  const topic = video.subtopicName || video.topicName || 'general programming topic';

  return `You are generating study content for a learning planner.
Use the video metadata below to produce learning output.

Video title: ${video.title}
Channel: ${video.channelName || 'Unknown'}
Topic context: ${topic}
Thumbnail URL: ${video.thumbnail || 'N/A'}
Views: ${video.viewCount ?? 0}
Likes: ${video.likeCount ?? 0}
Comments/Reviews: ${video.commentCount ?? 0}
Description: ${video.description || 'N/A'}

Return strict JSON only:
{
  "summary": "4-6 sentence teaching summary of what this video likely teaches",
  "keyConcepts": ["concept1", "concept2", "concept3"],
  "testPrepPoints": ["checkpoint1", "checkpoint2", "checkpoint3"]
}

Keep practical and exam/test-oriented. Avoid hallucinated specifics beyond metadata.`;
}

async function summarizeWithGemini(video: VideoSearchRecord): Promise<{ summary: string; keyConcepts: string[]; testPrepPoints: string[] } | null> {
  if (!config.chatbot.geminiApiKey) {
    return null;
  }

  const { error, output } = await runGeminiPrompt(buildModelPrompt(video));
  if (error || !output) {
    return null;
  }

  const parsed = safeParseJson(output);
  if (!parsed) {
    return null;
  }

  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
  if (!summary) {
    return null;
  }

  return {
    summary,
    keyConcepts: extractList(parsed.keyConcepts, [video.subtopicName || video.topicName || 'Core topic']),
    testPrepPoints: extractList(parsed.testPrepPoints, ['Review the lesson and attempt 5 revision questions.']),
  };
}

async function summarizeWithBytez(video: VideoSearchRecord): Promise<{ summary: string; keyConcepts: string[]; testPrepPoints: string[] } | null> {
  if (!bytezSdk) {
    return null;
  }

  try {
    const model = bytezSdk.model(BYTEZ_MODEL);
    const { error, output } = await model.run([
      {
        role: 'user',
        content: buildModelPrompt(video),
      },
    ]);

    if (error || !output) {
      return null;
    }

    const outputText = typeof output === 'string' ? output : JSON.stringify(output);
    const parsed = safeParseJson(outputText);

    if (!parsed) {
      return null;
    }

    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
    if (!summary) {
      return null;
    }

    return {
      summary,
      keyConcepts: extractList(parsed.keyConcepts, [video.subtopicName || video.topicName || 'Core topic']),
      testPrepPoints: extractList(parsed.testPrepPoints, ['Prepare 3 short test checkpoints from this lesson.']),
    };
  } catch {
    return null;
  }
}

function fallbackSummary(video: VideoSearchRecord): { summary: string; keyConcepts: string[]; testPrepPoints: string[] } {
  const focus = video.subtopicName || video.topicName || 'the scheduled topic';

  return {
    summary: `This lesson is selected for ${focus}. Use the video thumbnail/title context to identify the core explanation sequence, note the main definitions, and capture one worked example before moving to practice.` ,
    keyConcepts: [focus, video.title, 'Applied understanding'].filter(Boolean),
    testPrepPoints: [
      `Write a 5-line summary of ${focus}.`,
      'Create 3 probable test questions from the lesson.',
      'Teach the concept to a peer in under 2 minutes.',
    ],
  };
}

export async function enrichVideoWithContent(video: VideoSearchRecord): Promise<EnrichedVideoFields> {
  const qualitySignal = computeVideoSignal(video);

  const direct = buildDirectSummary(video);
  if (direct) {
    return {
      qualitySignal,
      contentSummary: direct.summary,
      keyConcepts: direct.keyConcepts,
      testPrepPoints: direct.testPrepPoints,
      enrichmentSource: 'youtube-metadata',
    };
  }

  const gemini = await summarizeWithGemini(video);
  if (gemini) {
    return {
      qualitySignal,
      contentSummary: gemini.summary,
      keyConcepts: gemini.keyConcepts,
      testPrepPoints: gemini.testPrepPoints,
      enrichmentSource: 'gemini',
    };
  }

  const bytez = await summarizeWithBytez(video);
  if (bytez) {
    return {
      qualitySignal,
      contentSummary: bytez.summary,
      keyConcepts: bytez.keyConcepts,
      testPrepPoints: bytez.testPrepPoints,
      enrichmentSource: 'bytez-fallback',
    };
  }

  const fallback = fallbackSummary(video);
  return {
    qualitySignal,
    contentSummary: fallback.summary,
    keyConcepts: fallback.keyConcepts,
    testPrepPoints: fallback.testPrepPoints,
    enrichmentSource: 'fallback',
  };
}

export async function enrichVideosBatch<T extends VideoSearchRecord>(
  videos: T[],
  options?: { maxItems?: number },
): Promise<Array<T & EnrichedVideoFields>> {
  const ranked = rankVideosBySignal(videos);
  const maxItems = options?.maxItems ?? 12;

  const result: Array<T & EnrichedVideoFields> = [];

  for (let index = 0; index < ranked.length; index += 1) {
    const video = ranked[index];

    if (index < maxItems) {
      const enriched = await enrichVideoWithContent(video);
      result.push({
        ...(video as T),
        ...enriched,
      });
      continue;
    }

    result.push({
      ...(video as T),
      qualitySignal: video.qualitySignal,
      contentSummary: '',
      keyConcepts: [],
      testPrepPoints: [],
      enrichmentSource: 'fallback',
    });
  }

  return result;
}
