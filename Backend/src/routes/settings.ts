/**
 * Settings Routes
 * 
 * API endpoints for user settings management.
 * Uses the user service for business logic.
 */

import { Router, Request, Response } from 'express';
import { userService } from '../services';
import { requireAuth } from '../middleware';

const router = Router();

/**
 * GET /api/settings
 * Get current user's settings
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

    const settings = await userService.getUserSettings(user.id);

    res.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch settings',
    });
  }
});

/**
 * PATCH /api/settings
 * Update user settings with change logging
 */
router.patch('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const updates = req.body;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    // Extract valid settings fields matching the Prisma schema
    const validUpdates: Partial<{
      activeDays: string[];
      dailyMinutes: Record<string, number>;
      sessionDuration: number;
      breakFrequency: number;
      enforcementLevel: string;
      rescheduleMode: string;
      emailNotifications: boolean;
      pushNotifications: boolean;
      dailyReminder: boolean;
      weeklyDigest: boolean;
      missedTaskAlert: boolean;
      aiExplanations: boolean;
      aiQuizGeneration: boolean;
      aiProgressInsights: boolean;
      dataRetentionDays: number;
    }> = {};

    if (Array.isArray(updates.activeDays)) {
      validUpdates.activeDays = updates.activeDays;
    }
    if (typeof updates.dailyMinutes === 'object') {
      validUpdates.dailyMinutes = updates.dailyMinutes;
    }
    if (typeof updates.sessionDuration === 'number') {
      validUpdates.sessionDuration = updates.sessionDuration;
    }
    if (typeof updates.breakFrequency === 'number') {
      validUpdates.breakFrequency = updates.breakFrequency;
    }
    if (typeof updates.enforcementLevel === 'string') {
      validUpdates.enforcementLevel = updates.enforcementLevel;
    }
    if (typeof updates.rescheduleMode === 'string') {
      validUpdates.rescheduleMode = updates.rescheduleMode;
    }
    if (typeof updates.emailNotifications === 'boolean') {
      validUpdates.emailNotifications = updates.emailNotifications;
    }
    if (typeof updates.pushNotifications === 'boolean') {
      validUpdates.pushNotifications = updates.pushNotifications;
    }
    if (typeof updates.dailyReminder === 'boolean') {
      validUpdates.dailyReminder = updates.dailyReminder;
    }
    if (typeof updates.weeklyDigest === 'boolean') {
      validUpdates.weeklyDigest = updates.weeklyDigest;
    }
    if (typeof updates.missedTaskAlert === 'boolean') {
      validUpdates.missedTaskAlert = updates.missedTaskAlert;
    }
    if (typeof updates.aiExplanations === 'boolean') {
      validUpdates.aiExplanations = updates.aiExplanations;
    }
    if (typeof updates.aiQuizGeneration === 'boolean') {
      validUpdates.aiQuizGeneration = updates.aiQuizGeneration;
    }
    if (typeof updates.aiProgressInsights === 'boolean') {
      validUpdates.aiProgressInsights = updates.aiProgressInsights;
    }
    if (typeof updates.dataRetentionDays === 'number') {
      validUpdates.dataRetentionDays = updates.dataRetentionDays;
    }

    const settings = await userService.updateUserSettings(
      user.id,
      validUpdates,
      clerkId,
      updates.reason
    );

    res.json({
      settings,
      message: 'Settings updated',
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Failed to update settings',
    });
  }
});

/**
 * GET /api/settings/history
 * Get settings change history
 */
router.get('/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const limit = parseInt(req.query.limit as string) || 20;

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const history = await userService.getSettingsChangeHistory(user.id, limit);

    res.json(history);
  } catch (error) {
    console.error('Settings history error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch settings history',
    });
  }
});

export default router;
