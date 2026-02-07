/**
 * Goals Routes
 * 
 * API endpoints for goal management.
 * Uses the goal service for business logic.
 */

import { Router, Request, Response } from 'express';
import { userService, goalService } from '../services';
import { requireAuth } from '../middleware';

const router = Router();

/**
 * GET /api/goals
 * Get all goals for the current user
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const goals = await goalService.getUserGoals(user.id);

    res.json({ goals });
  } catch (error) {
    console.error('Goals fetch error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch goals',
    });
  }
});

/**
 * GET /api/goals/active
 * Get active goals for the current user
 */
router.get('/active', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const goals = await goalService.getActiveGoals(user.id);

    res.json({ goals });
  } catch (error) {
    console.error('Active goals fetch error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch active goals',
    });
  }
});

/**
 * GET /api/goals/stats
 * Get goal statistics for the current user
 */
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const stats = await goalService.getGoalStats(user.id);

    res.json({ stats });
  } catch (error) {
    console.error('Goal stats error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch goal statistics',
    });
  }
});

/**
 * GET /api/goals/:id
 * Get a specific goal by ID
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const goalId = req.params.id as string;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const goal = await goalService.getGoalById(goalId, user.id);

    if (!goal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Goal not found',
      });
    }

    res.json({ goal });
  } catch (error) {
    console.error('Goal fetch error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch goal',
    });
  }
});

/**
 * POST /api/goals
 * Create a new goal
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const { name, description, deadline, totalHours } = req.body;

    if (!name || !deadline) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name and deadline are required',
      });
    }

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const goal = await goalService.createGoal(user.id, clerkId, {
      name,
      description,
      deadline: new Date(deadline),
      totalHours,
    });

    res.status(201).json({ goal });
  } catch (error) {
    console.error('Goal create error:', error);
    res.status(500).json({
      error: 'Create Failed',
      message: 'Failed to create goal',
    });
  }
});

/**
 * PATCH /api/goals/:id
 * Update a goal
 */
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const goalId = req.params.id as string;
    const updates = req.body;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    // Validate and sanitize updates to match UpdateGoalInput
    const validUpdates: {
      name?: string;
      description?: string;
      deadline?: Date;
      totalHours?: number;
      completedHours?: number;
      status?: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
    } = {};

    if (updates.name !== undefined) validUpdates.name = updates.name;
    if (updates.description !== undefined) validUpdates.description = updates.description;
    if (updates.deadline !== undefined) validUpdates.deadline = new Date(updates.deadline);
    if (updates.totalHours !== undefined) validUpdates.totalHours = updates.totalHours;
    if (updates.completedHours !== undefined) validUpdates.completedHours = updates.completedHours;
    if (updates.status !== undefined) {
      if (['ACTIVE', 'COMPLETED', 'ABANDONED'].includes(updates.status.toUpperCase())) {
        validUpdates.status = updates.status.toUpperCase() as 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
      }
    }

    const goal = await goalService.updateGoal(goalId, user.id, validUpdates);

    if (!goal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Goal not found',
      });
    }

    res.json({ goal });
  } catch (error) {
    console.error('Goal update error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Failed to update goal',
    });
  }
});

/**
 * PATCH /api/goals/:id/progress
 * Update goal progress (completed hours)
 */
router.patch('/:id/progress', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const goalId = req.params.id as string;
    const { completedHours } = req.body;

    if (typeof completedHours !== 'number') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'completedHours must be a number',
      });
    }

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const goal = await goalService.updateGoalProgress(goalId, user.id, completedHours);

    if (!goal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Goal not found',
      });
    }

    res.json({ goal });
  } catch (error) {
    console.error('Goal progress update error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Failed to update goal progress',
    });
  }
});

/**
 * POST /api/goals/:id/complete
 * Mark a goal as complete
 */
router.post('/:id/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const goalId = req.params.id as string;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const goal = await goalService.completeGoal(goalId, user.id);

    if (!goal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Goal not found',
      });
    }

    res.json({ goal, message: 'Goal completed' });
  } catch (error) {
    console.error('Goal complete error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Failed to complete goal',
    });
  }
});

/**
 * POST /api/goals/:id/archive
 * Archive a goal
 */
router.post('/:id/archive', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const goalId = req.params.id as string;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const goal = await goalService.archiveGoal(goalId, user.id);

    if (!goal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Goal not found',
      });
    }

    res.json({ goal, message: 'Goal archived' });
  } catch (error) {
    console.error('Goal archive error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Failed to archive goal',
    });
  }
});

/**
 * POST /api/goals/:id/reactivate
 * Reactivate a goal
 */
router.post('/:id/reactivate', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const goalId = req.params.id as string;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const goal = await goalService.reactivateGoal(goalId, user.id);

    if (!goal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Goal not found',
      });
    }

    res.json({ goal, message: 'Goal reactivated' });
  } catch (error) {
    console.error('Goal reactivate error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Failed to reactivate goal',
    });
  }
});

/**
 * DELETE /api/goals/:id
 * Delete a goal
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const goalId = req.params.id as string;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const deleted = await goalService.deleteGoal(goalId, user.id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Goal not found',
      });
    }

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Goal delete error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: 'Failed to delete goal',
    });
  }
});

export default router;
