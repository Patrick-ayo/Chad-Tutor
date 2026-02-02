import { Zap, Coffee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type {
  PlannedVsActualData,
  SessionQuality,
  FatigueIndicator,
} from "@/types/analytics";

interface TimeAnalysisSectionProps {
  plannedVsActual: PlannedVsActualData[];
  sessionQuality: SessionQuality;
  fatigue: FatigueIndicator;
}

function PlannedVsActualChart({ data }: { data: PlannedVsActualData[] }) {
  // Calculate summary stats
  const totalPlanned = data.reduce((sum, d) => sum + d.plannedMinutes, 0);
  const totalActual = data.reduce((sum, d) => sum + d.actualMinutes, 0);
  const avgVariance = totalActual / totalPlanned;
  const daysUnderPlanned = data.filter((d) => d.actualMinutes < d.plannedMinutes * 0.8).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Planned vs Actual Time</CardTitle>
          <Badge variant={avgVariance < 0.8 ? "destructive" : avgVariance > 1.2 ? "secondary" : "outline"}>
            {Math.round(avgVariance * 100)}% of plan
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Planned Total</p>
            <p className="font-semibold">{Math.round(totalPlanned / 60)}h {totalPlanned % 60}m</p>
          </div>
          <div>
            <p className="text-gray-500">Actual Total</p>
            <p className="font-semibold">{Math.round(totalActual / 60)}h {totalActual % 60}m</p>
          </div>
          <div>
            <p className="text-gray-500">Under-Delivered Days</p>
            <p className={`font-semibold ${daysUnderPlanned > 3 ? "text-red-600" : ""}`}>
              {daysUnderPlanned}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}m`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} min`,
                  name === "plannedMinutes" ? "Planned" : "Actual",
                ]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Bar dataKey="plannedMinutes" fill="#e2e8f0" name="Planned" />
              <Bar dataKey="actualMinutes" fill="#3b82f6" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {daysUnderPlanned > 3 && (
          <p className="text-xs text-red-600 mt-2">
            ⚠️ Consistently missing planned time — consider adjusting your schedule
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SessionQualityStats({ data, fatigue }: { data: SessionQuality; fatigue: FatigueIndicator }) {
  const qualityScore = Math.round(
    data.activeTimePercent * 0.4 +
    (100 - data.abandonmentRate) * 0.3 +
    (100 - Math.min(data.frequentPauses * 5, 50)) * 0.3
  );

  const getQualityColor = () => {
    if (qualityScore >= 80) return "text-green-600";
    if (qualityScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Session Quality
          </CardTitle>
          <span className={`text-2xl font-bold ${getQualityColor()}`}>
            {qualityScore}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active vs Idle Time */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Active vs Idle Time</span>
            <span>{data.activeTimePercent}% active</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden">
            <div
              className="bg-green-500"
              style={{ width: `${data.activeTimePercent}%` }}
            />
            <div
              className="bg-gray-300"
              style={{ width: `${data.idleTimePercent}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Total Sessions</p>
            <p className="font-semibold">{data.totalSessions}</p>
          </div>
          <div>
            <p className="text-gray-500">Avg Duration</p>
            <p className="font-semibold">{data.averageDuration} min</p>
          </div>
          <div>
            <p className="text-gray-500">Abandonment Rate</p>
            <p className={`font-semibold ${data.abandonmentRate > 20 ? "text-red-600" : ""}`}>
              {data.abandonmentRate}%
            </p>
          </div>
          <div>
            <p className="text-gray-500">Frequent Pauses</p>
            <p className={`font-semibold ${data.frequentPauses > 5 ? "text-yellow-600" : ""}`}>
              {data.frequentPauses}/session
            </p>
          </div>
        </div>

        {/* Fatigue Detection */}
        {fatigue.detected && (
          <div
            className={`p-3 rounded-lg border ${
              fatigue.severity === "severe"
                ? "bg-red-50 border-red-200"
                : fatigue.severity === "moderate"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="h-4 w-4" />
              <span className="font-semibold text-sm capitalize">
                {fatigue.severity} Fatigue Detected
              </span>
            </div>
            <div className="text-xs space-y-1 mb-2">
              {fatigue.signals.map((signal, i) => (
                <p key={i}>• {signal}</p>
              ))}
            </div>
            <p className="text-xs font-medium">
              💡 {fatigue.recommendation}
            </p>
          </div>
        )}

        {data.abandonmentRate > 25 && (
          <p className="text-xs text-red-600">
            ⚠️ High abandonment rate — sessions may be too long or difficult
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function TimeAnalysisSection({
  plannedVsActual,
  sessionQuality,
  fatigue,
}: TimeAnalysisSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Time & Effort</h2>
        <p className="text-sm text-gray-500">Reality check on time investment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlannedVsActualChart data={plannedVsActual} />
        <SessionQualityStats data={sessionQuality} fatigue={fatigue} />
      </div>
    </section>
  );
}
