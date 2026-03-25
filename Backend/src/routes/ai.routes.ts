import express, { Request, Response } from 'express';
import Bytez from '../lib/bytez';
import { runGeminiPrompt } from '../services/gemini.service';
import type { QuizResponse, StudyPlan } from '../types';
import config from '../config';
import { getChatFlowResponse } from '../services/chatbot-flow.service';
import { enrichVideosBatch } from '../services/video-intelligence.service';

const router = express.Router();

router.post('/chat-flow', async (req: Request, res: Response) => {
  try {
    const { state, input, selectedOptions, context } = req.body as {
      state: 'context_collection' | 'confirmation' | 'execution_choice' | 'timeline_collection' | 'active_plan';
      input?: string;
      selectedOptions?: string[];
      context?: unknown;
    };

    const response = getChatFlowResponse({
      state,
      input,
      selectedOptions,
      context: context as any,
    });

    let enrichedMessage = response.message;
    if (response.state === 'active_plan') {
      try {
        const suggestionsText = await fetchMrChadVideoSuggestions(response.context);
        if (suggestionsText) {
          enrichedMessage = `${response.message}\n${suggestionsText}`;
        }
      } catch (suggestionError) {
        console.warn('Failed to append Mr Chad video suggestions:', suggestionError);
      }
    }

    return res.json({
      success: true,
      ...response,
      message: enrichedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat flow',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

const BYTEZ_API_KEY = config.chatbot.bytezApiKey || 'your-free-key';
const sdk = new Bytez(BYTEZ_API_KEY);
const MODEL_NAME = config.chatbot.model;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

function cleanClaudeJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

function buildFallbackResources(nodeTitle: string, nodeDescription?: string) {
  return {
    description:
      nodeDescription ||
      `${nodeTitle} is an important learning topic. Start with core concepts, then practice with hands-on examples to build confidence and long-term understanding.`,
    freeResources: [
      {
        type: 'article',
        title: `Introduction to ${nodeTitle}`,
        url: 'https://developer.mozilla.org/',
      },
      {
        type: 'video',
        title: `${nodeTitle} tutorial playlist`,
        url: 'https://www.youtube.com/',
      },
    ],
    premiumResources: [
      {
        type: 'course',
        title: `${nodeTitle} professional course`,
        url: 'https://www.coursera.org/',
        discount: 'Free Trial',
      },
    ],
  };
}
function buildFallbackQuiz(nodeTitle: string, questionCount: number): QuizResponse {
  const safeCount = Math.max(1, Math.min(10, Number(questionCount) || 3));
  const base = [
    {
      question: `What is the primary goal of learning ${nodeTitle}?`,
      options: [
        `To apply ${nodeTitle} concepts in practical scenarios`,
        'To memorize terminology without context',
        'To avoid using tools and frameworks',
        'To skip fundamentals and jump to advanced topics',
      ],
      correctAnswer: 0,
      explanation: `The main goal is to build practical understanding so you can apply ${nodeTitle} in real work.`,
      difficulty: 'beginner' as const,
    },
    {
      question: `Which study approach is most effective for mastering ${nodeTitle}?`,
      options: [
        'Only watching videos without practice',
        'Hands-on practice with incremental projects',
        'Reading one source once and stopping',
        'Skipping revision and assessments',
      ],
      correctAnswer: 1,
      explanation: 'Hands-on, iterative practice creates retention and real problem-solving ability.',
      difficulty: 'intermediate' as const,
    },
    {
      question: `How should you validate progress while learning ${nodeTitle}?`,
      options: [
        'By avoiding feedback and tests',
        'By building features without checking outcomes',
        'By using quizzes, checkpoints, and real outputs',
        'By comparing only with others',
      ],
      correctAnswer: 2,
      explanation: 'Frequent validation with concrete outputs and checks confirms actual understanding.',
      difficulty: 'advanced' as const,
    },
  ];

  const questions = Array.from({ length: safeCount }, (_, index) => {
    const template = base[index % base.length];
    return {
      id: `q${index + 1}`,
      question: template.question,
      options: template.options,
      correctAnswer: template.correctAnswer,
      explanation: template.explanation,
      difficulty: template.difficulty,
    };
  });

  return { questions };
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatLargeNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

function extractFocusTerms(context: any): string[] {
  const profile = context?.profile || {};
  const raw = [
    ...(Array.isArray(profile.jobCourses) ? profile.jobCourses : []),
    ...(Array.isArray(profile.skills) ? profile.skills : []),
    ...(Array.isArray(profile.languages) ? profile.languages : []),
    ...(Array.isArray(profile.goals) ? profile.goals : []),
  ] as string[];

  const seen = new Set<string>();
  return raw
    .map((value) => value.trim())
    .filter((value) => {
      if (!value) return false;
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

async function fetchMrChadVideoSuggestions(context: any): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    return null;
  }

  const focusTerms = extractFocusTerms(context);
  if (focusTerms.length === 0) {
    return null;
  }

  const searchQuery = `${focusTerms.join(' ')} tutorial complete course`;
  const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`);
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('q', searchQuery);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('maxResults', '6');
  searchUrl.searchParams.set('order', 'viewCount');
  searchUrl.searchParams.set('relevanceLanguage', 'en');
  searchUrl.searchParams.set('key', YOUTUBE_API_KEY);

  const searchResponse = await fetch(searchUrl.toString());
  const searchData = await searchResponse.json() as {
    items?: Array<{
      id: { videoId?: string };
      snippet: {
        title: string;
        description?: string;
        channelTitle: string;
        publishedAt?: string;
        thumbnails?: { medium?: { url: string }; default?: { url: string } };
      };
    }>;
  };

  const videoIds = (searchData.items || [])
    .map((item) => item.id.videoId)
    .filter((id): id is string => Boolean(id));

  if (videoIds.length === 0) {
    return null;
  }

  const detailsUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
  detailsUrl.searchParams.set('part', 'contentDetails,statistics');
  detailsUrl.searchParams.set('id', videoIds.join(','));
  detailsUrl.searchParams.set('key', YOUTUBE_API_KEY);

  const detailsResponse = await fetch(detailsUrl.toString());
  const detailsData = await detailsResponse.json() as {
    items?: Array<{
      id: string;
      contentDetails?: { duration: string };
      statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
    }>;
  };

  const detailsMap = new Map<string, { durationSeconds: number; viewCount: number; likeCount: number; commentCount: number }>();
  for (const item of detailsData.items || []) {
    detailsMap.set(item.id, {
      durationSeconds: parseDuration(item.contentDetails?.duration || 'PT0S'),
      viewCount: parseInt(item.statistics?.viewCount || '0', 10),
      likeCount: parseInt(item.statistics?.likeCount || '0', 10),
      commentCount: parseInt(item.statistics?.commentCount || '0', 10),
    });
  }

  const rawVideos = (searchData.items || []).flatMap((item) => {
    const id = item.id.videoId;
    if (!id) return [];
    const details = detailsMap.get(id);
    if (!details) return [];

    return [{
      id,
      title: item.snippet.title,
      channelName: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      description: item.snippet.description,
      topicName: focusTerms[0],
      subtopicName: focusTerms[1],
      viewCount: details.viewCount,
      likeCount: details.likeCount,
      commentCount: details.commentCount,
      publishedAt: item.snippet.publishedAt,
      durationSeconds: details.durationSeconds,
      url: `https://www.youtube.com/watch?v=${id}`,
    }];
  });

  if (rawVideos.length === 0) {
    return null;
  }

  const enriched = await enrichVideosBatch(rawVideos, { maxItems: 3 });

  const lines = [
    '',
    'Top recommended videos for your plan (ranked by views + review signal):',
  ];

  enriched.slice(0, 3).forEach((video, index) => {
    const reason = video.qualitySignal?.reasons?.[0] || 'Balanced quality signal';
    const sourceTag =
      video.enrichmentSource === 'youtube-metadata'
        ? 'Direct metadata'
        : video.enrichmentSource === 'gemini'
          ? 'Google summary'
          : video.enrichmentSource === 'bytez-fallback'
            ? 'Bytez fallback'
            : 'Fallback';

    lines.push(
      `${index + 1}. ${video.title} (${formatLargeNumber(video.viewCount || 0)} views)`,
      `   Link: ${video.url}`,
      `   Why picked: ${reason}`,
      `   Summary source: ${sourceTag}`,
      `   Test focus: ${(video.testPrepPoints || []).slice(0, 2).join(' | ') || 'Revise key concepts from this lesson.'}`,
    );
  });

  return lines.join('\n');
}

async function runModelPrompt(prompt: string): Promise<{ error: unknown; output: string }> {
  // Prefer Gemini if configured, otherwise fall back to Bytez SDK
  try {
    if (config.chatbot.geminiApiKey) {
      const res = await runGeminiPrompt(prompt);
      if (!res.error) return { error: null, output: res.output };
      // fallback to Bytez if Gemini returned an error
      const geminiErrorMessage =
        res.error instanceof Error
          ? res.error.message
          : typeof res.error === 'string'
            ? res.error
            : JSON.stringify(res.error);
      console.warn(`[AI] Gemini returned error, falling back to Bytez: ${geminiErrorMessage}`);
    }

    const model = sdk.model(MODEL_NAME);
    const { error, output } = await model.run([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // Normalize output to a usable string
    const normalize = (o: unknown): string => {
      if (typeof o === 'string') return o;
      if (o == null) return '';
      if (Array.isArray(o)) {
        for (const el of o) {
          if (el && typeof (el as any).content === 'string') return (el as any).content;
          if (typeof el === 'string') return el as string;
        }
        try {
          return JSON.stringify(o);
        } catch {
          return String(o);
        }
      }
      if (typeof o === 'object') {
        const obj = o as any;
        if (typeof obj.output === 'string') return obj.output;
        if (typeof obj.text === 'string') return obj.text;
        if (obj.message && typeof obj.message.content === 'string') return obj.message.content;
        if (obj.choices && Array.isArray(obj.choices) && obj.choices.length > 0) {
          const c = obj.choices[0];
          if (typeof c.text === 'string') return c.text;
          if (c.message && typeof c.message.content === 'string') return c.message.content;
        }
        try {
          return JSON.stringify(o);
        } catch {
          return String(o);
        }
      }
      return String(o);
    };

    return {
      error,
      output: normalize(output),
    };
  } catch (err) {
    console.error('[Bytez AI Error]', err);
    return {
      error: err,
      output: '',
    };
  }
}

router.post('/generate-study-plan', async (req: Request, res: Response) => {
  try {
    const { nodeTitle, nodeDescription, availableDays = 7 } = req.body as {
      nodeTitle?: string;
      nodeDescription?: string;
      availableDays?: number;
    };

    if (!nodeTitle) {
      return res.status(400).json({
        success: false,
        message: 'Node title is required',
      });
    }

    const prompt = `Create a ${availableDays}-day study plan for learning "${nodeTitle}".

Topic Description: ${nodeDescription || 'No description provided'}

Generate a JSON response with this exact structure:
{
  "totalDays": ${availableDays},
  "totalHours": <estimated total hours as number>,
  "sessions": [
    {
      "day": 1,
      "title": "Day 1 session title",
      "duration": <minutes as number>,
      "topics": ["topic 1", "topic 2", "topic 3"],
      "activities": ["Watch intro video", "Read article", "Practice exercise"]
    }
  ],
  "keyTakeaways": ["key point 1", "key point 2", "key point 3"],
  "quizTopics": ["quiz topic 1", "quiz topic 2", "quiz topic 3"]
}

Requirements:
- Each day should have 30-90 minutes of content
- Make it practical and achievable for beginners
- Include specific, actionable activities
- Progress from basics to advanced topics
- Return ONLY valid JSON, no markdown code blocks or explanations`;

    const { error, output } = await runModelPrompt(prompt);

    if (error) {
      console.error('Claude API error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate study plan',
        error,
      });
    }

    let text = output.trim();
    text = cleanClaudeJsonResponse(text);

    const studyPlan = JSON.parse(text) as StudyPlan;

    return res.json({
      success: true,
      ...studyPlan,
    });
  } catch (error) {
    console.error('Study plan generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate study plan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { nodeTitle, nodeDescription, questionCount = 10 } = req.body as {
      nodeTitle?: string;
      nodeDescription?: string;
      questionCount?: number;
    };
    const safeQuestionCount = Math.max(1, Math.min(10, Number(questionCount) || 3));

    if (!nodeTitle) {
      return res.status(400).json({
        success: false,
        message: 'Node title is required',
      });
    }

    const prompt = `Generate ${safeQuestionCount} multiple-choice quiz questions about "${nodeTitle}".

Topic Description: ${nodeDescription || 'No description provided'}

Generate a JSON response with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is the correct answer",
      "difficulty": "beginner"
    }
  ]
}

Requirements:
- Create exactly ${questionCount} questions
- Mix of beginner (60%), intermediate (30%), and advanced (10%) difficulty
- Each question has exactly 4 options
- correctAnswer is the index (0-3) of the correct option in the options array
- Include detailed explanations for learning
- Cover different aspects of the topic
- Return ONLY valid JSON, no markdown code blocks or explanations`;

    const { error, output } = await runModelPrompt(prompt);

    if (error) {
      console.error('Claude API error:', error);
      const fallbackQuiz = buildFallbackQuiz(nodeTitle, safeQuestionCount);
      return res.json({
        success: true,
        ...fallbackQuiz,
        fallback: true,
      });
    }

    let text = output.trim();
    text = cleanClaudeJsonResponse(text);

    let quizData: QuizResponse;
    try {
      quizData = JSON.parse(text) as QuizResponse;
    } catch {
      quizData = buildFallbackQuiz(nodeTitle, safeQuestionCount);
      return res.json({
        success: true,
        ...quizData,
        fallback: true,
      });
    }

    if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      const fallbackQuiz = buildFallbackQuiz(nodeTitle, safeQuestionCount);
      return res.json({
        success: true,
        ...fallbackQuiz,
        fallback: true,
      });
    }

    quizData.questions = quizData.questions.slice(0, safeQuestionCount);

    return res.json({
      success: true,
      ...quizData,
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/generate-session-quiz', async (req: Request, res: Response) => {
  try {
    const {
      topic,
      questionCount = 10,
      videoId,
      videoTitle,
      videoSummary,
      keyConcepts,
    } = req.body as {
      topic?: string;
      questionCount?: number;
      videoId?: string;
      videoTitle?: string;
      videoSummary?: string;
      keyConcepts?: string[];
    };

    const normalizedTopic = (topic || '').trim() || (videoTitle || '').trim();
    if (!normalizedTopic) {
      return res.status(400).json({
        success: false,
        message: 'Topic or video title is required',
      });
    }

    const safeCount = Math.max(1, Math.min(10, Number.isFinite(questionCount) ? Math.floor(questionCount) : 10));
    const concepts = Array.isArray(keyConcepts)
      ? keyConcepts.map((item) => String(item).trim()).filter(Boolean).slice(0, 8)
      : [];

    const buildFallbackQuestions = () => {
      const seeds = concepts.length > 0 ? concepts : [normalizedTopic, 'core concept', 'applied usage'];

      return Array.from({ length: safeCount }).map((_, index) => {
        const seed = seeds[index % seeds.length];
        return {
          id: `session-q-${index + 1}`,
          question: `In the current session on ${normalizedTopic}, what best reflects ${seed}?`,
          options: [
            `Apply ${seed} to solve a practical task from the video context`,
            `Ignore ${seed} and memorize unrelated facts`,
            `Skip ${seed} because only final answers matter`,
            `Delay ${seed} until after the assessment`,
          ],
          correctAnswer: 0,
          explanation: `The session emphasizes applying ${seed} directly from the lesson context.`,
          difficulty: index < Math.ceil(safeCount * 0.6) ? 'beginner' : index < Math.ceil(safeCount * 0.9) ? 'intermediate' : 'advanced',
        };
      });
    };

    const prompt = `Generate exactly ${safeCount} high-quality MCQ questions for a learning session.

Session topic: ${normalizedTopic}
Video ID: ${videoId || 'N/A'}
Video title: ${videoTitle || normalizedTopic}
Video summary/context: ${videoSummary || 'No summary provided'}
Key concepts: ${concepts.join(', ') || 'No explicit concepts provided'}

Return strict JSON only with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "difficulty": "beginner"
    }
  ]
}

Rules:
- Exactly ${safeCount} questions.
- Exactly 4 options per question.
- correctAnswer must be index 0-3.
- Questions must be grounded in session context and video topic.
- Mix difficulty: beginner/intermediate/advanced.
- No markdown, no extra text.`;

    const { error, output } = await runModelPrompt(prompt);
    if (error || !output) {
      return res.json({
        success: true,
        fallbackUsed: true,
        questions: buildFallbackQuestions(),
      });
    }

    let parsed: unknown;
    try {
      const text = cleanClaudeJsonResponse(output.trim());
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    const rawQuestions =
      parsed && typeof parsed === 'object' && Array.isArray((parsed as any).questions)
        ? (parsed as any).questions
        : [];

    const normalizedQuestions = rawQuestions
      .map((item: any, index: number) => {
        const options = Array.isArray(item?.options)
          ? item.options.map((opt: unknown) => String(opt).trim()).filter(Boolean).slice(0, 4)
          : [];

        if (options.length !== 4) {
          return null;
        }

        const correct = Number(item?.correctAnswer);
        const correctAnswer = Number.isInteger(correct) && correct >= 0 && correct <= 3 ? correct : 0;
        const difficulty =
          item?.difficulty === 'intermediate' || item?.difficulty === 'advanced'
            ? item.difficulty
            : 'beginner';

        return {
          id: typeof item?.id === 'string' && item.id.trim() ? item.id.trim() : `session-q-${index + 1}`,
          question:
            typeof item?.question === 'string' && item.question.trim()
              ? item.question.trim()
              : `What is a correct statement about ${normalizedTopic}?`,
          options,
          correctAnswer,
          explanation:
            typeof item?.explanation === 'string' && item.explanation.trim()
              ? item.explanation.trim()
              : `Use the session context around ${normalizedTopic} to justify the correct option.`,
          difficulty,
        };
      })
      .filter((item: any): item is QuizResponse['questions'][number] => Boolean(item))
      .slice(0, safeCount);

    if (normalizedQuestions.length === 0) {
      return res.json({
        success: true,
        fallbackUsed: true,
        questions: buildFallbackQuestions(),
      });
    }

    const completed =
      normalizedQuestions.length < safeCount
        ? [...normalizedQuestions, ...buildFallbackQuestions().slice(0, safeCount - normalizedQuestions.length)]
        : normalizedQuestions;

    return res.json({
      success: true,
      fallbackUsed: false,
      questions: completed.slice(0, safeCount),
    });
  } catch (error) {
    const {
      topic,
      questionCount = 10,
    } = req.body as { topic?: string; questionCount?: number };
    const safeCount = Math.max(1, Math.min(10, Number.isFinite(questionCount) ? Math.floor(questionCount) : 10));
    const normalizedTopic = (topic || 'current session').trim() || 'current session';

    const fallbackQuestions = Array.from({ length: safeCount }).map((_, index) => ({
      id: `session-q-${index + 1}`,
      question: `For ${normalizedTopic}, what is the best learning action?`,
      options: [
        'Connect the concept to one real example from the session',
        'Skip examples and memorize keywords only',
        'Avoid checking understanding with questions',
        'Ignore the video context while answering',
      ],
      correctAnswer: 0,
      explanation: 'Linking concept to session examples gives the strongest understanding signal.',
      difficulty: index < Math.ceil(safeCount * 0.6) ? 'beginner' : index < Math.ceil(safeCount * 0.9) ? 'intermediate' : 'advanced',
    }));

    return res.json({
      success: true,
      fallbackUsed: true,
      questions: fallbackQuestions,
      message: error instanceof Error ? error.message : 'Generated with fallback',
    });
  }
});

router.post('/summarize-topic', async (req: Request, res: Response) => {
  try {
    const { nodeTitle, nodeDescription } = req.body as {
      nodeTitle?: string;
      nodeDescription?: string;
    };

    if (!nodeTitle) {
      return res.status(400).json({
        success: false,
        message: 'Node title is required',
      });
    }

    const prompt = `Provide a comprehensive yet concise summary of "${nodeTitle}" for someone learning this topic.

Current description: ${nodeDescription || 'None'}

Include:
1. What it is (2-3 sentences)
2. Why it's important (1-2 sentences)
3. Key concepts to understand (3-5 bullet points)
4. Real-world applications (2-3 examples)

Keep it beginner-friendly, practical, and motivating. Write in a clear, engaging tone.`;

    const { error, output } = await runModelPrompt(prompt);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate summary',
        error,
      });
    }

    return res.json({
      success: true,
      summary: output.trim(),
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Generate Topic Information & Resources
router.post('/generate-resources', async (req: Request, res: Response) => {
  try {
    const { nodeTitle, nodeDescription } = req.body as {
      nodeTitle?: string;
      nodeDescription?: string;
    };

    if (!nodeTitle) {
      return res.status(400).json({
        success: false,
        message: 'Node title is required',
      });
    }

    const prompt = `Generate comprehensive learning resources for the topic: "${nodeTitle}"

Topic Description: ${nodeDescription || 'No description provided'}

Generate a JSON response with this EXACT structure:
{
  "description": "A detailed 3-4 sentence description explaining what this topic is, why it matters, and what learners will gain",
  "freeResources": [
    {
      "type": "article",
      "title": "Actual article title from a real website",
      "url": "https://real-website.com/actual-article"
    },
    {
      "type": "video",
      "title": "Real YouTube video title",
      "url": "https://www.youtube.com/watch?v=real-video-id"
    },
    {
      "type": "article",
      "title": "Another real article",
      "url": "https://another-real-site.com/article"
    }
  ],
  "premiumResources": [
    {
      "type": "course",
      "title": "Real course name from Udemy/Coursera",
      "url": "https://www.udemy.com/course/real-course-slug/",
      "discount": "30% Off"
    },
    {
      "type": "course",
      "title": "Another real course",
      "url": "https://www.coursera.org/learn/real-course",
      "discount": "Free Trial"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Use REAL, WORKING URLs from actual websites
2. Free resources should include:
   - 2-3 high-quality articles from sites like Medium, blogs, official docs
   - 1-2 YouTube tutorial videos (actual video URLs)
   - Mix article and video types
3. Premium resources should include:
   - 1-2 actual courses from Udemy, Coursera, Pluralsight, LinkedIn Learning
   - Real course URLs that exist
   - Appropriate discount tags (20% Off, 30% Off, Free Trial, etc.)
4. Description should be engaging, clear, and beginner-friendly
5. Return ONLY valid JSON, no markdown formatting

Focus on quality, reputable sources. Research current, popular resources for this topic.`;

    const { error, output } = await runModelPrompt(prompt);

    if (error) {
      console.error('Claude API error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate resources',
        error,
      });
    }

    // Ensure output is a string and clean it
    let text = (typeof output === 'string' ? output : String(output ?? '')).trim();
    text = cleanClaudeJsonResponse(text);

    let resourceData: {
      description: string;
      freeResources: Array<{ type: string; title: string; url: string }>;
      premiumResources: Array<{ type: string; title: string; url: string; discount?: string }>;
    };

    try {
      resourceData = JSON.parse(text);
    } catch {
      resourceData = buildFallbackResources(nodeTitle, nodeDescription);
    }

    return res.json({
      success: true,
      data: resourceData,
    });
  } catch (error) {
    console.error('Resource generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate resources',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get Node with AI-Generated Resources (combines with existing node data)
router.post('/enrich-node', async (req: Request, res: Response) => {
  try {
    const { nodeId, nodeTitle, nodeDescription, roadmapId } = req.body as {
      nodeId?: string;
      nodeTitle?: string;
      nodeDescription?: string;
      roadmapId?: string;
    };

    if (!nodeTitle) {
      return res.status(400).json({
        success: false,
        message: 'Node title is required',
      });
    }

    const prompt = `For the learning topic "${nodeTitle}", provide enriched information and curated resources.

Current Description: ${nodeDescription || 'None'}

Generate a JSON response with:
{
  "enhancedDescription": "A comprehensive 4-5 sentence description that explains: (1) what this topic is, (2) why it's important in the field, (3) key concepts covered, (4) real-world applications",
  "learningOutcomes": [
    "After studying this, you will be able to...",
    "You will understand...",
    "You will master..."
  ],
  "prerequisites": [
    "Basic concept 1 you should know first",
    "Basic concept 2"
  ],
  "estimatedTimeToLearn": "2-3 weeks with 5 hours/week",
  "difficulty": "beginner",
  "freeResources": [
    {
      "type": "article",
      "title": "Real article from authoritative source",
      "url": "https://real-url.com/article",
      "description": "Brief 1-sentence description of what this resource covers"
    },
    {
      "type": "video",
      "title": "Real YouTube tutorial",
      "url": "https://youtube.com/watch?v=real-id",
      "description": "What you'll learn from this video"
    },
    {
      "type": "article",
      "title": "Another article",
      "url": "https://real-site.com",
      "description": "Brief description"
    }
  ],
  "premiumResources": [
    {
      "type": "course",
      "title": "Real Udemy/Coursera course",
      "url": "https://real-course-url.com",
      "price": "$49.99",
      "discount": "30% Off",
      "description": "What this course covers"
    }
  ],
  "relatedTopics": [
    "Related topic 1 to explore next",
    "Related topic 2"
  ]
}

Use REAL URLs from reputable sources. Be specific and practical.`;

    const { error, output } = await runModelPrompt(prompt);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to enrich node data',
        error,
      });
    }

    let text = (typeof output === 'string' ? output : String(output ?? '')).trim();
    text = cleanClaudeJsonResponse(text);

    const enrichedData = JSON.parse(text);

    return res.json({
      success: true,
      nodeId,
      roadmapId,
      ...enrichedData,
    });
  } catch (error) {
    console.error('Node enrichment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to enrich node',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
