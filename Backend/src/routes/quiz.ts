/**
 * Quiz Routes
 */

import { Router, Request, Response } from 'express';
import { requireUser } from '../middleware';
import { quizService } from '../services';

const router = Router();

router.post('/attempt', requireUser, async (req: Request, res: Response) => {
  try {
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

    const attempt = await quizService.submitQuizAttempt(req.user!.id, {
      taskId,
      skillId,
      questionsCount,
      correctCount,
      timeSpentSeconds,
      metadata,
    });

    if (!attempt) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Task not found',
      });
    }

    return res.status(201).json({ attempt });
  } catch (error) {
    console.error('Quiz attempt error:', error);
    return res.status(500).json({ error: 'Create Failed', message: 'Failed to save quiz attempt' });
  }
});

router.get('/cache/:skillId', requireUser, async (req: Request, res: Response) => {
  try {
    const { skillId } = req.params as { skillId: string };

    const cache = await quizService.getSkillCache(req.user!.id, skillId);
    return res.json(cache);
  } catch (error) {
    console.error('Quiz cache fetch error:', error);
    return res.status(500).json({ error: 'Fetch Failed', message: 'Failed to fetch quiz cache' });
  }
});

router.get('/recent', requireUser, async (req: Request, res: Response) => {
  try {
    const limitRaw = req.query.limit as string | undefined;
    const limit = limitRaw ? Number(limitRaw) : 20;

    const attempts = await quizService.getRecentAttempts(req.user!.id, Number.isNaN(limit) ? 20 : limit);
    return res.json({ attempts });
  } catch (error) {
    console.error('Recent quiz attempts error:', error);
    return res.status(500).json({ error: 'Fetch Failed', message: 'Failed to fetch recent attempts' });
  }
});

export default router;
