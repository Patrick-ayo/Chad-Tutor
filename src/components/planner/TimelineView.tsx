import { format, isBefore, startOfDay, isToday as checkIsToday } from "date-fns";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  RefreshCw,
  Lock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import type { ScheduleDay, ScheduledTask } from "@/types/planner";

interface TimelineViewProps {
  days: ScheduleDay[];
  onTaskClick?: (task: ScheduledTask) => void;
}

function ScheduledTaskCard({
  task,
  onClick,
}: {
  task: ScheduledTask;
  onClick?: () => void;
}) {
  const isOverdue = task.status === "overdue";
  const isRevision = task.type === "revision";

  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case "blocked":
        return <Lock className="h-4 w-4 text-red-600" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeIcon = () => {
    switch (task.type) {
      case "learn":
        return <BookOpen className="h-3 w-3" />;
      case "practice":
        return <Target className="h-3 w-3" />;
      case "revision":
        return <RefreshCw className="h-3 w-3" />;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "border-l-orange-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-gray-400";
    }
  };

  const getCardBackground = () => {
    if (task.status === "completed") return "bg-green-50";
    if (isOverdue) return "bg-red-50";
    if (task.status === "blocked") return "bg-gray-100";
    if (isRevision) return "bg-blue-50";
    return "bg-white";
  };

  return (
    <div
      onClick={onClick}
      className={`p-2.5 rounded-lg border border-l-4 ${getPriorityColor()} ${getCardBackground()} 
        cursor-pointer hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-start gap-2">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {task.title}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            {getTypeIcon()}
            <span className="capitalize">{task.type}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{task.estimatedMinutes}m</span>
        </div>
        <div className="flex items-center gap-1">
          {isRevision && (
            <Badge variant="outline" className="text-xs h-5 px-1.5">
              <RefreshCw className="h-3 w-3 mr-0.5" />
              Rev
            </Badge>
          )}
          {isOverdue && (
            <Badge className="bg-red-100 text-red-800 text-xs h-5 px-1.5">
              Overdue
            </Badge>
          )}
        </div>
      </div>

      {task.partialProgress !== undefined && task.partialProgress > 0 && task.partialProgress < 100 && (
        <div className="mt-2">
          <Progress value={task.partialProgress} className="h-1" />
          <p className="text-xs text-gray-500 mt-0.5">
            {task.partialProgress}% complete
          </p>
        </div>
      )}

      {task.status === "blocked" && task.blockedReason && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {task.blockedReason}
        </p>
      )}
    </div>
  );
}

function DayColumn({
  day,
  onTaskClick,
}: {
  day: ScheduleDay;
  onTaskClick?: (task: ScheduledTask) => void;
}) {
  const dateObj = new Date(day.date);
  const isToday = checkIsToday(dateObj);
  const isPast = isBefore(startOfDay(dateObj), startOfDay(new Date())) && !isToday;
  const progressPercent = day.totalMinutes > 0 ? (day.completedMinutes / day.totalMinutes) * 100 : 0;

  return (
    <div
      className={`flex-shrink-0 w-56 rounded-lg border ${
        isToday
          ? "border-blue-500 bg-blue-50/50"
          : day.isBuffer
          ? "border-dashed border-gray-300 bg-gray-50"
          : isPast
          ? "border-gray-200 bg-gray-50 opacity-60"
          : "border-gray-200"
      }`}
    >
      {/* Day Header */}
      <div
        className={`p-3 border-b ${
          isToday ? "bg-blue-100" : day.isBuffer ? "bg-gray-100" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">
              {format(dateObj, "EEE, MMM d")}
            </p>
            {isToday && (
              <Badge className="mt-1 bg-blue-600 text-xs">Today</Badge>
            )}
            {day.isBuffer && (
              <Badge variant="outline" className="mt-1 text-xs">
                Buffer Day
              </Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {day.completedMinutes}m / {day.totalMinutes}m
            </p>
          </div>
        </div>
        {day.totalMinutes > 0 && (
          <Progress value={progressPercent} className="h-1 mt-2" />
        )}
      </div>

      {/* Tasks */}
      <div className="p-2 space-y-2 min-h-[150px]">
        {day.tasks.length > 0 ? (
          day.tasks.map((task) => (
            <ScheduledTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))
        ) : day.isBuffer ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Buffer for catch-up
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

export function TimelineView({ days, onTaskClick }: TimelineViewProps) {
  const overdueTasks = days
    .flatMap((day) => day.tasks)
    .filter((task) => task.status === "overdue");

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            {overdueTasks.length > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {overdueTasks.length} overdue
              </Badge>
            )}
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border-l-2 border-l-orange-500 bg-gray-100" />
            High Priority
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Learn
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            Practice
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Revision
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border border-dashed border-gray-400" />
            Buffer
          </div>
        </div>

        {/* Timeline */}
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-4">
            {days.map((day) => (
              <DayColumn
                key={day.date}
                day={day}
                onTaskClick={onTaskClick}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
