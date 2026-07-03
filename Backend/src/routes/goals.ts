/**
 * Goals Routes
 * 
 * API endpoints for goal management.
 * Uses the goal service for business logic.
 */

import { Router, Request, Response } from 'express';
import { goalService, plannerService } from '../services';
import { generateDetailedRoadmapForUser } from '../services/detailedRoadmap.service';
import { asyncHandler, requireUser } from '../middleware';
import { goalRepo, playlistRepo } from '../repositories';
import prisma from '../db/client';
import { TaskStatus, TaskPriority } from '@prisma/client';

const router = Router();

/**
 * GET /api/goals
 * Get all goals for the current user
 */
router.get('/', requireUser, async (req: Request, res: Response) => {
  try {
    const goals = await goalService.getUserGoals(req.user!.id);

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
router.get('/active', requireUser, async (req: Request, res: Response) => {
  try {
    const goals = await goalService.getActiveGoals(req.user!.id);

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
router.get('/stats', requireUser, async (req: Request, res: Response) => {
  try {
    const stats = await goalService.getGoalStats(req.user!.id);

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
router.get('/:id', requireUser, async (req: Request, res: Response) => {
  try {
    const goalId = req.params.id as string;

    const goal = await goalService.getGoalById(goalId, req.user!.id);

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
router.post('/', requireUser, async (req: Request, res: Response) => {
  try {
    const { name, description, deadline, totalHours, generatedRoadmapTasks, tasks } = req.body;
    
    // Support both property names to be safe based on user's example
    const roadmapTasks = generatedRoadmapTasks || tasks;

    if (!name || !deadline) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name and deadline are required',
      });
    }

    const goal = await goalService.createGoal(req.user!.id, req.user!.clerkId, {
      name,
      description,
      deadline: new Date(deadline),
      totalHours,
    });

    const playlistIds = req.body.playlistIds;
    if (playlistIds && Array.isArray(playlistIds) && playlistIds.length > 0) {
      // Trigger async roadmap generation so tasks populate
      await generateDetailedRoadmapForUser({
        userId: req.user!.id,
        goalId: goal.id,
        goalName: goal.name,
        topicName: goal.name,
        playlistIds,
      });
    }

    if (roadmapTasks && Array.isArray(roadmapTasks) && roadmapTasks.length > 0) {
      // Map the goalId onto the generated tasks
      const tasksToSave = roadmapTasks.map((task: any) => ({
        title: task.title || 'Untitled Task',
        description: task.notes || task.description,
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : new Date(),
        estimatedMinutes: task.estimatedMinutes || task.duration || 25,
        priority: task.priority === 'HIGH' || task.type === 'exam' ? TaskPriority.HIGH : TaskPriority.MEDIUM,
        status: TaskStatus.SCHEDULED,
        roadmapId: task.roadmapId,
        topicId: task.topicId,
        subtopicId: task.subtopicId,
        duration: task.duration || task.estimatedMinutes || 25,
        sequenceNumber: task.sequenceNumber,
        videoId: task.videoId,
        videoUrl: task.videoUrl,
        videoTitle: task.videoTitle,
        goalId: goal.id,
        userId: req.user!.id,
      }));

      // Persist the tasks
      await prisma.studyTask.createMany({
        data: tasksToSave,
      });
    }

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
router.patch('/:id', requireUser, asyncHandler(async (req: Request, res: Response) => {
    const goalId = req.params.id as string;
    const updates = req.body;

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

    const goal = await goalService.updateGoal(goalId, req.user!.id, validUpdates);

    res.json({ goal });
}));

/**
 * PATCH /api/goals/:id/progress
 * Update goal progress (completed hours)
 */
router.patch('/:id/progress', requireUser, asyncHandler(async (req: Request, res: Response) => {
    const goalId = req.params.id as string;
    const { completedHours } = req.body;

    if (typeof completedHours !== 'number') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'completedHours must be a number',
      });
    }

    const goal = await goalService.updateGoalProgress(goalId, req.user!.id, completedHours);

    res.json({ goal });
}));

/**
 * POST /api/goals/:id/complete
 * Mark a goal as complete
 */
router.post('/:id/complete', requireUser, asyncHandler(async (req: Request, res: Response) => {
    const goalId = req.params.id as string;

    const goal = await goalService.completeGoal(goalId, req.user!.id);

    res.json({ goal, message: 'Goal completed' });
}));

/**
 * POST /api/goals/:id/archive
 * Archive a goal
 */
router.post('/:id/archive', requireUser, asyncHandler(async (req: Request, res: Response) => {
    const goalId = req.params.id as string;

    const goal = await goalService.archiveGoal(goalId, req.user!.id);

    res.json({ goal, message: 'Goal archived' });
}));

/**
 * POST /api/goals/:id/reactivate
 * Reactivate a goal
 */
router.post('/:id/reactivate', requireUser, asyncHandler(async (req: Request, res: Response) => {
    const goalId = req.params.id as string;

    const goal = await goalService.reactivateGoal(goalId, req.user!.id);

    res.json({ goal, message: 'Goal reactivated' });
}));

/**
 * POST /api/goals/:goalId/playlists
 * Link an existing playlist to the goal.
 */
router.post('/:goalId/playlists', requireUser, asyncHandler(async (req: Request, res: Response) => {
    const goalId = req.params.goalId as string;
    const { playlistId } = req.body as { playlistId?: string };

    if (!playlistId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'playlistId is required',
      });
    }

    const existingGoal = await goalRepo.findById(goalId, req.user!.id);
    if (!existingGoal) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Goal not found',
      });
    }

    const playlist = await playlistRepo.findById(playlistId, req.user!.id);
    if (!playlist) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Playlist not found',
      });
    }

    const linkedAt = new Date().toISOString();
    const link = {
      goalId,
      playlistId,
      playlistName: playlist.name,
      linkedAt,
    };

    const milestones = Array.isArray(existingGoal.milestones) ? [...existingGoal.milestones] : [];
    milestones.push(link);

    await goalRepo.update(goalId, req.user!.id, { milestones: milestones as object[] });
    await plannerService.recomputeGoalSchedule(req.user!.id, goalId, 'playlist-added');

    return res.json({ link, recomputeTriggered: true });
}));

/**
 * DELETE /api/goals/:id
 * Delete a goal
 */
router.delete('/:id', requireUser, asyncHandler(async (req: Request, res: Response) => {
    const goalId = req.params.id as string;

    await goalService.deleteGoal(goalId, req.user!.id);

    res.json({ message: 'Goal deleted' });
}));

export default router;
