import type { Task } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen } from "lucide-react";

interface SecondaryTaskListProps {
  tasks: Task[];
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function SecondaryTaskList({ tasks }: SecondaryTaskListProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Up Next</h3>
      <div className="space-y-2">
        {tasks.slice(0, 2).map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
          >
            <div className="space-y-1">
              <p className="font-medium leading-tight">{task.name}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {task.topic}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.estimatedMinutes} min
                </span>
              </div>
            </div>
            <Badge className={`${difficultyColors[task.difficulty]} text-xs`}>
              {task.difficulty}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
