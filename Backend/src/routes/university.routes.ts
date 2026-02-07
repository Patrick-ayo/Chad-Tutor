/**
 * University Routes
 *
 * Thin route layer — validation + delegation only.
 * All business logic lives in university.service.ts.
 */

import { Router, Request, Response } from 'express';
import * as universityService from '../services/university.service';
import { ProviderFactory } from '../external/providers/ProviderFactory';

const router = Router();

// ----------------------------------------------------------------
// GET /api/universities/search?q=stanford&limit=20&provider=hipolabs
// ----------------------------------------------------------------
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit, provider } = req.query;

    // --- Validate query ---
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Query parameter "q" is required and must be a non-empty string',
      });
    }

    // --- Validate limit ---
    const parsedLimit = limit ? parseInt(limit as string, 10) : 20;
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Limit must be a number between 1 and 100',
      });
    }

    // --- Validate provider ---
    const providerName = (provider as string) || 'hipolabs';
    if (!ProviderFactory.has(providerName)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Unknown provider "${providerName}". Available: ${ProviderFactory.listNames().join(', ')}`,
      });
    }

    // --- Delegate to service ---
    const userId = (req as any).userId as string | undefined;

    const result = await universityService.searchUniversities(
      q.trim(),
      providerName,
      parsedLimit,
      userId,
    );

    return res.status(200).json({
      success: true,
      data: result.universities,
      meta: {
        cacheHit: result.cacheHit,
        provider: result.provider,
        latencyMs: result.latencyMs,
        totalResults: result.totalResults,
        query: q.trim(),
      },
    });
  } catch (error) {
    console.error('[UniversityRoutes] Search error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search universities',
    });
  }
});

// ----------------------------------------------------------------
// GET /api/universities/:id
// ----------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const university = await universityService.getUniversityById(req.params.id as string);

    if (!university) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'University not found',
      });
    }

    return res.status(200).json({ success: true, data: university });
  } catch (error) {
    console.error('[UniversityRoutes] Get error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve university',
    });
  }
});

// ----------------------------------------------------------------
// GET /api/universities/health/:provider
// ----------------------------------------------------------------
router.get('/health/:provider', async (req: Request, res: Response) => {
  try {
    const provider = req.params.provider as string;
    const healthy = await universityService.checkProviderHealth(provider);
    return res.status(200).json({ success: true, provider, healthy });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
