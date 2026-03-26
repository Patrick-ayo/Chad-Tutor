/**
 * Playlists Routes
 */

import { Router, Request, Response } from 'express';
import { requireUser } from '../middleware';
import { playlistService } from '../services';

const router = Router();

router.get('/', requireUser, async (req: Request, res: Response) => {
  try {
    const playlists = await playlistService.getUserPlaylists(req.user!.id);
    return res.json({ playlists });
  } catch (error) {
    console.error('Playlist fetch error:', error);
    return res.status(500).json({ error: 'Fetch Failed', message: 'Failed to fetch playlists' });
  }
});

router.post('/ingest', requireUser, async (req: Request, res: Response) => {
  try {
    const { name, description, externalSource, externalId, externalUrl, estimatedHours, thumbnailUrl, items } = req.body as {
      name?: string;
      description?: string;
      externalSource?: string;
      externalId?: string;
      externalUrl?: string;
      estimatedHours?: number;
      thumbnailUrl?: string;
      items?: Array<{
        title: string;
        description?: string;
        externalId?: string;
        externalUrl?: string;
        sequence: number;
        estimatedMinutes?: number;
        keyPoints?: string[];
        learningOutcomes?: string[];
      }>;
    };

    if (!name || !externalSource || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'name, externalSource, and non-empty items are required',
      });
    }

    const playlist = await playlistService.ingestPlaylist(req.user!.id, {
      name,
      description,
      externalSource,
      externalId,
      externalUrl,
      estimatedHours,
      thumbnailUrl,
      items,
    });

    return res.status(201).json({ playlist });
  } catch (error) {
    console.error('Playlist ingest error:', error);
    return res.status(500).json({ error: 'Create Failed', message: 'Failed to ingest playlist' });
  }
});

router.post('/link', requireUser, async (req: Request, res: Response) => {
  try {
    const { skillId, playlistId, resourceType, sequence } = req.body as {
      skillId?: string;
      playlistId?: string;
      resourceType?: string;
      sequence?: number;
    };

    if (!skillId || !playlistId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'skillId and playlistId are required',
      });
    }

    const link = await playlistService.linkPlaylistToSkill(req.user!.id, {
      skillId,
      playlistId,
      resourceType,
      sequence,
    });

    return res.status(201).json({ link });
  } catch (error) {
    console.error('Playlist link error:', error);
    return res.status(500).json({ error: 'Create Failed', message: 'Failed to link playlist to skill' });
  }
});

export default router;
