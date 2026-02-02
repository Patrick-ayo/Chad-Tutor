import { Router, Request, Response } from 'express';
import { UserSettings, SettingsChangeLog, User } from '../models';
import { requireAuth } from '../middleware';

const router = Router();

// Settings that affect roadmap/schedule/analytics
const IMPACTFUL_SETTINGS: Record<string, string[]> = {
  'availability.activeDays': ['schedule', 'roadmap'],
  'availability.minutesPerDay': ['schedule', 'roadmap'],
  'availability.preferredSessionLength': ['schedule'],
  'availability.maxSessionsPerDay': ['schedule'],
  'behavior.intensity': ['schedule', 'roadmap'],
  'behavior.autoSkipCompleted': ['schedule'],
};

/**
 * GET /api/settings
 * Get current user's settings
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    
    let settings = await UserSettings.findOne({ clerkId });
    
    if (!settings) {
      // Create default settings
      const user = await User.findOne({ clerkId });
      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }
      
      settings = await UserSettings.create({
        userId: user._id,
        clerkId,
      });
    }
    
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
    
    const settings = await UserSettings.findOne({ clerkId });
    
    if (!settings) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Settings not found',
      });
    }
    
    // Track changes for logging
    const changes: {
      section: string;
      field: string;
      oldValue: unknown;
      newValue: unknown;
      impact: string[];
    }[] = [];
    
    // Apply updates and track changes
    for (const [section, sectionUpdates] of Object.entries(updates)) {
      if (typeof sectionUpdates !== 'object' || sectionUpdates === null) continue;
      
      for (const [field, newValue] of Object.entries(sectionUpdates as Record<string, unknown>)) {
        const settingsSection = settings.get(section);
        if (!settingsSection) continue;
        
        const oldValue = (settingsSection as Record<string, unknown>)[field];
        
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          const impactKey = `${section}.${field}`;
          const impact = IMPACTFUL_SETTINGS[impactKey] || [];
          
          changes.push({
            section,
            field,
            oldValue,
            newValue,
            impact,
          });
          
          // Apply the update
          (settingsSection as Record<string, unknown>)[field] = newValue;
        }
      }
    }
    
    if (changes.length > 0) {
      const previousVersion = settings.version;
      settings.version += 1;
      
      await settings.save();
      
      // Log the changes
      await SettingsChangeLog.create({
        userId: settings.userId,
        clerkId,
        changes,
        previousVersion,
        newVersion: settings.version,
      });
    }
    
    res.json({
      settings,
      changesApplied: changes.length,
      impacts: [...new Set(changes.flatMap((c) => c.impact))],
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
    
    const history = await SettingsChangeLog
      .find({ clerkId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
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
