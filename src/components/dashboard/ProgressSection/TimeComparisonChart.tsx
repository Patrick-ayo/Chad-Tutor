import type { TimeComparison } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";

interface TimeComparisonChartProps {
  data: TimeComparison[];
}

const chartConfig: ChartConfig = {
  plannedMinutes: {
    label: "Planned",
    color: "hsl(var(--chart-2))",
  },
  actualMinutes: {
    label: "Actual",
    color: "hsl(var(--chart-1))",
  },
};

export function TimeComparisonChart({ data }: TimeComparisonChartProps) {
  const formattedData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      day: format(parseISO(point.date), "EEE"),
    }));
  }, [data]);

  // Calculate overestimation pattern
  const stats = useMemo(() => {
    const totalPlanned = data.reduce((sum, d) => sum + d.plannedMinutes, 0);
    const totalActual = data.reduce((sum, d) => sum + d.actualMinutes, 0);
    const completionRate = Math.round((totalActual / totalPlanned) * 100);
    
    return {
      totalPlanned,
      totalActual,
      completionRate,
      isOverestimating: completionRate < 80,
    };
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Time Reality Check</CardTitle>
          <span className={`text-sm font-medium ${stats.isOverestimating ? "text-destructive" : "text-green-600"}`}>
            {stats.completionRate}% achieved
          </span>
        </div>
        {stats.isOverestimating && (
          <p className="text-xs text-muted-foreground">
            Planning {Math.round((stats.totalPlanned - stats.totalActual) / data.length)} min/day more than doing
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <BarChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="day" 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}m`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="plannedMinutes" 
              fill="var(--color-plannedMinutes)" 
              radius={[2, 2, 0, 0]}
              opacity={0.5}
            />
            <Bar 
              dataKey="actualMinutes" 
              fill="var(--color-actualMinutes)" 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-sm bg-[hsl(var(--chart-2))] opacity-50" />
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-sm bg-[hsl(var(--chart-1))]" />
            <span>Actual</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
