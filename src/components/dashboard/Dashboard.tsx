import type { DashboardData } from "@/types/dashboard";
import { TodayFocusSection } from "./TodayFocusSection";
import { GoalSnapshotSection } from "./GoalSnapshotSection";
import { ProgressSection } from "./ProgressSection";
import { InsightSection } from "./InsightSection";
import { Separator } from "@/components/ui/separator";

interface DashboardProps {
  data: DashboardData;
}

export function Dashboard({ data }: DashboardProps) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Focus on what matters. No distractions.
        </p>
      </header>

      {/* A. Today Focus - MOST IMPORTANT */}
      <TodayFocusSection tasks={data.todayTasks} />

      <Separator />

      {/* B. Goal Snapshot + Alerts */}
      <GoalSnapshotSection 
        goal={data.activeGoal} 
        alerts={data.alerts} 
      />

      <Separator />

      {/* C. Progress & Consistency */}
      <ProgressSection
        activityHistory={data.activityHistory}
        accuracyTrend={data.accuracyTrend}
        timeComparison={data.timeComparison}
      />

      <Separator />

      {/* D. Weak Areas & Revision Intelligence */}
      <InsightSection
        weakTopics={data.weakTopics}
        revisionsDue={data.revisionsDue}
      />
    </div>
  );
}
