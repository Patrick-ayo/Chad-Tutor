import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

router.post('/search', async (req: Request, res: Response) => {
  try {
    const { topic, maxResults = 5 } = req.body as { topic?: string; maxResults?: number };

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required',
      });
    }

    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'YouTube API key is not configured',
      });
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: YOUTUBE_API_KEY,
        q: `${topic} tutorial course`,
        part: 'snippet',
        type: 'video',
        maxResults,
        order: 'relevance',
        videoDuration: 'medium',
      },
    });

    const videos = (response.data.items || []).map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      channelName: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      publishedAt: item.snippet.publishedAt,
    }));

    return res.json({
      success: true,
      videos,
    });
  } catch (error: unknown) {
    console.error('YouTube search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search YouTube',
      error: axios.isAxiosError(error)
        ? error.response?.data || error.message
        : error instanceof Error
          ? error.message
          : 'Unknown error',
    });
  }
});

export default router;
