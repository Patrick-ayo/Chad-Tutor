import type { WeakTopic } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";

interface WeakTopicsListProps {
  topics: WeakTopic[];
}

export function WeakTopicsList({ topics }: WeakTopicsListProps) {
  // Sort by impact (already sorted in mock, but ensure)
  const sortedTopics = [...topics].sort((a, b) => b.impact - a.impact);

  if (sortedTopics.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Weak Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No weak areas identified yet. Keep practicing!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Weak Areas
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Sorted by impact on your goals
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedTopics.slice(0, 4).map((topic) => (
          <div key={topic.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{topic.name}</span>
              <Badge 
                variant={topic.accuracy < 60 ? "destructive" : "secondary"}
                className="text-xs"
              >
                {topic.accuracy}% accuracy
              </Badge>
            </div>
            
            <Progress value={topic.accuracy} className="h-1.5" />
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                {topic.retryCount} retries
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.round(topic.avgSolveTimeSeconds / 60)}m avg
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
