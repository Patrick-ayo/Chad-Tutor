/**
 * Skill Service
 * 
 * Business logic for skill search, CRUD, and progress tracking.
 * Works alongside skill-graph.service.ts for graph traversal.
 */

import * as skillRepo from '../repositories/skill.repo';
import { Difficulty, SkillStatus, MasteryLevel, Prisma } from '@prisma/client';
import { normalizeSkillName } from '../utils/normalization';

// ============================================================================
// TYPES
// ============================================================================

export interface SkillSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  difficulty: Difficulty;
  category: { name: string; slug: string };
  tags: Array<{ name: string; slug: string }>;
  isCanonical: boolean;
}

export interface SearchParams {
  query?: string;
  category?: string;
  difficulty?: Difficulty;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface UserProgressSummary {
  totalSkills: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  averageAccuracy: number;
  currentStreak: number;
}

// ============================================================================
// SEARCH SKILLS
// ============================================================================

/**
 * Search skills with filters and pagination.
 */
export async function searchSkills(params: SearchParams): Promise<{
  skills: SkillSearchResult[];
  total: number;
  meta: { limit: number; offset: number };
}> {
  const { query, category, difficulty, tags, limit = 20, offset = 0 } = params;
  
  const where: Prisma.SkillWhereInput = {
    isPublished: true,
    isCanonical: true,
    ...(query && {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { normalizedName: { contains: normalizeSkillName(query), mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ],
    }),
    ...(category && { category: { slug: category } }),
    ...(difficulty && { difficulty }),
    ...(tags?.length && { tags: { some: { slug: { in: tags } } } }),
  };
  
  const [skills, total] = await Promise.all([
    skillRepo.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        tags: { select: { name: true, slug: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      take: limit,
      skip: offset,
    }),
    skillRepo.count(where),
  ]);
  
  return {
    skills: skills.map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      difficulty: s.difficulty,
      category: s.category,
      tags: s.tags,
      isCanonical: s.isCanonical,
    })),
    total,
    meta: { limit, offset },
  };
}

// ============================================================================
// GET CATEGORIES
// ============================================================================

/**
 * Get all skill categories.
 */
export async function getCategories(): Promise<Array<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  skillCount: number;
}>> {
  const categories = await skillRepo.findAllCategories();
  
  // Get skill counts per category
  const counts = await Promise.all(
    categories.map(async (cat) => {
      const count = await skillRepo.count({ categoryId: cat.id, isPublished: true });
      return { id: cat.id, count };
    })
  );
  
  const countMap = new Map(counts.map((c) => [c.id, c.count]));
  
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    color: cat.color,
    skillCount: countMap.get(cat.id) ?? 0,
  }));
}

// ============================================================================
// GET TAGS
// ============================================================================

/**
 * Get all skill tags.
 */
export async function getTags(): Promise<Array<{
  id: string;
  name: string;
  slug: string;
  color: string | null;
}>> {
  const tags = await skillRepo.findAllTags();
  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    color: t.color,
  }));
}

// ============================================================================
// USER SKILL PROGRESS
// ============================================================================

/**
 * Get user's skill progress summary.
 */
export async function getUserProgressSummary(userId: string): Promise<UserProgressSummary> {
  const progress = await skillRepo.findUserProgressMany({
    where: { userId },
  });
  
  const completed = progress.filter(
    (p: any) => p.status === 'COMPLETED' || p.status === 'MASTERED'
  ).length;
  const inProgress = progress.filter((p: any) => p.status === 'IN_PROGRESS').length;
  const notStarted = progress.filter((p: any) => p.status === 'NOT_STARTED').length;
  
  const accuracies = progress.filter((p: any) => p.accuracyRate > 0).map((p: any) => p.accuracyRate);
  const averageAccuracy = accuracies.length > 0
    ? accuracies.reduce((a: number, b: number) => a + b, 0) / accuracies.length
    : 0;
  
  const currentStreak = Math.max(...progress.map((p: any) => p.currentStreak), 0);
  
  return {
    totalSkills: progress.length,
    completed,
    inProgress,
    notStarted,
    averageAccuracy,
    currentStreak: isFinite(currentStreak) ? currentStreak : 0,
  };
}

/**
 * Get user's progress for specific skills.
 */
export async function getUserSkillProgress(
  userId: string,
  skillIds?: string[]
): Promise<Array<{
  skillId: string;
  skillName: string;
  status: SkillStatus;
  progressPercent: number;
  masteryLevel: MasteryLevel;
  accuracyRate: number;
  currentStreak: number;
  lastPracticed: Date | null;
}>> {
  const where = {
    userId,
    ...(skillIds && { skillId: { in: skillIds } }),
  };
  
  const progress = await skillRepo.findUserProgressMany({
    where,
    include: { skill: { select: { name: true } } },
  });
  
  return progress.map((p: any) => ({
    skillId: p.skillId,
    skillName: p.skill.name,
    status: p.status,
    progressPercent: p.progressPercent,
    masteryLevel: p.masteryLevel,
    accuracyRate: p.accuracyRate,
    currentStreak: p.currentStreak,
    lastPracticed: p.lastPracticed,
  }));
}

/**
 * Update user's skill progress.
 * Called from session/planner when user practices.
 */
export async function updateUserProgress(
  userId: string,
  skillId: string,
  update: {
    progressPercent?: number;
    accuracyRate?: number;
    status?: SkillStatus;
    masteryLevel?: MasteryLevel;
  }
): Promise<void> {
  const existing = await skillRepo.findUserProgress(userId, skillId);
  
  const data: any = { ...update };
  
  // Auto-update status based on progress
  if (update.progressPercent !== undefined) {
    if (update.progressPercent >= 100 && !update.status) {
      data.status = 'COMPLETED';
      if (!existing?.completedAt) {
        data.completedAt = new Date();
      }
    } else if (update.progressPercent > 0 && !update.status) {
      data.status = 'IN_PROGRESS';
      if (!existing?.startedAt) {
        data.startedAt = new Date();
      }
    }
  }
  
  // Update last practiced
  data.lastPracticed = new Date();
  
  // Update streak
  if (existing) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastPracticed = existing.lastPracticed ? new Date(existing.lastPracticed) : null;
    if (lastPracticed) {
      lastPracticed.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastPracticed.getTime() === yesterday.getTime()) {
        // Consecutive day
        data.currentStreak = existing.currentStreak + 1;
        data.longestStreak = Math.max(existing.longestStreak, data.currentStreak);
      } else if (lastPracticed.getTime() !== today.getTime()) {
        // Streak broken
        data.currentStreak = 1;
      }
    } else {
      data.currentStreak = 1;
    }
  }
  
  await skillRepo.upsertUserProgress(userId, skillId, data);
}

// ============================================================================
// SKILL CRUD (Admin operations)
// ============================================================================

/**
 * Create a new skill.
 */
export async function createSkill(data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  categoryId: string;
  difficulty?: Difficulty;
  tagIds?: string[];
}): Promise<{ id: string }> {
  const skill = await skillRepo.create({
    name: data.name,
    slug: data.slug,
    normalizedName: normalizeSkillName(data.name),
    description: data.description,
    icon: data.icon,
    color: data.color,
    category: { connect: { id: data.categoryId } },
    difficulty: data.difficulty ?? 'BEGINNER',
    isPublished: false,
    ...(data.tagIds?.length && {
      tags: { connect: data.tagIds.map((id) => ({ id })) },
    }),
  });
  
  return { id: skill.id };
}

/**
 * Update a skill.
 */
export async function updateSkill(
  id: string,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    difficulty?: Difficulty;
    isPublished?: boolean;
  }
): Promise<void> {
  const updateData: any = { ...data };
  
  if (data.name) {
    updateData.normalizedName = normalizeSkillName(data.name);
  }
  
  await skillRepo.update(id, updateData);
}

/**
 * Publish a skill.
 */
export async function publishSkill(id: string): Promise<void> {
  await skillRepo.update(id, { isPublished: true });
}

/**
 * Get skill by ID.
 */
export async function getSkillById(id: string): Promise<SkillSearchResult | null> {
  const skill = await skillRepo.findById(id, {
    category: { select: { name: true, slug: true } },
    tags: { select: { name: true, slug: true } },
  });
  
  if (!skill) return null;
  
  return {
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    description: skill.description,
    difficulty: skill.difficulty,
    category: (skill as any).category,
    tags: (skill as any).tags,
    isCanonical: skill.isCanonical,
  };
}
