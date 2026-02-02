import { Clock, RefreshCw, Brain } from "lucide-react";
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
  Cell,
} from "recharts";
import type { RevisionEffectiveness, ForgettingCurveData } from "@/types/analytics";

interface RevisionSectionProps {
  revisionEffectiveness: RevisionEffectiveness[];
  forgettingCurve: ForgettingCurveData[];
}

function RevisionImpactChart({ data }: { data: RevisionEffectiveness[] }) {
  // Calculate summary stats
  const effectiveCount = data.filter((d) => d.isEffective).length;
  const avgImprovement = data.length > 0
    ? data.reduce((sum, d) => sum + d.improvement, 0) / data.length
    : 0;

  // Prepare chart data
  const chartData = data.map((item) => ({
    name: item.conceptName.length > 15 
      ? item.conceptName.slice(0, 15) + "..." 
      : item.conceptName,
    before: item.accuracyBefore,
    after: item.accuracyAfter,
    improvement: item.improvement,
    isEffective: item.isEffective,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Revision Impact
          </CardTitle>
          <Badge variant={effectiveCount > data.length / 2 ? "default" : "destructive"}>
            {effectiveCount}/{data.length} effective
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Avg Improvement</p>
            <p className={`font-semibold ${avgImprovement > 0 ? "text-green-600" : "text-red-600"}`}>
              {avgImprovement > 0 ? "+" : ""}{avgImprovement.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500">Total Revisions</p>
            <p className="font-semibold">
              {data.reduce((sum, d) => sum + d.revisionsCount, 0)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Avg Retention</p>
            <p className="font-semibold">
              {data.length > 0 
                ? Math.round(data.reduce((sum, d) => sum + d.retentionDays, 0) / data.length)
                : 0} days
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === "before" ? "Before" : "After",
                ]}
              />
              <Bar dataKey="before" fill="#e2e8f0" name="Before" />
              <Bar dataKey="after" name="After">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isEffective ? "#22c55e" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {effectiveCount < data.length / 2 && data.length > 0 && (
          <p className="text-xs text-red-600 mt-2">
            ⚠️ Most revisions aren't improving retention — spacing logic may need adjustment
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ForgettingCurveView({ data }: { data: ForgettingCurveData[] }) {
  // Sort by decay rate (highest first - most forgotten)
  const sortedData = [...data].sort((a, b) => b.decayRate - a.decayRate);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Forgetting Curve
          </CardTitle>
          <p className="text-xs text-gray-500">
            {data.filter((d) => d.decayRate > 5).length} concepts decaying fast
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {sortedData.map((item) => {
            const decayPercent = Math.min(item.decayRate * item.daysSinceLearn, 100);
            const currentRetention = Math.max(0, item.initialAccuracy - decayPercent);
            const isUrgent = item.decayRate > 5 && item.daysSinceLearn > 3;

            return (
              <div
                key={item.conceptId}
                className={`p-3 rounded-lg border ${
                  isUrgent ? "border-red-200 bg-red-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{item.conceptName}</p>
                  {isUrgent && (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>

                {/* Retention visualization */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Retention</span>
                    <span>
                      {item.initialAccuracy}% → {Math.round(currentRetention)}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded">
                    <div
                      className="absolute h-full bg-blue-500 rounded-l"
                      style={{ width: `${currentRetention}%` }}
                    />
                    <div
                      className="absolute h-full bg-red-300 rounded-r"
                      style={{
                        left: `${currentRetention}%`,
                        width: `${item.initialAccuracy - currentRetention}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Days ago</p>
                    <p className="font-semibold">{item.daysSinceLearn}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Decay/day</p>
                    <p className={`font-semibold ${item.decayRate > 5 ? "text-red-600" : ""}`}>
                      {item.decayRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Recovery</p>
                    <p className="font-semibold text-green-600">
                      +{item.revisionRecoveryPercent}%
                    </p>
                  </div>
                </div>

                {/* Human-readable summary */}
                <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                  📉 You forgot {Math.round(item.initialAccuracy - currentRetention)}% after {item.daysSinceLearn} days.
                  {item.revisionRecoveryPercent > 0 && (
                    <> Revision recovered {item.revisionRecoveryPercent}%.</>
                  )}
                </p>

                {/* Next revision */}
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-500">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Next revision: {new Date(item.nextRevisionDue).toLocaleDateString()}
                  </span>
                  {new Date(item.nextRevisionDue) <= new Date() && (
                    <Badge className="bg-yellow-100 text-yellow-800">Due now</Badge>
                  )}
                </div>
              </div>
            );
          })}

          {data.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No forgetting curve data yet</p>
              <p className="text-xs">Complete more sessions to track retention</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RevisionSection({
  revisionEffectiveness,
  forgettingCurve,
}: RevisionSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Revision Effectiveness</h2>
        <p className="text-sm text-gray-500">Is revision actually helping?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevisionImpactChart data={revisionEffectiveness} />
        <ForgettingCurveView data={forgettingCurve} />
      </div>
    </section>
  );
}
