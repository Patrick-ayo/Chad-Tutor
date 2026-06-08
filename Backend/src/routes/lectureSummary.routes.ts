import { Router, Request, Response } from 'express';
import { requireUser, asyncHandler } from '../middleware';
import {
  getTranscriptSummary,
  getTopicOverview,
  getExpertInsight,
  getQuizQuestions,
} from '../services/lectureSummary.service';

const router = Router();

router.use(requireUser);

router.get(
  '/:videoId/transcript-summary',
  asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params as { videoId: string };
    const title = (req.query.title as string) || 'Untitled lecture';
    const taskId = req.query.taskId as string | undefined;

    const content = await getTranscriptSummary(videoId, title, taskId);

    return res.json({
      videoId,
      type: 'transcript-summary',
      content,
    });
  }),
);

router.get(
  '/:videoId/topic-overview',
  asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params as { videoId: string };
    const title = (req.query.title as string) || 'Untitled lecture';
    const topic = (req.query.topic as string) || title;
    const taskId = req.query.taskId as string | undefined;

    const content = await getTopicOverview(videoId, title, topic, taskId);

    return res.json({
      videoId,
      type: 'topic-overview',
      content,
    });
  }),
);

router.get(
  '/:videoId/expert-insight',
  asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params as { videoId: string };
    const title = (req.query.title as string) || 'Untitled lecture';
    const topic = (req.query.topic as string) || title;
    const taskId = req.query.taskId as string | undefined;

    const content = await getExpertInsight(videoId, title, topic, taskId);

    return res.json({
      videoId,
      type: 'expert-insight',
      content,
    });
  }),
);

router.get(
  '/:videoId/quiz',
  asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params as { videoId: string };
    const title = (req.query.title as string) || 'Untitled lecture';
    const topic = (req.query.topic as string) || title;
    const taskId = req.query.taskId as string | undefined;

    const questions = await getQuizQuestions(videoId, title, topic, taskId);

    return res.json({
      videoId,
      type: 'quiz',
      questions,
    });
  }),
);

router.get(
  '/:videoId/all',
  asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params as { videoId: string };
    const title = (req.query.title as string) || 'Untitled lecture';
    const topic = (req.query.topic as string) || title;
    const taskId = req.query.taskId as string | undefined;

    const [transcriptSummary, topicOverview, expertInsight, quizQuestions] = await Promise.all([
      getTranscriptSummary(videoId, title, taskId),
      getTopicOverview(videoId, title, topic, taskId),
      getExpertInsight(videoId, title, topic, taskId),
      getQuizQuestions(videoId, title, topic, taskId),
    ]);

    return res.json({
      videoId,
      transcriptSummary,
      topicOverview,
      expertInsight,
      quizQuestions,
    });
  }),
);

export default router;
