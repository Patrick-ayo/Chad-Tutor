import type { RevisionItem } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Calendar, ArrowRight } from "lucide-react";
import { format, parseISO, differenceInDays, isToday, isTomorrow } from "date-fns";

interface RevisionDueListProps {
  items: RevisionItem[];
}

function formatDueDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  
  const daysUntil = differenceInDays(date, new Date());
  if (daysUntil < 0) return `${Math.abs(daysUntil)}d overdue`;
  if (daysUntil <= 7) return `In ${daysUntil} days`;
  return format(date, "MMM d");
}

function getUrgencyLevel(dateStr: string): "urgent" | "soon" | "normal" {
  const date = parseISO(dateStr);
  const daysUntil = differenceInDays(date, new Date());
  
  if (daysUntil <= 0) return "urgent";
  if (daysUntil <= 2) return "soon";
  return "normal";
}

export function RevisionDueList({ items }: RevisionDueListProps) {
  // Sort by forgetting risk (highest first)
  const sortedItems = [...items].sort((a, b) => b.forgettingRisk - a.forgettingRisk);

  if (sortedItems.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Revision Due</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No revisions due. Your memory is fresh!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Revision Due
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Based on forgetting curve analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedItems.slice(0, 3).map((item) => {
          const urgency = getUrgencyLevel(item.dueDate);
          const urgencyColors = {
            urgent: "border-l-destructive bg-destructive/5",
            soon: "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20",
            normal: "border-l-primary",
          };

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-lg border-l-4 p-3 ${urgencyColors[urgency]}`}
            >
              <div className="space-y-1">
                <p className="font-medium text-sm">{item.topicName}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDueDate(item.dueDate)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {item.forgettingRisk}% risk
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                Review
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
