import type { WeakTopic, RevisionItem } from "@/types/dashboard";
import { WeakTopicsList } from "./WeakTopicsList";
import { RevisionDueList } from "./RevisionDueList";

interface InsightSectionProps {
  weakTopics: WeakTopic[];
  revisionsDue: RevisionItem[];
}

export function InsightSection({ weakTopics, revisionsDue }: InsightSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Insights</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <WeakTopicsList topics={weakTopics} />
        <RevisionDueList items={revisionsDue} />
      </div>
    </section>
  );
}

export { WeakTopicsList } from "./WeakTopicsList";
export { RevisionDueList } from "./RevisionDueList";
