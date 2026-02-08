/**
 * Skill Repository
 * 
 * Data access layer for Skill, SkillEdge, and related models.
 * Supports pure graph structure with canonical deduplication.
 */

import { prisma, TransactionClient } from './base.repo';
import type { Prisma, SkillEdgeType, SelectionSource } from '@prisma/client';

export type Skill = Prisma.SkillGetPayload<{}>;
export type SkillEdge = Prisma.SkillEdgeGetPayload<{}>;
export type SkillCategory = Prisma.SkillCategoryGetPayload<{}>;
export type SkillTag = Prisma.SkillTagGetPayload<{}>;
export type UserSkillProgress = Prisma.UserSkillProgressGetPayload<{}>;
export type UserSelectedSkill = Prisma.UserSelectedSkillGetPayload<{}>;

// ============================================================================
// SKILL CRUD
// ============================================================================

/**
 * Find skill by ID with optional includes
 */
export async function findById(
  id: string,
  include?: Prisma.SkillInclude,
  tx?: TransactionClient
): Promise<Skill | null> {
  const client = tx || prisma;
  return client.skill.findUnique({
    where: { id },
    include,
  }) as Promise<Skill | null>;
}

/**
 * Find skill by slug
 */
export async function findBySlug(
  slug: string,
  include?: Prisma.SkillInclude,
  tx?: TransactionClient
): Promise<Skill | null> {
  const client = tx || prisma;
  return client.skill.findUnique({
    where: { slug },
    include,
  }) as Promise<Skill | null>;
}

/**
 * Find canonical skill by normalized name
 */
export async function findCanonicalByNormalizedName(
  normalizedName: string,
  tx?: TransactionClient
): Promise<Skill | null> {
  const client = tx || prisma;
  return client.skill.findFirst({
    where: {
      normalizedName,
      isCanonical: true,
    },
  });
}

/**
 * Find many skills with filters
 */
export async function findMany(
  args: Prisma.SkillFindManyArgs,
  tx?: TransactionClient
): Promise<any[]> {
  const client = tx || prisma;
  return client.skill.findMany(args);
}

/**
 * Count skills matching criteria
 */
export async function count(
  where: Prisma.SkillWhereInput,
  tx?: TransactionClient
): Promise<number> {
  const client = tx || prisma;
  return client.skill.count({ where });
}

/**
 * Create a skill
 */
export async function create(
  data: Prisma.SkillCreateInput,
  tx?: TransactionClient
): Promise<Skill> {
  const client = tx || prisma;
  return client.skill.create({ data });
}

/**
 * Update a skill
 */
export async function update(
  id: string,
  data: Prisma.SkillUpdateInput,
  tx?: TransactionClient
): Promise<Skill> {
  const client = tx || prisma;
  return client.skill.update({
    where: { id },
    data,
  });
}

/**
 * Find root skills (skills with no SUBSKILL_OF edge pointing from them)
 */
export async function findRootSkills(
  include?: Prisma.SkillInclude,
  tx?: TransactionClient
): Promise<any[]> {
  const client = tx || prisma;
  
  // Find skills that have no SUBSKILL_OF edges where they are the source
  return client.skill.findMany({
    where: {
      isPublished: true,
      isCanonical: true,
      edgesFrom: {
        none: {
          edgeType: 'SUBSKILL_OF',
        },
      },
    },
    include,
    orderBy: [
      { category: { sortOrder: 'asc' } },
      { sortOrder: 'asc' },
      { name: 'asc' },
    ],
  });
}

// ============================================================================
// SKILL EDGES (GRAPH)
// ============================================================================

/**
 * Find edge by ID
 */
export async function findEdgeById(
  id: string,
  include?: Prisma.SkillEdgeInclude,
  tx?: TransactionClient
): Promise<SkillEdge | null> {
  const client = tx || prisma;
  return client.skillEdge.findUnique({
    where: { id },
    include,
  }) as Promise<SkillEdge | null>;
}

/**
 * Find edges with filters
 */
export async function findEdges(
  args: Prisma.SkillEdgeFindManyArgs,
  tx?: TransactionClient
): Promise<any[]> {
  const client = tx || prisma;
  return client.skillEdge.findMany(args);
}

/**
 * Find edges where skill is source
 */
export async function findEdgesFrom(
  sourceId: string,
  edgeType?: SkillEdgeType,
  include?: Prisma.SkillEdgeInclude,
  tx?: TransactionClient
): Promise<any[]> {
  const client = tx || prisma;
  return client.skillEdge.findMany({
    where: {
      sourceId,
      ...(edgeType && { edgeType }),
    },
    include,
  });
}

/**
 * Find edges where skill is target
 */
export async function findEdgesTo(
  targetId: string,
  edgeType?: SkillEdgeType,
  include?: Prisma.SkillEdgeInclude,
  tx?: TransactionClient
): Promise<any[]> {
  const client = tx || prisma;
  return client.skillEdge.findMany({
    where: {
      targetId,
      ...(edgeType && { edgeType }),
    },
    include,
  });
}

/**
 * Find first edge matching criteria
 */
export async function findEdge(
  args: Prisma.SkillEdgeFindFirstArgs,
  tx?: TransactionClient
): Promise<SkillEdge | null> {
  const client = tx || prisma;
  return client.skillEdge.findFirst(args);
}

/**
 * Create an edge
 */
export async function createEdge(
  data: Prisma.SkillEdgeCreateInput,
  tx?: TransactionClient
): Promise<SkillEdge> {
  const client = tx || prisma;
  return client.skillEdge.create({ data });
}

/**
 * Create edge using connect syntax (for seeding)
 */
export async function createEdgeByIds(
  sourceId: string,
  targetId: string,
  edgeType: SkillEdgeType,
  options?: { strength?: number; isStrict?: boolean; metadata?: any },
  tx?: TransactionClient
): Promise<SkillEdge> {
  const client = tx || prisma;
  return client.skillEdge.create({
    data: {
      source: { connect: { id: sourceId } },
      target: { connect: { id: targetId } },
      edgeType,
      strength: options?.strength ?? 1.0,
      isStrict: options?.isStrict ?? false,
      metadata: options?.metadata,
    },
  });
}

/**
 * Delete an edge
 */
export async function deleteEdge(
  id: string,
  tx?: TransactionClient
): Promise<SkillEdge> {
  const client = tx || prisma;
  return client.skillEdge.delete({
    where: { id },
  });
}

// ============================================================================
// CATEGORIES & TAGS
// ============================================================================

/**
 * Find all categories
 */
export async function findAllCategories(
  tx?: TransactionClient
): Promise<SkillCategory[]> {
  const client = tx || prisma;
  return client.skillCategory.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Find category by slug
 */
export async function findCategoryBySlug(
  slug: string,
  tx?: TransactionClient
): Promise<SkillCategory | null> {
  const client = tx || prisma;
  return client.skillCategory.findUnique({
    where: { slug },
  });
}

/**
 * Create category
 */
export async function createCategory(
  data: Prisma.SkillCategoryCreateInput,
  tx?: TransactionClient
): Promise<SkillCategory> {
  const client = tx || prisma;
  return client.skillCategory.create({ data });
}

/**
 * Find all tags
 */
export async function findAllTags(
  tx?: TransactionClient
): Promise<SkillTag[]> {
  const client = tx || prisma;
  return client.skillTag.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Find or create tag by slug
 */
export async function findOrCreateTag(
  name: string,
  slug: string,
  color?: string,
  tx?: TransactionClient
): Promise<SkillTag> {
  const client = tx || prisma;
  return client.skillTag.upsert({
    where: { slug },
    create: { name, slug, color },
    update: {},
  });
}

// ============================================================================
// USER SKILL PROGRESS
// ============================================================================

/**
 * Find user progress for a skill
 */
export async function findUserProgress(
  userId: string,
  skillId: string,
  tx?: TransactionClient
): Promise<UserSkillProgress | null> {
  const client = tx || prisma;
  return client.userSkillProgress.findUnique({
    where: {
      userId_skillId: { userId, skillId },
    },
  });
}

/**
 * Find all user progress
 */
export async function findUserProgressMany(
  args: Prisma.UserSkillProgressFindManyArgs,
  tx?: TransactionClient
): Promise<any[]> {
  const client = tx || prisma;
  return client.userSkillProgress.findMany(args);
}

/**
 * Upsert user progress
 */
export async function upsertUserProgress(
  userId: string,
  skillId: string,
  data: Partial<Omit<UserSkillProgress, 'id' | 'userId' | 'skillId' | 'createdAt' | 'updatedAt'>>,
  tx?: TransactionClient
): Promise<UserSkillProgress> {
  const client = tx || prisma;
  return client.userSkillProgress.upsert({
    where: {
      userId_skillId: { userId, skillId },
    },
    create: {
      userId,
      skillId,
      ...data,
    },
    update: data,
  });
}

// ============================================================================
// USER SELECTED SKILLS
// ============================================================================

/**
 * Find user's selected skills
 */
export async function findUserSelections(
  userId: string,
  include?: Prisma.UserSelectedSkillInclude,
  tx?: TransactionClient
): Promise<any[]> {
  const client = tx || prisma;
  return client.userSelectedSkill.findMany({
    where: { userId },
    include,
    orderBy: { priority: 'asc' },
  });
}

/**
 * Create user skill selection
 */
export async function createUserSelection(
  data: {
    userId: string;
    skillId: string;
    sourceType?: SelectionSource;
    includeSubskills?: boolean;
    priority?: number;
  },
  tx?: TransactionClient
): Promise<UserSelectedSkill> {
  const client = tx || prisma;
  return client.userSelectedSkill.create({
    data: {
      user: { connect: { id: data.userId } },
      skill: { connect: { id: data.skillId } },
      sourceType: data.sourceType ?? 'USER_SELECTED',
      includeSubskills: data.includeSubskills ?? true,
      priority: data.priority ?? 0,
    },
  });
}

/**
 * Delete all user selections
 */
export async function deleteUserSelections(
  userId: string,
  tx?: TransactionClient
): Promise<{ count: number }> {
  const client = tx || prisma;
  return client.userSelectedSkill.deleteMany({
    where: { userId },
  });
}

/**
 * Delete specific user selection
 */
export async function deleteUserSelection(
  userId: string,
  skillId: string,
  tx?: TransactionClient
): Promise<UserSelectedSkill> {
  const client = tx || prisma;
  return client.userSelectedSkill.delete({
    where: {
      userId_skillId: { userId, skillId },
    },
  });
}

// Re-export prisma and transaction helper
export { prisma, TransactionClient };
