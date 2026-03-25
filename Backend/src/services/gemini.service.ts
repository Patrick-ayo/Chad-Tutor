import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';

const GEMINI_KEY = config.chatbot.geminiApiKey || process.env.GEMINI_API_KEY || '';
const configuredModel = config.chatbot.geminiModel || process.env.GEMINI_MODEL || '';
const fallbackModels = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-001',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
];

const configuredCandidates = (process.env.GEMINI_MODEL_CANDIDATES || '')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

const modelCandidates = Array.from(
  new Set([
    ...configuredCandidates,
    configuredModel,
    ...fallbackModels,
  ].filter(Boolean)),
);

const genAI = new GoogleGenerativeAI(GEMINI_KEY);
let quotaBackoffUntil = 0;

function isModelNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const maybeError = error as { status?: number; message?: string };
  const message = (maybeError.message || '').toLowerCase();
  return maybeError.status === 404 || (message.includes('model') && message.includes('not found'));
}

function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const maybeError = error as { status?: number; message?: string };
  const message = (maybeError.message || '').toLowerCase();
  return maybeError.status === 429 || message.includes('quota') || message.includes('rate limit') || message.includes('too many requests');
}

function parseRetryDelayMs(error: unknown): number {
  if (!error || typeof error !== 'object') return 30_000;

  const details = (error as { errorDetails?: unknown[] }).errorDetails;
  if (!Array.isArray(details)) return 30_000;

  for (const item of details) {
    if (!item || typeof item !== 'object') continue;
    const retryDelay = (item as Record<string, unknown>).retryDelay;
    if (typeof retryDelay === 'string') {
      const matched = retryDelay.match(/^(\d+)s$/);
      if (matched) return Number(matched[1]) * 1000;
    }
  }

  return 30_000;
}

export async function runGeminiPrompt(prompt: string): Promise<{ error: unknown; output: string }> {
  if (!GEMINI_KEY) {
    return { error: 'No Gemini API key configured', output: '' };
  }

  if (Date.now() < quotaBackoffUntil) {
    const waitMs = quotaBackoffUntil - Date.now();
    return {
      error: `Gemini temporarily in quota backoff (${Math.ceil(waitMs / 1000)}s remaining)`,
      output: '',
    };
  }

  try {
    let lastError: unknown = null;

    for (const candidate of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: candidate });
      const result = await model.generateContent(prompt);
      const text = result.response?.text ? result.response.text() : JSON.stringify(result);
      return { error: null, output: String(text) };
      } catch (inner) {
        lastError = inner;

        if (isModelNotFoundError(inner)) {
          continue;
        }

        if (isQuotaError(inner)) {
          const delayMs = parseRetryDelayMs(inner);
          quotaBackoffUntil = Date.now() + delayMs;
          console.warn(`Gemini quota hit; backing off for ${Math.ceil(delayMs / 1000)}s`);
        }

        return { error: inner, output: '' };
      }
    }

    return {
      error:
        lastError ||
        `No available Gemini model for generateContent. Tried: ${modelCandidates.join(', ')}`,
      output: '',
    };
  } catch (err) {
    console.error('[Gemini API Error]', err);
    return { error: err, output: '' };
  }
}

