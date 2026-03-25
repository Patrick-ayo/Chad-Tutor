import { Play, Clock, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import type { VideoMetadata } from "@/types/session";

interface VideoModeProps {
  videoData: VideoMetadata;
  onVideoWatched?: () => void;
}

export function VideoMode({ videoData, onVideoWatched }: VideoModeProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hasCalledOnWatch, setHasCalledOnWatch] = useState(false);
  const hasVideoId = Boolean(videoData.videoId);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoLoad = useCallback(() => {
    setVideoLoaded(true);
  }, []);

  // Only call onVideoWatched once when component mounts
  useEffect(() => {
    if (!hasVideoId) {
      setVideoLoaded(true);
      return;
    }

    if (videoLoaded && !hasCalledOnWatch) {
      setHasCalledOnWatch(true);
      onVideoWatched?.();
    }
  }, [videoLoaded, hasCalledOnWatch, hasVideoId, onVideoWatched]);

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            {!videoLoaded && hasVideoId && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {hasVideoId ? (
              <iframe
                key={videoData.videoId}
                src={`https://www.youtube.com/embed/${videoData.videoId}?rel=0`}
                className="w-full h-full border-0"
                title={videoData.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleVideoLoad}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-black text-sm text-muted-foreground px-6 text-center">
                No designated video is attached to this scheduled task.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Info */}
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
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Chapters */}
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

          {/* Key Takeaways */}
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