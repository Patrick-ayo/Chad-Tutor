/**
 * Goal Service (Simplified)
 * 
 * Business logic for goal management.
 * Aligned with actual Prisma schema.
 */

import { goalRepo } from '../repositories';
import type { GoalStatus } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface GoalData {
  id: string;
  name: string;
  description?: string | null;
  deadline: Date;
  totalHours: number;
  completedHours: number;
  status: string;
  progress: number; // Computed from completedHours/totalHours
  createdAt: Date;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  deadline: Date;
  totalHours?: number;
}

export interface UpdateGoalInput {
  name?: string;
  description?: string;
  deadline?: Date;
  totalHours?: number;
  completedHours?: number;
  status?: GoalStatus;
}

// ============================================================================
// GOAL OPERATIONS
// ============================================================================

/**
 * Create a new goal for a user
 */
export async function createGoal(
  userId: string,
  _clerkId: string,
  input: CreateGoalInput
): Promise<GoalData> {
  const goal = await goalRepo.create({
    userId,
    name: input.name,
    description: input.description,
    deadline: input.deadline,
    totalHours: input.totalHours ?? 0,
  });

  return formatGoal(goal);
}

/**
 * Get all goals for a user
 */
export async function getUserGoals(userId: string): Promise<GoalData[]> {
  const goals = await goalRepo.findByUserId(userId);
  return goals.map(formatGoal);
}

/**
 * Get active goals for a user
 */
export async function getActiveGoals(userId: string): Promise<GoalData[]> {
  const goals = await goalRepo.findByUserId(userId);
  return goals.filter((g) => g.status === 'ACTIVE').map(formatGoal);
}

/**
 * Get a specific goal by ID
 */
export async function getGoalById(
  goalId: string,
  userId: string
): Promise<GoalData | null> {
  const goal = await goalRepo.findById(goalId);
  
  if (!goal || goal.userId !== userId) {
    return null;
  }

  return formatGoal(goal);
}

/**
 * Update a goal
 */
export async function updateGoal(
  goalId: string,
  userId: string,
  updates: UpdateGoalInput
): Promise<GoalData | null> {
  const existing = await goalRepo.findById(goalId);
  
  if (!existing || existing.userId !== userId) {
    return null;
  }

  const updated = await goalRepo.update(goalId, updates);
  return formatGoal(updated);
}

/**
 * Delete a goal
 */
export async function deleteGoal(
  goalId: string,
  userId: string
): Promise<boolean> {
  const existing = await goalRepo.findById(goalId);
  
  if (!existing || existing.userId !== userId) {
    return false;
  }

  await goalRepo.remove(goalId);
  return true;
}

/**
 * Update goal progress (by hours completed)
 */
export async function updateGoalProgress(
  goalId: string,
  userId: string,
  completedHours: number
): Promise<GoalData | null> {
  return updateGoal(goalId, userId, { completedHours });
}

/**
 * Mark goal as complete
 */
export async function completeGoal(
  goalId: string,
  userId: string
): Promise<GoalData | null> {
  const existing = await goalRepo.findById(goalId);
  if (!existing || existing.userId !== userId) {
    return null;
  }

  return updateGoal(goalId, userId, { 
    status: 'COMPLETED' as GoalStatus,
    completedHours: existing.totalHours,
  });
}

/**
 * Archive a goal
 */
export async function archiveGoal(
  goalId: string,
  userId: string
): Promise<GoalData | null> {
  return updateGoal(goalId, userId, { status: 'ABANDONED' as GoalStatus });
}

/**
 * Reactivate a goal
 */
export async function reactivateGoal(
  goalId: string,
  userId: string
): Promise<GoalData | null> {
  return updateGoal(goalId, userId, { status: 'ACTIVE' as GoalStatus });
}

/**
 * Get goal statistics for a user
 */
export async function getGoalStats(userId: string): Promise<{
  total: number;
  active: number;
  completed: number;
  averageProgress: number;
}> {
  const goals = await goalRepo.findByUserId(userId);

  const active = goals.filter((g) => g.status === 'ACTIVE');
  const completed = goals.filter((g) => g.status === 'COMPLETED');

  const totalProgress = goals.reduce((sum, g) => {
    const progress = g.totalHours > 0 ? (g.completedHours / g.totalHours) * 100 : 0;
    return sum + progress;
  }, 0);
  const averageProgress = goals.length > 0 ? totalProgress / goals.length : 0;

  return {
    total: goals.length,
    active: active.length,
    completed: completed.length,
    averageProgress: Math.round(averageProgress * 100) / 100,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function formatGoal(goal: {
  id: string;
  name: string;
  description: string | null;
  deadline: Date;
  totalHours: number;
  completedHours: number;
  status: string;
  createdAt: Date;
}): GoalData {
  const progress = goal.totalHours > 0 
    ? Math.round((goal.completedHours / goal.totalHours) * 100) 
    : 0;

  return {
    id: goal.id,
    name: goal.name,
    description: goal.description,
    deadline: goal.deadline,
    totalHours: goal.totalHours,
    completedHours: goal.completedHours,
    status: goal.status,
    progress,
    createdAt: goal.createdAt,
  };
}
