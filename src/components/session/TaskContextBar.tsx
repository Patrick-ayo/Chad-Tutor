import { Clock, Target, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SessionTask, SessionState } from "@/types/session";

interface TaskContextBarProps {
  task: SessionTask;
  sessionState: SessionState;
}

export function TaskContextBar({ task, sessionState }: TaskContextBarProps) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const overallProgress = Math.round(
    (sessionState.contentProgress * 0.4 +
      (sessionState.questionsAnswered > 0
        ? (sessionState.correctAnswers / sessionState.questionsAnswered) * 100
        : 0) * 0.6)
  );

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="px-6 py-2">
        {/* Compact Single Row Layout */}
        <div className="flex items-center justify-between">
          {/* Left: Task Name & Difficulty */}
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-foreground">{task.name}</h1>
            <Badge className={difficultyColors[task.difficulty]}>
              {task.difficulty}
            </Badge>
          </div>

          {/* Right: Quick Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{task.estimatedMinutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              <span>{sessionState.correctAnswers}/{sessionState.questionsAnswered}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              <span>{overallProgress}%</span>
            </div>
            {task.scheduleReason && (
              <span className="text-muted-foreground/70">| {task.scheduleReason}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
