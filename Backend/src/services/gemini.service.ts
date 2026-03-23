import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';

const GEMINI_KEY = config.chatbot.geminiApiKey || process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = config.chatbot.geminiModel || process.env.GEMINI_MODEL || 'gemini-1.5-pro';

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

export async function runGeminiPrompt(prompt: string): Promise<{ error: unknown; output: string }> {
  if (!GEMINI_KEY) {
    return { error: 'No Gemini API key configured', output: '' };
  }

  try {
    // Try to use the configured model directly; if model supports generateContent, call it.
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const result = await model.generateContent(prompt);
      const text = result.response?.text ? result.response.text() : JSON.stringify(result);
      return { error: null, output: String(text) };
    } catch (inner) {
      // If a direct generateContent call fails, try a more generic endpoint via the client
      return { error: inner, output: '' };
    }
  } catch (err) {
    console.error('[Gemini API Error]', err);
    return { error: err, output: '' };
  }
}

