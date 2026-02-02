import { Clock, Target, Gauge, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SessionTask, SessionState } from "@/types/session";

interface TaskContextBarProps {
  task: SessionTask;
  sessionState: SessionState;
}

export function TaskContextBar({ task, sessionState }: TaskContextBarProps) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  const overallProgress = Math.round(
    (sessionState.contentProgress * 0.4 +
      (sessionState.questionsAnswered > 0
        ? (sessionState.correctAnswers / sessionState.questionsAnswered) * 100
        : 0) * 0.6)
  );

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <span>{task.goalName}</span>
          <ChevronRight className="h-3 w-3" />
          <span>{task.topicName}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">{task.name}</span>
        </div>

        {/* Task Info Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">{task.name}</h1>
            <Badge className={difficultyColors[task.difficulty]}>
              {task.difficulty}
            </Badge>
          </div>

          <div className="flex items-center gap-6 text-sm">
            {/* Estimated Time */}
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{task.estimatedMinutes} min estimated</span>
            </div>

            {/* Questions Progress */}
            <div className="flex items-center gap-1.5 text-gray-600">
              <Target className="h-4 w-4" />
              <span>
                {sessionState.correctAnswers}/{sessionState.questionsAnswered} correct
              </span>
            </div>

            {/* Difficulty Indicator */}
            <div className="flex items-center gap-1.5 text-gray-600">
              <Gauge className="h-4 w-4" />
              <span>{overallProgress}% complete</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <Progress value={overallProgress} className="h-1.5" />
        </div>

        {/* Schedule Reason (if any) */}
        {task.scheduleReason && (
          <div className="mt-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
            📅 {task.scheduleReason}
          </div>
        )}
      </div>
    </div>
  );
}
