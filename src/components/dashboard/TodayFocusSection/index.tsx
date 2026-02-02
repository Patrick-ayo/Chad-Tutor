import type { Task } from "@/types/dashboard";
import { PrimaryTaskCard } from "./PrimaryTaskCard";
import { SecondaryTaskList } from "./SecondaryTaskList";
import { StartSessionButton } from "./StartSessionButton";

interface TodayFocusSectionProps {
  tasks: Task[];
}

export function TodayFocusSection({ tasks }: TodayFocusSectionProps) {
  const primaryTask = tasks.find((t) => t.priority === "primary") || tasks[0];
  const secondaryTasks = tasks.filter((t) => t.id !== primaryTask?.id);

  if (!primaryTask) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Today's Focus</h2>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p>No tasks scheduled for today.</p>
          <p className="text-sm mt-1">Your learning plan is complete or needs updating.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Today's Focus</h2>
      
      <PrimaryTaskCard task={primaryTask} />
      
      <StartSessionButton taskId={primaryTask.id} taskName={primaryTask.name} />
      
      {secondaryTasks.length > 0 && (
        <SecondaryTaskList tasks={secondaryTasks} />
      )}
    </section>
  );
}

export { PrimaryTaskCard } from "./PrimaryTaskCard";
export { SecondaryTaskList } from "./SecondaryTaskList";
export { StartSessionButton } from "./StartSessionButton";
