import { Gauge, Clock, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { WorkloadIntensity } from "@/types/planner";

interface WorkloadControlProps {
  intensity: WorkloadIntensity;
  onIntensityChange: (intensity: WorkloadIntensity) => void;
  stats: {
    tasksPerDay: { light: number; normal: number; aggressive: number };
    revisionDensity: { light: string; normal: string; aggressive: string };
    bufferUsage: { light: string; normal: string; aggressive: string };
  };
  currentLoad: {
    daily: number;
    weekly: number;
    maxRecommended: number;
  };
}

const intensityDetails = {
  light: {
    label: "Light",
    description: "Fewer tasks, more buffer days, gentler pace",
    color: "bg-green-100 text-green-800 border-green-300",
    impact: "Extends deadline but reduces stress",
  },
  normal: {
    label: "Normal",
    description: "Balanced workload with adequate buffers",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    impact: "On-track for deadline with reasonable effort",
  },
  aggressive: {
    label: "Aggressive",
    description: "Maximum tasks, minimal buffers, intense pace",
    color: "bg-red-100 text-red-800 border-red-300",
    impact: "May finish early but high burnout risk",
  },
};

export function WorkloadControl({
  intensity,
  onIntensityChange,
  stats,
  currentLoad,
}: WorkloadControlProps) {
  const intensityToValue = (i: WorkloadIntensity): number => {
    switch (i) {
      case "light":
        return 0;
      case "normal":
        return 50;
      case "aggressive":
        return 100;
    }
  };

  const valueToIntensity = (v: number): WorkloadIntensity => {
    if (v < 33) return "light";
    if (v < 67) return "normal";
    return "aggressive";
  };

  const handleSliderChange = (values: number[]) => {
    const newIntensity = valueToIntensity(values[0]);
    if (newIntensity !== intensity) {
      onIntensityChange(newIntensity);
    }
  };

  const isOverloaded = currentLoad.daily > currentLoad.maxRecommended;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Workload Intensity
          </CardTitle>
          <Badge className={intensityDetails[intensity].color}>
            {intensityDetails[intensity].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Slider */}
        <div className="space-y-4">
          <Slider
            value={[intensityToValue(intensity)]}
            onValueChange={handleSliderChange}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Light</span>
            <span>Normal</span>
            <span>Aggressive</span>
          </div>
        </div>

        {/* Current Selection Details */}
        <div className={`p-4 rounded-lg border ${intensityDetails[intensity].color}`}>
          <p className="font-medium mb-1">{intensityDetails[intensity].label}</p>
          <p className="text-sm opacity-80 mb-2">
            {intensityDetails[intensity].description}
          </p>
          <p className="text-xs opacity-70">
            {intensityDetails[intensity].impact}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">
                  Metric
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-600">
                  Light
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-600">
                  Normal
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-600">
                  Aggressive
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-2 text-gray-700 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Tasks/Day
                </td>
                <td
                  className={`px-3 py-2 text-center ${
                    intensity === "light" ? "font-bold bg-blue-50" : ""
                  }`}
                >
                  {stats.tasksPerDay.light}
                </td>
                <td
                  className={`px-3 py-2 text-center ${
                    intensity === "normal" ? "font-bold bg-blue-50" : ""
                  }`}
                >
                  {stats.tasksPerDay.normal}
                </td>
                <td
                  className={`px-3 py-2 text-center ${
                    intensity === "aggressive" ? "font-bold bg-blue-50" : ""
                  }`}
                >
                  {stats.tasksPerDay.aggressive}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-700">Revision Density</td>
                <td
                  className={`px-3 py-2 text-center ${
                    intensity === "light" ? "font-bold bg-blue-50" : ""
                  }`}
                >
                  {stats.revisionDensity.light}
                </td>
                <td
                  className={`px-3 py-2 text-center ${
                    intensity === "normal" ? "font-bold bg-blue-50" : ""
                  }`}
                >
                  {stats.revisionDensity.normal}
                </td>
                <td
                  className={`px-3 py-2 text-center ${
                    intensity === "aggressive" ? "font-bold bg-blue-50" : ""
                  }`}
                >
                  {stats.revisionDensity.aggressive}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-700 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Buffer Days
                </td>
                <td
                  className={`px-3 py-2 text-center ${
                    intensity === "light" ? "font-bold bg-blue-50" : ""
                  }`}
                >
                  {stats.bufferUsage.light}
                </td>
                <td
                  className={`px-3 py-2 text-center ${
                    intensity === "normal" ? "font-bold bg-blue-50" : ""
                  }`}
                >
                  {stats.bufferUsage.normal}
                </td>
                <td
                  className={`px-3 py-2 text-center ${
                    intensity === "aggressive" ? "font-bold bg-blue-50" : ""
                  }`}
                >
                  {stats.bufferUsage.aggressive}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Current Load Warning */}
        {isOverloaded && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">
                Current load exceeds recommendation
              </p>
              <p className="text-yellow-700">
                You're at {currentLoad.daily} min/day, but we recommend max{" "}
                {currentLoad.maxRecommended} min/day based on your patterns.
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onIntensityChange("light")}
          >
            Lighten Schedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onIntensityChange("aggressive")}
          >
            I Have Extra Time
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
