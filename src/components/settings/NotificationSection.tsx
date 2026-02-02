import { Bell, Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { NotificationSettings } from "@/types/settings";

interface NotificationSectionProps {
  settings: NotificationSettings;
  onChange: (field: keyof NotificationSettings, value: unknown) => void;
}

export function NotificationSection({ settings, onChange }: NotificationSectionProps) {
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          What we'll notify you about. We don't spam.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Reminder */}
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Daily Study Reminder
            </Label>
            <p className="text-xs text-gray-500">
              Gentle reminder to start your session
            </p>
          </div>
          <div className="flex items-center gap-3">
            {settings.dailyReminder && (
              <Input
                type="time"
                value={settings.dailyReminderTime}
                onChange={(e) => onChange("dailyReminderTime", e.target.value)}
                className="w-28"
              />
            )}
            <Switch
              checked={settings.dailyReminder}
              onCheckedChange={(checked) => onChange("dailyReminder", checked)}
            />
          </div>
        </div>

        {/* Missed Task Alert */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Missed Task Alerts
            </Label>
            <p className="text-xs text-gray-500">
              Notify when you miss a scheduled task
            </p>
          </div>
          <Switch
            checked={settings.missedTaskAlert}
            onCheckedChange={(checked) => onChange("missedTaskAlert", checked)}
          />
        </div>

        {/* Weekly Progress Report */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Weekly Progress Report
            </Label>
            <p className="text-xs text-gray-500">
              Summary of your week's learning (Sundays)
            </p>
          </div>
          <Switch
            checked={settings.weeklyProgressReport}
            onCheckedChange={(checked) => onChange("weeklyProgressReport", checked)}
          />
        </div>

        {/* Burnout Warnings */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Burnout Warnings
            </Label>
            <p className="text-xs text-gray-500">
              Alert when we detect burnout signals
            </p>
          </div>
          <Switch
            checked={settings.burnoutWarnings}
            onCheckedChange={(checked) => onChange("burnoutWarnings", checked)}
          />
        </div>

        <p className="text-xs text-gray-500 pt-3 border-t italic">
          Notifications are delivered via browser. No email spam.
        </p>
      </CardContent>
    </Card>
  );
}
