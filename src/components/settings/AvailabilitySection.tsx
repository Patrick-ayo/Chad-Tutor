import { Calendar, Clock, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { AvailabilitySettings, DayOfWeek, SessionLength } from "@/types/settings";

interface AvailabilitySectionProps {
  settings: AvailabilitySettings;
  onChange: (field: keyof AvailabilitySettings, value: unknown) => void;
}

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

const SESSION_LENGTHS: { value: SessionLength; label: string }[] = [
  { value: 15, label: "15 min" },
  { value: 25, label: "25 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
  { value: 90, label: "90 min" },
];

export function AvailabilitySection({ settings, onChange }: AvailabilitySectionProps) {
  const toggleDay = (day: DayOfWeek) => {
    const newDays = settings.activeDays.includes(day)
      ? settings.activeDays.filter((d) => d !== day)
      : [...settings.activeDays, day];
    onChange("activeDays", newDays);
  };

  const updateMinutesForDay = (day: DayOfWeek, minutes: number) => {
    const newMinutes = { ...settings.minutesPerDay, [day]: minutes };
    onChange("minutesPerDay", newMinutes);
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Availability
        </CardTitle>
        <CardDescription>
          When and how long you can study. Changes affect your schedule.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Day Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Active Days</Label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day) => {
              const isActive = settings.activeDays.includes(day.key);
              return (
                <Button
                  key={day.key}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day.key)}
                  className="w-12"
                >
                  {day.short}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Time Per Day */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Minutes per Day
          </Label>
          <div className="space-y-2">
            {DAYS.filter((day) => settings.activeDays.includes(day.key)).map((day) => (
              <div key={day.key} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-600">{day.label}</span>
                <Input
                  type="number"
                  min={15}
                  max={240}
                  step={15}
                  value={settings.minutesPerDay[day.key] || 60}
                  onChange={(e) => updateMinutesForDay(day.key, parseInt(e.target.value) || 60)}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">min</span>
              </div>
            ))}
            {settings.activeDays.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                Select at least one day above
              </p>
            )}
          </div>
        </div>

        {/* Session Length */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Preferred Session Length
          </Label>
          <div className="flex gap-2 flex-wrap">
            {SESSION_LENGTHS.map((session) => (
              <Button
                key={session.value}
                variant={settings.preferredSessionLength === session.value ? "default" : "outline"}
                size="sm"
                onClick={() => onChange("preferredSessionLength", session.value)}
              >
                {session.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Sessions will be scheduled in blocks of this length when possible.
          </p>
        </div>

        {/* Max Sessions Per Day */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Max Sessions per Day</Label>
            <span className="text-sm font-medium">{settings.maxSessionsPerDay}</span>
          </div>
          <Slider
            value={[settings.maxSessionsPerDay]}
            onValueChange={(values) => onChange("maxSessionsPerDay", values[0])}
            min={1}
            max={6}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 session</span>
            <span>6 sessions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
