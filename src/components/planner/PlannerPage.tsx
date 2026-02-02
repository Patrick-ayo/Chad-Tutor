import { useState } from "react";
import { CalendarDays, Settings2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimelineView } from "./TimelineView";
import { MissedTaskResolver } from "./MissedTaskResolver";
import { WorkloadControl } from "./WorkloadControl";
import { BurnoutWarningPanel } from "./BurnoutWarningPanel";
import { ChangeSummaryModal } from "./ChangeSummaryModal";
import type {
  PlannerData,
  WorkloadIntensity,
  MissedTaskResolution,
  ScheduleChange,
} from "@/types/planner";

interface PlannerPageProps {
  data: PlannerData;
}

export function PlannerPage({ data }: PlannerPageProps) {
  const [activeTab, setActiveTab] = useState("timeline");
  const [intensity, setIntensity] = useState<WorkloadIntensity>(data.workloadIntensity);
  const [showChangeSummary, setShowChangeSummary] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<ScheduleChange[]>([]);

  const handleIntensityChange = (newIntensity: WorkloadIntensity) => {
    setIntensity(newIntensity);
    // In real app, this would recalculate schedule and show changes
    const simulatedChanges: ScheduleChange[] = [
      {
        id: "change-1",
        type: "task-moved",
        taskId: "task-1",
        taskTitle: "Example Task",
        previousDate: new Date().toISOString(),
        newDate: new Date(Date.now() + 86400000).toISOString(),
        reason: `Adjusted due to ${newIntensity} intensity setting`,
        impact: "This will shift dependent tasks by 1 day",
      },
    ];
    setPendingChanges(simulatedChanges);
    setShowChangeSummary(true);
  };

  const handleMissedTaskResolve = (
    taskId: string,
    resolution: MissedTaskResolution
  ) => {
    // In real app, this would apply the resolution and update schedule
    console.log(`Resolving task ${taskId} with ${resolution.type}`);
    const change: ScheduleChange = {
      id: `change-${Date.now()}`,
      type: resolution.type === "drop" ? "task-removed" : "task-moved",
      taskId,
      taskTitle: data.missedTasks.find((t) => t.id === taskId)?.title || "Task",
      reason: `User chose to ${resolution.type.replace("-", " ")} this task`,
      newDate:
        resolution.type !== "drop"
          ? new Date(Date.now() + 86400000 * 2).toISOString()
          : undefined,
    };
    setPendingChanges([change]);
    setShowChangeSummary(true);
  };

  const handleBurnoutAction = (
    action: "reduce-load" | "add-break" | "skip-day"
  ) => {
    console.log(`Burnout action: ${action}`);
    // In real app, this would adjust schedule based on action
  };

  const handleConfirmChanges = () => {
    // In real app, this would apply changes to the schedule
    console.log("Changes confirmed:", pendingChanges);
    setShowChangeSummary(false);
    setPendingChanges([]);
  };

  const handleRejectChanges = () => {
    // Revert any pending changes
    setIntensity(data.workloadIntensity);
    setShowChangeSummary(false);
    setPendingChanges([]);
  };

  const hasMissedTasks = data.missedTasks.length > 0;
  const hasBurnoutWarning = data.burnoutSignals.riskLevel !== "low";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-7 w-7" />
            Planner & Rescheduler
          </h1>
          <p className="text-gray-600 mt-1">
            Your schedule that adapts to real life—without losing your progress.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Sync
          </Button>
        </div>
      </div>

      {/* Alerts Banner */}
      {(hasMissedTasks || hasBurnoutWarning) && (
        <div className="flex gap-2 flex-wrap">
          {hasMissedTasks && (
            <Button
              variant="outline"
              className="border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100"
              onClick={() => setActiveTab("resolve")}
            >
              {data.missedTasks.length} missed task
              {data.missedTasks.length > 1 ? "s" : ""} need attention
            </Button>
          )}
          {hasBurnoutWarning && (
            <Button
              variant="outline"
              className="border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
              onClick={() => setActiveTab("health")}
            >
              Burnout warning detected
            </Button>
          )}
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="resolve" className="relative">
            Resolve
            {hasMissedTasks && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                {data.missedTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="health" className="relative">
            Health
            {hasBurnoutWarning && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <TimelineView days={data.scheduleDays} />
        </TabsContent>

        <TabsContent value="resolve" className="mt-6">
          {hasMissedTasks ? (
            <MissedTaskResolver
              missedTasks={data.missedTasks}
              onResolve={handleMissedTaskResolve}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No missed tasks</p>
              <p className="text-sm">You're on track! Keep it up.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="workload" className="mt-6">
          <div className="max-w-xl">
            <WorkloadControl
              intensity={intensity}
              onIntensityChange={handleIntensityChange}
              stats={data.workloadStats}
              currentLoad={data.currentLoad}
            />
          </div>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <div className="max-w-xl">
            <BurnoutWarningPanel
              signals={data.burnoutSignals}
              onTakeAction={handleBurnoutAction}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Change Summary Modal */}
      <ChangeSummaryModal
        open={showChangeSummary}
        onOpenChange={setShowChangeSummary}
        changes={pendingChanges}
        onConfirm={handleConfirmChanges}
        onReject={handleRejectChanges}
      />
    </div>
  );
}
