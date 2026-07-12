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

import { runGeminiPrompt } from './gemini.service';

async function callGemini(prompt: string, userKey?: string): Promise<string> {
  const { error, output } = await runGeminiPrompt(prompt, userKey);
  if (error) {
    console.error('[lectureSummary.service] Gemini error:', error);
    return 'Insight is unavailable right now due to an AI service error.';
  }
  return output.trim();
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

function extractJsonObject(text: string): string {
  const trimmed = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return '{}';
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
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

export async function getTranscriptSummary(videoId: string, videoTitle: string, taskId?: string, userKey?: string): Promise<string> {
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
  userKey?: string,
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
  userKey?: string,
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
  const insight = await callGemini(prompt, userKey);

  await prisma.lectureSummary.update({
    where: { videoId },
    data: {
      expertInsight: insight,
    },
  });

  return insight;
}

export async function getStructuredNotes(
  videoId: string,
  videoTitle: string,
  topicName: string,
  taskId?: string,
  userKey?: string,
): Promise<string> {
  const existing = await prisma.lectureSummary.findUnique({
    where: { videoId },
    select: { structuredNotes: true },
  });

  if (existing?.structuredNotes) {
    return existing.structuredNotes;
  }

  await ensureLectureRecord(videoId, taskId);

  const transcriptPromise = fetchTranscript(videoId);
  
  // Fetch video description from YouTube API if possible
  let description = '';
  try {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
    if (YOUTUBE_API_KEY && !videoId.includes('-')) { // Basic check to avoid calling YT API with a UUID taskId
      const videoRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          id: videoId,
          key: YOUTUBE_API_KEY,
          part: 'snippet'
        }
      });
      if (videoRes.data?.items?.[0]?.snippet?.description) {
        description = videoRes.data.items[0].snippet.description;
      }
    }
  } catch (err) {
    console.error('Failed to fetch video description for notes:', err);
  }

  const transcript = await transcriptPromise;
  
  let taskContext = '';
  if (taskId) {
    const studyTask = await prisma.studyTask.findUnique({
      where: { id: taskId }
    });
    if (studyTask) {
      taskContext = `
Task Title: ${studyTask.title}
Key Points to Cover: ${JSON.stringify(studyTask.keyPoints || [])}
Learning Outcomes: ${JSON.stringify(studyTask.learningOutcomes || [])}
      `;
    }
  }

  const prompt = `You are an expert tutor creating study notes for a student.
Generate highly structured, beautiful HTML notes for the topic '${topicName}' based on the video/task '${videoTitle}'.

${taskContext ? `Session Task Details for context:\n${taskContext}\n` : ''}
${description ? `Video Description to use for context and identifying topics:
${description.slice(0, 2000)}
` : ''}
${transcript ? `VIDEO TRANSCRIPT containing the taught content:
${transcript.slice(0, 8000)}...
` : ''}

Requirements:
1. Return ONLY valid HTML (no markdown code blocks, no \`\`\`html).
2. Wrap everything in a single <div class="concept-notes">.
3. Use <h2>, <h3>, <ul>, <li>, <strong>, <em> to structure the content nicely.
4. IMPORTANT: You MUST take context from the provided details (task details, video description, and transcript), and provide a clear, detailed description for EACH TOPIC.
5. Include a brief overview, key concepts (with their descriptions), step-by-step breakdown or rules, and a summary.
6. Keep it concise, exam-focused, and easy to read.`;

  const rawNotes = await callGemini(prompt, userKey);
  const structuredNotes = rawNotes.replace(/```html\n?/gi, '').replace(/```\n?/g, '').trim();

  await prisma.lectureSummary.update({
    where: { videoId },
    data: {
      structuredNotes,
    },
  });

  return structuredNotes;
}

export async function getAiSummary(
  videoId: string,
  videoTitle: string,
  topicName: string,
  taskId?: string,
  userKey?: string,
): Promise<{ summary: string; keyInsights: string[]; analogies: string[] }> {
  // Fetch video description from YouTube API if possible
  let description = '';
  try {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
    if (YOUTUBE_API_KEY && !videoId.includes('-')) {
      const videoRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: { id: videoId, key: YOUTUBE_API_KEY, part: 'snippet' }
      });
      description = videoRes.data?.items?.[0]?.snippet?.description || '';
    }
  } catch (err) {
    console.error('Failed to fetch video description for AI summary:', err);
  }

  const transcript = await fetchTranscript(videoId);
  
  let taskContext = '';
  if (taskId) {
    const studyTask = await prisma.studyTask.findUnique({
      where: { id: taskId }
    });
    if (studyTask) {
      taskContext = `
Task Title: ${studyTask.title}
Key Points to Cover: ${JSON.stringify(studyTask.keyPoints || [])}
Learning Outcomes: ${JSON.stringify(studyTask.learningOutcomes || [])}
      `;
    }
  }

  const prompt = `You are an expert tutor creating an AI summary for a student.
Topic: '${topicName}'
Video/Task Name: '${videoTitle}'

${taskContext ? `Session Task Details for context:\n${taskContext}\n` : ''}
${description ? `Video Description for context:\n${description.slice(0, 2000)}\n` : ''}
${transcript ? `Video Transcript for taught content:\n${transcript.slice(0, 8000)}...\n` : ''}

Requirements:
1. You MUST take context from the provided details (video description, transcript, or task key points).
2. You MUST give a proper, comprehensive description of what the topic/session is about and provide proper, factual info on it based on your expert knowledge and the provided context.
3. Return ONLY a valid JSON object matching this structure (no extra text):
{
  "summary": "A comprehensive paragraph describing what the topic is about and proper info on it.",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "analogies": ["Analogy 1", "Analogy 2"]
}`;

  const rawText = await callGemini(prompt, userKey);
  try {
    const parsed = JSON.parse(extractJsonObject(rawText));
    return {
      summary: parsed.summary || "No summary available.",
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
      analogies: Array.isArray(parsed.analogies) ? parsed.analogies : [],
    };
  } catch (err) {
    console.error('Failed to parse getAiSummary JSON:', err);
    return { summary: "Failed to generate AI summary.", keyInsights: [], analogies: [] };
  }
}

export async function getQuizQuestions(
  videoId: string,
  videoTitle: string,
  topicName: string,
  taskId?: string,
  userKey?: string,
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

  const rawQuiz = await callGemini(prompt, userKey);

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
