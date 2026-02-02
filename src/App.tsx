import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Dashboard } from "@/components/dashboard";
import { GoalBuilderPage } from "@/components/goal-builder";
import { LearningSessionPage } from "@/components/session/LearningSessionPage";
import { ProgressAnalyticsPage } from "@/components/analytics";
import { PlannerPage } from "@/components/planner/PlannerPage";
import { SettingsPage } from "@/components/settings";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { mockDashboardData } from "@/data/mockDashboard";
import { mockPlannerData } from "@/data/mockPlanner";
import { mockSettings } from "@/data/mockSettings";
import type { UserSettings } from "@/types/settings";

function App() {
  const [settings, setSettings] = useState<UserSettings>(mockSettings);

  const handleSettingsSave = (newSettings: UserSettings) => {
    console.log("Settings saved:", newSettings);
    setSettings(newSettings);
    // In real app, this would persist to backend
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
          {/* Main layout pages */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard data={mockDashboardData} />} />
            <Route path="/goals" element={<GoalBuilderPage />} />
            <Route path="/session/:taskId" element={<LearningSessionPage />} />
            <Route path="/progress" element={<ProgressAnalyticsPage />} />
            <Route path="/planner" element={<PlannerPage data={mockPlannerData} />} />
            <Route path="/settings" element={<SettingsPage initialSettings={settings} onSave={handleSettingsSave} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AccessibilityProvider>
  );
}

export default App
