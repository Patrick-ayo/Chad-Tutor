import express, { Request, Response } from 'express';
import Bytez from '../lib/bytez';
import { runGeminiPrompt } from '../services/gemini.service';
import type { QuizResponse, StudyPlan } from '../types';
import config from '../config';
import { getChatFlowResponse } from '../services/chatbot-flow.service';

const router = express.Router();

router.post('/chat-flow', (req: Request, res: Response) => {
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

    return res.json({
      success: true,
      ...response,
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
