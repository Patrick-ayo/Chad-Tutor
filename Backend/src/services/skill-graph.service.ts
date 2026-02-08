/**
 * Skill Graph Service
 * 
 * Pure graph traversal logic for skills.
 * All hierarchy is modeled via edges, not parentId/children fields.
 * Depth is computed dynamically, never stored.
 */

import * as skillRepo from '../repositories/skill.repo';
import { SkillEdgeType, SelectionSource, Difficulty } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface SkillNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  difficulty: Difficulty;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };
  tags: Array<{ name: string; slug: string; color: string | null }>;
  isCanonical: boolean;
}

export interface SkillNodeWithSubskills extends SkillNode {
  subskills: SkillNodeWithSubskills[];
  computedDepth: number;
}

export interface GraphTraversalResult {
  nodes: SkillNode[];
  edges: Array<{
    sourceId: string;
    targetId: string;
    edgeType: SkillEdgeType;
    strength: number;
    isStrict: boolean;
  }>;
}

export interface PrerequisiteResult {
  strict: SkillNode[];
  recommended: SkillNode[];
}

export interface SelectionResult {
  selectedSkills: Array<{ id: string; name: string; sourceType: string }>;
  totalCount: number;
}

// ============================================================================
// COMPUTED DEPTH (Never stored!)
// ============================================================================

/**
 * Compute depth by walking SUBSKILL_OF edges upward until root.
 * This is computed on-demand, never stored.
 */
export async function computeDepth(skillId: string): Promise<number> {
  let depth = 0;
  let currentId = skillId;
  const visited = new Set<string>();
  
  while (true) {
    if (visited.has(currentId)) break; // Cycle protection
    visited.add(currentId);
    
    // Find SUBSKILL_OF edge where this skill is the source
    const parentEdge = await skillRepo.findEdge({
      where: {
        sourceId: currentId,
        edgeType: 'SUBSKILL_OF',
      },
    });
    
    if (!parentEdge) break; // Reached root
    
    depth++;
    currentId = parentEdge.targetId;
  }
  
  return depth;
}

// ============================================================================
// GET ROOT SKILLS (No SUBSKILL_OF edges from them)
// ============================================================================

/**
 * Get all root skills (languages, main categories).
 * These are skills with no outgoing SUBSKILL_OF edge.
 */
export async function getRootSkills(): Promise<SkillNode[]> {
  const roots = await skillRepo.findRootSkills({
    category: true,
    tags: true,
  });
  
  return roots.map(mapToSkillNode);
}

// ============================================================================
// GET SKILL WITH SUBSKILLS (via edges)
// ============================================================================

/**
 * Get a skill with its subskills recursively via SUBSKILL_OF edges.
 * Depth is computed, not stored.
 */
export async function getSkillWithSubskills(
  skillId: string,
  maxDepth: number = 3
): Promise<SkillNodeWithSubskills | null> {
  const skill = await skillRepo.findById(skillId, {
    category: true,
    tags: true,
  });
  
  if (!skill) return null;
  
  // Build tree recursively
  return buildSubskillTree(skill, 0, maxDepth);
}

async function buildSubskillTree(
  skillData: any,
  currentDepth: number,
  maxDepth: number
): Promise<SkillNodeWithSubskills> {
  const subskills: SkillNodeWithSubskills[] = [];
  
  if (currentDepth < maxDepth) {
    // Find skills where SUBSKILL_OF edge points TO this skill (this skill is target)
    const edges = await skillRepo.findEdgesTo(skillData.id, 'SUBSKILL_OF', {
      source: {
        include: { category: true, tags: true },
      },
    });
    
    for (const edge of edges) {
      const childNode = await buildSubskillTree(edge.source, currentDepth + 1, maxDepth);
      subskills.push(childNode);
    }
    
    // Sort subskills by sortOrder
    subskills.sort((a, b) => {
      const aOrder = (skillData.sortOrder ?? 0);
      const bOrder = (skillData.sortOrder ?? 0);
      return aOrder - bOrder;
    });
  }
  
  return {
    ...mapToSkillNode(skillData),
    subskills,
    computedDepth: currentDepth,
  };
}

// ============================================================================
// GET PREREQUISITES
// ============================================================================

/**
 * Get prerequisites for a skill, separated by strict/recommended.
 */
export async function getPrerequisites(skillId: string): Promise<PrerequisiteResult> {
  const edges = await skillRepo.findEdgesFrom(skillId, 'PREREQUISITE', {
    target: {
      include: { category: true, tags: true },
    },
  });
  
  const strict: SkillNode[] = [];
  const recommended: SkillNode[] = [];
  
  for (const edge of edges) {
    const node = mapToSkillNode(edge.target);
    if (edge.isStrict) {
      strict.push(node);
    } else {
      recommended.push(node);
    }
  }
  
  return { strict, recommended };
}

// ============================================================================
// GET RELATED SKILLS
// ============================================================================

/**
 * Get related skills (RELATED, ALTERNATIVE, BUILDS_ON, COMPLEMENTS edges).
 */
export async function getRelatedSkills(
  skillId: string
): Promise<Array<SkillNode & { relation: SkillEdgeType; strength: number }>> {
  const relatedTypes: SkillEdgeType[] = ['RELATED', 'ALTERNATIVE', 'BUILDS_ON', 'COMPLEMENTS'];
  
  const edges = await skillRepo.findEdges({
    where: {
      OR: [
        { sourceId: skillId, edgeType: { in: relatedTypes } },
        { targetId: skillId, edgeType: { in: relatedTypes } },
      ],
    },
    include: {
      source: { include: { category: true, tags: true } },
      target: { include: { category: true, tags: true } },
    },
  });
  
  const result: Array<SkillNode & { relation: SkillEdgeType; strength: number }> = [];
  
  for (const edge of edges) {
    // Get the "other" skill in the relationship
    const otherSkill = edge.sourceId === skillId ? edge.target : edge.source;
    result.push({
      ...mapToSkillNode(otherSkill),
      relation: edge.edgeType,
      strength: edge.strength,
    });
  }
  
  return result;
}

// ============================================================================
// GET ALL SUBSKILL IDS (for selection expansion)
// ============================================================================

/**
 * Get all subskill IDs recursively (for expanding selection).
 */
export async function getAllSubskillIds(parentId: string): Promise<string[]> {
  const result: string[] = [];
  const queue = [parentId];
  const visited = new Set<string>();
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    
    // Find skills that have SUBSKILL_OF edge pointing TO current
    const edges = await skillRepo.findEdgesTo(current, 'SUBSKILL_OF');
    
    for (const edge of edges) {
      result.push(edge.sourceId);
      queue.push(edge.sourceId);
    }
  }
  
  return result;
}

// ============================================================================
// SELECT SKILLS FOR USER
// ============================================================================

/**
 * Select skills for a user's learning path.
 * Optionally expands subskills based on includeSubskills flag.
 */
export async function selectSkillsForUser(
  userId: string,
  selections: Array<{
    skillId: string;
    includeSubskills: boolean;
    sourceType?: SelectionSource;
  }>
): Promise<SelectionResult> {
  // Clear existing selections
  await skillRepo.deleteUserSelections(userId);
  
  const allSelected = new Map<string, { id: string; name: string; sourceType: string }>();
  
  for (const sel of selections) {
    const skill = await skillRepo.findById(sel.skillId);
    if (!skill) continue;
    
    const sourceType = sel.sourceType ?? 'USER_SELECTED';
    
    allSelected.set(skill.id, {
      id: skill.id,
      name: skill.name,
      sourceType,
    });
    
    // Save selection
    await skillRepo.createUserSelection({
      userId,
      skillId: skill.id,
      sourceType,
      includeSubskills: sel.includeSubskills,
    });
    
    // Expand subskills if requested
    if (sel.includeSubskills) {
      const subskillIds = await getAllSubskillIds(skill.id);
      for (const subId of subskillIds) {
        if (!allSelected.has(subId)) {
          const sub = await skillRepo.findById(subId);
          if (sub) {
            allSelected.set(subId, {
              id: subId,
              name: sub.name,
              sourceType: 'GOAL_DERIVED',
            });
          }
        }
      }
    }
  }
  
  return {
    selectedSkills: Array.from(allSelected.values()),
    totalCount: allSelected.size,
  };
}

// ============================================================================
// GET USER SELECTED SKILLS
// ============================================================================

/**
 * Get user's currently selected skills.
 */
export async function getUserSelectedSkills(
  userId: string
): Promise<Array<{ skill: SkillNode; sourceType: SelectionSource; includeSubskills: boolean }>> {
  const selections = await skillRepo.findUserSelections(userId, {
    skill: {
      include: { category: true, tags: true },
    },
  });
  
  return selections.map((sel: any) => ({
    skill: mapToSkillNode(sel.skill),
    sourceType: sel.sourceType,
    includeSubskills: sel.includeSubskills,
  }));
}

// ============================================================================
// SKILL GRAPH FOR VISUALIZATION
// ============================================================================

/**
 * Get skill graph for visualization.
 * Returns nodes and edges for rendering.
 */
export async function getSkillGraph(rootId?: string): Promise<GraphTraversalResult> {
  let skills: any[];
  
  if (rootId) {
    // Get skill and all its subskills
    const subskillIds = await getAllSubskillIds(rootId);
    skills = await skillRepo.findMany({
      where: {
        id: { in: [rootId, ...subskillIds] },
        isPublished: true,
      },
      include: { category: true, tags: true },
    });
  } else {
    // Get all published skills
    skills = await skillRepo.findMany({
      where: { isPublished: true },
      include: { category: true, tags: true },
    });
  }
  
  const skillIds = new Set(skills.map((s) => s.id));
  
  // Get all edges between these skills
  const edges = await skillRepo.findEdges({
    where: {
      OR: [
        { sourceId: { in: Array.from(skillIds) } },
        { targetId: { in: Array.from(skillIds) } },
      ],
    },
  });
  
  return {
    nodes: skills.map(mapToSkillNode),
    edges: edges
      .filter((e: any) => skillIds.has(e.sourceId) && skillIds.has(e.targetId))
      .map((e: any) => ({
        sourceId: e.sourceId,
        targetId: e.targetId,
        edgeType: e.edgeType,
        strength: e.strength,
        isStrict: e.isStrict,
      })),
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function mapToSkillNode(s: any): SkillNode {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    icon: s.icon,
    color: s.color,
    difficulty: s.difficulty,
    category: s.category ? {
      id: s.category.id,
      name: s.category.name,
      slug: s.category.slug,
      color: s.category.color,
    } : { id: '', name: '', slug: '', color: null },
    tags: (s.tags || []).map((t: any) => ({
      name: t.name,
      slug: t.slug,
      color: t.color,
    })),
    isCanonical: s.isCanonical,
  };
}
