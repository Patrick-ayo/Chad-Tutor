import { Gauge, RefreshCw, CheckSquare, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BehaviorSettings, WorkloadIntensity, ReschedulePolicy } from "@/types/settings";

interface BehaviorSectionProps {
  settings: BehaviorSettings;
  onChange: (field: keyof BehaviorSettings, value: unknown) => void;
}

const INTENSITIES: { value: WorkloadIntensity; label: string; description: string }[] = [
  {
    value: "light",
    label: "Light",
    description: "Fewer tasks per day, more buffer days, gentler pace",
  },
  {
    value: "normal",
    label: "Normal",
    description: "Balanced workload with adequate buffers",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    description: "Maximum tasks, minimal buffers, intense pace",
  },
];

const RESCHEDULE_POLICIES: { value: ReschedulePolicy; label: string; description: string }[] = [
  {
    value: "auto",
    label: "Automatic",
    description: "System adjusts schedule without asking",
  },
  {
    value: "ask",
    label: "Ask First",
    description: "Show changes and ask for confirmation",
  },
  {
    value: "manual",
    label: "Manual Only",
    description: "Never auto-reschedule, I'll handle it",
  },
];

export function BehaviorSection({ settings, onChange }: BehaviorSectionProps) {
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Behavior
        </CardTitle>
        <CardDescription>
          How the system adapts to your learning patterns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Intensity Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Workload Intensity</Label>
          <div className="grid gap-2">
            {INTENSITIES.map((intensity) => (
              <div
                key={intensity.value}
                onClick={() => onChange("intensity", intensity.value)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  settings.intensity === intensity.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{intensity.label}</span>
                  {settings.intensity === intensity.value && (
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{intensity.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reschedule Policy */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reschedule Policy
          </Label>
          <div className="flex gap-2 flex-wrap">
            {RESCHEDULE_POLICIES.map((policy) => (
              <Button
                key={policy.value}
                variant={settings.reschedulePolicy === policy.value ? "default" : "outline"}
                size="sm"
                onClick={() => onChange("reschedulePolicy", policy.value)}
                className="flex-1"
              >
                {policy.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {RESCHEDULE_POLICIES.find((p) => p.value === settings.reschedulePolicy)?.description}
          </p>
        </div>

        {/* Toggle Options */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Auto-skip Completed Topics
              </Label>
              <p className="text-xs text-gray-500">
                Skip revision for topics you've mastered
              </p>
            </div>
            <Switch
              checked={settings.autoSkipCompleted}
              onCheckedChange={(checked) => onChange("autoSkipCompleted", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Show Estimates in Minutes
              </Label>
              <p className="text-xs text-gray-500">
                Display time estimates instead of vague labels
              </p>
            </div>
            <Switch
              checked={settings.showEstimatesInMinutes}
              onCheckedChange={(checked) => onChange("showEstimatesInMinutes", checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
