/**
 * Planner Routes
 */

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware';
import { plannerService, userService } from '../services';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const user = await userService.getUserByClerkId(clerkId);

    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const planner = await plannerService.getPlannerSnapshot(user.id);
    return res.json({ planner });
  } catch (error) {
    console.error('Planner fetch error:', error);
    return res.status(500).json({ error: 'Fetch Failed', message: 'Failed to fetch planner data' });
  }
});

router.post('/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const { playlistIds, startDate } = req.body as { playlistIds?: string[]; startDate?: string };

    if (!playlistIds || playlistIds.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'playlistIds is required and must contain at least one playlist ID',
      });
    }

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const result = await plannerService.generateScheduleFromPlaylists(user.id, {
      playlistIds,
      startDate,
    });

    return res.status(201).json({ result });
  } catch (error) {
    console.error('Planner generate error:', error);
    return res.status(500).json({ error: 'Create Failed', message: 'Failed to generate schedule' });
  }
});

router.post('/resolve/:taskId', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const { taskId } = req.params as { taskId: string };
    const { type } = req.body as { type?: 'push-forward' | 'compress' | 'convert-revision' | 'drop' };

    if (!type) {
      return res.status(400).json({ error: 'Bad Request', message: 'resolution type is required' });
    }

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    const result = await plannerService.resolveMissedTask(user.id, taskId, type);
    if (!result) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
    }

    return res.json({ result });
  } catch (error) {
    console.error('Resolve missed task error:', error);
    return res.status(500).json({ error: 'Update Failed', message: 'Failed to resolve missed task' });
  }
});

export default router;
