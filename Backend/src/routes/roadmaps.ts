/**
 * Roadmaps API Routes
 * 
 * Endpoints for listing and retrieving roadmaps with their skill graphs.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { Prisma } from '@prisma/client';

const router = Router();

type RoadmapNodeType = 'topic' | 'subtopic' | 'section' | 'checkpoint';

interface NarrowLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InfoBlock {
  text: string;
  position: { x: number; y: number };
  width: number;
  type: 'tip' | 'warning' | 'info' | 'recommendation';
}

function deriveNodeType(skill: { name: string; slug: string; resources: Prisma.JsonValue | null }): RoadmapNodeType {
  const resources = skill.resources;

  if (resources && typeof resources === 'object' && !Array.isArray(resources)) {
    const metadata = (resources as Record<string, unknown>).metadata;
    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
      const nodeType = (metadata as Record<string, unknown>).nodeType;
      if (nodeType === 'topic' || nodeType === 'subtopic' || nodeType === 'section' || nodeType === 'checkpoint') {
        return nodeType;
      }
    }
  }

  if (skill.slug.startsWith('cp-') || /checkpoint/i.test(skill.name)) {
    return 'checkpoint';
  }

  return 'topic';
}

function extractLayout(skill: { resources: Prisma.JsonValue | null }): NarrowLayout | null {
  const resources = skill.resources;

  if (!resources || typeof resources !== 'object' || Array.isArray(resources)) {
    return null;
  }

  const metadata = (resources as Record<string, unknown>).metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const layout = (metadata as Record<string, unknown>).layout;
  if (!layout || typeof layout !== 'object' || Array.isArray(layout)) {
    return null;
  }

  const l = layout as Record<string, unknown>;
  const x = typeof l.x === 'number' ? l.x : null;
  const y = typeof l.y === 'number' ? l.y : null;
  const width = typeof l.width === 'number' ? l.width : null;
  const height = typeof l.height === 'number' ? l.height : null;

  if (x === null || y === null || width === null || height === null) {
    return null;
  }

  return { x, y, width, height };
}

function extractInfoBlocks(skill: { resources: Prisma.JsonValue | null } | null | undefined): InfoBlock[] {
  if (!skill?.resources || typeof skill.resources !== 'object' || Array.isArray(skill.resources)) {
    return [];
  }

  const metadata = (skill.resources as Record<string, unknown>).metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return [];
  }

  const infoBlocks = (metadata as Record<string, unknown>).infoBlocks;
  if (!Array.isArray(infoBlocks)) {
    return [];
  }

  return infoBlocks
    .map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return null;
      }
      const block = item as Record<string, unknown>;
      const text = typeof block.text === 'string' ? block.text : null;
      const width = typeof block.width === 'number' ? block.width : null;
      const type = block.type;
      const position = block.position;

      if (
        !text ||
        width === null ||
        (type !== 'tip' && type !== 'warning' && type !== 'info' && type !== 'recommendation') ||
        !position ||
        typeof position !== 'object' ||
        Array.isArray(position)
      ) {
        return null;
      }

      const pos = position as Record<string, unknown>;
      const x = typeof pos.x === 'number' ? pos.x : null;
      const y = typeof pos.y === 'number' ? pos.y : null;

      if (x === null || y === null) {
        return null;
      }

      return {
        text,
        position: { x, y },
        width,
        type,
      } as InfoBlock;
    })
    .filter((block): block is InfoBlock => Boolean(block));
}

// Type for roadmap with skills included
type RoadmapWithSkills = Prisma.RoadmapGetPayload<{
  include: {
    skills: {
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
        data: {
          ...node,
          type: deriveNodeType(node),
        },
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

    const nodes = roadmap.skills.map((skill) => {
      const layout = extractLayout(skill);
      return {
        ...skill,
        type: deriveNodeType(skill),
        ...(layout
          ? {
              position: { x: layout.x, y: layout.y },
              width: layout.width,
              height: layout.height,
            }
          : {}),
      };
    });

    const rootInfoBlocks = extractInfoBlocks(roadmap.rootSkill as any);

    res.json({
      id: roadmap.id,
      name: roadmap.name,
      slug: roadmap.slug,
      description: roadmap.description,
      icon: roadmap.icon,
      color: roadmap.color,
      rootSkillId: roadmap.rootSkillId,
      infoBlocks: rootInfoBlocks,
      nodes,
      edges: edges,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
