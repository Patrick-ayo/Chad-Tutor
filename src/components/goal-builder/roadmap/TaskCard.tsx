import type { Task } from "@/types/goal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Clock,
  Lock,
  Unlock,
  SkipForward,
  Calendar,
  CheckCircle2,
  Circle,
  PlayCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onDefer?: (taskId: string) => void;
  onSkip?: (taskId: string) => void;
  onLockToggle?: (taskId: string) => void;
  isEditable?: boolean;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusConfig = {
  locked: { icon: Lock, color: "text-muted-foreground", bg: "bg-muted/50" },
  scheduled: { icon: Circle, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  "in-progress": { icon: PlayCircle, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  completed: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
  skipped: { icon: SkipForward, color: "text-muted-foreground", bg: "bg-muted/30 opacity-60" },
  deferred: { icon: Calendar, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
};

export function TaskCard({ task, onDefer, onSkip, onLockToggle, isEditable = true }: TaskCardProps) {
  const StatusIcon = statusConfig[task.status].icon;
  const statusColor = statusConfig[task.status].color;
  const statusBg = statusConfig[task.status].bg;

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-4 transition-all",
        statusBg,
        task.status === "skipped" && "opacity-60"
      )}
    >
      {/* Status indicator line */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1 rounded-l-lg",
          task.status === "completed" && "bg-green-500",
          task.status === "in-progress" && "bg-yellow-500",
          task.status === "scheduled" && "bg-blue-500",
          task.status === "locked" && "bg-muted-foreground",
          task.status === "deferred" && "bg-orange-500",
          task.status === "skipped" && "bg-muted"
        )}
      />

      <div className="flex items-start gap-3 pl-2">
        {/* Status Icon */}
        <StatusIcon className={cn("h-5 w-5 mt-0.5 shrink-0", statusColor)} />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium leading-tight">{task.name}</h4>
            <Badge className={cn("shrink-0 text-xs", difficultyColors[task.difficulty])}>
              {task.difficulty}
            </Badge>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.estimatedMinutes} min
            </span>
            {task.dependencies.length > 0 && (
              <span className="flex items-center gap-1">
                Requires {task.dependencies.length} prior
              </span>
            )}
            {task.assessmentHook && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3 w-3" />
                Has quiz
              </span>
            )}
          </div>

          {/* Schedule Reason - builds trust */}
          {task.scheduleReason && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                    <HelpCircle className="h-3 w-3" />
                    <span className="truncate">Why: {task.scheduleReason}</span>
                  </p>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>{task.scheduleReason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Actions (visible on hover) */}
        {isEditable && task.status !== "completed" && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onLockToggle && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onLockToggle(task.id)}
                    >
                      {task.status === "locked" ? (
                        <Unlock className="h-3.5 w-3.5" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {task.status === "locked" ? "Unlock task" : "Lock task position"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onDefer && task.status !== "locked" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onDefer(task.id)}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Defer task</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onSkip && task.status !== "locked" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onSkip(task.id)}
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Skip task (not recommended)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
