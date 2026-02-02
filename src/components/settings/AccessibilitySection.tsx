import { Eye, Type, Zap, Focus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { AccessibilitySettings, Theme, TextSize } from "@/types/settings";

interface AccessibilitySectionProps {
  settings: AccessibilitySettings;
  onChange: (field: keyof AccessibilitySettings, value: unknown) => void;
}

const THEMES: { value: Theme; label: string; description: string }[] = [
  { value: "light", label: "Light", description: "Bright theme for daytime" },
  { value: "dark", label: "Dark", description: "Dark theme for night sessions" },
  { value: "system", label: "System", description: "Matches your device settings" },
];

const TEXT_SIZES: { value: TextSize; label: string; description: string }[] = [
  { value: "small", label: "Small", description: "Compact" },
  { value: "default", label: "Default", description: "Standard" },
  { value: "large", label: "Large", description: "Comfortable" },
];

export function AccessibilitySection({ settings, onChange }: AccessibilitySectionProps) {
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Accessibility
        </CardTitle>
        <CardDescription>
          Visual comfort and focus mode accommodations for long study sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Theme</Label>
          <p className="text-xs text-gray-500">
            Reduces eye strain during long sessions. Default is System.
          </p>
          <div className="flex gap-2">
            {THEMES.map((theme) => (
              <Button
                key={theme.value}
                variant={settings.theme === theme.value ? "default" : "outline"}
                size="sm"
                onClick={() => onChange("theme", theme.value)}
                className="flex-1"
              >
                {theme.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Text Size */}
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Type className="h-4 w-4" />
            Text Size
          </Label>
          <p className="text-xs text-gray-500">
            Three steps only. No sliders to break layouts.
          </p>
          <div className="flex gap-2">
            {TEXT_SIZES.map((size) => (
              <Button
                key={size.value}
                variant={settings.textSize === size.value ? "default" : "outline"}
                size="sm"
                onClick={() => onChange("textSize", size.value)}
                className="flex-1"
              >
                {size.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Reduce Motion */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Reduce Motion
            </Label>
            <p className="text-xs text-gray-500">
              Disables animations and transitions to reduce motion fatigue
            </p>
          </div>
          <Switch
            checked={settings.reduceMotion}
            onCheckedChange={(checked) => onChange("reduceMotion", checked)}
          />
        </div>

        {/* Focus Mode Aids */}
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Focus className="h-4 w-4" />
            Focus Mode Aids
          </Label>
          <p className="text-xs text-gray-500">
            Makes strict enforcement fair, not hostile.
          </p>

          {/* Extra Warning Time */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Extra Warning Time</Label>
              <p className="text-xs text-gray-500">
                More time before kiosk mode locks in
              </p>
            </div>
            <Switch
              checked={settings.focusModeAids.extraWarningTime}
              onCheckedChange={(checked) =>
                onChange("focusModeAids", {
                  ...settings.focusModeAids,
                  extraWarningTime: checked,
                })
              }
            />
          </div>

          {/* Larger Timer Text */}
          <div className="flex items-center justify-between py-2 border-t">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Larger Timer Text</Label>
              <p className="text-xs text-gray-500">
                Makes countdown more visible during sessions
              </p>
            </div>
            <Switch
              checked={settings.focusModeAids.largerTimerText}
              onCheckedChange={(checked) =>
                onChange("focusModeAids", {
                  ...settings.focusModeAids,
                  largerTimerText: checked,
                })
              }
            />
          </div>

          {/* Clearer Violation Feedback */}
          <div className="flex items-center justify-between py-2 border-t">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Clearer Violation Feedback</Label>
              <p className="text-xs text-gray-500">
                More explicit warnings when rules are broken
              </p>
            </div>
            <Switch
              checked={settings.focusModeAids.clearerViolationFeedback}
              onCheckedChange={(checked) =>
                onChange("focusModeAids", {
                  ...settings.focusModeAids,
                  clearerViolationFeedback: checked,
                })
              }
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 pt-3 border-t">
          No color pickers, font choosers, or personalization playground. Accessibility ≠ customization.
        </p>
      </CardContent>
    </Card>
  );
}
