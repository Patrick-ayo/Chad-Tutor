/**
 * Tasks Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, requireUser } from '../middleware';
import { taskService } from '../services';

const router = Router();

router.get('/date', requireUser, asyncHandler(async (req: Request, res: Response) => {
  const dateQuery = req.query.date as string | undefined;
  const date = dateQuery ? new Date(dateQuery) : new Date();

  if (Number.isNaN(date.getTime())) {
    return res.status(400).json({ error: 'Bad Request', message: 'Invalid date format' });
  }

  const tasks = await taskService.getTasksForDate(req.user!.id, date);
  return res.json({ tasks });
}));

router.post('/:taskId/complete', requireUser, asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params as { taskId: string };
  const { completedDurationMinutes, quiz } = req.body as {
    completedDurationMinutes?: number;
    quiz?: {
      questionsCount: number;
      correctCount: number;
      timeSpentSeconds?: number;
      metadata?: unknown;
    };
  };

  const result = await taskService.completeTask(req.user!.id, taskId, {
    completedDurationMinutes,
    quiz,
  });

  return res.json(result);
}));

router.post('/:taskId/missed', requireUser, asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params as { taskId: string };
  const { reason } = req.body as { reason?: string };

  const task = await taskService.markTaskMissed(req.user!.id, taskId, reason);
  return res.json({ task });
}));

export default router;
