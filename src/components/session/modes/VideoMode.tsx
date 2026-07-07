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
  videoId?: string;
  taskId?: string | null;
  onAutoComplete?: () => void;
  onVideoWatched?: () => void;
  onProgressUpdate?: (percentComplete: number) => void;
  onSessionPlay?: () => void;
  onSessionPause?: () => void;
  task?: any;
}

type YouTubePlayerState = {
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
  getPlayerState: () => number;
  seekTo?: (seconds: number, allowSeekAhead: boolean) => void;
};

type YouTubeWindow = Window & {
  YT?: {
    Player: new (
      element: HTMLElement | HTMLIFrameElement | string,
      options: {
        videoId?: string;
        playerVars?: Record<string, unknown>;
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

export function VideoMode({ videoData, videoId, taskId, onAutoComplete, onVideoWatched, onProgressUpdate, onSessionPlay, onSessionPause, task }: VideoModeProps) {
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayerState | null>(null);
  const intervalRef = useRef<number | null>(null);
  const watchedSecondsIntervalRef = useRef<number | null>(null);
  const breakTimerRef = useRef<number | null>(null);
  const watchedSecondsRef = useRef(0);
  const lastReportedMinutesRef = useRef(-1);
  const sessionStartedRef = useRef(false);
  const breakActiveRef = useRef(false);
  const autoCompletedRef = useRef(false);
  const playerStateRef = useRef<number | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(-1);

  const effectiveVideoId = task?.videoId || task?.videoUrl || videoId || videoData.videoId || '';
  const hasVideoId = Boolean(effectiveVideoId);
  const playerVideoData = { ...videoData, videoId: effectiveVideoId };

  const callbacksRef = useRef({ onAutoComplete, onVideoWatched, onProgressUpdate, onSessionPlay, onSessionPause });
  useEffect(() => {
    callbacksRef.current = { onAutoComplete, onVideoWatched, onProgressUpdate, onSessionPlay, onSessionPause };
  }, [onAutoComplete, onVideoWatched, onProgressUpdate, onSessionPlay, onSessionPause]);

  useEffect(() => {
    console.log('[VideoMode] Loading videoId:', effectiveVideoId || '(missing)');
  }, [effectiveVideoId]);

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
    if (watchedSecondsIntervalRef.current !== null) {
      window.clearInterval(watchedSecondsIntervalRef.current);
      watchedSecondsIntervalRef.current = null;
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

      const durationSeconds = Math.max(1, player.getDuration() || playerVideoData.duration || 1);
      const watchedSeconds = watchedSecondsRef.current;
      const watchedMinutes = Math.floor(watchedSeconds / 60);
      const percentComplete = Math.round((watchedSeconds / durationSeconds) * 100);

      if (percentComplete >= 90) {
        callbacksRef.current.onProgressUpdate?.(percentComplete);

        if (autoCompletedRef.current) {
          return;
        }

        autoCompletedRef.current = true;
        clearProgressInterval();
        clearBreakTimer();

        try {
          await completeTask(taskId, {
            completedDurationMinutes: watchedMinutes,
            proof: { watchedSeconds }
          });
          // Do not call onAutoComplete here, let the user manually end the session or finish the video
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
      callbacksRef.current.onProgressUpdate?.(percentComplete);
      await updateTaskProgress(taskId, watchedMinutes, percentComplete);
    },
    [clearBreakTimer, clearProgressInterval, playerVideoData.duration, taskId],
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
    callbacksRef.current.onSessionPause?.();
    clearProgressInterval();
    void reportProgress(true);

    clearBreakTimer();
    breakTimerRef.current = window.setTimeout(() => {
      ensureBreakStarted();
    }, 5 * 60 * 1000);
  }, [clearBreakTimer, clearProgressInterval, ensureBreakStarted, reportProgress]);

  const handlePlayingState = useCallback(() => {
    callbacksRef.current.onSessionPlay?.();
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
    
    if (watchedSecondsIntervalRef.current === null) {
      watchedSecondsIntervalRef.current = window.setInterval(() => {
        const currentState = playerStateRef.current;
        const youtubeWindow = window as YouTubeWindow;

        if (currentState === youtubeWindow.YT?.PlayerState.PLAYING) {
          watchedSecondsRef.current += 1;
        }

        if (playerRef.current) {
          const current = playerRef.current.getCurrentTime();
          setCurrentTime(current);

          if (playerVideoData.chapters && playerVideoData.chapters.length > 0) {
            let activeIdx = -1;
            for (let i = 0; i < playerVideoData.chapters.length; i++) {
              if (current >= playerVideoData.chapters[i].startTime) {
                activeIdx = i;
              } else {
                break;
              }
            }
            setActiveChapterIndex(activeIdx);
          }
        }
      }, 1000);
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

        if (cancelled || !playerContainerRef.current) {
          return;
        }

        const youtubeWindow = window as YouTubeWindow;

        const player = new youtubeWindow.YT!.Player(playerContainerRef.current, {
          videoId: effectiveVideoId,
          playerVars: {
            rel: 0,
            enablejsapi: 1,
            modestbranding: 1,
            fs: 1,
            origin: window.location.origin
          },
          events: {
            onReady: () => {
              if (cancelled) {
                return;
              }

              setVideoLoaded(true);
              setPlayerReady(true);
              callbacksRef.current.onVideoWatched?.();
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
                callbacksRef.current.onAutoComplete?.();
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
    reportProgress,
  ]);

  if (!effectiveVideoId) {
    return <div>Video not available for this task</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            {!videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {hasVideoId ? (
              <>
                {/* Overlay to block clicks on the YouTube title at the top left */}
                <div className="absolute top-0 left-0 w-2/3 h-16 z-10" />
                
                {/* Overlay to block clicks on the YouTube logo and More Videos at the bottom right (above control bar) */}
                <div className="absolute bottom-12 right-0 w-48 h-16 z-10" />

                {/* Overlay to block clicks on the Share button at the bottom left (above control bar) */}
                <div className="absolute bottom-12 left-0 w-24 h-16 z-10" />

                <div key={effectiveVideoId} className="w-full h-full pointer-events-auto">
                  <div ref={playerContainerRef} className="w-full h-full border-0" />
                </div>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl leading-tight">{playerVideoData.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(playerVideoData.duration)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={!hasVideoId}
                >
                  <a href={hasVideoId ? `https://youtube.com/watch?v=${effectiveVideoId}` : "#"} target="_blank" rel="noopener noreferrer">
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
          {playerVideoData.chapters && playerVideoData.chapters.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">
                Session Outline: {task?.topicName || playerVideoData.title}
              </h4>
              <div className="space-y-2">
                {playerVideoData.chapters.map((chapter, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                        playerRef.current.seekTo(chapter.startTime, true);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer ${
                      activeChapterIndex === index
                        ? 'bg-primary/20 border border-primary/30 shadow-sm ring-1 ring-primary/50'
                        : 'bg-muted'
                    }`}
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

        </CardContent>
      </Card>
    </div>
  );
}