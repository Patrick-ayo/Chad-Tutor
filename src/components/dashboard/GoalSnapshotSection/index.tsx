import type { Goal, Alert } from "@/types/dashboard";
import { GoalCard } from "./GoalCard";
import { AlertsPanel } from "./AlertsPanel";

interface GoalSnapshotSectionProps {
  goal: Goal | null;
  alerts: Alert[];
}

export function GoalSnapshotSection({ goal, alerts }: GoalSnapshotSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Goal Snapshot</h2>
      
      {goal ? (
        <GoalCard goal={goal} />
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          <p>No active goal set.</p>
          <p className="text-sm mt-1">Set a goal to track your progress.</p>
        </div>
      )}
      
      <AlertsPanel alerts={alerts} />
    </section>
  );
}

export { GoalCard } from "./GoalCard";
export { AlertsPanel } from "./AlertsPanel";
