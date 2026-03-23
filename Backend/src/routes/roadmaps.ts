/**
 * Roadmaps API Routes
 * 
 * Endpoints for listing and retrieving roadmaps with their skill graphs.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { Prisma } from '@prisma/client';

const router = Router();

// Type for roadmap with skills included
type RoadmapWithSkills = Prisma.RoadmapGetPayload<{
  include: {
    skills: {
      select: {
        id: true;
        name: true;
        slug: true;
        description: true;
        difficulty: true;
        sortOrder: true;
        icon: true;
        color: true;
        resources: true;
      };
    };
    rootSkill: true;
  };
}>;

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * GET /api/roadmaps - List all published roadmaps
 * 
 * Returns roadmaps with node counts for display in the Explore tab.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { skills: true },
        },
      },
    });

    const result = roadmaps.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      icon: r.icon,
      color: r.color,
      nodeCount: r._count.skills,
      rootSkillId: r.rootSkillId,
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/roadmaps/:roadmapId/nodes/:nodeId - Get a specific roadmap node with resources
 *
 * Supports roadmap lookup by id or slug, and node lookup by id or slug.
 */
router.get(
  '/:roadmapId/nodes/:nodeId',
  async (req: Request<{ roadmapId: string; nodeId: string }>, res: Response) => {
    try {
      const { roadmapId, nodeId } = req.params;

      const node = await prisma.skill.findFirst({
        where: {
          OR: [{ id: nodeId }, { slug: nodeId }],
          roadmap: {
            OR: [{ id: roadmapId }, { slug: roadmapId }],
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          difficulty: true,
          sortOrder: true,
          icon: true,
          color: true,
          resources: true,
          roadmapId: true,
        },
      });

      if (!node) {
        return res.status(404).json({
          success: false,
          message: 'Node not found',
        });
      }

      return res.json({
        success: true,
        data: node,
      });
    } catch (error) {
      console.error('Error fetching node:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

/**
 * GET /api/roadmaps/:slug - Get roadmap details with graph data
 * 
 * Returns the roadmap with all its skills and edges for flowchart rendering.
 */
router.get('/:slug', async (req: Request<{ slug: string }>, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug;

    const roadmap = await prisma.roadmap.findUnique({
      where: { slug },
      include: {
        skills: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            difficulty: true,
            sortOrder: true,
            icon: true,
            color: true,
            resources: true,
          },
        },
        rootSkill: true,
      },
    }) as RoadmapWithSkills | null;

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    // Get all skill IDs for this roadmap
    const skillIds = roadmap.skills.map((s) => s.id);

    // Get edges between these skills
    const edges = await prisma.skillEdge.findMany({
      where: {
        sourceId: { in: skillIds },
        targetId: { in: skillIds },
      },
      select: {
        id: true,
        sourceId: true,
        targetId: true,
        edgeType: true,
        strength: true,
        isStrict: true,
      },
    });

    res.json({
      id: roadmap.id,
      name: roadmap.name,
      slug: roadmap.slug,
      description: roadmap.description,
      icon: roadmap.icon,
      color: roadmap.color,
      rootSkillId: roadmap.rootSkillId,
      nodes: roadmap.skills,
      edges: edges,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
