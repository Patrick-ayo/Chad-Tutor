import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Settings2, RefreshCw, ListVideo, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ingestPlaylist, fetchPlaylists, generateScheduleFromPlaylists, resolveMissedTask } from "@/lib/plannerApi";
import type {
  PlannerData,
  ScheduledTask,
} from "@/types/planner";

interface PlannerPageProps {
  data: PlannerData;
  onSync?: () => Promise<void> | void;
}

export function PlannerPage({ data, onSync }: PlannerPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("previous");
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
  const [previousSearch, setPreviousSearch] = useState("");
  const [previousDateFilter, setPreviousDateFilter] = useState("");
  const [previousMinMinutes, setPreviousMinMinutes] = useState("");
  const [previousMaxMinutes, setPreviousMaxMinutes] = useState("");
  const [revisedMode, setRevisedMode] = useState<"all" | "planned" | "done">("all");
  const [importantSessionIds, setImportantSessionIds] = useState<string[]>([]);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedRescheduleTask, setSelectedRescheduleTask] = useState<ScheduledTask | null>(null);
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("planner-important-session-ids");
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setImportantSessionIds(parsed.filter((value): value is string => typeof value === "string"));
      }
    } catch {
      setImportantSessionIds([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("planner-important-session-ids", JSON.stringify(importantSessionIds));
  }, [importantSessionIds]);

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
  const todayDate = new Date();
  const today = todayDate.toDateString();
  const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
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

  const toggleImportantSession = (taskId: string) => {
    setImportantSessionIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const openRescheduleDialog = (task: ScheduledTask, dayDate: string) => {
    setSelectedRescheduleTask(task);
    setSelectedRescheduleDate(dayDate);
    setIsRescheduleDialogOpen(true);
  };

  const handleStartSession = (taskId: string) => {
    navigate(`/session/${taskId}`);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedRescheduleTask) {
      return;
    }

    setIsRescheduling(true);
    setPlannerError(null);
    setPlannerMessage(null);

    try {
      await resolveMissedTask(selectedRescheduleTask.id, "push-forward");
      setPlannerMessage(`Rescheduled session: ${selectedRescheduleTask.title}`);
      setIsRescheduleDialogOpen(false);
      setSelectedRescheduleTask(null);
      setSelectedRescheduleDate(null);

      if (onSync) {
        await onSync();
      }
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : "Failed to reschedule session");
    } finally {
      setIsRescheduling(false);
    }
  };

  type SessionRecord = {
    dayDate: string;
    sortDate: number;
    task: ScheduledTask;
  };

  const allSessions = useMemo<SessionRecord[]>(() => {
    return data.scheduleDays
      .flatMap((day) =>
        day.tasks.map((task) => ({
          dayDate: day.date,
          sortDate: new Date(day.date).getTime(),
          task,
        }))
      )
      .sort((a, b) => b.sortDate - a.sortDate);
  }, [data.scheduleDays]);

  const previousSessions = useMemo(() => {
    const minMinutes = previousMinMinutes ? Number(previousMinMinutes) : undefined;
    const maxMinutes = previousMaxMinutes ? Number(previousMaxMinutes) : undefined;

    return allSessions
      .filter((session) => new Date(session.dayDate) < startOfToday)
      .filter((session) => {
        if (!previousSearch.trim()) {
          return true;
        }

        return session.task.title.toLowerCase().includes(previousSearch.trim().toLowerCase());
      })
      .filter((session) => {
        if (!previousDateFilter) {
          return true;
        }

        const sessionDate = new Date(session.dayDate).toISOString().slice(0, 10);
        return sessionDate === previousDateFilter;
      })
      .filter((session) => {
        const minutesSpent = session.task.actualMinutes ?? session.task.estimatedMinutes;

        if (typeof minMinutes === "number" && Number.isFinite(minMinutes) && minutesSpent < minMinutes) {
          return false;
        }

        if (typeof maxMinutes === "number" && Number.isFinite(maxMinutes) && minutesSpent > maxMinutes) {
          return false;
        }

        return true;
      });
  }, [allSessions, previousSearch, previousDateFilter, previousMinMinutes, previousMaxMinutes, startOfToday]);

  const revisedSessions = useMemo(() => {
    return allSessions
      .filter((session) => session.task.type === "revision")
      .filter((session) => {
        if (revisedMode === "all") {
          return true;
        }

        if (revisedMode === "done") {
          return session.task.status === "completed";
        }

        return session.task.status !== "completed";
      });
  }, [allSessions, revisedMode]);

  const importantSessions = useMemo(() => {
    return allSessions.filter(
      (session) => session.task.priority === "high" || importantSessionIds.includes(session.task.id)
    );
  }, [allSessions, importantSessionIds]);

  const weakSessions = useMemo(() => {
    return allSessions.filter((session) => {
      const isPartiallyDone =
        typeof session.task.partialProgress === "number" &&
        session.task.partialProgress > 0 &&
        session.task.partialProgress < 60;

      return (
        session.task.status === "overdue" ||
        session.task.status === "blocked" ||
        isPartiallyDone
      );
    });
  }, [allSessions]);

  const burnoutSessions = useMemo(() => {
    return allSessions.filter((session) => {
      if (typeof session.task.actualMinutes !== "number") {
        return false;
      }

      return session.task.actualMinutes > session.task.estimatedMinutes;
    });
  }, [allSessions]);

  const formatSessionDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderSessionList = (sessions: SessionRecord[], emptyMessage: string) => {
    if (sessions.length === 0) {
      return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
    }

    return (
      <div className="space-y-2.5">
        {sessions.map((session) => {
          const isImportant =
            session.task.priority === "high" || importantSessionIds.includes(session.task.id);
          const minutesSpent = session.task.actualMinutes ?? session.task.estimatedMinutes;

          return (
            <div key={`${session.dayDate}-${session.task.id}`} className="rounded-lg border bg-card p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{session.task.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {session.task.type} • {session.task.status.replace("-", " ")}
                  </p>
                </div>
                <Button
                  variant={isImportant ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => toggleImportantSession(session.task.id)}
                >
                  <Star className="h-3.5 w-3.5 mr-1" />
                  {isImportant ? "Important" : "Mark important"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatSessionDate(session.dayDate)} • {minutesSpent} min • {session.task.priority} priority
              </p>
              <div className="pt-0.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => openRescheduleDialog(session.task, session.dayDate)}
                >
                  Reschedule
                </Button>
              </div>
              {session.task.actualMinutes && session.task.actualMinutes > session.task.estimatedMinutes && (
                <p className="text-xs text-orange-700">
                  Burnout session: exceeded schedule by {session.task.actualMinutes - session.task.estimatedMinutes} min.
                </p>
              )}
            </div>
          );
        })}
      </div>
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

  const getTodayTaskCardClass = (task: { status: string; partialProgress?: number }) => {
    const isHalfDone =
      task.status === "in-progress" ||
      (typeof task.partialProgress === "number" &&
        task.partialProgress > 0 &&
        task.partialProgress < 100);

    if (task.status === "completed") {
      return "rounded-lg border border-green-300 bg-green-50/70 p-3";
    }

    if (isHalfDone) {
      return "rounded-lg border border-red-300 bg-red-50/70 p-3";
    }

    return "rounded-lg border bg-card p-3";
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
              onClick={() => setActiveTab("weak")}
            >
              {data.missedTasks.length} missed task
              {data.missedTasks.length > 1 ? "s" : ""} need attention
            </Button>
          )}
          {hasBurnoutWarning && (
            <Button
              variant="outline"
              className="border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
              onClick={() => setActiveTab("burnout")}
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
                  className={getTodayTaskCardClass(task)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {task.type} • {task.priority} priority
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{task.estimatedMinutes} min</p>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleStartSession(task.id)}
                        >
                          Start Session
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => openRescheduleDialog(task, todaySchedule.date)}
                        >
                          Reschedule
                        </Button>
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
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{task.title}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {task.estimatedMinutes} min • {task.priority} priority • {task.type}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => openRescheduleDialog(task, day.date)}
                            >
                              Reschedule
                            </Button>
                          </div>

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

      {/* Session Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="previous">Prev Sessions</TabsTrigger>
          <TabsTrigger value="revised">Revised Sessions</TabsTrigger>
          <TabsTrigger value="important">Important Sessions</TabsTrigger>
          <TabsTrigger value="weak" className="relative">
            My Weak Sessions
            {hasMissedTasks && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                {data.missedTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="burnout" className="relative">
            Burnout Sessions
            {hasBurnoutWarning && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="previous" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Previous Sessions</CardTitle>
              <CardDescription>
                Search by topic, date, or time spent. Results are sorted by latest date first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-4 gap-3">
                <Input
                  value={previousSearch}
                  onChange={(event) => setPreviousSearch(event.target.value)}
                  placeholder="Search session topic"
                />
                <Input
                  type="date"
                  value={previousDateFilter}
                  onChange={(event) => setPreviousDateFilter(event.target.value)}
                />
                <Input
                  type="number"
                  min={0}
                  value={previousMinMinutes}
                  onChange={(event) => setPreviousMinMinutes(event.target.value)}
                  placeholder="Min time (minutes)"
                />
                <Input
                  type="number"
                  min={0}
                  value={previousMaxMinutes}
                  onChange={(event) => setPreviousMaxMinutes(event.target.value)}
                  placeholder="Max time (minutes)"
                />
              </div>
              {renderSessionList(previousSessions, "No previous sessions match this search.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revised" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Revised Sessions</CardTitle>
              <CardDescription>
                View planned or completed revision sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={revisedMode === "all" ? "default" : "outline"}
                  onClick={() => setRevisedMode("all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={revisedMode === "planned" ? "default" : "outline"}
                  onClick={() => setRevisedMode("planned")}
                >
                  Planned
                </Button>
                <Button
                  size="sm"
                  variant={revisedMode === "done" ? "default" : "outline"}
                  onClick={() => setRevisedMode("done")}
                >
                  Done
                </Button>
              </div>
              {renderSessionList(revisedSessions, "No revision sessions available for this filter.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="important" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Important Sessions</CardTitle>
              <CardDescription>
                Core backbone sessions plus anything you mark as important.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSessionList(importantSessions, "No important sessions yet. Mark sessions to pin them here.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weak" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">My Weak Sessions</CardTitle>
              <CardDescription>
                Sessions that were overdue, blocked, or only partially completed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSessionList(weakSessions, "No weak sessions detected right now.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="burnout" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Burnout Sessions</CardTitle>
              <CardDescription>
                Sessions where actual time went above scheduled time, useful for recap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSessionList(burnoutSessions, "No burnout sessions found yet.")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Reschedule</DialogTitle>
            <DialogDescription>
              {selectedRescheduleTask
                ? `Reschedule "${selectedRescheduleTask.title}" from ${selectedRescheduleDate ? formatSessionDate(selectedRescheduleDate) : "this date"}?`
                : "Confirm this reschedule action."}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            This will move the session forward based on your active days and current workload.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRescheduleDialogOpen(false);
                setSelectedRescheduleTask(null);
                setSelectedRescheduleDate(null);
              }}
              disabled={isRescheduling}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmReschedule} disabled={isRescheduling || !selectedRescheduleTask}>
              {isRescheduling ? "Rescheduling..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
