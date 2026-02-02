import { useState } from "react";
import { Calendar, Target } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RealityCheckSection } from "./RealityCheckSection";
import { AccuracySection } from "./AccuracySection";
import { TimeAnalysisSection } from "./TimeAnalysisSection";
import { WeaknessSection } from "./WeaknessSection";
import { RevisionSection } from "./RevisionSection";
import { mockAnalyticsData } from "@/data/mockAnalytics";
import type { AnalyticsData } from "@/types/analytics";

export function ProgressAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<AnalyticsData["timeRange"]>("month");
  const [selectedGoal, setSelectedGoal] = useState<string>("all");

  // In real app, fetch data based on filters
  const data = mockAnalyticsData;

  return (
    <div className="container py-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Progress & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">
            Understand whether your effort is translating into competence
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as AnalyticsData["timeRange"])}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                <SelectItem value="goal-1">DSA Mastery</SelectItem>
                <SelectItem value="goal-2">System Design</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Warning Banner if data is unreliable */}
      {data.readiness.dataReliability !== "reliable" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Limited data available.</strong> Complete more sessions for accurate insights.
            Current analysis is based on {data.accuracyTrend.length} data points.
          </p>
        </div>
      )}

      {/* A. Reality Check */}
      <RealityCheckSection
        readiness={data.readiness}
        pace={data.pace}
        effortOutcome={data.effortOutcome}
      />

      {/* B. Accuracy & Mastery */}
      <AccuracySection
        accuracyTrend={data.accuracyTrend}
        interpretation={data.accuracyInterpretation}
        topicMastery={data.topicMastery}
      />

      {/* C. Time Analysis */}
      <TimeAnalysisSection
        plannedVsActual={data.plannedVsActual}
        sessionQuality={data.sessionQuality}
        fatigue={data.fatigue}
      />

      {/* D. Weakness */}
      <WeaknessSection
        weakConcepts={data.weakConcepts}
        confidenceMatrix={data.confidenceMatrix}
      />

      {/* E. Revision */}
      <RevisionSection
        revisionEffectiveness={data.revisionEffectiveness}
        forgettingCurve={data.forgettingCurve}
      />

      {/* Footer disclaimer */}
      <div className="border-t pt-6 text-center text-sm text-gray-500">
        <p>
          This page shows honest metrics, not motivational fluff.
          <br />
          If a chart doesn't change a decision, it doesn't belong here.
        </p>
      </div>
    </div>
  );
}
