import type { Roadmap } from "@/types/goal";
import { PhaseSection } from "./PhaseSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, Layers, RefreshCw } from "lucide-react";
import { useMemo } from "react";

interface RoadmapPreviewProps {
  roadmap: Roadmap;
  onTaskDefer?: (taskId: string) => void;
  onTaskSkip?: (taskId: string) => void;
  onTaskLockToggle?: (taskId: string) => void;
  onTaskSchedule?: (taskId: string, date: string | undefined) => void;
  isEditable?: boolean;
}

export function RoadmapPreview({
  roadmap,
  onTaskDefer,
  onTaskSkip,
  onTaskLockToggle,
  onTaskSchedule,
  isEditable = true,
}: RoadmapPreviewProps) {
  const stats = useMemo(() => {
    const allTasks = roadmap.phases.flatMap((p) => p.topics.flatMap((t) => t.tasks));
    const completed = allTasks.filter((t) => t.status === "completed").length;
    const total = allTasks.length;

    return {
      totalTasks: total,
      completedTasks: completed,
      totalHours: Math.round(roadmap.totalEstimatedMinutes / 60),
      totalTopics: roadmap.phases.reduce((sum, p) => sum + p.topics.length, 0),
      progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [roadmap]);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{stats.totalHours} hours</p>
                  <p className="text-xs text-muted-foreground">Total time</p>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-10" />
              
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{stats.totalTasks} tasks</p>
                  <p className="text-xs text-muted-foreground">In {stats.totalTopics} topics</p>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-10" />
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{roadmap.bufferDays} buffer days</p>
                  <p className="text-xs text-muted-foreground">Built in</p>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-10" />
              
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{roadmap.revisionSlots} revision slots</p>
                  <p className="text-xs text-muted-foreground">Reserved</p>
                </div>
              </div>
            </div>

            <Badge variant="secondary" className="text-sm">
              {stats.progressPercent}% complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timeline header */}
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Roadmap Timeline</h3>
        <p className="text-sm text-muted-foreground">
          ({roadmap.phases.length} phases)
        </p>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {roadmap.phases.map((phase) => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            onTaskDefer={onTaskDefer}
            onTaskSkip={onTaskSkip}
            onTaskLockToggle={onTaskLockToggle}
            onTaskSchedule={onTaskSchedule}
            isEditable={isEditable}
          />
        ))}
      </div>
    </div>
  );
}
