/**
 * Quiz Routes
 */

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware';
import { quizService, userService } from '../services';

const router = Router();

router.post('/attempt', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const { taskId, skillId, questionsCount, correctCount, timeSpentSeconds, metadata } = req.body as {
      taskId?: string;
      skillId?: string;
      questionsCount?: number;
      correctCount?: number;
      timeSpentSeconds?: number;
      metadata?: unknown;
    };

    if (typeof questionsCount !== 'number' || typeof correctCount !== 'number') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'questionsCount and correctCount are required numbers',
      });
    }

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const attempt = await quizService.submitQuizAttempt(user.id, {
      taskId,
      skillId,
      questionsCount,
      correctCount,
      timeSpentSeconds,
      metadata,
    });

    return res.status(201).json({ attempt });
  } catch (error) {
    console.error('Quiz attempt error:', error);
    return res.status(500).json({ error: 'Create Failed', message: 'Failed to save quiz attempt' });
  }
});

router.get('/cache/:skillId', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const { skillId } = req.params as { skillId: string };

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const cache = await quizService.getSkillCache(user.id, skillId);
    return res.json(cache);
  } catch (error) {
    console.error('Quiz cache fetch error:', error);
    return res.status(500).json({ error: 'Fetch Failed', message: 'Failed to fetch quiz cache' });
  }
});

router.get('/recent', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const limitRaw = req.query.limit as string | undefined;
    const limit = limitRaw ? Number(limitRaw) : 20;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const attempts = await quizService.getRecentAttempts(user.id, Number.isNaN(limit) ? 20 : limit);
    return res.json({ attempts });
  } catch (error) {
    console.error('Recent quiz attempts error:', error);
    return res.status(500).json({ error: 'Fetch Failed', message: 'Failed to fetch recent attempts' });
  }
});

export default router;
