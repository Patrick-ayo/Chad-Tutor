import { useState } from "react";
import { CalendarDays, Settings2, RefreshCw, ListVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimelineView } from "./TimelineView";
import { MissedTaskResolver } from "./MissedTaskResolver";
import { WorkloadControl } from "./WorkloadControl";
import { BurnoutWarningPanel } from "./BurnoutWarningPanel";
import { ChangeSummaryModal } from "./ChangeSummaryModal";
import { resolveMissedTask, ingestPlaylist, fetchPlaylists, generateScheduleFromPlaylists } from "@/lib/plannerApi";
import type {
  PlannerData,
  WorkloadIntensity,
  MissedTaskResolution,
  ScheduleChange,
} from "@/types/planner";

interface PlannerPageProps {
  data: PlannerData;
  onSync?: () => Promise<void> | void;
}

export function PlannerPage({ data, onSync }: PlannerPageProps) {
  const [activeTab, setActiveTab] = useState("timeline");
  const [intensity, setIntensity] = useState<WorkloadIntensity>(data.workloadIntensity);
  const [showChangeSummary, setShowChangeSummary] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<ScheduleChange[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistSource, setPlaylistSource] = useState("youtube");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistItemsInput, setPlaylistItemsInput] = useState("");
  const [playlistIds, setPlaylistIds] = useState<string[]>([]);
  const [plannerMessage, setPlannerMessage] = useState<string | null>(null);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [isSubmittingPlaylist, setIsSubmittingPlaylist] = useState(false);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [showFurtherSessions, setShowFurtherSessions] = useState(false);
  const [expandedTodayTaskIds, setExpandedTodayTaskIds] = useState<string[]>([]);

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
    void (async () => {
      try {
        await resolveMissedTask(taskId, resolution.type);
        if (onSync) {
          await onSync();
        }
      } catch (error) {
        console.error("Failed to resolve missed task:", error);
      }
    })();

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

  const handleSync = async () => {
    if (!onSync) {
      return;
    }

    setIsSyncing(true);
    try {
      await onSync();
      try {
        const playlists = await fetchPlaylists();
        setPlaylistIds(playlists.map((playlist) => playlist.id));
      } catch {
        // Ignore optional playlist refresh failures for now.
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const parsePlaylistItems = () => {
    const lines = playlistItemsInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.map((line, index) => {
      const [titlePart, minutesPart, keyPointsPart, outcomesPart] = line
        .split("|")
        .map((chunk) => chunk.trim());

      const estimatedMinutes = minutesPart ? Number(minutesPart) : undefined;
      const keyPoints = keyPointsPart
        ? keyPointsPart.split(";").map((item) => item.trim()).filter(Boolean)
        : [];
      const learningOutcomes = outcomesPart
        ? outcomesPart.split(";").map((item) => item.trim()).filter(Boolean)
        : [];

      return {
        title: titlePart || `Video ${index + 1}`,
        sequence: index,
        estimatedMinutes: Number.isFinite(estimatedMinutes) ? estimatedMinutes : undefined,
        keyPoints,
        learningOutcomes,
      };
    });
  };

  const handleAddPlaylist = async () => {
    if (!playlistName.trim()) {
      setPlannerError("Playlist name is required.");
      return;
    }

    const items = parsePlaylistItems();
    if (items.length === 0) {
      setPlannerError("Add at least one video line before importing.");
      return;
    }

    setPlannerError(null);
    setPlannerMessage(null);
    setIsSubmittingPlaylist(true);

    try {
      const playlist = await ingestPlaylist({
        name: playlistName,
        externalSource: playlistSource,
        externalUrl: playlistUrl || undefined,
        externalId: playlistUrl || undefined,
        items,
      });

      setPlaylistIds((prev) => [...new Set([...prev, playlist.id])]);
      setPlannerMessage(`Imported playlist: ${playlist.name}`);
      setPlaylistName("");
      setPlaylistUrl("");
      setPlaylistItemsInput("");
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : "Failed to import playlist");
    } finally {
      setIsSubmittingPlaylist(false);
    }
  };

  const handleGenerateSchedule = async () => {
    if (playlistIds.length === 0) {
      setPlannerError("Import at least one playlist before generating schedule.");
      return;
    }

    setPlannerError(null);
    setPlannerMessage(null);
    setIsGeneratingSchedule(true);

    try {
      const result = await generateScheduleFromPlaylists(playlistIds);
      setPlannerMessage(`Schedule generated with ${result.createdCount} planned tasks.`);
      if (onSync) {
        await onSync();
      }
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : "Failed to generate schedule");
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const hasMissedTasks = data.missedTasks.length > 0;
  const hasBurnoutWarning = data.burnoutSignals.riskLevel !== "low";
  const today = new Date().toDateString();
  const todaySchedule = data.scheduleDays.find(
    (day) => new Date(day.date).toDateString() === today
  );
  const futureScheduleDays = data.scheduleDays
    .filter((day) => new Date(day.date) > new Date(today) && day.tasks.length > 0)
    .slice(0, 7);

  const toggleTodayTaskExpand = (taskId: string) => {
    setExpandedTodayTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getAssessmentPlan = (taskType: "learn" | "practice" | "revision") => {
    if (taskType === "practice") {
      return {
        quizType: "Timed problem set",
        questions: 8,
        minutes: 20,
      };
    }

    if (taskType === "revision") {
      return {
        quizType: "Rapid revision check",
        questions: 6,
        minutes: 12,
      };
    }

    return {
      quizType: "Concept check mini-test",
      questions: 5,
      minutes: 10,
    };
  };

  return (
    <div className="py-6 px-4 md:px-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-7 w-7" />
            Schedule & Rescheduler
          </h1>
          <p className="text-muted-foreground mt-1">
            Your study schedule that adapts to real life without losing progress.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {isSyncing ? "Syncing..." : "Sync"}
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Today's Schedule</CardTitle>
          <CardDescription>
            What you should focus on today within your planned study budget.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {todaySchedule && todaySchedule.tasks.length > 0 ? (
            todaySchedule.tasks.map((task) => {
              const isExpanded = expandedTodayTaskIds.includes(task.id);
              const assessment = getAssessmentPlan(task.type);

              return (
                <div
                  key={task.id}
                  className="rounded-lg border bg-card p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {task.type} • {task.priority} priority
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{task.estimatedMinutes} min</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => toggleTodayTaskExpand(task.id)}
                      >
                        {isExpanded ? "Hide" : "Expand"}
                      </Button>
                    </div>
                  </div>

                  {task.keyPoints && task.keyPoints.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {task.keyPoints.slice(0, 2).map((point) => (
                        <p key={point} className="text-xs text-muted-foreground">
                          • {point}
                        </p>
                      ))}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-3 rounded-md border bg-muted/30 p-2.5 space-y-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Subtopics in this session</p>
                        {task.keyPoints && task.keyPoints.length > 0 ? (
                          <div className="space-y-1 mt-1">
                            {task.keyPoints.map((point) => (
                              <p key={`${task.id}-sub-${point}`} className="text-xs text-muted-foreground">
                                • {point}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">Subtopics will be generated from playlist metadata.</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground">What you will learn</p>
                        {task.learningOutcomes && task.learningOutcomes.length > 0 ? (
                          <div className="space-y-1 mt-1">
                            {task.learningOutcomes.map((outcome) => (
                              <p key={`${task.id}-learn-${outcome}`} className="text-xs text-muted-foreground">
                                • {outcome}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">Learning outcomes will be shown when available.</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Test & assessment</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {assessment.quizType}: {assessment.questions} questions • {assessment.minutes} min after completion.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No tasks scheduled for today yet.</p>
          )}

          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFurtherSessions((prev) => !prev)}
            >
              {showFurtherSessions ? "Hide Further Planned Sessions" : "Expand Further Planned Sessions"}
            </Button>
          </div>

          {showFurtherSessions && (
            <div className="space-y-3 pt-1">
              {futureScheduleDays.length > 0 ? (
                futureScheduleDays.map((day) => {
                  const dayTotalMinutes = day.tasks.reduce(
                    (sum, task) => sum + task.estimatedMinutes,
                    0
                  );

                  return (
                    <div key={day.date} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {day.tasks.length} sessions • {dayTotalMinutes} min total
                        </p>
                      </div>

                      {day.tasks.map((task) => (
                        <div key={task.id} className="rounded-md border bg-card p-2 space-y-1.5">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {task.estimatedMinutes} min • {task.priority} priority • {task.type}
                          </p>

                          {task.keyPoints && task.keyPoints.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Key points</p>
                              {task.keyPoints.slice(0, 3).map((point) => (
                                <p key={`${task.id}-kp-${point}`} className="text-xs text-muted-foreground">
                                  • {point}
                                </p>
                              ))}
                            </div>
                          )}

                          {task.learningOutcomes && task.learningOutcomes.length > 0 && (
                            <div className="space-y-1 pt-0.5">
                              <p className="text-xs font-medium text-muted-foreground">Learning outcomes</p>
                              {task.learningOutcomes.slice(0, 2).map((outcome) => (
                                <p key={`${task.id}-lo-${outcome}`} className="text-xs text-muted-foreground">
                                  • {outcome}
                                </p>
                              ))}
                            </div>
                          )}

                          <div className="space-y-1 pt-0.5">
                            <p className="text-xs font-medium text-muted-foreground">Test & assessment</p>
                            <p className="text-xs text-muted-foreground">
                              {getAssessmentPlan(task.type).quizType}: {getAssessmentPlan(task.type).questions} questions • {getAssessmentPlan(task.type).minutes} min
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No further planned sessions yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListVideo className="h-5 w-5" />
            Playlist Intake & Auto-Plan
          </CardTitle>
          <CardDescription>
            Paste your video list and create a time-budgeted study plan with key points and learning outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="playlist-name">Playlist Name</Label>
              <Input
                id="playlist-name"
                value={playlistName}
                onChange={(event) => setPlaylistName(event.target.value)}
                placeholder="Data Structures Semester Plan"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="playlist-source">Source</Label>
              <Input
                id="playlist-source"
                value={playlistSource}
                onChange={(event) => setPlaylistSource(event.target.value)}
                placeholder="youtube"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="playlist-url">Playlist URL or ID</Label>
              <Input
                id="playlist-url"
                value={playlistUrl}
                onChange={(event) => setPlaylistUrl(event.target.value)}
                placeholder="https://youtube.com/playlist?..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="playlist-items">Videos (one line each)</Label>
            <Textarea
              id="playlist-items"
              value={playlistItemsInput}
              onChange={(event) => setPlaylistItemsInput(event.target.value)}
              placeholder="Video Title | 35 | key point 1;key point 2 | learning outcome 1;learning outcome 2"
              className="min-h-28"
            />
            <p className="text-xs text-muted-foreground">
              Format: title | minutes | key points (;) | outcomes (;)
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddPlaylist} disabled={isSubmittingPlaylist}>
              {isSubmittingPlaylist ? "Importing..." : "Import Playlist"}
            </Button>
            <Button variant="outline" onClick={handleGenerateSchedule} disabled={isGeneratingSchedule}>
              {isGeneratingSchedule ? "Generating..." : "Generate Schedule"}
            </Button>
            {playlistIds.length > 0 && (
              <span className="text-sm text-muted-foreground self-center">
                {playlistIds.length} playlist{playlistIds.length > 1 ? "s" : ""} ready
              </span>
            )}
          </div>

          {plannerMessage && <p className="text-sm text-green-700">{plannerMessage}</p>}
          {plannerError && <p className="text-sm text-red-700">{plannerError}</p>}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="timeline">Schedule</TabsTrigger>
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
