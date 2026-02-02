import type { AccuracyDataPoint } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AccuracyChartProps {
  data: AccuracyDataPoint[];
}

const chartConfig: ChartConfig = {
  accuracy: {
    label: "Accuracy",
    color: "hsl(var(--chart-1))",
  },
};

export function AccuracyChart({ data }: AccuracyChartProps) {
  const formattedData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      date: format(parseISO(point.sessionDate), "MMM d"),
      accuracy: Math.round(point.accuracy),
    }));
  }, [data]);

  // Calculate trend
  const trend = useMemo(() => {
    if (data.length < 3) return { direction: "stable", change: 0 };
    
    const recentAvg = data.slice(-3).reduce((sum, d) => sum + d.accuracy, 0) / 3;
    const olderAvg = data.slice(0, 3).reduce((sum, d) => sum + d.accuracy, 0) / 3;
    const change = Math.round(recentAvg - olderAvg);
    
    if (change > 3) return { direction: "up", change };
    if (change < -3) return { direction: "down", change };
    return { direction: "stable", change };
  }, [data]);

  // Check for false confidence (flat accuracy + rising time)
  const falseConfidence = useMemo(() => {
    if (data.length < 5) return false;
    
    const recentTimeAvg = data.slice(-3).reduce((sum, d) => sum + d.timeSpentMinutes, 0) / 3;
    const olderTimeAvg = data.slice(0, 3).reduce((sum, d) => sum + d.timeSpentMinutes, 0) / 3;
    const timeIncrease = recentTimeAvg > olderTimeAvg * 1.3;
    
    return trend.direction === "stable" && timeIncrease;
  }, [data, trend]);

  const TrendIcon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
  const trendColor = trend.direction === "up" ? "text-green-600" : trend.direction === "down" ? "text-red-600" : "text-muted-foreground";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Accuracy Trend</CardTitle>
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span>{Math.abs(trend.change)}%</span>
          </div>
        </div>
        {falseConfidence && (
          <p className="text-xs text-destructive">
            ⚠️ Taking longer but accuracy flat — review fundamentals
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <LineChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[50, 100]} 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="var(--color-accuracy)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
