import { Router, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { User, UserSettings, Enforcement, Goal } from '../models';
import { requireAuth } from '../middleware';
import type { BootstrapResponse } from '../types/user';

const router = Router();

const MAX_RESETS_PER_DAY = 3;

/**
 * POST /api/user/bootstrap
 * First contact with system after Clerk login
 * Returns user state, active goal, enforcement flags
 */
router.get('/bootstrap', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    
    // Find or create user
    let user = await User.findOne({ clerkId });
    let isNewUser = false;
    
    if (!user) {
      // New user - will be created properly after Clerk webhook
      // For now, create minimal record
      isNewUser = true;
      
      // Get user info from Clerk
      const auth = getAuth(req);
      
      user = await User.create({
        clerkId,
        email: 'pending@setup.com', // Will be updated via webhook
        name: 'New User',
        timezone: 'UTC',
        roles: ['learner'],
      });
      
      // Create default settings
      await UserSettings.create({
        userId: user._id,
        clerkId,
      });
      
      // Create enforcement record
      await Enforcement.create({
        userId: user._id,
        clerkId,
      });
    }
    
    // Get enforcement state
    let enforcement = await Enforcement.findOne({ clerkId });
    if (!enforcement) {
      enforcement = await Enforcement.create({
        userId: user._id,
        clerkId,
      });
    }
    
    // Check if daily reset counter should be reset
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(enforcement.dailyResetDate);
    lastReset.setHours(0, 0, 0, 0);
    
    if (today > lastReset) {
      enforcement.dailyResetCount = 0;
      enforcement.dailyResetDate = today;
      await enforcement.save();
    }
    
    // Get active goal
    const activeGoal = await Goal.findOne({ 
      clerkId, 
      status: 'active' 
    }).sort({ createdAt: -1 });
    
    // Determine redirect
    let redirectTo: BootstrapResponse['redirectTo'] = 'dashboard';
    if (isNewUser) {
      redirectTo = 'goal-builder';
    } else if (!activeGoal) {
      redirectTo = 'goal-builder';
    }
    
    const response: BootstrapResponse = {
      isNewUser,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
      activeGoal: activeGoal ? {
        id: activeGoal._id.toString(),
        name: activeGoal.name,
        progress: activeGoal.totalTasks > 0 
          ? Math.round((activeGoal.completedTasks / activeGoal.totalTasks) * 100)
          : 0,
      } : null,
      enforcement: {
        focusModeEligible: enforcement.focusModeEligible,
        resetCountToday: enforcement.dailyResetCount,
        maxResetsPerDay: MAX_RESETS_PER_DAY,
      },
      onboardingRequired: isNewUser,
      redirectTo,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Bootstrap error:', error);
    res.status(500).json({
      error: 'Bootstrap Failed',
      message: 'Failed to initialize user session',
    });
  }
});

/**
 * GET /api/user/profile
 * Get current user's profile
 */
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }
    
    res.json({
      id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      roles: user.roles,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Failed to fetch user profile',
    });
  }
});

/**
 * PATCH /api/user/profile
 * Update user profile (limited fields)
 */
router.patch('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const { name, timezone } = req.body;
    
    const updateData: Partial<{ name: string; timezone: string }> = {};
    if (name) updateData.name = name;
    if (timezone) updateData.timezone = timezone;
    
    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: updateData },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Failed to update user profile',
    });
  }
});

export default router;
