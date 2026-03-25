import { Router, Request, Response } from 'express';
import prisma from '../db/client';

const router = Router();

type UserGoalsPayload = {
  selectedSkills?: unknown;
  selectedRoles?: unknown;
};

const ensureStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

// Get user goals
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    const goals = await prisma.userGoals.findUnique({
      where: { userId },
    });

    res.json({
      success: true,
      data: goals ?? { selectedSkills: [], selectedRoles: [] },
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch goals' });
  }
});

// Update user goals
router.post('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }
    const { selectedSkills, selectedRoles } = req.body as UserGoalsPayload;

    const safeSelectedSkills = ensureStringArray(selectedSkills);
    const safeSelectedRoles = ensureStringArray(selectedRoles);

    const goals = await prisma.userGoals.upsert({
      where: { userId },
      update: {
        selectedSkills: safeSelectedSkills,
        selectedRoles: safeSelectedRoles,
      },
      create: {
        userId,
        selectedSkills: safeSelectedSkills,
        selectedRoles: safeSelectedRoles,
      },
    });

    res.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    console.error('Error saving goals:', error);
    res.status(500).json({ success: false, message: 'Failed to save goals' });
  }
});

export default router;
