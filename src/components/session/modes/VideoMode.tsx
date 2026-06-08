import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Clock, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { VideoMetadata } from "@/types/session";
import {
  completeTask,
  endUserBreak,
  startUserBreak,
  startUserSession,
  updateTaskProgress,
} from "@/lib/plannerApi";

interface VideoModeProps {
  videoData: VideoMetadata;
  taskId?: string | null;
  onAutoComplete?: () => void;
  onVideoWatched?: () => void;
  onProgressUpdate?: (percentComplete: number) => void;
}

type YouTubePlayerState = {
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
  getPlayerState: () => number;
};

type YouTubeWindow = Window & {
  YT?: {
    Player: new (
      element: HTMLIFrameElement,
      options: {
        events?: {
          onReady?: () => void;
          onStateChange?: (event: { data: number }) => void;
        };
      },
    ) => YouTubePlayerState;
    PlayerState: {
      UNSTARTED: number;
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
    };
  };
  onYouTubeIframeAPIReady?: () => void;
};

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  const youtubeWindow = window as YouTubeWindow;

  if (youtubeWindow.YT?.Player) {
    return Promise.resolve();
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');

      const previousReady = youtubeWindow.onYouTubeIframeAPIReady;
      youtubeWindow.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve();
      };

      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.onerror = () => reject(new Error('Failed to load YouTube IFrame API'));
        document.body.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

export function VideoMode({ videoData, taskId, onAutoComplete, onVideoWatched, onProgressUpdate }: VideoModeProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<YouTubePlayerState | null>(null);
  const intervalRef = useRef<number | null>(null);
  const breakTimerRef = useRef<number | null>(null);
  const lastReportedMinutesRef = useRef(-1);
  const sessionStartedRef = useRef(false);
  const breakActiveRef = useRef(false);
  const autoCompletedRef = useRef(false);
  const playerStateRef = useRef<number | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const hasVideoId = Boolean(videoData.videoId);

  useEffect(() => {
    console.log('VideoMode mounted with videoId:', videoData.videoId || '(missing)');
  }, [videoData.videoId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearProgressInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearBreakTimer = useCallback(() => {
    if (breakTimerRef.current !== null) {
      window.clearTimeout(breakTimerRef.current);
      breakTimerRef.current = null;
    }
  }, []);

  const reportProgress = useCallback(
    async (force = false) => {
      const player = playerRef.current;

      if (!taskId || !player || autoCompletedRef.current) {
        return;
      }

      const currentTimeSeconds = Math.max(0, player.getCurrentTime());
      const durationSeconds = Math.max(1, player.getDuration() || videoData.duration || 1);
      const watchedMinutes = Math.floor(currentTimeSeconds / 60);
      const percentComplete = Math.round((currentTimeSeconds / durationSeconds) * 100);

      if (percentComplete >= 95) {
        onProgressUpdate?.(percentComplete);

        if (autoCompletedRef.current) {
          return;
        }

        autoCompletedRef.current = true;
        clearProgressInterval();
        clearBreakTimer();

        try {
          await completeTask(taskId, {
            completedDurationMinutes: watchedMinutes,
          });
          onAutoComplete?.();
        } catch (error) {
          console.error('Failed to auto-complete task from video progress:', error);
          autoCompletedRef.current = false;
        }

        return;
      }

      if (!force && watchedMinutes <= lastReportedMinutesRef.current) {
        return;
      }

      if (watchedMinutes === lastReportedMinutesRef.current) {
        return;
      }

      lastReportedMinutesRef.current = watchedMinutes;
      onProgressUpdate?.(percentComplete);
      await updateTaskProgress(taskId, watchedMinutes, percentComplete);
    },
    [clearBreakTimer, clearProgressInterval, onAutoComplete, onProgressUpdate, taskId, videoData.duration],
  );

  const ensureSessionStarted = useCallback(() => {
    if (sessionStartedRef.current || !taskId) {
      return;
    }

    sessionStartedRef.current = true;
    void startUserSession();
  }, [taskId]);

  const ensureBreakStarted = useCallback(() => {
    if (!taskId || breakActiveRef.current || autoCompletedRef.current) {
      return;
    }

    breakActiveRef.current = true;
    void startUserBreak();
  }, [taskId]);

  const ensureBreakEnded = useCallback(() => {
    if (!breakActiveRef.current) {
      return;
    }

    breakActiveRef.current = false;
    void endUserBreak();
  }, []);

  const handlePauseState = useCallback(() => {
    clearProgressInterval();
    void reportProgress(true);

    clearBreakTimer();
    breakTimerRef.current = window.setTimeout(() => {
      ensureBreakStarted();
    }, 5 * 60 * 1000);
  }, [clearBreakTimer, clearProgressInterval, ensureBreakStarted, reportProgress]);

  const handlePlayingState = useCallback(() => {
    ensureSessionStarted();
    clearBreakTimer();
    ensureBreakEnded();

    if (intervalRef.current === null) {
      intervalRef.current = window.setInterval(() => {
        const currentState = playerStateRef.current;
        const youtubeWindow = window as YouTubeWindow;

        if (currentState !== youtubeWindow.YT?.PlayerState.PLAYING) {
          return;
        }

        void reportProgress();
      }, 30000);
    }
  }, [clearBreakTimer, ensureBreakEnded, ensureSessionStarted, reportProgress]);

  useEffect(() => {
    let cancelled = false;

    if (!hasVideoId) {
      setVideoLoaded(true);
      return;
    }

    setVideoLoaded(false);
    setPlayerReady(false);
    autoCompletedRef.current = false;
    lastReportedMinutesRef.current = -1;
    playerStateRef.current = null;
    clearProgressInterval();
    clearBreakTimer();

    const initializePlayer = async () => {
      try {
        await loadYouTubeIframeApi();

        if (cancelled || !iframeRef.current) {
          return;
        }

        const youtubeWindow = window as YouTubeWindow;

        const player = new youtubeWindow.YT!.Player(iframeRef.current, {
          events: {
            onReady: () => {
              if (cancelled) {
                return;
              }

              setVideoLoaded(true);
              setPlayerReady(true);
              onVideoWatched?.();
            },
            onStateChange: (event) => {
              if (cancelled) {
                return;
              }

              playerStateRef.current = event.data;

              if (event.data === youtubeWindow.YT!.PlayerState.PLAYING) {
                handlePlayingState();
                return;
              }

              if (event.data === youtubeWindow.YT!.PlayerState.PAUSED) {
                handlePauseState();
                return;
              }

              if (event.data === youtubeWindow.YT!.PlayerState.ENDED) {
                clearProgressInterval();
                clearBreakTimer();
                void reportProgress(true);
              }
            },
          },
        });

        playerRef.current = player;
      } catch (error) {
        console.error('Failed to initialize YouTube player:', error);
        setVideoLoaded(true);
      }
    };

    void initializePlayer();

    return () => {
      cancelled = true;
      clearProgressInterval();
      clearBreakTimer();

      if (!autoCompletedRef.current && sessionStartedRef.current) {
        ensureBreakStarted();
      }

      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [
    autoCompletedRef,
    clearBreakTimer,
    clearProgressInterval,
    ensureBreakStarted,
    handlePauseState,
    handlePlayingState,
    hasVideoId,
    onVideoWatched,
    reportProgress,
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            {!hasVideoId ? (
              <div className="h-full w-full flex items-center justify-center bg-black text-sm text-muted-foreground px-6 text-center">
                No designated video is attached to this scheduled task.
              </div>
            ) : !videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {hasVideoId ? (
              <iframe
                ref={iframeRef}
                key={videoData.videoId}
                src={`https://www.youtube.com/embed/${videoData.videoId}?rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&modestbranding=1`}
                className="w-full h-full border-0"
                title={videoData.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl leading-tight">{videoData.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(videoData.duration)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={!hasVideoId}
                >
                  <a href={hasVideoId ? `https://youtube.com/watch?v=${videoData.videoId}` : "#"} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Watch on YouTube
                  </a>
                </Button>
                {playerReady && (
                  <span className="text-xs text-muted-foreground">Player ready</span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {videoData.chapters && videoData.chapters.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Chapters</h4>
              <div className="space-y-2">
                {videoData.chapters.map((chapter, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Play className="h-4 w-4" />
                        <span className="font-mono text-sm">
                          {formatDuration(chapter.startTime)}
                        </span>
                      </div>
                      <span className="font-medium">{chapter.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {videoData.keyTakeaways && videoData.keyTakeaways.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Key Takeaways</h4>
              <div className="space-y-2">
                {videoData.keyTakeaways.map((takeaway, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-muted rounded-lg">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm text-foreground">{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}