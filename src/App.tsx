import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Dashboard } from "@/components/dashboard";
import { GoalBuilderPage } from "@/components/goal-builder";
import { LearningSessionPage } from "@/components/session/LearningSessionPage";
import { ProgressAnalyticsPage } from "@/components/analytics";
import { PlannerPage } from "@/components/planner/PlannerPage";
import { SettingsPage } from "@/components/settings";
import { ExplorePage } from "@/components/explore";
import { BookmarksPage } from "@/components/bookmarks";
import { MyNotesPage } from "@/components/notes";
import { MrChadPage } from "@/components/mr-chad/MrChadPage";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { mockDashboardData } from "@/data/mockDashboard";
import { mockSettings } from "@/data/mockSettings";
import { clearPlannerData, fetchPlannerSnapshot } from "@/lib/plannerApi";
import { applyGoalRoadmapToSessionPlanner } from "@/utils/sessionGoalPlanner";
import type { UserSettings } from "@/types/settings";
import type { PlannerData } from "@/types/planner";
import type { Roadmap } from "@/types/goal";
import type { SessionScheduleSource } from "@/utils/sessionGoalPlanner";
import LoginPage from "@/components/login/LoginPage";

interface SessionScheduleRecord {
  source: SessionScheduleSource;
  roadmap: Roadmap;
  startDate?: string;
}

const SETTINGS_STORAGE_KEY = "chad_tutor_settings";
const PLANNER_DATA_STORAGE_KEY = "chad_tutor_planner_data";
const SESSION_SCHEDULES_STORAGE_KEY = "chad_tutor_session_schedules";
const IMPORTANT_SESSION_IDS_STORAGE_KEY = "planner-important-session-ids";

const EMPTY_PLANNER_DATA: PlannerData = {
  scheduleDays: [],
  missedTasks: [],
  workloadIntensity: "normal",
  workloadStats: {
    tasksPerDay: { light: 1, normal: 2, aggressive: 3 },
    revisionDensity: { light: "20%", normal: "30%", aggressive: "40%" },
    bufferUsage: { light: "15%", normal: "10%", aggressive: "5%" },
  },
  currentLoad: {
    daily: 0,
    weekly: 0,
    maxRecommended: 420,
  },
  burnoutSignals: {
    riskLevel: "low",
    indicators: [],
    recommendations: [],
    detectedPatterns: [],
  },
  pendingChanges: [],
  lastReschedule: new Date().toISOString(),
};

function loadInitialSettings(): UserSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return mockSettings;
    }

    const parsed = JSON.parse(raw) as UserSettings;
    if (parsed?.accessibility && parsed?.availability && parsed?.profile) {
      return parsed;
    }

    return mockSettings;
  } catch {
    return mockSettings;
  }
}

function loadInitialPlannerData(): PlannerData {
  try {
    const raw = window.localStorage.getItem(PLANNER_DATA_STORAGE_KEY);
    if (!raw) {
      return EMPTY_PLANNER_DATA;
    }

    const parsed = JSON.parse(raw) as PlannerData;
    if (parsed && Array.isArray(parsed.scheduleDays) && Array.isArray(parsed.missedTasks)) {
      return parsed;
    }

    return EMPTY_PLANNER_DATA;
  } catch {
    return EMPTY_PLANNER_DATA;
  }
}

function loadInitialSessionSchedules(): SessionScheduleRecord[] {
  try {
    const raw = window.localStorage.getItem(SESSION_SCHEDULES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as SessionScheduleRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        Boolean(item) &&
        (item.source === "goal-builder" || item.source === "mr-chad") &&
        Boolean(item.roadmap?.id),
    );
  } catch {
    return [];
  }
}

function App() {
  const [settings, setSettings] = useState<UserSettings>(() => loadInitialSettings());
  const [plannerData, setPlannerData] = useState<PlannerData>(() => loadInitialPlannerData());
  const [sessionSchedules, setSessionSchedules] = useState<SessionScheduleRecord[]>(() => loadInitialSessionSchedules());

  const persistSettings = (nextSettings: UserSettings) => {
    setSettings(nextSettings);
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
    } catch {
      // Ignore storage failures and keep in-memory settings.
    }
  };

  const applySessionSchedules = (basePlanner: PlannerData, schedules: SessionScheduleRecord[]) => {
    return schedules.reduce((acc, item) => {
      return applyGoalRoadmapToSessionPlanner(
        acc,
        item.roadmap,
        {
          activeDays: settings.availability.activeDays,
          minutesPerDay: settings.availability.minutesPerDay,
        },
        item.startDate,
        item.source,
      );
    }, basePlanner);
  };

  const refreshPlanner = async (
    schedulesOverride?: SessionScheduleRecord[],
    fallbackPlanner?: PlannerData,
  ) => {
    const schedules = schedulesOverride ?? sessionSchedules;

    try {
      const planner = await fetchPlannerSnapshot();
      setPlannerData(applySessionSchedules(planner, schedules));
    } catch (error) {
      console.error("Planner API fallback to empty data:", error);
      setPlannerData(applySessionSchedules(fallbackPlanner ?? EMPTY_PLANNER_DATA, schedules));
    }
  };

  useEffect(() => {
    void refreshPlanner();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(PLANNER_DATA_STORAGE_KEY, JSON.stringify(plannerData));
    } catch {
      // Ignore storage failures and continue with in-memory planner state.
    }
  }, [plannerData]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SESSION_SCHEDULES_STORAGE_KEY, JSON.stringify(sessionSchedules));
    } catch {
      // Ignore storage failures and continue with in-memory schedule state.
    }
  }, [sessionSchedules]);

  const handleSettingsSave = (newSettings: UserSettings) => {
    console.log("Settings saved:", newSettings);
    persistSettings(newSettings);
    // In real app, this would persist to backend
  };

  const upsertSessionSchedule = (
    source: SessionScheduleSource,
    roadmap: Roadmap,
    startDate?: string,
  ) => {
    setSessionSchedules((prev) => {
      const filtered = prev.filter((record) => {
        return !(record.source === source && record.roadmap.id === roadmap.id);
      });
      return [...filtered, { source, roadmap, startDate }];
    });

    setPlannerData((current) =>
      applyGoalRoadmapToSessionPlanner(current, roadmap, {
        activeDays: settings.availability.activeDays,
        minutesPerDay: settings.availability.minutesPerDay,
      }, startDate, source),
    );
  };

  const handleGoalSessionSave = (roadmap: Roadmap, startDate?: string) => {
    upsertSessionSchedule("goal-builder", roadmap, startDate);
  };

  const handleMrChadSessionSave = (roadmap: Roadmap, startDate?: string) => {
    upsertSessionSchedule("mr-chad", roadmap, startDate);
  };

  const handleClearAllData = async () => {
    try {
      await clearPlannerData("clear all");
    } catch (error) {
      console.warn("Remote clear failed; continuing with local clear:", error);
    }

    setPlannerData(EMPTY_PLANNER_DATA);
    setSessionSchedules([]);

    const keysToRemove = [
      PLANNER_DATA_STORAGE_KEY,
      SESSION_SCHEDULES_STORAGE_KEY,
      IMPORTANT_SESSION_IDS_STORAGE_KEY,
      "roadmapProgress",
      "mr-chad-conversations",
      "mr-chad-metadata",
    ];

    keysToRemove.forEach((key) => {
      window.localStorage.removeItem(key);
    });

    const dynamicKeys = Object.keys(window.localStorage).filter(
      (key) => key.startsWith("session_") || key.endsWith("_designatedVideoId"),
    );

    dynamicKeys.forEach((key) => {
      window.localStorage.removeItem(key);
    });

    await refreshPlanner([], EMPTY_PLANNER_DATA);
  };

  return (
    <AccessibilityProvider 
      settings={settings.accessibility} 
      onUpdate={(accessibility) => {
        const newSettings = { ...settings, accessibility };
        persistSettings(newSettings);
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          {/* Main layout pages */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard data={mockDashboardData} />} />
            <Route path="/goals" element={<GoalBuilderPage onSaveGoalSchedule={handleGoalSessionSave} />} />
            <Route path="/session" element={<LearningSessionPage plannerData={plannerData} />} />
            <Route path="/session/:taskId" element={<LearningSessionPage plannerData={plannerData} />} />
            <Route path="/progress" element={<ProgressAnalyticsPage />} />
            <Route path="/schedule" element={<PlannerPage data={plannerData} onSync={refreshPlanner} />} />
            <Route path="/planner" element={<Navigate to="/schedule" replace />} />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  initialSettings={settings}
                  onSave={handleSettingsSave}
                  onClearAllData={handleClearAllData}
                />
              }
            />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/projects/*" element={<Navigate to="/explore" replace />} />
            <Route path="/mr-chad" element={<MrChadPage onApplyRoadmapSchedule={handleMrChadSessionSave} />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/my-notes" element={<MyNotesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AccessibilityProvider>
  );
}

export default App
