/**
 * Settings Routes
 * 
 * API endpoints for user settings management.
 * Uses the user service for business logic.
 */

import { Router, Request, Response } from 'express';
import { userService } from '../services';
import { requireUser } from '../middleware';
import prisma from '../db/client';
import { encrypt, decrypt } from '../utils/encryption';

const router = Router();

/**
 * GET /api/settings
 * Get current user's settings
 */
router.get('/', requireUser, async (req: Request, res: Response) => {
  try {
    const settings = await userService.getUserSettings(req.user!.id);

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
router.patch('/', requireUser, async (req: Request, res: Response) => {
  try {
    const updates = req.body;

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
      req.user!.id,
      validUpdates,
      req.user!.clerkId,
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
router.get('/history', requireUser, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const history = await userService.getSettingsChangeHistory(req.user!.id, limit);

    res.json(history);
  } catch (error) {
    console.error('Settings history error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch settings history',
    });
  }
});

/**
 * GET /api/settings/universal-key
 * Get current user's LLM provider and masked key
 */
router.get('/universal-key', requireUser, async (req: Request, res: Response) => {
  try {
    const user: any = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { llmProvider: true, llmApiKey: true },
    });

    if (!user || !user.llmApiKey) {
      return res.json({ hasKey: false, provider: user?.llmProvider || 'gemini', maskedKey: null });
    }

    try {
      const decrypted = decrypt(user.llmApiKey);
      let maskedKey = '***';
      if (decrypted.length > 10) {
        if (user.llmProvider === 'openai') {
          maskedKey = `${decrypted.substring(0, 7)}****************${decrypted.substring(decrypted.length - 4)}`;
        } else {
          maskedKey = `${decrypted.substring(0, 6)}****************${decrypted.substring(decrypted.length - 4)}`;
        }
      }
      return res.json({ hasKey: true, provider: user.llmProvider, maskedKey });
    } catch (e) {
      console.error('Failed to decrypt API key:', e);
      return res.json({ hasKey: false, provider: user.llmProvider || 'gemini', maskedKey: null });
    }
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({ error: 'Fetch Failed' });
  }
});

/**
 * POST /api/settings/universal-key
 * Save encrypted universal API key and provider
 */
router.post('/universal-key', requireUser, async (req: Request, res: Response) => {
  try {
    const { provider, apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || !provider || typeof provider !== 'string') {
      return res.status(400).json({ error: 'Invalid API key or provider' });
    }

    const encryptedKey = encrypt(apiKey);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { 
        llmProvider: provider,
        llmApiKey: encryptedKey 
      },
    });

    res.json({ success: true, message: 'API key saved securely' });
  } catch (error) {
    console.error('Save API key error:', error);
    res.status(500).json({ error: 'Save Failed' });
  }
});

/**
 * DELETE /api/settings/universal-key
 * Remove API key
 */
router.delete('/universal-key', requireUser, async (req: Request, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { 
        llmProvider: 'gemini',
        llmApiKey: null 
      },
    });

    res.json({ success: true, message: 'API key removed' });
  } catch (error) {
    console.error('Remove API key error:', error);
    res.status(500).json({ error: 'Remove Failed' });
  }
});

export default router;
