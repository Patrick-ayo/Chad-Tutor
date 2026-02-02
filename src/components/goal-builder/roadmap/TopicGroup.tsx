import type { Topic } from "@/types/goal";
import { TaskCard } from "./TaskCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Clock, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface TopicGroupProps {
  topic: Topic;
  onTaskDefer?: (taskId: string) => void;
  onTaskSkip?: (taskId: string) => void;
  onTaskLockToggle?: (taskId: string) => void;
  isEditable?: boolean;
}

export function TopicGroup({
  topic,
  onTaskDefer,
  onTaskSkip,
  onTaskLockToggle,
  isEditable = true,
}: TopicGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  const stats = useMemo(() => {
    const completed = topic.tasks.filter((t) => t.status === "completed").length;
    const total = topic.tasks.length;
    const completedMinutes = topic.tasks
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.estimatedMinutes, 0);
    
    return {
      completed,
      total,
      completedMinutes,
      totalMinutes: topic.estimatedMinutes,
      progressPercent: Math.round((completed / total) * 100),
    };
  }, [topic]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-3">
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
          <div className="text-left">
            <h4 className="font-medium">{topic.name}</h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {stats.completed}/{stats.total} tasks
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.round(stats.totalMinutes / 60)}h total
              </span>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            {stats.progressPercent}%
          </Badge>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2 pl-4 border-l-2 border-muted ml-4">
        {topic.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDefer={onTaskDefer}
            onSkip={onTaskSkip}
            onLockToggle={onTaskLockToggle}
            isEditable={isEditable}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
