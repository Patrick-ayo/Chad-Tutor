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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
      <div className="px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Timer & Stats */}
          <div className="flex items-center gap-4">
            {/* Compact Timer */}
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${isRunning ? "bg-green-100 dark:bg-green-900" : "bg-amber-100 dark:bg-amber-900"}`}>
                <Clock className={`h-4 w-4 ${isRunning ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`} />
              </div>
              <span className="text-xl font-mono font-semibold text-foreground">
                {formatTime(displayTime)}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                {aiHelpCount} AI help
              </Badge>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onOpenAIHelp}>
              <MessageCircle className="h-4 w-4 mr-1" />
              AI Coach
            </Button>

            {isRunning ? (
              <Button variant="outline" size="sm" onClick={onPause}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            ) : (
              <Button size="sm" onClick={onResume} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}

            <Button variant="destructive" size="sm" onClick={onEndSession}>
              <Square className="h-4 w-4 mr-1" />
              End Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
