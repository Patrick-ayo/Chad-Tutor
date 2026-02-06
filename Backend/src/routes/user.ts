/**
 * User Routes
 * 
 * API endpoints for user management, bootstrap, and profile.
 * Uses the user service for business logic.
 */

import { Router, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { userService, goalService } from '../services';
import { requireAuth } from '../middleware';
import type { BootstrapResponse } from '../types/user';

const router = Router();

const MAX_RESETS_PER_DAY = 3;

/**
 * GET /api/user/bootstrap
 * First contact with system after Clerk login
 * Returns user state, active goal, enforcement flags
 */
router.get('/bootstrap', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;

    // Get or create user
    const auth = getAuth(req);
    const user = await userService.getOrCreateUser(
      clerkId,
      'pending@setup.com', // Will be updated via webhook
      'New User'
    );

    const isNewUser = user.createdAt.getTime() > Date.now() - 60000; // Created within last minute

    // Get active goals
    const activeGoals = await goalService.getActiveGoals(user.id);
    const activeGoal = activeGoals[0] || null;

    // Determine redirect
    let redirectTo: BootstrapResponse['redirectTo'] = 'dashboard';
    if (isNewUser || !activeGoal) {
      redirectTo = 'goal-builder';
    }

    // Calculate completion percentage for active goal
    const goalProgress = activeGoal && activeGoal.totalHours > 0
      ? Math.round((activeGoal.completedHours / activeGoal.totalHours) * 100)
      : 0;

    const response: BootstrapResponse = {
      isNewUser,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: ['learner'],
      },
      activeGoal: activeGoal
        ? {
            id: activeGoal.id,
            name: activeGoal.name,
            progress: goalProgress,
          }
        : null,
      enforcement: {
        focusModeEligible: true, // Simplified - no session tracking in schema
        resetCountToday: 0,
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

    const user = await userService.getUserByClerkId(clerkId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    res.json({
      id: user.id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
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

    const user = await userService.getUserByClerkId(clerkId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const updated = await userService.updateUserProfile(clerkId, { name, timezone });

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      timezone: updated.timezone,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Failed to update user profile',
    });
  }
});

// Note: Session tracking routes removed - schema doesn't have session tracking fields
// If session tracking is needed, a separate Session model should be added to the schema

export default router;
