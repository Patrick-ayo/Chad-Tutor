import type { DayActivity } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfWeek, eachDayOfInterval, subDays } from "date-fns";
import { useMemo } from "react";

interface ConsistencyHeatmapProps {
  activityHistory: DayActivity[];
}

export function ConsistencyHeatmap({ activityHistory }: ConsistencyHeatmapProps) {
  // Create a map for quick lookup
  const activityMap = useMemo(() => {
    const map = new Map<string, DayActivity>();
    activityHistory.forEach((day) => {
      map.set(day.date, day);
    });
    return map;
  }, [activityHistory]);

  // Generate weeks for the last 12 weeks
  const weeks = useMemo(() => {
    const today = new Date();
    const startDate = startOfWeek(subDays(today, 83), { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: today });
    
    const weekGroups: Date[][] = [];
    let currentWeek: Date[] = [];
    
    days.forEach((day, i) => {
      currentWeek.push(day);
      if ((i + 1) % 7 === 0 || i === days.length - 1) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return weekGroups;
  }, []);

  const getActivityLevel = (date: Date): number => {
    const dateStr = format(date, "yyyy-MM-dd");
    const activity = activityMap.get(dateStr);
    if (!activity || !activity.active) return 0;
    if (activity.minutesStudied >= 90) return 4;
    if (activity.minutesStudied >= 60) return 3;
    if (activity.minutesStudied >= 30) return 2;
    return 1;
  };

  const levelColors = [
    "bg-muted", // 0 - inactive
    "bg-green-200 dark:bg-green-900", // 1 - light
    "bg-green-400 dark:bg-green-700", // 2 - medium
    "bg-green-500 dark:bg-green-600", // 3 - good
    "bg-green-600 dark:bg-green-500", // 4 - great
  ];

  // Calculate stats
  const totalDays = activityHistory.length;
  const activeDays = activityHistory.filter((d) => d.active).length;
  const gapDays = totalDays - activeDays;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Consistency</CardTitle>
        <p className="text-sm text-muted-foreground">
          {activeDays} active / {gapDays} gaps in last 90 days
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => {
                const level = getActivityLevel(day);
                const dateStr = format(day, "MMM d");
                const activity = activityMap.get(format(day, "yyyy-MM-dd"));
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`h-3 w-3 rounded-sm ${levelColors[level]} transition-colors`}
                    title={`${dateStr}: ${activity?.minutesStudied || 0} min`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
          <span>Less</span>
          {levelColors.map((color, i) => (
            <div key={i} className={`h-3 w-3 rounded-sm ${color}`} />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
