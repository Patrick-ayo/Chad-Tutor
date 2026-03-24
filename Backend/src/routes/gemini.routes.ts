import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';

const router = express.Router();

// Initialize Gemini
const GEMINI_API_KEY = config.chatbot.geminiApiKey || process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-001',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
];

const configuredModels = (process.env.GEMINI_MODEL_CANDIDATES || '')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

const MODEL_CANDIDATES = configuredModels.length > 0 ? configuredModels : FALLBACK_MODELS;
let discoveredModelsCache: string[] | null = null;
let quotaBackoffUntil = 0;

function parseJsonResponse(text: string) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

function isModelNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { status?: number; message?: string };
  const message = (maybeError.message || '').toLowerCase();
  return maybeError.status === 404 || message.includes('model') && message.includes('not found');
}

function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { status?: number; message?: string };
  const message = (maybeError.message || '').toLowerCase();
  return maybeError.status === 429 || message.includes('quota') || message.includes('rate limit') || message.includes('too many requests');
}

function parseRetryDelayMs(error: unknown): number {
  if (!error || typeof error !== 'object') {
    return 30_000;
  }

  const details = (error as { errorDetails?: unknown[] }).errorDetails;
  if (!Array.isArray(details)) {
    return 30_000;
  }

  for (const item of details) {
    if (!item || typeof item !== 'object') continue;
    const retryDelay = (item as Record<string, unknown>).retryDelay;
    if (typeof retryDelay === 'string') {
      const m = retryDelay.match(/^(\d+)s$/);
      if (m) {
        return Number(m[1]) * 1000;
      }
    }
  }

  return 30_000;
}

function shouldSkipGeminiForBackoff(): boolean {
  return Date.now() < quotaBackoffUntil;
}

function dedupeModels(models: string[]): string[] {
  return Array.from(new Set(models.filter(Boolean)));
}

function createRoadmapInfoFallback(roadmapTitle: string) {
  return {
    description: `Comprehensive ${roadmapTitle} roadmap with practical milestones and hands-on learning.`,
    targetAudience: `Beginners and practitioners learning ${roadmapTitle}.`,
    relatedTracks: [],
    learningPath: `Start with fundamentals, build projects, and iterate through advanced topics in ${roadmapTitle}.`,
    estimatedTime: '3-6 months',
    prerequisites: 'None',
    careerOpportunities: [],
  };
}

function createSectionInfoFallback(sectionTitle: string) {
  return {
    introText: `${sectionTitle} helps you build practical competence and confidence in this roadmap stage.`,
    tips: ['Focus on one concept at a time', 'Practice with small repeatable tasks', 'Document what you learn'],
    commonMistakes: ['Skipping fundamentals', 'Learning without practice'],
  };
}

function createInfoBlocksFallback(roadmapTitle: string) {
  return {
    infoBlocks: [
      {
        text: `Start ${roadmapTitle} with fundamentals and avoid skipping basics.`,
        type: 'recommendation',
        priority: 1,
      },
      {
        text: 'Practice with hands-on projects before moving into advanced tooling topics.',
        type: 'tip',
        priority: 2,
      },
      {
        text: 'Review your weakest area every week and reinforce it with real exercises.',
        type: 'info',
        priority: 3,
      },
    ],
  };
}

type InfoBlockKind = 'tip' | 'warning' | 'info' | 'recommendation';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeInfoBlockType(type: unknown): InfoBlockKind {
  const normalized = String(type || '').toLowerCase();
  return normalized === 'tip' || normalized === 'warning' || normalized === 'info' || normalized === 'recommendation'
    ? normalized
    : 'info';
}

function autoPositionInfoBlocks(rawBlocks: unknown[]): Array<{
  id: string;
  text: string;
  position: { x: number; y: number };
  width: number;
  type: InfoBlockKind;
  priority: number;
}> {
  const safeBlocks = (Array.isArray(rawBlocks) ? rawBlocks : [])
    .map((block, idx) => {
      const record = (block && typeof block === 'object' ? block : {}) as Record<string, unknown>;
      const text = String(record.text || '').trim().slice(0, 100);
      const priorityRaw = Number(record.priority);

      return {
        text,
        type: normalizeInfoBlockType(record.type),
        priority: Number.isFinite(priorityRaw) ? clamp(Math.round(priorityRaw), 1, 5) : clamp(idx + 1, 1, 5),
      };
    })
    .filter((block) => block.text.length > 0)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6);

  return safeBlocks.map((block, index) => {
    const isLeft = index % 2 === 0;
    const width = 240;
    const x = isLeft ? 100 : 520;
    const y = clamp(200 + Math.floor(index / 2) * 250, 100, 1800);

    return {
      id: `info-${index + 1}`,
      text: block.text,
      position: { x, y },
      width,
      type: block.type,
      priority: block.priority,
    };
  });
}

async function getAvailableModelCandidates(): Promise<string[]> {
  if (configuredModels.length > 0) {
    return MODEL_CANDIDATES;
  }

  if (discoveredModelsCache) {
    return discoveredModelsCache;
  }

  try {
    const response = await (genAI as any).listModels();
    const models = Array.isArray(response?.models) ? response.models : [];

    const available = models
      .filter((m: any) => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map((m: any) => String(m?.name || '').replace(/^models\//, ''))
      .filter(Boolean);

    const preferred = FALLBACK_MODELS.filter((m) => available.includes(m));
    discoveredModelsCache = dedupeModels([...preferred, ...available]);
  } catch {
    discoveredModelsCache = MODEL_CANDIDATES;
  }

  return discoveredModelsCache;
}

async function generateWithFallback(prompt: string) {
  if (shouldSkipGeminiForBackoff()) {
    const waitMs = quotaBackoffUntil - Date.now();
    throw new Error(`Gemini temporarily skipped due to quota backoff. Retry in ${Math.ceil(waitMs / 1000)}s.`);
  }

  let lastError: unknown;
  const candidates = await getAvailableModelCandidates();

  for (const candidate of candidates) {
    try {
      const candidateModel = genAI.getGenerativeModel({ model: candidate });
      const result = await candidateModel.generateContent(prompt);
      return result;
    } catch (error) {
      lastError = error;
      if (isModelNotFoundError(error)) {
        console.warn(`Gemini model not available: ${candidate}`);
        continue;
      }

      if (isQuotaError(error)) {
        const delayMs = parseRetryDelayMs(error);
        quotaBackoffUntil = Date.now() + delayMs;
        console.warn(`Gemini quota hit; backing off for ${Math.ceil(delayMs / 1000)}s`);
        throw error;
      }

      throw error;
    }
  }

  throw new Error(`No available Gemini model for generateContent. Tried: ${candidates.join(', ')}. Last error: ${(lastError as any)?.message || 'unknown'}`);
}

router.post('/generate-roadmap-info', async (req: Request, res: Response) => {
  try {
    const { roadmapTitle, roadmapType } = req.body as {
      roadmapTitle?: string;
      roadmapType?: string;
    };

    if (!roadmapTitle) {
      return res.status(400).json({
        success: false,
        message: 'Roadmap title is required',
      });
    }

    if (!GEMINI_API_KEY) {
      return res.json({
        success: true,
        fallback: true,
        data: createRoadmapInfoFallback(roadmapTitle),
      });
    }

    const prompt = `Generate comprehensive metadata for a learning roadmap titled "${roadmapTitle}".${
      roadmapType ? ` The roadmap type is "${roadmapType}".` : ''
    }

Generate a JSON response with this exact structure:
{
  "description": "2-3 sentence engaging description of what this roadmap covers and why someone should learn it",
  "targetAudience": "Specific description of who this roadmap is for (e.g., 'absolute beginners wanting to get into ${roadmapTitle}')",
  "relatedTracks": ["Related Track 1", "Related Track 2", "Related Track 3"],
  "learningPath": "Brief overview of the learning journey from start to finish",
  "estimatedTime": "realistic time estimate (e.g., '3-6 months with 10 hours/week')",
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"] or "None" if beginner-friendly,
  "careerOpportunities": ["Job role 1", "Job role 2", "Job role 3"]
}

Requirements:
- Description should be motivating and clear
- Related tracks should be actual career paths or specializations
- Be realistic about time estimates
- Return ONLY valid JSON, no markdown formatting`;

    let metadata = createRoadmapInfoFallback(roadmapTitle);
    if (!shouldSkipGeminiForBackoff()) {
      const result = await generateWithFallback(prompt);
      const text = result.response.text();
      metadata = parseJsonResponse(text);
    }

    return res.json({ success: true, data: metadata });
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn('Gemini quota exceeded for /generate-roadmap-info; serving fallback metadata');
    } else {
      console.error('Gemini API error:', error);
    }
    return res.json({
      success: true,
      fallback: true,
      data: createRoadmapInfoFallback((req.body as any)?.roadmapTitle || 'this track'),
    });
  }
});

router.post('/generate-section-info', async (req: Request, res: Response) => {
  try {
    const { roadmapTitle, sectionTitle, previousTopics } = req.body as {
      roadmapTitle?: string;
      sectionTitle?: string;
      previousTopics?: string[];
    };

    if (!roadmapTitle || !sectionTitle) {
      return res.status(400).json({
        success: false,
        message: 'Roadmap title and section title are required',
      });
    }

    if (!GEMINI_API_KEY) {
      return res.json({
        success: true,
        fallback: true,
        data: createSectionInfoFallback(sectionTitle),
      });
    }

    const prompt = `For the "${roadmapTitle}" learning roadmap, generate helpful contextual information for the "${sectionTitle}" section.

Previous topics covered: ${previousTopics?.join(', ') || 'None'}

Generate a JSON response:
{
  "introText": "1-2 sentences explaining what this section covers and why it's important at this point in the journey",
  "tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"],
  "commonMistakes": ["Mistake to avoid 1", "Mistake to avoid 2"]
}

Be specific, practical, and encouraging. Return ONLY valid JSON.`;

    let sectionInfo = createSectionInfoFallback(sectionTitle);
    if (!shouldSkipGeminiForBackoff()) {
      const result = await generateWithFallback(prompt);
      const text = result.response.text();
      sectionInfo = parseJsonResponse(text);
    }

    return res.json({ success: true, data: sectionInfo });
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn('Gemini quota exceeded for /generate-section-info; serving fallback section info');
    } else {
      console.error('Section info error:', error);
    }
    return res.json({
      success: true,
      fallback: true,
      data: createSectionInfoFallback((req.body as any)?.sectionTitle || 'this section'),
    });
  }
});

// Generate contextual info blocks for roadmap
router.post('/generate-info-blocks', async (req: Request, res: Response) => {
  try {
    const { roadmapTitle, roadmapNodes } = req.body as {
      roadmapTitle?: string;
      roadmapNodes?: Array<{ type?: string; title?: string; name?: string; id?: string; slug?: string }>;
    };

    if (!roadmapTitle || !roadmapNodes) {
      return res.status(400).json({
        success: false,
        message: 'Roadmap title and nodes are required',
      });
    }

    const sections = roadmapNodes
      .filter((n) => n.type === 'section' || n.type === 'topic')
      .map((n) => n.title || n.name || '')
      .slice(0, 10)
      .filter(Boolean)
      .join(', ');

    const fallbackSections = roadmapNodes.slice(0, 10).map((n) => n.title || n.name || n.slug || n.id || '').filter(Boolean).join(', ');

    const prompt = `For a "${roadmapTitle}" learning roadmap, generate 5-6 helpful informational text blocks.

Key topics in this roadmap: ${sections || fallbackSections}

Generate a JSON response:
{
  "infoBlocks": [
    {
      "text": "Concise, actionable advice (max 100 characters)",
      "type": "tip",
      "priority": 1
    }
  ]
}

Requirements:
- Each text block must be 60-100 characters (short and concise)
- Types: "tip", "warning", "info", "recommendation"
- Priority: 1 (most important) to 5 (least important)
- Focus on practical, actionable advice
- Avoid generic platitudes
- Be specific to ${roadmapTitle}

Generate 5-6 blocks total.
Return ONLY valid JSON, no markdown.`;

    if (!GEMINI_API_KEY) {
      const fallback = createInfoBlocksFallback(roadmapTitle);
      return res.json({
        success: true,
        fallback: true,
        data: { infoBlocks: autoPositionInfoBlocks(fallback.infoBlocks as unknown[]) },
      });
    }

    let rawData = createInfoBlocksFallback(roadmapTitle);
    if (!shouldSkipGeminiForBackoff()) {
      const result = await generateWithFallback(prompt);
      const text = result.response.text();
      rawData = parseJsonResponse(text);
    }

    const rawBlocks = Array.isArray((rawData as Record<string, unknown>)?.infoBlocks)
      ? ((rawData as Record<string, unknown>).infoBlocks as unknown[])
      : [];

    const positionedBlocks = autoPositionInfoBlocks(rawBlocks);

    return res.json({
      success: true,
      data: { infoBlocks: positionedBlocks },
    });
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn('Gemini quota exceeded for /generate-info-blocks; serving fallback info blocks');
    } else {
      console.error('Info blocks generation error:', error);
    }
    const fallback = createInfoBlocksFallback((req.body as any)?.roadmapTitle || 'this roadmap');
    return res.json({
      success: true,
      fallback: true,
      data: { infoBlocks: autoPositionInfoBlocks(fallback.infoBlocks as unknown[]) },
    });
  }
});

/**
 * POST /api/gemini/generate-node-descriptions
 * 
 * Generate AI-powered descriptions for skill nodes that are missing them.
 * 
 * Request body:
 * {
 *   "nodes": [
 *     { "id": "node-id", "name": "Node Name", "description": "existing desc or null" },
 *     ...
 *   ],
 *   "roadmapContext": "Data Science Roadmap" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "descriptions": {
 *       "node-id": "Generated description...",
 *       ...
 *     }
 *   }
 * }
 */
router.post('/generate-node-descriptions', async (req: Request, res: Response) => {
  try {
    const {
      nodes,
      roadmapContext = 'learning roadmap',
    } = req.body as {
      nodes?: Array<{ id: string; name: string; description?: string | null }>;
      roadmapContext?: string;
    };

    if (!Array.isArray(nodes) || nodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nodes array is required and must not be empty',
      });
    }

    // Filter nodes that need descriptions
    const nodesToDescribe = nodes.filter((n) => !n.description || typeof n.description !== 'string');

    if (nodesToDescribe.length === 0) {
      return res.json({
        success: true,
        data: { descriptions: {} },
      });
    }

    if (!GEMINI_API_KEY) {
      // Build fallback descriptions
      const fallbackDescriptions: Record<string, string> = {};
      nodesToDescribe.forEach((node) => {
        fallbackDescriptions[node.id] = `Learn about ${node.name} as part of this ${roadmapContext}. This topic covers core principles, essential tools, and repeatable workflows you will use in real projects.`;
      });
      
      return res.json({
        success: true,
        fallback: true,
        data: { descriptions: fallbackDescriptions },
      });
    }

    const nodesList = nodesToDescribe.map((n) => `- "${n.name}"`).join('\n');

    const prompt = `You are an educational content expert. Generate concise, practical descriptions for the following skill topics in a ${roadmapContext}.

Topics to describe:
${nodesList}

For each topic, generate a description that:
1. Is 1-2 sentences (40-80 words max)
2. Explains what the topic covers and why it matters
3. Focuses on practical application and real-world use
4. Avoids generic or overly technical language
5. Motivates the learner

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "descriptions": {
    "topic-name-1": "Description here...",
    "topic-name-2": "Description here...",
    ...
  }
}

Map the description keys to the exact topic names provided above.`;

    try {
      const result = await generateWithFallback(prompt);
      const text = result.response.text();
      const parsed = parseJsonResponse(text);

      // Map descriptions back to node IDs
      const descriptions: Record<string, string> = {};
      nodesToDescribe.forEach((node) => {
        const desc = (parsed.descriptions as Record<string, string>)?.[node.name];
        descriptions[node.id] = desc || `Learn about ${node.name} as part of this ${roadmapContext}.`;
      });

      return res.json({
        success: true,
        data: { descriptions },
      });
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Fallback to simple descriptions
      const fallbackDescriptions: Record<string, string> = {};
      nodesToDescribe.forEach((node) => {
        fallbackDescriptions[node.id] = `Learn about ${node.name} as part of this ${roadmapContext}. This topic covers core principles, essential tools, and repeatable workflows you will use in real projects.`;
      });
      
      return res.json({
        success: true,
        fallback: true,
        data: { descriptions: fallbackDescriptions },
      });
    }
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn('Gemini quota exceeded for /generate-node-descriptions');
    } else {
      console.error('Node descriptions generation error:', error);
    }

    const nodes = (req.body as any)?.nodes || [];
    const roadmapContext = (req.body as any)?.roadmapContext || 'learning roadmap';
    
    // Return fallback descriptions
    const fallbackDescriptions: Record<string, string> = {};
    nodes
      .filter((n: any) => !n.description || typeof n.description !== 'string')
      .forEach((node: any) => {
        fallbackDescriptions[node.id] = `Learn about ${node.name} as part of this ${roadmapContext}. This topic covers core principles, essential tools, and repeatable workflows you will use in real projects.`;
      });

    return res.json({
      success: true,
      fallback: true,
      data: { descriptions: fallbackDescriptions },
    });
  }
});

export default router;
