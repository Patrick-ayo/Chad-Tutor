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
import { mockPlannerData } from "@/data/mockPlanner";
import { mockSettings } from "@/data/mockSettings";
import { fetchPlannerSnapshot } from "@/lib/plannerApi";
import { applyGoalRoadmapToSessionPlanner } from "@/utils/sessionGoalPlanner";
import type { UserSettings } from "@/types/settings";
import type { PlannerData } from "@/types/planner";
import type { Roadmap } from "@/types/goal";
import LoginPage from "@/components/login/LoginPage";

function App() {
  const [settings, setSettings] = useState<UserSettings>(mockSettings);
  const [plannerData, setPlannerData] = useState<PlannerData>(mockPlannerData);

  const refreshPlanner = async () => {
    try {
      const planner = await fetchPlannerSnapshot();
      setPlannerData(planner);
    } catch (error) {
      console.error("Planner API fallback to mock data:", error);
      setPlannerData(mockPlannerData);
    }
  };

  useEffect(() => {
    void refreshPlanner();
  }, []);

  const handleSettingsSave = (newSettings: UserSettings) => {
    console.log("Settings saved:", newSettings);
    setSettings(newSettings);
    // In real app, this would persist to backend
  };

  const handleGoalSessionSave = (roadmap: Roadmap) => {
    setPlannerData((current) =>
      applyGoalRoadmapToSessionPlanner(current, roadmap, {
        activeDays: settings.availability.activeDays,
        minutesPerDay: settings.availability.minutesPerDay,
      }),
    );
  };

  return (
    <AccessibilityProvider 
      settings={settings.accessibility} 
      onUpdate={(accessibility) => {
        const newSettings = { ...settings, accessibility };
        setSettings(newSettings);
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          {/* Main layout pages */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard data={mockDashboardData} />} />
            <Route path="/goals" element={<GoalBuilderPage onSaveGoalSchedule={handleGoalSessionSave} />} />
            <Route path="/session/:taskId" element={<LearningSessionPage />} />
            <Route path="/progress" element={<ProgressAnalyticsPage />} />
            <Route path="/schedule" element={<PlannerPage data={plannerData} onSync={refreshPlanner} />} />
            <Route path="/planner" element={<Navigate to="/schedule" replace />} />
            <Route path="/settings" element={<SettingsPage initialSettings={settings} onSave={handleSettingsSave} />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/projects/*" element={<Navigate to="/explore" replace />} />
            <Route path="/mr-chad" element={<MrChadPage />} />
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
