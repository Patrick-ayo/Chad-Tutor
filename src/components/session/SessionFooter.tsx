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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="px-3 md:px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Timer & Stats */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Compact Timer */}
            <div className="flex items-center gap-1 md:gap-2">
              <div className={`p-1 md:p-1.5 rounded-full ${isRunning ? "bg-green-100 dark:bg-green-900" : "bg-amber-100 dark:bg-amber-900"}`}>
                <Clock className={`h-3 w-3 md:h-4 md:w-4 ${isRunning ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`} />
              </div>
              <span className="text-base md:text-xl font-mono font-semibold text-foreground">
                {formatTime(displayTime)}
              </span>
            </div>

            {/* Stats - hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                {aiHelpCount} AI help
              </Badge>
              <Badge variant="outline" className="text-xs">
                {pauseCount} pauses
              </Badge>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="outline" size="sm" onClick={onOpenAIHelp} className="hidden md:flex">
              <MessageCircle className="h-4 w-4 mr-1" />
              AI Coach
            </Button>
            <Button variant="outline" size="icon" onClick={onOpenAIHelp} className="md:hidden h-8 w-8">
              <MessageCircle className="h-4 w-4" />
            </Button>

            {isRunning ? (
              <>
                <Button variant="outline" size="sm" onClick={onPause} className="hidden md:flex">
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button variant="outline" size="icon" onClick={onPause} className="md:hidden h-8 w-8">
                  <Pause className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={onResume} className="hidden md:flex bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
                <Button size="icon" onClick={onResume} className="md:hidden h-8 w-8 bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button variant="destructive" size="sm" onClick={onEndSession} className="hidden md:flex">
              <Square className="h-4 w-4 mr-1" />
              End Session
            </Button>
            <Button variant="destructive" size="icon" onClick={onEndSession} className="md:hidden h-8 w-8">
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
