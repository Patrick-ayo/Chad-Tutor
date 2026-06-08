import { Router, Request, Response } from 'express';
import { asyncHandler, requireUser } from '../middleware';
import { generateDetailedRoadmapForUser } from '../services/detailedRoadmap.service';

const router = Router();

router.post(
  '/generate-detailed',
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      goalId,
      goalName,
      topicName,
      playlistIds,
      videos,
      startDate,
    } = req.body as {
      goalId?: string;
      goalName?: string;
      topicName?: string;
      playlistIds?: string[];
      videos?: Array<Record<string, unknown>>;
      startDate?: string;
    };

    const result = await generateDetailedRoadmapForUser({
      userId: req.user!.id,
      goalId,
      goalName: goalName ?? topicName ?? 'Learning Goal',
      topicName: topicName ?? goalName ?? 'Learning Goal',
      playlistIds: Array.isArray(playlistIds) ? playlistIds.filter((value): value is string => typeof value === 'string') : undefined,
      videos: Array.isArray(videos)
        ? videos
            .filter((video): video is Record<string, unknown> => Boolean(video) && typeof video === 'object')
            .map((video) => ({
              id: typeof video.id === 'string' && video.id.trim().length > 0
                ? video.id
                : (typeof video.title === 'string' && video.title.trim().length > 0 ? video.title : 'video'),
              title: typeof video.title === 'string' ? video.title : 'Video',
              channelName: typeof video.channelName === 'string' ? video.channelName : undefined,
              channelId: typeof video.channelId === 'string' ? video.channelId : undefined,
              durationSeconds: typeof video.durationSeconds === 'number' ? video.durationSeconds : undefined,
              duration: typeof video.duration === 'string' ? video.duration : undefined,
              topicId: typeof video.topicId === 'string' ? video.topicId : undefined,
              topicName: typeof video.topicName === 'string' ? video.topicName : undefined,
              subtopicId: typeof video.subtopicId === 'string' ? video.subtopicId : undefined,
              subtopicName: typeof video.subtopicName === 'string' ? video.subtopicName : undefined,
              playlistId: typeof video.playlistId === 'string' ? video.playlistId : undefined,
              playlistTitle: typeof video.playlistTitle === 'string' ? video.playlistTitle : undefined,
              videoUrl: typeof video.videoUrl === 'string' ? video.videoUrl : undefined,
              url: typeof video.url === 'string' ? video.url : undefined,
            }))
        : undefined,
      startDate,
    });

    return res.json({
      roadmap: result.roadmap,
      planner: {
        created: result.plannerTasksCreated,
        scheduled: result.scheduledTasks,
        source: result.source,
      },
    });
  }),
);

export default router;
