/**
 * Skills API Routes
 * 
 * Endpoints for skill search, graph traversal, and user selection.
 * Pure graph-based architecture - no parentId/children, only edges.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { Difficulty, SelectionSource } from '@prisma/client';

import * as skillService from '../services/skill.service';
import * as skillGraph from '../services/skill-graph.service';
import { requireAuth } from '../middleware/auth';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  tags: z.string().optional(), // Comma-separated
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

const getSkillSchema = z.object({
  maxDepth: z.coerce.number().min(0).max(10).optional(),
});

const selectSchema = z.object({
  selections: z.array(
    z.object({
      skillId: z.string().uuid(),
      includeSubskills: z.boolean().default(true),
      sourceType: z.enum([
        'USER_SELECTED',
        'AI_RECOMMENDED',
        'ROLE_REQUIRED',
        'GOAL_DERIVED',
        'PREREQUISITE',
      ]).optional(),
    })
  ).min(1),
});

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * GET /api/skills - Search skills
 * 
 * Query params:
 *   - search: Search query
 *   - category: Category slug filter
 *   - difficulty: BEGINNER | INTERMEDIATE | ADVANCED | EXPERT
 *   - tags: Comma-separated tag slugs
 *   - limit: Max results (default 20, max 100)
 *   - offset: Pagination offset
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = searchSchema.parse(req.query);
    
    const result = await skillService.searchSkills({
      query: params.search,
      category: params.category,
      difficulty: params.difficulty as Difficulty | undefined,
      tags: params.tags?.split(',').map((t) => t.trim()).filter(Boolean),
      limit: params.limit,
      offset: params.offset,
    });
    
    res.json({
      skills: result.skills,
      total: result.total,
      meta: result.meta,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      });
    }
    next(error);
  }
});

/**
 * GET /api/skills/roots - Get root skills (languages, main categories)
 * 
 * Returns skills with no SUBSKILL_OF edge (top-level skills).
 */
router.get('/roots', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const skills = await skillGraph.getRootSkills();
    res.json({ skills });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/skills/categories - Get all skill categories
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await skillService.getCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/skills/tags - Get all skill tags
 */
router.get('/tags', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await skillService.getTags();
    res.json({ tags });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/skills/graph - Get skill graph for visualization
 * 
 * Query params:
 *   - root: Optional root skill ID to start from
 * 
 * Returns nodes and edges for graph rendering.
 */
router.get('/graph', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rootId = req.query.root as string | undefined;
    const graph = await skillGraph.getSkillGraph(rootId);
    res.json(graph);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/skills/:id - Get skill with subskills
 * 
 * Query params:
 *   - maxDepth: Maximum depth to traverse (default 3, max 10)
 * 
 * Returns skill with nested subskills via SUBSKILL_OF edges.
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { maxDepth } = getSkillSchema.parse(req.query);
    
    const skill = await skillGraph.getSkillWithSubskills(id, maxDepth ?? 3);
    
    if (!skill) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Skill not found',
      });
    }
    
    res.json({ skill });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      });
    }
    next(error);
  }
});

/**
 * GET /api/skills/:id/prerequisites - Get skill prerequisites
 * 
 * Returns:
 *   - strict: Must be completed before this skill
 *   - recommended: Suggested but not required
 */
router.get('/:id/prerequisites', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const prerequisites = await skillGraph.getPrerequisites(id);
    res.json(prerequisites);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/skills/:id/related - Get related skills
 */
router.get('/:id/related', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const related = await skillGraph.getRelatedSkills(id);
    res.json({ related });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

/**
 * POST /api/skills/select - Select skills for learning path
 * 
 * Body:
 *   - selections: Array of { skillId, includeSubskills, sourceType? }
 * 
 * When includeSubskills is true, all subskills (via SUBSKILL_OF edges)
 * are automatically added with sourceType: GOAL_DERIVED.
 */
router.post('/select', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { selections } = selectSchema.parse(req.body);
    
    const result = await skillGraph.selectSkillsForUser(
      userId,
      selections.map((s) => ({
        skillId: s.skillId,
        includeSubskills: s.includeSubskills,
        sourceType: s.sourceType as SelectionSource | undefined,
      }))
    );
    
    res.json({
      message: 'Skills selected successfully',
      ...result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      });
    }
    next(error);
  }
});

/**
 * GET /api/skills/user/selected - Get user's selected skills
 */
router.get('/user/selected', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const selected = await skillGraph.getUserSelectedSkills(userId);
    res.json({ selected });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/skills/user/progress - Get user's skill progress
 * 
 * Query params:
 *   - skillIds: Comma-separated skill IDs (optional, returns all if omitted)
 */
router.get('/user/progress', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const skillIds = req.query.skillIds
      ? (req.query.skillIds as string).split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    
    const [progress, summary] = await Promise.all([
      skillService.getUserSkillProgress(userId, skillIds),
      skillService.getUserProgressSummary(userId),
    ]);
    
    res.json({ progress, summary });
  } catch (error) {
    next(error);
  }
});

export default router;
