import axios from 'axios';
import prisma from '../db/client';
import { fetchTranscript } from './transcript.service';

export type LectureQuizQuestion = {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
};

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = 'llama3-70b-8192';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

async function ensureLectureRecord(videoId: string, taskId?: string) {
  await prisma.lectureSummary.upsert({
    where: { videoId },
    update: taskId ? { taskId } : {},
    create: {
      videoId,
      taskId,
    },
  });
}

async function callGroq(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) {
    console.warn('[lectureSummary.service] GROQ_API_KEY missing');
    return 'Summary is unavailable right now because Groq API is not configured.';
  }

  const response = await axios.post<GroqChatResponse>(
    `${GROQ_BASE_URL}/chat/completions`,
    {
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data.choices?.[0]?.message?.content?.trim() || '';
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn('[lectureSummary.service] GEMINI_API_KEY missing');
    return 'Insight is unavailable right now because Gemini API is not configured.';
  }

  const response = await axios.post<GeminiGenerateResponse>(
    `${GEMINI_BASE_URL}/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

function extractJsonArray(text: string): string {
  const trimmed = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');

  if (firstBracket === -1 || lastBracket === -1 || lastBracket < firstBracket) {
    return '[]';
  }

  return trimmed.slice(firstBracket, lastBracket + 1);
}

function normalizeQuizQuestions(input: unknown): LectureQuizQuestion[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const raw = item as Record<string, unknown>;
      const options = raw.options as Record<string, unknown> | undefined;
      const correct = String(raw.correct || '').toUpperCase();

      if (!options || !['A', 'B', 'C', 'D'].includes(correct)) {
        return null;
      }

      return {
        question: String(raw.question || '').trim(),
        options: {
          A: String(options.A || '').trim(),
          B: String(options.B || '').trim(),
          C: String(options.C || '').trim(),
          D: String(options.D || '').trim(),
        },
        correct: correct as LectureQuizQuestion['correct'],
        explanation: String(raw.explanation || '').trim(),
      };
    })
    .filter((question): question is LectureQuizQuestion => {
      if (!question) {
        return false;
      }

      return (
        Boolean(question.question) &&
        Boolean(question.options.A) &&
        Boolean(question.options.B) &&
        Boolean(question.options.C) &&
        Boolean(question.options.D) &&
        Boolean(question.explanation)
      );
    });
}

export async function getTranscriptSummary(videoId: string, videoTitle: string, taskId?: string): Promise<string> {
  const existing = await prisma.lectureSummary.findUnique({
    where: { videoId },
    select: { transcriptSummary: true },
  });

  if (existing?.transcriptSummary) {
    return existing.transcriptSummary;
  }

  await ensureLectureRecord(videoId, taskId);

  const transcript = await fetchTranscript(videoId);
  const prompt = transcript
    ? `Here is the transcript of a lecture titled '${videoTitle}'. Summarize exactly what was taught in this lecture, preserving the structure and key points the instructor made. Use sections. Transcript: ${transcript}`
    : `Summarize the topic '${videoTitle}' as if explaining what a typical lecture on this topic would cover. Be detailed and structured with sections.`;

  const summary = await callGroq(prompt);

  await prisma.lectureSummary.update({
    where: { videoId },
    data: {
      transcriptSummary: summary,
    },
  });

  return summary;
}

export async function getTopicOverview(
  videoId: string,
  videoTitle: string,
  topicName: string,
  taskId?: string,
): Promise<string> {
  const existing = await prisma.lectureSummary.findUnique({
    where: { videoId },
    select: { topicOverview: true },
  });

  if (existing?.topicOverview) {
    return existing.topicOverview;
  }

  await ensureLectureRecord(videoId, taskId);

  const prompt = `Give a comprehensive overview of '${topicName}'. Explain what it is, why it matters, key concepts, common use cases, and how it fits into the broader subject area. Write like a knowledgeable teacher explaining to a student seeing this topic for the first time. Lecture title context: '${videoTitle}'.`;
  const overview = await callGroq(prompt);

  await prisma.lectureSummary.update({
    where: { videoId },
    data: {
      topicOverview: overview,
    },
  });

  return overview;
}

export async function getExpertInsight(
  videoId: string,
  videoTitle: string,
  topicName: string,
  taskId?: string,
): Promise<string> {
  const existing = await prisma.lectureSummary.findUnique({
    where: { videoId },
    select: { expertInsight: true },
  });

  if (existing?.expertInsight) {
    return existing.expertInsight;
  }

  await ensureLectureRecord(videoId, taskId);

  const prompt = `In 3-5 sentences, give the single most important insight a student must take away from studying '${topicName}' as covered in '${videoTitle}'. Be specific, not generic. Focus on what most students miss or get wrong.`;
  const insight = await callGemini(prompt);

  await prisma.lectureSummary.update({
    where: { videoId },
    data: {
      expertInsight: insight,
    },
  });

  return insight;
}

export async function getQuizQuestions(
  videoId: string,
  videoTitle: string,
  topicName: string,
  taskId?: string,
): Promise<LectureQuizQuestion[]> {
  const existing = await prisma.lectureSummary.findUnique({
    where: { videoId },
    select: { quizQuestions: true },
  });

  if (Array.isArray(existing?.quizQuestions)) {
    return normalizeQuizQuestions(existing.quizQuestions);
  }

  await ensureLectureRecord(videoId, taskId);

  const prompt = `Generate 5 multiple choice questions to test understanding of '${topicName}' from the lecture '${videoTitle}'. Each question must have 4 options (A/B/C/D) and one correct answer. Return ONLY a JSON array, no other text: [{ question, options: {A,B,C,D}, correct, explanation }]`;

  const rawQuiz = await callGemini(prompt);

  let parsedQuiz: LectureQuizQuestion[] = [];
  try {
    parsedQuiz = normalizeQuizQuestions(JSON.parse(extractJsonArray(rawQuiz)));
  } catch (error) {
    console.error('[lectureSummary.service] Failed to parse quiz JSON:', error);
    parsedQuiz = [];
  }

  await prisma.lectureSummary.update({
    where: { videoId },
    data: {
      quizQuestions: parsedQuiz,
    },
  });

  return parsedQuiz;
}
