import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Check } from "lucide-react";
import type { SuggestedVideo } from "@/types/session";

interface ChadMeUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic: string;
  currentSubject: string;
  suggestedVideos: SuggestedVideo[];
  onReschedulePlaylist: (videoIds: string[]) => void;
  onSetPrimaryVideo: (video: SuggestedVideo) => void;
  onPause?: () => void;
  onResume?: () => void;
}

export function ChadMeUpDialog({
  isOpen,
  onClose,
  currentTopic,
  currentSubject,
  suggestedVideos,
  onReschedulePlaylist,
  onSetPrimaryVideo,
  onPause,
  onResume,
}: ChadMeUpDialogProps) {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [selectedAsPrimary, setSelectedAsPrimary] = useState(false);
  const pauseStateRef = useRef<boolean | null>(null);

  const currentVideo = suggestedVideos[selectedVideoIndex];

  // Pause background video when dialog opens, resume when closes
  useEffect(() => {
    if (isOpen && pauseStateRef.current !== true) {
      onPause?.();
      pauseStateRef.current = true;
    } else if (!isOpen && pauseStateRef.current !== false) {
      onResume?.();
      pauseStateRef.current = false;
    }
  }, [isOpen]);

  const handleSetAsPrimary = () => {
    onSetPrimaryVideo(currentVideo);
    setSelectedAsPrimary(true);
    // Keep dialog open for a moment to show confirmation
    setTimeout(() => {
      setSelectedAsPrimary(false);
      onClose();
    }, 1500);
  };

  const handleRescheduleAll = () => {
    const playlistVideos = suggestedVideos
      .filter((v) => v.subject === currentSubject)
      .map((v) => v.videoId);
    
    onReschedulePlaylist(playlistVideos);
    onClose();
  };

  const handleSkip = () => {
    if (selectedVideoIndex < suggestedVideos.length - 1) {
      setSelectedVideoIndex(selectedVideoIndex + 1);
      setVideoEnded(false);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chad Me Up - Suggested Video</DialogTitle>
          <DialogDescription>
            Based on your current topic: <strong>{currentTopic}</strong> from <strong>{currentSubject}</strong>
          </DialogDescription>
        </DialogHeader>

        {currentVideo && (
          <div className="space-y-4">
            {/* YouTube Video Player */}
            <Card className="overflow-hidden bg-black">
              <div className="relative w-full bg-black aspect-video">
                <iframe
                  key={currentVideo.videoId}
                  src={`https://www.youtube.com/embed/${currentVideo.videoId}?rel=0&enablejsapi=1&modestbranding=1`}
                  className="w-full h-full border-0"
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ minHeight: '400px' }}
                />
              </div>
            </Card>

            {/* Video Info */}
            <Card className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{currentVideo.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Duration: {Math.floor(currentVideo.duration / 60)} minutes • Subject: {currentVideo.subject}
                </p>
              </div>
              <p className="text-sm text-foreground">
                {currentVideo.description}
              </p>
              {currentVideo.relatedTopics && currentVideo.relatedTopics.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Related Topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentVideo.relatedTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Actions - Show after video */}
            {videoEnded && (
              <>
                {/* Set as Primary Option */}
                <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <div className="flex gap-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                        Set as Primary Video?
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        This video will replace the current video in your session while keeping all theory content the same. Your selection will be saved.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={handleSetAsPrimary}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={selectedAsPrimary}
                        >
                          {selectedAsPrimary ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Saved!
                            </>
                          ) : (
                            "Yes, Use This Video"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setVideoEnded(false)}
                        >
                          Not Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Reschedule Suggestion - shown after video ends */}
                <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Reschedule {currentSubject} Playlist?
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Would you like to shift all videos from the <strong>{currentSubject}</strong> playlist to prioritize this topic? This will reschedule {suggestedVideos.filter((v) => v.subject === currentSubject).length} video(s).
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={handleRescheduleAll}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Yes, Reschedule All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setVideoEnded(false)}
                        >
                          No, Keep as is
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Navigation - Show before video ends */}
            {!videoEnded && (
              <div className="flex gap-2 justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    disabled={selectedVideoIndex === 0}
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    disabled={selectedVideoIndex >= suggestedVideos.length - 1}
                  >
                    Next →
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setVideoEnded(true)}
                  >
                    I've Watched This
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
