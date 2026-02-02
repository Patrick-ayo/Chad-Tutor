import type { DayActivity, AccuracyDataPoint, TimeComparison } from "@/types/dashboard";
import { ConsistencyHeatmap } from "./ConsistencyHeatmap";
import { AccuracyChart } from "./AccuracyChart";
import { TimeComparisonChart } from "./TimeComparisonChart";

interface ProgressSectionProps {
  activityHistory: DayActivity[];
  accuracyTrend: AccuracyDataPoint[];
  timeComparison: TimeComparison[];
}

export function ProgressSection({
  activityHistory,
  accuracyTrend,
  timeComparison,
}: ProgressSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Progress & Consistency</h2>
      
      <ConsistencyHeatmap activityHistory={activityHistory} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <AccuracyChart data={accuracyTrend} />
        <TimeComparisonChart data={timeComparison} />
      </div>
    </section>
  );
}

export { ConsistencyHeatmap } from "./ConsistencyHeatmap";
export { AccuracyChart } from "./AccuracyChart";
export { TimeComparisonChart } from "./TimeComparisonChart";
