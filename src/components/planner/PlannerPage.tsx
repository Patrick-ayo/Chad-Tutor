import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { CalendarDays, Settings2, RefreshCw, ListVideo, Star, ChevronDown, ChevronUp, Play, Award, CheckSquare, BookOpen, ShieldAlert } from "lucide-react";
import { useScheduleStore } from "@/lib/scheduleStore";
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
import {
  ingestPlaylist,
  fetchPlaylists,
  generateScheduleFromPlaylists,
  resolveMissedTask,
  resolveMissedTasksMultiTopic,
  recomputeSchedule,
  fetchTopicStatuses,
} from "@/lib/plannerApi";
import type { Roadmap } from "@/types/goal";
import type {
  PlannerData,
  SuggestedAction,
  ScheduledTask,
  TopicStatus,
} from "@/types/planner";
import type { SessionScheduleSource } from "@/utils/sessionGoalPlanner";
import { SuggestedActionsModal } from "@/components/planner/SuggestedActionsModal";
import { TopicStatusBar } from "@/components/planner/TopicStatusBar";

interface SessionScheduleRecord {
  source: SessionScheduleSource;
  roadmap: Roadmap;
  startDate?: string;
  permissionGranted?: boolean;
  approvedAt?: string;
}

interface PlannerPageProps {
  data: PlannerData;
  onSync?: () => Promise<void> | void;
  sessionSchedules?: SessionScheduleRecord[];
  onSchedulePermissionChange?: (source: SessionScheduleSource, roadmapId: string, permissionGranted: boolean) => void;
}

export function PlannerPage({ data, onSync, sessionSchedules = [], onSchedulePermissionChange }: PlannerPageProps) {
  const { userId } = useAuth();
  const importantSessionStorageKey = `user:${userId || "anonymous"}:planner-important-session-ids`;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("previous");
  const [isSyncing, setIsSyncing] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistSource, setPlaylistSource] = useState("youtube");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistItemsInput, setPlaylistItemsInput] = useState("");
  const [playlistSubject, setPlaylistSubject] = useState("");
  const [playlistFormat, setPlaylistFormat] = useState("");
  const [playlistIds, setPlaylistIds] = useState<string[]>([]);
  const [plannerMessage, setPlannerMessage] = useState<string | null>(null);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [isSubmittingPlaylist, setIsSubmittingPlaylist] = useState(false);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const { tasks } = useScheduleStore();
  const [expandedRoadmapIds, setExpandedRoadmapIds] = useState<string[]>([]);
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);
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
  const [horizonDaysInput, setHorizonDaysInput] = useState("14");
  const [isResolvingAllMissed, setIsResolvingAllMissed] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [isSuggestedActionsOpen, setIsSuggestedActionsOpen] = useState(false);
  const [topicStatuses, setTopicStatuses] = useState<TopicStatus[]>([]);
  const currentGoalIds = useMemo(
    () =>
      Array.from(
        new Set(
          data.scheduleDays
            .flatMap((day) => day.tasks.map((task) => task.goalId))
            .concat(data.missedTasks.map((task) => task.goalId))
            .filter((goalId): goalId is string => typeof goalId === "string" && goalId.trim().length > 0),
        ),
      ),
    [data.scheduleDays, data.missedTasks],
  );

  const approvedSchedules = useMemo(
    () => sessionSchedules.filter((record) => record.permissionGranted !== false),
    [sessionSchedules],
  );

  const pendingSchedules = useMemo(
    () => sessionSchedules.filter((record) => record.permissionGranted === false),
    [sessionSchedules],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(importantSessionStorageKey);
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
  }, [importantSessionStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(importantSessionStorageKey, JSON.stringify(importantSessionIds));
  }, [importantSessionIds, importantSessionStorageKey]);

  useEffect(() => {
    const handleSuggestedActions = (event: Event) => {
      const detail = (event as CustomEvent<{ source: string; actions: SuggestedAction[] }>).detail;

      if (!detail?.actions?.length) {
        return;
      }

      setSuggestedActions(detail.actions);
      setIsSuggestedActionsOpen(true);
    };

    window.addEventListener("planner:suggested-actions", handleSuggestedActions);

    return () => {
      window.removeEventListener("planner:suggested-actions", handleSuggestedActions);
    };
  }, []);

  useEffect(() => {
    // Auto-detect Source (Platform)
    if (!playlistSource || playlistSource === "youtube") {
      const urlLower = playlistUrl.toLowerCase();
      if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
        setPlaylistSource("youtube");
      } else if (urlLower.includes("coursera.org")) {
        setPlaylistSource("coursera");
      } else if (urlLower.includes("udemy.com")) {
        setPlaylistSource("udemy");
      } else if (urlLower.includes("edx.org")) {
        setPlaylistSource("edx");
      } else if (urlLower.length > 5) {
        setPlaylistSource("custom");
      }
    }

    const combinedText = `${playlistName} ${playlistItemsInput}`.toLowerCase();

    // Auto-detect Format
    if (!playlistFormat && combinedText.length > 3) {
      if (combinedText.includes("crash course")) setPlaylistFormat("Crash Course");
      else if (combinedText.includes("tutorial")) setPlaylistFormat("Tutorial");
      else if (combinedText.includes("podcast")) setPlaylistFormat("Podcast");
      else if (combinedText.includes("interview")) setPlaylistFormat("Interview");
      else if (combinedText.includes("lecture")) setPlaylistFormat("Lecture Series");
      else if (combinedText.includes("workshop")) setPlaylistFormat("Workshop");
      else if (combinedText.includes("review")) setPlaylistFormat("Review");
      else if (playlistItemsInput.split("\\n").length > 3) setPlaylistFormat("Course");
    }

    // Auto-detect Subject
    if (!playlistSubject && combinedText.length > 3) {
      if (/\\b(math|calculus|algebra|geometry|trigonometry)\\b/i.test(combinedText)) setPlaylistSubject("Mathematics");
      else if (/\\b(programming|coding|javascript|python|react|java|c\\+\\+|node|web|software)\\b/i.test(combinedText)) setPlaylistSubject("Computer Science");
      else if (/\\b(physics|chemistry|biology|science|astronomy)\\b/i.test(combinedText)) setPlaylistSubject("Science");
      else if (/\\b(history|geography|politics|sociology)\\b/i.test(combinedText)) setPlaylistSubject("Humanities");
      else if (/\\b(business|finance|marketing|economics)\\b/i.test(combinedText)) setPlaylistSubject("Business & Finance");
      else if (/\\b(art|design|music|drawing)\\b/i.test(combinedText)) setPlaylistSubject("Arts & Design");
      else if (/\\b(language|english|spanish|french|grammar)\\b/i.test(combinedText)) setPlaylistSubject("Language Learning");
      else if (/\\b(health|fitness|workout|diet)\\b/i.test(combinedText)) setPlaylistSubject("Health & Fitness");
    }
  }, [playlistUrl, playlistItemsInput, playlistName, playlistSource, playlistFormat, playlistSubject]);

  useEffect(() => {
    let isActive = true;

    const refreshTopicStatuses = async () => {
      if (!userId) return;
      try {
        const topics = await fetchTopicStatuses();
        if (isActive) {
          setTopicStatuses(topics);
        }
      } catch (err) {
        console.warn("Failed to fetch planner topic statuses:", err);
      }
    };

    // TOPIC STATUS REFRESH: initial mount
    void refreshTopicStatuses();

    const handleTopicStatusRefresh = () => {
      // TOPIC STATUS REFRESH: planner event
      void refreshTopicStatuses();
    };

    window.addEventListener("planner:topic-status-refresh", handleTopicStatusRefresh);

    return () => {
      isActive = false;
      window.removeEventListener("planner:topic-status-refresh", handleTopicStatusRefresh);
    };
  }, []);

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

  const formatScheduleSource = (source: SessionScheduleSource) => {
    if (source === "goal-builder") {
      return "Goal Builder";
    }

    return "Mr Chad";
  };

  const formatScheduleStart = (startDate?: string) => {
    if (!startDate) {
      return "Starts now";
    }

    return new Date(startDate).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
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
      const parts = [];
      if (playlistSource) parts.push(playlistSource);
      if (playlistFormat) parts.push(playlistFormat);
      if (playlistSubject) parts.push(`on ${playlistSubject}`);
      const categoryDesc = parts.length > 0 ? parts.join(" ") : "Playlist";

      const playlist = await ingestPlaylist({
        name: playlistName,
        description: categoryDesc,
        externalSource: playlistSource,
        externalUrl: playlistUrl || undefined,
        externalId: playlistUrl || undefined,
        items,
      });

      setPlaylistIds((prev) => [...new Set([...prev, playlist.id])]);
      
      const parsedHorizon = Number(horizonDaysInput);
      const horizonDays = Number.isFinite(parsedHorizon) && parsedHorizon > 0 ? Math.floor(parsedHorizon) : undefined;
      
      const result = await generateScheduleFromPlaylists(
        [playlist.id],
        undefined,
        horizonDays
      );

      const horizonText = result.horizonDays ? ` within ${result.horizonDays} day horizon` : "";
      const groupText = result.groupSummary ? ` Split: deadline ${result.groupSummary.deadline}, time ${result.groupSummary.time}, effort ${result.groupSummary.effort}.` : "";
      
      setPlannerMessage(`Imported ${categoryDesc}: "${playlist.name}" and generated ${result.createdCount} planned tasks${horizonText}.${groupText}`);
      
      setPlaylistName("");
      setPlaylistUrl("");
      setPlaylistItemsInput("");

      // Recompute other goals just in case
      currentGoalIds.forEach((goalId) => {
        void recomputeSchedule(goalId, "playlist-added");
      });

      if (onSync) {
        await onSync();
      }
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : "Failed to import playlist and generate schedule");
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
      const parsedHorizon = Number(horizonDaysInput);
      const horizonDays =
        Number.isFinite(parsedHorizon) && parsedHorizon > 0
          ? Math.floor(parsedHorizon)
          : undefined;

      const result = await generateScheduleFromPlaylists(
        playlistIds,
        undefined,
        horizonDays,
      );
      if ((result.unscheduledCount ?? 0) > 0) {
        const horizonText = result.horizonDays
          ? ` within ${result.horizonDays} day horizon`
          : "";
        const groupText = result.groupSummary
          ? ` Split: deadline ${result.groupSummary.deadline}, time ${result.groupSummary.time}, effort ${result.groupSummary.effort}.`
          : "";
        setPlannerMessage(
          `Schedule generated with ${result.createdCount} planned tasks${horizonText}. ${result.unscheduledCount} tasks could not be scheduled.${groupText}`,
        );
      } else {
        const groupText = result.groupSummary
          ? ` Split: deadline ${result.groupSummary.deadline}, time ${result.groupSummary.time}, effort ${result.groupSummary.effort}.`
          : "";
        setPlannerMessage(`Schedule generated with ${result.createdCount} planned tasks.${groupText}`);
      }
      if (onSync) {
        await onSync();
      }
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : "Failed to generate schedule");
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const handleResolveAllMissed = async () => {
    if (data.missedTasks.length === 0) {
      return;
    }

    setPlannerError(null);
    setPlannerMessage(null);
    setIsResolvingAllMissed(true);

    try {
      const result = await resolveMissedTasksMultiTopic(
        data.missedTasks.map((task) => task.id),
      );

      setPlannerMessage(`Resolved ${result.updatedTasks.length} missed task${result.updatedTasks.length > 1 ? "s" : ""}.`);

      if (onSync) {
        await onSync();
      }
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : "Failed to resolve missed tasks");
    } finally {
      setIsResolvingAllMissed(false);
    }
  };

  const hasMissedTasks = data.missedTasks.length > 0;
  const hasBurnoutWarning = data.burnoutSignals.riskLevel !== "low";
  
  // Normalize today to start of day (midnight) for accurate date comparisons
  const todayDate = (() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  })();
  
  const startOfToday = new Date(todayDate); // Already normalized to start of day

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

  const handleConfirmSuggestedAction = (action: SuggestedAction) => {
    setSuggestedActions((current) => {
      const next = current.filter((item) => item.type !== action.type || item.label !== action.label);

      if (next.length === 0) {
        setIsSuggestedActionsOpen(false);
      }

      return next;
    });

    setPlannerMessage(`Confirmed: ${action.label}.`);
  };

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

  const getAssessmentPlan = (taskType: "learn" | "practice" | "quiz" | "revision") => {
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
      <SuggestedActionsModal
        open={isSuggestedActionsOpen}
        onOpenChange={setIsSuggestedActionsOpen}
        actions={suggestedActions}
        sourceLabel="planner"
        onConfirmAction={handleConfirmSuggestedAction}
      />
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
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100"
                onClick={() => setActiveTab("weak")}
              >
                {data.missedTasks.length} missed task
                {data.missedTasks.length > 1 ? "s" : ""} need attention
              </Button>
              <Button
                variant="outline"
                onClick={handleResolveAllMissed}
                disabled={isResolvingAllMissed || data.missedTasks.length === 0}
              >
                {isResolvingAllMissed ? "Resolving..." : "Resolve All Missed"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Pushes all missed tasks forward in one action using your current schedule rules.
              </p>
            </div>
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

      <TopicStatusBar topics={topicStatuses} />

      {pendingSchedules.length > 0 && (
        <Card className="border-dashed border-2 border-amber-300 bg-amber-50/10 dark:border-amber-950 dark:bg-amber-950/5 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 animate-pulse text-amber-600 dark:text-amber-400" />
                Pending Permission ({pendingSchedules.length})
              </CardTitle>
              <CardDescription className="text-xs text-amber-700 dark:text-amber-400">
                These schedules are prepared but hidden from the daily calendar until permission is granted.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingSchedules.map((record) => (
              <div key={`${record.source}-${record.roadmap.id}-pending`} className="rounded-lg border bg-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-amber-400/50 transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{record.roadmap.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatScheduleSource(record.source)} • {formatScheduleStart(record.startDate)}
                  </p>
                  {record.roadmap.description && (
                    <p className="text-xs text-muted-foreground mt-1">{record.roadmap.description}</p>
                  )}
                </div>
                {onSchedulePermissionChange && (
                  <Button
                    size="sm"
                    onClick={() => onSchedulePermissionChange(record.source, record.roadmap.id, true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm h-8"
                  >
                    Grant Permission
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {approvedSchedules.length === 0 ? (
        <Card className="border border-muted/50 shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">
            No active schedules. Use the Goal Builder or consult Mr. Chad to generate a detailed roadmap.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvedSchedules.map((record) => {
            const isExpanded = expandedRoadmapIds.includes(record.roadmap.id);
            
            // Filter tasks belonging to this roadmap/goal
            const roadmapTasks = tasks.filter((t) => t.goalId === record.roadmap.id);
            const total = roadmapTasks.length;
            const completed = roadmapTasks.filter((t) => t.status === "completed").length;
            const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            // Find active task (in-progress, or first pending if none is in-progress)
            let activeTaskId = roadmapTasks.find((t) => t.status === "in-progress")?.id;
            if (!activeTaskId) {
              activeTaskId = roadmapTasks.find((t) => t.status === "pending")?.id;
            }

            // Group tasks by scheduledDate
            const tasksByDate = new Map<string, ScheduledTask[]>();
            roadmapTasks.forEach((task) => {
              const dateStr = task.scheduledDate;
              const list = tasksByDate.get(dateStr) || [];
              list.push(task);
              tasksByDate.set(dateStr, list);
            });

            // Sort dates chronologically
            const sortedDates = Array.from(tasksByDate.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

            return (
              <Card key={record.roadmap.id} className="border border-muted/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50/40 to-purple-50/10 dark:from-slate-900/50 dark:to-slate-800/10 pb-4 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                          {formatScheduleSource(record.source)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Starts {formatScheduleStart(record.startDate)}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                        {record.roadmap.name || "Learning Roadmap"}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {record.roadmap.description || "A personalized learning plan designed for your goals."}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right space-y-0.5">
                        <div className="text-sm font-semibold text-foreground">
                          {progressPercent}% Complete
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {completed} of {total} Tasks Completed
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {onSchedulePermissionChange && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSchedulePermissionChange(record.source, record.roadmap.id, false)}
                            className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-950 dark:hover:bg-red-950/20 text-xs"
                          >
                            Hide
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => navigate(`/session?goalId=${record.roadmap.id}&action=start`)}
                          className="h-8 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Start Session <Play className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setExpandedRoadmapIds((prev) =>
                              prev.includes(record.roadmap.id)
                                ? prev.filter((id) => id !== record.roadmap.id)
                                : [...prev, record.roadmap.id]
                            );
                          }}
                          className="h-8 gap-1 text-xs"
                        >
                          {isExpanded ? (
                            <>
                              Collapse <ChevronUp className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <>
                              Expand Plan <ChevronDown className="h-3.5 w-3.5" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="p-0 animate-in fade-in duration-300">
                    <div className="divide-y divide-muted/30">
                      {sortedDates.map((dateStr, dayIndex) => {
                        const dayTasks = tasksByDate.get(dateStr) || [];
                        const dayDate = new Date(dateStr);
                        const isToday = dayDate.toDateString() === new Date().toDateString();
                        const formattedDate = dayDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        });
                        
                        const dayTotalMinutes = dayTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
                        const dayCompletedTasks = dayTasks.filter(t => t.status === 'completed').length;
                        const isDayComplete = dayCompletedTasks === dayTasks.length;

                        return (
                          <div key={dateStr} className={`p-4 md:p-5 space-y-3 transition-colors ${isToday ? "bg-indigo-50/10 dark:bg-indigo-950/5 border-l-4 border-indigo-500" : ""}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                                  DAY {dayIndex + 1}
                                </span>
                                <span className="text-xs font-semibold text-foreground">
                                  • {formattedDate}
                                </span>
                                {isToday && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-600 text-white animate-pulse">
                                    TODAY
                                  </span>
                                )}
                                {isDayComplete && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                                    ✓ ALL DONE
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {dayTasks.length} task{dayTasks.length > 1 ? "s" : ""} • {dayTotalMinutes} min total
                              </div>
                            </div>

                            <div className="grid gap-2">
                              {dayTasks.map((task) => {
                                const isTaskCompleted = task.status === "completed";
                                const isTaskActive = task.id === activeTaskId;
                                const isDetailsExpanded = expandedTaskIds.includes(task.id);
                                const assessment = getAssessmentPlan(task.type);
                                
                                const getTaskIcon = () => {
                                  switch (task.type) {
                                    case "learn":
                                      return <Play className={`h-3.5 w-3.5 ${isTaskActive ? "text-indigo-600 animate-pulse" : isTaskCompleted ? "text-green-600" : "text-slate-500"}`} />;
                                    case "quiz":
                                      return <Award className={`h-3.5 w-3.5 ${isTaskActive ? "text-purple-600" : isTaskCompleted ? "text-green-600" : "text-slate-500"}`} />;
                                    case "practice":
                                      return <CheckSquare className={`h-3.5 w-3.5 ${isTaskActive ? "text-blue-600" : isTaskCompleted ? "text-green-600" : "text-slate-500"}`} />;
                                    default:
                                      return <BookOpen className="h-3.5 w-3.5 text-slate-500" />;
                                  }
                                };

                                return (
                                  <div
                                    key={task.id}
                                    onClick={() => !isTaskCompleted && handleStartSession(task.id)}
                                    className={`rounded-lg border p-3.5 transition-all duration-200 ${!isTaskCompleted ? "cursor-pointer hover:shadow-md" : ""} ${
                                      isTaskCompleted
                                        ? "bg-slate-50/50 dark:bg-slate-900/10 border-slate-200/60 dark:border-slate-800/80 opacity-60"
                                        : isTaskActive
                                        ? "bg-gradient-to-r from-indigo-50/30 to-purple-50/10 dark:from-indigo-950/10 dark:to-purple-950/5 border-indigo-300 dark:border-indigo-800 shadow-sm scale-[1.005]"
                                        : "bg-card border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-md ${isTaskActive ? "bg-indigo-100 dark:bg-indigo-900/40" : "bg-muted"}`}>
                                          {getTaskIcon()}
                                        </div>
                                        <div className="space-y-0.5">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <p className={`font-semibold text-xs text-foreground ${isTaskCompleted ? "line-through text-muted-foreground" : ""}`}>
                                              {task.title}
                                            </p>
                                            {isTaskCompleted && (
                                              <span className="inline-flex items-center text-[8px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-1 py-0.5 rounded">
                                                ✓ Completed
                                              </span>
                                            )}
                                            {isTaskActive && (
                                              <span className="inline-flex items-center text-[8px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-1 py-0.5 rounded border border-indigo-200/50">
                                                Active
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[10px] text-muted-foreground capitalize">
                                            {task.type} • {task.priority} priority • {task.estimatedMinutes} min
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        {!isTaskCompleted && (
                                          <Button
                                            size="sm"
                                            className={`h-6 px-2.5 text-[10px] font-bold ${isTaskActive ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" : ""}`}
                                            variant={isTaskActive ? "default" : "outline"}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStartSession(task.id);
                                            }}
                                          >
                                            {isTaskActive ? "Start Now" : "Start Anyway"}
                                          </Button>
                                        )}
                                        
                                        {!isTaskCompleted && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                                            onClick={() => openRescheduleDialog(task, dateStr)}
                                          >
                                            Reschedule
                                          </Button>
                                        )}
                                        
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            setExpandedTaskIds((prev) =>
                                              prev.includes(task.id) ? prev.filter(id => id !== task.id) : [...prev, task.id]
                                            );
                                          }}
                                        >
                                          {isDetailsExpanded ? (
                                            <ChevronUp className="h-3.5 w-3.5" />
                                          ) : (
                                            <ChevronDown className="h-3.5 w-3.5" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>

                                    {isDetailsExpanded && (
                                      <div className="mt-2.5 pt-2.5 border-t border-muted/50 space-y-2 text-[11px] text-muted-foreground animate-in slide-in-from-top-1 duration-200">
                                        {task.videoTitle && (
                                          <div className="space-y-0.5">
                                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                                              <ListVideo className="h-3.5 w-3.5 text-indigo-500" />
                                              Assigned Video Content
                                            </p>
                                            <p className="pl-5 text-indigo-600 dark:text-indigo-400 font-medium">
                                              {task.videoTitle}
                                            </p>
                                          </div>
                                        )}
                                        
                                        {task.keyPoints && task.keyPoints.length > 0 && (
                                          <div className="space-y-0.5">
                                            <p className="font-semibold text-foreground">Topics / Subtopics</p>
                                            <div className="pl-3 space-y-0.5">
                                              {task.keyPoints.map((point) => (
                                                <p key={point}>• {point}</p>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {task.learningOutcomes && task.learningOutcomes.length > 0 && (
                                          <div className="space-y-0.5">
                                            <p className="font-semibold text-foreground">Learning Outcomes</p>
                                            <div className="pl-3 space-y-0.5">
                                              {task.learningOutcomes.map((outcome) => (
                                                <p key={outcome}>• {outcome}</p>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        <div className="space-y-0.5">
                                          <p className="font-semibold text-foreground">Assessment & Practice Plan</p>
                                          <p className="pl-3">
                                            {assessment.quizType}: {assessment.questions} questions • {assessment.minutes} min
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

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
          
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="playlist-subject">Subject (Auto-detected)</Label>
              <Input
                id="playlist-subject"
                value={playlistSubject}
                onChange={(event) => setPlaylistSubject(event.target.value)}
                placeholder="e.g. Computer Science, Math"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="playlist-format">Format (Auto-detected)</Label>
              <Input
                id="playlist-format"
                value={playlistFormat}
                onChange={(event) => setPlaylistFormat(event.target.value)}
                placeholder="e.g. Crash Course, Lecture"
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

          <div className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="horizon-days">Horizon Days</Label>
              <Input
                id="horizon-days"
                type="number"
                min={1}
                step={1}
                className="w-28"
                value={horizonDaysInput}
                onChange={(event) => setHorizonDaysInput(event.target.value)}
                placeholder="14"
              />
            </div>
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
          <TabsTrigger value="all">All Sessions</TabsTrigger>
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

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">All Sessions</CardTitle>
              <CardDescription>
                All planned sessions organized by date and dedicated time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSessionList(allSessions, "No sessions planned yet.")}
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
