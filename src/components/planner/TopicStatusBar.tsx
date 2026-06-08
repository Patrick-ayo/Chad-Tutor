import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TopicStatus } from '@/types/planner';

interface TopicStatusBarProps {
  topics: TopicStatus[];
}

const statusStyles: Record<TopicStatus['status'], { label: string; className: string }> = {
  on_track: {
    label: 'On Track',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  at_risk: {
    label: 'At Risk',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  behind: {
    label: 'Behind',
    className: 'border-red-200 bg-red-50 text-red-800',
  },
};

function formatTopicLabel(topicId: string) {
  return topicId
    .split(/[-_:]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatBurnRate(burnRate: number) {
  return Number.isInteger(burnRate) ? `${burnRate}` : burnRate.toFixed(1);
}

export function TopicStatusBar({ topics }: TopicStatusBarProps) {
  if (!topics.length) {
    return null;
  }

  const visibleTopics = topics.filter((topic) => topic.status !== 'on_track');

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Topic Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleTopics.length === 0 ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            All topics on track
          </div>
        ) : (
          visibleTopics.map((topic) => {
            const status = statusStyles[topic.status];

            return (
              <div
                key={topic.topicId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium leading-none">
                    {formatTopicLabel(topic.topicId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {topic.remainingMinutes} min remaining • {topic.remainingDays} day{topic.remainingDays === 1 ? '' : 's'} left
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatBurnRate(topic.burnRate)} min/day needed
                  </p>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}