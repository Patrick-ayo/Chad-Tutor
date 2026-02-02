import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Minimize2,
  RefreshCw,
  Trash2,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { MissedTask, MissedTaskResolution, MissedTaskResolutionType } from "@/types/planner";

interface ResolutionOption {
  type: MissedTaskResolutionType;
  label: string;
  description: string;
  deadlineImpact: number;
  workloadImpact: "lighter" | "same" | "heavier";
  riskLevel: "low" | "medium" | "high";
  affectedTasks: string[];
}

interface MissedTaskResolverProps {
  missedTasks: MissedTask[];
  onResolve: (taskId: string, resolution: MissedTaskResolution) => void;
}

function ResolutionOptionCard({
  option,
  onSelect,
}: {
  option: ResolutionOption;
  onSelect: () => void;
}) {
  const getIcon = () => {
    switch (option.type) {
      case "push-forward":
        return <ArrowRight className="h-5 w-5" />;
      case "compress":
        return <Minimize2 className="h-5 w-5" />;
      case "convert-revision":
        return <RefreshCw className="h-5 w-5" />;
      case "drop":
        return <Trash2 className="h-5 w-5" />;
    }
  };

  const getRiskColor = () => {
    switch (option.riskLevel) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
    }
  };

  const getWorkloadIcon = () => {
    switch (option.workloadImpact) {
      case "lighter":
        return "↓ Lighter";
      case "same":
        return "= Same";
      case "heavier":
        return "↑ Heavier";
    }
  };

  return (
    <div
      onClick={onSelect}
      className="p-3 border rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">{getIcon()}</div>
        <div className="flex-1">
          <p className="font-medium text-sm">{option.label}</p>
          <p className="text-xs text-gray-600 mt-0.5">{option.description}</p>
        </div>
      </div>

      {/* Tradeoffs */}
      <div className="flex items-center gap-3 mt-3 pt-2 border-t text-xs">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className={option.deadlineImpact > 0 ? "text-red-600" : "text-green-600"}>
            {option.deadlineImpact > 0 ? "+" : ""}
            {option.deadlineImpact} days
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-gray-400" />
          <span>{getWorkloadIcon()}</span>
        </div>
        <Badge className={`text-xs ${getRiskColor()}`}>
          {option.riskLevel} risk
        </Badge>
      </div>

      {option.affectedTasks.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          Affects {option.affectedTasks.length} dependent task
          {option.affectedTasks.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

function MissedTaskCard({
  missedTask,
  onResolve,
}: {
  missedTask: MissedTask;
  onResolve: (resolution: MissedTaskResolution) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const daysMissed = differenceInDays(new Date(), new Date(missedTask.originalDate));

  // Generate resolution options based on task
  const resolutionOptions: ResolutionOption[] = [
    {
      type: "push-forward",
      label: "Push Forward",
      description: "Move to the next available slot, pushing other tasks back",
      deadlineImpact: 1,
      workloadImpact: "same",
      riskLevel: "low",
      affectedTasks: missedTask.dependentTasks,
    },
    {
      type: "compress",
      label: "Compress Schedule",
      description: "Fit it in without moving deadline by increasing daily load",
      deadlineImpact: 0,
      workloadImpact: "heavier",
      riskLevel: "medium",
      affectedTasks: [],
    },
    {
      type: "convert-revision",
      label: "Convert to Revision",
      description: "Assume partial knowledge, schedule a shorter revision instead",
      deadlineImpact: 0,
      workloadImpact: "lighter",
      riskLevel: "medium",
      affectedTasks: [],
    },
    {
      type: "drop",
      label: "Drop Task",
      description: "Remove from schedule entirely (not recommended for dependencies)",
      deadlineImpact: -1,
      workloadImpact: "lighter",
      riskLevel: missedTask.dependentTasks.length > 0 ? "high" : "medium",
      affectedTasks: missedTask.dependentTasks,
    },
  ];

  const handleSelect = (option: ResolutionOption) => {
    onResolve({ type: option.type });
    setIsOpen(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-orange-200 bg-orange-50/50">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-100/50 transition-colors pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {missedTask.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {format(new Date(missedTask.originalDate), "MMM d")} •{" "}
                    {daysMissed} day{daysMissed > 1 ? "s" : ""} ago
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {missedTask.missedReason}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    missedTask.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : missedTask.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {missedTask.priority}
                </Badge>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">
                How would you like to resolve this?
              </p>
              <div className="grid gap-2">
                {resolutionOptions.map((option) => (
                  <ResolutionOptionCard
                    key={option.type}
                    option={option}
                    onSelect={() => handleSelect(option)}
                  />
                ))}
              </div>
            </div>

            {/* Honesty Note */}
            <p className="text-xs text-gray-500 mt-4 pt-3 border-t italic">
              Each option has tradeoffs. We show you the impact so you can
              decide—we don't hide consequences behind "optimize" buttons.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function MissedTaskResolver({
  missedTasks,
  onResolve,
}: MissedTaskResolverProps) {
  if (missedTasks.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-8 text-center">
          <p className="text-green-800 font-medium">All caught up!</p>
          <p className="text-sm text-green-600 mt-1">No missed tasks to resolve.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Missed Tasks
          </h3>
          <p className="text-sm text-gray-600">
            {missedTasks.length} task{missedTasks.length > 1 ? "s" : ""} need your
            decision. We won't auto-fix—you choose.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {missedTasks.map((missedTask) => (
          <MissedTaskCard
            key={missedTask.id}
            missedTask={missedTask}
            onResolve={(resolution) => onResolve(missedTask.id, resolution)}
          />
        ))}
      </div>
    </div>
  );
}
