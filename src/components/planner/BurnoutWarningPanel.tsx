import {
  AlertTriangle,
  TrendingDown,
  Clock,
  Pause,
  Brain,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { BurnoutSignals } from "@/types/planner";

interface BurnoutWarningPanelProps {
  signals: BurnoutSignals;
  onTakeAction: (action: "reduce-load" | "add-break" | "skip-day") => void;
}

interface SignalIndicatorProps {
  label: string;
  description: string;
  severity: "low" | "medium" | "high";
  icon: React.ReactNode;
  value?: string;
}

function SignalIndicator({
  label,
  description,
  severity,
  icon,
  value,
}: SignalIndicatorProps) {
  const severityColors = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200",
  };

  const progressColors = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };

  const progressValue = {
    low: 33,
    medium: 66,
    high: 100,
  };

  return (
    <div className={`p-3 rounded-lg border ${severityColors[severity]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{label}</span>
        </div>
        {value && (
          <Badge variant="outline" className="text-xs">
            {value}
          </Badge>
        )}
      </div>
      <p className="text-xs opacity-80 mb-2">{description}</p>
      <Progress
        value={progressValue[severity]}
        className={`h-1 ${progressColors[severity]}`}
      />
    </div>
  );
}

export function BurnoutWarningPanel({
  signals,
  onTakeAction,
}: BurnoutWarningPanelProps) {
  const { riskLevel, indicators, recommendations, detectedPatterns } = signals;

  if (riskLevel === "low" && indicators.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-green-800">
            <Brain className="h-5 w-5" />
            <p className="font-medium">You're doing great!</p>
          </div>
          <p className="text-sm text-green-700 mt-1">
            No burnout signals detected. Keep up the sustainable pace.
          </p>
        </CardContent>
      </Card>
    );
  }

  const riskColors = {
    low: "border-yellow-200 bg-yellow-50",
    medium: "border-orange-200 bg-orange-50",
    high: "border-red-200 bg-red-50",
  };

  const riskLabels = {
    low: { text: "Low Risk", color: "bg-yellow-100 text-yellow-800" },
    medium: { text: "Medium Risk", color: "bg-orange-100 text-orange-800" },
    high: { text: "High Risk", color: "bg-red-100 text-red-800" },
  };

  return (
    <Card className={riskColors[riskLevel]}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Burnout Detection
          </CardTitle>
          <Badge className={riskLabels[riskLevel].color}>
            {riskLabels[riskLevel].text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Detected Patterns */}
        {detectedPatterns.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Patterns we noticed:
            </p>
            <ul className="space-y-1">
              {detectedPatterns.map((pattern, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Signal Indicators */}
        <div className="grid gap-3">
          {indicators.map((indicator, index) => {
            const iconMap: Record<string, React.ReactNode> = {
              accuracy: <TrendingDown className="h-4 w-4" />,
              "pause-frequency": <Pause className="h-4 w-4" />,
              "completion-time": <Clock className="h-4 w-4" />,
              fatigue: <Brain className="h-4 w-4" />,
            };

            return (
              <SignalIndicator
                key={index}
                label={indicator.name}
                description={indicator.description}
                severity={indicator.severity}
                value={indicator.value}
                icon={iconMap[indicator.type] || <AlertTriangle className="h-4 w-4" />}
              />
            );
          })}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium text-gray-700">
              Recommended actions:
            </p>
            <div className="grid gap-2">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <span className="text-sm">{rec.text}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onTakeAction(rec.action as "reduce-load" | "add-break" | "skip-day")
                    }
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Honesty Note */}
        <p className="text-xs text-gray-500 italic pt-2 border-t">
          These signals are based on your actual learning patterns over the past
          week. We're not trying to scare you—just giving you data to make informed
          decisions about your pace.
        </p>
      </CardContent>
    </Card>
  );
}
