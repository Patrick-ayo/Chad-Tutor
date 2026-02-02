import type { Phase } from "@/types/goal";
import { TopicGroup } from "./TopicGroup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, Clock, CheckCircle2, Layers } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface PhaseSectionProps {
  phase: Phase;
  onTaskDefer?: (taskId: string) => void;
  onTaskSkip?: (taskId: string) => void;
  onTaskLockToggle?: (taskId: string) => void;
  isEditable?: boolean;
}

export function PhaseSection({
  phase,
  onTaskDefer,
  onTaskSkip,
  onTaskLockToggle,
  isEditable = true,
}: PhaseSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const stats = useMemo(() => {
    const allTasks = phase.topics.flatMap((t) => t.tasks);
    const completed = allTasks.filter((t) => t.status === "completed").length;
    const total = allTasks.length;
    const completedMinutes = allTasks
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.estimatedMinutes, 0);

    return {
      completed,
      total,
      completedMinutes,
      totalMinutes: phase.estimatedMinutes,
      progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      topicCount: phase.topics.length,
    };
  }, [phase]);

  const phaseColors = [
    "from-blue-500/10 to-transparent border-blue-500/30",
    "from-purple-500/10 to-transparent border-purple-500/30",
    "from-orange-500/10 to-transparent border-orange-500/30",
  ];

  return (
    <Card className={cn("overflow-hidden bg-gradient-to-br", phaseColors[(phase.order - 1) % 3])}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {phase.order}
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {phase.name}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </CardTitle>
                  {phase.description && (
                    <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <Badge variant="secondary">
                  {stats.progressPercent}% complete
                </Badge>
                <div className="flex items-center gap-3 text-xs text-muted-foreground justify-end">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {stats.topicCount} topics
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.round(phase.estimatedMinutes / 60)}h
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <Progress value={stats.progressPercent} className="h-1.5 mt-3" />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {stats.completed}/{stats.total} tasks
              </span>
              <span>
                {Math.round(stats.completedMinutes / 60)}h / {Math.round(stats.totalMinutes / 60)}h
              </span>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {phase.topics.map((topic) => (
              <TopicGroup
                key={topic.id}
                topic={topic}
                onTaskDefer={onTaskDefer}
                onTaskSkip={onTaskSkip}
                onTaskLockToggle={onTaskLockToggle}
                isEditable={isEditable}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
