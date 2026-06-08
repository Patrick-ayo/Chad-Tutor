import axios from 'axios';
import prisma from '../db/client';

type YouTubeCaptionTrack = {
  id: string;
  snippet?: {
    language?: string;
  };
};

type YouTubeCaptionsListResponse = {
  items?: YouTubeCaptionTrack[];
};

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

function cleanSrtTranscript(srtText: string): string {
  const lines = srtText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/^\d+$/.test(line))
    .filter((line) => !/^\d{2}:\d{2}:\d{2},\d{3}\s+-->\s+\d{2}:\d{2}:\d{2},\d{3}$/.test(line));

  return lines.join(' ').replace(/\s+/g, ' ').trim();
}

function pickEnglishCaptionTrack(items: YouTubeCaptionTrack[]): YouTubeCaptionTrack | undefined {
  const exactEn = items.find((item) => item.snippet?.language === 'en');
  if (exactEn) {
    return exactEn;
  }

  const regional = items.find((item) => item.snippet?.language === 'en-US' || item.snippet?.language === 'en-GB');
  if (regional) {
    return regional;
  }

  return items.find((item) => item.snippet?.language?.toLowerCase().startsWith('en'));
}

async function cacheTranscript(videoId: string, rawTranscript: string) {
  await prisma.lectureSummary.upsert({
    where: { videoId },
    update: { rawTranscript },
    create: {
      videoId,
      rawTranscript,
    },
  });
}

export async function fetchTranscript(videoId: string): Promise<string> {
  try {
    const existing = await prisma.lectureSummary.findUnique({
      where: { videoId },
      select: { rawTranscript: true },
    });

    if (existing && existing.rawTranscript !== null) {
      return existing.rawTranscript;
    }

    if (!YOUTUBE_API_KEY) {
      console.warn('[transcript.service] YOUTUBE_API_KEY missing; returning empty transcript');
      await cacheTranscript(videoId, '');
      return '';
    }

    const captionsListResponse = await axios.get<YouTubeCaptionsListResponse>(
      `${YOUTUBE_API_BASE}/captions`,
      {
        params: {
          part: 'snippet',
          videoId,
          key: YOUTUBE_API_KEY,
        },
      },
    );

    const tracks = Array.isArray(captionsListResponse.data?.items)
      ? captionsListResponse.data.items
      : [];

    if (tracks.length === 0) {
      await cacheTranscript(videoId, '');
      return '';
    }

    const selectedTrack = pickEnglishCaptionTrack(tracks);
    if (!selectedTrack?.id) {
      await cacheTranscript(videoId, '');
      return '';
    }

    const captionResponse = await axios.get<string>(
      `${YOUTUBE_API_BASE}/captions/${selectedTrack.id}`,
      {
        params: {
          tfmt: 'srt',
          key: YOUTUBE_API_KEY,
        },
        responseType: 'text',
      },
    );

    const cleanedTranscript = cleanSrtTranscript(captionResponse.data || '');
    await cacheTranscript(videoId, cleanedTranscript);

    return cleanedTranscript;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      await cacheTranscript(videoId, '');
      return '';
    }

    console.error('[transcript.service] Failed to fetch transcript:', error);

    try {
      await cacheTranscript(videoId, '');
    } catch (cacheError) {
      console.error('[transcript.service] Failed to cache transcript fallback:', cacheError);
    }

    return '';
  }
}
