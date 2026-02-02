import type { Task } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Zap } from "lucide-react";

interface PrimaryTaskCardProps {
  task: Task;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function PrimaryTaskCard({ task }: PrimaryTaskCardProps) {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs font-medium">
              <Zap className="mr-1 h-3 w-3" />
              Primary Focus
            </Badge>
            <CardTitle className="text-xl font-bold leading-tight">
              {task.name}
            </CardTitle>
          </div>
          <Badge className={difficultyColors[task.difficulty]}>
            {task.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{task.topic}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{task.estimatedMinutes} min</span>
          </div>
        </div>
        
        {/* Why this task - brief justification */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {task.deadlinePressure > 70 && (
            <Badge variant="secondary" className="text-xs">
              Deadline approaching
            </Badge>
          )}
          {task.dependencyBlocking && (
            <Badge variant="secondary" className="text-xs">
              Unblocks other topics
            </Badge>
          )}
          {task.forgettingCurveRisk > 60 && (
            <Badge variant="secondary" className="text-xs">
              Review needed soon
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
