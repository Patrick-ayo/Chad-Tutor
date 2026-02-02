import { Bot, Lightbulb, Gauge, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AISettings } from "@/types/settings";

interface AISettingsSectionProps {
  settings: AISettings;
  onChange: (field: keyof AISettings, value: unknown) => void;
}

export function AISettingsSection({ settings, onChange }: AISettingsSectionProps) {
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Features
        </CardTitle>
        <CardDescription>
          Control how AI helps (or doesn't help) your learning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Explanations */}
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Explanations
            </Label>
            <p className="text-xs text-gray-500">
              Get AI-generated explanations for concepts
            </p>
          </div>
          <Switch
            checked={settings.aiExplanationsEnabled}
            onCheckedChange={(checked) => onChange("aiExplanationsEnabled", checked)}
          />
        </div>

        {/* AI Hints */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              AI Hints
            </Label>
            <p className="text-xs text-gray-500">
              Offer hints when you're stuck on practice problems
            </p>
          </div>
          <Switch
            checked={settings.aiHintsEnabled}
            onCheckedChange={(checked) => onChange("aiHintsEnabled", checked)}
          />
        </div>

        {/* AI Difficulty Adjustment */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Adaptive Difficulty
            </Label>
            <p className="text-xs text-gray-500">
              AI adjusts problem difficulty based on your performance
            </p>
          </div>
          <Switch
            checked={settings.aiDifficultyAdjustment}
            onCheckedChange={(checked) => onChange("aiDifficultyAdjustment", checked)}
          />
        </div>

        {/* Data Sharing */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Improve AI with My Data
            </Label>
            <p className="text-xs text-gray-500">
              Allow anonymized learning patterns to improve AI
            </p>
          </div>
          <Switch
            checked={settings.shareDataForImprovement}
            onCheckedChange={(checked) => onChange("shareDataForImprovement", checked)}
          />
        </div>

        <p className="text-xs text-gray-500 pt-3 border-t italic">
          Disabling AI features won't affect your progress tracking or schedule.
          You can always enable them later.
        </p>
      </CardContent>
    </Card>
  );
}
