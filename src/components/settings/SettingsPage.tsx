import { useState, useCallback } from "react";
import { Settings } from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { AvailabilitySection } from "./AvailabilitySection";
import { BehaviorSection } from "./BehaviorSection";
import { NotificationSection } from "./NotificationSection";
import { AISettingsSection } from "./AISettingsSection";
import { PrivacySection } from "./PrivacySection";
import { AccessibilitySection } from "./AccessibilitySection";
import { ImpactWarningDialog } from "./ImpactWarningDialog";
import type {
  UserSettings,
  AvailabilitySettings,
  BehaviorSettings,
  NotificationSettings,
  AISettings,
  AccessibilitySettings,
  SettingImpact,
} from "@/types/settings";

interface SettingsPageProps {
  initialSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

// Define which settings have impact on what
const settingImpacts: Record<string, SettingImpact[]> = {
  // Availability - affects schedule and roadmap
  "availability.activeDays": ["schedule", "roadmap"],
  "availability.minutesPerDay": ["schedule", "roadmap"],
  "availability.preferredSessionLength": ["schedule"],
  "availability.maxSessionsPerDay": ["schedule"],
  
  // Behavior - affects roadmap and analytics
  "behavior.intensity": ["schedule", "roadmap"],
  "behavior.reschedulePolicy": ["none"],
  "behavior.autoSkipCompleted": ["schedule"],
  "behavior.showEstimatesInMinutes": ["none"],
  
  // Notifications - no impact
  "notifications.*": ["none"],
  
  // AI - no impact on core system
  "ai.*": ["none"],
};

function getImpactsForSetting(section: string, field: string): SettingImpact[] {
  const key = `${section}.${field}`;
  const wildcardKey = `${section}.*`;
  return settingImpacts[key] || settingImpacts[wildcardKey] || ["none"];
}

export function SettingsPage({ initialSettings, onSave }: SettingsPageProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [pendingChange, setPendingChange] = useState<{
    section: string;
    field: string;
    value: unknown;
    impacts: SettingImpact[];
    displayName: string;
  } | null>(null);

  // Handle setting change with impact check
  const handleSettingChange = useCallback(
    (section: keyof UserSettings, field: string, value: unknown, displayName?: string) => {
      const impacts = getImpactsForSetting(section, field);
      const hasImpact = impacts.some((i) => i !== "none");

      if (hasImpact) {
        // Show warning dialog
        setPendingChange({
          section,
          field,
          value,
          impacts,
          displayName: displayName || field,
        });
      } else {
        // Apply immediately
        applyChange(section, field, value);
      }
    },
    []
  );

  const applyChange = (section: keyof UserSettings, field: string, value: unknown) => {
    setSettings((prev) => {
      const sectionData = prev[section];
      const newSettings = {
        ...prev,
        [section]: {
          ...(typeof sectionData === 'object' && sectionData !== null ? sectionData : {}),
          [field]: value,
        },
        version: prev.version + 1,
        lastModified: new Date().toISOString(),
      };
      onSave(newSettings);
      return newSettings;
    });
  };

  const handleConfirmChange = () => {
    if (pendingChange) {
      applyChange(
        pendingChange.section as keyof UserSettings,
        pendingChange.field,
        pendingChange.value
      );
      setPendingChange(null);
    }
  };

  const handleCancelChange = () => {
    setPendingChange(null);
  };

  // Convenience handlers for each section
  const handleAvailabilityChange = (field: keyof AvailabilitySettings, value: unknown) => {
    handleSettingChange("availability", field, value, `Availability: ${field}`);
  };

  const handleBehaviorChange = (field: keyof BehaviorSettings, value: unknown) => {
    handleSettingChange("behavior", field, value, `Behavior: ${field}`);
  };

  const handleNotificationChange = (field: keyof NotificationSettings, value: unknown) => {
    handleSettingChange("notifications", field, value);
  };

  const handleAIChange = (field: keyof AISettings, value: unknown) => {
    handleSettingChange("ai", field, value);
  };

  const handleAccessibilityChange = (field: keyof AccessibilitySettings, value: unknown) => {
    handleSettingChange("accessibility", field, value);
  };

  // Privacy actions
  const handleExportData = () => {
    // In real app, this would trigger a download
    console.log("Exporting data...");
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chad-tutor-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetProgress = () => {
    console.log("Resetting progress...");
    // In real app, this would call an API
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account...");
    // In real app, this would call an API
  };

  return (
    <div className="container max-w-3xl py-8 mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="mb-8 w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 justify-center">
          <Settings className="h-7 w-7" />
          Settings
        </h1>
        <p className="text-gray-600 mt-1 text-center">
          Configure your learning environment. Changes that affect your plan will ask for confirmation.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 w-full flex flex-col items-center">
        <ProfileSection profile={settings.profile} />
        <AvailabilitySection
          settings={settings.availability}
          onChange={handleAvailabilityChange}
        />
        <BehaviorSection
          settings={settings.behavior}
          onChange={handleBehaviorChange}
        />
        <NotificationSection
          settings={settings.notifications}
          onChange={handleNotificationChange}
        />
        <AISettingsSection
          settings={settings.ai}
          onChange={handleAIChange}
        />
        <AccessibilitySection
          settings={settings.accessibility}
          onChange={handleAccessibilityChange}
        />
        <PrivacySection
          privacy={settings.privacy}
          onExportData={handleExportData}
          onResetProgress={handleResetProgress}
          onDeleteAccount={handleDeleteAccount}
        />
      </div>

      {/* Version Info */}
      <p className="text-xs text-gray-400 mt-8 text-center w-full">
        Settings version {settings.version} • Last modified{" "}
        {new Date(settings.lastModified).toLocaleDateString()}
      </p>

      {/* Impact Warning Dialog */}
      <ImpactWarningDialog
        open={pendingChange !== null}
        onOpenChange={(open) => !open && setPendingChange(null)}
        impacts={pendingChange?.impacts || []}
        settingName={pendingChange?.displayName || ""}
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
      />
    </div>
  );
}
