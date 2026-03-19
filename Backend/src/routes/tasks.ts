/**
 * Tasks Routes
 */

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware';
import { taskService, userService } from '../services';

const router = Router();

router.get('/date', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const dateQuery = req.query.date as string | undefined;
    const date = dateQuery ? new Date(dateQuery) : new Date();

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid date format' });
    }

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const tasks = await taskService.getTasksForDate(user.id, date);
    return res.json({ tasks });
  } catch (error) {
    console.error('Task by date error:', error);
    return res.status(500).json({ error: 'Fetch Failed', message: 'Failed to fetch tasks' });
  }
});

router.post('/:taskId/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
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

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const result = await taskService.completeTask(user.id, taskId, {
      completedDurationMinutes,
      quiz,
    });

    if (!result) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
    }

    return res.json(result);
  } catch (error) {
    console.error('Task complete error:', error);
    return res.status(500).json({ error: 'Update Failed', message: 'Failed to complete task' });
  }
});

router.post('/:taskId/missed', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const { taskId } = req.params as { taskId: string };
    const { reason } = req.body as { reason?: string };

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const task = await taskService.markTaskMissed(user.id, taskId, reason);
    if (!task) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
    }

    return res.json({ task });
  } catch (error) {
    console.error('Task missed error:', error);
    return res.status(500).json({ error: 'Update Failed', message: 'Failed to mark task as missed' });
  }
});

export default router;
