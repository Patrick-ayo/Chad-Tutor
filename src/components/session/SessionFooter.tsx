import { useState, useEffect } from "react";
import { Play, Pause, Square, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SessionFooterProps {
  isRunning: boolean;
  elapsedSeconds: number;
  pauseCount: number;
  aiHelpCount: number;
  onPause: () => void;
  onResume: () => void;
  onEndSession: () => void;
  onOpenAIHelp: () => void;
}

export function SessionFooter({
  isRunning,
  elapsedSeconds,
  pauseCount,
  aiHelpCount,
  onPause,
  onResume,
  onEndSession,
  onOpenAIHelp,
}: SessionFooterProps) {
  const [displayTime, setDisplayTime] = useState(elapsedSeconds);

  useEffect(() => {
    if (!isRunning) {
      setDisplayTime(elapsedSeconds);
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, elapsedSeconds]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Session Stats */}
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-full ${
                  isRunning ? "bg-green-100" : "bg-yellow-100"
                }`}
              >
                <Clock
                  className={`h-5 w-5 ${
                    isRunning ? "text-green-600" : "text-yellow-600"
                  }`}
                />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-gray-900 timer-text" data-timer>
                  {formatTime(displayTime)}
                </p>
                <p className="text-xs text-gray-500">
                  {isRunning ? "Session active" : "Paused"}
                </p>
              </div>
            </div>

            {/* Stats Badges */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              {pauseCount > 0 && (
                <Badge variant="outline" className="text-yellow-600">
                  {pauseCount} pause{pauseCount > 1 ? "s" : ""}
                </Badge>
              )}
              <Badge variant="outline" className="text-blue-600">
                <MessageCircle className="h-3 w-3 mr-1" />
                {aiHelpCount} AI help
              </Badge>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* AI Help Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAIHelp}
              className="hidden sm:flex"
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              AI Coach
            </Button>

            {/* Pause/Resume Button */}
            {isRunning ? (
              <Button
                variant="outline"
                size="lg"
                onClick={onPause}
                className="gap-2"
              >
                <Pause className="h-5 w-5" />
                Pause
              </Button>
            ) : (
              <Button
                variant="default"
                size="lg"
                onClick={onResume}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-5 w-5" />
                Resume
              </Button>
            )}

            {/* End Session Button */}
            <Button
              variant="destructive"
              size="lg"
              onClick={onEndSession}
              className="gap-2"
            >
              <Square className="h-5 w-5" />
              End Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
