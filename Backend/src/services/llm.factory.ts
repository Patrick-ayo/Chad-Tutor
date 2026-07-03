import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import config from '../config';
import prisma from '../db/client';
import { decrypt } from '../utils/encryption';
import { runGeminiPrompt as originalGeminiPrompt } from './gemini.service';

const SYSTEM_GEMINI_KEY = config.chatbot.geminiApiKey || process.env.GEMINI_API_KEY || '';

export async function runUniversalPrompt(
  prompt: string,
  userId?: string | null
): Promise<{ error: unknown; output: string }> {
  let userProvider: string | null = null;
  let userKey: string | null = null;

  if (userId) {
    try {
      const user: any = await prisma.user.findUnique({
        where: { id: userId },
        select: { llmProvider: true, llmApiKey: true },
      });
      if (user && user.llmApiKey) {
        userProvider = user.llmProvider;
        userKey = decrypt(user.llmApiKey);
      }
    } catch (err) {
      console.error('Failed to fetch/decrypt universal key for user:', err);
    }
  }

  // If no custom config, fallback to original logic (which uses system default or custom gemini)
  if (!userProvider || !userKey) {
    return originalGeminiPrompt(prompt, undefined);
  }

  // 1. OpenAI
  if (userProvider === 'openai') {
    try {
      const openai = new OpenAI({ apiKey: userKey });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // Default model for OpenAI
        messages: [{ role: 'user', content: prompt }],
      });
      const content = response.choices[0]?.message?.content || '';
      return { error: null, output: content };
    } catch (e: any) {
      console.warn('OpenAI custom key failed, falling back to default Gemini:', e.message);
      // Fallback
      return originalGeminiPrompt(prompt);
    }
  }

  // 2. Anthropic
  if (userProvider === 'anthropic') {
    try {
      const anthropic = new Anthropic({ apiKey: userKey });
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });
      
      const contentBlock = response.content[0];
      let content = '';
      if (contentBlock && contentBlock.type === 'text') {
        content = contentBlock.text;
      }
      return { error: null, output: content };
    } catch (e: any) {
      console.warn('Anthropic custom key failed, falling back to default Gemini:', e.message);
      // Fallback
      return originalGeminiPrompt(prompt);
    }
  }

  // 3. Gemini Custom Key
  if (userProvider === 'gemini') {
    return originalGeminiPrompt(prompt, userKey);
  }

  // Fallback catch-all
  return originalGeminiPrompt(prompt);
}
