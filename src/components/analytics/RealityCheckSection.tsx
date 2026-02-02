import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  ReadinessData,
  PaceData,
  EffortOutcomeData,
  TrendDirection,
} from "@/types/analytics";

interface RealityCheckSectionProps {
  readiness: ReadinessData;
  pace: PaceData;
  effortOutcome: EffortOutcomeData;
}

function TrendIcon({ trend }: { trend: TrendDirection }) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-400" />;
  }
}

function ReadinessCard({ data }: { data: ReadinessData }) {
  const getReliabilityBadge = () => {
    switch (data.dataReliability) {
      case "reliable":
        return <Badge className="bg-green-100 text-green-800">Reliable</Badge>;
      case "uncertain":
        return <Badge className="bg-yellow-100 text-yellow-800">Uncertain</Badge>;
      case "insufficient":
        return <Badge className="bg-red-100 text-red-800">Insufficient Data</Badge>;
    }
  };

  const intervalWidth = data.confidenceInterval.high - data.confidenceInterval.low;
  const isWideInterval = intervalWidth > 20;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Readiness
          </CardTitle>
          {getReliabilityBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl font-bold">{data.overallPercent}%</span>
          <TrendIcon trend={data.trend} />
        </div>

        {/* Confidence Interval */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Confidence Range</span>
            <span>
              {data.confidenceInterval.low}% - {data.confidenceInterval.high}%
            </span>
          </div>
          <div className="relative h-2 bg-gray-100 rounded">
            <div
              className="absolute h-full bg-blue-200 rounded"
              style={{
                left: `${data.confidenceInterval.low}%`,
                width: `${intervalWidth}%`,
              }}
            />
            <div
              className="absolute h-full w-1 bg-blue-600 rounded"
              style={{ left: `${data.overallPercent}%` }}
            />
          </div>
        </div>

        {isWideInterval && (
          <p className="text-xs text-yellow-700 mt-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Wide interval — need more data for accuracy
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PaceStatusCard({ data }: { data: PaceData }) {
  const getStatusColor = () => {
    switch (data.status) {
      case "ahead":
        return "text-green-600 bg-green-50 border-green-200";
      case "on-track":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "behind":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case "ahead":
      case "on-track":
        return <CheckCircle2 className="h-5 w-5" />;
      case "behind":
        return <AlertTriangle className="h-5 w-5" />;
      case "critical":
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const statusLabels = {
    ahead: "Ahead of Schedule",
    "on-track": "On Track",
    behind: "Behind Schedule",
    critical: "Critical Delay",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Pace Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border mb-4 ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <span className="font-semibold">{statusLabels[data.status]}</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Completion Rate</p>
            <p className="font-semibold">{data.completionRate}%</p>
          </div>
          <div>
            <p className="text-gray-500">Time Accuracy</p>
            <p className="font-semibold">{Math.round(data.timeAccuracy * 100)}%</p>
          </div>
          <div>
            <p className="text-gray-500">Missed Sessions</p>
            <p className={`font-semibold ${data.missedSessions > 3 ? "text-red-600" : ""}`}>
              {data.missedSessions}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Days {data.daysAhead >= 0 ? "Ahead" : "Behind"}</p>
            <p className="font-semibold">{Math.abs(data.daysAhead)}</p>
          </div>
        </div>

        {/* Warnings */}
        {data.warning && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            ⚠️ {data.warning}
          </div>
        )}

        {data.skippedAssessments > 0 && (
          <p className="text-xs text-red-600 mt-2">
            {data.skippedAssessments} assessments skipped — progress may be overstated
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function EffortOutcomeCard({ data }: { data: EffortOutcomeData }) {
  const getInterpretationColor = () => {
    switch (data.interpretation) {
      case "improving":
        return "text-green-700 bg-green-50";
      case "stagnant":
        return "text-yellow-700 bg-yellow-50";
      case "diminishing":
        return "text-orange-700 bg-orange-50";
      case "declining":
        return "text-red-700 bg-red-50";
    }
  };

  const interpretationLabels = {
    improving: "Efficient Learning",
    stagnant: "Plateau Detected",
    diminishing: "Diminishing Returns",
    declining: "Declining Efficiency",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Effort → Outcome
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Metric */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-3xl font-bold">{data.efficiencyRatio.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Accuracy gain per hour</p>
          </div>
          <TrendIcon trend={data.trend} />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <p className="text-gray-500">Time Invested</p>
            <p className="font-semibold">{data.timeSpentHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-gray-500">Accuracy Gained</p>
            <p className="font-semibold">+{data.accuracyGainPercent}%</p>
          </div>
        </div>

        {/* Interpretation */}
        <div className={`p-3 rounded-lg ${getInterpretationColor()}`}>
          <p className="font-medium text-sm mb-1">
            {interpretationLabels[data.interpretation]}
          </p>
          <p className="text-xs opacity-80">{data.insight}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function RealityCheckSection({
  readiness,
  pace,
  effortOutcome,
}: RealityCheckSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Reality Check</h2>
        <p className="text-sm text-gray-500">No sugarcoating</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReadinessCard data={readiness} />
        <PaceStatusCard data={pace} />
        <EffortOutcomeCard data={effortOutcome} />
      </div>
    </section>
  );
}
